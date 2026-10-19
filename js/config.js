/* ============================================================
   Configuración de Supabase — completar cuando el proyecto exista
   ------------------------------------------------------------
   1. Supabase → Settings → API
   2. Copiar "Project URL" y "anon public"
   3. Pegarlas abajo entre las comillas
   4. Guardar: la página y el panel quedan conectados

   La anon key es PÚBLICA por diseño (protegida por RLS).
   NUNCA pegar aquí la service_role: es secreta.
   ============================================================ */

window.CONFIG_SUPABASE = window.CONFIG_SUPABASE || {
  url: '',
  anonKey: ''
};
