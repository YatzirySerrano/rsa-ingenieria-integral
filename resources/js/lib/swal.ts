import Swal, {
  type SweetAlertIcon,
  type SweetAlertOptions,
  type SweetAlertResult,
} from 'sweetalert2'

type ToastIcon = Exclude<SweetAlertIcon, 'question'>

const Z_INDEX_TOP = 999999
const DEFAULT_MODAL_WIDTH = 'min(980px, calc(100vw - 48px))'
const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'

let themeInjected = false

function ensureSwalTheme() {
  if (!isClient || themeInjected) return
  themeInjected = true

  const style = document.createElement('style')
  style.id = 'rsa-swal-theme'
  style.textContent = `
    :root {
      --rsa-navy: #0b1f3a;
      --rsa-navy-2: #0a1830;

      --rsa-muted-dark: rgba(235,235,245,.72);
      --rsa-muted-light: rgba(15,23,42,.72);

      --rsa-shadow-dark: 0 28px 90px rgba(0,0,0,.48);
      --rsa-shadow-light: 0 24px 80px rgba(2,6,23,.18);
    }

    /* Siempre por encima de header/modales */
    .swal2-container { z-index: ${Z_INDEX_TOP} !important; }

    /* =========================
       MODAL (solo modal)
       ========================= */
    .swal2-popup.swal2-modal {
      width: 900px !important;
      max-width: calc(100vw - 48px) !important;

      border-radius: 16px !important;
      padding: 18px 18px 14px !important;

      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid rgba(2,6,23,.10) !important;
      box-shadow: var(--rsa-shadow-light) !important;

      overflow: visible !important; /* tooltips */
      font-family: inherit !important;
    }

    /* Container de contenido: NO centrar, para que el form sea pro */
    .swal2-html-container {
      margin: 0 !important;
      padding: 0 !important;
      color: var(--rsa-muted-light) !important;
      overflow: visible !important;
      text-align: left !important;
    }

    .swal2-title {
      font-weight: 900 !important;
      letter-spacing: -0.02em !important;
      font-size: 18px !important;
      margin: 0 0 10px !important;
      color: inherit !important;
      text-align: left !important;
    }

    /* Inputs: el “input chiquito” viene de SweetAlert default (60% + auto). */
    .swal2-input {
      width: 100% !important;
      height: 40px !important;
      font-size: 14px !important;
      border-radius: 12px !important;
      margin: 0 !important;
      box-shadow: none !important;

      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid rgba(2,6,23,.12) !important;
    }
    .swal2-input::placeholder { color: rgba(15,23,42,.40) !important; }
    .swal2-input:focus {
      border-color: rgba(11,31,58,.35) !important;
      box-shadow: 0 0 0 4px rgba(11,31,58,.18) !important;
      outline: none !important;
    }

    /* Acciones: aquí se arregla el “GuardarCancelar” */
    .swal2-actions {
      margin-top: 14px !important;
      padding: 0 !important;
      display: flex !important;
      justify-content: flex-end !important;
      gap: 10px !important;
    }
    .swal2-actions button { margin: 0 !important; }

    /* Confirm / Cancel (clases que YA usabas) */
    .swal2-confirm {
      background: var(--rsa-navy) !important;
      color: #fff !important;
      border: 1px solid rgba(255,255,255,.08) !important;
      border-radius: 12px !important;
      font-weight: 900 !important;
      padding: 10px 14px !important;
      min-width: 120px !important;
      box-shadow: 0 10px 28px rgba(11,31,58,.35) !important;
    }
    .swal2-confirm:hover { background: var(--rsa-navy-2) !important; }

    .swal2-cancel {
      background: rgba(2,6,23,.04) !important;
      color: #0f172a !important;
      border: 1px solid rgba(2,6,23,.12) !important;
      border-radius: 12px !important;
      font-weight: 900 !important;
      padding: 10px 14px !important;
      min-width: 120px !important;
      box-shadow: none !important;
    }
    .swal2-cancel:hover {
      background: rgba(2,6,23,.06) !important;
      border-color: rgba(2,6,23,.16) !important;
    }

    .swal2-validation-message {
      background: rgba(2,6,23,.04) !important;
      color: #0f172a !important;
      border: 1px solid rgba(2,6,23,.12) !important;
      border-radius: 12px !important;
      font-weight: 800 !important;
    }

    /* =========================
       RSA FORM helpers (tus clases)
       ========================= */
    .rsa-form { text-align: left; margin-top: 6px; display: grid; gap: 12px; }
    .rsa-row { display: grid; gap: 6px; }
    .rsa-label-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; overflow: visible !important; }

    .rsa-label {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .01em;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: visible !important;
    }

    .rsa-tip { position: relative; display: inline-flex; align-items: center; overflow: visible !important; }

    .rsa-tip-btn {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(2,6,23,.04);
      border: 1px solid rgba(2,6,23,.12);
      color: rgba(15,23,42,.82);
      cursor: help;
      user-select: none;
      transition: background .12s ease, border-color .12s ease, transform .12s ease;
    }
    .rsa-tip-btn:hover {
      background: rgba(2,6,23,.06);
      border-color: rgba(2,6,23,.16);
      transform: translateY(-1px);
    }
    .rsa-tip-btn:focus { outline: none; box-shadow: 0 0 0 4px rgba(11,31,58,.35); }

    .rsa-tip-bubble {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: calc(100% + 10px);

      background: #ffffff;
      color: #0f172a;
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;

      box-shadow: 0 18px 55px rgba(2,6,23,.25);
      border: 1px solid rgba(2,6,23,.10);
      opacity: 0;
      pointer-events: none;
      transition: opacity .12s ease, transform .12s ease;
      z-index: 9999999;
    }
    .rsa-tip-bubble::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 100%;
      border: 6px solid transparent;
      border-top-color: #ffffff;
    }
    .rsa-tip:hover .rsa-tip-bubble,
    .rsa-tip:focus-within .rsa-tip-bubble {
      opacity: 1;
      transform: translateX(-50%) translateY(-1px);
    }

    .rsa-note { margin: 2px 0 0; font-size: 12px; color: rgba(15,23,42,.62); }

    /* =========================
       TOAST (no heredar modal)
       ========================= */
    .swal2-popup.swal2-toast {
      width: auto !important;
      max-width: calc(100vw - 24px) !important;
      padding: 10px 12px !important;
      border-radius: 12px !important;
      box-shadow: 0 18px 55px rgba(2,6,23,.18) !important;
      font-family: inherit !important;
    }
    .swal2-popup.swal2-toast .swal2-title { font-size: 13px !important; margin: 0 !important; text-align: left !important; }
    .swal2-popup.swal2-toast .swal2-html-container { margin: 0 !important; padding: 0 !important; text-align: left !important; }

    /* =========================
       DARK MODE
       ========================= */
    :is(html.dark, body.dark) .swal2-popup.swal2-modal {
      background: linear-gradient(180deg, rgba(11,15,25,.96), rgba(10,12,16,.96)) !important;
      color: rgba(250,250,252,.92) !important;
      border: 1px solid rgba(255,255,255,.10) !important;
      box-shadow: var(--rsa-shadow-dark) !important;
    }

    :is(html.dark, body.dark) .swal2-html-container { color: var(--rsa-muted-dark) !important; }
    :is(html.dark, body.dark) .rsa-label { color: rgba(250,250,252,.92); }

    :is(html.dark, body.dark) .rsa-tip-btn {
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.14);
      color: rgba(250,250,252,.86);
    }
    :is(html.dark, body.dark) .rsa-tip-btn:hover {
      background: rgba(255,255,255,.10);
      border-color: rgba(255,255,255,.18);
    }

    :is(html.dark, body.dark) .swal2-input {
      background: rgba(255,255,255,.06) !important;
      border: 1px solid rgba(255,255,255,.14) !important;
      color: rgba(250,250,252,.92) !important;
    }
    :is(html.dark, body.dark) .swal2-input::placeholder { color: rgba(235,235,245,.45) !important; }
    :is(html.dark, body.dark) .swal2-input:focus {
      border-color: rgba(255,255,255,.20) !important;
      box-shadow: 0 0 0 4px rgba(11,31,58,.35) !important;
    }

    :is(html.dark, body.dark) .swal2-cancel {
      background: rgba(148,163,184,.18) !important;
      color: rgba(250,250,252,.92) !important;
      border: 1px solid rgba(148,163,184,.28) !important;
    }
    :is(html.dark, body.dark) .swal2-cancel:hover {
      background: rgba(148,163,184,.24) !important;
      border-color: rgba(148,163,184,.34) !important;
    }

    :is(html.dark, body.dark) .rsa-note { color: rgba(235,235,245,.62); }

    :is(html.dark, body.dark) .swal2-validation-message {
      background: rgba(255,255,255,.06) !important;
      color: rgba(250,250,252,.92) !important;
      border: 1px solid rgba(255,255,255,.14) !important;
    }
  `
  document.head.appendChild(style)
}

function mergeCustomClass(
  base: SweetAlertOptions['customClass'],
  extra: SweetAlertOptions['customClass']
) {
  return { ...(base ?? {}), ...(extra ?? {}) }
}

function baseModalDefaults(): SweetAlertOptions {
  ensureSwalTheme()
  return {
    target: document.body,
    heightAuto: false,
    buttonsStyling: false,
    width: DEFAULT_MODAL_WIDTH,
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
      popup: 'swal2-popup',
      title: 'swal2-title',
      htmlContainer: 'swal2-html-container',
      actions: 'swal2-actions',
    },
  }
}

function baseToastDefaults(): SweetAlertOptions {
  ensureSwalTheme()
  return {
    target: document.body,
    toast: true,
    position: 'top-end',
    buttonsStyling: false,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    // OJO: NO heightAuto en toast (SweetAlert se queja)
    customClass: {
      popup: 'swal2-popup',
      title: 'swal2-title',
      htmlContainer: 'swal2-html-container',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
  }
}

export function swalModal(options: SweetAlertOptions): Promise<SweetAlertResult> {
  if (!isClient) return Promise.resolve({} as SweetAlertResult)

  const base = baseModalDefaults()
  const merged: SweetAlertOptions = {
    ...base,
    ...options,
    customClass: mergeCustomClass(base.customClass, options.customClass),
  }

  return Swal.fire(merged)
}

export function swalConfirm(
  text: string,
  opts?: { title?: string; confirmText?: string; cancelText?: string; icon?: SweetAlertIcon }
): Promise<SweetAlertResult> {
  return swalModal({
    icon: opts?.icon ?? 'warning',
    title: opts?.title ?? 'Confirmar',
    text,
    showCancelButton: true,
    confirmButtonText: opts?.confirmText ?? 'Sí, continuar',
    cancelButtonText: opts?.cancelText ?? 'Cancelar',
    reverseButtons: true,
  })
}

export function swalNotify(
  text: string,
  icon: ToastIcon = 'success',
  opts?: { title?: string; ms?: number; position?: SweetAlertOptions['position'] }
) {
  if (!isClient) return Promise.resolve({} as SweetAlertResult)

  const base = baseToastDefaults()
  return Swal.fire({
    ...base,
    icon,
    title: opts?.title,
    text,
    timer: opts?.ms ?? base.timer,
    position: opts?.position ?? base.position,
  } as SweetAlertOptions)
}

export function swalLoading(text = 'Procesando...') {
  return swalModal({
    title: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  })
}

export function swalClose() {
  Swal.close()
}

export function swalOk(text: string, title = 'Listo') {
  return swalModal({ icon: 'success', title, text, confirmButtonText: 'Aceptar' })
}

export function swalErr(text: string, title = 'Error') {
  return swalModal({ icon: 'error', title, text, confirmButtonText: 'Entendido' })
}

export function swalInfo(text: string, title = 'Info') {
  return swalModal({ icon: 'info', title, text, confirmButtonText: 'OK' })
}
