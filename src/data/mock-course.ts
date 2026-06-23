import type { Course } from '@/types/content';

/**
 * Seed content for the MVP. Real content moves to Supabase + Mux later, but the
 * shape is identical so screens won't change. Quiz questions are what power the
 * core micro-loop, so each lesson ships with a short, punchy test.
 */
export const MOCK_COURSE: Course = {
  id: 'trading-101',
  title: 'Trading desde cero',
  description: 'Aprende a operar los mercados paso a paso, sin humo.',
  modules: [
    {
      id: 'm1',
      title: 'Fundamentos',
      lessons: [
        {
          id: 'l1',
          title: '¿Qué es el trading?',
          summary:
            'Qué significa operar, en qué se diferencia de invertir y cómo se gana (y se pierde) dinero.',
          durationSec: 240,
          muxPlaybackId: 'tq02FcCMn5gGMqAQJhn3cxF01YIXaczd8V02GCaNYGmykw',
          accent: '#208AEF',
          xpReward: 50,
          questions: [
            {
              id: 'l1q1',
              prompt: 'En trading, ¿qué significa "ir largo" (long)?',
              options: [
                { id: 'a', text: 'Comprar esperando que el precio suba' },
                { id: 'b', text: 'Vender esperando que el precio baje' },
                { id: 'c', text: 'No operar y esperar' },
                { id: 'd', text: 'Operar solo a largo plazo' },
              ],
              correctOptionId: 'a',
              explanation:
                'Ir largo es comprar un activo apostando a que suba: ganas si el precio sube por encima de tu entrada.',
            },
            {
              id: 'l1q2',
              prompt: '¿Cuál es la principal diferencia entre operar (trading) e invertir?',
              options: [
                { id: 'a', text: 'El trading busca aprovechar movimientos a corto plazo' },
                { id: 'b', text: 'Invertir siempre da más beneficio' },
                { id: 'c', text: 'El trading no tiene riesgo' },
                { id: 'd', text: 'No hay ninguna diferencia' },
              ],
              correctOptionId: 'a',
              explanation:
                'El trading suele buscar movimientos de corto/medio plazo; invertir es mantener activos durante mucho más tiempo.',
            },
            {
              id: 'l1q3',
              prompt: 'Si compras a 100 y el precio cae a 90, ¿qué ha pasado con tu posición larga?',
              options: [
                { id: 'a', text: 'Tienes una pérdida latente' },
                { id: 'b', text: 'Tienes una ganancia' },
                { id: 'c', text: 'No cambia nada' },
                { id: 'd', text: 'La posición se cierra sola' },
              ],
              correctOptionId: 'a',
              explanation:
                'Compraste a 100 y ahora vale 90: pierdes 10 por unidad mientras no cierres. Es una pérdida "latente" hasta que vendes.',
            },
          ],
        },
        {
          id: 'l2',
          title: 'Mercados y activos',
          summary:
            'Acciones, forex, cripto y materias primas: qué se opera en cada mercado y cómo se mueven.',
          durationSec: 300,
          muxPlaybackId: null,
          accent: '#16A34A',
          xpReward: 50,
          questions: [
            {
              id: 'l2q1',
              prompt: '¿Qué se intercambia en el mercado Forex?',
              options: [
                { id: 'a', text: 'Pares de divisas' },
                { id: 'b', text: 'Acciones de empresas' },
                { id: 'c', text: 'Criptomonedas únicamente' },
                { id: 'd', text: 'Materias primas' },
              ],
              correctOptionId: 'a',
              explanation:
                'Forex es el mercado de divisas: siempre operas un par, como EUR/USD, apostando a la fuerza de una moneda frente a otra.',
            },
            {
              id: 'l2q2',
              prompt: '¿Qué caracteriza al mercado de criptomonedas frente a la bolsa tradicional?',
              options: [
                { id: 'a', text: 'Opera 24/7, sin horario de cierre' },
                { id: 'b', text: 'Nunca es volátil' },
                { id: 'c', text: 'Está siempre cerrado los fines de semana' },
                { id: 'd', text: 'No se puede operar a la baja' },
              ],
              correctOptionId: 'a',
              explanation:
                'El cripto opera 24/7, también fines de semana, y suele ser más volátil que la bolsa tradicional.',
            },
            {
              id: 'l2q3',
              prompt: '¿Qué es una acción?',
              options: [
                { id: 'a', text: 'Una participación en la propiedad de una empresa' },
                { id: 'b', text: 'Un préstamo al banco central' },
                { id: 'c', text: 'Una divisa digital' },
                { id: 'd', text: 'Un tipo de materia prima' },
              ],
              correctOptionId: 'a',
              explanation:
                'Una acción representa una fracción de la propiedad de una empresa: si te va bien a la empresa, normalmente te va bien a ti.',
            },
          ],
        },
        {
          id: 'l3',
          title: 'Riesgo y gestión del capital',
          summary:
            'La regla que separa a quien dura de quien revienta la cuenta: cuánto arriesgar por operación.',
          durationSec: 360,
          muxPlaybackId: null,
          accent: '#DC2626',
          xpReward: 50,
          questions: [
            {
              id: 'l3q1',
              prompt: '¿Para qué sirve un stop-loss?',
              options: [
                { id: 'a', text: 'Cerrar la operación automáticamente para limitar la pérdida' },
                { id: 'b', text: 'Garantizar beneficios' },
                { id: 'c', text: 'Aumentar el apalancamiento' },
                { id: 'd', text: 'Evitar pagar comisiones' },
              ],
              correctOptionId: 'a',
              explanation:
                'El stop-loss cierra la posición a un precio fijado de antemano para que una operación no se te vaya de las manos.',
            },
            {
              id: 'l3q2',
              prompt: 'Una regla habitual de gestión de riesgo es no arriesgar por operación más de…',
              options: [
                { id: 'a', text: '1–2% de tu capital' },
                { id: 'b', text: '50% de tu capital' },
                { id: 'c', text: 'Todo el capital disponible' },
                { id: 'd', text: 'El 25% por operación' },
              ],
              correctOptionId: 'a',
              explanation:
                'Arriesgar solo 1–2% por operación hace que una mala racha no te elimine: puedes equivocarte muchas veces y seguir vivo.',
            },
            {
              id: 'l3q3',
              prompt: '¿Qué hace el apalancamiento con tu riesgo?',
              options: [
                { id: 'a', text: 'Amplifica tanto las ganancias como las pérdidas' },
                { id: 'b', text: 'Solo amplifica las ganancias' },
                { id: 'c', text: 'Elimina el riesgo' },
                { id: 'd', text: 'Reduce siempre la pérdida' },
              ],
              correctOptionId: 'a',
              explanation:
                'El apalancamiento multiplica tu exposición: gana más rápido, pero también pierde más rápido. Úsalo con respeto.',
            },
          ],
        },
      ],
    },
  ],
};
