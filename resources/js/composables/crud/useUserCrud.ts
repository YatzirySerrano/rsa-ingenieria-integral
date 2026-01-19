import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

export type UserRol = 'admin' | 'vendedor' | 'cliente'
export type UserStatus = 'activo' | 'inactivo'

export type PersonaLite = {
  nombre_completo?: string
  telefono?: string
  empresa?: string
}

export type UserRow = {
  id: number
  name: string
  email: string
  rol: UserRol
  status: UserStatus
  persona?: PersonaLite | null
}

export type UserFilters = {
  q: string
  rol: string
  status: string
}

const ALL = '__all__'

type Options = {
  baseUrl?: string
  initialFilters?: Partial<UserFilters>
}

let swalStyled = false

function ensureSwalZIndex() {
  if (swalStyled) return
  const style = document.createElement('style')
  style.innerHTML = `
    .swal2-container { z-index: 20000 !important; }
    .swal2-popup { border-radius: 16px !important; }
  `
  document.head.appendChild(style)
  swalStyled = true
}

function escapeHtml(s: string) {
  return (s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function toOption(value: string, label?: string, selected?: boolean) {
  return `<option value="${escapeHtml(value)}"${selected ? ' selected' : ''}>${escapeHtml(label ?? value)}</option>`
}

export function useUserCrud(opts: Options = {}) {
  const baseUrl = opts.baseUrl ?? '/admin/users'

  const filters = reactive<UserFilters>({
    q: opts.initialFilters?.q ?? '',
    rol: opts.initialFilters?.rol ?? ALL,
    status: opts.initialFilters?.status ?? ALL,
  })

  let t: number | null = null
  const debouncedSync = () => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => {
      router.get(
        baseUrl,
        { ...filters },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        }
      )
    }, 250)
  }

  watch(() => [filters.q, filters.rol, filters.status], debouncedSync)

  const hasFilters = computed(() => {
    return !!filters.q.trim() || filters.rol !== ALL || filters.status !== ALL
  })

  const resetFilters = () => {
    filters.q = ''
    filters.rol = ALL
    filters.status = ALL
  }

  async function upsertUser(payload: {
    mode: 'create' | 'edit'
    user?: UserRow
    roles: string[]
    statuses: string[]
  }) {
    ensureSwalZIndex()

    const u = payload.user
    const isEdit = payload.mode === 'edit'
    const title = isEdit ? 'Editar usuario' : 'Crear usuario'
    const confirmText = isEdit ? 'Guardar cambios' : 'Crear'

    const rolesHtml = payload.roles
      .map(r => toOption(r, r, (u?.rol ?? 'cliente') === r))
      .join('')

    const statusesHtml = payload.statuses
      .map(s => toOption(s, s, (u?.status ?? 'activo') === s))
      .join('')

    const html = `
      <div class="swal-form" style="text-align:left; display:grid; gap:10px;">
        <div>
          <label style="display:block; font-size:12px; margin-bottom:6px;">Nombre</label>
          <input id="swal_name" class="swal2-input" style="width:100%; margin:0;" value="${escapeHtml(u?.name ?? '')}" placeholder="Nombre completo" />
        </div>

        <div>
          <label style="display:block; font-size:12px; margin-bottom:6px;">Email</label>
          <input id="swal_email" class="swal2-input" style="width:100%; margin:0;" value="${escapeHtml(u?.email ?? '')}" placeholder="correo@dominio.com" />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label style="display:block; font-size:12px; margin-bottom:6px;">Rol</label>
            <select id="swal_rol" class="swal2-input" style="width:100%; margin:0;">
              ${rolesHtml}
            </select>
          </div>

          <div>
            <label style="display:block; font-size:12px; margin-bottom:6px;">Status</label>
            <select id="swal_status" class="swal2-input" style="width:100%; margin:0;">
              ${statusesHtml}
            </select>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:12px; margin-bottom:6px;">Password ${isEdit ? '(opcional)' : ''}</label>
          <input id="swal_password" type="password" class="swal2-input" style="width:100%; margin:0;" placeholder="${isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}" />
        </div>
      </div>
    `

    const res = await Swal.fire({
      title,
      html,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = (document.getElementById('swal_name') as HTMLInputElement | null)?.value?.trim() ?? ''
        const email = (document.getElementById('swal_email') as HTMLInputElement | null)?.value?.trim() ?? ''
        const rol = (document.getElementById('swal_rol') as HTMLSelectElement | null)?.value?.trim() ?? ''
        const status = (document.getElementById('swal_status') as HTMLSelectElement | null)?.value?.trim() ?? ''
        const password = (document.getElementById('swal_password') as HTMLInputElement | null)?.value ?? ''

        if (!name) {
          Swal.showValidationMessage('El nombre es obligatorio.')
          return
        }
        if (!email || !email.includes('@')) {
          Swal.showValidationMessage('Email inválido.')
          return
        }
        if (!rol) {
          Swal.showValidationMessage('Selecciona un rol.')
          return
        }
        if (!status) {
          Swal.showValidationMessage('Selecciona un status.')
          return
        }
        if (!isEdit && password.trim().length < 8) {
          Swal.showValidationMessage('Password mínimo 8 caracteres.')
          return
        }

        return { name, email, rol, status, password: password.trim() }
      },
    })

    if (!res.isConfirmed || !res.value) return

    const data = res.value as { name: string; email: string; rol: string; status: string; password: string }

    if (isEdit && u) {
      router.put(`${baseUrl}/${u.id}`, data, { preserveScroll: true })
    } else {
      router.post(baseUrl, data, { preserveScroll: true })
    }
  }

  async function deleteUser(user: UserRow) {
    ensureSwalZIndex()

    const res = await Swal.fire({
      title: 'Eliminar usuario',
      html: `Vas a eliminar a <b>${escapeHtml(user.name)}</b> (${escapeHtml(user.email)}).<br/>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (!res.isConfirmed) return
    router.delete(`${baseUrl}/${user.id}`, { preserveScroll: true })
  }

  return {
    filters,
    hasFilters,
    resetFilters,
    upsertUser,
    deleteUser,
  }
}
