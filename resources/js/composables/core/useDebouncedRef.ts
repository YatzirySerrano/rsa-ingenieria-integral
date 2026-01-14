import { ref, watch, type Ref } from 'vue'

export function useDebouncedRef<T>(initial: T, delay = 400) {
    const value = ref<T>(initial) as Ref<T>
    const debounced = ref<T>(initial) as Ref<T>

    let t: number | undefined

    watch(
        value,
        (v) => {
        if (t) window.clearTimeout(t)
        t = window.setTimeout(() => (debounced.value = v), delay)
        },
        { deep: true }
    )
    return { value, debounced }
}
