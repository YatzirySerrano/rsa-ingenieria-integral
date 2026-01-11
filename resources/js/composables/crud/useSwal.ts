import Swal from 'sweetalert2'

/**
 * Helper centralizado para confirmaciones y alerts.
 * Evita repetir configuración y mantiene UI consistente.
 */
export function useSwal() {
    async function confirmDelete(label: string) {
        const res = await Swal.fire({
        title: 'Confirmar eliminación',
        text: `Se desactivará: ${label}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true,
        })
        return res.isConfirmed
    }

    async function toastSuccess(msg: string) {
        await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: msg,
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        })
    }

    async function toastError(msg: string) {
        await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: msg,
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
        })
    }

    async function showInfo(title: string, html: string) {
        await Swal.fire({
        title,
        html,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        })
    }

    return { confirmDelete, toastSuccess, toastError, showInfo }
}
