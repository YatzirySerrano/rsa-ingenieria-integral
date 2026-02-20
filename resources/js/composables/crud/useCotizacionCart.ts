import { computed, type ComputedRef } from 'vue'
import { router } from '@inertiajs/vue3'
import { swalConfirm, swalErr, swalNotify } from '@/lib/swal'

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
  token: string
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

  async function openAddItem() {
    const { value } = await (await import('sweetalert2')).default.fire({
      title: 'Agregar item',
      input: 'select',
      inputOptions: { PRODUCTO: 'Producto', SERVICIO: 'Servicio' },
      inputValue: 'PRODUCTO',
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })

    if (!value) return
    const tipo = value as 'PRODUCTO' | 'SERVICIO'

    const Swal = (await import('sweetalert2')).default

    const { value: idRaw } = await Swal.fire({
      title: 'ID del item',
      input: 'text',
      inputPlaceholder: tipo === 'PRODUCTO' ? 'ID de producto' : 'ID de servicio',
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      preConfirm: (v) => {
        const s = String(v ?? '').trim()
        if (!/^\d+$/.test(s)) {
          Swal.showValidationMessage('Pon un ID numérico válido.')
          return
        }
        return Number(s)
      },
    })
    if (!idRaw) return

    const { value: cantidad } = await Swal.fire({
      title: 'Cantidad',
      input: 'number',
      inputValue: 1,
      inputAttributes: { min: '0.01', step: '0.01' },
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      preConfirm: (v) => {
        const n = Number(v)
        if (Number.isNaN(n) || n <= 0) {
          Swal.showValidationMessage('Cantidad inválida.')
          return
        }
        return n
      },
    })
    if (!cantidad) return

    const payload: Record<string, any> = {
      tipo,
      cantidad,
      producto_id: tipo === 'PRODUCTO' ? idRaw : null,
      servicio_id: tipo === 'SERVICIO' ? idRaw : null,
    }

    router.post(`${baseUrl}/${cotizacion.value.id}/add-item`, payload, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Agregado al carrito', 'success'),
      onError: (e) => swalErr('No se pudo agregar. Revisa ID/estatus del catálogo.'),
    })
  }

  async function openEditDetalle(d: Detalle) {
    const Swal = (await import('sweetalert2')).default

    const { value } = await Swal.fire({
      title: 'Editar ítem',
      html: `<div style="text-align:left">
        <div><b>${itemLabel(d)}</b></div>
        <div style="margin-top:8px">Cantidad</div>
        <input id="cantidad" class="swal2-input" value="${String(d.cantidad)}" />
        <div style="margin-top:8px">Precio unitario</div>
        <input id="precio" class="swal2-input" value="${String(d.precio_unitario)}" />
      </div>`,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusConfirm: false,
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

    router.put(`/cotizaciones/detalles/${d.id}`, value, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Ítem actualizado', 'success'),
      onError: () => swalErr('No se pudo actualizar.'),
    })
  }

  async function removeDetalle(d: Detalle) {
    const { isConfirmed } = await swalConfirm('Se quitará el ítem del carrito.', {
      title: 'Quitar ítem',
      confirmText: 'Quitar',
      cancelText: 'Cancelar',
    })
    if (!isConfirmed) return

    router.delete(`/cotizaciones/detalles/${d.id}`, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Ítem eliminado', 'success'),
      onError: () => swalErr('No se pudo eliminar.'),
    })
  }

  async function openReply() {
    const Swal = (await import('sweetalert2')).default

    const { value } = await Swal.fire({
      title: 'Responder (marcar DEVUELTA)',
      html: `<div style="text-align:left">
        <div style="margin-top:8px">Correo (opcional)</div>
        <input id="email" class="swal2-input" value="${cotizacion.value.email_destino ?? ''}" />
        <div style="margin-top:8px">Teléfono (opcional)</div>
        <input id="tel" class="swal2-input" value="${cotizacion.value.telefono_destino ?? ''}" />
      </div>`,
      showCancelButton: true,
      confirmButtonText: 'Marcar DEVUELTA',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusConfirm: false,
      preConfirm: () => {
        const email = (document.getElementById('email') as HTMLInputElement).value.trim()
        const tel = (document.getElementById('tel') as HTMLInputElement).value.trim()
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Correo inválido.')
          return
        }
        return { email_destino: email || null, telefono_destino: tel || null }
      },
    })

    if (!value) return

    router.post(`${baseUrl}/${cotizacion.value.id}/reply`, value, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Marcada DEVUELTA', 'success'),
      onError: () => swalErr('No se pudo marcar DEVUELTA.'),
    })
  }

  async function openMarkSent() {
    const { isConfirmed } = await swalConfirm('¿Confirmas que ya la enviaste al cliente?', {
      title: 'Marcar ENVIADA',
      confirmText: 'Sí, marcar',
      cancelText: 'Cancelar',
    })
    if (!isConfirmed) return

    router.post(`${baseUrl}/${cotizacion.value.id}/mark-sent`, { channel: 'email' }, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Marcada ENVIADA', 'success'),
      onError: () => swalErr('No se pudo marcar ENVIADA.'),
    })
  }

  return {
    detallesActivos,
    money,
    itemLabel,
    openAddItem,
    openEditDetalle,
    removeDetalle,
    openReply,
    openMarkSent,
  }
}