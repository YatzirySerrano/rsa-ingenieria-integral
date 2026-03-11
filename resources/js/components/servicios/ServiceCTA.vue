<script setup lang="ts">
defineProps<{
    waLink: string
    goCotizar: () => void
}>()
</script>

<template>
    <section class="mx-auto max-w-7xl px-4 pb-14 lg:px-6">
        <div
            class="rounded-[28px] border border-slate-200 bg-white px-8 py-9 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"
        >
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <!-- texto -->
                <div class="max-w-2xl">
                    <h2 class="text-[22px] font-bold leading-tight text-slate-900 md:text-[24px]">
                        ¿Listo para videovigilancia profesional?
                    </h2>

                    <p class="mt-3 text-[15px] leading-7 text-slate-500">
                        Te armamos propuesta por riesgo y presupuesto, con instalación limpia y evidencia confiable.
                    </p>
                </div>

                <!-- acciones -->
                <div class="flex flex-wrap gap-3 lg:justify-end">
                    <button
                        type="button"
                        @click="goCotizar"
                        class="inline-flex h-12 items-center justify-center rounded-2xl bg-[#182a63] px-6 text-sm font-semibold text-white transition hover:opacity-95"
                    >
                        Solicitar cotización
                    </button>

                    <a
                        :href="waLink"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        WhatsApp
                    </a>
                </div>
            </div>
        </div>
    </section>
</template>