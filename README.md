# NOCTIS — Sistema de gestão para academias

> MVP conforme o Workspace da equipe no Loop · publicado no GitHub Pages · apresentação pelo Loop + este README.

**Site no ar:** `https://brunodev1022.github.io/NOCTIS/` *(enviar no Moodle)*
**MVP:** 23/09 · **Revisão do MVP:** 30/09 (só o MVP, não o projeto final)

Identidade visual em roxo e preto, com Sora e Anton nos títulos e JetBrains Mono nos números, pra dar aquela cara mais tech, de academia moderna. Dashboards em bento operacional (receita + meta, ocupação hoje, base por plano, fluxo 7 dias, cobrança e ao vivo) na mesma identidade — sem cara de template de IA.

---

## 1. Visão geral

Sistema para academia pequena sair do caderno: matrícula, check-in com validação de pagamento e financeiro no MVP; nutrição entra na Fase 4. Pedidos da profa. Maristela já implementados: nutricionista prescreve o plano por perfil/objetivo, aluno envia exames para análise, personal monta treinos por aluno, desafios da academia + desafios do aluno, e fórum para todos interagirem. Roda 100% no navegador (sem backend) para funcionar no GitHub Pages.

Nessa entrega fechamos: login com cinco perfis (admin, funcionário, aluno, nutricionista e personal), matrícula completa, check-in com validação automática (só libera com aluno ativo e mensalidade em dia) e financeiro controlando quem pagou e quem está pendente.

A parte de nutrição (anamnese e plano alimentar) saiu do ilustrativo: tem autor, data e orientações do nutricionista, com apoio dos exames do aluno.

**Regra principal do MVP (check-in):** acesso só libera se `status = Ativo` E `mensalidade = Paga`. Para demonstrar o bloqueio, tente o check-in da Beatriz (vem como Pendente no seed).

**Acessos demo:** `admin@noctis / admin123` · `recepcao@noctis / recepcao123` · `aluno@noctis / aluno123` · `nutri@noctis / nutri123` · `personal@noctis / personal123`

## 2. Escopo com requisitos (do Loop + Maristela)

| Nº | Tela | Descrição | Status |
|---|---|---|---|
| 00 | Login | Intro, verificação anti-robôs no botão Entrar e autenticação de 5 perfis | Feito (Admin, Funcionário, Aluno, Nutricionista, Personal) |
| 01 | Matrícula | Cadastro completo do aluno (só atendimento e admin) | Feito |
| 02 | Check-in | Catraca com validação de pagamento + acesso | Feito (bloqueia inadimplente/inativo) |
| 03 | Financeiro | Gestão de mensalidades | Feito |
| 04 | Anamnese | Coleta de dados alimentares | Feito (nutricionista + equipe) |
| 05 | Plano alimentar | Prescrição manual do nutricionista (refeições + orientações, com autor e data) — sem cardápio automático | Feito (aluno vê o próprio em leitura) |
| 06 | Dashboard do aluno | Hero do atleta (nível, streak, semana) + treino de hoje, próximo treino, plano, desafios | Feito (bento premium) |
| 07 | Treinos | Personal monta planejamento por aluno: cards por dia com chips Seg–Sáb, destaque HOJE | Feito — `nutri` não edita, `aluno` só vê os próprios |
| 08 | Exames | Aluno faz upload (PDF/imagem até 1,5 MB), nutricionista dá parecer | Feito — sem backend: fica no localStorage |
| 09 | Desafios | Academia sugere por perfil (Todos/Hipertrofia/Emagrecimento/Manutenção), aluno cria os próprios e participa/sai — cards com inscritos, líder e ranking | Feito |
| 10 | Fórum | Tópicos + respostas para clientes e equipe interagirem | Feito |

## 3. Fases do projeto (do Loop)

O trabalho passou por seis fases: descoberta dos requisitos e wireframes (feito no Loop), design das telas, desenvolvimento do MVP — matrícula + check-in —, depois o desenvolvimento da parte de nutrição, testes com usuários reais, e por fim o lançamento, com deploy no Pages e treinamento da equipe.

| Fase | Entrega |
|---|---|
| 1 Descoberta | Requisitos, wireframes (Loop) |
| 2 Design | UI das telas (este site) |
| 3 Desenvolvimento (MVP) | Matrícula + Check-in — esta entrega |
| 4 Desenvolvimento (Nutrição + Maristela) | Anamnese + Plano com nutricionista + Exames + Treinos + Desafios + Fórum |
| 5 Testes | QA + testes com usuários reais |
| 6 Lançamento | Deploy (Pages) + treinamento da equipe |

## 4. Backlog

- Descoberta: requisitos com o dono da academia · plano de dados
- Design: wireframes das telas · protótipo navegável (o site é o protótipo funcional) · dashboards bento sem cara de IA
- MVP: login · matrícula · check-in · financeiro
- Nutrição (Maristela): anamnese · plano com autor/orientações · exames com parecer
- Treinos (Maristela): personal monta por aluno/perfil/objetivo
- Engajamento (Maristela): desafios por perfil + desafios do aluno · fórum com tópicos e respostas
- Lançamento: testes internos · testes com alunos reais · deploy
- Testes automatizados: `node tests/mvp.test.cjs` (64 asserts, zero dependências)

## 5. Riscos e decisões (do Loop)

O maior risco era a integração com um gateway de pagamento de verdade — pra não travar o MVP, deixamos o controle de mensalidade manual (Paga ou Pendente) e vamos testar o gateway antes da versão final. Outro ponto sensível é dado de saúde e nutrição, que cai na LGPD — por isso sem dado real de aluno na demo, parecer restrito à nutrição/equipe, e consultoria jurídica antes do lançamento. Também nos preocupamos com perda de dados no navegador, já que tudo roda em localStorage — por isso tem seed de demonstração e exportação em CSV, e no pós-MVP a ideia é migrar pra um backend de verdade. E pra não correr risco no deploy, o Pages sobe via GitHub Actions, com build verificável.

| Risco | Prob. | Impacto | Mitigação no MVP |
|---|---|---|---|
| Falha de integração de pagamento | Alto | Médio | MVP sem gateway: mensalidade Paga/Pendente manual; testar gateway antes da versão real |
| Dados de saúde e nutrição (LGPD) | Alto | Alto | Exames até 1,5 MB no navegador, parecer só da nutrição; consultoria jurídica antes do lançamento; sem dados sensíveis reais na demo |
| Atraso no módulo nutricional | Médio | Médio | Entregue com nutricionista + exames nesta revisão |
| Perda de dados no navegador | Médio | Alto | Seed de demonstração + exportação CSV; backend real no pós-MVP |
| Falha no deploy do Pages | Baixo | Alto | Deploy via Actions com build verificável |

## 6. Tecnologias

HTML, CSS e JavaScript puro — sem framework, sem build. Chart.js e Three.js entram via CDN. Os dados ficam em localStorage e o deploy é automático no GitHub Pages via Actions. A arquitetura é simples: `store.js` cuida dos dados, `app.js` cuida das regras, e `index.html` com o CSS cuida da interface. Diagramas da documentação em Mermaid.

## 7. Estrutura

```
├── index.html      # login + telas (SPA por abas, 00–10)
├── css/style.css   # identidade NOCTIS (roxo + preto, bento dos dashboards)
├── js/store.js     # dados, 5 perfis, seed inicial (alunos, treinos, desafios, fórum)
├── js/app.js       # login, CRUD, check-in validado, financeiro, nutrição, treinos, exames, desafios, fórum
├── js/bg3d.js      # partículas 3D das telas de entrada
├── docs/documentacao.html  # documentação imprimível em PDF
├── .github/workflows/pages.yml  # deploy no Pages via Actions
└── README.md       # apresentação
```

## 8. Como rodar e publicar

Localmente, é só abrir o `index.html` direto ou rodar `npx serve .`. Pra publicar, basta dar push na `main` — o workflow do Actions cuida do deploy sozinho (configurado em Settings → Pages → Source: GitHub Actions). O link final vai no Moodle.

## 9. Roteiro de apresentação

Primeiro minuto: contextualizar o problema, mostrar o escopo das telas que vieram do Loop, as fases do projeto e os riscos que mapeamos.

Minuto e meio de demo: login como admin, dashboard bento (receita/meta, ocupação, cobrança, ao vivo), criar uma matrícula nova, mostrar o check-in liberando o acesso e depois bloqueando (com a Beatriz, que está pendente), exames com parecer da nutri, treino do personal, desafios e fórum, e fechar no dashboard do aluno (nível, streak, semana).

Últimos 30 segundos: passar rapidamente pelo código, mostrando o `store.js`, a regra do check-in no `app.js`, e o README como documentação do projeto.

## 10. Equipe

| Nome | Responsável por |
|---|---|
| Bruno Campos | Login (5 perfis), intro, verificação anti-robôs, Dashboard geral bento e deploy no GitHub Pages |
| Rafael Santos | Matrícula, Check-in com validação de pagamento e testes (64 asserts) |
| Tiago Ribeiro | Painel Financeiro, módulo nutricional (Anamnese + Plano com nutricionista + Exames), Dashboard do Aluno, Desafios, Fórum e apresentação |
| Lucas Mynssem | Design das telas — identidade roxo + preto, tipografias (Sora, Anton, JetBrains Mono), `style.css`, partículas 3D da entrada |
| Enzo Guimaraes | Documentação (`docs/documentacao.html` e README) e apoio nos testes do MVP |

## 11. Divisão da apresentação

| Quem | Tempo | O que mostra |
|---|---|---|
| Bruno Campos | 1 min | Problema e solução, verificação anti-robôs, login como admin, Dashboard geral bento |
| Rafael Santos | 1 min | Nova matrícula, check-in liberado e bloqueado (Beatriz, pendente), regra Ativo + mensalidade Paga |
| Tiago Ribeiro | 1 min | Financeiro (alternar Paga/Pendente), Anamnese, plano manual + Exames com parecer, Treinos do personal, Desafios e Fórum |

Na hora de apresentar: Bruno abre, Rafael segue com matrícula e check-in, Tiago fecha com financeiro, nutrição e engajamento.

Se vier pergunta sobre LGPD ou pagamento, é com o Tiago. Sobre código e dados, é com o Bruno. Sobre regra de negócio, é com o Rafael. Sobre design e identidade visual, é com o Lucas. Sobre documentação, é com o Enzo.
