<script setup lang="ts">
import { ref, onMounted } from 'vue';

const expedientes = ref([]);

const cargar = async () => {
  const r = await fetch(import.meta.env.VITE_API_URL + "/expedientes");
  expedientes.value = await r.json();
};

const verPDF = (b64: string) => {
  const binary = atob(b64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([array], { type: 'application/pdf' }));
  window.open(url);
};

onMounted(cargar);
</script>

<template>
  <div class="container">
    <h2>🏛️ Almacén de Expedientes Judiciales</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Hash SHA-256</th>
          <th>Fecha de Ingreso</th>
          <th>Documento</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ex in expedientes" :key="ex.id">
          <td>{{ ex.id }}</td>
          <td class="hash">{{ ex.hash_registrado }}</td>
          <td>{{ new Date(ex.fecha_ingreso).toLocaleString() }}</td>
          <td><button @click="verPDF(ex.pdf)">Abrir PDF</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.container { padding: 20px; background: #242424; border-radius: 10px; }
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th, td { padding: 12px; border: 1px solid #444; text-align: left; }
.hash { color: #42b883; font-family: monospace; font-size: 0.9em; }
button { background: #646cff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
</style>