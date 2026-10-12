---------------------------------------------------------------
-- Nous Sight - H2 seed data (default profile)
--
-- Copy of PART 2 (DML) of Docs/sql/sprint4.sql, unchanged.
-- Tables and sequences are created by Hibernate from the
-- entities (ddl-auto=create-drop); this file only fills them.
-- On Oracle this file is not executed (spring.sql.init.mode=never).
---------------------------------------------------------------

---------------------------------------------------------------
-- PARTE 2 - DML
---------------------------------------------------------------

-- OBJETIVO:
-- Popular todas as tabelas com dados fictícios, realistas e
-- consistentes, além de demonstrar operações de UPDATE e DELETE.
--
-- Os INSERTs respeitam as dependências entre as tabelas.
-- Os IDs são gerados pelas SEQUENCES criadas no DDL.
--
-- Importante: este script deve ser executado logo após o DDL.sql,
-- que remove e recria as tabelas e sequences. Assim os IDs gerados
-- começam em 1 e as chaves estrangeiras informadas abaixo apontam
-- para os registros corretos.

---------------------------------------------------------------
-- 1. INSERT - DEPARTAMENTO
-- 5 registros
---------------------------------------------------------------

INSERT INTO DEPARTAMENTO
    (ID_DEPARTAMENTO, NOME_DEPARTAMENTO, SIGLA)
VALUES
    (SEQ_DEPARTAMENTO.NEXTVAL, 'Vendas', 'VEND');

INSERT INTO DEPARTAMENTO
    (ID_DEPARTAMENTO, NOME_DEPARTAMENTO, SIGLA)
VALUES
    (SEQ_DEPARTAMENTO.NEXTVAL, 'Tecnologia', 'TI');

INSERT INTO DEPARTAMENTO
    (ID_DEPARTAMENTO, NOME_DEPARTAMENTO, SIGLA)
VALUES
    (SEQ_DEPARTAMENTO.NEXTVAL, 'Marketing', 'MKT');

INSERT INTO DEPARTAMENTO
    (ID_DEPARTAMENTO, NOME_DEPARTAMENTO, SIGLA)
VALUES
    (SEQ_DEPARTAMENTO.NEXTVAL, 'Financeiro', 'FIN');

INSERT INTO DEPARTAMENTO
    (ID_DEPARTAMENTO, NOME_DEPARTAMENTO, SIGLA)
VALUES
    (SEQ_DEPARTAMENTO.NEXTVAL, 'Recursos Humanos', 'RH');

---------------------------------------------------------------
-- 2. INSERT - PARTICIPANTE
-- 10 registros
---------------------------------------------------------------

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Ana Beatriz Souza', 'ana.souza@empresa.com', 1);

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Carlos Eduardo Lima', 'carlos.lima@empresa.com', 2);

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Mariana Costa Alves', 'mariana.alves@empresa.com', 3);

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Joao Pedro Oliveira', 'joao.oliveira@empresa.com', 4);

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Beatriz Santos Rocha', 'beatriz.rocha@empresa.com', 5);

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Rafael Martins', 'rafael.martins@empresa.com', 1);

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Juliana Ferreira', 'juliana.ferreira@empresa.com', 2);

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Lucas Almeida', 'lucas.almeida@empresa.com', 3);

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Fernanda Martins', 'fernanda.martins@empresa.com', 4);

INSERT INTO PARTICIPANTE
    (ID_PARTICIPANTE, NOME, EMAIL, ID_DEPARTAMENTO)
VALUES
    (SEQ_PARTICIPANTE.NEXTVAL, 'Gabriel Mendes', 'gabriel.mendes@empresa.com', 5);


---------------------------------------------------------------
-- 3. INSERT - REUNIAO
-- 10 registros
---------------------------------------------------------------

INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Planejamento Comercial do Trimestre',
     TO_DATE('01/09/2026 09:00', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('01/09/2026 10:00', 'DD/MM/YYYY HH24:MI'));

INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Apresentacao do Novo Produto',
     TO_DATE('02/09/2026 14:00', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('02/09/2026 15:30', 'DD/MM/YYYY HH24:MI'));

INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Reuniao de Resultados Mensais',
     TO_DATE('03/09/2026 11:00', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('03/09/2026 12:00', 'DD/MM/YYYY HH24:MI'));

INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Alinhamento de Tecnologia',
     TO_DATE('04/09/2026 10:00', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('04/09/2026 11:30', 'DD/MM/YYYY HH24:MI'));

INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Estrategia de Marketing Digital',
     TO_DATE('05/09/2026 15:00', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('05/09/2026 16:00', 'DD/MM/YYYY HH24:MI'));

INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Analise de Indicadores Financeiros',
     TO_DATE('08/09/2026 09:30', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('08/09/2026 10:30', 'DD/MM/YYYY HH24:MI'));

INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Revisao do Projeto de Integracao',
     TO_DATE('09/09/2026 13:00', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('09/09/2026 14:00', 'DD/MM/YYYY HH24:MI'));

INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Planejamento de Treinamentos',
     TO_DATE('10/09/2026 16:00', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('10/09/2026 17:00', 'DD/MM/YYYY HH24:MI'));

INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Revisao de Metas Comerciais',
     TO_DATE('11/09/2026 10:00', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('11/09/2026 11:00', 'DD/MM/YYYY HH24:MI'));

-- Reunião agendada originalmente para 12/09/2026.
-- Será remarcada para 13/09/2026 na seção de UPDATE (item 8).
INSERT INTO REUNIAO
    (ID_REUNIAO, TITULO, DATA_HORA_INICIO, DATA_HORA_FIM)
VALUES
    (SEQ_REUNIAO.NEXTVAL, 'Retrospectiva do Projeto',
     TO_DATE('12/09/2026 14:00', 'DD/MM/YYYY HH24:MI'),
     TO_DATE('12/09/2026 15:00', 'DD/MM/YYYY HH24:MI'));

---------------------------------------------------------------
-- 4. INSERT - REUNIAO_PARTICIPANTE
-- 15 registros
---------------------------------------------------------------

-- Todo participante que aparece como locutor em FALA_TRANSCRICAO
-- está cadastrado nesta tabela para a reunião correspondente.

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (1, 1, 'Organizador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (1, 2, 'Apresentador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (1, 6, 'Ouvinte');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (2, 1, 'Ouvinte');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (2, 2, 'Apresentador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (2, 3, 'Organizador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (3, 4, 'Organizador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (3, 9, 'Apresentador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (4, 2, 'Organizador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (4, 7, 'Apresentador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (5, 3, 'Organizador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (5, 8, 'Apresentador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (9, 6, 'Organizador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (9, 1, 'Apresentador');

INSERT INTO REUNIAO_PARTICIPANTE
    (ID_REUNIAO, ID_PARTICIPANTE, TIPO_PARTICIPACAO)
VALUES (9, 9, 'Ouvinte');


---------------------------------------------------------------
-- 5. INSERT - DICIONARIO_TERMOS
-- 10 registros
---------------------------------------------------------------

-- Categorias utilizadas:
-- 'Produto Próprio' -> produtos e marca TOTVS
-- 'Time Rival'      -> empresas e produtos concorrentes
-- 'Tecnologia'      -> jargões e tecnologias do setor

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'SAP', 'Time Rival');

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'Protheus', 'Produto Próprio');

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'TOTVS', 'Produto Próprio');

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'Oracle', 'Tecnologia');

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'Microsoft', 'Tecnologia');

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'Salesforce', 'Time Rival');

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'CRM', 'Tecnologia');

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'ERP', 'Tecnologia');

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'Concorrente X', 'Time Rival');

INSERT INTO DICIONARIO_TERMOS
    (ID_TERMO, PALAVRA_CHAVE, CATEGORIA)
VALUES
    (SEQ_DICIONARIO_TERMOS.NEXTVAL, 'Inteligencia Artificial', 'Tecnologia');


---------------------------------------------------------------
-- 6. INSERT - FALA_TRANSCRICAO
-- 18 registros
---------------------------------------------------------------

-- As falas foram distribuídas para que as reuniões apresentem
-- níveis diferentes de menções a concorrentes (Time Rival),
-- permitindo demonstrar o cálculo de risco de churn:
--   Reunião 9 - Revisão de Metas Comerciais   -> 4 menções (risco alto)
--   Reunião 5 - Estratégia de Marketing       -> 3 menções (risco médio)
--   Reunião 2 - Apresentação do Novo Produto  -> 2 menções (risco médio)
--   Reunião 1 - Planejamento Comercial        -> 1 menção  (risco baixo)
--   Reuniões 3 e 4                            -> 0 menções (risco baixo)

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 1, 1,
     TO_DATE('01/09/2026 09:05', 'DD/MM/YYYY HH24:MI'),
     'Precisamos analisar os resultados de vendas do ultimo trimestre.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 1, 2,
     TO_DATE('01/09/2026 09:15', 'DD/MM/YYYY HH24:MI'),
     'A integracao com SAP pode reduzir o tempo de processamento.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 2, 3,
     TO_DATE('02/09/2026 14:10', 'DD/MM/YYYY HH24:MI'),
     'O novo produto tera integracao com Protheus e CRM.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 2, 2,
     TO_DATE('02/09/2026 14:25', 'DD/MM/YYYY HH24:MI'),
     'A arquitetura utiliza recursos da Microsoft para processamento.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 3, 4,
     TO_DATE('03/09/2026 11:10', 'DD/MM/YYYY HH24:MI'),
     'O fechamento financeiro sera revisado antes da apresentacao.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 3, 9,
     TO_DATE('03/09/2026 11:20', 'DD/MM/YYYY HH24:MI'),
     'O ERP atual apresentou divergencias no relatorio.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 4, 2,
     TO_DATE('04/09/2026 10:15', 'DD/MM/YYYY HH24:MI'),
     'Vamos avaliar a migracao do banco para Oracle.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 4, 7,
     TO_DATE('04/09/2026 10:30', 'DD/MM/YYYY HH24:MI'),
     'A inteligencia artificial pode auxiliar na analise das reunioes.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 5, 3,
     TO_DATE('05/09/2026 15:15', 'DD/MM/YYYY HH24:MI'),
     'Precisamos comparar nossa estrategia com o Salesforce.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 9, 6,
     TO_DATE('11/09/2026 10:20', 'DD/MM/YYYY HH24:MI'),
     'O CRM sera atualizado para melhorar o acompanhamento das oportunidades.');

-- Falas 11 a 14: reunião 9 (Revisão de Metas Comerciais).
-- O cliente sinaliza que está avaliando vários concorrentes.

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 9, 1,
     TO_DATE('11/09/2026 10:25', 'DD/MM/YYYY HH24:MI'),
     'O cliente contou que recebeu uma proposta da SAP com desconto agressivo.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 9, 6,
     TO_DATE('11/09/2026 10:35', 'DD/MM/YYYY HH24:MI'),
     'Eles tambem estao avaliando o Salesforce para substituir o CRM atual.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 9, 9,
     TO_DATE('11/09/2026 10:45', 'DD/MM/YYYY HH24:MI'),
     'O Concorrente X ofereceu migracao gratuita e treinamento incluso.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 9, 1,
     TO_DATE('11/09/2026 10:50', 'DD/MM/YYYY HH24:MI'),
     'Se a SAP cumprir o prazo de implantacao, o cliente pode cancelar o contrato.');

-- Falas 15 e 16: reunião 2 (Apresentação do Novo Produto).

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 2, 1,
     TO_DATE('02/09/2026 14:40', 'DD/MM/YYYY HH24:MI'),
     'O cliente comparou o Protheus com a solucao da SAP durante a demonstracao.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 2, 3,
     TO_DATE('02/09/2026 14:55', 'DD/MM/YYYY HH24:MI'),
     'Precisamos de um argumento forte contra o Salesforce na proxima rodada.');

-- Falas 17 e 18: reunião 5 (Estratégia de Marketing Digital).

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 5, 8,
     TO_DATE('05/09/2026 15:30', 'DD/MM/YYYY HH24:MI'),
     'O Concorrente X lancou uma campanha focada nos nossos clientes de varejo.');

INSERT INTO FALA_TRANSCRICAO
    (ID_TRANSCRICAO, ID_REUNIAO, ID_PARTICIPANTE, HORA_FALA, TEXTO_FALA)
VALUES
    (SEQ_FALA_TRANSCRICAO.NEXTVAL, 5, 3,
     TO_DATE('05/09/2026 15:45', 'DD/MM/YYYY HH24:MI'),
     'A SAP tambem aparece nas pesquisas de mercado como alternativa.');


---------------------------------------------------------------
-- 7. INSERT - ALERTA_GERADO
-- 20 registros
---------------------------------------------------------------

-- Os scores de confiança variam entre 45 e 97 para representar
-- tanto detecções seguras (>= 80) quanto detecções que exigem
-- validação humana (< 80), como siglas curtas e ambíguas.
-- Regra aplicada no status inicial: score < 80 -> 'Pendente';
-- score >= 80 -> 'Validado' (dispensa revisão humana).

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 2, 1,
     'Menção ao concorrente SAP durante o planejamento da integração.', 72, 'Pendente');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 3, 2,
     'Menção ao produto Protheus durante a apresentação do novo produto.', 95, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 3, 7,
     'Menção ao sistema CRM no contexto da integração.', 70, 'Pendente');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 4, 5,
     'Menção à Microsoft na discussão da arquitetura.', 93, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 6, 8,
     'Menção a ERP durante a análise financeira.', 65, 'Pendente');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 7, 4,
     'Menção ao Oracle durante o alinhamento tecnológico.', 88, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 8, 10,
     'Menção à inteligência artificial no contexto da solução.', 91, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 9, 6,
     'Menção a empresa concorrente durante a análise de mercado.', 96, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 10, 7,
     'Menção ao CRM durante a revisão das metas comerciais.', 74, 'Pendente');

-- Alerta 10: falso positivo (score baixo). Será excluído no item 9.
INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 1, 9,
     'Menção a concorrente identificada durante a análise comercial.', 45, 'Pendente');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 11, 1,
     'Cliente recebeu proposta da SAP com desconto agressivo.', 89, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 12, 6,
     'Cliente avalia o Salesforce para substituir o CRM atual.', 97, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 12, 7,
     'Menção ao CRM atual do cliente durante a avaliação de troca.', 68, 'Pendente');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 13, 9,
     'Concorrente X ofereceu migração gratuita ao cliente.', 94, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 14, 1,
     'Risco de cancelamento do contrato caso a SAP cumpra o prazo.', 84, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 15, 2,
     'Cliente comparou o Protheus com o concorrente na demonstração.', 96, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 15, 1,
     'Menção à SAP como referência de comparação do cliente.', 76, 'Pendente');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 16, 6,
     'Equipe precisa de argumentos contra o Salesforce.', 92, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 17, 9,
     'Campanha do Concorrente X direcionada à carteira de varejo.', 90, 'Validado');

INSERT INTO ALERTA_GERADO
    (ID_ALERTA, ID_TRANSCRICAO, ID_TERMO, OBSERVACAO, SCORE_CONFIANCA, STATUS_VALIDACAO)
VALUES
    (SEQ_ALERTA_GERADO.NEXTVAL, 18, 1,
     'SAP citada como alternativa nas pesquisas de mercado.', 71, 'Pendente');


---------------------------------------------------------------
-- 8. UPDATE - EVOLUÇÃO DO PROCESSO
---------------------------------------------------------------

-- A evolução do processo é demonstrada pela remarcação de uma
-- reunião e pela revisão humana dos alertas, que altera o
-- STATUS_VALIDACAO de 'Pendente' para 'Validado' ou 'Corrigido'.
--
-- Exemplo 1: a reunião "Retrospectiva do Projeto" (ID 10), agendada
-- para 12/09/2026, foi remarcada para 13/09/2026, mantendo o mesmo
-- horário (14:00 às 15:00).

UPDATE REUNIAO
   SET DATA_HORA_INICIO = TO_DATE('13/09/2026 14:00', 'DD/MM/YYYY HH24:MI'),
       DATA_HORA_FIM    = TO_DATE('13/09/2026 15:00', 'DD/MM/YYYY HH24:MI')
 WHERE ID_REUNIAO = 10;


-- Exemplo 2: atualização de um alerta após análise do contexto da fala.
UPDATE ALERTA_GERADO
   SET OBSERVACAO = 'Alerta confirmado após análise do contexto da reunião.'
 WHERE ID_ALERTA = 2;


-- Exemplo 3: validação humana confirmando um alerta pendente.
-- O alerta 1 (menção à SAP, score 72) foi revisado e a menção ao
-- concorrente foi confirmada: 'Pendente' -> 'Validado'.
UPDATE ALERTA_GERADO
   SET STATUS_VALIDACAO = 'Validado'
 WHERE ID_ALERTA = 1
   AND STATUS_VALIDACAO = 'Pendente';


-- Exemplo 4: validação humana corrigindo um alerta pendente.
-- O alerta 3 (CRM, score 70) se referia à integração do novo
-- produto, e não a uma troca de sistema; o revisor corrigiu a
-- observação: 'Pendente' -> 'Corrigido'.
UPDATE ALERTA_GERADO
   SET STATUS_VALIDACAO = 'Corrigido',
       OBSERVACAO       = 'CRM citado como integração do novo produto, sem relação com concorrência.'
 WHERE ID_ALERTA = 3
   AND STATUS_VALIDACAO = 'Pendente';


---------------------------------------------------------------
-- 9. DELETE - CORREÇÃO DE ALERTA
---------------------------------------------------------------

-- Demonstra a exclusão de um alerta identificado como falso
-- positivo após a revisão da transcrição: a fala 1 não menciona
-- o termo "Concorrente X" (o alerta estava 'Pendente', com score
-- de confiança de apenas 45).
--
-- O registro é excluído da tabela filha ALERTA_GERADO, sem
-- comprometer a integridade referencial das demais tabelas.

DELETE FROM ALERTA_GERADO
 WHERE ID_ALERTA = 10;


---------------------------------------------------------------
-- 10. COMMIT
---------------------------------------------------------------

-- Confirma as operações de INSERT, UPDATE e DELETE realizadas.

COMMIT;
