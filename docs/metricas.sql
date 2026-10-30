-- Rode no SQL Editor do Neon, branch main. Troque a lista de e-mails de teste em cada consulta.
--
-- Os dias são contados no fuso America/Fortaleza, o mesmo de acessos_diarios.
-- Logins e acessos só existem a partir da migração 011; antes dela não há histórico.


-- Funil do curso
WITH docentes AS (
  SELECT id FROM users
  WHERE email NOT IN ('teste1@exemplo.com', 'teste2@exemplo.com')
)
SELECT
  count(*) AS contas,
  count(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM enrollments e WHERE e.user_id = d.id AND e.course_id = 'ia-docencia'
  )) AS matriculados,
  -- Aula assistida = aula marcada como concluída.
  count(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM lesson_completions c WHERE c.user_id = d.id
  )) AS assistiram_alguma_aula,
  count(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM placement_answers p WHERE p.user_id = d.id
  )) AS responderam_diagnostico,
  count(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM placement_refusals r WHERE r.user_id = d.id
  )) AS pularam_diagnostico,
  count(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM certificates c WHERE c.user_id = d.id AND c.course_id = 'ia-docencia'
  )) AS emitiram_certificado
FROM docentes d;


-- Uma linha por docente, com as datas e o progresso de cada etapa
WITH docentes AS (
  SELECT id, email, nome, created_at FROM users
  WHERE email NOT IN ('teste1@exemplo.com', 'teste2@exemplo.com')
),
aulas AS (
  SELECT user_id, count(*) AS concluidas, min(completed_at) AS primeira, max(completed_at) AS ultima
  FROM lesson_completions
  GROUP BY user_id
),
avaliacoes AS (
  SELECT user_id, count(*) AS feitas, count(aprovado_em) AS aprovadas
  FROM exercise_results
  GROUP BY user_id
),
dispensas AS (
  SELECT user_id, count(*) AS modulos
  FROM module_skips
  GROUP BY user_id
),
entradas AS (
  SELECT user_id, count(*) AS total, max(criado_em) AS ultima
  FROM logins
  GROUP BY user_id
),
uso AS (
  SELECT user_id, count(*) AS dias, max(dia) AS ultimo_dia
  FROM acessos_diarios
  GROUP BY user_id
)
SELECT
  d.email,
  d.nome,
  d.created_at AS cadastro_em,
  m.enrolled_at AS matricula_em,
  pa.respondido_em AS diagnostico_respondido_em,
  pr.recusado_em AS diagnostico_pulado_em,
  coalesce(a.concluidas, 0) AS aulas_concluidas,
  a.primeira AS primeira_aula_em,
  a.ultima AS ultima_aula_em,
  coalesce(av.feitas, 0) AS avaliacoes_feitas,
  coalesce(av.aprovadas, 0) AS avaliacoes_aprovadas,
  coalesce(ds.modulos, 0) AS modulos_dispensados,
  c.emitido_em AS certificado_em,
  coalesce(en.total, 0) AS entradas,
  en.ultima AS ultima_entrada_em,
  coalesce(u.dias, 0) AS dias_de_uso,
  u.ultimo_dia AS ultimo_dia_de_uso
FROM docentes d
LEFT JOIN enrollments m ON m.user_id = d.id AND m.course_id = 'ia-docencia'
LEFT JOIN placement_answers pa ON pa.user_id = d.id
LEFT JOIN placement_refusals pr ON pr.user_id = d.id
LEFT JOIN aulas a ON a.user_id = d.id
LEFT JOIN avaliacoes av ON av.user_id = d.id
LEFT JOIN dispensas ds ON ds.user_id = d.id
LEFT JOIN certificates c ON c.user_id = d.id AND c.course_id = 'ia-docencia'
LEFT JOIN entradas en ON en.user_id = d.id
LEFT JOIN uso u ON u.user_id = d.id
ORDER BY d.created_at;


-- Cadastros por dia
WITH docentes AS (
  SELECT id, created_at FROM users
  WHERE email NOT IN ('teste1@exemplo.com', 'teste2@exemplo.com')
)
SELECT
  (created_at AT TIME ZONE 'America/Fortaleza')::date AS dia,
  count(*) AS cadastros
FROM docentes
GROUP BY 1
ORDER BY 1;


-- Logins por dia (a entrada pelo cadastro aparece separada)
WITH docentes AS (
  SELECT id FROM users
  WHERE email NOT IN ('teste1@exemplo.com', 'teste2@exemplo.com')
)
SELECT
  (l.criado_em AT TIME ZONE 'America/Fortaleza')::date AS dia,
  count(*) FILTER (WHERE l.origem = 'login') AS logins,
  count(*) FILTER (WHERE l.origem = 'cadastro') AS entradas_pelo_cadastro,
  count(DISTINCT l.user_id) AS docentes
FROM logins l
JOIN docentes d ON d.id = l.user_id
GROUP BY 1
ORDER BY 1;


-- Docentes ativos por dia
WITH docentes AS (
  SELECT id FROM users
  WHERE email NOT IN ('teste1@exemplo.com', 'teste2@exemplo.com')
)
SELECT a.dia, count(*) AS docentes_ativos
FROM acessos_diarios a
JOIN docentes d ON d.id = a.user_id
GROUP BY a.dia
ORDER BY a.dia;


-- Docentes ativos por semana (a semana começa na segunda-feira)
WITH docentes AS (
  SELECT id FROM users
  WHERE email NOT IN ('teste1@exemplo.com', 'teste2@exemplo.com')
)
SELECT
  date_trunc('week', a.dia::timestamp)::date AS semana,
  count(DISTINCT a.user_id) AS docentes_ativos
FROM acessos_diarios a
JOIN docentes d ON d.id = a.user_id
GROUP BY 1
ORDER BY 1;


-- Avaliação de cada módulo
WITH docentes AS (
  SELECT id FROM users
  WHERE email NOT IN ('teste1@exemplo.com', 'teste2@exemplo.com')
)
SELECT
  r.module_id AS modulo,
  count(*) AS fizeram,
  count(r.aprovado_em) AS aprovados,
  round(avg(r.melhor_acertos), 2) AS media_da_melhor_nota_acertos,
  round(avg(r.melhor_acertos::numeric / nullif(r.total, 0)) * 100, 1) AS media_da_melhor_nota_pct
FROM exercise_results r
JOIN docentes d ON d.id = r.user_id
GROUP BY r.module_id
ORDER BY r.module_id;


-- Matriculados sem acesso há 14 dias ou mais
-- ultimo_dia_de_uso vazio: sem nenhum acesso registrado desde a migração 011.
WITH docentes AS (
  SELECT id, email, nome FROM users
  WHERE email NOT IN ('teste1@exemplo.com', 'teste2@exemplo.com')
),
uso AS (
  SELECT user_id, max(dia) AS ultimo_dia
  FROM acessos_diarios
  GROUP BY user_id
)
SELECT
  d.email,
  d.nome,
  m.enrolled_at AS matricula_em,
  u.ultimo_dia AS ultimo_dia_de_uso
FROM docentes d
JOIN enrollments m ON m.user_id = d.id AND m.course_id = 'ia-docencia'
LEFT JOIN uso u ON u.user_id = d.id
WHERE u.ultimo_dia IS NULL
   OR u.ultimo_dia <= (now() AT TIME ZONE 'America/Fortaleza')::date - 14
ORDER BY u.ultimo_dia NULLS FIRST, d.email;
