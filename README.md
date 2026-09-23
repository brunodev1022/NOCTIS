# NOCTIS — Sistema de gestão para academias

> MVP conforme o Workspace da equipe no Loop · publicado no GitHub Pages · apresentação pelo Loop + este README.

**Site no ar:** `https://brunodev1022.github.io/NOCTIS/` *(enviar no Moodle)*
**MVP:** 23/09 · **Revisão do MVP:** 30/09 (só o MVP, não o projeto final)

Identidade: roxo + preto. Tipografia Sora + Anton (títulos) + JetBrains Mono (números). Sem dependência de build.

---

## 1. Visão geral

Sistema para academia pequena sair do caderno: matrícula, check-in com validação de pagamento e financeiro no MVP; nutrição entra na Fase 4. Roda 100% no navegador (sem backend) para funcionar no GitHub Pages.

## 2. Escopo com requisitos (do Loop)

| Nº | Tela | Descrição | Status no MVP |
|---|---|---|---|
| 00 | Login | Intro, verificação anti-robôs no botão Entrar e autenticação de 3 perfis | Feito (Admin, Funcionário, Aluno) |
| 01 | Matrícula | Cadastro completo do aluno | Feito |
| 02 | Check-in | Validação de pagamento + acesso | Feito (bloqueia inadimplente/inativo) |
| 03 | Financeiro | Gestão de mensalidades | Feito |
| 04 | Anamnese | Coleta de dados alimentares | Estrutura pronta (Fase 4) |
| 05 | Plano alimentar | Geração de cardápio | Modelo ilustrativo (Fase 4) |
| 06 | Dashboard do aluno | Tela inicial do aluno | Feito (versão MVP) |

**Regra principal do MVP (check-in):** acesso só libera se `status = Ativo` E `mensalidade = Paga`. Para demonstrar o bloqueio, tente o check-in da Beatriz (vem como Pendente no seed).

**Acessos demo:** `admin@noctis / admin123` · `recepcao@noctis / recepcao123` · `aluno@noctis / aluno123`

## 3. Fases do projeto (do Loop)

| Fase | Entrega |
|---|---|
| 1 Descoberta | Requisitos, wireframes (Loop) |
| 2 Design | UI das telas (este site) |
| 3 Desenvolvimento (MVP) | Matrícula + Check-in — esta entrega |
| 4 Desenvolvimento (Nutrição) | Anamnese + Plano alimentar (estrutura pronta) |
| 5 Testes | QA + testes com usuários reais |
| 6 Lançamento | Deploy (Pages) + treinamento da equipe |

## 4. Backlog (do Loop)

- Descoberta: requisitos com o dono da academia · plano de dados
- Design: wireframes das telas · protótipo navegável (o site é o protótipo funcional)
- MVP: login · matrícula · check-in · financeiro
- Nutrição: anamnese · plano alimentar · dashboard do aluno
- Lançamento: testes internos · testes com alunos reais · deploy

## 5. Riscos e decisões (do Loop)

| Risco | Prob. | Impacto | Mitigação no MVP |
|---|---|---|---|
| Falha de integração de pagamento | Alto | Médio | MVP sem gateway: mensalidade Paga/Pendente manual; testar gateway antes da versão real |
| Dados de saúde e nutrição (LGPD) | Alto | Alto | Cardápio ilustrativo; consultoria jurídica antes do lançamento; sem dados sensíveis reais na demo |
| Atraso no módulo nutricional | Médio | Médio | MVP lança sem nutrição completa (telas 04–05 marcadas Fase 4) |
| Perda de dados no navegador | Médio | Alto | Seed de demonstração + exportação CSV; backend real no pós-MVP |
| Falha no deploy do Pages | Baixo | Alto | Deploy via Actions com build verificável |

## 6. Tecnologias

HTML + CSS + JS puro · Chart.js e Three.js via CDN · localStorage · GitHub Pages (deploy via Actions).
Arquitetura em 3 partes: `store.js` (dados) → `app.js` (regras) → `index.html + css` (telas). Sem build, sem backend. Diagramas da documentação em Mermaid.

## 7. Estrutura

```
├── index.html      # login + telas (SPA por abas)
├── css/style.css   # identidade NOCTIS (roxo + preto)
├── js/store.js     # dados, 3 perfis, seed inicial
├── js/app.js       # login, CRUD, check-in validado, financeiro, nutrição
├── js/bg3d.js      # partículas 3D das telas de entrada
├── docs/documentacao.html  # documentação imprimível em PDF
├── roteiros/       # roteiro de apresentação por integrante
├── .github/workflows/pages.yml  # deploy no Pages via Actions
└── README.md       # apresentação
```

## 8. Como rodar e publicar

Local: duplo clique em `index.html` ou `npx serve .`

Pages: push na `main` dispara o workflow de deploy (Actions) sozinho. Config em Settings → Pages → Source: GitHub Actions. O link vai no Moodle.

## 9. Roteiro de apresentação (3 min)

1. Loop (1 min): escopo das telas, fases (MVP = Matrícula + Check-in), riscos.
2. Demo (1:30): login admin → nova matrícula → check-in liberado x bloqueado (Beatriz pendente) → financeiro alternando Paga/Pendente → dashboard do aluno.
3. Código (30s): `store.js` → regra do check-in em `app.js` → README como documentação.

## 10. Equipe

| Nome | Responsável por |
|---|---|
| Bruno Campos | Login (3 perfis), intro, verificação anti-robôs, Dashboard geral e deploy no GitHub Pages |
| Rafael Santos | Matrícula, Check-in com validação de pagamento e testes do MVP |
| Tiago Ribeiro | Painel Financeiro, módulo nutricional (Anamnese + Plano alimentar), Dashboard do Aluno e apresentação |

## 11. Divisão da apresentação

| Quem | Tempo | O que mostra |
|---|---|---|
| Bruno Campos | 1 min | Problema e solução, verificação anti-robôs, login como admin, Dashboard geral |
| Rafael Santos | 1 min | Nova matrícula, check-in liberado e bloqueado (Beatriz, pendente), regra Ativo + mensalidade Paga |
| Tiago Ribeiro | 1 min | Financeiro (alternar Paga/Pendente), Anamnese, geração de cardápio, Dashboard do Aluno |

Perguntas: LGPD e pagamento com Tiago, código e dados com Bruno, regra de negócio com Rafael.
