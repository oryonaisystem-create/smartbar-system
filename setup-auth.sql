-- INSTRUÇÕES:
-- 1. Abra o painel do Supabase (https://supabase.com/dashboard)
-- 2. Vá em 'SQL Editor' -> 'New Query'
-- 3. Cole este código e clique em 'Run'

-- CRIAR USUÁRIO MESTRE (OWNER)
-- Nota: Supabase Auth usa tabelas internas do esquema 'auth'. 
-- O ideal é criar via Dash ou Script, mas este script força a entrada se necessário.

-- SE VOCÊ ESTÁ TENDO ERRO 'Invalid login credentials', tente o seguinte:
-- 1. Clique em 'Cadastre-se' na tela de login do SmartBar.
-- 2. Insira o e-mail: patrick.contatos@hotmail.com
-- 3. Insira a senha: 147369
-- 4. O sistema criará sua conta e você poderá logar imediatamente!

-- Configuração Master de Segurança:
-- Caso queira desativar a confirmação de e-mail (recomendado para testes):
-- Vá em Authentication -> Settings -> Providers -> Email -> Desmarque 'Confirm Email'.
