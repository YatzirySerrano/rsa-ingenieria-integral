<script setup lang="ts">
import { RSA_PUBLIC } from '@/config/rsaPublic'

type NavLink = { label: string; id: string }

const props = withDefaults(
  defineProps<{
    links?: readonly NavLink[]
    onNav: (id: string) => void
    waLink?: string
    logoSrc?: string
  }>(),
  {
    links: () => RSA_PUBLIC.links,
    waLink: RSA_PUBLIC.waLink,
    logoSrc: RSA_PUBLIC.logoSrc,
  }
)

const address = 'Blvd. Paseo Cuauhnáhuac Km 5.5 Tejalpa 62570 Jiutepec, Mexico'
const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`

const facebook = 'https://www.facebook.com/share/17udw6z1Gx/?mibextid=wwXIfr'
const tiktok = 'https://www.tiktok.com/@rsa.ingenieria.in?_r=1&_t=ZS-92YsP7r2oVN'
const email = 'rsaingenieriaintegral@gmail.com'

const softHover =
  'transition-all duration-300 ease-out hover:-translate-y-[1px] hover:bg-white/10 hover:shadow-[0_18px_60px_-40px_rgba(2,6,23,0.9)]'
</script>

<template>
  <footer
    class="relative overflow-hidden border-t border-white/10 bg-[#07142B] text-white"
  >
    <!-- Overlays (sin z-index negativo) -->
    <div class="pointer-events-none absolute inset-0 opacity-90" aria-hidden="true">
      <div
        class="absolute -top-24 left-[-140px] h-[420px] w-[420px] rounded-full
               bg-sky-400/15 blur-3xl"
      />
      <div
        class="absolute top-10 right-[-160px] h-[520px] w-[520px] rounded-full
               bg-blue-600/15 blur-3xl"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/35" />
    </div>

    <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-12">
        <!-- Brand -->
        <div class="lg:col-span-4">
          <div
            class="rounded-3xl border border-white/12 bg-white/6 p-6 backdrop-blur
                   shadow-[0_18px_60px_-40px_rgba(2,6,23,0.85)]"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/12">
                <img :src="props.logoSrc" alt="RSA" class="h-9 w-9 object-contain" />
              </div>
              <div>
                <div class="text-sm font-semibold">RSA Ingeniería Integral</div>
                <div class="text-xs text-white/70">Seguridad, control y soporte operativo.</div>
              </div>
            </div>

            <div class="mt-5 space-y-2 text-sm text-white/75">
              <div class="font-semibold text-white">Ubicación</div>
              <div class="leading-relaxed">{{ address }}</div>

              <div class="pt-2">
                <div class="font-semibold text-white">Correo</div>
                <a
                  class="inline-flex items-center gap-2 text-white/80 underline underline-offset-4
                         transition-colors hover:text-white"
                  :href="`mailto:${email}`"
                >
                  {{ email }}
                </a>
              </div>
            </div>

            <!-- Redes -->
            <div class="mt-5 flex items-center gap-3">
              <!-- Facebook -->
              <a
                :href="facebook"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex h-11 w-11 items-center justify-center rounded-2xl
                       border border-white/12 bg-white/6 backdrop-blur"
                :class="softHover"
                aria-label="Facebook"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white/85 transition group-hover:fill-white" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.78-3.88 1.1 0 2.25.2 2.25.2v2.46h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.8l-.45 2.88h-2.35v6.99A10 10 0 0 0 22 12z"/>
                </svg>
              </a>

              <!-- TikTok -->
              <a
                :href="tiktok"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex h-11 w-11 items-center justify-center rounded-2xl
                       border border-white/12 bg-white/6 backdrop-blur"
                :class="softHover"
                aria-label="TikTok"
                title="TikTok"
              >
                <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white/85 transition group-hover:fill-white" aria-hidden="true">
                  <path d="M16.5 3c.4 2.6 2.1 4.6 4.5 4.9v3.1c-1.8.1-3.5-.5-4.9-1.6v6.9c0 3.4-2.8 6.2-6.2 6.2S3.7 19.7 3.7 16.3c0-3.4 2.8-6.2 6.2-6.2.4 0 .8 0 1.2.1v3.4c-.4-.1-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h3.2z"/>
                </svg>
              </a>

              <!-- WhatsApp -->
              <a
                :href="props.waLink"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex h-11 w-11 items-center justify-center rounded-2xl
                       border border-white/12 bg-white/6 backdrop-blur"
                :class="softHover"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <svg viewBox="0 0 32 32" class="h-5 w-5 fill-white/85 transition group-hover:fill-white" aria-hidden="true">
                  <path d="M19.11 17.17c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.16-.43-2.21-1.37-.82-.73-1.37-1.64-1.53-1.91-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.13-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.12 2.81c.13.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.27.23-.62.23-1.15.16-1.27-.07-.12-.25-.2-.52-.34ZM16.02 5.33c-5.89 0-10.67 4.78-10.67 10.67 0 1.88.49 3.7 1.43 5.3L5.2 26.67l5.55-1.46c1.53.83 3.25 1.27 5.27 1.27 5.89 0 10.67-4.78 10.67-10.67S21.91 5.33 16.02 5.33Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Links -->
        <div class="lg:col-span-3">
          <div class="rounded-3xl border border-white/12 bg-white/6 p-6 backdrop-blur">
            <div class="text-sm font-semibold">Navegación</div>
            <div class="mt-3 flex flex-col gap-2">
              <button
                v-for="l in props.links"
                :key="l.id"
                type="button"
                class="group w-fit text-sm text-white/80 underline-offset-4 transition hover:text-white hover:underline"
                @click="props.onNav(l.id)"
              >
                <span class="inline-flex items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full bg-sky-300/90 opacity-0 transition group-hover:opacity-100" />
                  {{ l.label }}
                </span>
              </button>
            </div>

            <div class="mt-6 text-sm font-semibold">Horarios</div>
            <div class="mt-3 space-y-1 text-sm text-white/75">
              <div><span class="font-semibold text-white/90">Lunes a Viernes:</span> 8:00 a. m. - 6:00 p. m.</div>
              <div><span class="font-semibold text-white/90">Sábado:</span> 8:00 a. m. - 3:00 p. m.</div>
              <div><span class="font-semibold text-white/90">Domingo:</span> CERRADO</div>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div class="lg:col-span-5">
          <div class="rounded-3xl border border-white/12 bg-white/6 p-6 backdrop-blur">
            <div class="text-sm font-semibold">Mapa</div>

            <div
              class="relative mt-3 overflow-hidden rounded-2xl border border-white/12 bg-black/10 ring-1 ring-white/8"
              :class="softHover"
            >
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-sky-400/10 to-blue-600/10" aria-hidden="true" />
              <iframe
                :src="mapsEmbed"
                width="100%"
                height="260"
                style="border:0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Ubicación RSA"
                class="relative"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="relative border-t border-white/10 py-6">
      <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div class="text-xs text-white/70">
          © {{ new Date().getFullYear() }} RSA Ingeniería Integral. Todos los derechos reservados.
        </div>
      </div>
    </div>
  </footer>
</template>
