# NOCTIS — Sistema de gestão para academias

> MVP conforme o Workspace da equipe no Loop · publicado no GitHub Pages · apresentação pelo Loop + este README.

**Site no ar:** `https://brunodev1022.github.io/NOCTIS/` *(enviar no Moodle)*
**MVP:** 23/09 · **Revisão do MVP:** 30/09 (só o MVP, não o projeto final)

Identidade visual em roxo e preto, com Sora e Anton nos títulos e JetBrains Mono nos números, pra dar aquela cara mais tech, de academia moderna. Dashboards em bento operacional (receita + meta, ocupação hoje, base por plano, fluxo 7 dias, cobrança e ao vivo) na mesma identidade — sem cara de template de IA.

---

## 1. Visão geral

Sistema para academia pequena sair do caderno: matrícula, check-in com validação de pagamento, financeiro, nutrição com nutricionista real, treinos do personal e comunidade. Roda 100% no navegador (sem backend) para funcionar no GitHub Pages. Pedidos da profa. Maristela já implementados: nutricionista prescreve o plano manual por perfil/objetivo, aluno envia exames para análise, personal monta treinos por aluno, desafios da academia + desafios do aluno, e fórum para todos interagirem.

Nessa entrega fechamos: login com cinco perfis (admin, funcionário, aluno, nutricionista e personal), matrícula completa, check-in com validação automática (só libera com aluno ativo e mensalidade em dia) e financeiro controlando quem pagou e quem está pendente.

A parte de nutrição (anamnese e plano alimentar) saiu do ilustrativo: tem autor, data e orientações do nutricionista, com apoio dos exames do aluno.

**Regra principal do MVP (check-in):** acesso só libera se `status = Ativo` E `mensalidade = Paga`. Para demonstrar o bloqueio, tente o check-in da Beatriz (vem como Pendente no seed).

**Acessos demo:** `admin@noctis / admin123` · `recepcao@noctis / recepcao123` · `aluno@noctis / aluno123` · `nutri@noctis / nutri123` · `personal@noctis / personal123`

## Novidades desta versão (pronta pra apresentar)

- **Modo Apresentação (tour guiado):** botão flutuante "▶ Apresentar" que conduz a demo passo a passo (dashboard → matrícula → check-in → financeiro → nutrição → treinos → desafios → fórum → Ctrl K), com texto de apoio pra cada tela.
- **Backup e restauração:** exporte todos os dados em `.json` e importe de volta (resolve o risco de perda de dados no navegador). Botões na tela de Matrícula.
- **Imprimir ficha do aluno:** botão no Dashboard do Aluno que abre a impressão/PDF com layout limpo (esconde menu e botões).
- **Robustez:** escape de HTML no fórum/desafios/exames (anti-XSS), bloqueio de check-in duplicado no mesmo dia e validação de idade/telefone na matrícula.
- **Notificações (sino):** central com alertas de mensalidade pendente, exame sem parecer e treinos do dia, com badge de contagem.
- **Histórico de check-ins:** linha do tempo das últimas presenças no Dashboard do Aluno.
- **Ranking Semana/Total:** alterne entre presenças da semana e do total.
- **Busca global ampliada:** o Ctrl K agora também encontra alunos pelo nome.
- **Máscaras:** telefone e CPF formatados automaticamente na matrícula (CPF opcional).
- **Simular acesso pendente:** botão no Check-in que reproduz o bloqueio de pagamento ao vivo (demo garantida).
- **Timer de descanso:** cronômetro 30/60/90s na tela de Treinos, com iniciar/pausar/zerar.
- **Sugestões de exercícios:** chips que adicionam exercícios comuns ao treino com 1 clique.
- **Relatório gerencial:** botão que abre a impressão/PDF do dashboard com layout limpo.
- **Editar perfil:** troque nome e senha do usuário logado (persistido no navegador).
- **Reset de demonstração:** 1 clique limpa os dados e volta ao estado inicial (ideal pra repetir a apresentação).
- **Aviso LGPD:** nota discreta de que os dados são fictícios, no rodapé do menu.
- **Acessibilidade:** ícones em SVG com `aria-label`, foco visível e respeito a `prefers-reduced-motion`.
- **Testes:** subiu de 71 para **101 asserts**, todos passando (`node tests/mvp.test.cjs`).

## NOCTIS 2.0 — overhaul (fases 1–2 entregues)

Esta versão inicia o overhaul para um produto comercial. Já entregue e verificado:

- **Design system** centralizado (tokens de cor/espaçamento/sombra/elevação, estados semânticos ok/err/warn/info, skeleton, empty states, status dots).
- **App shell profissional:** topbar fixa (busca global, notificações, menu do usuário), **sidebar recolhível** com preferência persistida e **navegação inferior no mobile**.
- **Login repaginado:** mostrar/ocultar senha, verificação rotulada como "sessão demo" (sem fingir proteção anti-robô), seletor de contas de demonstração.
- **Toasts** de sucesso no lugar de `alert()`.
- **Acessibilidade:** skip link, `aria-label` em ícones, foco visível, respeito a `prefers-reduced-motion`.
- **Dashboards por perfil:** títulos/contexto próprios (Central nutricional, Central do personal, Dashboard).
- **Ficha do aluno em abas:** visão geral, dados, financeiro, presenças, treinos, nutrição e exames (respeitando permissões).
- **Testes:** 101 asserts passando.

**Roadmap (próximas fases):** módulo de planos/assinaturas, financeiro estruturado (pagamentos/vencimentos), treinos avançados + modo treino, avaliações físicas, agenda, PWA/offline, migração para IndexedDB e repositórios. Cada fase será entregue mantendo o projeto funcional e os testes verdes.

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
- Testes automatizados: `node tests/mvp.test.cjs` (101 asserts, zero dependências)

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
├── roteiros/       # fala + código de cada um na apresentação (5 integrantes)
├── .github/workflows/pages.yml  # deploy no Pages via Actions
└── README.md       # apresentação
```

## 8. Como rodar e publicar

Localmente, é só abrir o `index.html` direto ou rodar `npx serve .`. Pra publicar, basta dar push na `main` — o workflow do Actions cuida do deploy sozinho (configurado em Settings → Pages → Source: GitHub Actions). O link final vai no Moodle.

## 9. Roteiro de apresentação (5 integrantes, ~1 min cada)

Bruno abre com problema, solução e login; Rafael mostra matrícula + check-in; Tiago mostra financeiro + nutrição; Lucas mostra treinos, dashboard do aluno e o visual; Enzo fecha com desafios, fórum, testes e documentação. Fala detalhada + código de cada um em `roteiros/`.

## 10. Equipe

| Nome | Responsável por |
|---|---|
| Bruno Campos | Login (5 perfis + acesso rápido), intro, verificação anti-robôs, Dashboards bento com sigilo financeiro e deploy no GitHub Pages |
| Rafael Santos | Matrícula (só atendimento/admin), Check-in com validação de pagamento (RN01) e suite de testes (101 asserts) |
| Tiago Ribeiro | Financeiro, nutrição (Anamnese + Plano manual + Exames com parecer) e apresentação |
| Lucas Mynssem | Identidade visual e front-end (bento, cards, ranking, Treino de Hoje, responsivo), `style.css`, Dashboard do Aluno e Treinos |
| Enzo Guimaraes | Documentação (`docs/documentacao.html`, README), roteiros dos 5, Desafios, Fórum e apoio nos testes |

## 11. Divisão da apresentação

| Quem | Tempo | O que mostra |
|---|---|---|
| Bruno Campos | ~1 min | Problema e solução, login 5 perfis, Dashboard geral bento, deploy |
| Rafael Santos | ~1 min | Nova matrícula, check-in liberado e bloqueado (Beatriz, pendente), RN01 + testes |
| Tiago Ribeiro | ~1 min | Financeiro, Anamnese, plano manual da nutri + Exames com parecer |
| Lucas Mynssem | ~1 min | Visual (roxo + preto), Treinos em cards, Treino de Hoje, Dashboard do aluno |
| Enzo Guimaraes | ~1 min | Desafios, Fórum, documentação e como rodar os 101 testes |

Na hora de apresentar: Bruno → Rafael → Tiago → Lucas → Enzo fecha. Roteiro completo de cada um (fala + código) em `roteiros/`.

Se vier pergunta sobre LGPD ou pagamento, é com o Tiago. Sobre código e dados, é com o Bruno. Sobre regra de negócio, é com o Rafael. Sobre design e identidade visual, é com o Lucas. Sobre documentação, é com o Enzo.
