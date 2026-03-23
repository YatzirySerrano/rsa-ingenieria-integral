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
import { cercasElectricasService } from '@/data/servicios/cercasElectricas'

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
  <Head title="Cercas eléctricas | RSA" />

  <PublicLayout>
    <ServiceHero
      :image="cercasElectricasService.hero.image"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :waLink="waLink"
      :badge="cercasElectricasService.hero.badge"
      :title="cercasElectricasService.hero.title"
      :description="cercasElectricasService.hero.description"
      :applications="cercasElectricasService.hero.applications"
      :highlights="cercasElectricasService.hero.highlights"
      :bottomText="cercasElectricasService.hero.bottomText"
    />

    <ServiceDetails
      :goCotizar="goCotizarServicios"
      :sectionText="cercasElectricasService.details.sectionText"
      :includes="cercasElectricasService.details.includes"
      :resultTitle="cercasElectricasService.details.resultTitle"
      :resultText="cercasElectricasService.details.resultText"
      :resultCards="cercasElectricasService.details.resultCards"
    />

    <ServiceBrands
      :brands="cercasElectricasService.brands"
    />

    <ServiceBenefits
      :tabs="cercasElectricasService.benefits"
      :active="activeBenefit"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :image="cercasElectricasService.benefitsSection.image"
      :badge="cercasElectricasService.benefitsSection.badge"
      :imageTitles="cercasElectricasService.benefitsSection.imageTitles"
      :imageTexts="cercasElectricasService.benefitsSection.imageTexts"
      @update:active="activeBenefit = $event"
    />

    <ServiceSteps
      :steps="cercasElectricasService.steps"
      :goCotizar="goCotizarServicios"
    />

    <ServiceCTA
      :waLink="waLink"
      :goCotizar="goCotizarServicios"
      :title="cercasElectricasService.cta.title"
      :text="cercasElectricasService.cta.text"
    />
  </PublicLayout>
</template>