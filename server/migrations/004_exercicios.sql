CREATE TABLE exercise_results (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  melhor_acertos integer NOT NULL,
  total integer NOT NULL,
  aprovado_em timestamptz,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, module_id)
);

CREATE TABLE placement_answers (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  respostas jsonb NOT NULL,
  acertos integer,
  total integer NOT NULL,
  respondido_em timestamptz NOT NULL DEFAULT now()
);

-- Matricula no curso atual quem tem anotação e ainda não tinha matrícula.
INSERT INTO enrollments (user_id, course_id)
  SELECT DISTINCT user_id, 'ia-docencia' FROM lesson_notes
  ON CONFLICT DO NOTHING;
