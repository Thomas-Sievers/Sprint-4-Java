---------------------------------------------------------------
-- CHALLENGE 2026 - DATABASE DESIGN
--   Áurea              - RM 563837
--   Bernardo Hanashiro - RM 565266
--   Marco Aurélio      - RM 563827
--   Matheus Vasques    - RM 563309
--   Thomas Sievers     - RM 563566
---------------------------------------------------------------
--
-- ESTRUTURA DO ARQUIVO:
--   PARTE 1 - DDL (Sprint 3): limpeza do ambiente e criação das
--             tabelas, constraints, sequences e comentários.
--   PARTE 2 - DML (Sprint 3): inserção, atualização e exclusão
--             de dados para testar as regras de negócio.
--   PARTE 3 - DQL (Sprint 4): consultas gerenciais.
---------------------------------------------------------------

---------------------------------------------------------------
-- PARTE 1 - DDL
---------------------------------------------------------------

---------------------------------------------------------------

-- OBJETIVO:
-- Implementar fisicamente no Oracle o modelo relacional definido
-- na documentação da Sprint 3.
--
-- Tabelas:
-- 1. DEPARTAMENTO
-- 2. PARTICIPANTE
-- 3. REUNIAO
-- 4. REUNIAO_PARTICIPANTE
-- 5. DICIONARIO_TERMOS
-- 6. FALA_TRANSCRICAO
-- 7. ALERTA_GERADO
---------------------------------------------------------------


---------------------------------------------------------------
-- 0. LIMPEZA DO AMBIENTE (DROP)
---------------------------------------------------------------

-- Remove as tabelas e sequences do projeto, caso já existam,
-- permitindo executar o script quantas vezes for necessário.
-- As tabelas são removidas com CASCADE CONSTRAINTS para eliminar
-- também as chaves estrangeiras que apontam para elas.
-- O bloco consulta o dicionário de dados (USER_TABLES e
-- USER_SEQUENCES) e só remove o que existe, evitando erros na
-- primeira execução.
-- As sequences também são recriadas, garantindo que os IDs
-- voltem a começar em 1.

BEGIN
    FOR t IN (SELECT TABLE_NAME
                FROM USER_TABLES
               WHERE TABLE_NAME IN ('ALERTA_GERADO',
                                    'FALA_TRANSCRICAO',
                                    'DICIONARIO_TERMOS',
                                    'REUNIAO_PARTICIPANTE',
                                    'REUNIAO',
                                    'PARTICIPANTE',
                                    'DEPARTAMENTO'))
    LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.TABLE_NAME
                       || ' CASCADE CONSTRAINTS PURGE';
    END LOOP;

    FOR s IN (SELECT SEQUENCE_NAME
                FROM USER_SEQUENCES
               WHERE SEQUENCE_NAME IN ('SEQ_DEPARTAMENTO',
                                       'SEQ_PARTICIPANTE',
                                       'SEQ_REUNIAO',
                                       'SEQ_DICIONARIO_TERMOS',
                                       'SEQ_FALA_TRANSCRICAO',
                                       'SEQ_ALERTA_GERADO'))
    LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.SEQUENCE_NAME;
    END LOOP;
END;
/


---------------------------------------------------------------
-- 1. TABELA: DEPARTAMENTO
---------------------------------------------------------------

CREATE TABLE DEPARTAMENTO (
    ID_DEPARTAMENTO   NUMBER(4)
        CONSTRAINT PK_DEPARTAMENTO PRIMARY KEY,
    NOME_DEPARTAMENTO VARCHAR2(50)
        CONSTRAINT NN_DEPARTAMENTO_NOME NOT NULL,
    SIGLA             VARCHAR2(10)
        CONSTRAINT UK_DEPARTAMENTO_SIGLA UNIQUE
);

-- Sequence para geração dos IDs de DEPARTAMENTO
CREATE SEQUENCE SEQ_DEPARTAMENTO
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

COMMENT ON TABLE DEPARTAMENTO IS
    'Cadastro dos departamentos aos quais os participantes pertencem.';

COMMENT ON COLUMN DEPARTAMENTO.ID_DEPARTAMENTO IS
    'Código numérico identificador do departamento.';

COMMENT ON COLUMN DEPARTAMENTO.NOME_DEPARTAMENTO IS
    'Nome do setor ou departamento.';

COMMENT ON COLUMN DEPARTAMENTO.SIGLA IS
    'Sigla única utilizada para identificar o departamento.';


---------------------------------------------------------------
-- 2. TABELA: PARTICIPANTE
---------------------------------------------------------------

CREATE TABLE PARTICIPANTE (
    ID_PARTICIPANTE  NUMBER(6)
        CONSTRAINT PK_PARTICIPANTE PRIMARY KEY,
    NOME             VARCHAR2(100)
        CONSTRAINT NN_PARTICIPANTE_NOME NOT NULL,
    EMAIL            VARCHAR2(100)
        CONSTRAINT NN_PARTICIPANTE_EMAIL NOT NULL
        CONSTRAINT UK_PARTICIPANTE_EMAIL UNIQUE,
    ID_DEPARTAMENTO  NUMBER(4)
        CONSTRAINT FK_PARTICIPANTE_DEPARTAMENTO
        REFERENCES DEPARTAMENTO(ID_DEPARTAMENTO)
);

CREATE SEQUENCE SEQ_PARTICIPANTE
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

COMMENT ON TABLE PARTICIPANTE IS
    'Cadastro das pessoas que participam das reuniões monitoradas.';

COMMENT ON COLUMN PARTICIPANTE.ID_PARTICIPANTE IS
    'Código numérico identificador do participante.';

COMMENT ON COLUMN PARTICIPANTE.NOME IS
    'Nome completo do participante.';

COMMENT ON COLUMN PARTICIPANTE.EMAIL IS
    'E-mail corporativo único do participante.';

COMMENT ON COLUMN PARTICIPANTE.ID_DEPARTAMENTO IS
    'Código do departamento ao qual o participante está vinculado.';


---------------------------------------------------------------
-- 3. TABELA: REUNIAO
---------------------------------------------------------------

CREATE TABLE REUNIAO (
    ID_REUNIAO        NUMBER(7)
        CONSTRAINT PK_REUNIAO PRIMARY KEY,
    TITULO            VARCHAR2(100)
        CONSTRAINT NN_REUNIAO_TITULO NOT NULL,
    DATA_HORA_INICIO  DATE
        CONSTRAINT NN_REUNIAO_INICIO NOT NULL,
    DATA_HORA_FIM     DATE,
    CONSTRAINT CK_REUNIAO_HORARIO
        CHECK (DATA_HORA_FIM IS NULL OR DATA_HORA_FIM >= DATA_HORA_INICIO)
);

CREATE SEQUENCE SEQ_REUNIAO
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

COMMENT ON TABLE REUNIAO IS
    'Registro das reuniões monitoradas pelo sistema.';

COMMENT ON COLUMN REUNIAO.ID_REUNIAO IS
    'Código numérico identificador da reunião.';

COMMENT ON COLUMN REUNIAO.TITULO IS
    'Assunto ou título da reunião.';

COMMENT ON COLUMN REUNIAO.DATA_HORA_INICIO IS
    'Data e horário de início da reunião.';

COMMENT ON COLUMN REUNIAO.DATA_HORA_FIM IS
    'Data e horário de término da reunião.';


---------------------------------------------------------------
-- 4. TABELA: REUNIAO_PARTICIPANTE
---------------------------------------------------------------

-- Tabela associativa (N:N entre REUNIAO e PARTICIPANTE).
-- A chave primária é composta pelas duas chaves estrangeiras,
-- o que impede que o mesmo participante seja vinculado duas
-- vezes à mesma reunião.

CREATE TABLE REUNIAO_PARTICIPANTE (
    ID_REUNIAO        NUMBER(7)
        CONSTRAINT FK_REUNIAO_PARTICIPANTE_REUNIAO
        REFERENCES REUNIAO(ID_REUNIAO),
    ID_PARTICIPANTE   NUMBER(6)
        CONSTRAINT FK_REUNIAO_PARTICIPANTE_PARTICIPANTE
        REFERENCES PARTICIPANTE(ID_PARTICIPANTE),
    TIPO_PARTICIPACAO VARCHAR2(20)
        CONSTRAINT NN_REUNIAO_PARTICIPANTE_TIPO NOT NULL,
    CONSTRAINT PK_REUNIAO_PARTICIPANTE
        PRIMARY KEY (ID_REUNIAO, ID_PARTICIPANTE)
);

COMMENT ON TABLE REUNIAO_PARTICIPANTE IS
    'Tabela associativa que registra os participantes de cada reunião e seus papéis.';

COMMENT ON COLUMN REUNIAO_PARTICIPANTE.ID_REUNIAO IS
    'Código da reunião relacionada.';

COMMENT ON COLUMN REUNIAO_PARTICIPANTE.ID_PARTICIPANTE IS
    'Código do participante relacionado.';

COMMENT ON COLUMN REUNIAO_PARTICIPANTE.TIPO_PARTICIPACAO IS
    'Papel do participante na reunião, como Organizador, Ouvinte ou Apresentador.';


---------------------------------------------------------------
-- 5. TABELA: DICIONARIO_TERMOS
---------------------------------------------------------------

CREATE TABLE DICIONARIO_TERMOS (
    ID_TERMO       NUMBER(5)
        CONSTRAINT PK_DICIONARIO_TERMOS PRIMARY KEY,
    PALAVRA_CHAVE  VARCHAR2(50)
        CONSTRAINT NN_DICIONARIO_PALAVRA NOT NULL
        CONSTRAINT UK_DICIONARIO_PALAVRA UNIQUE,
    CATEGORIA      VARCHAR2(30)
        CONSTRAINT NN_DICIONARIO_CATEGORIA NOT NULL
);

CREATE SEQUENCE SEQ_DICIONARIO_TERMOS
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

COMMENT ON TABLE DICIONARIO_TERMOS IS
    'Dicionário de palavras-chave monitoradas durante as reuniões.';

COMMENT ON COLUMN DICIONARIO_TERMOS.ID_TERMO IS
    'Código numérico identificador do termo.';

COMMENT ON COLUMN DICIONARIO_TERMOS.PALAVRA_CHAVE IS
    'Palavra ou expressão monitorada pelo sistema.';

COMMENT ON COLUMN DICIONARIO_TERMOS.CATEGORIA IS
    'Categoria do termo, como Time Rival, Produto Próprio ou Tecnologia.';


---------------------------------------------------------------
-- 6. TABELA: FALA_TRANSCRICAO
---------------------------------------------------------------

CREATE TABLE FALA_TRANSCRICAO (
    ID_TRANSCRICAO   NUMBER(10)
        CONSTRAINT PK_FALA_TRANSCRICAO PRIMARY KEY,
    ID_REUNIAO       NUMBER(7)
        CONSTRAINT NN_FALA_REUNIAO NOT NULL
        CONSTRAINT FK_FALA_REUNIAO
        REFERENCES REUNIAO(ID_REUNIAO),
    ID_PARTICIPANTE  NUMBER(6)
        CONSTRAINT NN_FALA_PARTICIPANTE NOT NULL
        CONSTRAINT FK_FALA_PARTICIPANTE
        REFERENCES PARTICIPANTE(ID_PARTICIPANTE),
    HORA_FALA        DATE
        CONSTRAINT NN_FALA_HORA NOT NULL,
    TEXTO_FALA       VARCHAR2(4000)
        CONSTRAINT NN_FALA_TEXTO NOT NULL
);

CREATE SEQUENCE SEQ_FALA_TRANSCRICAO
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

COMMENT ON TABLE FALA_TRANSCRICAO IS
    'Armazena as falas transcritas pela IA durante as reuniões.';

COMMENT ON COLUMN FALA_TRANSCRICAO.ID_TRANSCRICAO IS
    'Código sequencial da fala transcrita.';

COMMENT ON COLUMN FALA_TRANSCRICAO.ID_REUNIAO IS
    'Código da reunião em que a fala ocorreu.';

COMMENT ON COLUMN FALA_TRANSCRICAO.ID_PARTICIPANTE IS
    'Código do participante identificado como locutor.';

COMMENT ON COLUMN FALA_TRANSCRICAO.HORA_FALA IS
    'Data e horário exatos em que a fala foi registrada.';

COMMENT ON COLUMN FALA_TRANSCRICAO.TEXTO_FALA IS
    'Texto da fala transcrito pela inteligência artificial.';


---------------------------------------------------------------
-- 7. TABELA: ALERTA_GERADO
---------------------------------------------------------------

-- Regra de restrição: a constraint UK_ALERTA_TRANSCRICAO_TERMO
-- impede que o mesmo termo seja registrado mais de uma vez como
-- alerta para a mesma fala, evitando alertas duplicados.
--
-- Regra de negócio: SCORE_CONFIANCA guarda a confiança da IA na
-- detecção (0 a 100). A constraint CK_ALERTA_SCORE garante que o
-- valor fique nessa faixa. Alertas com score abaixo de 80 devem
-- passar por validação humana antes de entrar no histórico.
--
-- Regra de negócio: STATUS_VALIDACAO registra a etapa da revisão
-- humana do alerta ('Pendente', 'Validado' ou 'Corrigido'). A
-- constraint CK_ALERTA_STATUS restringe a coluna a esse domínio.

CREATE TABLE ALERTA_GERADO (
    ID_ALERTA       NUMBER(10)
        CONSTRAINT PK_ALERTA_GERADO PRIMARY KEY,
    ID_TRANSCRICAO  NUMBER(10)
        CONSTRAINT NN_ALERTA_TRANSCRICAO NOT NULL
        CONSTRAINT FK_ALERTA_TRANSCRICAO
        REFERENCES FALA_TRANSCRICAO(ID_TRANSCRICAO),
    ID_TERMO        NUMBER(5)
        CONSTRAINT NN_ALERTA_TERMO NOT NULL
        CONSTRAINT FK_ALERTA_TERMO
        REFERENCES DICIONARIO_TERMOS(ID_TERMO),
    OBSERVACAO      VARCHAR2(200),
    SCORE_CONFIANCA NUMBER(3)
        CONSTRAINT NN_ALERTA_SCORE NOT NULL,
    STATUS_VALIDACAO VARCHAR2(15)
        CONSTRAINT NN_ALERTA_STATUS NOT NULL,
    CONSTRAINT UK_ALERTA_TRANSCRICAO_TERMO
        UNIQUE (ID_TRANSCRICAO, ID_TERMO),
    CONSTRAINT CK_ALERTA_SCORE
        CHECK (SCORE_CONFIANCA BETWEEN 0 AND 100),
    CONSTRAINT CK_ALERTA_STATUS
        CHECK (STATUS_VALIDACAO IN ('Pendente', 'Validado', 'Corrigido'))
);

CREATE SEQUENCE SEQ_ALERTA_GERADO
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

COMMENT ON TABLE ALERTA_GERADO IS
    'Registra os termos identificados pela IA nas falas transcritas e suas respectivas observações.';

COMMENT ON COLUMN ALERTA_GERADO.ID_ALERTA IS
    'Código numérico identificador do alerta.';

COMMENT ON COLUMN ALERTA_GERADO.ID_TRANSCRICAO IS
    'Código da fala transcrita que originou o alerta.';

COMMENT ON COLUMN ALERTA_GERADO.ID_TERMO IS
    'Código do termo do dicionário identificado na fala.';

COMMENT ON COLUMN ALERTA_GERADO.OBSERVACAO IS
    'Descrição ou contexto relacionado ao alerta gerado.';

COMMENT ON COLUMN ALERTA_GERADO.SCORE_CONFIANCA IS
    'Score de confiança da IA na detecção do termo (0 a 100). Abaixo de 80 exige validação humana.';

COMMENT ON COLUMN ALERTA_GERADO.STATUS_VALIDACAO IS
    'Status da validação humana do alerta: Pendente, Validado ou Corrigido.';

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

---------------------------------------------------------------
-- PARTE 3 - DQL
---------------------------------------------------------------

---------------------------------------------------------------

-- OBJETIVO:
-- Extrair informações gerenciais das reuniões monitoradas pela IA,
-- utilizando os dados inseridos pelo script DML.
--
-- Consultas:
-- 1. Duração das reuniões em minutos (expressão de cálculo na projeção)
-- 2. Falas transcritas e seus locutores (INNER JOIN)
-- 3. Total de alertas por categoria de termo (INNER JOIN + GROUP BY)
-- 4. Reuniões sem nenhuma fala transcrita (LEFT OUTER JOIN + WHERE + ORDER BY)
-- 5. Reuniões com duas ou mais falas transcritas (GROUP BY + HAVING)
--
-- Os resultados esperados descritos em cada consulta consideram o
-- estado do banco após a execução completa do DML (incluindo o
-- UPDATE da reunião 10 e o DELETE do alerta 10).


---------------------------------------------------------------
-- CONSULTA 1 - DURAÇÃO DAS REUNIÕES
-- Requisito: expressão para cálculo em uma coluna do retorno
--            de dados (projeção).
---------------------------------------------------------------

-- Calcula a duração de cada reunião em minutos.
-- No Oracle, a subtração entre duas datas (DATE) retorna a
-- diferença em dias; multiplicando por 24 e por 60 obtém-se o
-- valor em minutos. A função ROUND elimina eventuais casas
-- decimais.
--
-- Uso no negócio: identificar reuniões mais longas e o tempo
-- total de áudio que a IA precisou transcrever.
--
-- Resultado esperado: 10 linhas (60 ou 90 minutos por reunião).

SELECT ID_REUNIAO,
       TITULO,
       TO_CHAR(DATA_HORA_INICIO, 'DD/MM/YYYY HH24:MI') AS INICIO,
       TO_CHAR(DATA_HORA_FIM,    'DD/MM/YYYY HH24:MI') AS FIM,
       ROUND((DATA_HORA_FIM - DATA_HORA_INICIO) * 24 * 60) AS DURACAO_MINUTOS
  FROM REUNIAO
 ORDER BY ID_REUNIAO;


---------------------------------------------------------------
-- CONSULTA 2 - FALAS TRANSCRITAS E SEUS LOCUTORES
-- Requisito: consulta utilizando duas tabelas (INNER JOIN).
---------------------------------------------------------------

-- Relaciona cada fala transcrita (FALA_TRANSCRICAO) ao participante
-- identificado como locutor (PARTICIPANTE), reproduzindo a ata da
-- reunião com o nome de quem falou cada frase.
--
-- Uso no negócio: base da ata inteligente, que mostra quem
-- disse o quê e em que momento.
--
-- Resultado esperado: 18 linhas, uma para cada fala transcrita.

SELECT F.ID_REUNIAO,
       TO_CHAR(F.HORA_FALA, 'DD/MM/YYYY HH24:MI') AS HORA_FALA,
       P.NOME  AS LOCUTOR,
       F.TEXTO_FALA
  FROM FALA_TRANSCRICAO F
 INNER JOIN PARTICIPANTE P
    ON P.ID_PARTICIPANTE = F.ID_PARTICIPANTE
 ORDER BY F.HORA_FALA;


---------------------------------------------------------------
-- CONSULTA 3 - TOTAL DE ALERTAS POR CATEGORIA DE TERMO
-- Requisito: duas tabelas (INNER JOIN) com agrupamento, ou seja,
--            funções de grupo e GROUP BY.
---------------------------------------------------------------

-- Agrupa os alertas gerados (ALERTA_GERADO) pela categoria do
-- termo detectado (DICIONARIO_TERMOS), contando quantas menções
-- ocorreram em cada categoria e quantos termos distintos foram
-- citados.
--
-- Uso no negócio: medir com que frequência as reuniões citam
-- produtos próprios, concorrentes (Time Rival) e tecnologias.
--
-- Resultado esperado: 3 linhas
--   Time Rival      -> 10 alertas, 3 termos distintos
--   Tecnologia      ->  7 alertas, 5 termos distintos
--   Produto Próprio ->  2 alertas, 1 termo distinto

SELECT T.CATEGORIA,
       COUNT(A.ID_ALERTA)         AS TOTAL_ALERTAS,
       COUNT(DISTINCT A.ID_TERMO) AS TERMOS_DISTINTOS
  FROM ALERTA_GERADO A
 INNER JOIN DICIONARIO_TERMOS T
    ON T.ID_TERMO = A.ID_TERMO
 GROUP BY T.CATEGORIA
 ORDER BY TOTAL_ALERTAS DESC;


---------------------------------------------------------------
-- CONSULTA 4 - REUNIÕES SEM NENHUMA FALA TRANSCRITA
-- Requisito: duas tabelas com LEFT OUTER JOIN, filtro com WHERE
--            e classificação com ORDER BY.
---------------------------------------------------------------

-- O LEFT OUTER JOIN mantém todas as reuniões (tabela da esquerda),
-- mesmo as que não possuem registros em FALA_TRANSCRICAO. Nesses
-- casos, as colunas da fala retornam NULL. O WHERE filtra apenas
-- essas reuniões, e o ORDER BY as classifica da mais antiga para
-- a mais recente.
--
-- Uso no negócio: identificar reuniões cujo áudio ainda não foi
-- processado pela IA ou que não geraram transcrição.
--
-- Resultado esperado: 4 linhas (reuniões 6, 7, 8 e 10).

SELECT R.ID_REUNIAO,
       R.TITULO,
       TO_CHAR(R.DATA_HORA_INICIO, 'DD/MM/YYYY HH24:MI') AS INICIO
  FROM REUNIAO R
  LEFT OUTER JOIN FALA_TRANSCRICAO F
    ON F.ID_REUNIAO = R.ID_REUNIAO
 WHERE F.ID_TRANSCRICAO IS NULL
 ORDER BY R.DATA_HORA_INICIO;


---------------------------------------------------------------
-- CONSULTA 5 - REUNIÕES COM DUAS OU MAIS FALAS TRANSCRITAS
-- Requisito: agrupamento com a cláusula HAVING para filtrar grupos.
---------------------------------------------------------------

-- Conta as falas transcritas de cada reunião e, com o HAVING,
-- mantém apenas os grupos (reuniões) com duas ou mais falas.
-- Diferente do WHERE, que filtra linhas antes do agrupamento, o
-- HAVING filtra o resultado das funções de grupo.
--
-- Uso no negócio: destacar as reuniões com maior volume de
-- conversa registrada, candidatas a uma ata mais detalhada.
--
-- Resultado esperado: 6 linhas
--   Reunião 9 -> 5 falas
--   Reunião 2 -> 4 falas
--   Reunião 5 -> 3 falas
--   Reuniões 1, 3 e 4 -> 2 falas cada

SELECT R.ID_REUNIAO,
       R.TITULO,
       COUNT(F.ID_TRANSCRICAO) AS TOTAL_FALAS
  FROM REUNIAO R
 INNER JOIN FALA_TRANSCRICAO F
    ON F.ID_REUNIAO = R.ID_REUNIAO
 GROUP BY R.ID_REUNIAO, R.TITULO
HAVING COUNT(F.ID_TRANSCRICAO) >= 2
 ORDER BY TOTAL_FALAS DESC, R.ID_REUNIAO;
