# Roteiro — Bruno Campos (1 min + perguntas)

## Tua parte: abertura, login, dashboard, deploy

### FALA (decora a ideia, não a palavra)
"Nosso projeto é o NOCTIS, um sistema pra academia pequena sair do caderno.
O problema: controle em papel perde aluno e dinheiro. A solução: matrícula,
check-in validado e financeiro num painel só, rodando no navegador e
publicado no GitHub Pages."

### DEMO passo a passo
1. Abre o site e mostra a verificação anti-robôs → clica "Sou humano".
2. Faz login como admin (`admin@noctis / admin123`) e fala: "3 perfis: admin,
   funcionário e aluno, cada um vê só suas telas".
3. No Dashboard, aponta os 4 KPIs e os 2 gráficos (alunos por plano,
   check-ins de 7 dias). Passa a palavra pro Rafael Santos.

### CÓDIGO (se perguntarem, é teu)
- `js/store.js`: array USUARIOS com os 3 perfis, seed inicial de alunos e
  tudo persistido no `localStorage` (chave `noctis_mvp_v1`). É o "banco" do MVP.
- Login: compara e-mail/senha com o array, guarda a sessão em
  `sessionStorage`. Sem backend porque o Pages só serve arquivo estático.
- Verificação anti-robôs: gate em tela cheia antes do login, vale por sessão.
- Gráficos: Chart.js via CDN, dados calculados dos alunos e check-ins.

### PERGUNTAS que caem pra ti
- "Onde ficam os dados?" → No navegador, em `localStorage`. MVP sem backend;
  backend real entra pós-MVP.
- "Como funciona o login?" → Lista fixa de 3 usuários demo com perfis; a
  sessão dura até fechar a aba ou sair.
- "Por que GitHub Pages?" → Hospedagem gratuita de site estático, deploy a
  cada push na `main`.
