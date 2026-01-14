import type { Usuario, UsuarioPayload } from '@/types/usuario'
import { useDebouncedRef } from '@/composables/core/useDebouncedRef'
import { useServerTable } from '@/composables/core/useServerTable'
import { useModalCrud } from '@/composables/core/useModalCrud'

export function useUsuarioCrud(initialFilters: { q?: string; status?: string }) {
    const { reload, goToUrl } = useServerTable('usuarios.index')

    const { value: filters, debounced } = useDebouncedRef(
        {
        q: initialFilters.q ?? '',
        status: (initialFilters.status ?? '') as any,
        },
        350
    )

    const crud = useModalCrud<Usuario, UsuarioPayload>({
        routeBase: 'usuarios',
        afterSuccessRoute: 'usuarios.index',
        defaults: () => ({ name: '', email: '', role: 'USER', status: 'activo' }),
        mapToPayload: (u) => ({ name: u.name, email: u.email, role: u.role ?? 'USER', status: u.status ?? 'activo' }),
        getId: (u) => u.id,
    })

    const columns = [
        { key: 'id', label: '#', sortable: true, headerClass: 'w-20' },
        { key: 'name', label: 'Nombre', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Rol', sortable: false, headerClass: 'w-40' },
        { key: 'status', label: 'Status', sortable: true, headerClass: 'w-36' },
    ] as const

    const applyFilters = () => reload({ ...debounced.value })

    return { filters, debounced, applyFilters, columns, goToUrl, ...crud }
}
