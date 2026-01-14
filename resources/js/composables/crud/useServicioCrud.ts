import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

/**
 * Servicio:
 * - status solo se cambia con Activar/Desactivar (baja lógica)
 * - en Nuevo/Editar SIEMPRE se manda status=activo (no se muestra en el modal)
 */
export type ServicioStatus = 'activo' | 'inactivo'

export type CategoriaLite = { id: number; nombre: string }

export type Servicio = {
  id: number
  categoria_id: number
  nombre: string
  descripcion?: string | null
  precio: string | number
  status: ServicioStatus

  // si tu Resource lo incluye
  categoria?: CategoriaLite | null
}

export type ServicioFilters = {
  q: string
  status: string
  categoria_id: string
}

const ALL = '__all__'

type UseServicioCrudOptions = {
  initialFilters?: Partial<ServicioFilters>
  baseUrl?: string
}

let swalStyled = false

/**
 * SweetAlert2 theme:
 * - default dark
 * - fallback light por prefers-color-scheme
 * - corrige option background en select nativo (el bug que mostraste)
 */
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

    .swal2-input, .swal2-select, .swal2-textarea{
      background: rgba(255,255,255,.06) !important;
      color:#e4e4e7 !important;
      border:1px solid rgba(255,255,255,.14) !important;
      border-radius: 12px !important;
      box-shadow: none !important;
      height: 42px !important;
    }

    .swal2-textarea{
      height: auto !important;
      min-height: 86px !important;
      padding-top: 10px !important;
      padding-bottom: 10px !important;
    }

    .swal2-input:focus, .swal2-select:focus, .swal2-textarea:focus{
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

    .swal2-select option{
      background: #0b0c10 !important;
      color: #e4e4e7 !important;
    }

    @media (prefers-color-scheme: light){
      .swal2-popup{
        background:#ffffff !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.10) !important;
        box-shadow:0 25px 90px rgba(2,6,23,.15) !important;
      }
      .swal2-html-container{ color: rgba(15,23,42,.75) !important; }
      .swal2-input, .swal2-select, .swal2-textarea{
        background:#ffffff !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.12) !important;
      }
      .swal2-cancel{
        background: rgba(2,6,23,.04) !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.10) !important;
      }
      .swal2-select option{
        background:#ffffff !important;
        color:#0f172a !important;
      }
    }
  `
  document.head.appendChild(style)
}

function toNum(v: unknown) {
  const n = Number(String(v ?? '').trim())
  return Number.isFinite(n) ? n : NaN
}

function moneyToFixed2(v: unknown) {
  const n = toNum(v)
  if (!Number.isFinite(n)) return null
  return Number(n).toFixed(2)
}

export function useServicioCrud(options: UseServicioCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/servicios'

  /* =========================
   * Filtros (debounce)
   * ========================= */
  const filters = reactive<ServicioFilters>({
    q: options.initialFilters?.q ?? '',
    status: options.initialFilters?.status ?? ALL,
    categoria_id: options.initialFilters?.categoria_id ?? ALL,
  })

  function buildParams() {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.status !== ALL) params.status = filters.status
    if (filters.categoria_id !== ALL) params.categoria_id = filters.categoria_id
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
    filters.status = ALL
    filters.categoria_id = ALL
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
    return Boolean(filters.q.trim()) || filters.status !== ALL || filters.categoria_id !== ALL
  })

  /* =========================
   * CRUD (SweetAlert2)
   * - Nuevo/Editar NO maneja status
   * - Siempre guarda activo
   * ========================= */
  async function openForm(meta: { categorias: CategoriaLite[] }, servicio?: Servicio) {
    ensureSwalTheme()

    const isEdit = Boolean(servicio)
    const current = servicio
      ? {
          id: Number(servicio.id),
          categoria_id: Number(servicio.categoria_id),
          nombre: String(servicio.nombre ?? ''),
          descripcion: String(servicio.descripcion ?? ''),
          precio: String(servicio.precio ?? ''),
        }
      : null

    const categoriasOptions = meta.categorias
      .map(
        (c) =>
          `<option value="${c.id}" ${current?.categoria_id === c.id ? 'selected' : ''}>${c.nombre}</option>`
      )
      .join('')

    const { value } = await Swal.fire({
      title: isEdit ? 'Editar servicio' : 'Nuevo servicio',
      html: `
        <div style="display:grid; grid-template-columns:1fr; gap:.75rem; text-align:left; margin-top:.25rem;">
          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">Categoría</label>
            <select id="s_categoria" class="swal2-select">${categoriasOptions}</select>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">Nombre</label>
            <input id="s_nombre" class="swal2-input" placeholder="Ej. Instalación CCTV" value="${current?.nombre ?? ''}">
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">Descripción</label>
            <textarea id="s_descripcion" class="swal2-textarea" placeholder="Descripción breve...">${current?.descripcion ?? ''}</textarea>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">Precio</label>
            <input id="s_precio" class="swal2-input" inputmode="decimal" placeholder="0.00" value="${current?.precio ?? ''}">
          </div>

          <p style="margin:.25rem 0 0; font-size:12px; opacity:.72;">
            El estado se gestiona desde el listado (Activar/Desactivar).
          </p>
        </div>
      `,
      didOpen: () => {
        const el = document.getElementById('s_nombre') as HTMLInputElement | null
        el?.focus()
        el?.select?.()
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const categoria_id = toNum((document.getElementById('s_categoria') as HTMLSelectElement).value)
        const nombre = (document.getElementById('s_nombre') as HTMLInputElement).value.trim()
        const descripcion = (document.getElementById('s_descripcion') as HTMLTextAreaElement).value.trim()
        const precio = moneyToFixed2((document.getElementById('s_precio') as HTMLInputElement).value)

        if (!Number.isFinite(categoria_id)) {
          Swal.showValidationMessage('Selecciona una categoría válida.')
          return
        }
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio.')
          return
        }
        if (precio === null) {
          Swal.showValidationMessage('El precio debe ser un número válido.')
          return
        }

        // status SIEMPRE activo en el form
        return {
          categoria_id,
          nombre,
          descripcion: descripcion || null,
          precio,
          status: 'activo' as const,
        }
      },
    })

    if (!value) return

    if (isEdit && current) {
      router.put(`${baseUrl}/${current.id}`, value, {
        preserveScroll: true,
        onSuccess: () => toast('Servicio actualizado', 'success'),
        onError: () => toast('Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onSuccess: () => toast('Servicio creado', 'success'),
      onError: () => toast('Revisa los campos', 'error'),
    })
  }

  /* =========================
   * Status: baja lógica / activar
   * ========================= */
  async function deactivate(s: Servicio) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Desactivar servicio',
      text: `Se dará de baja "${s.nombre}" (baja lógica).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    router.delete(`${baseUrl}/${s.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Servicio desactivado', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  async function activate(s: Servicio) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Activar servicio',
      text: `Se activará "${s.nombre}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    // payload completo por si tu UpdateRequest es estricto
    router.put(
      `${baseUrl}/${s.id}`,
      {
        categoria_id: s.categoria_id,
        nombre: s.nombre,
        descripcion: s.descripcion ?? null,
        precio: String(s.precio),
        status: 'activo' as const,
      },
      {
        preserveScroll: true,
        onSuccess: () => toast('Servicio activado', 'success'),
        onError: () => toast('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(s: Servicio) {
    return s.status === 'activo' ? deactivate(s) : activate(s)
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
