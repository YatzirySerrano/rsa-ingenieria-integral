<script setup lang="ts">
import { computed } from 'vue'
import cctvImg from '@/img/cctv.jpg'

type Benefit = {
    title: string
    text: string
}

const props = defineProps<{
    tabs: Benefit[]
    active: number
    goCotizar: () => void
    goTo: (id: string) => void
}>()

const emit = defineEmits<{
    (e: 'update:active', value: number): void
}>()

function changeTab(i: number) {
    emit('update:active', i)
}

const currentBenefit = computed(() => {
    return props.tabs?.[props.active] ?? props.tabs?.[0] ?? null
})

const imageTitle = computed(() => {
    const titles = [
        'Evidencia que sí sirve.',
        'Grabación útil y confiable.',
        'Monitoreo desde donde estés.',
        'Instalación limpia y profesional.'
    ]

    return titles[props.active] ?? 'Evidencia que sí sirve.'
})

const imageText = computed(() => {
    const texts = [
        'Menos “instalación”, más solución operativa.',
        'Respaldo visual pensado para cuando realmente se necesita.',
        'Consulta local o remota con configuración estable.',
        'Orden, canalización y puesta en marcha profesional.'
    ]

    return texts[props.active] ?? 'Menos “instalación”, más solución operativa.'
})
</script>

<template>
    <section class="mx-auto max-w-7xl px-4 py-14 lg:px-6" data-reveal>
        <div class="mb-8">
            <h2 class="text-[32px] font-bold leading-tight tracking-tight text-slate-900">
                Beneficios con RSA
            </h2>

            <p class="mt-2 text-sm text-slate-500 md:text-[15px]">
                Enfoque corporativo: diseño, ejecución y continuidad. Selecciona un punto y cambia el detalle.
            </p>
        </div>

        <div class="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] md:p-6">
            <div class="grid gap-6 lg:grid-cols-12">
                <!-- Imagen izquierda -->
                <div class="lg:col-span-5">
                    <div class="relative min-h-[320px] overflow-hidden rounded-[26px] md:min-h-[350px]">
                        <img
                            :src="cctvImg"
                            alt="Beneficios CCTV RSA"
                            class="absolute inset-0 h-full w-full object-cover"
                        >

                        <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/5"></div>

                        <div class="relative z-10 flex h-full flex-col justify-between p-6">
                            <div>
                                <span class="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                    RSA • CCTV
                                </span>
                            </div>

                            <div>
                                <h3 class="max-w-xs text-3xl font-bold leading-tight text-white">
                                    {{ imageTitle }}
                                </h3>

                                <p class="mt-3 max-w-sm text-sm text-white/90 md:text-[15px]">
                                    {{ imageText }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs + detalle -->
                <div class="lg:col-span-7">
                    <div class="grid h-full gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
                        <!-- Tabs -->
                        <div class="space-y-3">
                            <button
                                v-for="(t, i) in tabs"
                                :key="`${t.title}-${i}`"
                                type="button"
                                @click="changeTab(i)"
                                class="w-full rounded-2xl border px-5 py-4 text-left text-[15px] font-semibold leading-snug transition-all duration-200"
                                :class="
                                    i === active
                                        ? 'border-slate-300 bg-slate-100 text-slate-900 shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                "
                            >
                                {{ t.title }}
                            </button>
                        </div>

                        <!-- Detalle -->
                        <div class="flex flex-col">
                            <div class="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                                <h3 class="text-2xl font-bold leading-tight text-slate-900">
                                    {{ currentBenefit?.title }}
                                </h3>

                                <p class="mt-4 text-[15px] leading-7 text-slate-600">
                                    {{ currentBenefit?.text }}
                                </p>

                                <div class="mt-8 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        @click="goCotizar"
                                        class="inline-flex h-12 items-center justify-center rounded-2xl bg-[#182a63] px-6 text-sm font-semibold text-white transition hover:opacity-95"
                                    >
                                        Solicitar cotización
                                    </button>

                                    <button
                                        type="button"
                                        @click="goTo('pasos')"
                                        class="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Ver pasos
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>