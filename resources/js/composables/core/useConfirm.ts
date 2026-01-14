export function useConfirm() {
    const ask = async (message: string): Promise<boolean> => {
        // Confirmación simple y confiable
        return window.confirm(message)
    }

    return { ask }
}
