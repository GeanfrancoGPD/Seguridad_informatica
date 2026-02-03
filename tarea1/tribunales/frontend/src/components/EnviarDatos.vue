<script setup lang="ts">
function enviar() {
  const documento = document.getElementById(
    "document"
  ) as HTMLInputElement | null;

  if (!documento || !documento.files || documento.files.length === 0) {
    console.error("No se ha seleccionado ningún archivo.");
    return;
  }

  const file = documento.files[0];

  // Validar que sea PDF
  if (file?.type !== "application/pdf") {
    alert("Solo se permiten archivos PDF.");
    return;
  }

  const formData = new FormData();
  formData.append("data", file); // "data" es el nombre del campo

  fetch(import.meta.env.VITE_API_URL + "/enviar", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        console.log("Archivo enviado con éxito.");
      } else {
        console.error("Error al enviar el archivo.");
      }
    })
    .catch((error) => {
      console.error("Error de red:", error);
    });
}
</script>

<template>
  <div class="Datos">
    <input type="file" placeholder="Sube el archivos" id="document" />
    <button v-on:click="enviar()">Enviar Datos</button>
  </div>
</template>

<style>
.Datos {
  height: 150px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px;
}
</style>
