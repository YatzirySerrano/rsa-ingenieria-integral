<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Persona;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->get('q', ''));
        $rol = (string) $request->get('rol', '__all__');
        $status = (string) $request->get('status', '__all__');

        $users = User::query()
            ->with(['persona:id,usuario_id,nombre,apellido_paterno,apellido_materno,telefono,empresa,rfc,direccion,status'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($qq) use ($q) {
                    $qq->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->when($rol !== '__all__' && $rol !== '', fn ($query) => $query->where('rol', $rol))
            ->when($status !== '__all__' && $status !== '', fn ($query) => $query->where('status', $status))
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        // Asegurar nombre_completo para front (sin tocar modelo)
        $users->getCollection()->transform(function ($u) {
            if ($u->persona) {
                $u->persona->nombre_completo = trim(implode(' ', array_filter([
                    $u->persona->nombre,
                    $u->persona->apellido_paterno,
                    $u->persona->apellido_materno,
                ])));
            }
            return $u;
        });

        return Inertia::render('Usuarios/Index', [
            'users' => $users,
            'filters' => [
                'q' => $q,
                'rol' => $rol,
                'status' => $status,
            ],
            'catalogs' => [
                'roles' => ['admin', 'vendedor', 'cliente'],
                'statuses' => ['activo', 'inactivo'],
            ],
        ]);
    }

    /**
     * Lookup de Personas (modal Usuarios)
     * GET /admin/users/personas-lookup?q=jesus&user_id=2&limit=10
     *
     * Reglas:
     * - q vacío => regresa lista limitada (personas SIN usuario) + si user_id viene, incluye su persona actual
     * - q 2+ => filtra por nombre/apellidos (mismas reglas de disponibilidad)
     * - nunca sugiere personas ligadas a OTRO usuario
     */
    public function personasLookup(Request $request)
    {
        $q = trim((string) $request->get('q', ''));
        $userId = $request->integer('user_id'); // opcional (modo editar)
        $limit = min(max((int) $request->get('limit', 10), 1), 20);

        $query = Persona::query()
            ->select([
                'id',
                'usuario_id',
                'nombre',
                'apellido_paterno',
                'apellido_materno',
                'telefono',
                'empresa',
                'rfc',
                'direccion',
                'status',
            ])
            ->when($q !== '' && mb_strlen($q) >= 2, function ($qq) use ($q) {
                $qq->where(function ($w) use ($q) {
                    $w->where('nombre', 'like', "%{$q}%")
                        ->orWhere('apellido_paterno', 'like', "%{$q}%")
                        ->orWhere('apellido_materno', 'like', "%{$q}%");
                });
            })
            ->orderByDesc('id');

        // Disponibilidad: solo NULL, pero en editar permitir la actual del user
        $query->where(function ($w) use ($userId) {
            $w->whereNull('usuario_id');
            if ($userId) {
                $w->orWhere('usuario_id', $userId);
            }
        });

        // Si quieres solo personas activas, descomenta:
        // $query->where('status', 'activo');

        // Si q tiene 1 letra => regresa vacío (para no spamear)
        if ($q !== '' && mb_strlen($q) < 2) {
            return response()->json(['data' => []]);
        }

        $items = $query->limit($limit)->get()->map(function ($p) {
            $nombreCompleto = trim(implode(' ', array_filter([
                $p->nombre,
                $p->apellido_paterno,
                $p->apellido_materno,
            ])));

            return [
                'id' => $p->id,
                'usuario_id' => $p->usuario_id,
                'nombre_completo' => $nombreCompleto !== '' ? $nombreCompleto : ('#' . $p->id),
                'telefono' => $p->telefono,
                'empresa' => $p->empresa,
                'rfc' => $p->rfc,
                'direccion' => $p->direccion,
                'status' => $p->status,
            ];
        });

        return response()->json(['data' => $items]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'persona_id' => ['required', 'integer', 'exists:personas,id'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'rol' => ['required', Rule::in(['admin', 'vendedor', 'cliente'])],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
            'password' => ['required', 'string', 'min:8', 'max:72'],
        ]);

        DB::transaction(function () use ($data) {
            $persona = Persona::lockForUpdate()->findOrFail($data['persona_id']);

            if (!is_null($persona->usuario_id)) {
                abort(422, 'La persona seleccionada ya está vinculada a otro usuario.');
            }

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'rol' => $data['rol'],
                'status' => $data['status'],
                'password' => $data['password'],
            ]);

            $persona->update(['usuario_id' => $user->id]);
        });

        return redirect()->route('usuarios.index')->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'persona_id' => ['required', 'integer', 'exists:personas,id'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'rol' => ['required', Rule::in(['admin', 'vendedor', 'cliente'])],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
            'password' => ['nullable', 'string', 'min:8', 'max:72'],
        ]);

        DB::transaction(function () use ($data, $user) {
            $personaNueva = Persona::lockForUpdate()->findOrFail($data['persona_id']);

            // Si la persona ya pertenece a otro usuario (no el actual), bloquear
            if (!is_null($personaNueva->usuario_id) && (int) $personaNueva->usuario_id !== (int) $user->id) {
                abort(422, 'La persona seleccionada ya está vinculada a otro usuario.');
            }

            // Solo si cambia de persona, liberar anterior
            $personaActual = Persona::lockForUpdate()->where('usuario_id', $user->id)->first();
            if ($personaActual && (int) $personaActual->id !== (int) $personaNueva->id) {
                $personaActual->update(['usuario_id' => null]);
            }

            // Asignar la nueva al user (si ya era suya, esto no rompe nada)
            $personaNueva->update(['usuario_id' => $user->id]);

            $update = [
                'name' => $data['name'],
                'email' => $data['email'],
                'rol' => $data['rol'],
                'status' => $data['status'],
            ];

            if (!empty($data['password'])) {
                $update['password'] = $data['password'];
            }

            $user->update($update);
        });

        return redirect()->route('usuarios.index')->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Baja lógica: status=inactivo (NO delete físico)
     * Libera persona para reasignar.
     */
    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return back()->with('error', 'No puedes desactivar tu propio usuario.');
        }

        DB::transaction(function () use ($user) {
            Persona::where('usuario_id', $user->id)->update(['usuario_id' => null]);
            $user->update(['status' => 'inactivo']);
        });

        return redirect()->route('usuarios.index')->with('success', 'Usuario desactivado correctamente.');
    }
}
