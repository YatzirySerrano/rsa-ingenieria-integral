import Swal, {
    type SweetAlertIcon,
    type SweetAlertOptions,
    type SweetAlertResult,
  } from 'sweetalert2'
  import 'sweetalert2/dist/sweetalert2.min.css'
  
  type ToastIcon = Exclude<SweetAlertIcon, 'question'>
  const Z_INDEX_TOP = 20000
  
  function ensureTopZIndex() {
    const id = 'swal2-zindex-top'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = `.swal2-container{z-index:${Z_INDEX_TOP}!important}`
    document.head.appendChild(style)
  }
  
  function baseModal(options: SweetAlertOptions) {
    ensureTopZIndex()
    return Swal.fire({
      heightAuto: false,
      confirmButtonText: 'OK',
      ...options,
    })
  }
  
  function baseToast() {
    ensureTopZIndex()
    return Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2600,
      timerProgressBar: true,
      heightAuto: false,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      },
    })
  }
  
  export function swalOk(text: string, title = 'Listo') {
    return baseModal({
      icon: 'success' as const,
      title,
      text,
      confirmButtonText: 'Aceptar',
    })
  }
  
  export function swalErr(text: string, title = 'Error') {
    return baseModal({
      icon: 'error' as const,
      title,
      text,
      confirmButtonText: 'Entendido',
    })
  }
  
  export function swalInfo(text: string, title = 'Info') {
    return baseModal({
      icon: 'info' as const,
      title,
      text,
      confirmButtonText: 'OK',
    })
  }
  
  export function swalConfirm(
    text: string,
    opts?: { title?: string; confirmText?: string; cancelText?: string; icon?: SweetAlertIcon }
  ): Promise<SweetAlertResult> {
    return baseModal({
      icon: opts?.icon ?? 'warning',
      title: opts?.title ?? 'Confirmar',
      text,
      showCancelButton: true,
      confirmButtonText: opts?.confirmText ?? 'Sí, continuar',
      cancelButtonText: opts?.cancelText ?? 'Cancelar',
      reverseButtons: true,
    })
  }
  
  export function swalLoading(text = 'Procesando...') {
    ensureTopZIndex()
    return Swal.fire({
      title: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      heightAuto: false,
      didOpen: () => Swal.showLoading(),
    })
  }
  
  export function swalClose() {
    Swal.close()
  }
  
  export function swalNotify(
    text: string,
    icon: ToastIcon = 'success',
    opts?: { title?: string; ms?: number; position?: SweetAlertOptions['position'] }
  ) {
    const Toast = baseToast()
    return Toast.fire({
      icon,
      title: opts?.title,
      text,
      timer: opts?.ms ?? 2600,
      position: opts?.position ?? 'top-end',
    })
  }