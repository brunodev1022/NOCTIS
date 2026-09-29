# Roteiro — Tiago Ribeiro (~1 min)

## Tua parte: financeiro, nutrição e exames

### FALA
"Eu fiquei com o dinheiro e com a saúde: financeiro e o módulo nutricional. O financeiro mostra recebido, a receber e inadimplentes. E a nutrição é 100% manual de propósito — como vai ter um nutricionista real usando, nada de cardápio automático: ele prescreve refeição por refeição com base na anamnese e nos exames do aluno."

### DEMO passo a passo
1. Vai em Financeiro → alterna a Beatriz de Pendente pra Paga: "Recebido" sobe, "Inadimplentes" cai.
2. Vai em Anamnese → escolhe a Ana, preenche objetivo e salva.
3. Vai em Exames → mostra um exame enviado com o parecer da nutri.
4. Vai em Plano alimentar → mostra as refeições prescritas + orientações + bloco de exames que embasou tudo.
5. Passa pro Lucas.

### CÓDIGO (explica como aluno de ADS)
- **Financeiro é soma de array.** O `listarFinanceiro()` filtra os ativos e soma os valores da tabela `PLANOS` (Mensal 89,90 / Trimestral 239,90 / Anual 799,90). Quem tem mensalidade Paga cai no "recebido", Pendente cai no "a receber". E o botão de baixa tem dono:
```js
if (!podeGerenciarFinanceiro()) return alert('Só Admin ou Funcionário dão baixa em mensalidade.');
```
- **O plano é manual mesmo.** O `salvarPlanoManual()` lê as linhas de refeição do formulário e grava `{ data, autor, itens, orientacoes }` — o `autor` registra quem prescreveu e quando. O aluno enxerga o resultado em leitura, e o botão de salvar nem aparece pra ele.
- **Exame vira texto dentro do navegador.** O `uploadExame()` usa `FileReader.readAsDataURL` pra transformar o PDF/imagem em string e guardar no `localStorage` (por isso o limite de 1,5 MB). O `salvarParecer()` é só da nutrição, e apagar exame só vale pro admin, quem enviou ou o dono.
- Tudo continua valendo a LGPD da apresentação: sem dado real na demo, parecer restrito, consultoria jurídica antes do lançamento.

### PERGUNTAS que caem pra ti
- "Por que não gera cardápio sozinho?" → Porque um nutricionista real vai usar; automático seria prescrição sem responsável.
- "E se o arquivo for gigante?" → Barramos acima de 1,5 MB e tratamos `localStorage` cheio com alerta.
- "O cardápio é prescrição real?" → Na demo é ilustrativo; no uso real, é o nutricionista logado que assina (campo `autor`).
