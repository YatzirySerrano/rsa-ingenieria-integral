<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Persona;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

// Importa tu Mailable (NO lo incluyo porque me pediste no mandarlo aquí)
// use App\Mail\UsuarioCreadoMail;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        // NOTA: estos filtros deben ser baratos y no romper la UX.
        $q       = trim((string) $request->get('q', ''));
        $rol     = (string) $request->get('rol', '__all__');
        $status  = (string) $request->get('status', '__all__');
        $perPage = (int) $request->get('per_page', 10);

        // “Todos” en el front suele venir como 0. Aquí lo convertimos a un número grande
        // para seguir usando paginate() y no romper el componente de paginación.
        if ($perPage <= 0) $perPage = 100000;

        $query = User::query()
            ->with(['persona:id,nombre,apellido_paterno,apellido_materno,telefono,empresa'])
            ->when($q !== '', function ($qq) use ($q) {
                $qq->where(function ($w) use ($q) {
                    $w->where('name', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->when($rol !== '__all__', fn($qq) => $qq->where('rol', $rol))
            ->when($status !== '__all__', fn($qq) => $qq->where('status', $status))
            ->orderByDesc('id');

        $users = $query->paginate($perPage)->withQueryString();

        // IMPORTANTE:
        // - Quitamos "cliente" del FRONT (catálogo), pero si existen usuarios cliente en BD, igual se listan.
        // - Esto solo controla lo que se muestra en selects.
        return inertia('Usuarios/Index', [
            'users'   => $users,
            'filters' => [
                'q'        => $q,
                'rol'      => $rol,
                'status'   => $status,
                'per_page' => $request->get('per_page', 10),
            ],
            'catalogs' => [
                'roles'    => ['admin', 'vendedor'],
                'statuses' => ['activo', 'inactivo'],
            ],
        ]);
    }

    /**
     * Lookup para SearchSelect:
     * - Si q viene vacío: regresa TODAS las personas ACTIVAS sin usuario (con límite alto por seguridad).
     * - Si q tiene < 2 letras: regresa [] (evita consultas inútiles).
     * - Si q >= 2: filtra por nombre/apellidos.
     *
     * Importante: NO tocamos nada de usuarios aquí, solo lectura.
     */
    public function personasLookup(Request $request)
    {
        $q     = trim((string) $request->get('q', ''));
        $limit = (int) $request->get('limit', 5000);

        // límite duro por si alguien manda 200000
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
                'status'
            ])
            ->selectRaw("CONCAT(nombre,' ',apellido_paterno,' ',apellido_materno) AS nombre_completo")
            ->orderBy('nombre')
            ->orderBy('apellido_paterno')
            ->orderBy('apellido_materno');

        // Si viene vacío => lista completa (limitada por $limit, pero alta)
        if ($q === '') {
            return response()->json([
                'data' => $base->limit($limit)->get(),
            ]);
        }

        // Si tiene 1 letra => no hacemos query (mejor UX)
        if (mb_strlen($q) < 2) {
            return response()->json(['data' => []]);
        }

        // Filtrado por 2+ letras
        $base->where(function ($w) use ($q) {
            $w->where('nombre', 'like', "%{$q}%")
              ->orWhere('apellido_paterno', 'like', "%{$q}%")
              ->orWhere('apellido_materno', 'like', "%{$q}%");
        });

        return response()->json([
            'data' => $base->limit($limit)->get(),
        ]);
    }

    /**
     * Registrar usuario:
     * - NO permitimos seleccionar status en el front: siempre "activo" al crear.
     * - Password se genera AUTOMÁTICA (8 chars: mayus/minus/número, sin especiales).
     * - Nombre se arma SIEMPRE desde la persona (no editable).
     * - Se enlaza persona.usuario_id = user.id (relación).
     * - Se manda correo con credenciales (gancho, mailable NO incluido aquí).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'persona_id' => [
                'required',
                'integer',
                Rule::exists('personas', 'id')->where(fn($q) => $q->where('status', 'activo')->whereNull('usuario_id')),
            ],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'rol'   => ['required', Rule::in(['admin', 'vendedor'])],
        ], [
            'persona_id.exists' => 'La persona no está disponible (ya tiene usuario o está inactiva).',
        ]);

        $persona = Persona::findOrFail($data['persona_id']);

        // Nombre SIEMPRE desde persona
        $name = $this->buildUserNameFromPersona($persona);

        // Password auto
        $plainPassword = $this->generatePassword8();

        $user = User::create([
            'persona_id' => $persona->id,
            'name'       => $name,
            'email'      => $data['email'],
            'rol'        => $data['rol'],
            'status'     => 'activo',
            // Si tu User model tiene cast "password" => "hashed", Laravel lo hashea solo.
            // Si no, dejamos Hash::make para asegurar.
            'password'   => Hash::make($plainPassword),
        ]);

        // Relación inversa (tu BD la usa)
        $persona->usuario_id = $user->id;
        $persona->save();

        // Gancho para correo (NO incluyo mail ni blade porque lo pediste)
        // Mail::to($user->email)->send(new UsuarioCreadoMail($user, $plainPassword));

        return redirect()
            ->route('admin.usuarios.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    /**
     * Editar usuario:
     * - NO se puede cambiar persona (si intentan mandar persona_id distinto => 422).
     * - NO se puede cambiar status desde aquí (eso se hace con “Eliminar/Activar”).
     * - El name se mantiene ligado a persona (si cambiaste datos de persona, aquí se puede re-sincronizar).
     */
    public function update(Request $request, User $usuario)
    {
        $data = $request->validate([
            // persona_id puede venir en el payload por UI, pero si viene no debe ser distinto.
            'persona_id' => ['nullable', 'integer'],
            'email'      => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($usuario->id)],
            'rol'        => ['required', Rule::in(['admin', 'vendedor', 'cliente'])],
            'password'   => ['nullable', 'string', 'min:8'],
        ]);

        // Seguridad: NO permitir cambio de persona
        if (array_key_exists('persona_id', $data) && (int)$data['persona_id'] !== (int)$usuario->persona_id) {
            return back()->withErrors([
                'persona_id' => 'No puedes cambiar la persona de un usuario ya registrado.',
            ]);
        }

        // Re-sincronizo nombre por si se editaron nombres de persona
        $persona = $usuario->persona;
        if ($persona) {
            $usuario->name = $this->buildUserNameFromPersona($persona);
        }

        $usuario->email = $data['email'];
        $usuario->rol   = $data['rol'];

        // Password opcional (solo si lo mandan)
        if (!empty($data['password'])) {
            $usuario->password = Hash::make($data['password']);
        }

        $usuario->save();

        return redirect()
            ->route('admin.usuarios.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Eliminación lógica:
     * - SOLO cambia status.
     * - NO desconecta persona.
     */
    public function destroy(User $usuario)
    {
        $usuario->status = 'inactivo';
        $usuario->save();

        return redirect()
            ->route('admin.usuarios.index')
            ->with('success', 'Usuario eliminado (lógico).');
    }

    /**
     * Activar usuario (lógico):
     * - SOLO cambia status.
     * - NO desconecta persona.
     *
     * Ruta sugerida: PATCH /admin/usuarios/{usuario}/activar
     */
    public function activar(User $usuario)
    {
        $usuario->status = 'activo';
        $usuario->save();

        return redirect()
            ->route('admin.usuarios.index')
            ->with('success', 'Usuario activado correctamente.');
    }

    /* =========================
     * Helpers “para mi yo futuro”
     * ========================= */

    private function buildUserNameFromPersona(Persona $p): string
    {
        // Siempre concateno en el mismo orden para evitar nombres raros.
        // trim() para cuando algún campo venga null/vacío.
        return trim(implode(' ', array_filter([
            (string) $p->nombre,
            (string) $p->apellido_paterno,
            (string) $p->apellido_materno,
        ])));
    }

    private function generatePassword8(): string
    {
        // Reglas: 8 chars, al menos 1 mayus, 1 minus, 1 número, sin especiales.
        // Evito caracteres confusos (0/O, 1/l) para que el usuario no se equivoque.
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

        // Mezclo para que no siempre empiece con Mayus+minus+num
        shuffle($pwd);

        return implode('', $pwd);
    }
}