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
import { alarmasService } from '@/data/servicios/alarmas'

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
  <Head title="Alarmas | RSA" />

  <PublicLayout>
    <ServiceHero
      :image="alarmasService.hero.image"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :waLink="waLink"
      :badge="alarmasService.hero.badge"
      :title="alarmasService.hero.title"
      :description="alarmasService.hero.description"
      :applications="alarmasService.hero.applications"
      :highlights="alarmasService.hero.highlights"
      :bottomText="alarmasService.hero.bottomText"
    />

    <ServiceDetails
      :goCotizar="goCotizarServicios"
      :sectionText="alarmasService.details.sectionText"
      :includes="alarmasService.details.includes"
      :resultTitle="alarmasService.details.resultTitle"
      :resultText="alarmasService.details.resultText"
      :resultCards="alarmasService.details.resultCards"
    />

    <ServiceBrands
      :brands="alarmasService.brands"
    />

    <ServiceBenefits
      :tabs="alarmasService.benefits"
      :active="activeBenefit"
      :goCotizar="goCotizarServicios"
      :goTo="goTo"
      :image="alarmasService.benefitsSection.image"
      :badge="alarmasService.benefitsSection.badge"
      :imageTitles="alarmasService.benefitsSection.imageTitles"
      :imageTexts="alarmasService.benefitsSection.imageTexts"
      @update:active="activeBenefit = $event"
    />

    <ServiceSteps
      :steps="alarmasService.steps"
      :goCotizar="goCotizarServicios"
    />

    <ServiceCTA
      :waLink="waLink"
      :goCotizar="goCotizarServicios"
      :title="alarmasService.cta.title"
      :text="alarmasService.cta.text"
    />
  </PublicLayout>
</template>