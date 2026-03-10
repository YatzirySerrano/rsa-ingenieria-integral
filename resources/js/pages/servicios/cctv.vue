<script setup lang="ts">

import { Head } from '@inertiajs/vue3'
import { ref } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

import ServiceHero from '@/components/servicios/ServiceHero.vue'
import ServiceDetails from '@/components/servicios/ServiceDetails.vue'
import ServiceBrands from '@/components/servicios/ServiceBrands.vue'
import ServiceBenefits from '@/components/servicios/ServiceBenefits.vue'
import ServiceSteps from '@/components/servicios/ServiceSteps.vue'
import ServiceCTA from '@/components/servicios/ServiceCTA.vue'

import { RSA_PUBLIC } from '@/config/rsaPublic'
import { cctvService } from '@/data/servicios/cctv'

const waLink = RSA_PUBLIC.waLink

const activeBenefit = ref(0)

function goCotizarServicios() {
    window.location.href = '/cotizar?tab=servicios#servicios'
}

function goTo(id: string) {

    const el = document.getElementById(id)

    if (!el) return

    const offset = 84

    const top = el.getBoundingClientRect().top + window.scrollY - offset

    window.scrollTo({
        top,
        behavior: 'smooth'
    })
}

import { onMounted } from 'vue'

onMounted(()=>{

const els = document.querySelectorAll('[data-reveal]')

const observer = new IntersectionObserver(entries=>{
entries.forEach(e=>{
if(e.isIntersecting){
e.target.classList.add('is-in')
}
})
})

els.forEach(el=>observer.observe(el))

})

</script>

<template>

<Head title="CCTV | RSA" />

<PublicLayout>

<ServiceHero
:image="cctvService.hero.image"
:goCotizar="goCotizarServicios"
:goTo="goTo"
:waLink="waLink"
/>

<ServiceDetails
:goCotizar="goCotizarServicios"
/>

<ServiceBrands
:brands="cctvService.brands"
/>

<ServiceBenefits
:tabs="cctvService.benefits"
:active="activeBenefit"
primaryBtn="bg-blue-600 text-white px-6 h-11 rounded-xl"
:goCotizar="goCotizarServicios"
:goTo="goTo"
@update:activeBenefit="activeBenefit = $event"
/>

<ServiceSteps
:steps="cctvService.steps"
:goCotizar="goCotizarServicios"
/>

<ServiceCTA
:waLink="waLink"
:goCotizar="goCotizarServicios"
/>

</PublicLayout>

</template>