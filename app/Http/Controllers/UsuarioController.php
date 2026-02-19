<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Persona;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
USE App\Mail\UserCredentialsMail;

class UsuarioController extends Controller {

    public function index(Request $request) {
        $q       = trim((string) $request->get('q', ''));
        $rol     = (string) $request->get('rol', '__all__');
        $status  = (string) $request->get('status', '__all__');
        $perPage = (int) $request->get('per_page', 10);
        if ($perPage <= 0) $perPage = 100000;
        $query = User::query()
            ->with([
                'persona' => function ($p) {
                    $p->select([
                        'id',
                        'usuario_id', // importante para que Eloquent pueda mapear la relación
                        'nombre',
                        'apellido_paterno',
                        'apellido_materno',
                        'telefono',
                        'empresa',
                    ])->selectRaw("TRIM(CONCAT(nombre,' ',apellido_paterno,' ',apellido_materno)) AS nombre_completo");
                }
            ])
            ->when($q !== '', function ($qq) use ($q) {
                $qq->where(function ($w) use ($q) {
                    $w->where('name', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->when($rol !== '__all__', fn ($qq) => $qq->where('rol', $rol))
            ->when($status !== '__all__', fn ($qq) => $qq->where('status', $status))
            ->orderByDesc('id');
        $users = $query->paginate($perPage)->withQueryString();
        return inertia('Usuarios/Index', [
            'users'   => $users,
            'filters' => [
                'q'        => $q,
                'rol'      => $rol,
                'status'   => $status,
                'per_page' => $request->get('per_page', 10),
            ],
            'catalogs' => [
                'roles'    => ['admin', 'vendedor'], // cliente lo ocultas en UI
                'statuses' => ['activo', 'inactivo'],
            ],
        ]);
    }

    public function personasLookup(Request $request) {
        $q     = trim((string) $request->get('q', ''));
        $limit = (int) $request->get('limit', 5000);
        $limit = max(1, min($limit, 5000));
        $base = Persona::query()
            ->where('status', 'activo')
            ->whereNull('usuario_id')
            ->select([
                'id',
                'nombre',
                'apellido_paterno',
                'apellido_materno',
                'telefono',
                'empresa',
                'rfc',
                'direccion',
                'usuario_id',
                'status',
            ])
            ->selectRaw("TRIM(CONCAT(nombre,' ',apellido_paterno,' ',apellido_materno)) AS nombre_completo")
            ->orderBy('nombre')
            ->orderBy('apellido_paterno')
            ->orderBy('apellido_materno');
        if ($q === '') {
            return response()->json(['data' => $base->limit($limit)->get()]);
        }
        if (mb_strlen($q) < 2) {
            return response()->json(['data' => []]);
        }
        $base->where(function ($w) use ($q) {
            $w->where('nombre', 'like', "%{$q}%")
              ->orWhere('apellido_paterno', 'like', "%{$q}%")
              ->orWhere('apellido_materno', 'like', "%{$q}%");
        });
        return response()->json(['data' => $base->limit($limit)->get()]);
    }

    public function store(Request $request) {
        $data = $request->validate(
            [
                'persona_id' => [
                    'required',
                    'integer',
                    Rule::exists('personas', 'id')->whereNull('usuario_id'),
                ],
                'email' => [
                    'required',
                    'email',
                    'max:190',
                    'lowercase',
                    Rule::unique('users', 'email'),
                ],
                'rol' => ['required', Rule::in(['admin', 'vendedor', 'cliente'])],
            ],
            [
                'persona_id.required' => 'Selecciona una persona.',
                'persona_id.exists' => 'Esa persona no está disponible (ya tiene usuario o no existe).',
                'email.unique' => 'Ese correo ya está registrado.',
            ]
        );
        $email = strtolower(trim($data['email']));
        // Lock para evitar carreras si dos admins intentan usar la misma persona
        $persona = Persona::query()
            ->whereKey($data['persona_id'])
            ->lockForUpdate()
            ->first();

        if (!$persona) {
            return back()->withErrors(['persona_id' => 'La persona no existe o ya no está disponible.']);
        }
        if (!is_null($persona->usuario_id)) {
            return back()->withErrors(['persona_id' => 'Esta persona ya tiene usuario asignado.']);
        }
        $plainPassword = Str::password(10, true, true, false); // 10 chars, letras+numeros, SIN símbolos
        $user = null;
        DB::beginTransaction();
        try {
            $user = User::create([
                'name'      => $this->buildUserNameFromPersona($persona),
                'email'     => $email,
                'rol'       => $data['rol'],
                'status'    => 'activo',
                'persona_id' => $persona->id,
                'password'  => $plainPassword, // casteo hashed en el modelo lo encripta
            ]);
            // Enlace inverso: personas.usuario_id
            $persona->usuario_id = $user->id;
            $persona->save();
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Error creando usuario', ['err' => $e->getMessage()]);
            return back()->withErrors(['form' => 'No se pudo crear el usuario.']);
        }
        // Envío de correo fuera de la transacción
        try {
            Mail::to($user->email)->send(new UserCredentialsMail($user, $plainPassword));
            return redirect()
                ->route('usuarios.index')
                ->with('success', 'Usuario creado. Credenciales enviadas por correo.');
        } catch (\Throwable $e) {
            Log::error('Error enviando credenciales', ['err' => $e->getMessage()]);
            return redirect()
                ->route('usuarios.index')
                ->with('error', 'Usuario creado, pero no se pudo enviar el correo. Revisa SMTP.');
        }
    }

    public function update(Request $request, User $user) {
        $data = $request->validate([
            'persona_id' => ['nullable', 'integer'],
            'email'      => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'rol'        => ['required', Rule::in(['admin', 'vendedor', 'cliente'])],
            'password'   => ['nullable', 'string', 'min:8'],
        ]);
        $currentPersonaId = optional($user->persona)->id;
        if (array_key_exists('persona_id', $data) && $currentPersonaId) {
            if ((int) $data['persona_id'] !== (int) $currentPersonaId) {
                return back()->withErrors([
                    'persona_id' => 'No puedes cambiar la persona de un usuario ya registrado.',
                ]);
            }
        }
        if ($user->persona) {
            $user->name = $this->buildUserNameFromPersona($user->persona);
        }
        $user->email = $data['email'];
        $user->rol   = $data['rol'];
        if (!empty($data['password'])) {
            $user->password = $data['password'];
        }
        $user->save();
        return redirect()
            ->route('usuarios.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user) {
        $user->status = 'inactivo';
        $user->save();
        return redirect()
            ->route('usuarios.index')
            ->with('success', 'Usuario eliminado.');
    }

    public function activar(User $user) {
        $user->status = 'activo';
        $user->save();
        return redirect()
            ->route('usuarios.index')
            ->with('success', 'Usuario activado correctamente.');
    }

    private function buildUserNameFromPersona(Persona $p): string {
        return trim(implode(' ', array_filter([
            (string) $p->nombre,
            (string) $p->apellido_paterno,
            (string) $p->apellido_materno,
        ])));
    }

    private function generatePassword8(): string {
        $upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        $lower  = 'abcdefghijkmnopqrstuvwxyz';
        $digits = '23456789';
        $all    = $upper . $lower . $digits;
        $pwd = [];
        $pwd[] = $upper[random_int(0, strlen($upper) - 1)];
        $pwd[] = $lower[random_int(0, strlen($lower) - 1)];
        $pwd[] = $digits[random_int(0, strlen($digits) - 1)];
        while (count($pwd) < 8) {
            $pwd[] = $all[random_int(0, strlen($all) - 1)];
        }
        shuffle($pwd);
        return implode('', $pwd);
    }

}
