<script setup lang="ts">
type Step = {
    n: string
    title: string
    text: string
    output?: string
}

defineProps<{
    steps: Step[]
    goCotizar: () => void
}>()

function goTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}
</script>

<template>
    <section id="pasos" class="mx-auto max-w-7xl px-4 py-14 lg:px-6" data-reveal>
        <div class="mb-8">
            <h2 class="text-[34px] font-bold leading-tight tracking-tight text-slate-900">
                Pasos para contratar
            </h2>

            <p class="mt-2 text-sm text-slate-500 md:text-[15px]">
                Proceso claro, sin fricción: de diagnóstico a continuidad operativa.
            </p>
        </div>

        <div class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <div
                v-for="(s, index) in steps"
                :key="`${s.n}-${index}`"
                class="grid gap-6 px-6 py-7 md:grid-cols-[380px_minmax(0,1fr)] md:px-7"
                :class="index !== steps.length - 1 ? 'border-b border-slate-200' : ''"
            >
                <!-- izquierda -->
                <div class="flex items-start gap-4">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#182a63] text-sm font-bold text-white shadow-sm">
                        {{ s.n }}
                    </div>

                    <div class="min-w-0">
                        <h3 class="text-[18px] font-bold leading-tight text-slate-900">
                            {{ s.title }}
                        </h3>

                        <p
                            v-if="s.output"
                            class="mt-1 text-[13px] text-slate-400"
                        >
                            Salida: {{ s.output }}
                        </p>
                    </div>
                </div>

                <!-- derecha -->
                <div class="md:pt-1">
                    <p class="text-[15px] leading-7 text-slate-500">
                        {{ s.text }}
                    </p>
                </div>
            </div>
        </div>

        <div class="mt-8 flex flex-wrap gap-4">
            <button
                type="button"
                @click="goCotizar"
                class="inline-flex h-12 items-center justify-center rounded-2xl bg-[#182a63] px-6 text-sm font-semibold text-white transition hover:opacity-95"
            >
                Solicitar cotización
            </button>

            <button
                type="button"
                @click="goTop"
                class="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
                Volver al inicio
            </button>
        </div>
    </section>
</template>