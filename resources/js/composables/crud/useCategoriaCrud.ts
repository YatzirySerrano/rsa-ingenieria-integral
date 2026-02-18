import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

export type CategoriaTipo = 'PRODUCTO' | 'SERVICIO'
export type CategoriaStatus = 'activo' | 'inactivo'

export type Categoria = {
    id: number
    nombre: string
    tipo: CategoriaTipo
    status: CategoriaStatus
    created_at: string
    updated_at: string
}

export type CategoriaFilters = {
    q: string
    tipo: string
    status: string
}

const ALL = '__all__'

type UseCategoriaCrudOptions = {
  initialFilters?: Partial<CategoriaFilters>
  baseUrl?: string
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function firstError(errors: Record<string, any> | undefined) {
  if (!errors) return null
  const k = Object.keys(errors)[0]
  const v = (errors as any)[k]
  if (!v) return null
  return Array.isArray(v) ? v[0] : String(v)
}

/**
 * Base visual Tailwind para SweetAlert2 (sin CSS custom, sin inyección).
 * Usamos `!` para ganarle al CSS oficial de sweetalert2.
 */
function swalModalClasses() {
  return {
    container: 'z-[20000]',
    popup:
      '!w-full !max-w-[680px] !rounded-3xl !border !border-slate-200/80 !bg-white !p-6 !text-left !shadow-2xl ' +
      'dark:!border-white/10 dark:!bg-zinc-950/95 dark:!text-zinc-100',
    title:
      '!m-0 !mb-3 !p-0 !text-center !text-2xl !font-black !tracking-tight !text-slate-900 dark:!text-zinc-100',
    htmlContainer:
      '!m-0 !p-0 !text-left !overflow-visible !max-h-none !text-slate-700 dark:!text-zinc-300',
    actions: '!mt-6 !gap-3 !p-0',
    confirmButton:
      '!inline-flex !items-center !justify-center !rounded-xl !px-4 !py-2.5 !text-sm !font-extrabold ' +
      '!bg-emerald-600 !text-white hover:!bg-emerald-500 active:scale-[.99] ' +
      'dark:!bg-emerald-500 dark:!text-zinc-950 dark:hover:!bg-emerald-400',
    cancelButton:
      '!inline-flex !items-center !justify-center !rounded-xl !px-4 !py-2.5 !text-sm !font-extrabold ' +
      '!bg-transparent !text-slate-700 !border !border-slate-200 hover:!bg-slate-50 active:scale-[.99] ' +
      'dark:!text-zinc-200 dark:!border-white/10 dark:hover:!bg-white/5',
    validationMessage:
      '!mt-3 !rounded-2xl !border !border-rose-500/20 !bg-rose-500/10 !px-3 !py-2 !text-sm !font-semibold ' +
      '!text-rose-700 dark:!text-rose-200',
  }
}

function swalToastClasses() {
  return {
    container: 'z-[20000]',
    popup:
      '!rounded-2xl !border !border-slate-200/80 !bg-white !px-3 !py-2 !shadow-xl ' +
      'dark:!border-white/10 dark:!bg-zinc-950/95',
    title: '!text-sm !font-extrabold !text-slate-900 dark:!text-zinc-100',
  }
}

function fireModal(opts: Swal.SweetAlertOptions) {
  return Swal.fire({
    heightAuto: false,
    buttonsStyling: false,
    showClass: { popup: '' },
    hideClass: { popup: '' },
    ...opts,
    customClass: {
      ...swalModalClasses(),
      ...(opts.customClass ?? {}),
    },
  })
}

function toast(title: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info') {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    heightAuto: false,
    buttonsStyling: false,
    showClass: { popup: '' },
    hideClass: { popup: '' },
    customClass: swalToastClasses(),
  })
}

export function useCategoriaCrud(options: UseCategoriaCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/categorias'

  /* =========================
   * Filtros (debounce)
   * ========================= */
  const filters = reactive<CategoriaFilters>({
    q: options.initialFilters?.q ?? '',
    tipo: options.initialFilters?.tipo ?? ALL,
    status: options.initialFilters?.status ?? ALL,
  })

  function buildParams() {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.tipo !== ALL) params.tipo = filters.tipo
    if (filters.status !== ALL) params.status = filters.status
    return params
  }

  function applyFilters() {
    router.get(baseUrl, buildParams(), {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    })
  }

  function resetFilters() {
    filters.q = ''
    filters.tipo = ALL
    filters.status = ALL
    applyFilters()
  }

  let t: number | null = null
  watch(
    () => ({ ...filters }),
    () => {
      if (t) window.clearTimeout(t)
      t = window.setTimeout(() => applyFilters(), 320)
    },
    { deep: true }
  )

  const hasActiveFilters = computed(() => {
    return Boolean(filters.q.trim()) || filters.tipo !== ALL || filters.status !== ALL
  })

  /* =========================
   * Modal Form (Tailwind)
   * ========================= */
  async function openForm(categoria?: Categoria) {
    const isEdit = Boolean(categoria)
    const current = categoria
      ? {
          id: Number(categoria.id),
          nombre: String(categoria.nombre ?? ''),
          tipo: (categoria.tipo as CategoriaTipo) ?? 'PRODUCTO',
        }
      : null

    const nombreVal = escapeHtml(current?.nombre ?? '')

    const inputCls =
      'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ' +
      'outline-none transition placeholder:text-slate-400 ' +
      'focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15 ' +
      'dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500'

    const selectWrapCls = 'relative'
    const selectCls =
      'w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-sm font-semibold text-slate-900 shadow-sm ' +
      'outline-none transition hover:bg-slate-50 ' +
      'focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15 ' +
      'dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800/60 dark:[color-scheme:dark]'

    const labelCls = 'text-xs font-extrabold text-slate-700 dark:text-zinc-300'

    const tipBtn =
      'group relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 ' +
      'text-slate-500 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ' +
      'dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5'

    const tipBubble =
      'pointer-events-none absolute right-0 top-9 z-50 w-max max-w-[280px] ' +
      'rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-xl ' +
      'opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 ' +
      'dark:bg-white dark:text-zinc-950'

    const html = `
      <div class="grid gap-4">
        <div class="grid gap-2">
          <div class="flex items-center justify-between gap-3">
            <label class="${labelCls}" for="cat_nombre">Nombre de la categoría</label>
            <button type="button" class="${tipBtn}" aria-label="Ayuda nombre" tabindex="0">
              <span class="text-[11px] font-black">i</span>
              <span class="${tipBubble}">
                Nombre visible para el cliente (ej. CCTV, Cableado).
                <span class="absolute -top-1 right-3 h-2 w-2 rotate-45 bg-slate-900 dark:bg-white"></span>
              </span>
            </button>
          </div>

          <input
            id="cat_nombre"
            class="${inputCls}"
            placeholder="Ej. CCTV, Cableado, Acceso…"
            value="${nombreVal}"
            autocomplete="off"
          />
        </div>

        <div class="grid gap-2">
          <div class="flex items-center justify-between gap-3">
            <label class="${labelCls}" for="cat_tipo">Tipo</label>
            <button type="button" class="${tipBtn}" aria-label="Ayuda tipo" tabindex="0">
              <span class="text-[11px] font-black">i</span>
              <span class="${tipBubble}">
                PRODUCTO para catálogo, SERVICIO para instalaciones/soporte.
                <span class="absolute -top-1 right-3 h-2 w-2 rotate-45 bg-slate-900 dark:bg-white"></span>
              </span>
            </button>
          </div>

          <div class="${selectWrapCls}">
            <select id="cat_tipo" class="${selectCls}">
              <option value="PRODUCTO" ${current?.tipo === 'PRODUCTO' ? 'selected' : ''}>PRODUCTO</option>
              <option value="SERVICIO" ${current?.tipo === 'SERVICIO' ? 'selected' : ''}>SERVICIO</option>
            </select>

            <svg class="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400 dark:text-zinc-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    `

    const { value } = await fireModal({
      title: isEdit ? 'Editar categoría' : 'Nueva categoría',
      html,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      allowOutsideClick: () => !Swal.isLoading(),
      didOpen: () => {
        const n = document.getElementById('cat_nombre') as HTMLInputElement | null
        n?.focus()
        n?.select()

        n?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            Swal.clickConfirm()
          }
        })
      },
      preConfirm: () => {
        const nombre = (document.getElementById('cat_nombre') as HTMLInputElement | null)?.value?.trim() ?? ''
        const tipo = (document.getElementById('cat_tipo') as HTMLSelectElement | null)?.value as CategoriaTipo

        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio.')
          return
        }
        if (nombre.length < 2) {
          Swal.showValidationMessage('El nombre es demasiado corto.')
          return
        }
        if (tipo !== 'PRODUCTO' && tipo !== 'SERVICIO') {
          Swal.showValidationMessage('Selecciona un tipo válido.')
          return
        }

        return { nombre, tipo, status: 'activo' as CategoriaStatus }
      },
    })

    if (!value) return

    // Recomendación: éxito centralizado por flash en Inertia (evita doble toast).
    if (isEdit && current) {
      router.put(`${baseUrl}/${current.id}`, value, {
        preserveScroll: true,
        onError: (errors) => toast(firstError(errors as any) ?? 'Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onError: (errors) => toast(firstError(errors as any) ?? 'Revisa los campos', 'error'),
    })
  }

  async function deactivate(c: Categoria) {
    const { isConfirmed } = await fireModal({
      title: 'Eliminar categoría',
      text: `Se eliminará "${c.nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    router.delete(`${baseUrl}/${c.id}`, {
      preserveScroll: true,
      onError: () => toast('No se pudo eliminar', 'error'),
    })
  }

  async function activate(c: Categoria) {
    const { isConfirmed } = await fireModal({
      title: 'Activar categoría',
      text: `Se activará "${c.nombre}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    router.put(
      `${baseUrl}/${c.id}`,
      { nombre: c.nombre, tipo: c.tipo, status: 'activo' as CategoriaStatus },
      {
        preserveScroll: true,
        onError: () => toast('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(c: Categoria) {
    return c.status === 'activo' ? deactivate(c) : activate(c)
  }

  return {
    ALL,
    filters,
    hasActiveFilters,
    applyFilters,
    resetFilters,
    openForm,
    toggleStatus,
    activate,
    deactivate,
  }
}
