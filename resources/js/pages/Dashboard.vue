<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { dashboard } from '@/routes'
import { type BreadcrumbItem } from '@/types'
import { Head, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import { BarChart3, Boxes, FileText, ShieldCheck, Users2 } from 'lucide-vue-next'

type Role = 'admin' | 'vendedor'

type ByStatusRow = { estatus: string; total: number }
type MonthlyRow = { ym: string; total: number; revenue: number }
type RecentRow = {
    id: number
    folio: string
    estatus: string
    total: number
    created_at: string | null
    persona: null | { id: number; nombre_completo: string }
    usuario: null | { id: number; name: string }
}

type Props = {
    role: Role
    kpis: { cotizaciones_total: number; monto_total: number }
    byStatus: ByStatusRow[]
    monthly: MonthlyRow[]
    recent: RecentRow[]
    admin: null | {
        productos_activos: number
        servicios_activos: number
        personas_activas: number
        vendedores_activos: number
    }
}

const props = defineProps<Props>()

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
]

const page = usePage()
const me = computed(() => (page.props as any)?.auth?.user)

const money = (n: number) =>
    new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(Number.isFinite(n) ? n : 0)

const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
    }).format(d)
}

const maxStatus = computed(() =>
    Math.max(1, ...(props.byStatus ?? []).map((x) => x.total)),
)

const pct = (n: number) => Math.round((n / maxStatus.value) * 100)

const ymLabel = (ym: string) => {
    const [y, m] = ym.split('-').map((x) => Number(x))
    if (!y || !m) return ym
    const d = new Date(y, m - 1, 1)
    return new Intl.DateTimeFormat('es-MX', {
        month: 'short',
        year: 'numeric',
    }).format(d)
}
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-6 overflow-x-hidden p-4">

            <!-- HEADER -->
            <div class="space-y-1">
                <h1 class="text-2xl font-semibold tracking-tight">
                    Dashboard
                </h1>
                <p class="text-sm text-muted-foreground">
                    Hola {{ me?.name ?? 'equipo' }} ·
                    <span v-if="props.role === 'admin'">
                        Vista ejecutiva
                    </span>
                    <span v-else>
                        Vista comercial
                    </span>
                </p>
            </div>

            <!-- KPIs -->
            <div class="grid gap-4 md:grid-cols-3">

                <div class="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div class="flex items-center justify-between">
                        <p class="text-sm text-muted-foreground">
                            Cotizaciones activas
                        </p>
                        <BarChart3 class="h-4 w-4 opacity-60" />
                    </div>
                    <p class="mt-2 text-3xl font-semibold">
                        {{ props.kpis.cotizaciones_total }}
                    </p>
                </div>

                <div class="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div class="flex items-center justify-between">
                        <p class="text-sm text-muted-foreground">
                            Monto total
                        </p>
                        <BarChart3 class="h-4 w-4 opacity-60" />
                    </div>
                    <p class="mt-2 text-3xl font-semibold">
                        {{ money(props.kpis.monto_total) }}
                    </p>
                </div>

                <div
                    v-if="props.role === 'admin' && props.admin"
                    class="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                >
                    <p class="text-sm text-muted-foreground">
                        Operación activa
                    </p>

                    <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div class="flex justify-between">
                            <span>Productos</span>
                            <span class="font-semibold">
                                {{ props.admin.productos_activos }}
                            </span>
                        </div>

                        <div class="flex justify-between">
                            <span>Servicios</span>
                            <span class="font-semibold">
                                {{ props.admin.servicios_activos }}
                            </span>
                        </div>

                        <div class="flex justify-between">
                            <span>Personas</span>
                            <span class="font-semibold">
                                {{ props.admin.personas_activas }}
                            </span>
                        </div>

                        <div class="flex justify-between">
                            <span>Vendedores</span>
                            <span class="font-semibold">
                                {{ props.admin.vendedores_activos }}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            <!-- STATUS -->
            <div class="grid gap-4 lg:grid-cols-2">

                <div class="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 class="text-sm font-semibold">
                        Pipeline por estatus
                    </h2>

                    <div class="mt-3 space-y-3">
                        <div
                            v-for="row in props.byStatus"
                            :key="row.estatus"
                        >
                            <div class="flex justify-between text-xs">
                                <span>{{ row.estatus }}</span>
                                <span>{{ row.total }}</span>
                            </div>

                            <div class="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    class="h-2 rounded-full bg-foreground"
                                    :style="{ width: pct(row.total) + '%' }"
                                />
                            </div>
                        </div>

                        <p
                            v-if="!props.byStatus?.length"
                            class="text-sm text-muted-foreground"
                        >
                            Sin datos aún.
                        </p>
                    </div>
                </div>

                <div class="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 class="text-sm font-semibold">
                        Últimos 6 meses
                    </h2>

                    <div class="mt-3 overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead class="text-xs text-muted-foreground">
                                <tr>
                                    <th class="text-left py-2">Mes</th>
                                    <th class="text-right py-2">
                                        Cotizaciones
                                    </th>
                                    <th class="text-right py-2">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="m in props.monthly"
                                    :key="m.ym"
                                    class="border-t"
                                >
                                    <td class="py-2">
                                        {{ ymLabel(m.ym) }}
                                    </td>
                                    <td class="py-2 text-right">
                                        {{ m.total }}
                                    </td>
                                    <td class="py-2 text-right">
                                        {{ money(m.revenue) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <!-- RECENT -->
            <div class="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                <h2 class="text-sm font-semibold">
                    Últimas cotizaciones
                </h2>

                <div class="mt-3 overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="text-xs text-muted-foreground">
                            <tr>
                                <th class="text-left py-2">Folio</th>
                                <th class="text-left py-2">Cliente</th>
                                <th class="text-left py-2">Estatus</th>
                                <th class="text-right py-2">Total</th>
                                <th class="text-left py-2">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="q in props.recent"
                                :key="q.id"
                                class="border-t"
                            >
                                <td class="py-2 font-semibold">
                                    {{ q.folio }}
                                </td>
                                <td class="py-2">
                                    {{ q.persona?.nombre_completo ?? '—' }}
                                </td>
                                <td class="py-2">
                                    {{ q.estatus }}
                                </td>
                                <td class="py-2 text-right">
                                    {{ money(q.total) }}
                                </td>
                                <td class="py-2">
                                    {{ fmtDate(q.created_at) }}
                                </td>
                            </tr>

                            <tr v-if="!props.recent?.length">
                                <td
                                    colspan="5"
                                    class="py-6 text-center text-muted-foreground"
                                >
                                    Sin cotizaciones aún.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </AppLayout>
</template>