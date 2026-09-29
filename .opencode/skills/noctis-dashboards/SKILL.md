---
name: noctis-dashboards
description: NOCTIS dashboard pattern (bento operacional roxo+preto). Use when editing view-dashboard, view-dashaluno, verDashAluno, atualizarDashboard in index.html, js/app.js, css/style.css.
---

# NOCTIS Dashboards

Bento operacional na identidade NOCTIS. Nunca 4 cards iguais + 2 gráficos genéricos.

## Tokens (não inventar outros)

- `--bg:#08080d` `--panel:#12121b` `--panel2:#171722` `--line:#242431`
- `--violet:#a78bfa` `--violet-strong:#8b5cf6` `--violet-deep:#4c1d95`
- Fontes: Sora (UI), Anton (números grandes, classe `.anton`), JetBrains Mono (telemetria, classe `.mono`)
- Radius: `var(--r-lg)` nos panels. Sem neon, sem glow roxo genérico, sem gradiente azul-roxo.

## Estrutura geral (`#view-dashboard`)

Grid de 12 colunas (`.dash-grid`):
- `.dash-hero` (span 8): `RECEITA · MÊS` em Anton grande (`#kpi-receita`), delta `% DA META` (`#kpi-receita-delta`), barra de meta (`#meta-bar-fill` + `#meta-txt`), split com `A RECEBER` (`#kpi-pendente`), `TICKET MÉDIO` (`#kpi-ticket`), `INADIMPLENTES` (`#kpi-inad`), sparkline (`#chart-spark`)
- `.dash-hoje` (span 4): `HOJE · OCUPAÇÃO`, check-ins (`#kpi-checkins`) + barra de ocupação (`#ocup-bar-fill`/`#ocup-txt`), `ALUNOS` (`#kpi-alunos`/`#kpi-ativos`), `PICO` (`#pico-hora`), ações rápidas para matrícula/check-in
- `.dash-planos` (span 4): doughnut `#chart-planos` (cores `#8b5cf6,#a78bfa,#4c1d95`, cutout 68%, sem legenda nativa) + legenda custom `#planos-legend`
- `.dash-fluxo` (span 8): barras `#chart-checkins` (última barra sólida, demais translúcidas, radius 5) + totais `#checkins-7d`/`#checkins-media`
- `.dash-alerts` (span 7): `#dash-inadimplentes` — máx 4 linhas `nome + badge plano/valor + Dar baixa` (reusa `alternarMensalidade`)
- `.dash-live` (span 5): `#dash-atividade` — últimos 6 acessos `dot + nome + data/hora mono`

Header: `#hoje` + `#dash-turno` (MANHÃ/TARDE/NOITE) e selo `TEMPO REAL` com `.live-dot`.
Sigilo: Personal e Nutri NÃO veem dinheiro — `#dash-hero` e `#dash-alerts` ocultos p/ esses perfis, com `#dash-fin-note` no lugar. Nutri também não vê a rota `treinos`.

## Dashboard do aluno (`verDashAluno`)

Hero (`.al-hero`): avatar de iniciais (`.al-avatar`), `ATLETA · NÍVEL X · STREAK nD`, nome em Anton, pills de plano/mensalidade/desde, semana com 7 `.al-day` (`.on` = presente), score de presenças à direita.
Níveis: `BASE <4, EMBALO <10, RITMO <20, ELITE 20+`.
Abaixo: grid — treino de hoje, próximo treino, plano (nº refeições + autor), desafios ativos — e ficha de anamnese.

## Plano manual (nutri real, sem auto-cardápio)

- Form `#plano-form` (só `podeGerenciarNutri()` vê): linhas em `#plano-itens` via `addRefeicao()` (`.ref-row`: `.ref-nome` + `.ref-detalhe` + remover), `#plano-orientacoes`, `salvarPlanoManual()` lê com `querySelectorAll`
- NUNCA gerar cardápio automático (sem `CARDAPIOS`/templates). Modelo: `{data, autor, itens[{refeicao, detalhe}], orientacoes}`
- `#plano-result` mostra itens + exames do aluno com parecer; aluno só lê (`#plano-orient` disabled)
- `preencherFormPlano()` carrega o plano salvo no form ao trocar de aluno

## Charts (Chart.js)

- `Chart.defaults.color='#8f8fa5'`, fonte JetBrains Mono 10px
- SEMPRE `responsive:true, maintainAspectRatio:false` + canvas dentro de `.chart-box` (180px, `.sm` 54px) — canvas solto com `height=` quebra o layout
- Nunca legenda padrão em doughnut; sempre legenda custom em HTML
- Fluxo 7 dias: `suggestedMax` + overlay `#fluxo-vazio` quando total = 0 (nunca gráfico "morto")
- Mobile: tudo colapsa para 1 coluna (`@media max-width:900px`)

## Front-2 (inspirado em Smart Fit, Strava, Nike Training, Glofox)

- Sidebar com `.nav-sec` (OPERAÇÃO / NUTRIÇÃO / TREINO / COMUNIDADE), sem mudar `data-perfis`
- Catraca: `.check-hero` + `.btn-check` grande; IDs `checkin-aluno`, `checkin-msg`, `checkin-hoje-total`, `tb-checkins` intocados
- Treinos: `.work-grid` + `.work-card` (`.today` + `.today-tag` HOJE quando `t.dia === diaHojePT()`), `.day-chip`, `.chips/.chip(.on)` chamando `filtrarDia(dia)`
- Desafios: `.chal-card` com avatar `.stack`, barra de inscritos, `LÍDER` = participante com mais presenças (`presencasTotais()`)
- Ranking geral: `#dash-ranking` com `.rank-row` (top 5 presenças totais)
- Aluno: `.al-today` = primeiro treino com `dia === diaHojePT()` ("TREINO DE HOJE")
- Avatares: `.avatar(.xs/.sm)` com `iniciais(nome)`; listas usam `.member`
- Fórum: `.topic-card` + `.reply-pill`, mensagens com avatar

## Regras de teste

`tests/mvp.test.cjs` exige: todo `$('id')` em `app.js` existe em `index.html`, e todo `onclick` tem função. Ao adicionar ID novo no JS, adicionar o elemento no HTML.
