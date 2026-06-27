
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
import { infraestructuraRedService } from '@/data/servicios/infraestructuraRed'

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
  <Head title="Infraestructura de red empresarial | RSA" />

  <PublicLayout>
    <ServiceHero
      :image="infraestructuraRedService.hero.image"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :waLink="waLink"
      :badge="infraestructuraRedService.hero.badge"
      :title="infraestructuraRedService.hero.title"
      :description="infraestructuraRedService.hero.description"
      :applications="infraestructuraRedService.hero.applications"
      :highlights="infraestructuraRedService.hero.highlights"
      :bottomText="infraestructuraRedService.hero.bottomText"
    />

    <ServiceDetails
      :goCotizar="goCotizarServicios"
      :sectionText="infraestructuraRedService.details.sectionText"
      :includes="infraestructuraRedService.details.includes"
      :resultTitle="infraestructuraRedService.details.resultTitle"
      :resultText="infraestructuraRedService.details.resultText"
      :resultCards="infraestructuraRedService.details.resultCards"
    />

    <ServiceBrands
      :brands="infraestructuraRedService.brands"
      title="Equipos y conceptos que trabajamos"
    />

    <ServiceBenefits
      :tabs="infraestructuraRedService.benefits"
      :active="activeBenefit"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :image="infraestructuraRedService.benefitsSection.image"
      :badge="infraestructuraRedService.benefitsSection.badge"
      :imageTitles="infraestructuraRedService.benefitsSection.imageTitles"
      :imageTexts="infraestructuraRedService.benefitsSection.imageTexts"
      @update:active="activeBenefit = $event"
    />

    <ServiceSteps
      :steps="infraestructuraRedService.steps"
      :goCotizar="goCotizarServicios"
    />

    <ServiceCTA
      :waLink="waLink"
      :goCotizar="goCotizarServicios"
      :title="infraestructuraRedService.cta.title"
      :text="infraestructuraRedService.cta.text"
    />
  </PublicLayout>
</template>