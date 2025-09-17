-- =====================================================================
-- ROLLBACK DA MIGRAÇÃO 8: REMOVER POLÍTICAS DE RLS DAS TABELAS
-- =====================================================================
-- OBJETIVO: Reverter as políticas de segurança aplicadas às tabelas.
-- ATENÇÃO: Desativar o RLS pode expor todos os dados.
-- =====================================================================

-- ETAPA 1: Remover a política da tabela de agendamentos
DROP POLICY IF EXISTS "Utilizadores podem ver os seus próprios agendamentos" ON public.appointments;

-- ETAPA 2: Remover a política da tabela financeira
DROP POLICY IF EXISTS "Utilizadores podem ver as suas próprias finanças" ON public.financial_entries;

/*
-- ETAPA 3 (OPCIONAL): Desativar completamente o RLS para estas tabelas.
-- Descomente apenas se tiver a certeza de que nenhuma outra política é necessária.
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries DISABLE ROW LEVEL SECURITY;
*/

