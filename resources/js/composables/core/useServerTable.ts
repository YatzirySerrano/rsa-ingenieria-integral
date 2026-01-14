import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import { route } from 'ziggy-js'
import { Ziggy } from '@/ziggy'

type VisitParams = Record<string, any>

export function useServerTable(routeName: string) {
    const reload = (params: VisitParams) => {
        // GET con preserveState para mantener tabla sin parpadeos y conservar scroll.
        router.get(route(routeName), params, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        })
    }

    const goToUrl = (url?: string | null) => {
        if (!url) return
        router.visit(url, { preserveState: true, preserveScroll: true, replace: true })
    }

    return { reload, goToUrl }
}
