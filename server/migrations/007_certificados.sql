CREATE TABLE certificates (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  codigo text NOT NULL UNIQUE,
  carga_horaria integer NOT NULL,
  emitido_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);
