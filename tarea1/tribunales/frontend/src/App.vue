<script setup lang="ts">
import EnviarDatos from "./components/EnviarDatos.vue";
</script>

<template>
  <div>
    <h1>Suit:La ley de los audaces</h1>
  </div>

  <EnviarDatos />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
