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
import { gpsService } from '@/data/servicios/gps'

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
  <Head title="GPS y rastreo vehicular | RSA" />

  <PublicLayout>
    <ServiceHero
      :image="gpsService.hero.image"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :waLink="waLink"
      :badge="gpsService.hero.badge"
      :title="gpsService.hero.title"
      :description="gpsService.hero.description"
      :applications="gpsService.hero.applications"
      :highlights="gpsService.hero.highlights"
      :bottomText="gpsService.hero.bottomText"
    />

    <ServiceDetails
      :goCotizar="goCotizarServicios"
      :sectionText="gpsService.details.sectionText"
      :includes="gpsService.details.includes"
      :resultTitle="gpsService.details.resultTitle"
      :resultText="gpsService.details.resultText"
      :resultCards="gpsService.details.resultCards"
    />

    <ServiceBrands
      :brands="gpsService.brands"
    />

    <ServiceBenefits
      :tabs="gpsService.benefits"
      :active="activeBenefit"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :image="gpsService.benefitsSection.image"
      :badge="gpsService.benefitsSection.badge"
      :imageTitles="gpsService.benefitsSection.imageTitles"
      :imageTexts="gpsService.benefitsSection.imageTexts"
      @update:active="activeBenefit = $event"
    />

    <ServiceSteps
      :steps="gpsService.steps"
      :goCotizar="goCotizarServicios"
    />

    <ServiceCTA
      :waLink="waLink"
      :goCotizar="goCotizarServicios"
      :title="gpsService.cta.title"
      :text="gpsService.cta.text"
    />
  </PublicLayout>
</template>