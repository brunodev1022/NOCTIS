# Roteiro — Bruno Campos (~1 min)

## Tua parte: abertura, login, dashboard geral, deploy

### FALA (decora a ideia, não a palavra)
"Nosso projeto é o NOCTIS, um sistema pra academia pequena sair do caderno. O problema: controle em papel perde aluno e dinheiro — inadimplente passa na catraca e o dono não sabe quanto entrou no mês. A solução: matrícula, check-in validado, financeiro, nutrição e comunidade num painel só, rodando no navegador e publicado no GitHub Pages."

### DEMO passo a passo
1. Abre o site, toca numa conta do acesso rápido e entra como admin.
2. No Dashboard, aponta: receita com % da meta, ocupação de hoje, cobrança, ao vivo e ranking dos frequentes.
3. Troca pra conta do personal e mostra que receita e cobrança somem (sigilo financeiro).
4. Passa a palavra pro Rafael.

### CÓDIGO (explica como aluno de ADS)
- **`js/store.js` é o nosso "banco".** Como não tem back-end, os dados moram no `localStorage` do navegador, na chave `noctis_mvp_v1`. O `seedInicial()` já cria 4 alunos de exemplo — a Beatriz vem com mensalidade Pendente de propósito, pra demo do bloqueio:
```js
{ id: 'a3', nome: 'Beatriz Rocha', plano: 'Anual', status: 'Ativo', mensalidade: 'Pendente' }
```
- **Os 5 logins são um array fixo**, o `USUARIOS`. O `fazerLogin()` só compara e-mail e senha com esse array e guarda a sessão no `sessionStorage` (que morre quando fecha a aba — por isso tem o botão Sair):
```js
const u = USUARIOS.find(x => x.email === email && x.senha === senha);
```
- **Cada perfil vê um menu diferente.** No `entrar()`, a gente lê o `data-perfis` de cada botão e esconde o resto; se uma seção inteira ficar vazia (tipo OPERAÇÃO pro aluno), a seção some também.
- **Sigilo financeiro:** no `atualizarDashboard()`, se o perfil for Personal ou Nutricionista, os painéis de receita e cobrança ganham `display: none`. Simples e testado.
- **Deploy:** push na `main` dispara o workflow em `.github/workflows/pages.yml` e o Pages publica sozinho.

### PERGUNTAS que caem pra ti
- "Onde ficam os dados?" → No `localStorage` do navegador. Sem back-end no MVP; backend real entra no pós-MVP.
- "Como o personal não vê o dinheiro?" → No `atualizarDashboard()` tem um `semFin` que esconde `#dash-hero` e `#dash-alerts` pra Personal e Nutri.
- "Por que GitHub Pages?" → Hospedagem grátis de site estático, deploy a cada push.
