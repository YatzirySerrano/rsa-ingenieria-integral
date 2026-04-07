import { computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'

export type QuoteCartItem = {
  tipo: 'PRODUCTO' | 'SERVICIO'
  producto_id?: number | null
  servicio_id?: number | null
  cantidad: number
}

const STORAGE_KEY = 'rsa_quote_cart_v1'

const cart = useStorage<QuoteCartItem[]>(STORAGE_KEY, [], localStorage, {
  mergeDefaults: true,
})

function addProducto(id: number) {
  const ex = cart.value.find((x) => x.tipo === 'PRODUCTO' && x.producto_id === id)
  if (ex) ex.cantidad += 1
  else cart.value.push({ tipo: 'PRODUCTO', producto_id: id, servicio_id: null, cantidad: 1 })
}

function addServicio(id: number) {
  const ex = cart.value.find((x) => x.tipo === 'SERVICIO' && x.servicio_id === id)
  if (ex) ex.cantidad += 1
  else cart.value.push({ tipo: 'SERVICIO', producto_id: null, servicio_id: id, cantidad: 1 })
}

function dec(index: number) {
  if (!cart.value[index]) return
  cart.value[index].cantidad = Math.max(1, cart.value[index].cantidad - 1)
}

function inc(index: number) {
  if (!cart.value[index]) return
  cart.value[index].cantidad += 1
}

function remove(index: number) {
  cart.value.splice(index, 1)
}

function clearCart() {
  cart.value = []
}

const itemsCount = computed(() =>
  cart.value.reduce((sum, it) => sum + (Number(it.cantidad) || 0), 0)
)

watch(
  cart,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true }
)

export function useQuoteCart() {
  return {
    cart,
    itemsCount,
    addProducto,
    addServicio,
    dec,
    inc,
    remove,
    clearCart,
  }
}
