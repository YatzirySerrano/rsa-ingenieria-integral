import { computed } from 'vue'
import { router, useForm, usePage } from '@inertiajs/vue3'

import type { Cotizacion } from '@/types/catalogo'
import type { AppPageProps } from '@/types'

import { useSwal } from './useSwal'

type CotizacionExtraProps = {
  cotizacion: Cotizacion
}

export function useCotizacionShow() {
  const page = usePage<AppPageProps & CotizacionExtraProps>()
  const props = computed(() => page.props)
  const { confirmDelete, toastSuccess, toastError } = useSwal()

  /**
   * Form de envío por correo
   * (tu backend se encarga de construir el ticket y mandar el email).
   */
  const sendForm = useForm({
    email_destino: props.value.cotizacion.email_destino ?? '',
    telefono_destino: props.value.cotizacion.telefono_destino ?? '',
  })

  function createDraft() {
    router.post(route('cotizacions.draft'), {}, { preserveScroll: true })
  }

  async function removeDetalle(detalleId: number) {
    const ok = await confirmDelete(`Detalle #${detalleId}`)
    if (!ok) return

    router.delete(
      route('cotizacions.items.remove', { cotizacion: props.value.cotizacion.id, detalle: detalleId }),
      {
        preserveScroll: true,
        onSuccess: async () => toastSuccess('Item removido'),
        onError: async () => toastError('No se pudo remover'),
      }
    )
  }

  function send() {
    sendForm.post(route('cotizacions.send', props.value.cotizacion.id), {
      preserveScroll: true,
      onSuccess: async () => toastSuccess('Cotización enviada'),
      onError: async () => toastError('Revisa el email destino'),
    })
  }

  return {
    props,
    sendForm,
    createDraft,
    removeDetalle,
    send,
  }
}
