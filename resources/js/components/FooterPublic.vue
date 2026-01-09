<script setup lang="ts">
import { RSA_PUBLIC } from '@/config/rsaPublic'

type NavLink = { label: string; id: string }

const props = withDefaults(
  defineProps<{
    links?: readonly NavLink[]
    onNav: (id: string) => void
    waLink?: string
    logoBlancoSrc?: string
  }>(),
  {
    links: () => RSA_PUBLIC.links,
    waLink: RSA_PUBLIC.waLink,
    logoBlancoSrc: RSA_PUBLIC.logoBlancoSrc,
  }
)

const address = 'Blvd. Paseo Cuauhnáhuac Km 5.5 Tejalpa 62570 Jiutepec, Mexico'
const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
const mapsLink = 'https://maps.app.goo.gl/Nd3AwQRbCpreLBhy9'

const facebook = 'https://www.facebook.com/share/17udw6z1Gx/?mibextid=wwXIfr'
const tiktok = 'https://www.tiktok.com/@rsa.ingenieria.in?_r=1&_t=ZS-92YsP7r2oVN'
const email = 'rsaingenieriaintegral@gmail.com'
</script>

<template>
  <footer class="relative overflow-hidden bg-[#07142B] text-white">
    <!-- Overlays decorativos -->
    <div class="pointer-events-none absolute inset-0 opacity-90" aria-hidden="true">
      <div class="absolute -top-24 left-[-140px] h-[420px] w-[420px] rounded-full bg-sky-400/15 blur-3xl" />
      <div class="absolute top-10 right-[-160px] h-[520px] w-[520px] rounded-full bg-blue-600/15 blur-3xl" />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
    </div>

    <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-12">
        <!-- LEFT -->
        <div class="lg:col-span-4">
          <!-- Logo -->
          <div class="flex h-14 items-center">
            <img :src="props.logoBlancoSrc" alt="RSA" class="h-12 w-auto object-contain" />
          </div>

          <!-- Misión / Visión -->
          <div class="mt-6 space-y-4 text-sm text-white/75">
            <div>
              <div class="text-xs font-semibold tracking-wide text-white/90">MISIÓN</div>
              <p class="mt-1 leading-relaxed">
                Proteger hogares y empresas con soluciones de seguridad confiables, instalación profesional y soporte preventivo.
              </p>
            </div>

            <div>
              <div class="text-xs font-semibold tracking-wide text-white/90">VISIÓN</div>
              <p class="mt-1 leading-relaxed">
                Ser la referencia regional en seguridad integral por calidad, respuesta y continuidad operativa.
              </p>
            </div>
          </div>

          <!-- Redes -->
          <div class="mt-6 flex items-center gap-3">
            <a :href="facebook" target="_blank" aria-label="Facebook">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white/80 hover:fill-white transition">
                <path
                  d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.78-3.88
                     1.1 0 2.25.2 2.25.2v2.46h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.8l-.45
                     2.88h-2.35v6.99A10 10 0 0 0 22 12z"
                />
              </svg>
            </a>

            <a :href="tiktok" target="_blank" aria-label="TikTok">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white/80 hover:fill-white transition">
                <path
                  d="M16.5 3c.4 2.6 2.1 4.6 4.5 4.9v3.1c-1.8.1-3.5-.5-4.9-1.6v6.9
                     c0 3.4-2.8 6.2-6.2 6.2S3.7 19.7 3.7 16.3c0-3.4 2.8-6.2 6.2-6.2
                     .4 0 .8 0 1.2.1v3.4c-.4-.1-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9
                     2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h3.2z"
                />
              </svg>
            </a>

            <a :href="`mailto:${email}`" aria-label="Correo">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white/80 hover:fill-white transition">
                <path
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1
                     0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8
                     5L4 8V6l8 5 8-5v2z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- NAVEGACIÓN -->
        <div class="lg:col-span-3">
          <div class="text-sm font-semibold">Navegación</div>

          <div class="mt-3 flex flex-col gap-2">
            <button
              v-for="l in props.links"
              :key="l.id"
              type="button"
              class="w-fit text-sm text-white/75 hover:text-white transition"
              @click="props.onNav(l.id)"
            >
              {{ l.label }}
            </button>
          </div>

          <div class="mt-6 text-sm font-semibold">Horarios</div>
          <div class="mt-3 space-y-1 text-sm text-white/75">
            <div>Lunes a Viernes: 9:00 a. m. - 5:00 p. m.</div>
            <div>Sábado: 9:00 a. m. - 2:00 p. m.</div>
            <div>Domingo: CERRADO</div>
          </div>
        </div>

        <!-- MAPA -->
        <div class="lg:col-span-5">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold">Mapa</div>
            <a :href="mapsLink" target="_blank" class="text-xs text-white/70 hover:text-white transition">
              Abrir en Maps
            </a>
          </div>

          <a :href="mapsLink" target="_blank" class="mt-3 block overflow-hidden rounded-2xl">
            <iframe
              :src="mapsEmbed"
              width="100%"
              height="260"
              style="border:0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Ubicación RSA"
            />
          </a>

          <div class="mt-2 text-xs text-white/60">
            Blvd. Paseo Cuauhnáhuac Km 5.5, Jiutepec, Morelos
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom -->
    <div class="py-6 text-center text-xs text-white/60">
      © {{ new Date().getFullYear() }} RSA Ingeniería Integral. Todos los derechos reservados.
    </div>
  </footer>
</template>
