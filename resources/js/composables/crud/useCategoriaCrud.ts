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

let swalStyled = false

function ensureSwalTheme() {
  if (swalStyled) return
  swalStyled = true

  const style = document.createElement('style')
  style.innerHTML = `
    .swal2-container{ z-index: 20000 !important; }
    .swal2-popup{
      background:#0b0c10 !important;
      color:#e4e4e7 !important;
      border:1px solid rgba(0,0,0,.08) !important;
      border-radius:18px !important;
      box-shadow:0 25px 90px rgba(0,0,0,.40) !important;
      padding: 1.25rem 1.25rem 1rem !important;
    }
    .swal2-title{ font-weight: 900 !important; letter-spacing: -0.02em !important; }
    .swal2-html-container{ color: rgba(228,228,231,.85) !important; }
    .swal2-input, .swal2-select{
      background: rgba(255,255,255,.06) !important;
      color:#e4e4e7 !important;
      border:1px solid rgba(255,255,255,.14) !important;
      border-radius: 12px !important;
      box-shadow: none !important;
      height: 42px !important;
    }
    .swal2-input:focus, .swal2-select:focus{
      border-color: rgba(16,185,129,.55) !important;
      box-shadow: 0 0 0 4px rgba(16,185,129,.16) !important;
      outline: none !important;
    }
    .swal2-confirm{
      background:#10b981 !important;
      color:#050608 !important;
      border-radius: 12px !important;
      font-weight: 900 !important;
      padding: 10px 16px !important;
    }
    .swal2-cancel{
      background: rgba(255,255,255,.06) !important;
      color:#e4e4e7 !important;
      border:1px solid rgba(255,255,255,.14) !important;
      border-radius: 12px !important;
      font-weight: 800 !important;
      padding: 10px 16px !important;
    }

    /* Light mode fallback: si tu app está en light, SWAL sigue viéndose bien */
    @media (prefers-color-scheme: light){
      .swal2-popup{
        background:#ffffff !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.10) !important;
        box-shadow:0 25px 90px rgba(2,6,23,.15) !important;
      }
      .swal2-html-container{ color: rgba(15,23,42,.75) !important; }
      .swal2-input, .swal2-select{
        background:#ffffff !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.12) !important;
      }
      .swal2-cancel{
        background: rgba(2,6,23,.04) !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.10) !important;
      }
    }
      .swal2-select option{
    background: #0b0c10 !important;
    color: #e4e4e7 !important;
  }

  @media (prefers-color-scheme: light){
    .swal2-select option{
      background: #ffffff !important;
      color: #0f172a !important;
    }
  }
  `
  document.head.appendChild(style)
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
   * CRUD (SweetAlert2)
   * - Nuevo/Editar NO maneja status
   * - Siempre guarda activo
   * ========================= */
  async function openForm(categoria?: Categoria) {
    ensureSwalTheme()

    const isEdit = Boolean(categoria)
    const current = categoria
      ? {
          id: Number(categoria.id),
          nombre: String(categoria.nombre ?? ''),
          tipo: (categoria.tipo as CategoriaTipo) ?? 'PRODUCTO',
        }
      : null

    const { value } = await Swal.fire({
      title: isEdit ? 'Editar categoría' : 'Nueva categoría',
      html: `
        <div style="text-align:left; margin-top:.25rem;">
          <label style="display:block; font-size:12px; font-weight:800; opacity:.85; margin:0 0 .35rem;">
            Nombre
          </label>
          <input id="cat_nombre" class="swal2-input" placeholder="Ej. CCTV, Cableado, Acceso…" value="${current?.nombre ?? ''}">
        </div>

        <div style="text-align:left; margin-top:.75rem;">
          <label style="display:block; font-size:12px; font-weight:800; opacity:.85; margin:0 0 .35rem;">
            Tipo
          </label>
          <select id="cat_tipo" class="swal2-select">
            <option value="PRODUCTO" ${current?.tipo === 'PRODUCTO' ? 'selected' : ''}>PRODUCTO</option>
            <option value="SERVICIO" ${current?.tipo === 'SERVICIO' ? 'selected' : ''}>SERVICIO</option>
          </select>
        </div>
      `,
      didOpen: () => {
        const n = document.getElementById('cat_nombre') as HTMLInputElement | null
        n?.focus()
        n?.select()
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById('cat_nombre') as HTMLInputElement).value.trim()
        const tipo = (document.getElementById('cat_tipo') as HTMLSelectElement).value as CategoriaTipo

        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio.')
          return
        }

        // status SIEMPRE activo en form
        return { nombre, tipo, status: 'activo' as CategoriaStatus }
      },
    })

    if (!value) return

    if (isEdit && current) {
      router.put(`${baseUrl}/${current.id}`, value, {
        preserveScroll: true,
        onSuccess: () => toast('Categoría actualizada', 'success'),
        onError: () => toast('Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onSuccess: () => toast('Categoría creada', 'success'),
      onError: () => toast('Revisa los campos', 'error'),
    })
  }

  /* =========================
   * Status: baja lógica / activar
   * ========================= */
  async function deactivate(c: Categoria) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Desactivar categoría',
      text: `Se dará de baja "${c.nombre}" (baja lógica).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    router.delete(`${baseUrl}/${c.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Categoría desactivada', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  async function activate(c: Categoria) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Activar categoría',
      text: `Se activará "${c.nombre}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    // payload completo por si tu UpdateRequest exige campos obligatorios
    router.put(
      `${baseUrl}/${c.id}`,
      { nombre: c.nombre, tipo: c.tipo, status: 'activo' as CategoriaStatus },
      {
        preserveScroll: true,
        onSuccess: () => toast('Categoría activada', 'success'),
        onError: () => toast('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(c: Categoria) {
    return c.status === 'activo' ? deactivate(c) : activate(c)
  }

  /* =========================
   * Toast
   * ========================= */
  function toast(title: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info') {
    ensureSwalTheme()
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
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
