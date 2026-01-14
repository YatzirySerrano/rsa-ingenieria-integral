import { computed, reactive, ref } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import { route } from 'ziggy-js'
import { Ziggy } from '@/ziggy'
import { useConfirm } from './useConfirm'

type Mode = 'create' | 'edit'
type Status = 'activo' | 'inactivo'

type CrudConfig<TItem, TPayload> = {
    routeBase: string // ejemplo: 'marcas' => marcas.store / marcas.update / marcas.destroy
    defaults: () => TPayload
    mapToPayload: (item: TItem) => TPayload
    getId: (item: TItem) => number
    afterSuccessRoute?: string // ejemplo: 'marcas.index'
}

export function useModalCrud<TItem extends { status?: Status }, TPayload extends Record<string, any>>(
    config: CrudConfig<TItem, TPayload>
) {
    const { ask } = useConfirm()

    const modalOpen = ref(false)
    const mode = ref<Mode>('create')
    const current = ref<TItem | null>(null)

    const form = useForm<TPayload>(config.defaults())

    const title = computed(() => (mode.value === 'create' ? 'Crear' : 'Editar'))
    const isEdit = computed(() => mode.value === 'edit')

    const openCreate = () => {
        mode.value = 'create'
        current.value = null
        form.defaults(config.defaults())
        form.reset()
        form.clearErrors()
        modalOpen.value = true
    }

    const openEdit = (item: TItem) => {
        mode.value = 'edit'
        current.value = item
        form.defaults(config.mapToPayload(item))
        form.reset()
        form.clearErrors()
        modalOpen.value = true
    }

    const close = () => {
        modalOpen.value = false
    }

    const submit = () => {
        // Store / Update con routes REST
        if (mode.value === 'create') {
        form.post(route(`${config.routeBase}.store`), {
            preserveScroll: true,
            onSuccess: () => {
            modalOpen.value = false
            if (config.afterSuccessRoute) router.get(route(config.afterSuccessRoute), {}, { preserveState: true })
            },
        })
        return
        }

        const id = current.value ? config.getId(current.value) : null
        if (!id) return

        form.put(route(`${config.routeBase}.update`, id), {
        preserveScroll: true,
        onSuccess: () => {
            modalOpen.value = false
            if (config.afterSuccessRoute) router.get(route(config.afterSuccessRoute), {}, { preserveState: true })
        },
        })
    }

    const softDelete = async (item: TItem) => {
        const ok = await ask('Confirmar baja (se marcará como inactivo).')
        if (!ok) return

        router.delete(route(`${config.routeBase}.destroy`, config.getId(item)), {
        preserveScroll: true,
        })
    }

    const canDelete = (item: TItem) => (item.status ?? 'activo') === 'activo'
    const canActivate = (item: TItem) => (item.status ?? 'activo') === 'inactivo'

    // Placeholder para activar: se deja listo para conectar endpoint en backend.
    const activate = async (item: TItem) => {
        const ok = await ask('Confirmar activación.')
        if (!ok) return

        // Cuando exista endpoint, cambiar a router.post(route(`${routeBase}.activate`, id))
        console.warn('TODO: implementar endpoint de activación en backend.')
    }

    return {
        modalOpen,
        mode,
        current,
        form,
        title,
        isEdit,
        openCreate,
        openEdit,
        close,
        submit,
        softDelete,
        activate,
        canDelete,
        canActivate,
    }
}
