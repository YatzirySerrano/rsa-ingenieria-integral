<script setup lang="ts">
type NavLink = { label: string; id: string }

const props = withDefaults(
  defineProps<{
    links: readonly NavLink[]
    onNav: (id: string) => void
    waLink: string
    logoSrc?: string
  }>(),
  { logoSrc: '/img/rsa-logo.png' }
)

const address = 'Blvd. Paseo Cuauhnáhuac Km 5.5 Tejalpa 62570 Jiutepec, Mexico'
const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`

const facebook = 'https://www.facebook.com/share/17udw6z1Gx/?mibextid=wwXIfr'
const tiktok = 'https://www.tiktok.com/@rsa.ingenieria.in?_r=1&_t=ZS-92YsP7r2oVN'
const email = 'rsaingenieriaintegral@gmail.com'
</script>

<template>
  <footer class="border-t border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8">
      <!-- Brand -->
      <div class="lg:col-span-4">
        <div class="flex items-center gap-3">
          <img :src="props.logoSrc" alt="RSA" class="h-10 w-10 rounded-xl object-contain" />
          <div>
            <div class="text-sm font-semibold text-slate-950 dark:text-white">RSA Ingeniería Integral</div>
            <div class="text-xs text-slate-600 dark:text-slate-300">Seguridad, control y soporte operativo.</div>
          </div>
        </div>

        <div class="mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <div class="font-medium text-slate-950 dark:text-white">Ubicación</div>
          <div>{{ address }}</div>

          <div class="pt-2">
            <div class="font-medium text-slate-950 dark:text-white">Correo</div>
            <a class="underline underline-offset-4" :href="`mailto:${email}`">{{ email }}</a>
          </div>
        </div>

        <!-- Redes (logos) -->
        <div class="mt-5 flex items-center gap-3">
          <!-- Facebook -->
          <a :href="facebook" target="_blank" rel="noopener noreferrer"
             class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
             aria-label="Facebook" title="Facebook">
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-slate-900 dark:fill-white" aria-hidden="true">
              <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.78-3.88 1.1 0 2.25.2 2.25.2v2.46h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.8l-.45 2.88h-2.35v6.99A10 10 0 0 0 22 12z"/>
            </svg>
          </a>

          <!-- TikTok -->
          <a :href="tiktok" target="_blank" rel="noopener noreferrer"
             class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
             aria-label="TikTok" title="TikTok">
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-slate-900 dark:fill-white" aria-hidden="true">
              <path d="M16.5 3c.4 2.6 2.1 4.6 4.5 4.9v3.1c-1.8.1-3.5-.5-4.9-1.6v6.9c0 3.4-2.8 6.2-6.2 6.2S3.7 19.7 3.7 16.3c0-3.4 2.8-6.2 6.2-6.2.4 0 .8 0 1.2.1v3.4c-.4-.1-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h3.2z"/>
            </svg>
          </a>

          <!-- WhatsApp -->
          <a :href="props.waLink" target="_blank" rel="noopener noreferrer"
             class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
             aria-label="WhatsApp" title="WhatsApp">
            <svg viewBox="0 0 32 32" class="h-5 w-5 fill-slate-900 dark:fill-white" aria-hidden="true">
              <path
                d="M19.11 17.17c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.16-.43-2.21-1.37-.82-.73-1.37-1.64-1.53-1.91-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.13-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.12 2.81c.13.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.27.23-.62.23-1.15.16-1.27-.07-.12-.25-.2-.52-.34ZM16.02 5.33c-5.89 0-10.67 4.78-10.67 10.67 0 1.88.49 3.7 1.43 5.3L5.2 26.67l5.55-1.46c1.53.83 3.25 1.27 5.27 1.27 5.89 0 10.67-4.78 10.67-10.67S21.91 5.33 16.02 5.33Z"
              />
            </svg>
          </a>
        </div>
      </div>

      <!-- Links -->
      <div class="lg:col-span-3">
        <div class="text-sm font-semibold text-slate-950 dark:text-white">Navegación</div>
        <div class="mt-3 flex flex-col gap-2">
          <button
            v-for="l in props.links"
            :key="l.id"
            type="button"
            class="w-fit text-sm text-slate-700 underline-offset-4 hover:underline dark:text-slate-300"
            @click="props.onNav(l.id)"
          >
            {{ l.label }}
          </button>
        </div>

        <div class="mt-6 text-sm font-semibold text-slate-950 dark:text-white">Horarios</div>
        <div class="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
          <div><span class="font-medium">Lunes a Viernes:</span> 8:00 a. m. - 6:00 p. m.</div>
          <div><span class="font-medium">Sábado:</span> 8:00 a. m. - 3:00 p. m.</div>
          <div><span class="font-medium">Domingo:</span> CERRADO</div>
        </div>
      </div>

      <!-- Map -->
      <div class="lg:col-span-5">
        <div class="text-sm font-semibold text-slate-950 dark:text-white">Mapa</div>
        <div class="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-neutral-800">
          <iframe
            :src="mapsEmbed"
            width="100%"
            height="260"
            style="border:0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Ubicación RSA"
          />
        </div>
      </div>
    </div>

    <div class="border-t border-slate-200 py-6 text-center text-xs text-slate-600 dark:border-neutral-800 dark:text-slate-400">
      © {{ new Date().getFullYear() }} RSA Ingeniería Integral. Todos los derechos reservados.
    </div>
  </footer>
</template>
