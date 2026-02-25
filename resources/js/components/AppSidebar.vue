<script setup lang="ts">
import { computed } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'

import NavFooter from '@/components/NavFooter.vue'
import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { dashboard } from '@/routes'
import { index as productosIndex } from '@/routes/productos'
import { index as serviciosIndex } from '@/routes/Servicios'
import { index as cotizacionsIndex } from '@/routes/cotizaciones'
import { index as personasIndex } from '@/routes/personas'
import { index as categoriasIndex } from '@/routes/categorias'
import { index as marcasIndex } from '@/routes/marcas'
import { index as usuariosIndex } from '@/routes/usuarios'

import { type NavItem } from '@/types'

import {
  Gauge,
  Boxes,
  Wrench,
  ClipboardList,
  Tags,
  Users,
  BadgeCheck,
  UserCog,
} from 'lucide-vue-next'

import AppLogo from './AppLogo.vue'

// Tipado “pragmático”: evita el error de TS si tu PageProps no trae rol tipado
const page = usePage() as any
const rol = computed(() => String(page.props?.auth?.user?.rol ?? 'cliente'))

type NavItemExt = NavItem & {
  icon?: any
  roles?: string[]
}

// Menú maestro: aquí decides quién ve qué
const ALL_ITEMS: NavItemExt[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
    icon: Gauge,
    roles: ['admin', 'vendedor', 'cliente'],
  },
  {
    title: 'Productos',
    href: productosIndex().url,
    icon: Boxes,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Servicios',
    href: serviciosIndex().url,
    icon: Wrench,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Cotizaciones',
    href: cotizacionsIndex().url,
    icon: ClipboardList,
    roles: ['admin', 'vendedor', 'cliente'],
  },
  {
    title: 'Categorías',
    href: categoriasIndex().url,
    icon: Tags,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Personas',
    href: personasIndex().url,
    icon: Users,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Marcas',
    href: marcasIndex().url,
    icon: BadgeCheck,
    roles: ['admin', 'vendedor'],
  },
  {
    title: 'Usuarios',
    href: usuariosIndex().url,
    icon: UserCog,
    roles: ['admin'],
  },
]

// Items finales según rol
const mainNavItems = computed<NavItemExt[]>(() => {
  const r = rol.value

  // Regla explícita: cliente SOLO ve Dashboard y Cotizaciones (aunque exista roles config)
  if (r === 'cliente') {
    return ALL_ITEMS.filter(
      (i) => i.title === 'Dashboard' || i.title === 'Cotizaciones'
    )
  }

  // Para admin/vendedor: filtra por roles declarados
  return ALL_ITEMS.filter((i) => !i.roles || i.roles.includes(r))
})

const footerNavItems: NavItem[] = []
</script>

<template>
  <Sidebar collapsible="icon" variant="inset">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <Link :href="dashboard().url">
              <AppLogo />
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <NavMain :items="mainNavItems" />
    </SidebarContent>

    <SidebarFooter>
      <NavFooter :items="footerNavItems" />
      <NavUser />
    </SidebarFooter>
  </Sidebar>

  <slot />
</template>