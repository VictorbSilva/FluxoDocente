ALTER TABLE users ADD COLUMN nome text;

CREATE TABLE enrollments (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

-- Matricula no curso atual quem já tem progresso.
INSERT INTO enrollments (user_id, course_id)
  SELECT DISTINCT user_id, 'ia-docencia' FROM lesson_completions
  ON CONFLICT DO NOTHING;
