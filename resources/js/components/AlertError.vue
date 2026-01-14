<script setup lang="ts">
    import type { Flash } from '@/types/common'
    
    const props = withDefaults(defineProps<{
      flash?: Flash
      errors?: Record<string, any>
    }>(), {
      flash: undefined,
      errors: () => ({}),
    })
    </script>
    
    <template>
      <div v-if="props.flash?.error" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
        {{ props.flash.error }}
      </div>
    </template>
    