<script setup lang="ts">
    import { SelectItem, SelectItemIndicator, SelectItemText, type SelectItemProps, useForwardProps } from 'reka-ui'
    import { Check } from 'lucide-vue-next'
    import { cn } from '@/lib/utils'
    
    const props = defineProps<SelectItemProps & { class?: string }>()
    const forwarded = useForwardProps(props)
    </script>
    
    <template>
      <SelectItem
        v-bind="forwarded"
        :class="cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
          'focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          'dark:focus:bg-slate-800/60 dark:focus:text-slate-100',
          props.class,
        )"
      >
        <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <SelectItemIndicator>
            <Check class="h-4 w-4" />
          </SelectItemIndicator>
        </span>
    
        <SelectItemText>
          <slot />
        </SelectItemText>
      </SelectItem>
    </template>
    