# Roteiro — Tiago Ribeiro (1 min + perguntas)

## Tua parte: financeiro, nutrição (Fase 4), dashboard do aluno e riscos

### FALA
"Eu fiquei com o financeiro e o módulo nutricional. O financeiro mostra
recebido, a receber e inadimplentes. E as telas de anamnese e plano alimentar
são a Fase 4: estrutura pronta no MVP, evoluindo até 30/09. Fecho mostrando a
visão do aluno."

### DEMO passo a passo
1. Vai em Financeiro → alterna a Beatriz de Pendente pra Paga: mostra o
   "Recebido" subindo e "Inadimplentes" caindo.
2. Vai em Anamnese → escolhe um aluno, preenche objetivo e salva.
3. Vai em Plano alimentar → "Gerar cardápio": mostra o cardápio do objetivo.
4. Vai em Dashboard do Aluno → mostra plano, mensalidade, treinos e presenças.
5. Fecha: "MVP entregue: login, matrícula, check-in e financeiro. Nutrição
   completa até 30/09."

### CÓDIGO (se perguntarem, é teu)
- `alternarMensalidade()`: troca Paga/Pendente e o dashboard recalcula tudo.
- Receita = soma dos valores de `PLANOS` (Mensal 89,90 / Trimestral 239,90 /
  Anual 799,90) dos alunos ativos.
- `CARDAPIOS` em `js/app.js`: 3 modelos (Hipertrofia, Emagrecimento,
  Manutenção) escolhidos pelo objetivo da anamnese.
- `verDashAluno()`: junta matrícula, treinos, presenças e anamnese do aluno.

### PERGUNTAS que caem pra ti
- "O cardápio é prescrição real?" → Não, modelo ilustrativo. Prescrição real
  exige nutricionista — por isso o risco de LGPD está no documento.
- "Como calcula a receita?" → Soma do plano de cada aluno ativo com
  mensalidade Paga; pendentes vão pra "a receber".
- "O que falta até 30/09?" → Nutrição completa, testes com alunos reais e
  treinamento da equipe.
