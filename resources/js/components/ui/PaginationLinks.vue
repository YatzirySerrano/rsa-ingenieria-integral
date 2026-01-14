<script setup lang="ts">
    import { computed } from 'vue'
    import { Link } from '@inertiajs/vue3'
    
    type LaravelLink = { url: string | null; label: string; active: boolean }
    
    // Acepta:
    // - links: LaravelLink[]
    // - links: { first,last,prev,next } (object)
    // - links: null
    const props = defineProps<{
      links?: LaravelLink[] | Record<string, any> | null
    }>()
    
    const normalized = computed<LaravelLink[]>(() => {
      const l = props.links
      if (!l) return []
    
      // Si ya es array tipo Laravel paginator
      if (Array.isArray(l)) return l as LaravelLink[]
    
      // Si viene como objeto, intentar convertir:
      // Caso típico: { first, last, prev, next } o { data: [...] }
      if (typeof l === 'object') {
        if (Array.isArray((l as any).data)) return (l as any).data as LaravelLink[]
    
        const candidates = ['prev', 'next', 'first', 'last']
          .map((k) => (l as any)[k])
          .filter(Boolean)
    
        // convertir a formato LaravelLink
        const asLinks: LaravelLink[] = candidates.map((x: any) => ({
          url: x?.url ?? null,
          label: x?.label ?? '',
          active: Boolean(x?.active),
        }))
    
        return asLinks.length ? asLinks : []
      }
    
      return []
    })
    
    function cleanLabel(label: string) {
      return String(label)
        .replaceAll('&laquo;', '«')
        .replaceAll('&raquo;', '»')
        .replace(/<[^>]*>/g, '')
        .trim()
    }
    </script>
    
    <template>
      <nav v-if="normalized.length" class="flex flex-wrap items-center justify-center gap-2" aria-label="Paginación">
        <template v-for="(l, idx) in normalized" :key="idx">
          <span
            v-if="!l.url"
            class="select-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400
                   dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-500"
            aria-disabled="true"
          >
            {{ cleanLabel(l.label) }}
          </span>
    
          <span
            v-else-if="l.active"
            class="rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-sm font-semibold text-white
                   dark:border-slate-800 dark:bg-slate-100 dark:text-slate-950"
            aria-current="page"
          >
            {{ cleanLabel(l.label) }}
          </span>
    
          <Link
            v-else
            :href="l.url"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm
                   transition hover:bg-slate-50 hover:text-slate-900
                   dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100"
          >
            {{ cleanLabel(l.label) }}
          </Link>
        </template>
      </nav>
    </template>
    