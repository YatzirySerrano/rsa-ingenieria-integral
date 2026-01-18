import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

export type CategoriaTipo = 'PRODUCTO' | 'SERVICIO'
export type CategoriaStatus = 'activo' | 'inactivo'

export type Categoria = {
  id: number
  nombre: string
  tipo: CategoriaTipo
  status: CategoriaStatus
}

export type CategoriaFilters = {
  q: string
  tipo: string
  status: string
}

const ALL = '__all__'

type UseCategoriaCrudOptions = {
  initialFilters?: Partial<CategoriaFilters>
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

function isAppDark() {
  // Laravel + Tailwind: el tema cambia con la clase "dark" en <html>
  return document.documentElement.classList.contains('dark')
}

/**
 * Tema premium RSA (navy/white/black) inspirado en shadcn.
 * - Respeta dark/light de la app (NO del sistema).
 * - Tooltips por hover/focus (sin click).
 * - Cancel gris.
 * - Evita que tooltips se corten (overflow visible).
 */
function ensureSwalTheme() {
  const dark = isAppDark()

  // Inyectamos una sola vez el "esqueleto" + ambas skins y alternamos por data-theme
  if (!swalStyled) {
    swalStyled = true

    const style = document.createElement('style')
    style.innerHTML = `
      :root{
        --rsa-navy: #0b1f3a;
        --rsa-navy-2: #0a1830;
        --rsa-shadow-dark: 0 28px 90px rgba(0,0,0,.48);
        --rsa-shadow-light: 0 24px 80px rgba(2,6,23,.18);
      }

      .swal2-container{ z-index: 999999 !important; }

      /* Base */
      .swal2-popup{
        width: 560px !important;
        max-width: calc(100vw - 24px) !important;
        border-radius: 16px !important;
        padding: 18px 18px 14px !important;
        overflow: visible !important;
      }

      .swal2-title{
        font-weight: 900 !important;
        letter-spacing: -0.02em !important;
        font-size: 18px !important;
        margin: 0 0 8px !important;
      }

      .swal2-html-container{
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      .rsa-form{
        text-align:left;
        margin-top: 6px;
        display: grid;
        gap: 12px;
      }

      .rsa-row{
        display: grid;
        gap: 6px;
      }

      .rsa-label-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 10px;
        overflow: visible !important;
      }

      .rsa-label{
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .01em;
        margin: 0;
        line-height: 1.2;
        display:flex;
        align-items:center;
        gap: 8px;
        overflow: visible !important;
      }

      /* Tooltip tipo shadcn (hover/focus) */
      .rsa-tip{
        position: relative;
        display: inline-flex;
        align-items: center;
        overflow: visible !important;
      }

      .rsa-tip-btn{
        width: 18px;
        height: 18px;
        border-radius: 999px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        cursor: help;
        user-select:none;
        transition: background .12s ease, border-color .12s ease, transform .12s ease;
      }

      .rsa-tip-btn:hover{
        transform: translateY(-1px);
      }

      .rsa-tip-btn:focus{
        outline:none;
      }

      .rsa-tip-bubble{
        position:absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: calc(100% + 10px);
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        opacity: 0;
        pointer-events:none;
        transition: opacity .12s ease, transform .12s ease;
        z-index: 9999999;
      }

      .rsa-tip-bubble::after{
        content:'';
        position:absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 100%;
        border: 6px solid transparent;
      }

      .rsa-tip:hover .rsa-tip-bubble,
      .rsa-tip:focus-within .rsa-tip-bubble{
        opacity: 1;
        transform: translateX(-50%) translateY(-1px);
      }

      .rsa-note{
        margin: 2px 0 0;
        font-size: 12px;
      }

      .swal2-actions{
        margin-top: 14px !important;
        gap: 10px !important;
      }

      /* Cancel gris (aplica a ambos temas) */
      .swal2-cancel{
        border-radius: 12px !important;
        font-weight: 900 !important;
        padding: 10px 14px !important;
        box-shadow: none !important;
      }

      /* ======= SKIN DARK ======= */
      .swal2-container[data-rsa-theme="dark"] .swal2-popup{
        box-shadow: var(--rsa-shadow-dark) !important;
        border: 1px solid rgba(255,255,255,.10) !important;
        background: linear-gradient(180deg, rgba(11,15,25,.96), rgba(10,12,16,.96)) !important;
        color: rgba(250,250,252,.92) !important;
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-html-container{
        color: rgba(235,235,245,.72) !important;
      }

      /* ✅ CAMBIO: labels blancos SOLO en dark (forzado) */
      .swal2-container[data-rsa-theme="dark"] .rsa-label,
      .swal2-container[data-rsa-theme="dark"] .rsa-label-row{
        color: #ffffff !important;
      }

      .swal2-container[data-rsa-theme="dark"] .rsa-tip-btn{
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.14);
        color: rgba(250,250,252,.86);
      }

      .swal2-container[data-rsa-theme="dark"] .rsa-tip-btn:hover{
        background: rgba(255,255,255,.10);
        border-color: rgba(255,255,255,.18);
      }

      .swal2-container[data-rsa-theme="dark"] .rsa-tip-btn:focus{
        box-shadow: 0 0 0 4px rgba(11,31,58,.35);
      }

      .swal2-container[data-rsa-theme="dark"] .rsa-tip-bubble{
        background: #ffffff;
        color: #0f172a;
        box-shadow: 0 18px 55px rgba(2,6,23,.25);
        border: 1px solid rgba(2,6,23,.10);
      }

      .swal2-container[data-rsa-theme="dark"] .rsa-tip-bubble::after{
        border-top-color: #ffffff;
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-input,
      .swal2-container[data-rsa-theme="dark"] .swal2-select{
        height: 36px !important; /* Minimalista h-9 */
        font-size: 13px !important; /* Letra más pequeña */
        border-radius: 8px !important; /* Rounded-md aprox */
        background: rgba(255,255,255,.04) !important;
        border: 1px solid rgba(255,255,255,.12) !important;
        color: rgba(250,250,252,.92) !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 10px !important;
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-input::placeholder{
        color: rgba(235,235,245,.35) !important;
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-input:focus,
      .swal2-container[data-rsa-theme="dark"] .swal2-select:focus{
        border-color: rgba(255,255,255,.24) !important;
        box-shadow: 0 0 0 2px rgba(11,31,58,.5) !important; /* Ring más sutil */
        outline: none !important;
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-select option{
        background: #0b0c10 !important;
        color: rgba(250,250,252,.92) !important;
        font-size: 13px !important;
      }

      .swal2-container[data-rsa-theme="dark"] .rsa-note{
        color: rgba(235,235,245,.5);
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-confirm{
        background: var(--rsa-navy) !important;
        color: #fff !important;
        border: 1px solid rgba(255,255,255,.08) !important;
        border-radius: 8px !important;
        font-weight: 800 !important;
        font-size: 13px !important;
        padding: 8px 12px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,.2) !important;
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-confirm:hover{
        background: var(--rsa-navy-2) !important;
        color: #ffffff !important;
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-cancel{
        background: transparent !important;
        color: rgba(250,250,252,.7) !important;
        border: 1px solid rgba(148,163,184,.2) !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        border-radius: 8px !important;
        padding: 8px 12px !important;
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-cancel:hover{
        background: rgba(255,255,255,.04) !important;
        color: #fff !important;
        border-color: rgba(148,163,184,.3) !important;
      }

      .swal2-container[data-rsa-theme="dark"] .swal2-validation-message{
        background: rgba(255,255,255,.04) !important;
        color: rgba(250,250,252,.9) !important;
        border: 1px solid rgba(255,255,255,.1) !important;
        border-radius: 8px !important;
        font-size: 12px !important;
      }

      /* ======= SKIN LIGHT ======= */
      .swal2-container[data-rsa-theme="light"] .swal2-popup{
        background: #ffffff !important;
        color: #0f172a !important;
        border: 1px solid rgba(2,6,23,.08) !important;
        box-shadow: var(--rsa-shadow-light) !important;
      }

      .swal2-container[data-rsa-theme="light"] .swal2-html-container{
        color: rgba(15,23,42,.72) !important;
      }

      .swal2-container[data-rsa-theme="light"] .rsa-label{
        color: #0f172a !important;
      }

      .swal2-container[data-rsa-theme="light"] .rsa-tip-btn{
        background: rgba(2,6,23,.03);
        border: 1px solid rgba(2,6,23,.1);
        color: rgba(15,23,42,.7);
      }

      .swal2-container[data-rsa-theme="light"] .rsa-tip-btn:hover{
        background: rgba(2,6,23,.06);
        border-color: rgba(2,6,23,.15);
      }

      .swal2-container[data-rsa-theme="light"] .rsa-tip-btn:focus{
        box-shadow: 0 0 0 4px rgba(11,31,58,.1);
      }

      .swal2-container[data-rsa-theme="light"] .rsa-tip-bubble{
        background: #0f172a;
        color: #ffffff;
        box-shadow: 0 10px 30px rgba(0,0,0,.15);
        border: none;
      }

      .swal2-container[data-rsa-theme="light"] .rsa-tip-bubble::after{
        border-top-color: #0f172a;
      }

      .swal2-container[data-rsa-theme="light"] .swal2-input,
      .swal2-container[data-rsa-theme="light"] .swal2-select{
        background: #ffffff !important;
        color: #0f172a !important;
        border: 1px solid rgba(2,6,23,.15) !important;
        height: 36px !important; /* Minimalista */
        font-size: 13px !important;
        border-radius: 8px !important;
        padding: 0 10px !important;
      }

      .swal2-container[data-rsa-theme="light"] .swal2-input::placeholder{
        color: rgba(15,23,42,.40) !important;
      }

      .swal2-container[data-rsa-theme="light"] .swal2-input:focus,
      .swal2-container[data-rsa-theme="light"] .swal2-select:focus{
        border-color: rgba(11,31,58,.35) !important;
        box-shadow: 0 0 0 2px rgba(11,31,58,.1) !important;
        outline: none !important;
      }

      .swal2-container[data-rsa-theme="light"] .swal2-select option{
        background: #ffffff !important;
        color: #0f172a !important;
      }

      .swal2-container[data-rsa-theme="light"] .rsa-note{
        color: rgba(15,23,42,.6);
      }

      .swal2-container[data-rsa-theme="light"] .swal2-confirm{
        background: var(--rsa-navy) !important;
        color: #fff !important;
        border: 1px solid rgba(2,6,23,.08) !important;
        border-radius: 8px !important;
        font-weight: 800 !important;
        font-size: 13px !important;
        padding: 8px 12px !important;
        box-shadow: 0 4px 12px rgba(11,31,58,.15) !important;
      }

      .swal2-container[data-rsa-theme="light"] .swal2-confirm:hover{
        background: var(--rsa-navy-2) !important;
        color: #ffffff !important;
      }

      .swal2-container[data-rsa-theme="light"] .swal2-cancel{
        background: transparent !important;
        color: #0f172a !important;
        border: 1px solid rgba(2,6,23,.15) !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        border-radius: 8px !important;
        padding: 8px 12px !important;
      }

      .swal2-container[data-rsa-theme="light"] .swal2-cancel:hover{
        background: rgba(2,6,23,.04) !important;
        border-color: rgba(2,6,23,.25) !important;
      }
    `
    document.head.appendChild(style)
  }

  // Siempre actualiza el tema del container según el estado actual de la app
  const c = document.querySelector('.swal2-container') as HTMLElement | null
  if (c) c.setAttribute('data-rsa-theme', dark ? 'dark' : 'light')
}

function infoIconSvg() {
  return `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" stroke-width="2"/>
      <path d="M12 17v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 7.5h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `
}

export function useCategoriaCrud(options: UseCategoriaCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/categorias'

  /* =========================
   * Filtros (debounce)
   * ========================= */
  const filters = reactive<CategoriaFilters>({
    q: options.initialFilters?.q ?? '',
    tipo: options.initialFilters?.tipo ?? ALL,
    status: options.initialFilters?.status ?? ALL,
  })

  function buildParams() {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.tipo !== ALL) params.tipo = filters.tipo
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
    filters.tipo = ALL
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
    return Boolean(filters.q.trim()) || filters.tipo !== ALL || filters.status !== ALL
  })

  /* =========================
   * Form (SweetAlert2)
   * - Nuevo/Editar NO maneja status
   * - Siempre guarda activo
   * ========================= */
  async function openForm(categoria?: Categoria) {
    ensureSwalTheme()

    const isEdit = Boolean(categoria)
    const current = categoria
      ? {
        id: Number(categoria.id),
        nombre: String(categoria.nombre ?? ''),
        tipo: (categoria.tipo as CategoriaTipo) ?? 'PRODUCTO',
      }
      : null

    const nombreVal = escapeHtml(current?.nombre ?? '')

    const html = `
      <div class="rsa-form">
        <div class="rsa-row">
          <div class="rsa-label-row">
            <label class="rsa-label" for="cat_nombre">
              Nombre de la categoría
              <span class="rsa-tip">
                <span class="rsa-tip-btn" tabindex="0" aria-label="Información del campo nombre">
                  ${infoIconSvg()}
                </span>
                <span class="rsa-tip-bubble">Nombre visible para el cliente (ej. CCTV, Cableado).</span>
              </span>
            </label>
          </div>

          <input
            id="cat_nombre"
            class="swal2-input"
            placeholder="Ej. CCTV, Cableado, Acceso…"
            value="${nombreVal}"
            autocomplete="off"
          />
        </div>

        <div class="rsa-row">
          <div class="rsa-label-row">
            <label class="rsa-label" for="cat_tipo">
              Tipo
              <span class="rsa-tip">
                <span class="rsa-tip-btn" tabindex="0" aria-label="Información del campo tipo">
                  ${infoIconSvg()}
                </span>
                <span class="rsa-tip-bubble">PRODUCTO para catálogo, SERVICIO para instalaciones/soporte.</span>
              </span>
            </label>
          </div>

          <select id="cat_tipo" class="swal2-select">
            <option value="PRODUCTO" ${current?.tipo === 'PRODUCTO' ? 'selected' : ''}>PRODUCTO</option>
            <option value="SERVICIO" ${current?.tipo === 'SERVICIO' ? 'selected' : ''}>SERVICIO</option>
          </select>

          <p class="rsa-note">El estado se gestiona desde el listado (Activar / Desactivar).</p>
        </div>
      </div>
    `

    const { value } = await Swal.fire({
      title: isEdit ? 'Editar categoría' : 'Nueva categoría',
      html,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      heightAuto: false,
      didOpen: () => {
        const container = document.querySelector('.swal2-container') as HTMLElement | null
        if (container) container.setAttribute('data-rsa-theme', isAppDark() ? 'dark' : 'light')

        const n = document.getElementById('cat_nombre') as HTMLInputElement | null
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
        const nombre = (document.getElementById('cat_nombre') as HTMLInputElement | null)?.value?.trim() ?? ''
        const tipo = (document.getElementById('cat_tipo') as HTMLSelectElement | null)?.value as CategoriaTipo

        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio.')
          return
        }
        if (nombre.length < 2) {
          Swal.showValidationMessage('El nombre es demasiado corto.')
          return
        }
        if (tipo !== 'PRODUCTO' && tipo !== 'SERVICIO') {
          Swal.showValidationMessage('Selecciona un tipo válido.')
          return
        }

        return { nombre, tipo, status: 'activo' as CategoriaStatus }
      },
    })

    if (!value) return

    if (isEdit && current) {
      router.put(`${baseUrl}/${current.id}`, value, {
        preserveScroll: true,
        onSuccess: () => toast('Categoría actualizada', 'success'),
        onError: () => toast('Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onSuccess: () => toast('Categoría creada', 'success'),
      onError: () => toast('Revisa los campos', 'error'),
    })
  }

  async function deactivate(c: Categoria) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Desactivar categoría',
      text: `Se dará de baja "${c.nombre}" (baja lógica).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      heightAuto: false,
      didOpen: () => {
        const container = document.querySelector('.swal2-container') as HTMLElement | null
        if (container) container.setAttribute('data-rsa-theme', isAppDark() ? 'dark' : 'light')
      },
    })
    if (!isConfirmed) return

    router.delete(`${baseUrl}/${c.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Categoría desactivada', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  async function activate(c: Categoria) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Activar categoría',
      text: `Se activará "${c.nombre}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      heightAuto: false,
      didOpen: () => {
        const container = document.querySelector('.swal2-container') as HTMLElement | null
        if (container) container.setAttribute('data-rsa-theme', isAppDark() ? 'dark' : 'light')
      },
    })
    if (!isConfirmed) return

    router.put(
      `${baseUrl}/${c.id}`,
      { nombre: c.nombre, tipo: c.tipo, status: 'activo' as CategoriaStatus },
      {
        preserveScroll: true,
        onSuccess: () => toast('Categoría activada', 'success'),
        onError: () => toast('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(c: Categoria) {
    return c.status === 'activo' ? deactivate(c) : activate(c)
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
      heightAuto: false,
      didOpen: () => {
        const container = document.querySelector('.swal2-container') as HTMLElement | null
        if (container) container.setAttribute('data-rsa-theme', isAppDark() ? 'dark' : 'light')
      },
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
