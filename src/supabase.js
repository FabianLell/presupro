import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

export function calcularEstadoCuenta(perfil, cantidadPresupuestos) {
  if (!perfil) return { soloLectura: true, mensaje: "Tu cuenta no está configurada." }

  if (perfil.estado === "activo") return { soloLectura: false, mensaje: "" }

  if (perfil.estado === "desactivado") return {
    soloLectura: true,
    mensaje: "Tu cuenta fue desactivada. Contactate con nosotros para reactivarla."
  }

  // estado === "prueba" → evaluar período
  const inicio = new Date(perfil.fecha_inicio_prueba)
  const hoy = new Date()
  const diasTranscurridos = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24))
  const diasRestantes = 30 - diasTranscurridos

  if (diasTranscurridos >= 30) return {
    soloLectura: true,
    mensaje: "Tu período de prueba de 30 días ha vencido. Activá tu cuenta para continuar."
  }

  if (cantidadPresupuestos >= 30) return {
    soloLectura: true,
    mensaje: "Alcanzaste el límite de 30 presupuestos del período de prueba. Activá tu cuenta para continuar."
  }

  return {
    soloLectura: false,
    diasRestantes,
    presupuestosRestantes: 30 - cantidadPresupuestos,
    mensaje: ""
  }
}