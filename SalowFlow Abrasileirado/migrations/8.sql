-- =====================================================================
-- MIGRAÇÃO 8: APLICAR ROW LEVEL SECURITY (RLS) NAS TABELAS BASE
-- =====================================================================
-- OBJETIVO:
-- 1. Garantir que o RLS esteja ativo nas tabelas principais.
-- 2. Criar políticas de acesso para que os utilizadores só possam ver os seus próprios dados.
--    As views (`v_appointments_complete`, `v_financial_summary`) herdarão automaticamente estas políticas.
-- =====================================================================

-- ETAPA 1: Ativar RLS na tabela de agendamentos (se ainda não estiver ativo)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments FORCE ROW LEVEL SECURITY;

-- ETAPA 2: Remover política antiga (se existir) e criar a nova para agendamentos
DROP POLICY IF EXISTS "Utilizadores podem ver os seus próprios agendamentos" ON public.appointments;
CREATE POLICY "Utilizadores podem ver os seus próprios agendamentos"
ON public.appointments
FOR SELECT
USING (auth.uid()::text = user_id);

-- ETAPA 3: Ativar RLS na tabela financeira (se ainda não estiver ativo)
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries FORCE ROW LEVEL SECURITY;

-- ETAPA 4: Remover política antiga (se existir) e criar a nova para finanças
DROP POLICY IF EXISTS "Utilizadores podem ver as suas próprias finanças" ON public.financial_entries;
CREATE POLICY "Utilizadores podem ver as suas próprias finanças"
ON public.financial_entries
FOR SELECT
USING (auth.uid()::text = user_id);

-- =====================================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================================
COMMENT ON POLICY "Utilizadores podem ver os seus próprios agendamentos" ON public.appointments
IS 'Garante que cada utilizador só pode aceder aos seus próprios dados de agendamento. A view v_appointments_complete herda esta política.';

COMMENT ON POLICY "Utilizadores podem ver as suas próprias finanças" ON public.financial_entries
IS 'Garante que cada utilizador só pode aceder aos seus próprios dados financeiros. A view v_financial_summary herda esta política.';