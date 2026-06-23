-- Seed the MVP course ("Trading desde cero") into the content tables.
--
-- This mirrors src/data/mock-course.ts so the new admin panel has real data to
-- edit from day one. Idempotent (ON CONFLICT by slug) so it's safe to re-run and
-- safe to keep once the panel takes over content management.

-- Course -------------------------------------------------------------------
insert into public.courses (slug, title, description, position, is_published)
values ('trading-101', 'Trading desde cero',
        'Aprende a operar los mercados paso a paso, sin humo.', 0, true)
on conflict (slug) do update
  set title = excluded.title, description = excluded.description,
      position = excluded.position, is_published = excluded.is_published;

-- Module -------------------------------------------------------------------
insert into public.modules (course_id, slug, title, position)
select c.id, 'm1', 'Fundamentos', 0 from public.courses c where c.slug = 'trading-101'
on conflict (course_id, slug) do update
  set title = excluded.title, position = excluded.position;

-- Lessons ------------------------------------------------------------------
insert into public.lessons
  (module_id, slug, title, summary, duration_sec, accent, xp_reward, position,
   is_published, mux_playback_id, mux_status)
select m.id, v.slug, v.title, v.summary, v.duration_sec, v.accent, v.xp_reward,
       v.position, true, v.mux_playback_id, v.mux_status::public.mux_status
from public.modules m
join (values
  ('l1', '¿Qué es el trading?',
   'Qué significa operar, en qué se diferencia de invertir y cómo se gana (y se pierde) dinero.',
   240, '#208AEF', 50, 0, 'tq02FcCMn5gGMqAQJhn3cxF01YIXaczd8V02GCaNYGmykw', 'ready'),
  ('l2', 'Mercados y activos',
   'Acciones, forex, cripto y materias primas: qué se opera en cada mercado y cómo se mueven.',
   300, '#16A34A', 50, 1, null, 'none'),
  ('l3', 'Riesgo y gestión del capital',
   'La regla que separa a quien dura de quien revienta la cuenta: cuánto arriesgar por operación.',
   360, '#DC2626', 50, 2, null, 'none')
) as v(slug, title, summary, duration_sec, accent, xp_reward, position, mux_playback_id, mux_status)
  on true
where m.slug = 'm1'
on conflict (slug) do update
  set title = excluded.title, summary = excluded.summary,
      duration_sec = excluded.duration_sec, accent = excluded.accent,
      xp_reward = excluded.xp_reward, position = excluded.position,
      is_published = excluded.is_published, mux_playback_id = excluded.mux_playback_id,
      mux_status = excluded.mux_status;

-- Questions ----------------------------------------------------------------
insert into public.quiz_questions (lesson_id, slug, prompt, explanation, position)
select l.id, v.slug, v.prompt, v.explanation, v.position
from public.lessons l
join (values
  ('l1q1', 'En trading, ¿qué significa "ir largo" (long)?',
   'Ir largo es comprar un activo apostando a que suba: ganas si el precio sube por encima de tu entrada.', 0),
  ('l1q2', '¿Cuál es la principal diferencia entre operar (trading) e invertir?',
   'El trading suele buscar movimientos de corto/medio plazo; invertir es mantener activos durante mucho más tiempo.', 1),
  ('l1q3', 'Si compras a 100 y el precio cae a 90, ¿qué ha pasado con tu posición larga?',
   'Compraste a 100 y ahora vale 90: pierdes 10 por unidad mientras no cierres. Es una pérdida "latente" hasta que vendes.', 2)
) as v(slug, prompt, explanation, position) on true
where l.slug = 'l1'
on conflict (lesson_id, slug) do update
  set prompt = excluded.prompt, explanation = excluded.explanation, position = excluded.position;

insert into public.quiz_questions (lesson_id, slug, prompt, explanation, position)
select l.id, v.slug, v.prompt, v.explanation, v.position
from public.lessons l
join (values
  ('l2q1', '¿Qué se intercambia en el mercado Forex?',
   'Forex es el mercado de divisas: siempre operas un par, como EUR/USD, apostando a la fuerza de una moneda frente a otra.', 0),
  ('l2q2', '¿Qué caracteriza al mercado de criptomonedas frente a la bolsa tradicional?',
   'El cripto opera 24/7, también fines de semana, y suele ser más volátil que la bolsa tradicional.', 1),
  ('l2q3', '¿Qué es una acción?',
   'Una acción representa una fracción de la propiedad de una empresa: si te va bien a la empresa, normalmente te va bien a ti.', 2)
) as v(slug, prompt, explanation, position) on true
where l.slug = 'l2'
on conflict (lesson_id, slug) do update
  set prompt = excluded.prompt, explanation = excluded.explanation, position = excluded.position;

insert into public.quiz_questions (lesson_id, slug, prompt, explanation, position)
select l.id, v.slug, v.prompt, v.explanation, v.position
from public.lessons l
join (values
  ('l3q1', '¿Para qué sirve un stop-loss?',
   'El stop-loss cierra la posición a un precio fijado de antemano para que una operación no se te vaya de las manos.', 0),
  ('l3q2', 'Una regla habitual de gestión de riesgo es no arriesgar por operación más de…',
   'Arriesgar solo 1–2% por operación hace que una mala racha no te elimine: puedes equivocarte muchas veces y seguir vivo.', 1),
  ('l3q3', '¿Qué hace el apalancamiento con tu riesgo?',
   'El apalancamiento multiplica tu exposición: gana más rápido, pero también pierde más rápido. Úsalo con respeto.', 2)
) as v(slug, prompt, explanation, position) on true
where l.slug = 'l3'
on conflict (lesson_id, slug) do update
  set prompt = excluded.prompt, explanation = excluded.explanation, position = excluded.position;

-- Options ------------------------------------------------------------------
insert into public.question_options (question_id, slug, label, is_correct, position)
select q.id, v.slug, v.label, v.is_correct, v.position
from public.quiz_questions q
join (values
  ('a', 'Comprar esperando que el precio suba', true,  0),
  ('b', 'Vender esperando que el precio baje',  false, 1),
  ('c', 'No operar y esperar',                  false, 2),
  ('d', 'Operar solo a largo plazo',            false, 3)
) as v(slug, label, is_correct, position) on true
where q.slug = 'l1q1'
on conflict (question_id, slug) do update
  set label = excluded.label, is_correct = excluded.is_correct, position = excluded.position;

insert into public.question_options (question_id, slug, label, is_correct, position)
select q.id, v.slug, v.label, v.is_correct, v.position
from public.quiz_questions q
join (values
  ('a', 'El trading busca aprovechar movimientos a corto plazo', true,  0),
  ('b', 'Invertir siempre da más beneficio',                     false, 1),
  ('c', 'El trading no tiene riesgo',                            false, 2),
  ('d', 'No hay ninguna diferencia',                             false, 3)
) as v(slug, label, is_correct, position) on true
where q.slug = 'l1q2'
on conflict (question_id, slug) do update
  set label = excluded.label, is_correct = excluded.is_correct, position = excluded.position;

insert into public.question_options (question_id, slug, label, is_correct, position)
select q.id, v.slug, v.label, v.is_correct, v.position
from public.quiz_questions q
join (values
  ('a', 'Tienes una pérdida latente', true,  0),
  ('b', 'Tienes una ganancia',        false, 1),
  ('c', 'No cambia nada',             false, 2),
  ('d', 'La posición se cierra sola', false, 3)
) as v(slug, label, is_correct, position) on true
where q.slug = 'l1q3'
on conflict (question_id, slug) do update
  set label = excluded.label, is_correct = excluded.is_correct, position = excluded.position;

insert into public.question_options (question_id, slug, label, is_correct, position)
select q.id, v.slug, v.label, v.is_correct, v.position
from public.quiz_questions q
join (values
  ('a', 'Pares de divisas',         true,  0),
  ('b', 'Acciones de empresas',     false, 1),
  ('c', 'Criptomonedas únicamente', false, 2),
  ('d', 'Materias primas',          false, 3)
) as v(slug, label, is_correct, position) on true
where q.slug = 'l2q1'
on conflict (question_id, slug) do update
  set label = excluded.label, is_correct = excluded.is_correct, position = excluded.position;

insert into public.question_options (question_id, slug, label, is_correct, position)
select q.id, v.slug, v.label, v.is_correct, v.position
from public.quiz_questions q
join (values
  ('a', 'Opera 24/7, sin horario de cierre',          true,  0),
  ('b', 'Nunca es volátil',                           false, 1),
  ('c', 'Está siempre cerrado los fines de semana',   false, 2),
  ('d', 'No se puede operar a la baja',               false, 3)
) as v(slug, label, is_correct, position) on true
where q.slug = 'l2q2'
on conflict (question_id, slug) do update
  set label = excluded.label, is_correct = excluded.is_correct, position = excluded.position;

insert into public.question_options (question_id, slug, label, is_correct, position)
select q.id, v.slug, v.label, v.is_correct, v.position
from public.quiz_questions q
join (values
  ('a', 'Una participación en la propiedad de una empresa', true,  0),
  ('b', 'Un préstamo al banco central',                     false, 1),
  ('c', 'Una divisa digital',                               false, 2),
  ('d', 'Un tipo de materia prima',                         false, 3)
) as v(slug, label, is_correct, position) on true
where q.slug = 'l2q3'
on conflict (question_id, slug) do update
  set label = excluded.label, is_correct = excluded.is_correct, position = excluded.position;

insert into public.question_options (question_id, slug, label, is_correct, position)
select q.id, v.slug, v.label, v.is_correct, v.position
from public.quiz_questions q
join (values
  ('a', 'Cerrar la operación automáticamente para limitar la pérdida', true,  0),
  ('b', 'Garantizar beneficios',                                       false, 1),
  ('c', 'Aumentar el apalancamiento',                                  false, 2),
  ('d', 'Evitar pagar comisiones',                                     false, 3)
) as v(slug, label, is_correct, position) on true
where q.slug = 'l3q1'
on conflict (question_id, slug) do update
  set label = excluded.label, is_correct = excluded.is_correct, position = excluded.position;

insert into public.question_options (question_id, slug, label, is_correct, position)
select q.id, v.slug, v.label, v.is_correct, v.position
from public.quiz_questions q
join (values
  ('a', '1–2% de tu capital',          true,  0),
  ('b', '50% de tu capital',           false, 1),
  ('c', 'Todo el capital disponible',  false, 2),
  ('d', 'El 25% por operación',        false, 3)
) as v(slug, label, is_correct, position) on true
where q.slug = 'l3q2'
on conflict (question_id, slug) do update
  set label = excluded.label, is_correct = excluded.is_correct, position = excluded.position;

insert into public.question_options (question_id, slug, label, is_correct, position)
select q.id, v.slug, v.label, v.is_correct, v.position
from public.quiz_questions q
join (values
  ('a', 'Amplifica tanto las ganancias como las pérdidas', true,  0),
  ('b', 'Solo amplifica las ganancias',                    false, 1),
  ('c', 'Elimina el riesgo',                               false, 2),
  ('d', 'Reduce siempre la pérdida',                       false, 3)
) as v(slug, label, is_correct, position) on true
where q.slug = 'l3q3'
on conflict (question_id, slug) do update
  set label = excluded.label, is_correct = excluded.is_correct, position = excluded.position;
