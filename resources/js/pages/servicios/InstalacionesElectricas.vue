<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

import ServiceHero from '@/components/servicios/ServiceHero.vue'
import ServiceDetails from '@/components/servicios/ServiceDetails.vue'
import ServiceBrands from '@/components/servicios/ServiceBrands.vue'
import ServiceBenefits from '@/components/servicios/ServiceBenefits.vue'
import ServiceSteps from '@/components/servicios/ServiceSteps.vue'
import ServiceCTA from '@/components/servicios/ServiceCTA.vue'

import { RSA_PUBLIC } from '@/config/rsaPublic'
import { instalacionesElectricasService } from '@/data/servicios/instalacionesElectricas'

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
    behavior: 'smooth',
  })
}

onMounted(() => {
  const els = document.querySelectorAll('[data-reveal]')

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in')
      }
    })
  })

  els.forEach((el) => observer.observe(el))
})
</script>

<template>
  <Head title="Instalaciones eléctricas | RSA" />

  <PublicLayout>
    <ServiceHero
      :image="instalacionesElectricasService.hero.image"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :waLink="waLink"
      :badge="instalacionesElectricasService.hero.badge"
      :title="instalacionesElectricasService.hero.title"
      :description="instalacionesElectricasService.hero.description"
      :applications="instalacionesElectricasService.hero.applications"
      :highlights="instalacionesElectricasService.hero.highlights"
      :bottomText="instalacionesElectricasService.hero.bottomText"
    />

    <ServiceDetails
      :goCotizar="goCotizarServicios"
      :sectionText="instalacionesElectricasService.details.sectionText"
      :includes="instalacionesElectricasService.details.includes"
      :resultTitle="instalacionesElectricasService.details.resultTitle"
      :resultText="instalacionesElectricasService.details.resultText"
      :resultCards="instalacionesElectricasService.details.resultCards"
    />

    <ServiceBrands
        :brands="instalacionesElectricasService.brands"
        title="Materiales y conceptos que trabajamos"
    />

    <ServiceBenefits
      :tabs="instalacionesElectricasService.benefits"
      :active="activeBenefit"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :image="instalacionesElectricasService.benefitsSection.image"
      :badge="instalacionesElectricasService.benefitsSection.badge"
      :imageTitles="instalacionesElectricasService.benefitsSection.imageTitles"
      :imageTexts="instalacionesElectricasService.benefitsSection.imageTexts"
      @update:active="activeBenefit = $event"
    />

    <ServiceSteps
      :steps="instalacionesElectricasService.steps"
      :goCotizar="goCotizarServicios"
    />

    <ServiceCTA
      :waLink="waLink"
      :goCotizar="goCotizarServicios"
      :title="instalacionesElectricasService.cta.title"
      :text="instalacionesElectricasService.cta.text"
    />
  </PublicLayout>
</template>