-- =====================================================================
-- ROLLBACK DA MIGRAÇÃO 7: REVERTER LIGAÇÃO DE AGENDAMENTOS E PROFISSIONAIS
-- =====================================================================
-- OBJETIVO:
-- 1. Readicionar a coluna de texto `professional`.
-- 2. Repopular a coluna `professional` com base no `professional_id`.
-- 3. Remover a obrigatoriedade (NOT NULL) da coluna `professional_id`.
-- 4. Restaurar a view `v_appointments_complete` para a sua versão anterior.
-- =====================================================================

-- ETAPA 1: Readicionar a coluna `professional` do tipo TEXT.
-- Usamos `IF NOT EXISTS` para segurança caso o script seja executado mais de uma vez.
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS professional TEXT;


-- ETAPA 2: Preencher a nova coluna `professional` com os nomes dos profissionais.
-- Buscamos o nome do profissional na tabela `professionals` usando a referência `professional_id`.
UPDATE appointments a
SET professional = p.name
FROM professionals p
WHERE a.professional_id = p.id;


-- ETAPA 3: Remover a restrição NOT NULL da coluna `professional_id`.
-- Isto permite que a coluna volte a ser opcional.
ALTER TABLE appointments ALTER COLUMN professional_id DROP NOT NULL;


-- ETAPA 4: Restaurar a VIEW `v_appointments_complete` para a versão anterior.
-- A view volta a incluir a coluna de texto `professional`.
DROP VIEW IF EXISTS v_appointments_complete;
CREATE OR REPLACE VIEW v_appointments_complete AS
SELECT 
  a.id,
  a.user_id,
  a.client_id,
  c.name as client_name,
  c.phone as client_phone,
  c.email as client_email,
  a.service,
  a.price,
  a.professional, -- Coluna de texto restaurada
  p.name as professional_name,
  a.appointment_date,
  a.end_date,
  a.attended,
  a.created_at,
  a.updated_at
FROM appointments a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN professionals p ON a.professional_id = p.id;


-- =====================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================
COMMENT ON COLUMN appointments.professional_id IS 'Referência ao profissional na tabela professionals';
