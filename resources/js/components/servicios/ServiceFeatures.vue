<script setup lang="ts">

interface Feature {
  title: string
  text: string
}

defineProps<{
  features: Feature[]
}>()

</script>

<template>

<section class="uk-section">

  <div class="uk-container">

    <div class="uk-grid-large uk-child-width-1-4@m uk-child-width-1-2@s" uk-grid>

      <div v-for="(feature,index) in features" :key="index">

        <div class="feature-card">

          <h3>
            {{ feature.title }}
          </h3>

          <p>
            {{ feature.text }}
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

</template>

<style scoped>

.feature-card{
  padding:30px;
  border:1px solid #eee;
  border-radius:6px;
  text-align:center;
}

.feature-card h3{
  font-weight:600;
  margin-bottom:8px;
}

.feature-card p{
  font-size:14px;
  opacity:0.8;
}

</style>