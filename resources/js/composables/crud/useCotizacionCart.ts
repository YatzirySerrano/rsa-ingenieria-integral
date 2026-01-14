// resources/js/composables/crud/useCotizacionCart.ts
import Swal from 'sweetalert2'
import { computed, type ComputedRef } from 'vue'
import { router } from '@inertiajs/vue3'

type Detalle = {
  id: number
  producto_id?: number | null
  servicio_id?: number | null
  cantidad: number | string
  precio_unitario: number | string
  total_linea: number | string
  status: 'activo' | 'inactivo'
  producto?: { id: number; sku?: string | null; nombre: string } | null
  servicio?: { id: number; nombre: string } | null
}

type Cotizacion = {
  id: number
  folio: string
  estatus: string
  email_destino?: string | null
  telefono_destino?: string | null
  subtotal: number | string
  total: number | string
  status: 'activo' | 'inactivo'
  detalles?: Detalle[]
}

type Options = {
  baseUrl: string
  cotizacion: ComputedRef<Cotizacion>
}

/**
 * Tema de Swal (dark + fallback light)
 * - Igual que en tu estilo actual para consistencia visual.
 */
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
      border:1px solid rgba(255,255,255,.08) !important;
      border-radius:18px !important;
      box-shadow:0 25px 90px rgba(0,0,0,.55) !important;
      padding: 1.05rem 1.05rem .95rem !important;
    }
    .swal2-title{ font-weight: 900 !important; letter-spacing: -0.02em !important; font-size:1.15rem !important; }
    .swal2-html-container{ color: rgba(228,228,231,.85) !important; font-size:.92rem !important; }
    .swal2-input, .swal2-select, .swal2-textarea{
      background: rgba(255,255,255,.06) !important;
      color:#e4e4e7 !important;
      border:1px solid rgba(255,255,255,.14) !important;
      border-radius: 12px !important;
      box-shadow: none !important;
      height: 42px !important;
      margin: .35rem 0 0 !important;
    }
    .swal2-textarea{ height:auto !important; min-height: 88px !important; padding-top: 10px !important; }
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
    .swal2-select option{ background:#0b0c10 !important; color:#e4e4e7 !important; }
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
      .swal2-select option{ background:#ffffff !important; color:#0f172a !important; }
    }
  `
  document.head.appendChild(style)
}

function money(v: number | string | null | undefined) {
  const n = Number(v ?? 0)
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

export function useCotizacionCart({ baseUrl, cotizacion }: Options) {
  const detallesActivos = computed(() => (cotizacion.value.detalles ?? []).filter(d => d.status === 'activo'))

  function itemLabel(d: Detalle) {
    if (d.producto) return `${d.producto.sku ? d.producto.sku + ' · ' : ''}${d.producto.nombre}`
    if (d.servicio) return d.servicio.nombre
    return 'Ítem'
  }

  /**
   * Agregar item:
   * - Lo ideal: ofrecer selector con búsqueda (shadcn combobox) y catálogo.
   * - Como tú pediste “rápido y funcional” sin meter pipeline: pedimos IDs.
   *
   * Si quieres, luego lo dejamos pro: buscador con catálogos en meta.
   */
  async function openAddItem() {
    ensureSwalTheme()

    const { value } = await Swal.fire({
      title: 'Agregar al carrito',
      html: `
        <div style="text-align:left; margin-top:.15rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Tipo
          </label>
          <div style="display:flex; gap:.5rem;">
            <button id="t_prod" type="button" style="flex:1; padding:.55rem .7rem; border-radius:12px; font-weight:900; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.06); color:#e4e4e7;">Producto</button>
            <button id="t_serv" type="button" style="flex:1; padding:.55rem .7rem; border-radius:12px; font-weight:900; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.03); color:#e4e4e7; opacity:.85;">Servicio</button>
          </div>
          <input id="tipo" type="hidden" value="PRODUCTO" />
        </div>

        <div style="text-align:left; margin-top:.75rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            ID del producto/servicio
          </label>
          <input id="item_id" class="swal2-input" placeholder="Ej. 12">
        </div>

        <div style="text-align:left; margin-top:.75rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Cantidad
          </label>
          <input id="cantidad" class="swal2-input" placeholder="Ej. 1" value="1">
        </div>

        <div style="margin-top:.75rem; font-size:12px; opacity:.85; text-align:left;">
          El precio se toma del catálogo actual.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      didOpen: () => {
        const prod = document.getElementById('t_prod') as HTMLButtonElement
        const serv = document.getElementById('t_serv') as HTMLButtonElement
        const tipo = document.getElementById('tipo') as HTMLInputElement

        function setTipo(v: 'PRODUCTO' | 'SERVICIO') {
          tipo.value = v
          if (v === 'PRODUCTO') {
            prod.style.background = 'rgba(255,255,255,.06)'
            prod.style.opacity = '1'
            serv.style.background = 'rgba(255,255,255,.03)'
            serv.style.opacity = '.85'
          } else {
            serv.style.background = 'rgba(255,255,255,.06)'
            serv.style.opacity = '1'
            prod.style.background = 'rgba(255,255,255,.03)'
            prod.style.opacity = '.85'
          }
        }

        prod.onclick = () => setTipo('PRODUCTO')
        serv.onclick = () => setTipo('SERVICIO')

        ;(document.getElementById('item_id') as HTMLInputElement)?.focus()
      },
      preConfirm: () => {
        const tipo = (document.getElementById('tipo') as HTMLInputElement).value as 'PRODUCTO' | 'SERVICIO'
        const id = (document.getElementById('item_id') as HTMLInputElement).value.trim()
        const cantidadRaw = (document.getElementById('cantidad') as HTMLInputElement).value.trim()

        const cantidad = Number(cantidadRaw)
        if (!id || !/^\d+$/.test(id)) {
          Swal.showValidationMessage('Pon un ID válido.')
          return
        }
        if (!cantidadRaw || Number.isNaN(cantidad) || cantidad <= 0) {
          Swal.showValidationMessage('Cantidad inválida.')
          return
        }

        return { tipo, id: Number(id), cantidad }
      },
    })

    if (!value) return

    const payload: Record<string, any> = {
      tipo: value.tipo,
      cantidad: value.cantidad,
      producto_id: value.tipo === 'PRODUCTO' ? value.id : null,
      servicio_id: value.tipo === 'SERVICIO' ? value.id : null,
    }

    router.post(`${baseUrl}/${cotizacion.value.id}/add-item`, payload, {
      preserveScroll: true,
      onSuccess: () => toast('Agregado al carrito', 'success'),
      onError: (errors) => showErrors('No se pudo agregar', errors),
    })
  }

  async function openEditDetalle(d: Detalle) {
    ensureSwalTheme()

    const { value } = await Swal.fire({
      title: 'Editar ítem',
      html: `
        <div style="text-align:left; margin-top:.15rem;">
          <div style="font-weight:900; margin-bottom:.25rem;">${itemLabel(d)}</div>
          <div style="font-size:12px; opacity:.85;">Ajusta cantidad y/o precio si aplica.</div>
        </div>

        <div style="text-align:left; margin-top:.75rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Cantidad
          </label>
          <input id="cantidad" class="swal2-input" value="${String(d.cantidad)}">
        </div>

        <div style="text-align:left; margin-top:.75rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Precio unitario
          </label>
          <input id="precio" class="swal2-input" value="${String(d.precio_unitario)}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      didOpen: () => (document.getElementById('cantidad') as HTMLInputElement)?.focus(),
      preConfirm: () => {
        const cantidadRaw = (document.getElementById('cantidad') as HTMLInputElement).value.trim()
        const precioRaw = (document.getElementById('precio') as HTMLInputElement).value.trim()

        const cantidad = Number(cantidadRaw)
        const precio = Number(precioRaw)

        if (!cantidadRaw || Number.isNaN(cantidad) || cantidad <= 0) {
          Swal.showValidationMessage('Cantidad inválida.')
          return
        }
        if (!precioRaw || Number.isNaN(precio) || precio < 0) {
          Swal.showValidationMessage('Precio inválido.')
          return
        }

        return { cantidad, precio_unitario: precio }
      },
    })

    if (!value) return

    router.put(`/cotizacion-detalles/${d.id}`, value, {
      preserveScroll: true,
      onSuccess: () => toast('Ítem actualizado', 'success'),
      onError: (errors) => showErrors('No se pudo actualizar', errors),
    })
  }

  async function removeDetalle(d: Detalle) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Quitar ítem',
      text: 'Se eliminará del carrito.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Quitar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    router.delete(`/cotizacion-detalles/${d.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Ítem eliminado', 'success'),
      onError: () => toast('No se pudo eliminar', 'error'),
    })
  }

  async function openSend() {
    ensureSwalTheme()

    const { value } = await Swal.fire({
      title: 'Enviar cotización',
      html: `
        <div style="text-align:left; margin-top:.15rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Correo (opcional)
          </label>
          <input id="email" class="swal2-input" placeholder="cliente@correo.com" value="${cotizacion.value.email_destino ?? ''}">
        </div>

        <div style="text-align:left; margin-top:.75rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Teléfono (opcional)
          </label>
          <input id="tel" class="swal2-input" placeholder="Ej. 7771234567" value="${cotizacion.value.telefono_destino ?? ''}">
        </div>

        <div style="margin-top:.75rem; font-size:12px; opacity:.85; text-align:left;">
          Al enviar, se marcará como <b>ENVIADA</b>.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const email = (document.getElementById('email') as HTMLInputElement).value.trim()
        const telefono = (document.getElementById('tel') as HTMLInputElement).value.trim()

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Correo inválido.')
          return
        }

        return { email_destino: email || null, telefono_destino: telefono || null }
      },
    })

    if (!value) return

    router.post(`${baseUrl}/${cotizacion.value.id}/send`, value, {
      preserveScroll: true,
      onSuccess: () => toast('Cotización enviada', 'success'),
      onError: (errors) => showErrors('No se pudo enviar', errors),
    })
  }

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

  function showErrors(title: string, errors: Record<string, any>) {
    const list = Object.entries(errors ?? {})
      .map(([k, v]) => `• ${k}: ${String(v)}`)
      .join('<br>')

    Swal.fire({
      icon: 'error',
      title,
      html: list || 'El servidor rechazó la solicitud.',
      confirmButtonText: 'Entendido',
    })
  }

  return {
    detallesActivos,
    money,
    itemLabel,

    openAddItem,
    openEditDetalle,
    removeDetalle,
    openSend,
  }
}
