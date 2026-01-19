/*
  COMPOSABLE: useProductoCrud.ts
  =============================

  - Modal centrado premium (dark/light) RESPETANDO Tailwind (html.dark)
  - Alta/edición permite subir fotos opcionales (fotos[])
  - Preview de imágenes seleccionadas (miniaturas)
  - Si hay fotos -> FormData (multipart). Si no -> JSON normal.
  - Filtros con debounce + Inertia
*/

import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

// ============================================================================
// TIPOS
// ============================================================================

export type ProductoStatus = 'activo' | 'inactivo'
export type ProductoMediaTipo = 'imagen' | 'video'

export type MarcaLite = { id: number; nombre: string }
export type CategoriaLite = { id: number; nombre: string }

export type ProductoMedia = {
  id: number
  producto_id: number
  tipo: ProductoMediaTipo
  url: string
  orden: number
  principal: boolean
  status: ProductoStatus
}

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
  marca?: MarcaLite | null
  categoria?: CategoriaLite | null
  medias?: ProductoMedia[]
}

export type ProductoFilters = {
  q: string
  status: string
  marca_id: string
  categoria_id: string
}

type UseProductoCrudOptions = {
  initialFilters?: Partial<ProductoFilters>
  baseUrl?: string
}

// ============================================================================
// CONSTANTES
// ============================================================================

const ALL = '__all__'
let swalStyled = false

// ============================================================================
// UTILS
// ============================================================================

function isTailwindDark(): boolean {
  return document.documentElement.classList.contains('dark')
}

function toNum(v: unknown): number {
  const n = Number(String(v ?? '').trim())
  return Number.isFinite(n) ? n : NaN
}

function moneyToFixed2(v: unknown): string | null {
  const n = toNum(v)
  if (!Number.isFinite(n)) return null
  return Number(n).toFixed(2)
}

function escapeHtml(input: string): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function hasFiles(files: FileList | null | undefined): boolean {
  return Boolean(files && files.length > 0)
}

function ensureSwalTheme(): void {
  if (swalStyled) return
  swalStyled = true

  const style = document.createElement('style')
  style.innerHTML = `
    .swal2-container { z-index: 20000 !important; padding: 16px !important; }
    .swal2-backdrop-show { background: rgba(2,6,23,.65) !important; backdrop-filter: blur(10px) !important; }

    /* Popup premium (base) */
    .swal2-popup.swal2-premium {
      width: 95vw !important;
      max-width: 980px !important;
      padding: 0 !important;
      border-radius: 24px !important;
      overflow: hidden !important;
      box-shadow: 0 30px 90px rgba(0,0,0,.55) !important;
      transform: translateZ(0);
    }

    /* Breakpoints estilo Tailwind */
    @media (min-width: 640px)  { .swal2-popup.swal2-premium { width: 92vw !important; } }
    @media (min-width: 768px)  { .swal2-popup.swal2-premium { width: 760px !important; } }
    @media (min-width: 1024px) { .swal2-popup.swal2-premium { width: 920px !important; } }
    @media (min-width: 1280px) { .swal2-popup.swal2-premium { width: 980px !important; } }

    /* Tema DARK por clase (NO por prefers-color-scheme) */
    .swal2-popup.swal2-premium.pm-dark {
      background: #070A0F !important;
      color: #e4e4e7 !important;
      border: 1px solid rgba(255,255,255,.10) !important;
      color-scheme: dark;
    }

    /* Tema LIGHT por clase */
    .swal2-popup.swal2-premium.pm-light {
      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid rgba(2,6,23,.10) !important;
      box-shadow: 0 30px 90px rgba(2,6,23,.16) !important;
      color-scheme: light;
    }

    /* Header */
    .pmodal-header {
      padding: 18px 18px 14px 18px;
      border-bottom: 1px solid rgba(255,255,255,.10);
      position: relative;
      background:
        radial-gradient(1200px 240px at 0% 0%, rgba(16,185,129,.18), transparent 60%),
        linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0));
    }
    .pm-light .pmodal-header {
      border-bottom: 1px solid rgba(2,6,23,.10);
      background:
        radial-gradient(1200px 240px at 0% 0%, rgba(16,185,129,.14), transparent 60%),
        linear-gradient(180deg, rgba(2,6,23,.03), rgba(2,6,23,0));
    }
    .pmodal-title {
      margin: 0;
      font-weight: 950;
      letter-spacing: -0.03em;
      font-size: 1.25rem;
      line-height: 1.15;
    }
    .pmodal-subtitle {
      margin: .35rem 0 0 0;
      font-size: .92rem;
      opacity: .78;
      line-height: 1.45;
    }
    @media (min-width: 768px) {
      .pmodal-title { font-size: 1.45rem; }
      .pmodal-subtitle { font-size: .98rem; }
    }

    .pmodal-close {
      position: absolute;
      top: 14px;
      right: 14px;
      height: 42px;
      width: 42px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.06);
      color: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform .12s ease, background .12s ease;
      user-select:none;
    }
    .pm-light .pmodal-close {
      border-color: rgba(2,6,23,.12);
      background: rgba(2,6,23,.04);
    }
    .pmodal-close:hover { background: rgba(255,255,255,.10); transform: scale(1.02); }
    .pm-light .pmodal-close:hover { background: rgba(2,6,23,.06); }

    /* Body */
    .pmodal-body { padding: 16px 18px 18px 18px; }
    @media (min-width: 768px) { .pmodal-body { padding: 18px 22px 22px 22px; } }

    .pmodal-grid { display: grid; gap: 12px; }
    .pmodal-grid.cols-2 { grid-template-columns: 1fr; }
    @media (min-width: 768px) { .pmodal-grid.cols-2 { grid-template-columns: 1fr 1fr; } }

    .pmodal-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .02em;
      opacity: .88;
      margin-bottom: 6px;
    }
    .pmodal-chip {
      display:inline-flex;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 900;
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.06);
    }
    .pm-light .pmodal-chip {
      border-color: rgba(2,6,23,.12);
      background: rgba(2,6,23,.04);
    }

    .pmodal-input, .pmodal-select, .pmodal-textarea {
      width: 100%;
      border-radius: 14px;
      box-shadow: none;
      height: 46px;
      font-size: 16px;
      padding: .75rem 1rem;
      outline: none;
      transition: box-shadow .12s ease, border-color .12s ease, background .12s ease;
    }

    /* DARK controls */
    .pm-dark .pmodal-input, .pm-dark .pmodal-select, .pm-dark .pmodal-textarea {
      background: rgba(255,255,255,.08);
      color: #e4e4e7;
      border: 1px solid rgba(255,255,255,.15);
    }
    /* LIGHT controls */
    .pm-light .pmodal-input, .pm-light .pmodal-select, .pm-light .pmodal-textarea {
      background: #fff;
      color: #0f172a;
      border: 1px solid rgba(2,6,23,.15);
    }

    .pmodal-textarea {
      height: auto;
      min-height: 104px;
      resize: vertical;
      padding-top: .85rem;
    }

    .pmodal-input:focus, .pmodal-select:focus, .pmodal-textarea:focus {
      border-color: rgba(16,185,129,.65);
      box-shadow: 0 0 0 4px rgba(16,185,129,.18);
    }

    .pmodal-help {
      margin-top: 6px;
      font-size: 12px;
      opacity: .70;
      line-height: 1.35;
    }

    /* Select niceness (la caja). La lista de opciones es nativa, pero con color-scheme queda alineada */
    .pmodal-select {
      appearance: none;
      background-image:
        linear-gradient(45deg, transparent 50%, currentColor 50%),
        linear-gradient(135deg, currentColor 50%, transparent 50%);
      background-position:
        calc(100% - 18px) calc(50% - 3px),
        calc(100% - 12px) calc(50% - 3px);
      background-size: 6px 6px, 6px 6px;
      background-repeat: no-repeat;
      padding-right: 2.25rem;
    }

    /* Dropzone + previews */
    .pmodal-drop {
      border-radius: 18px;
      padding: 12px;
      display: grid;
      gap: 10px;
    }
    .pm-dark .pmodal-drop {
      border: 1.5px dashed rgba(255,255,255,.18);
      background: rgba(255,255,255,.05);
    }
    .pm-light .pmodal-drop {
      border: 1.5px dashed rgba(2,6,23,.14);
      background: rgba(2,6,23,.03);
    }

    .pmodal-badges { display:flex; flex-wrap:wrap; gap:8px; }
    .pmodal-badge {
      font-size: 12px;
      font-weight: 900;
      padding: 6px 10px;
      border-radius: 999px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .pm-dark .pmodal-badge { border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.06); }
    .pm-light .pmodal-badge { border: 1px solid rgba(2,6,23,.12); background: rgba(2,6,23,.04); }

    .pmodal-previews {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }
    @media (min-width: 640px) { .pmodal-previews { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
    @media (min-width: 1024px) { .pmodal-previews { grid-template-columns: repeat(8, minmax(0, 1fr)); } }

    .pmodal-thumb {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 14px;
      overflow: hidden;
    }
    .pm-dark .pmodal-thumb { border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.06); }
    .pm-light .pmodal-thumb { border: 1px solid rgba(2,6,23,.12); background: rgba(2,6,23,.04); }

    .pmodal-thumb img { width:100%; height:100%; object-fit:cover; display:block; }

    /* Footer */
    .pmodal-footer {
      padding: 14px 18px 18px 18px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      border-top: 1px solid rgba(255,255,255,.10);
      background: linear-gradient(0deg, rgba(255,255,255,.06), rgba(255,255,255,0));
    }
    .pm-light .pmodal-footer {
      border-top: 1px solid rgba(2,6,23,.10);
      background: linear-gradient(0deg, rgba(2,6,23,.03), rgba(2,6,23,0));
    }

    .pmodal-btn {
      border-radius: 14px;
      font-weight: 950;
      padding: 12px 16px;
      border: 1px solid transparent;
      cursor: pointer;
      user-select: none;
      min-width: 120px;
      transition: transform .12s ease, filter .12s ease, background .12s ease, border-color .12s ease;
    }
    .pmodal-btn:active { transform: scale(.99); }

    .pmodal-btn.cancel {
      border-color: rgba(255,255,255,.14);
      background: rgba(255,255,255,.08);
      color: inherit;
    }
    .pm-light .pmodal-btn.cancel {
      border-color: rgba(2,6,23,.10);
      background: rgba(2,6,23,.05);
    }

    .pmodal-btn.primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      border-color: rgba(16,185,129,.35);
      box-shadow: 0 18px 40px rgba(16,185,129,.18);
    }
    .pmodal-btn.primary:hover { filter: brightness(1.06); }

    /* Ocultamos actions default de Swal */
    .swal2-actions { display:none !important; }

    /* Validación */
    .swal2-validation-message {
      margin: 0 18px 18px 18px !important;
      border-radius: 14px !important;
      font-weight: 900 !important;
      padding: 12px 14px !important;
      text-align: left !important;
    }
    .pm-dark .swal2-validation-message {
      background: rgba(244,63,94,.12) !important;
      color: #fecaca !important;
      border: 1px solid rgba(244,63,94,.25) !important;
    }
    .pm-light .swal2-validation-message {
      background: rgba(244,63,94,.10) !important;
      color: #7f1d1d !important;
      border: 1px solid rgba(244,63,94,.18) !important;
    }
  `
  document.head.appendChild(style)
}

function toast(title: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
  ensureSwalTheme()
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
  })
}

// ============================================================================
// COMPOSABLE
// ============================================================================

export function useProductoCrud(options: UseProductoCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/productos'

  // ---------------------------------------------------------------------------
  // Filtros
  // ---------------------------------------------------------------------------
  const filters = reactive<ProductoFilters>({
    q: options.initialFilters?.q ?? '',
    status: options.initialFilters?.status ?? ALL,
    marca_id: options.initialFilters?.marca_id ?? ALL,
    categoria_id: options.initialFilters?.categoria_id ?? ALL,
  })

  const hasActiveFilters = computed(() => {
    return (
      Boolean(filters.q.trim()) ||
      filters.status !== ALL ||
      filters.marca_id !== ALL ||
      filters.categoria_id !== ALL
    )
  })

  function buildParams(): Record<string, string> {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.status !== ALL) params.status = filters.status
    if (filters.marca_id !== ALL) params.marca_id = filters.marca_id
    if (filters.categoria_id !== ALL) params.categoria_id = filters.categoria_id
    return params
  }

  function applyFilters(): void {
    router.get(baseUrl, buildParams(), {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    })
  }

  function resetFilters(): void {
    filters.q = ''
    filters.status = ALL
    filters.marca_id = ALL
    filters.categoria_id = ALL
    applyFilters()
  }

  let debounceTimer: number | null = null
  watch(
    () => ({ ...filters }),
    () => {
      if (debounceTimer) window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => applyFilters(), 350)
    },
    { deep: true }
  )

  // ---------------------------------------------------------------------------
  // Modal Alta/Edición centrado (Premium)
  // ---------------------------------------------------------------------------
  async function openForm(
    meta: { marcas: MarcaLite[]; categorias: CategoriaLite[] },
    producto?: Producto
  ): Promise<void> {
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
      : {
          id: 0,
          marca_id: 0,
          categoria_id: 0,
          sku: '',
          nombre: '',
          descripcion: '',
          stock: 0,
          costo_lista: '',
          precio_venta: '',
        }

    const marcasOptions = meta.marcas
      .map(
        (m) =>
          `<option value="${m.id}" ${current.marca_id === m.id ? 'selected' : ''}>${escapeHtml(m.nombre)}</option>`
      )
      .join('')

    const categoriasOptions = meta.categorias
      .map(
        (c) =>
          `<option value="${c.id}" ${current.categoria_id === c.id ? 'selected' : ''}>${escapeHtml(c.nombre)}</option>`
      )
      .join('')

    const title = isEdit ? 'Editar producto' : 'Nuevo producto'
    let payload:
      | {
          marca_id: number
          categoria_id: number
          sku: string
          nombre: string
          descripcion: string | null
          stock: number
          costo_lista: string
          precio_venta: string
          status: 'activo'
          fotos: FileList | null
        }
      | null = null

    const html = `
      <div class="pmodal-header">
        <button type="button" class="pmodal-close" aria-label="Cerrar" data-close>✕</button>
        <h2 class="pmodal-title">${escapeHtml(title)}</h2>
      </div>

      <div class="pmodal-body">
        <div class="pmodal-grid cols-2">
          <div>
            <label class="pmodal-label">Marca <span class="pmodal-chip">obligatorio</span></label>
            <select id="p_marca" class="pmodal-select">
              <option value="">Seleccione una marca</option>
              ${marcasOptions}
            </select>
          </div>

          <div>
            <label class="pmodal-label">Categoría <span class="pmodal-chip">obligatorio</span></label>
            <select id="p_categoria" class="pmodal-select">
              <option value="">Seleccione una categoría</option>
              ${categoriasOptions}
            </select>
          </div>
        </div>

        <div class="pmodal-grid cols-2" style="margin-top:12px;">
          <div>
            <label class="pmodal-label">SKU <span class="pmodal-chip">obligatorio</span></label>
            <input id="p_sku" class="pmodal-input" placeholder="Ej: PROD-001" value="${escapeHtml(current.sku)}">
            <div class="pmodal-help">Clave única interna del catálogo.</div>
          </div>

          <div>
            <label class="pmodal-label">Stock <span class="pmodal-chip">obligatorio</span></label>
            <input id="p_stock" class="pmodal-input" type="number" min="0" step="1" placeholder="0" value="${escapeHtml(String(current.stock))}">
            <div class="pmodal-help">Inventario actual.</div>
          </div>
        </div>

        <div style="margin-top:12px;">
          <label class="pmodal-label">Nombre <span class="pmodal-chip">obligatorio</span></label>
          <input id="p_nombre" class="pmodal-input" placeholder="Nombre del producto" value="${escapeHtml(current.nombre)}">
        </div>

        <div style="margin-top:12px;">
          <label class="pmodal-label">Descripción</label>
          <textarea id="p_descripcion" class="pmodal-textarea" placeholder="Describe el producto...">${escapeHtml(current.descripcion)}</textarea>
        </div>

        <div class="pmodal-grid cols-2" style="margin-top:12px;">
          <div>
            <label class="pmodal-label">Costo lista <span class="pmodal-chip">obligatorio</span></label>
            <input id="p_costo" class="pmodal-input" type="number" min="0" step="0.01" placeholder="0.00" value="${escapeHtml(current.costo_lista)}">
          </div>

          <div>
            <label class="pmodal-label">Precio venta <span class="pmodal-chip">obligatorio</span></label>
            <input id="p_precio" class="pmodal-input" type="number" min="0" step="0.01" placeholder="0.00" value="${escapeHtml(current.precio_venta)}">
          </div>
        </div>

        <div class="pmodal-drop" style="margin-top:14px;">
          <div>
            <div style="font-weight:950; letter-spacing:-0.01em;">Fotos del producto (opcional)</div>
            <div class="pmodal-help">Selecciona imágenes. Si no eliges nada, no se sube nada.</div>
          </div>

          <input id="p_fotos" type="file" accept="image/*" multiple class="pmodal-input" style="height:auto; padding:.7rem 1rem;" />

          <div id="p_fotos_badges" class="pmodal-badges" style="display:none;"></div>
          <div id="p_fotos_previews" class="pmodal-previews" style="display:none;"></div>
        </div>
      </div>

      <div class="pmodal-footer">
        <button type="button" class="pmodal-btn cancel" data-cancel>Cancelar</button>
        <button type="button" class="pmodal-btn primary" data-confirm>${isEdit ? 'Guardar' : 'Crear'}</button>
      </div>
    `

    const themeClass = isTailwindDark() ? 'pm-dark' : 'pm-light'
    let previewUrls: string[] = []

    await Swal.fire({
      html,
      customClass: { popup: `swal2-premium ${themeClass}` },
      showConfirmButton: false,
      showCancelButton: false,
      allowOutsideClick: true,
      allowEscapeKey: true,
      didOpen: () => {
        const popup = Swal.getPopup()
        if (!popup) return

        const closeBtn = popup.querySelector('[data-close]')
        const cancelBtn = popup.querySelector('[data-cancel]')
        const confirmBtn = popup.querySelector('[data-confirm]')

        const cleanupPreviews = () => {
          previewUrls.forEach((u) => URL.revokeObjectURL(u))
          previewUrls = []
        }

        closeBtn?.addEventListener('click', () => {
          cleanupPreviews()
          Swal.close()
        })
        cancelBtn?.addEventListener('click', () => {
          cleanupPreviews()
          Swal.close()
        })

        const fotosInput = document.getElementById('p_fotos') as HTMLInputElement | null
        const badges = document.getElementById('p_fotos_badges') as HTMLDivElement | null
        const previews = document.getElementById('p_fotos_previews') as HTMLDivElement | null

        const renderBadgesAndPreviews = () => {
          if (!fotosInput || !badges || !previews) return
          cleanupPreviews()

          const files = fotosInput.files
          if (!files || files.length === 0) {
            badges.style.display = 'none'
            badges.innerHTML = ''
            previews.style.display = 'none'
            previews.innerHTML = ''
            return
          }

          // badges
          badges.style.display = 'flex'
          badges.innerHTML = Array.from(files)
            .map((f) => `<span class="pmodal-badge">${escapeHtml(f.name)}</span>`)
            .join('')

          // previews (miniaturas)
          previews.style.display = 'grid'
          previews.innerHTML = Array.from(files)
            .slice(0, 16) // límite sano para no reventar UI
            .map((f) => {
              const url = URL.createObjectURL(f)
              previewUrls.push(url)
              return `<div class="pmodal-thumb"><img src="${url}" alt="${escapeHtml(f.name)}" /></div>`
            })
            .join('')
        }

        fotosInput?.addEventListener('change', renderBadgesAndPreviews)
        renderBadgesAndPreviews()

        // Focus
        const focusEl = document.getElementById(isEdit ? 'p_nombre' : 'p_sku') as HTMLInputElement | null
        focusEl?.focus()
        focusEl?.select()

        confirmBtn?.addEventListener('click', () => {
          const marca_id = toNum((document.getElementById('p_marca') as HTMLSelectElement).value)
          const categoria_id = toNum((document.getElementById('p_categoria') as HTMLSelectElement).value)
          const sku = (document.getElementById('p_sku') as HTMLInputElement).value.trim()
          const nombre = (document.getElementById('p_nombre') as HTMLInputElement).value.trim()
          const descripcion = (document.getElementById('p_descripcion') as HTMLTextAreaElement).value.trim()
          const stock = toNum((document.getElementById('p_stock') as HTMLInputElement).value)
          const costo_lista = moneyToFixed2((document.getElementById('p_costo') as HTMLInputElement).value)
          const precio_venta = moneyToFixed2((document.getElementById('p_precio') as HTMLInputElement).value)
          const fotos = (document.getElementById('p_fotos') as HTMLInputElement | null)?.files ?? null

          const errors: string[] = []
          if (!Number.isFinite(marca_id) || marca_id <= 0) errors.push('Selecciona una marca válida')
          if (!Number.isFinite(categoria_id) || categoria_id <= 0) errors.push('Selecciona una categoría válida')
          if (!sku) errors.push('El SKU es obligatorio')
          if (!nombre) errors.push('El nombre es obligatorio')
          if (!Number.isFinite(stock) || stock < 0) errors.push('El stock debe ser un número válido (>= 0)')
          if (costo_lista === null) errors.push('El costo lista debe ser un número válido')
          if (precio_venta === null) errors.push('El precio venta debe ser un número válido')

          if (costo_lista !== null && precio_venta !== null) {
            const costo = Number(costo_lista)
            const precio = Number(precio_venta)
            if (precio < costo) errors.push('El precio de venta no puede ser menor al costo')
          }

          if (errors.length) {
            Swal.showValidationMessage(errors.join('<br>'))
            return
          }

          payload = {
            marca_id,
            categoria_id,
            sku,
            nombre,
            descripcion: descripcion || null,
            stock,
            costo_lista,
            precio_venta,
            status: 'activo',
            fotos,
          }

          cleanupPreviews()
          Swal.close()
        })
      },
      willClose: () => {
        // doble seguro por si cierran con ESC o click fuera
        previewUrls.forEach((u) => URL.revokeObjectURL(u))
        previewUrls = []
      },
    })

    if (!payload) return

    const baseData = {
      marca_id: payload.marca_id,
      categoria_id: payload.categoria_id,
      sku: payload.sku,
      nombre: payload.nombre,
      descripcion: payload.descripcion ?? null,
      stock: payload.stock,
      costo_lista: String(payload.costo_lista),
      precio_venta: String(payload.precio_venta),
      status: payload.status,
    }

    const fotos = payload.fotos
    const withFotos = hasFiles(fotos)

    if (isEdit) {
      const id = Number(producto!.id)

      if (withFotos) {
        const fd = new FormData()
        Object.entries(baseData).forEach(([k, v]) => fd.append(k, String(v ?? '')))
        fd.append('_method', 'PUT')
        Array.from(fotos as FileList).forEach((f) => fd.append('fotos[]', f))

        router.post(`${baseUrl}/${id}`, fd, {
          preserveScroll: true,
          preserveState: true,
          forceFormData: true,
          onSuccess: () => toast('Producto actualizado', 'success'),
          onError: () => toast('Revisa los campos', 'error'),
        })
        return
      }

      router.put(`${baseUrl}/${id}`, baseData, {
        preserveScroll: true,
        onSuccess: () => toast('Producto actualizado', 'success'),
        onError: () => toast('Revisa los campos', 'error'),
      })
      return
    }

    if (withFotos) {
      const fd = new FormData()
      Object.entries(baseData).forEach(([k, v]) => fd.append(k, String(v ?? '')))
      Array.from(fotos as FileList).forEach((f) => fd.append('fotos[]', f))

      router.post(baseUrl, fd, {
        preserveScroll: true,
        preserveState: true,
        forceFormData: true,
        onSuccess: () => toast('Producto creado', 'success'),
        onError: () => toast('Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, baseData, {
      preserveScroll: true,
      onSuccess: () => toast('Producto creado', 'success'),
      onError: () => toast('Revisa los campos', 'error'),
    })
  }

  // ---------------------------------------------------------------------------
  // Activar / desactivar
  // ---------------------------------------------------------------------------
  async function deactivate(p: Producto): Promise<void> {
    ensureSwalTheme()

    const themeClass = isTailwindDark() ? 'pm-dark' : 'pm-light'

    const { isConfirmed } = await Swal.fire({
      title: 'Desactivar producto',
      html: `
        <div style="text-align:left; padding:.5rem 0;">
          <p style="font-weight:950; margin-bottom:.25rem;">Confirmación requerida</p>
          <p style="opacity:.82; font-size:.95rem; line-height:1.5;">
            El producto <strong>${escapeHtml(p.nombre)}</strong> se marcará como inactivo.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: { popup: `swal2-premium ${themeClass}` },
    })

    if (!isConfirmed) return

    router.delete(`${baseUrl}/${p.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Producto desactivado', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  async function activate(p: Producto): Promise<void> {
    ensureSwalTheme()

    const themeClass = isTailwindDark() ? 'pm-dark' : 'pm-light'

    const { isConfirmed } = await Swal.fire({
      title: 'Activar producto',
      html: `
        <div style="text-align:left; padding:.5rem 0;">
          <p style="font-weight:950; margin-bottom:.25rem;">Confirmación requerida</p>
          <p style="opacity:.82; font-size:.95rem; line-height:1.5;">
            El producto <strong>${escapeHtml(p.nombre)}</strong> volverá a estar activo.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: { popup: `swal2-premium ${themeClass}` },
    })

    if (!isConfirmed) return

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
        status: 'activo',
      },
      {
        preserveScroll: true,
        onSuccess: () => toast('Producto activado', 'success'),
        onError: () => toast('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(p: Producto): Promise<void> {
    return p.status === 'activo' ? deactivate(p) : activate(p)
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
    toast,
  }
}
