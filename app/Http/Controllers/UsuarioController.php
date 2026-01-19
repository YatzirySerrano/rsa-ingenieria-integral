<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller {
    
    public function index(Request $request): Response {
        $q = trim((string) $request->get('q', ''));
        $rol = $request->get('rol', '__all__');
        $status = $request->get('status', '__all__');
        $users = User::query()
            ->with(['persona:id,usuario_id,nombre,apellido_paterno,apellido_materno,telefono,empresa,rfc,direccion,status'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($qq) use ($q) {
                    $qq->where('name', 'like', "%{$q}%")
                       ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->when($rol !== '__all__' && $rol !== null && $rol !== '', fn ($query) => $query->where('rol', $rol))
            ->when($status !== '__all__' && $status !== null && $status !== '', fn ($query) => $query->where('status', $status))
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();
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

    public function store(Request $request) {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'rol' => ['required', Rule::in(['admin', 'vendedor', 'cliente'])],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
            'password' => ['required', 'string', 'min:8', 'max:72'],
        ]);
        User::create($data);
        return redirect()->route('usuarios.index')->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, User $user) {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'rol' => ['required', Rule::in(['admin', 'vendedor', 'cliente'])],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
            'password' => ['nullable', 'string', 'min:8', 'max:72'],
        ]);
        // Solo si mandan password, se actualiza; si no, se respeta.
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $user->update($data);
        return redirect()->route('usuarios.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user) {
        // Regla de negocio típica: no te borres a ti mismo (opcional)
        if (auth()->id() === $user->id) {
            return back()->with('error', 'No puedes eliminar tu propio usuario.');
        }
        $user->delete();
        return redirect()->route('usuarios.index')->with('success', 'Usuario eliminado correctamente.');
    }

}
