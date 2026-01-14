<script setup lang="ts">
    import { SelectTrigger, type SelectTriggerProps, useForwardProps } from 'reka-ui'
    import { ChevronDown } from 'lucide-vue-next'
    import { cn } from '@/lib/utils'
    
    const props = defineProps<SelectTriggerProps & { class?: string }>()
    const forwarded = useForwardProps(props)
    </script>
    
    <template>
      <SelectTrigger
        v-bind="forwarded"
        :class="cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white',
          'focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-600',
          props.class,
        )"
      >
        <slot />
        <ChevronDown class="h-4 w-4 opacity-60" />
      </SelectTrigger>
    </template>
    