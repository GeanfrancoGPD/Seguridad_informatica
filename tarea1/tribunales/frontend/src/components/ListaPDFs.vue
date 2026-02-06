<script setup lang="ts">
import { ref, onMounted } from "vue";

const pdfs = ref<any[]>([]);

async function cargarPDFs() {
  const res = await fetch(import.meta.env.VITE_API_URL + "/datos");
  pdfs.value = await res.json();
}

function verPDF(id: number) {
  window.open(import.meta.env.VITE_API_URL + `/almacen/${id}/ver`, "_blank");
}

function descargarPDF(id: number) {
  window.location.href =
    import.meta.env.VITE_API_URL + `/almacen/${id}/descargar`;
}

onMounted(cargarPDFs);
</script>

<template>
  <div class="tabla-container">
    <h2>📑 Documentos almacenados</h2>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Hash</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="pdf in pdfs" :key="pdf.id">
          <td>{{ pdf.id }}</td>
          <td class="hash">{{ pdf.hash_archivo }}</td>
          <td>{{ new Date(pdf.fecha_ingreso).toLocaleString() }}</td>
          <td>
            <button @click="verPDF(pdf.id)">👁 Ver</button>
            <button @click="descargarPDF(pdf.id)">⬇ Descargar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tabla-container {
  padding: 20px;
}

table {
  border-collapse: collapse;
  width: 100%;
  font-family: Arial, sans-serif;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #ff0000;
}

.hash {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

button {
  margin-right: 5px;
  cursor: pointer;
}
</style>
