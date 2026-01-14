import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

/**
 * Tipos mínimos para el index.
 * Nota: tu API Resource trae marca/categoria como objetos; aquí los tipamos “ligero”.
 */
export type ProductoStatus = 'activo' | 'inactivo'

export type MarcaLite = { id: number; nombre: string }
export type CategoriaLite = { id: number; nombre: string }

export type Producto = {
  id: number
  marca_id: number
  categoria_id: number
  sku: string
  nombre: string
  descripcion?: string | null
  stock: number
  costo_lista: string | number
  precio_venta: string | number
  status: ProductoStatus

  // opcionales si tu Resource los incluye
  marca?: MarcaLite | null
  categoria?: CategoriaLite | null
}

/**
 * Filtros del index (Inertia).
 * - q: busca sku o nombre
 * - status: activo | inactivo | __all__
 * - marca_id / categoria_id: IDs o __all__
 */
export type ProductoFilters = {
  q: string
  status: string
  marca_id: string
  categoria_id: string
}

const ALL = '__all__'

type UseProductoCrudOptions = {
  initialFilters?: Partial<ProductoFilters>
  baseUrl?: string
}

let swalStyled = false

/**
 * Estilos SweetAlert2:
 * - Tema oscuro default + fallback claro por prefers-color-scheme.
 * - Corrige <option> en selects nativos dentro de Swal (muy importante en dark).
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

export function useProductoCrud(options: UseProductoCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/productos'

  /* =========================
   * Filtros (debounce)
   * ========================= */
  const filters = reactive<ProductoFilters>({
    q: options.initialFilters?.q ?? '',
    status: options.initialFilters?.status ?? ALL,
    marca_id: options.initialFilters?.marca_id ?? ALL,
    categoria_id: options.initialFilters?.categoria_id ?? ALL,
  })

  function buildParams() {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.status !== ALL) params.status = filters.status
    if (filters.marca_id !== ALL) params.marca_id = filters.marca_id
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
    filters.marca_id = ALL
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
    return (
      Boolean(filters.q.trim()) ||
      filters.status !== ALL ||
      filters.marca_id !== ALL ||
      filters.categoria_id !== ALL
    )
  })

  /* =========================
   * CRUD (SweetAlert2)
   * Regla: Nuevo/Editar no expone status (siempre activo)
   * ========================= */
  async function openForm(
    meta: {
      marcas: MarcaLite[]
      categorias: CategoriaLite[]
    },
    producto?: Producto
  ) {
    ensureSwalTheme()

    const isEdit = Boolean(producto)
    const current = producto
      ? {
          id: Number(producto.id),
          marca_id: Number(producto.marca_id),
          categoria_id: Number(producto.categoria_id),
          sku: String(producto.sku ?? ''),
          nombre: String(producto.nombre ?? ''),
          descripcion: String(producto.descripcion ?? ''),
          stock: Number(producto.stock ?? 0),
          costo_lista: String(producto.costo_lista ?? ''),
          precio_venta: String(producto.precio_venta ?? ''),
        }
      : null

    const marcasOptions = meta.marcas
      .map((m) => `<option value="${m.id}" ${current?.marca_id === m.id ? 'selected' : ''}>${m.nombre}</option>`)
      .join('')
    const categoriasOptions = meta.categorias
      .map((c) => `<option value="${c.id}" ${current?.categoria_id === c.id ? 'selected' : ''}>${c.nombre}</option>`)
      .join('')

    const { value } = await Swal.fire({
      title: isEdit ? 'Editar producto' : 'Nuevo producto',
      html: `
        <div style="display:grid; grid-template-columns:1fr; gap:.75rem; text-align:left; margin-top:.25rem;">
          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">Marca</label>
            <select id="p_marca" class="swal2-select">${marcasOptions}</select>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">Categoría</label>
            <select id="p_categoria" class="swal2-select">${categoriasOptions}</select>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">SKU</label>
            <input id="p_sku" class="swal2-input" placeholder="Ej. HK-1234" value="${current?.sku ?? ''}">
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">Nombre</label>
            <input id="p_nombre" class="swal2-input" placeholder="Nombre del producto" value="${current?.nombre ?? ''}">
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">Descripción</label>
            <textarea id="p_descripcion" class="swal2-textarea" placeholder="Descripción breve...">${current?.descripcion ?? ''}</textarea>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:.75rem;">
            <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
              <label style="font-size:12px; font-weight:800; opacity:.85;">Stock</label>
              <input id="p_stock" class="swal2-input" inputmode="numeric" placeholder="0" value="${current?.stock ?? 0}">
            </div>
            <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
              <label style="font-size:12px; font-weight:800; opacity:.85;">Costo lista</label>
              <input id="p_costo" class="swal2-input" inputmode="decimal" placeholder="0.00" value="${current?.costo_lista ?? ''}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:800; opacity:.85;">Precio venta</label>
            <input id="p_precio" class="swal2-input" inputmode="decimal" placeholder="0.00" value="${current?.precio_venta ?? ''}">
          </div>

          <p style="margin:.25rem 0 0; font-size:12px; opacity:.72;">
            El estado se gestiona desde el listado (Activar/Desactivar).
          </p>
        </div>
      `,
      didOpen: () => {
        const el = document.getElementById(isEdit ? 'p_nombre' : 'p_sku') as HTMLInputElement | null
        el?.focus()
        el?.select?.()
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const marca_id = toNum((document.getElementById('p_marca') as HTMLSelectElement).value)
        const categoria_id = toNum((document.getElementById('p_categoria') as HTMLSelectElement).value)

        const sku = (document.getElementById('p_sku') as HTMLInputElement).value.trim()
        const nombre = (document.getElementById('p_nombre') as HTMLInputElement).value.trim()
        const descripcion = (document.getElementById('p_descripcion') as HTMLTextAreaElement).value.trim()

        const stock = toNum((document.getElementById('p_stock') as HTMLInputElement).value)
        const costo_lista = moneyToFixed2((document.getElementById('p_costo') as HTMLInputElement).value)
        const precio_venta = moneyToFixed2((document.getElementById('p_precio') as HTMLInputElement).value)

        if (!Number.isFinite(marca_id)) {
          Swal.showValidationMessage('Selecciona una marca válida.')
          return
        }
        if (!Number.isFinite(categoria_id)) {
          Swal.showValidationMessage('Selecciona una categoría válida.')
          return
        }
        if (!sku) {
          Swal.showValidationMessage('El SKU es obligatorio.')
          return
        }
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio.')
          return
        }
        if (!Number.isFinite(stock) || stock < 0) {
          Swal.showValidationMessage('El stock debe ser un número válido (>= 0).')
          return
        }
        if (costo_lista === null) {
          Swal.showValidationMessage('El costo lista debe ser un número válido.')
          return
        }
        if (precio_venta === null) {
          Swal.showValidationMessage('El precio venta debe ser un número válido.')
          return
        }

        // Status SIEMPRE activo en form
        return {
          marca_id,
          categoria_id,
          sku,
          nombre,
          descripcion: descripcion || null,
          stock,
          costo_lista,
          precio_venta,
          status: 'activo' as const,
        }
      },
    })

    if (!value) return

    if (isEdit && current) {
      router.put(`${baseUrl}/${current.id}`, value, {
        preserveScroll: true,
        onSuccess: () => toast('Producto actualizado', 'success'),
        onError: () => toast('Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onSuccess: () => toast('Producto creado', 'success'),
      onError: () => toast('Revisa los campos', 'error'),
    })
  }

  /* =========================
   * Status: baja lógica / activar
   * ========================= */
  async function deactivate(p: Producto) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Desactivar producto',
      text: `Se dará de baja "${p.nombre}" (baja lógica).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    router.delete(`${baseUrl}/${p.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Producto desactivado', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  async function activate(p: Producto) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Activar producto',
      text: `Se activará "${p.nombre}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    /**
     * Payload completo:
     * - Por si tu UpdateRequest exige campos obligatorios (marca/categoria/sku/etc.).
     * - Aquí mandamos lo “mínimo seguro” con lo que ya tienes en la fila.
     */
    router.put(
      `${baseUrl}/${p.id}`,
      {
        marca_id: p.marca_id,
        categoria_id: p.categoria_id,
        sku: p.sku,
        nombre: p.nombre,
        descripcion: p.descripcion ?? null,
        stock: p.stock,
        costo_lista: String(p.costo_lista),
        precio_venta: String(p.precio_venta),
        status: 'activo' as const,
      },
      {
        preserveScroll: true,
        onSuccess: () => toast('Producto activado', 'success'),
        onError: () => toast('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(p: Producto) {
    return p.status === 'activo' ? deactivate(p) : activate(p)
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
