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
import { controlAccesoService } from '@/data/servicios/controlAcceso'

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
  <Head title="Control de acceso | RSA" />

  <PublicLayout>
    <ServiceHero
      :image="controlAccesoService.hero.image"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :waLink="waLink"
      :badge="controlAccesoService.hero.badge"
      :title="controlAccesoService.hero.title"
      :description="controlAccesoService.hero.description"
      :applications="controlAccesoService.hero.applications"
      :highlights="controlAccesoService.hero.highlights"
      :bottomText="controlAccesoService.hero.bottomText"
    />

    <ServiceDetails
      :goCotizar="goCotizarServicios"
      :sectionText="controlAccesoService.details.sectionText"
      :includes="controlAccesoService.details.includes"
      :resultTitle="controlAccesoService.details.resultTitle"
      :resultText="controlAccesoService.details.resultText"
      :resultCards="controlAccesoService.details.resultCards"
    />

    <ServiceBrands
      :brands="controlAccesoService.brands"
    />

    <ServiceBenefits
      :tabs="controlAccesoService.benefits"
      :active="activeBenefit"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :image="controlAccesoService.benefitsSection.image"
      :badge="controlAccesoService.benefitsSection.badge"
      :imageTitles="controlAccesoService.benefitsSection.imageTitles"
      :imageTexts="controlAccesoService.benefitsSection.imageTexts"
      @update:active="activeBenefit = $event"
    />

    <ServiceSteps
      :steps="controlAccesoService.steps"
      :goCotizar="goCotizarServicios"
    />

    <ServiceCTA
      :waLink="waLink"
      :goCotizar="goCotizarServicios"
      :title="controlAccesoService.cta.title"
      :text="controlAccesoService.cta.text"
    />
  </PublicLayout>
</template>