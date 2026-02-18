<script setup lang="ts">
    import AppLayout from '@/layouts/app/AppSidebarLayout.vue';
    import { watch } from 'vue'
    import { usePage } from '@inertiajs/vue3'
    import type { BreadcrumbItemType } from '@/types';
    import { swalNotify } from '@/lib/swal'

    interface Props {
        breadcrumbs?: BreadcrumbItemType[];
    }

    withDefaults(defineProps<Props>(), {
        breadcrumbs: () => [],
    });

    const page = usePage()

    watch(
        () => (page.props as any).flash,
        (flash) => {
            if (!flash) return
            if (flash.success) swalNotify(flash.success, 'success')
            if (flash.error) swalNotify(flash.error, 'error')
            if (flash.warning) swalNotify(flash.warning, 'warning')
            if (flash.info) swalNotify(flash.info, 'info')
        },
        {
            deep: true,
            immediate: true
        }
    )
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <slot />
    </AppLayout>
</template>
