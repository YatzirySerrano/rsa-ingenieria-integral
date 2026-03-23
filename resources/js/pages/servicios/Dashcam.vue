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
import { dashcamService } from '@/data/servicios/dashcam'

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
  <Head title="Dash Cam | RSA" />

  <PublicLayout>
    <ServiceHero
      :image="dashcamService.hero.image"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :waLink="waLink"
      :badge="dashcamService.hero.badge"
      :title="dashcamService.hero.title"
      :description="dashcamService.hero.description"
      :applications="dashcamService.hero.applications"
      :highlights="dashcamService.hero.highlights"
      :bottomText="dashcamService.hero.bottomText"
    />

    <ServiceDetails
      :goCotizar="goCotizarServicios"
      :sectionText="dashcamService.details.sectionText"
      :includes="dashcamService.details.includes"
      :resultTitle="dashcamService.details.resultTitle"
      :resultText="dashcamService.details.resultText"
      :resultCards="dashcamService.details.resultCards"
    />

    <ServiceBrands
      :brands="dashcamService.brands"
    />

    <ServiceBenefits
      :tabs="dashcamService.benefits"
      :active="activeBenefit"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :image="dashcamService.benefitsSection.image"
      :badge="dashcamService.benefitsSection.badge"
      :imageTitles="dashcamService.benefitsSection.imageTitles"
      :imageTexts="dashcamService.benefitsSection.imageTexts"
      @update:active="activeBenefit = $event"
    />

    <ServiceSteps
      :steps="dashcamService.steps"
      :goCotizar="goCotizarServicios"
    />

    <ServiceCTA
      :waLink="waLink"
      :goCotizar="goCotizarServicios"
      :title="dashcamService.cta.title"
      :text="dashcamService.cta.text"
    />
  </PublicLayout>
</template>