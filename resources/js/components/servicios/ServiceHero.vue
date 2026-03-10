<script setup lang="ts">

defineProps<{
  image: string
  waLink: string
  goCotizar: () => void
  goTo: (id: string) => void
}>()

</script>

<template>

<section class="relative overflow-hidden">

<!-- background -->

<img
:src="image"
class="absolute inset-0 w-full h-full object-cover"
/>

<!-- overlay -->

<div class="absolute inset-0 bg-black/50"></div>

<!-- fade -->

<div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white"></div>

<!-- content -->

<div class="relative mx-auto max-w-7xl px-4 py-24">

<div class="grid lg:grid-cols-2 gap-10 items-center">

<!-- LEFT -->

<div class="text-white space-y-6" data-reveal>

<div class="inline-flex items-center rounded-full bg-white/10 backdrop-blur px-3 py-1 text-sm">
RSA · Videovigilancia profesional
</div>

<h1 class="text-5xl font-bold leading-tight">
Cámaras de seguridad
<span class="block">(CCTV)</span>
</h1>

<p class="text-white/80 max-w-xl">
Control visual 24/7 con evidencia confiable.
Diseñamos e instalamos sistemas estables con cobertura optimizada
y grabación continua, ajustados al nivel de riesgo de cada proyecto.
</p>

<!-- buttons -->

<div class="flex flex-wrap gap-4">

<button
class="bg-blue-600 hover:bg-blue-700 transition text-white px-6 h-11 rounded-xl"
@click="goCotizar"
>
Solicitar cotización
</button>

<button
class="border border-white/40 hover:bg-white/10 transition text-white px-6 h-11 rounded-xl"
@click="goTo('detalles')"
>
Saber más
</button>

<a
:href="waLink"
target="_blank"
class="border border-white/40 hover:bg-white/10 transition text-white px-6 h-11 rounded-xl flex items-center"
>
WhatsApp
</a>

</div>

<p class="text-sm text-white/70">
Aplicaciones:
<strong>Residencial</strong> ·
<strong>Comercial</strong> ·
<strong>Corporativo</strong> ·
<strong>Industrial</strong>
</p>

</div>

<!-- RIGHT -->

<div class="grid grid-cols-2 gap-4" data-reveal>

<!-- HD -->

<div class="glass-card">

<div class="icon">

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
<path stroke-width="2" d="M1.5 12s4.5-7.5 10.5-7.5S22.5 12 22.5 12s-4.5 7.5-10.5 7.5S1.5 12 1.5 12z"/>
<circle cx="12" cy="12" r="3" stroke-width="2"/>
</svg>

</div>

<div class="font-semibold">
HD / 4MP / 8MP
</div>

<p class="text-sm text-white/70">
Calidad según el proyecto
</p>

</div>

<!-- DVR -->

<div class="glass-card">

<div class="icon">

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
<rect x="3" y="4" width="18" height="6" rx="2" stroke-width="2"/>
<rect x="3" y="14" width="18" height="6" rx="2" stroke-width="2"/>
<circle cx="7" cy="7" r="1"/>
<circle cx="7" cy="17" r="1"/>
</svg>

</div>

<div class="font-semibold">
NVR / DVR
</div>

<p class="text-sm text-white/70">
Respaldo seguro de evidencia
</p>

</div>

<!-- REMOTE -->

<div class="glass-card">

<div class="icon">

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
<rect x="7" y="2" width="10" height="20" rx="2" stroke-width="2"/>
<circle cx="12" cy="18" r="1"/>
</svg>

</div>

<div class="font-semibold">
Acceso local y remoto
</div>

<p class="text-sm text-white/70">
Monitoreo estable desde app
</p>

</div>

<!-- SUPPORT -->

<div class="glass-card">

<div class="icon">

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
<path stroke-width="2" d="M14.7 6.3a4 4 0 01-5.4 5.4l-6.3 6.3 2.8 2.8 6.3-6.3a4 4 0 005.4-5.4z"/>
</svg>

</div>

<div class="font-semibold">
Soporte técnico
</div>

<p class="text-sm text-white/70">
Mantenimiento y seguimiento
</p>

</div>

<!-- bottom card -->

<div class="glass-card col-span-2 text-center">

Incluye: configuración por ingeniería, pruebas completas y entrega documentada.

</div>

</div>

</div>

</div>

</section>

</template>

<style scoped>

.glass-card{
padding:1.25rem;
border-radius:1rem;
background:rgba(255,255,255,0.08);
backdrop-filter: blur(12px);
border:1px solid rgba(255,255,255,0.18);
color:white;
display:flex;
flex-direction:column;
gap:.35rem;
}

.icon{
width:40px;
height:40px;
border-radius:999px;
background:rgba(255,255,255,0.15);
display:flex;
align-items:center;
justify-content:center;
margin-bottom:.35rem;
}

.icon svg{
width:18px;
height:18px;
color:white;
}

/* reveal animation */

[data-reveal]{
opacity:0;
transform:translateY(40px);
transition: all .9s ease;
}

[data-reveal].is-in{
opacity:1;
transform:none;
}

</style>