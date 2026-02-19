<script setup lang="ts">
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { dashboard } from '@/routes';
import { index as productosIndex } from '@/routes/productos'
import { index as serviciosIndex } from '@/routes/Servicios'
import { index as cotizacionsIndex } from '@/routes/cotizaciones'
import { index as personasIndex } from '@/routes/personas'
import { index as categoriasIndex } from '@/routes/categorias'
import { index as marcasIndex } from '@/routes/marcas'
import { index as usuariosIndex } from '@/routes/usuarios'

import { type NavItem } from '@/types';
import { Link } from '@inertiajs/vue3';

import {
    Gauge,
    Boxes,
    Wrench,
    ClipboardList,
    Tags,
    Users,
    BadgeCheck,
    UserCog
} from 'lucide-vue-next';

import AppLogo from './AppLogo.vue';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: Gauge,
    },
    {
        title: 'Productos',
        href: productosIndex().url,
        icon: Boxes,
    },
    {
        title: 'Servicios',
        href: serviciosIndex().url,
        icon: Wrench,
    },
    {
        title: 'Cotizaciones',
        href: cotizacionsIndex().url,
        icon: ClipboardList,
    },
    {
        title: 'Categorías',
        href: categoriasIndex().url,
        icon: Tags,
    },
    {
        title: 'Personas',
        href: personasIndex().url,
        icon: Users,
    },
    {
        title: 'Marcas',
        href: marcasIndex().url,
        icon: BadgeCheck,
    },
    {
        title: 'Usuarios',
        href: usuariosIndex().url,
        icon: UserCog,
    },
];

const footerNavItems: NavItem[] = [];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="dashboard()">
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
