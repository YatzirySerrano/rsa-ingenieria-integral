import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

/**
 * Tipos de dominio para Marca.
 * Nota: status se gestiona con baja lógica (destroy => inactivo) y activar (update => activo).
 */
export type MarcaStatus = 'activo' | 'inactivo'

export type Marca = {
  id: number
  nombre: string
  status: MarcaStatus
}

/**
 * Filtros del index (Inertia).
 * - q: búsqueda por nombre
 * - status: activo | inactivo | __all__
 */
export type MarcaFilters = {
  q: string
  status: string
}

/** Valor sentinela para "Todos" en selects. */
const ALL = '__all__'

type UseMarcaCrudOptions = {
  initialFilters?: Partial<MarcaFilters>
  baseUrl?: string
}

let swalStyled = false

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

/**
 * Tema premium RSA (navy/white/black) inspirado en shadcn.
 * Cambios:
 * - Tooltip por HOVER (sin click) como shadcn.
 * - Evita que el tooltip se corte: overflow visible en contenedores clave.
 * - Cancel siempre gris.
 */
function ensureSwalTheme() {
  if (swalStyled) return
  swalStyled = true

  const style = document.createElement('style')
  style.innerHTML = `
    :root {
      --rsa-navy: #0b1f3a;
      --rsa-navy-2: #0a1830;

      --rsa-muted-dark: rgba(235,235,245,.72);
      --rsa-muted-light: rgba(15,23,42,.72);

      --rsa-shadow-dark: 0 28px 90px rgba(0,0,0,.48);
      --rsa-shadow-light: 0 24px 80px rgba(2,6,23,.18);
    }

    /* Siempre por encima de header/modales */
    .swal2-container { z-index: 999999 !important; }

    /* =========================================
       BASE STYLES (LIGHT MODE DEFAULT)
       ========================================= */

    /* Popup (Light) */
    .swal2-popup {
      width: 560px !important;
      max-width: calc(100vw - 24px) !important;
      border-radius: 16px !important;
      padding: 18px 18px 14px !important;
      
      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid rgba(2,6,23,.10) !important;
      box-shadow: var(--rsa-shadow-light) !important;

      overflow: visible !important; /* Tooltips */
    }

    .swal2-title {
      font-weight: 900 !important;
      letter-spacing: -0.02em !important;
      font-size: 18px !important;
      margin: 0 0 8px !important;
      color: inherit !important;
    }

    .swal2-html-container {
      margin: 0 !important;
      padding: 0 !important;
      color: var(--rsa-muted-light) !important;
      overflow: visible !important;
    }

    /* Labels (Light) */
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

    /* Tooltip Btn (Light) */
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

    /* Inputs (Light) */
    .swal2-input {
      height: 40px !important;
      font-size: 14px !important;
      border-radius: 12px !important;
      margin: 0 !important;
      box-shadow: none !important;

      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid rgba(2,6,23,.12) !important;
    }
    .swal2-input::placeholder {
      color: rgba(15,23,42,.40) !important;
    }
    .swal2-input:focus {
      border-color: rgba(11,31,58,.35) !important;
      box-shadow: 0 0 0 4px rgba(11,31,58,.18) !important;
      outline: none !important;
    }

    /* Cancel Button (Light) */
    .swal2-cancel {
      background: rgba(2,6,23,.04) !important;
      color: #0f172a !important;
      border: 1px solid rgba(2,6,23,.12) !important;
      border-radius: 12px !important;
      font-weight: 900 !important;
      padding: 10px 14px !important;
      box-shadow: none !important;
    }
    .swal2-cancel:hover {
      background: rgba(2,6,23,.06) !important;
      border-color: rgba(2,6,23,.16) !important;
    }

    /* Generic helpers */
    .rsa-form { text-align: left; margin-top: 6px; display: grid; gap: 12px; }
    .rsa-row { display: grid; gap: 6px; }
    .rsa-label-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; overflow: visible !important; }
    
    .rsa-tip { position: relative; display: inline-flex; align-items: center; overflow: visible !important; }
    .rsa-tip-btn:focus { outline: none; box-shadow: 0 0 0 4px rgba(11,31,58,.35); }

    /* Bubble (Generic - White always) */
    .rsa-tip-bubble { 
        position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(100% + 10px);
        background: #ffffff; color: #0f172a; border-radius: 10px; padding: 8px 10px;
        font-size: 12px; font-weight: 700; white-space: nowrap;
        box-shadow: 0 18px 55px rgba(2,6,23,.25); border: 1px solid rgba(2,6,23,.10);
        opacity: 0; pointer-events: none; transition: opacity .12s ease, transform .12s ease;
        z-index: 9999999;
    }
    .rsa-tip-bubble::after {
        content: ''; position: absolute; left: 50%; transform: translateX(-50%); top: 100%;
        border: 6px solid transparent; border-top-color: #ffffff;
    }
    .rsa-tip:hover .rsa-tip-bubble, .rsa-tip:focus-within .rsa-tip-bubble {
        opacity: 1; transform: translateX(-50%) translateY(-1px);
    }

    /* Note (Light) */
    .rsa-note {
      margin: 2px 0 0;
      font-size: 12px;
      color: rgba(15,23,42,.62);
    }

    /* Actions & Confirm (Shared) */
    .swal2-actions { margin-top: 14px !important; gap: 10px !important; }
    .swal2-confirm {
      background: var(--rsa-navy) !important; color: #fff !important;
      border: 1px solid rgba(255,255,255,.08) !important;
      border-radius: 12px !important; font-weight: 900 !important;
      padding: 10px 14px !important;
      box-shadow: 0 10px 28px rgba(11,31,58,.35) !important;
    }
    .swal2-confirm:hover { 
      background: var(--rsa-navy-2) !important; 
      color: #ffffff !important;
    }
    
    .swal2-validation-message {
      background: rgba(2,6,23,.04) !important;
      color: #0f172a !important;
      border: 1px solid rgba(2,6,23,.12) !important;
      border-radius: 12px !important;
      font-weight: 800 !important;
    }


    /* =========================================
       DARK MODE OVERRIDES (.dark)
       ========================================= */
       
    :is(html.dark, body.dark) .swal2-popup {
      background: linear-gradient(180deg, rgba(11,15,25,.96), rgba(10,12,16,.96)) !important;
      color: rgba(250,250,252,.92) !important;
      border: 1px solid rgba(255,255,255,.10) !important;
      box-shadow: var(--rsa-shadow-dark) !important;
    }

    :is(html.dark, body.dark) .swal2-html-container {
       color: var(--rsa-muted-dark) !important;
    }

    :is(html.dark, body.dark) .rsa-label {
       color: rgba(250,250,252,.92);
    }

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
    :is(html.dark, body.dark) .swal2-input::placeholder {
       color: rgba(235,235,245,.45) !important;
    }
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

    :is(html.dark, body.dark) .rsa-note {
       color: rgba(235,235,245,.62);
    }

    :is(html.dark, body.dark) .swal2-validation-message {
       background: rgba(255,255,255,.06) !important;
       color: rgba(250,250,252,.92) !important;
       border: 1px solid rgba(255,255,255,.14) !important;
    }
  `
  document.head.appendChild(style)
}

/** ícono info inline (sin lucide) */
function infoIconSvg() {
  return `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" stroke-width="2"/>
      <path d="M12 17v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 7.5h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `
}

export function useMarcaCrud(options: UseMarcaCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/marcas'

  /* =========================
   * Filtros (debounce)
   * ========================= */
  const filters = reactive<MarcaFilters>({
    q: options.initialFilters?.q ?? '',
    status: options.initialFilters?.status ?? ALL,
  })

  function buildParams() {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()
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
    return Boolean(filters.q.trim()) || filters.status !== ALL
  })

  /* =========================
   * Form (SweetAlert2)
   * ========================= */
  async function openForm(marca?: Marca) {
    ensureSwalTheme()

    const isEdit = Boolean(marca)
    const current = marca
      ? { id: Number(marca.id), nombre: String(marca.nombre ?? '') }
      : null

    const nombreVal = escapeHtml(current?.nombre ?? '')

    const html = `
      <div class="rsa-form">
        <div class="rsa-row">
          <div class="rsa-label-row">
            <label class="rsa-label" for="m_nombre">
              Nombre de la marca
              <span class="rsa-tip">
                <span class="rsa-tip-btn" tabindex="0" aria-label="Información del campo nombre">
                  ${infoIconSvg()}
                </span>
                <span class="rsa-tip-bubble">Usa el nombre comercial (ej. Hikvision, Epcom).</span>
              </span>
            </label>
          </div>

          <input
            id="m_nombre"
            class="swal2-input"
            placeholder="Ej. Hikvision, Epcom, AccessPro…"
            value="${nombreVal}"
            autocomplete="off"
          />
        </div>
      </div>
    `

    const { value } = await Swal.fire({
      title: isEdit ? 'Editar marca' : 'Nueva marca',
      html,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      heightAuto: false,
      didOpen: () => {
        const n = document.getElementById('m_nombre') as HTMLInputElement | null
        n?.focus()
        n?.select()
        n?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            Swal.clickConfirm()
          }
        })
      },
      preConfirm: () => {
        const nombre = (document.getElementById('m_nombre') as HTMLInputElement | null)?.value?.trim() ?? ''

        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio.')
          return
        }
        if (nombre.length < 2) {
          Swal.showValidationMessage('El nombre es demasiado corto.')
          return
        }

        return { nombre, status: 'activo' as const }
      },
    })

    if (!value) return

    if (isEdit && current) {
      router.put(`${baseUrl}/${current.id}`, value, {
        preserveScroll: true,
        onSuccess: () => toast('Marca actualizada', 'success'),
        onError: () => toast('Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onSuccess: () => toast('Marca creada', 'success'),
      onError: () => toast('Revisa los campos', 'error'),
    })
  }

  /* =========================
   * Status: baja lógica / activar
   * ========================= */
  async function deactivate(m: Marca) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Desactivar marca',
      text: `Se dará de baja "${m.nombre}". ¿Estás seguro?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      heightAuto: false,
    })
    if (!isConfirmed) return

    router.delete(`${baseUrl}/${m.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Marca desactivada', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  async function activate(m: Marca) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Activar marca',
      text: `Se activará "${m.nombre}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      heightAuto: false,
    })
    if (!isConfirmed) return

    router.put(
      `${baseUrl}/${m.id}`,
      { nombre: m.nombre, status: 'activo' as const },
      {
        preserveScroll: true,
        onSuccess: () => toast('Marca activada', 'success'),
        onError: () => toast('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(m: Marca) {
    return m.status === 'activo' ? deactivate(m) : activate(m)
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
      heightAuto: false,
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
