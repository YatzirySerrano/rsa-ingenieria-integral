<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Head } from '@inertiajs/vue3'
import { router } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { swalErr, swalLoading, swalClose, swalConfirm } from '@/lib/swal'

type Producto = { id: number; sku?: string | null; nombre: string; precio_venta: number }
type Servicio = { id: number; nombre: string; precio: number }

const props = defineProps<{
  meta: { productos: Producto[]; servicios: Servicio[] }
}>()

type CartItem = {
  tipo: 'PRODUCTO' | 'SERVICIO'
  producto_id?: number | null
  servicio_id?: number | null
  cantidad: number
}

const tab = ref<'PRODUCTO' | 'SERVICIO'>('PRODUCTO')
const q = ref('')

const form = reactive({
  email_destino: '',
  telefono_destino: '',
})

const cart = reactive<CartItem[]>([])

const prodMap = computed(() => new Map(props.meta.productos.map(p => [p.id, p])))
const servMap = computed(() => new Map(props.meta.servicios.map(s => [s.id, s])))

const productosFiltrados = computed(() => {
  const term = q.value.trim().toLowerCase()
  const all = props.meta.productos
  if (!term) return all
  return all.filter(p => `${p.sku ?? ''} ${p.nombre}`.toLowerCase().includes(term))
})

const serviciosFiltrados = computed(() => {
  const term = q.value.trim().toLowerCase()
  const all = props.meta.servicios
  if (!term) return all
  return all.filter(s => `${s.nombre}`.toLowerCase().includes(term))
})

function addProducto(id: number) {
  const ex = cart.find(x => x.tipo === 'PRODUCTO' && x.producto_id === id)
  if (ex) ex.cantidad += 1
  else cart.push({ tipo: 'PRODUCTO', producto_id: id, servicio_id: null, cantidad: 1 })
}

function addServicio(id: number) {
  const ex = cart.find(x => x.tipo === 'SERVICIO' && x.servicio_id === id)
  if (ex) ex.cantidad += 1
  else cart.push({ tipo: 'SERVICIO', producto_id: null, servicio_id: id, cantidad: 1 })
}

function dec(i: number) {
  cart[i].cantidad = Math.max(0.01, cart[i].cantidad - 1)
}
function inc(i: number) {
  cart[i].cantidad += 1
}
function remove(i: number) {
  cart.splice(i, 1)
}

function labelItem(it: CartItem) {
  if (it.tipo === 'PRODUCTO') {
    const p = prodMap.value.get(it.producto_id as number)
    return p ? `${p.sku ? p.sku + ' · ' : ''}${p.nombre}` : 'Producto'
  }
  const s = servMap.value.get(it.servicio_id as number)
  return s ? s.nombre : 'Servicio'
}

function unitPrice(it: CartItem) {
  if (it.tipo === 'PRODUCTO') return Number(prodMap.value.get(it.producto_id as number)?.precio_venta ?? 0)
  return Number(servMap.value.get(it.servicio_id as number)?.precio ?? 0)
}

const totalPreview = computed(() => {
  return cart.reduce((sum, it) => sum + unitPrice(it) * Number(it.cantidad || 0), 0)
})

async function submit() {
  if (!cart.length) return swalErr('Agrega al menos 1 item.')
  const email = form.email_destino.trim()
  const tel = form.telefono_destino.trim()
  if (!email && !tel) return swalErr('Captura al menos correo o teléfono.')

  const { isConfirmed } = await swalConfirm('Se enviará tu solicitud de cotización.', {
    title: 'Confirmar',
    confirmText: 'Enviar',
  })
  if (!isConfirmed) return

  swalLoading('Enviando...')
  router.post('/cotizar', {
    email_destino: email || null,
    telefono_destino: tel || null,
    items: cart.map(it => ({
      tipo: it.tipo,
      producto_id: it.tipo === 'PRODUCTO' ? it.producto_id : null,
      servicio_id: it.tipo === 'SERVICIO' ? it.servicio_id : null,
      cantidad: it.cantidad,
    })),
  }, {
    preserveScroll: true,
    onFinish: () => swalClose(),
    onError: () => swalErr('No se pudo enviar. Revisa datos e intenta otra vez.'),
  })
}
</script>

<template>
  <PublicLayout>
    <Head title="Cotizar" />

    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
          Cotización
        </h1>
        <p class="text-sm text-slate-600 dark:text-zinc-400">
          Selecciona productos/servicios y envía tus datos. Te responderemos con la cotización.
        </p>
      </div>

      <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 space-y-4">
          <div class="rounded-2xl border border-black/5 bg-white shadow-sm p-4 dark:bg-zinc-900/60 dark:border-white/10">
            <div class="flex flex-wrap items-center gap-2">
              <Button :variant="tab==='PRODUCTO' ? 'default' : 'secondary'" class="font-extrabold" @click="tab='PRODUCTO'">
                Productos
              </Button>
              <Button :variant="tab==='SERVICIO' ? 'default' : 'secondary'" class="font-extrabold" @click="tab='SERVICIO'">
                Servicios
              </Button>

              <div class="ml-auto w-full sm:w-72">
                <Input v-model="q" placeholder="Buscar..." />
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <div
                v-if="tab==='PRODUCTO'"
                v-for="p in productosFiltrados"
                :key="p.id"
                class="rounded-2xl border border-black/5 p-3 dark:border-white/10"
              >
                <p class="text-sm font-black text-slate-900 dark:text-zinc-100 truncate">
                  {{ p.sku ? p.sku + ' · ' : '' }}{{ p.nombre }}
                </p>
                <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  {{ Number(p.precio_venta).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
                </p>
                <Button class="mt-3 w-full font-extrabold" @click="addProducto(p.id)">
                  Agregar
                </Button>
              </div>

              <div
                v-if="tab==='SERVICIO'"
                v-for="s in serviciosFiltrados"
                :key="s.id"
                class="rounded-2xl border border-black/5 p-3 dark:border-white/10"
              >
                <p class="text-sm font-black text-slate-900 dark:text-zinc-100 truncate">
                  {{ s.nombre }}
                </p>
                <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  {{ Number(s.precio).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
                </p>
                <Button class="mt-3 w-full font-extrabold" @click="addServicio(s.id)">
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="rounded-2xl border border-black/5 bg-white shadow-sm p-4 dark:bg-zinc-900/60 dark:border-white/10">
            <h2 class="text-base font-black text-slate-900 dark:text-zinc-100">Tu carrito</h2>

            <div v-if="!cart.length" class="mt-3 text-sm text-slate-600 dark:text-zinc-400">
              Aún no agregas items.
            </div>

            <div v-else class="mt-3 space-y-2">
              <div v-for="(it, i) in cart" :key="i" class="rounded-xl border border-black/5 p-3 dark:border-white/10">
                <p class="text-sm font-black text-slate-900 dark:text-zinc-100 truncate">{{ labelItem(it) }}</p>
                <p class="text-xs text-slate-600 dark:text-zinc-400">
                  Precio: {{ unitPrice(it).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
                </p>

                <div class="mt-2 flex items-center gap-2">
                  <Button variant="secondary" class="font-extrabold" @click="dec(i)">-</Button>
                  <span class="text-sm font-black text-slate-900 dark:text-zinc-100">{{ it.cantidad }}</span>
                  <Button variant="secondary" class="font-extrabold" @click="inc(i)">+</Button>
                  <Button variant="destructive" class="ml-auto font-extrabold" @click="remove(i)">Quitar</Button>
                </div>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between text-sm">
              <span class="text-slate-600 dark:text-zinc-400">Total estimado</span>
              <span class="font-black text-slate-900 dark:text-zinc-100">
                {{ totalPreview.toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
              </span>
            </div>
          </div>

          <div class="rounded-2xl border border-black/5 bg-white shadow-sm p-4 dark:bg-zinc-900/60 dark:border-white/10">
            <h2 class="text-base font-black text-slate-900 dark:text-zinc-100">Contacto</h2>

            <div class="mt-3 space-y-3">
              <div class="space-y-1">
                <label class="text-xs font-extrabold text-slate-700 dark:text-zinc-300">Correo (opcional)</label>
                <Input v-model="form.email_destino" placeholder="cliente@correo.com" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-extrabold text-slate-700 dark:text-zinc-300">Teléfono (opcional)</label>
                <Input v-model="form.telefono_destino" placeholder="7771234567" />
              </div>

              <Button class="w-full font-extrabold" @click="submit">
                Enviar cotización
              </Button>

              <p class="text-xs text-slate-600 dark:text-zinc-400">
                Captura al menos correo o teléfono para poder responderte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>