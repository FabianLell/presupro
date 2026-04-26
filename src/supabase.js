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
  if (!perfil) return { activo: false, soloLectura: true, mensaje: "" }

  // Si fue activado manualmente por el admin
  if (perfil.activo === true) return { activo: true, soloLectura: false, mensaje: "" }

  // Calcular días transcurridos
  const inicio = new Date(perfil.fecha_inicio_prueba)
  const hoy = new Date()
  const diasTranscurridos = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24))
  const diasRestantes = 30 - diasTranscurridos

  // Verificar límites
  const vencioTiempo = diasTranscurridos >= 30
  const vencioPresupuestos = cantidadPresupuestos >= 30

  if (vencioTiempo || vencioPresupuestos) {
    const motivo = vencioTiempo
      ? "Tu período de prueba de 30 días ha vencido."
      : "Alcanzaste el límite de 30 presupuestos del período de prueba."
    return {
      activo: false,
      soloLectura: true,
      mensaje: motivo
    }
  }

  // En período de prueba activo
  return {
    activo: false,
    soloLectura: false,
    diasRestantes,
    presupuestosRestantes: 30 - cantidadPresupuestos,
    mensaje: ""
  }
}