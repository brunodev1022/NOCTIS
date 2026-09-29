# Roteiro — Rafael Santos (~1 min)

## Tua parte: matrícula, check-in e testes

### FALA
"Eu fiquei com o coração do sistema: matrícula e check-in. A matrícula é o cadastro do aluno com plano e mensalidade — e só o atendimento e o admin mexem nela. E o check-in tem a regra principal do projeto: só libera acesso com status Ativo E mensalidade Paga."

### DEMO passo a passo
1. Vai em Matrícula → "Nova matrícula" → cadastra um aluno teste (Mensal, Ativo, Paga).
2. Vai em Check-in → registra o acesso dele: "Acesso liberado".
3. Tenta o check-in da Beatriz (Pendente): mostra o bloqueio. Tenta o Diego (Inativo): bloqueado também.
4. Fala: "67 testes automatizados garantem essas regras" e passa pro Tiago.

### CÓDIGO (explica como aluno de ADS)
- **Matrícula é um CRUD no array.** O `salvarAluno()` pega os campos do modal; se o id já existe ele edita, se não, cria com `('a' + Date.now())`. E tem trava de perfil logo na primeira linha:
```js
if (!podeMatricular()) return alert('Só o atendimento (recepção) ou o admin fazem matrícula.');
```
- **O check-in é a RN01.** O `fazerCheckin()` acha o aluno e testa as duas condições antes de registrar a hora. Se cair em qualquer `return`, nada é salvo:
```js
if (a.status !== 'Ativo') { msg.textContent = `${a.nome} está INATIVO...`; return; }
if (a.mensalidade !== 'Paga') { msg.textContent = `${a.nome} com mensalidade PENDENTE...`; return; }
```
- **Os testes rodam sem instalar nada:** `node tests/mvp.test.cjs`. O arquivo cria um navegador de mentira (stubs de `localStorage`, `document`, `alert`) com o módulo `vm`, carrega o `store.js` e o `app.js` de verdade e roda 67 asserts — inclusive tentando burlar as travas como cada perfil.
- Tem até teste de cobertura: todo `$('id')` usado no JS tem que existir no HTML, e todo `onclick` tem que ter função. Se alguém quebrar isso, a suite acusa.

### PERGUNTAS que caem pra ti
- "Qual a regra do check-in?" → Ativo + mensalidade Paga, senão acesso negado com o motivo em tela.
- "E se o personal tentar matricular pelo console?" → A função barra e os testes provam (assert 'personal não matricula').
- "Check-in duplicado no mesmo dia?" → Hoje registra de novo; a trava contra duplicado está no pós-MVP.
