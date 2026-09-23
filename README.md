# NOCTIS — Sistema de Gestão para Academias

**No ar:** https://brunodev1022.github.io/NOCTIS/
**MVP:** 23/09 · **Revisão:** 30/09

## O problema que resolvemos

A ideia do NOCTIS nasceu de um problema simples: academias pequenas ainda gerenciam tudo no caderno,
 matrícula, pagamento, controle de acesso. A gente decidiu resolver isso com um sistema que roda direto no navegador, sem precisar de servidor, então dá pra publicar de graça no GitHub Pages.

Identidade visual em roxo e preto, com Sora e Anton nos títulos e JetBrains Mono nos números, pra dar aquela cara mais tech, de academia moderna.

## O que já está pronto

Nessa entrega (MVP) a gente fechou três frentes: login com três perfis diferentes (admin, funcionário e aluno), matrícula completa do aluno, e o check-in com validação automática de pagamento — só libera o acesso se o aluno estiver ativo e com a mensalidade em dia. O financeiro também já funciona, controlando quem pagou e quem está pendente.

A parte de nutrição (anamnese e plano alimentar) já tem a estrutura pronta na tela, mas o conteúdo é só ilustrativo por enquanto — isso fica pra fase 4.

Pra demonstrar a regra de bloqueio no check-in, é só tentar o check-in da Beatriz: ela entra como pendente no seed, então o sistema barra o acesso dela.

Acessos pra testar: `admin@noctis / admin123`, `recepcao@noctis / recepcao123`, `aluno@noctis / aluno123`.

## Como o projeto foi dividido

O trabalho passou por seis fases: descoberta dos requisitos e wireframes (feito no Loop), design das telas, desenvolvimento do MVP — que é essa entrega, com matrícula e check-in —, depois o desenvolvimento da parte de nutrição, testes com usuários reais, e por fim o lançamento, com deploy no Pages e treinamento da equipe.

## Riscos que já pensamos em resolver

O maior risco era a integração com um gateway de pagamento de verdade — pra não travar o MVP, deixamos o controle de mensalidade manual (Paga ou Pendente) e vamos testar o gateway antes da versão final. Outro ponto sensível é dado de saúde e nutrição, que cai na LGPD — por isso o cardápio no MVP é só ilustrativo, sem dado real de aluno, e antes do lançamento vamos buscar orientação jurídica. Também nos preocupamos com perda de dados no navegador, já que tudo roda em localStorage — por isso tem seed de demonstração e exportação em CSV, e no pós-MVP a ideia é migrar pra um backend de verdade. E pra não correr risco no deploy, o Pages sobe via GitHub Actions, com build verificável.

## Tecnologias

HTML, CSS e JavaScript puro — sem framework, sem build. Chart.js e Three.js entram via CDN. Os dados ficam em localStorage e o deploy é automático no GitHub Pages via Actions. A arquitetura é simples: `store.js` cuida dos dados, `app.js` cuida das regras, e `index.html` com o CSS cuida da interface.

## Estrutura de arquivos

```
├── index.html      # login + telas (SPA por abas)
├── css/style.css   # identidade NOCTIS (roxo + preto)
├── js/store.js     # dados, 3 perfis, seed inicial
├── js/app.js       # login, CRUD, check-in validado, financeiro, nutrição
├── js/bg3d.js      # partículas 3D das telas de entrada
├── docs/documentacao.html  # documentação imprimível em PDF
├── roteiros/       # roteiro de apresentação por integrante
├── .github/workflows/pages.yml  # deploy no Pages via Actions
└── README.md
```

## Rodando o projeto

Localmente, é só abrir o `index.html` direto ou rodar `npx serve .`. Pra publicar, basta dar push na main — o workflow do Actions cuida do deploy sozinho (configurado em Settings → Pages → Source: GitHub Actions). O link final vai no Moodle.

## Roteiro de apresentação (3 minutos)

Primeiro minuto: contextualizar o problema, mostrar o escopo das telas que vieram do Loop, as fases do projeto e os riscos que mapeamos.

Minuto e meio de demo: login como admin, criar uma matrícula nova, mostrar o check-in liberando o acesso e depois bloqueando (com a Beatriz, que está pendente), alternar o status da mensalidade no financeiro, e fechar mostrando o dashboard do aluno.

Últimos 30 segundos: passar rapidamente pelo código, mostrando o `store.js`, a regra do check-in no `app.js`, e o README como documentação do projeto.

## Quem fez o quê

Bruno Campos cuidou do login com os três perfis, da intro, da verificação anti-robôs, do dashboard geral e do deploy no GitHub Pages. Rafael Santos ficou com a matrícula, o check-in com validação de pagamento e os testes do MVP. Tiago Ribeiro desenvolveu o painel financeiro, o módulo de nutrição (anamnese e plano alimentar), o dashboard do aluno e ajudou na apresentação.

Na hora de apresentar: Bruno abre com 1 minuto mostrando o problema, a verificação anti-robôs e o login como admin. Rafael segue com 1 minuto de matrícula e check-in, mostrando a regra de ativo + mensalidade paga. Tiago fecha com 1 minuto de financeiro, anamnese, geração de cardápio e dashboard do aluno.

Se vier pergunta sobre LGPD ou pagamento, é com o Tiago. Sobre código e dados, é com o Bruno. Sobre regra de negócio, é com o Rafael.
