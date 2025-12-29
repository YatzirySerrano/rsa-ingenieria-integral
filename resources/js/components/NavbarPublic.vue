<script setup lang="ts">
import { computed, ref } from 'vue'
import { Link } from '@inertiajs/vue3'
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

const open = ref(false)

function go(id: string) {
  open.value = false
  props.onNav(id)
}

const itemBase =
  'relative text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition'

const underline =
  'after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-slate-950 after:transition-all after:duration-300 hover:after:w-full dark:after:bg-white'
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/70">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <!-- Logo -->
      <button type="button" class="flex items-center gap-3" @click="go('servicios')" aria-label="Ir al inicio">
        <img :src="props.logoSrc" alt="RSA" class="h-9 w-9 rounded-lg object-contain" />
      </button>

      <!-- Desktop nav -->
      <nav class="hidden items-center gap-7 md:flex">
        <button
          v-for="l in props.links"
          :key="l.id"
          type="button"
          :class="[itemBase, underline]"
          @click="go(l.id)"
        >
          {{ l.label }}
        </button>

        <div class="ml-2 flex items-center gap-2">
          <Link
            href="/login"
            class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/register"
            class="inline-flex h-10 items-center justify-center rounded-xl bg-blue-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      <!-- Mobile -->
      <div class="flex items-center gap-3 md:hidden">
        <Link
          href="/login"
          class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900"
        >
          Login
        </Link>

        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
          @click="open = !open"
          aria-label="Abrir menú"
        >
          <svg v-if="!open" viewBox="0 0 24 24" class="h-5 w-5 fill-slate-900 dark:fill-white" aria-hidden="true">
            <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="h-5 w-5 fill-slate-900 dark:fill-white" aria-hidden="true">
            <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3 1.42 1.42z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile dropdown -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-show="open" class="border-t border-slate-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
        <div class="flex flex-col gap-2">
          <button
            v-for="l in props.links"
            :key="l.id"
            type="button"
            class="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-neutral-900 dark:hover:text-white"
            @click="go(l.id)"
          >
            {{ l.label }}
          </button>

          <div class="mt-2 grid grid-cols-2 gap-2">
            <Link
              href="/login"
              class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/register"
              class="inline-flex h-10 items-center justify-center rounded-xl bg-blue-950 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>
