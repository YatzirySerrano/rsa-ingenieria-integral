<script setup lang="ts">

defineProps<{
  goCotizar: () => void
}>()

const goMarcas = () => {
  const el = document.getElementById('marcas')
  if (!el) return

  window.scrollTo({
    top: el.offsetTop - 90,
    behavior: 'smooth'
  })
}

</script>

<template>

<section id="detalles" class="mx-auto max-w-7xl px-4 py-16">

  <div class="grid lg:grid-cols-2 gap-10 items-start">

    <!-- LEFT -->
    <div>

      <h2 class="text-3xl font-semibold text-gray-900 mb-2">
        Qué incluye
      </h2>

      <p class="text-gray-500 mb-8">
        Componentes y alcance operativo del servicio CCTV.
      </p>

      <div class="space-y-5">

        <div class="border rounded-2xl p-5 bg-white shadow-sm">
          <h3 class="font-semibold text-gray-900">
            Cámaras profesionales
          </h3>
          <p class="text-gray-500 text-sm mt-1">
            HD / 4MP / 8MP según el nivel de riesgo y cobertura.
          </p>
        </div>

        <div class="border rounded-2xl p-5 bg-white shadow-sm">
          <h3 class="font-semibold text-gray-900">
            NVR / DVR
          </h3>
          <p class="text-gray-500 text-sm mt-1">
            Grabación continua con respaldo seguro de evidencia.
          </p>
        </div>

        <div class="border rounded-2xl p-5 bg-white shadow-sm">
          <h3 class="font-semibold text-gray-900">
            Acceso local y remoto
          </h3>
          <p class="text-gray-500 text-sm mt-1">
            Operación desde sitio y monitoreo desde app.
          </p>
        </div>

        <div class="border rounded-2xl p-5 bg-white shadow-sm">
          <h3 class="font-semibold text-gray-900">
            Ingeniería + soporte
          </h3>
          <p class="text-gray-500 text-sm mt-1">
            Configuración, pruebas, entrega y mantenimiento.
          </p>
        </div>

      </div>

    </div>


    <!-- RIGHT -->
    <div class="border rounded-3xl p-8 bg-gray-50 shadow-sm">

      <h3 class="text-xl font-semibold text-gray-900 mb-3">
        Resultado esperado
      </h3>

      <p class="text-gray-600 mb-8">
        Un sistema de videovigilancia estable y escalable, con cobertura optimizada,
        evidencia utilizable y una operación diaria clara. Diseñado para prevenir,
        documentar y responder.
      </p>

      <div class="grid sm:grid-cols-2 gap-4 mb-8">

        <div class="border rounded-2xl p-4 bg-white">
          <h4 class="font-semibold text-gray-900 text-sm mb-1">
            Enfoque
          </h4>
          <p class="text-gray-500 text-sm">
            Continuidad + evidencia + prevención.
          </p>
        </div>

        <div class="border rounded-2xl p-4 bg-white">
          <h4 class="font-semibold text-gray-900 text-sm mb-1">
            Entregables
          </h4>
          <p class="text-gray-500 text-sm">
            Pruebas, ajustes y guía operativa.
          </p>
        </div>

      </div>

      <div class="flex flex-wrap gap-3">

        <button
          class="bg-blue-900 hover:bg-blue-900 text-white px-6 h-11 rounded-xl font-medium transition"
          @click="goCotizar"
        >
          Solicitar cotización
        </button>

        <button
          class="border px-6 h-11 rounded-xl text-gray-700 hover:bg-gray-100 transition"
          @click="goMarcas"
        >
          Ver marcas
        </button>

      </div>

    </div>

  </div>

</section>

</template>