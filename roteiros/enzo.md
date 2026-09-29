# Roteiro — Enzo Guimaraes (~1 min)

## Tua parte: comunidade (desafios + fórum), documentação e testes

### FALA
"Eu fechei o projeto nas duas pontas: a comunidade — desafios e fórum — e a prova de que tudo funciona: documentação e testes. Desafio a academia sugere por perfil e o aluno cria os próprios; no fórum todo mundo troca ideia. E são 67 testes automatizados que rodam com um comando só, sem instalar nada."

### DEMO passo a passo
1. Vai em Desafios → cria um desafio, entra como aluno e participa (mostra inscritos e líder).
2. Vai em Fórum → abre um tópico e responde.
3. Mostra a documentação (`docs/documentacao.html`) e o botão de imprimir em PDF.
4. No terminal: `node tests/mvp.test.cjs` → "TOTAL: 67 passou, 0 falhou". Fecha: "É isso — NOCTIS no ar."

### CÓDIGO (explica como aluno de ADS)
- **Desafio é uma lista de participantes.** O `salvarDesafio()` publica com `perfilAlvo`; o `participarDesafio()` só deixa entrar quem é Aluno e o `excluirDesafio()` só deixa o criador ou o admin apagar:
```js
if (!ehAluno()) return alert('Entre como Aluno para participar de desafios.');
```
- **Fórum é tópico com array de mensagens.** O `salvarTopico()` cria, o `responderTopico()` dá `push` na conversa. Tudo no `localStorage`, igual ao resto.
- **Os testes são um navegador de mentira.** O `tests/mvp.test.cjs` usa o módulo `vm` do Node pra carregar o `store.js` e o `app.js` de verdade dentro de uma caixa com `localStorage`, `document` e `alert` falsos. A função `ok()` conta PASS/FAIL. E tem dois testes espertos: todo `$('id')` do JS precisa existir no HTML, e todo `onclick` precisa ter função — ou seja, a suite quebra se alguém esquecer de ligar tela com código.
- **A documentação** (`docs/documentacao.html`) tem DER em Mermaid, regras de negócio e cronograma, e imprime em PDF pelo botão do navegador.

### PERGUNTAS que caem pra ti
- "Como testo em casa?" → `node tests/mvp.test.cjs`, zero dependências.
- "E se dois aparelhos criarem dados diferentes?" → Sem back-end cada navegador tem seu banco; backend real é o pós-MVP (tá no §9 do documento).
- "Onde tá o plano do projeto?" → No `docs/documentacao.html` e no README, espelhando o Loop.
