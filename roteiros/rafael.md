# Roteiro — Rafael Santos (1 min + perguntas)

## Tua parte: matrícula + check-in (o coração do MVP)

### FALA
"Eu fiquei com o coração do MVP: matrícula e check-in. A matrícula é o
cadastro completo do aluno com plano e mensalidade. E o check-in tem a regra
principal do projeto: só libera acesso com status Ativo E mensalidade Paga."

### DEMO passo a passo
1. Vai em Matrícula → "Nova matrícula" → cadastra um aluno teste
   (nome, idade, plano Mensal, status Ativo, mensalidade Paga).
2. Mostra busca e filtros funcionando.
3. Vai em Check-in → registra acesso do aluno novo: "Acesso liberado".
4. Tenta o check-in da Beatriz (Pendente): mostra o bloqueio.
   "É a validação de pagamento + acesso do escopo." Passa pro Tiago Ribeiro.

### CÓDIGO (se perguntarem, é teu)
- `salvarAluno()` em `js/app.js`: cria ou edita o registro; tudo vai pro
  `Store.db.alunos` e salva no `localStorage`.
- `fazerCheckin()`: acha o aluno e aplica a regra — se `status !== Ativo`
  bloqueia, se `mensalidade !== Paga` bloqueia. Só então registra hora e data.
- `listarAlunos()`: busca por nome + filtros de plano e status.
- Check-ins ficam em `Store.db.checkins`, separados por dia (`YYYY-MM-DD`).

### PERGUNTAS que caem pra ti
- "Qual a regra do check-in?" → Ativo + mensalidade Paga, senão acesso negado.
- "E se o aluno estiver inativo?" → Bloqueado também, mesmo com conta em dia.
- "Check-in duplicado no mesmo dia?" → Hoje registra de novo; trava contra
  duplicado entra nas melhorias até 30/09.
