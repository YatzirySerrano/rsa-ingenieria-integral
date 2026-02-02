<script setup lang="ts">
/**
 * SearchSelect.vue
 * =================
 * Select con búsqueda tipo dashboard.
 *
 * Decisión CLAVE:
 * - El dropdown se TELEPORTA al <body>
 * - Evita problemas de z-index, overflow, tablas, cards, sticky headers
 * - Posicionado con position: fixed usando boundingClientRect
 */

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

type AnyObj = Record<string, any>

const props = withDefaults(
  defineProps<{
    modelValue: any
    options: AnyObj[]
    searchKey: string
    displayKey: string
    valueKey: string
    placeholder?: string
    disabled?: boolean
    maxItems?: number
  }>(),
  {
    placeholder: 'Buscar...',
    disabled: false,
    maxItems: 150,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
}>()

/* ===============================
   REFS
================================ */
const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const open = ref(false)
const query = ref('')

/* Posición del dropdown (fixed en body) */
const dropdownStyle = ref<Record<string, string>>({})

/* ===============================
   HELPERS
================================ */
function norm(v: any) {
  return String(v ?? '').trim().toLowerCase()
}

/* ===============================
   COMPUTEDS
================================ */
const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return (
    props.options.find(
      (o) => String(o?.[props.valueKey]) === String(props.modelValue)
    ) || null
  )
})

const selectedLabel = computed(() =>
  selectedOption.value
    ? String(selectedOption.value?.[props.displayKey] ?? '')
    : ''
)

const filteredOptions = computed(() => {
  const q = norm(query.value)
  if (!q) return props.options.slice(0, props.maxItems)
  return props.options
    .filter((o) => norm(o?.[props.searchKey]).includes(q))
    .slice(0, props.maxItems)
})

const hasNoResults = computed(
  () => norm(query.value) !== '' && filteredOptions.value.length === 0
)

/* ===============================
   DROPDOWN POSITION
================================ */
function updateDropdownPosition() {
  const el = rootRef.value
  if (!el) return

  const r = el.getBoundingClientRect()

  dropdownStyle.value = {
    position: 'fixed',
    top: `${r.bottom + 8}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
    zIndex: '2147483647', // z-index máximo real
  }
}

/* ===============================
   CONTROL
================================ */
function openDropdown() {
  if (props.disabled) return
  open.value = true
  nextTick(updateDropdownPosition)
}

function closeDropdown() {
  open.value = false
}

function selectOption(opt: AnyObj) {
  const val = opt?.[props.valueKey]
  emit('update:modelValue', val)
  emit('change', val)
  query.value = ''
  closeDropdown()
}

function clearSelection() {
  emit('update:modelValue', '')
  emit('change', '')
  query.value = ''
  openDropdown()
  nextTick(() => inputRef.value?.focus())
}

/* ===============================
   EVENTS
================================ */
function onFocus() {
  openDropdown()
}

function onClickOutside(e: MouseEvent) {
  if (!rootRef.value) return
  if (!rootRef.value.contains(e.target as Node)) closeDropdown()
}

function onKeyDown(e: KeyboardEvent) {
  if (!open.value && (e.key === 'Enter' || e.key === 'ArrowDown')) {
    openDropdown()
    e.preventDefault()
  }
  if (e.key === 'Escape') closeDropdown()
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})

watch(
  () => props.disabled,
  (v) => v && closeDropdown()
)
</script>

<template>
  <!-- INPUT (se queda en el layout normal) -->
  <div ref="rootRef" class="relative w-full">
    <div
      class="flex items-center gap-2 rounded-2xl border-2
             border-slate-200/70 bg-white/95
             px-4 py-3
             transition
             focus-within:border-emerald-500
             focus-within:ring-4 focus-within:ring-emerald-500/20"
    >
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="selectedLabel || placeholder"
        class="w-full bg-transparent outline-none text-sm"
        @focus="onFocus"
        @keydown="onKeyDown"
      />

      <button
        v-if="modelValue"
        type="button"
        class="h-8 w-8 rounded-full border text-slate-500"
        @click.stop="clearSelection"
      >
        ×
      </button>
    </div>
  </div>

  <!-- DROPDOWN TELEPORTADO -->
  <Teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="open"
        :style="dropdownStyle"
        class="rounded-2xl border bg-white shadow-2xl max-h-72 overflow-y-auto"
      >
        <div v-if="hasNoResults" class="px-4 py-4 text-sm text-slate-500">
          Sin resultados
        </div>

        <button
          v-for="opt in filteredOptions"
          :key="String(opt?.[valueKey])"
          class="w-full text-left px-4 py-3 hover:bg-emerald-50"
          @click="selectOption(opt)"
        >
          <p class="font-bold">{{ opt?.[displayKey] }}</p>
          <p v-if="searchKey !== displayKey" class="text-xs text-slate-500">
            {{ opt?.[searchKey] }}
          </p>
        </button>
      </div>
    </transition>
  </Teleport>
</template>