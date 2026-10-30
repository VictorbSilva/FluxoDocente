-- Corrige os certificados emitidos com a carga calculada pela duração do curso.
UPDATE certificates SET carga_horaria = 8 WHERE course_id = 'ia-docencia' AND carga_horaria <> 8;
