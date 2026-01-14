<script setup lang="ts">
    import {
      SelectContent,
      SelectScrollDownButton,
      SelectScrollUpButton,
      SelectViewport,
      type SelectContentProps,
      useForwardProps,
    } from 'reka-ui'
    import { ChevronDown, ChevronUp } from 'lucide-vue-next'
    import { cn } from '@/lib/utils'
    
    const props = defineProps<SelectContentProps & { class?: string }>()
    const forwarded = useForwardProps(props)
    </script>
    
    <template>
      <SelectContent
        v-bind="forwarded"
        :class="cn(
          'relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-900 shadow-md',
          'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100',
          props.class,
        )"
      >
        <SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
          <ChevronUp class="h-4 w-4 opacity-70" />
        </SelectScrollUpButton>
    
        <SelectViewport class="p-1">
          <slot />
        </SelectViewport>
    
        <SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
          <ChevronDown class="h-4 w-4 opacity-70" />
        </SelectScrollDownButton>
      </SelectContent>
    </template>
    