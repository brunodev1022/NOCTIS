# Roteiro — Lucas Mynssem (~1 min)

## Tua parte: identidade visual, treinos e dashboard do aluno

### FALA
"Eu cuidei pra isso aqui não parecer trabalho de faculdade: identidade roxo + preto, tipografia forte e telas que parecem app de academia de verdade — tipo Smart Fit e Strava. E montei a experiência do atleta: treinos em cards, treino de hoje em destaque e o dashboard do aluno com nível, streak e semana."

### DEMO passo a passo
1. Vai em Treinos → mostra os cards com chip do dia, a tag HOJE e os filtros Seg–Sáb.
2. Entra como aluno → dashboard com avatar, nível, streak e a fileirinha da semana.
3. Diminui a janela (ou abre no celular) e mostra que tudo empilha em 1 coluna.
4. Passa pro Enzo.

### CÓDIGO (explica como aluno de ADS)
- **A identidade mora em variáveis CSS** no `:root` do `style.css` — trocou ali, trocou no site inteiro:
```css
--bg:#08080d; --panel:#12121b; --violet:#a78bfa;
```
Sora na interface, Anton nos numerões (classe `.anton`) e JetBrains Mono nos dados (classe `.mono`). Nada de roxo-neon genérico de IA.
- **Dashboard é um bento de 12 colunas** (`.dash-grid`): hero da receita ocupa 8, ocupação ocupa 4, e por aí vai. É o mesmo padrão dos apps famosos, só que na nossa cara.
- **O "treino de hoje" é um filtro por dia da semana.** O helper `diaHojePT()` devolve 'Segunda'…'Sábado', e a tela compara com o `dia` de cada treino:
```js
const treinoHoje = treinos.filter(t => t.dia === diaHojePT());
```
Quem cai no dia ganha a tag HOJE e sobe pro topo da lista. (E sim, teve bug nas letrinhas da semana — 'Seg' aparecia 'D' — a suite pegou e a gente corrigiu.)
- **Responsivo é uma regra só:** abaixo de 900px, todo grid vira 1 coluna. Sem layout quebrado no celular.
- As partículas 3D da entrada (`js/bg3d.js`, Three.js) desligam sozinhas dentro do painel pra não comer GPU.

### PERGUNTAS que caem pra ti
- "Por que esses layouts assimétricos?" → Pra fugir da cara de template: 4 cards iguais + 2 gráficos é o padrão que toda IA cospe. Bento com hierarquia parece produto real.
- "E no celular?" → Media query única em 900px, tudo empilha, testado.
- "De onde veio a inspiração?" → Check-in da Smart Fit, desafios/ranking do Strava, cards de treino do Nike Training, lista de membros do Glofox — com a nossa identidade por cima.
