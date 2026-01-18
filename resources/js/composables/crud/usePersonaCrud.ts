import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

/**
 * Personas:
 * - status se gestiona SOLO desde el listado (activar/desactivar)
 * - en Nuevo/Editar SIEMPRE mandamos status=activo
 * - filtros con debounce para UX fluida en tablas Inertia
 */

export type PersonaStatus = 'activo' | 'inactivo'

export type Persona = {
  id: number
  usuario_id?: number | null
  nombre: string
  apellido_paterno?: string | null
  apellido_materno?: string | null
  telefono?: string | null
  empresa?: string | null
  rfc?: string | null
  direccion?: string | null
  status: PersonaStatus

  // si lo mandas en PersonaResource:
  nombre_completo?: string | null
}

export type PersonaFilters = {
  q: string
  status: string
}

const ALL = '__all__'

type UsePersonaCrudOptions = {
  initialFilters?: Partial<PersonaFilters>
  baseUrl?: string
}

let swalStyled = false

/**
 * SweetAlert2 theme:
 * - default dark
 * - fallback light por prefers-color-scheme
 * - incluye estilos de option para selects cuando aplique (consistencia)
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
    }
  `
  document.head.appendChild(style)
}

export function usePersonaCrud(options: UsePersonaCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/personas'

  /* =========================
   * Filtros (debounce)
   * ========================= */
  const filters = reactive<PersonaFilters>({
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

  const hasActiveFilters = computed(() => Boolean(filters.q.trim()) || filters.status !== ALL)

  /* =========================
   * CRUD (SweetAlert2)
   * - Nuevo/Editar NO maneja status
   * - Siempre guarda activo
   * ========================= */
  async function openForm(persona?: Persona) {
    ensureSwalTheme()

    const isEdit = Boolean(persona)
    const current = persona
      ? {
          id: Number(persona.id),
          nombre: String(persona.nombre ?? ''),
          apellido_paterno: String(persona.apellido_paterno ?? ''),
          apellido_materno: String(persona.apellido_materno ?? ''),
          telefono: String(persona.telefono ?? ''),
          empresa: String(persona.empresa ?? ''),
          rfc: String(persona.rfc ?? ''),
          direccion: String(persona.direccion ?? ''),
        }
      : null

    const { value } = await Swal.fire({
      title: isEdit ? 'Editar persona' : 'Nuevo empleado',
      html: `
        <div style="display:grid; grid-template-columns:1fr; gap:.75rem; text-align:left; margin-top:.25rem;">
          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:900; opacity:.85;">Nombre(s)</label>
            <input id="p_nombre" class="swal2-input" placeholder="Ej. Juan Carlos" value="${current?.nombre ?? ''}">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:.75rem;">
            <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
              <label style="font-size:12px; font-weight:900; opacity:.85;">Apellido paterno</label>
              <input id="p_ap" class="swal2-input" placeholder="Ej. Pérez" value="${current?.apellido_paterno ?? ''}">
            </div>
            <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
              <label style="font-size:12px; font-weight:900; opacity:.85;">Apellido materno</label>
              <input id="p_am" class="swal2-input" placeholder="Ej. López" value="${current?.apellido_materno ?? ''}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:.75rem;">
            <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
              <label style="font-size:12px; font-weight:900; opacity:.85;">Teléfono</label>
              <input id="p_tel" class="swal2-input" inputmode="tel" placeholder="Ej. 7771234567" value="${current?.telefono ?? ''}">
            </div>
            <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
              <label style="font-size:12px; font-weight:900; opacity:.85;">RFC</label>
              <input id="p_rfc" class="swal2-input" placeholder="Ej. XAXX010101000" value="${current?.rfc ?? ''}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:900; opacity:.85;">Empresa (opcional)</label>
            <input id="p_emp" class="swal2-input" placeholder="Ej. RSA Ingeniería Integral" value="${current?.empresa ?? ''}">
          </div>

          <div style="display:grid; grid-template-columns:1fr; gap:.35rem;">
            <label style="font-size:12px; font-weight:900; opacity:.85;">Dirección (opcional)</label>
            <textarea id="p_dir" class="swal2-textarea" placeholder="Calle, número, colonia, ciudad...">${current?.direccion ?? ''}</textarea>
          </div>

          <p style="margin:.1rem 0 0; font-size:12px; opacity:.72;">
            El estado se gestiona desde el listado (Activar/Desactivar).
          </p>
        </div>
      `,
      didOpen: () => {
        const el = document.getElementById('p_nombre') as HTMLInputElement | null
        el?.focus()
        el?.select?.()
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById('p_nombre') as HTMLInputElement).value.trim()
        const apellido_paterno = (document.getElementById('p_ap') as HTMLInputElement).value.trim()
        const apellido_materno = (document.getElementById('p_am') as HTMLInputElement).value.trim()
        const telefono = (document.getElementById('p_tel') as HTMLInputElement).value.trim()
        const rfc = (document.getElementById('p_rfc') as HTMLInputElement).value.trim().toUpperCase()
        const empresa = (document.getElementById('p_emp') as HTMLInputElement).value.trim()
        const direccion = (document.getElementById('p_dir') as HTMLTextAreaElement).value.trim()

        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio.')
          return
        }

        return {
          nombre,
          apellido_paterno: apellido_paterno || null,
          apellido_materno: apellido_materno || null,
          telefono: telefono || null,
          rfc: rfc || null,
          empresa: empresa || null,
          direccion: direccion || null,
          status: 'activo' as const, // SIEMPRE activo al guardar desde form
        }
      },
    })

    if (!value) return

    if (isEdit && persona) {
      router.put(`${baseUrl}/${persona.id}`, value, {
        preserveScroll: true,
        onSuccess: () => toast('Persona actualizada', 'success'),
        onError: () => toast('Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onSuccess: () => toast('Persona creada', 'success'),
      onError: () => toast('Revisa los campos', 'error'),
    })
  }

  /* =========================
   * Status: baja lógica / activar
   * ========================= */
  async function deactivate(p: Persona) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Desactivar persona',
      text: `Se dará de baja "${displayName(p)}" (baja lógica).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    router.delete(`${baseUrl}/${p.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Persona desactivada', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  async function activate(p: Persona) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Activar persona',
      text: `Se activará "${displayName(p)}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    // payload completo por si UpdateRequest es estricto
    router.put(
      `${baseUrl}/${p.id}`,
      {
        nombre: p.nombre,
        apellido_paterno: p.apellido_paterno ?? null,
        apellido_materno: p.apellido_materno ?? null,
        telefono: p.telefono ?? null,
        empresa: p.empresa ?? null,
        rfc: (p.rfc ?? null) as any,
        direccion: p.direccion ?? null,
        status: 'activo' as const,
      },
      {
        preserveScroll: true,
        onSuccess: () => toast('Persona activada', 'success'),
        onError: () => toast('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(p: Persona) {
    return p.status === 'activo' ? deactivate(p) : activate(p)
  }

  /* =========================
   * Helpers UI
   * ========================= */
  function displayName(p: Persona) {
    const fromResource = String(p.nombre_completo ?? '').trim()
    if (fromResource) return fromResource

    const parts = [p.nombre, p.apellido_paterno ?? '', p.apellido_materno ?? '']
      .map((x) => String(x ?? '').trim())
      .filter(Boolean)
    return parts.join(' ') || `#${p.id}`
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

    displayName,
  }
}
