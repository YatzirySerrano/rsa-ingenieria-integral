/* 
  COMPOSABLE: useProductoCrud.ts
  ===============================
  
  Descripción:
  - Composable Vue 3 para gestión completa de productos (CRUD)
  - Incluye: Filtros con debounce, modales con SweetAlert2
  - Tema oscuro/claro responsivo para SweetAlert2
  - Tipado completo con TypeScript
*/

import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

// ============================================================================
// DEFINICIÓN DE TIPOS
// ============================================================================

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
  marca?: MarcaLite | null
  categoria?: CategoriaLite | null
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
// FUNCIONES DE UTILIDAD
// ============================================================================

function toNum(v: unknown): number {
  const n = Number(String(v ?? '').trim())
  return Number.isFinite(n) ? n : NaN
}

function moneyToFixed2(v: unknown): string | null {
  const n = toNum(v)
  if (!Number.isFinite(n)) return null
  return Number(n).toFixed(2)
}

function ensureSwalTheme(): void {
  if (swalStyled) return
  swalStyled = true

  const style = document.createElement('style')
  style.innerHTML = `
    .swal2-container { 
      z-index: 20000 !important; 
      padding: 1rem !important;
    }
    
    .swal2-popup {
      background: #0b0c10 !important;
      color: #e4e4e7 !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 20px !important;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5) !important;
      padding: 1.5rem !important;
      max-width: 90vw !important;
      margin: 0.5rem !important;
    }
    
    .swal2-title { 
      font-weight: 900 !important; 
      letter-spacing: -0.02em !important;
      font-size: 1.5rem !important;
      margin-bottom: 1rem !important;
    }
    
    .swal2-html-container { 
      color: rgba(228, 228, 231, 0.85) !important;
      font-size: 0.95rem !important;
      line-height: 1.5 !important;
    }
    
    .swal2-input, .swal2-select, .swal2-textarea {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #e4e4e7 !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 12px !important;
      box-shadow: none !important;
      height: 46px !important;
      font-size: 16px !important;
      padding: 0.75rem 1rem !important;
      transition: all 0.2s ease !important;
    }
    
    .swal2-textarea {
      height: auto !important;
      min-height: 100px !important;
      padding-top: 0.75rem !important;
      padding-bottom: 0.75rem !important;
      resize: vertical !important;
    }
    
    .swal2-input:focus, .swal2-select:focus, .swal2-textarea:focus {
      border-color: rgba(16, 185, 129, 0.6) !important;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2) !important;
      outline: none !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }
    
    .swal2-confirm {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: #ffffff !important;
      border-radius: 12px !important;
      font-weight: 800 !important;
      padding: 0.75rem 1.5rem !important;
      border: none !important;
      transition: all 0.2s ease !important;
      font-size: 0.95rem !important;
    }
    
    .swal2-confirm:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3) !important;
    }
    
    .swal2-cancel {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #e4e4e7 !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 12px !important;
      font-weight: 700 !important;
      padding: 0.75rem 1.5rem !important;
      transition: all 0.2s ease !important;
      font-size: 0.95rem !important;
    }
    
    .swal2-cancel:hover {
      background: rgba(255, 255, 255, 0.12) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
      transform: translateY(-2px) !important;
    }
    
    .swal2-select option {
      background: #0b0c10 !important;
      color: #e4e4e7 !important;
      padding: 0.75rem !important;
    }
    
    @media (max-width: 768px) {
      .swal2-popup {
        width: 95% !important;
        padding: 1.25rem !important;
        margin: 0.25rem !important;
      }
      
      .swal2-title {
        font-size: 1.25rem !important;
      }
      
      .swal2-html-container {
        font-size: 0.9rem !important;
      }
      
      .swal2-input, .swal2-select, .swal2-textarea {
        height: 44px !important;
        font-size: 16px !important;
        padding: 0.5rem 0.75rem !important;
      }
      
      .swal2-textarea {
        min-height: 80px !important;
      }
      
      .swal2-confirm, .swal2-cancel {
        padding: 0.625rem 1.25rem !important;
        font-size: 0.9rem !important;
      }
    }
    
    @media (max-width: 480px) {
      .swal2-popup {
        width: 100% !important;
        border-radius: 16px !important;
        padding: 1rem !important;
      }
      
      .swal2-title {
        font-size: 1.1rem !important;
        margin-bottom: 0.75rem !important;
      }
      
      .swal2-buttons {
        flex-direction: column !important;
        gap: 0.5rem !important;
      }
      
      .swal2-confirm, .swal2-cancel {
        width: 100% !important;
        margin: 0 !important;
      }
    }
    
    @media (prefers-color-scheme: light) {
      .swal2-popup {
        background: #ffffff !important;
        color: #0f172a !important;
        border: 1px solid rgba(2, 6, 23, 0.1) !important;
        box-shadow: 0 25px 50px rgba(2, 6, 23, 0.15) !important;
      }
      
      .swal2-html-container { 
        color: rgba(15, 23, 42, 0.75) !important;
      }
      
      .swal2-input, .swal2-select, .swal2-textarea {
        background: #ffffff !important;
        color: #0f172a !important;
        border: 1px solid rgba(2, 6, 23, 0.15) !important;
      }
      
      .swal2-input:focus, .swal2-select:focus, .swal2-textarea:focus {
        border-color: rgba(16, 185, 129, 0.5) !important;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
      }
      
      .swal2-cancel {
        background: rgba(2, 6, 23, 0.05) !important;
        color: #0f172a !important;
        border: 1px solid rgba(2, 6, 23, 0.1) !important;
      }
      
      .swal2-cancel:hover {
        background: rgba(2, 6, 23, 0.08) !important;
      }
      
      .swal2-select option {
        background: #ffffff !important;
        color: #0f172a !important;
      }
    }
  `
  document.head.appendChild(style)
}

// ============================================================================
// COMPOSABLE PRINCIPAL
// ============================================================================

export function useProductoCrud(options: UseProductoCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/productos'

  // ==========================================================================
  // ESTADOS REACTIVOS
  // ==========================================================================

  const filters = reactive<ProductoFilters>({
    q: options.initialFilters?.q ?? '',
    status: options.initialFilters?.status ?? ALL,
    marca_id: options.initialFilters?.marca_id ?? ALL,
    categoria_id: options.initialFilters?.categoria_id ?? ALL,
  })

  // ==========================================================================
  // COMPUTED PROPERTIES
  // ==========================================================================

  const hasActiveFilters = computed(() => {
    return (
      Boolean(filters.q.trim()) ||
      filters.status !== ALL ||
      filters.marca_id !== ALL ||
      filters.categoria_id !== ALL
    )
  })

  // ==========================================================================
  // FUNCIONES DE FILTRADO
  // ==========================================================================

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

  // ==========================================================================
  // WATCHER PARA DEBOUNCE
  // ==========================================================================

  let debounceTimer: number | null = null

  watch(
    () => ({ ...filters }),
    () => {
      if (debounceTimer) window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => applyFilters(), 350)
    },
    { deep: true }
  )

  // ==========================================================================
  // FUNCIONES CRUD
  // ==========================================================================

  async function openForm(
    meta: {
      marcas: MarcaLite[]
      categorias: CategoriaLite[]
    },
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
      : null

    const marcasOptions = meta.marcas
      .map((m) => `<option value="${m.id}" ${current?.marca_id === m.id ? 'selected' : ''}>${m.nombre}</option>`)
      .join('')

    const categoriasOptions = meta.categorias
      .map((c) => `<option value="${c.id}" ${current?.categoria_id === c.id ? 'selected' : ''}>${c.nombre}</option>`)
      .join('')

    const html = `
      <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-top: 0.5rem;">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="font-size: 12px; font-weight: 800; opacity: 0.85; margin-bottom: 0.25rem; display: block;">
              Marca *
            </label>
            <select id="p_marca" class="swal2-select" style="width: 100%;">
              <option value="">Seleccione una marca</option>
              ${marcasOptions}
            </select>
          </div>
          
          <div>
            <label style="font-size: 12px; font-weight: 800; opacity: 0.85; margin-bottom: 0.25rem; display: block;">
              Categoría *
            </label>
            <select id="p_categoria" class="swal2-select" style="width: 100%;">
              <option value="">Seleccione una categoría</option>
              ${categoriasOptions}
            </select>
          </div>
        </div>
        
        <div>
          <label style="font-size: 12px; font-weight: 800; opacity: 0.85; margin-bottom: 0.25rem; display: block;">
            SKU *
          </label>
          <input id="p_sku" class="swal2-input" placeholder="Ej: PROD-001" value="${current?.sku ?? ''}">
        </div>
        
        <div>
          <label style="font-size: 12px; font-weight: 800; opacity: 0.85; margin-bottom: 0.25rem; display: block;">
            Nombre del Producto *
          </label>
          <input id="p_nombre" class="swal2-input" placeholder="Nombre completo del producto" 
                 value="${current?.nombre ?? ''}">
        </div>
        
        <div>
          <label style="font-size: 12px; font-weight: 800; opacity: 0.85; margin-bottom: 0.25rem; display: block;">
            Descripción
          </label>
          <textarea id="p_descripcion" class="swal2-textarea" 
                    placeholder="Describe el producto...">${current?.descripcion ?? ''}</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div>
            <label style="font-size: 12px; font-weight: 800; opacity: 0.85; margin-bottom: 0.25rem; display: block;">
              Stock *
            </label>
            <input id="p_stock" class="swal2-input" type="number" min="0" step="1" 
                   placeholder="0" value="${current?.stock ?? 0}">
          </div>
          
          <div>
            <label style="font-size: 12px; font-weight: 800; opacity: 0.85; margin-bottom: 0.25rem; display: block;">
              Costo Lista *
            </label>
            <input id="p_costo" class="swal2-input" type="number" min="0" step="0.01" 
                   placeholder="0.00" value="${current?.costo_lista ?? ''}">
          </div>
          
          <div>
            <label style="font-size: 12px; font-weight: 800; opacity: 0.85; margin-bottom: 0.25rem; display: block;">
              Precio Venta *
            </label>
            <input id="p_precio" class="swal2-input" type="number" min="0" step="0.01" 
                   placeholder="0.00" value="${current?.precio_venta ?? ''}">
          </div>
        </div>
        
        <p style="margin-top: 0.5rem; font-size: 12px; opacity: 0.7;">
          * Campos obligatorios. El estado se gestiona desde el listado.
        </p>
      </div>
    `

    const { value } = await Swal.fire({
      title: isEdit ? '✏️ Editar Producto' : '🆕 Nuevo Producto',
      html: html,
      width: '800px',
      didOpen: () => {
        const el = document.getElementById(isEdit ? 'p_nombre' : 'p_sku') as HTMLInputElement
        el?.focus()
        el?.select()
      },
      showCancelButton: true,
      confirmButtonText: isEdit ? '💾 Actualizar' : '✨ Crear',
      cancelButtonText: '❌ Cancelar',
      reverseButtons: true,
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

        const errors: string[] = []

        if (!Number.isFinite(marca_id) || marca_id <= 0) {
          errors.push('Selecciona una marca válida')
        }

        if (!Number.isFinite(categoria_id) || categoria_id <= 0) {
          errors.push('Selecciona una categoría válida')
        }

        if (!sku) {
          errors.push('El SKU es obligatorio')
        }

        if (!nombre) {
          errors.push('El nombre es obligatorio')
        }

        if (!Number.isFinite(stock) || stock < 0) {
          errors.push('El stock debe ser un número válido (>= 0)')
        }

        if (costo_lista === null) {
          errors.push('El costo lista debe ser un número válido')
        }

        if (precio_venta === null) {
          errors.push('El precio venta debe ser un número válido')
        }

        if (costo_lista !== null && precio_venta !== null) {
          const costo = Number(costo_lista)
          const precio = Number(precio_venta)
          if (precio < costo) {
            errors.push('El precio de venta no puede ser menor al costo')
          }
        }

        if (errors.length > 0) {
          Swal.showValidationMessage(errors.join('<br>'))
          return
        }

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
        onSuccess: () => toast('✅ Producto actualizado', 'success'),
        onError: () => toast('❌ Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onSuccess: () => toast('✅ Producto creado', 'success'),
      onError: () => toast('❌ Revisa los campos', 'error'),
    })
  }

  // ==========================================================================
  // FUNCIONES DE GESTIÓN DE ESTADO
  // ==========================================================================

  async function deactivate(p: Producto): Promise<void> {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: '⚠️ Desactivar Producto',
      html: `
        <div style="text-align: center; padding: 1rem;">
          <div style="font-size: 4rem; color: #f59e0b; margin-bottom: 1rem;">⚠️</div>
          <p style="font-weight: 600; margin-bottom: 0.5rem;">¿Estás seguro?</p>
          <p style="opacity: 0.8; font-size: 0.9rem;">
            El producto <strong>"${p.nombre}"</strong> se marcará como inactivo.
            <br>
            <small style="opacity: 0.6;">(Esta acción es reversible)</small>
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })

    if (!isConfirmed) return

    router.delete(`${baseUrl}/${p.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('✅ Producto desactivado', 'success'),
      onError: () => toast('❌ No se pudo desactivar', 'error'),
    })
  }

  async function activate(p: Producto): Promise<void> {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: '🔄 Reactivar Producto',
      html: `
        <div style="text-align: center; padding: 1rem;">
          <div style="font-size: 4rem; color: #10b981; margin-bottom: 1rem;">✅</div>
          <p style="font-weight: 600; margin-bottom: 0.5rem;">¿Activar producto?</p>
          <p style="opacity: 0.8; font-size: 0.9rem;">
            El producto <strong>"${p.nombre}"</strong> volverá a estar disponible.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
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
        onSuccess: () => toast('✅ Producto activado', 'success'),
        onError: () => toast('❌ No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(p: Producto): Promise<void> {
    return p.status === 'activo' ? deactivate(p) : activate(p)
  }

  // ==========================================================================
  // FUNCIONES DE NOTIFICACIÓN
  // ==========================================================================

  function toast(title: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    ensureSwalTheme()

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    })
  }

  // ==========================================================================
  // RETORNO DEL COMPOSABLE
  // ==========================================================================

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