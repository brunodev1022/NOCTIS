// store.js — camada de dados (11 telas: operação + nutrição + treinos + comunidade)
const DB_KEY = 'noctis_mvp_v1';
const SCHEMA_VERSION = 2;

const PLANOS = { Mensal: 89.90, Trimestral: 239.90, Anual: 799.90 };

// 5 perfis (pedido da profa. Maristela: nutri + personal entram no fluxo)
// demo sem backend, funciona no Pages
const USUARIOS = [
  { email: 'admin@noctis', senha: 'admin123', perfil: 'Administrador', nome: 'Admin' },
  { email: 'recepcao@noctis', senha: 'recepcao123', perfil: 'Funcionário', nome: 'Recepção' },
  { email: 'aluno@noctis', senha: 'aluno123', perfil: 'Aluno', nome: 'Ana Souza', alunoId: 'a1' },
  { email: 'nutri@noctis', senha: 'nutri123', perfil: 'Nutricionista', nome: 'Nutri Helena' },
  { email: 'personal@noctis', senha: 'personal123', perfil: 'Personal', nome: 'Personal Caio' }
];

function seedInicial() {
  // Histórico de check-ins dos últimos 10 dias (não inclui hoje) para dar vida aos gráficos/ranking
  const checkins = {};
  const pagantes = ['a1', 'a2', 'a5', 'a6', 'a9', 'a10'];
  for (let d = 1; d <= 10; d++) {
    const dt = new Date(); dt.setDate(dt.getDate() - d);
    const iso = dt.toISOString().slice(0, 10);
    const n = 2 + (d % 3);
    checkins[iso] = [];
    for (let k = 0; k < n; k++) {
      const alunoId = pagantes[(d + k) % pagantes.length];
      checkins[iso].push({ alunoId: alunoId, hora: String(8 + k * 2).padStart(2, '0') + ':00' });
    }
  }
  return {
    alunos: [
      { id: 'a1', nome: 'Ana Souza', idade: 24, fone: '(11) 98811-2233', plano: 'Mensal', status: 'Ativo', mensalidade: 'Paga', desde: '2026-08-10' },
      { id: 'a2', nome: 'Carlos Lima', idade: 31, fone: '(11) 97722-3344', plano: 'Trimestral', status: 'Ativo', mensalidade: 'Paga', desde: '2026-07-02' },
      { id: 'a3', nome: 'Beatriz Rocha', idade: 27, fone: '(11) 96633-4455', plano: 'Anual', status: 'Ativo', mensalidade: 'Pendente', desde: '2026-06-15' },
      { id: 'a4', nome: 'Diego Martins', idade: 35, fone: '(11) 95544-5566', plano: 'Mensal', status: 'Inativo', mensalidade: 'Pendente', desde: '2026-05-20' },
      { id: 'a5', nome: 'Bruno Tavares', idade: 29, fone: '(11) 94433-1122', plano: 'Trimestral', status: 'Ativo', mensalidade: 'Paga', desde: '2026-07-18' },
      { id: 'a6', nome: 'Carla Nunes', idade: 22, fone: '(11) 93322-7788', plano: 'Mensal', status: 'Ativo', mensalidade: 'Paga', desde: '2026-08-25' },
      { id: 'a7', nome: 'Diego Faria', idade: 41, fone: '(11) 92211-6655', plano: 'Anual', status: 'Ativo', mensalidade: 'Pendente', desde: '2026-04-10' },
      { id: 'a8', nome: 'Eduarda Lima', idade: 26, fone: '(11) 91100-2233', plano: 'Mensal', status: 'Inativo', mensalidade: 'Paga', desde: '2026-03-05' },
      { id: 'a9', nome: 'Felipe Rocha', idade: 33, fone: '(11) 90099-4455', plano: 'Trimestral', status: 'Ativo', mensalidade: 'Paga', desde: '2026-06-28' },
      { id: 'a10', nome: 'Gabriela Dias', idade: 24, fone: '(11) 98877-9900', plano: 'Anual', status: 'Ativo', mensalidade: 'Paga', desde: '2026-05-12' }
    ],
    treinos: [
      { id: 't1', alunoId: 'a1', tipo: 'Musculação', dia: 'Segunda', objetivo: 'Hipertrofia — membros superiores', exercicios: ['Supino reto 3x12', 'Agachamento 4x10', 'Puxada alta 3x12'] },
      { id: 't2', alunoId: 'a2', tipo: 'Funcional', dia: 'Quarta', objetivo: 'Condicionamento geral', exercicios: ['Burpee 4x15', 'Kettlebell swing 3x20', 'Prancha 3x1min'] },
      { id: 't3', alunoId: 'a2', tipo: 'Musculação', dia: 'Sexta', objetivo: 'Hipertrofia — costas e bíceps', exercicios: ['Levantamento terra 3x8', 'Remada curvada 3x10', 'Rosca direta 3x12'] },
      { id: 't4', alunoId: 'a5', tipo: 'Funcional', dia: 'Quarta', objetivo: 'Resistência', exercicios: ['Kettlebell swing 3x15', 'Corda naval 4x30s', 'Abdominal 3x20'] },
      { id: 't5', alunoId: 'a6', tipo: 'Musculação', dia: 'Segunda', objetivo: 'Emagrecimento — pernas', exercicios: ['Leg press 3x12', 'Cadeira flexora 3x12', 'Panturrilha 4x15'] },
      { id: 't6', alunoId: 'a9', tipo: 'Funcional', dia: 'Sexta', objetivo: 'Condicionamento', exercicios: ['Burpee 4x12', 'Prancha 3x45s', 'Agachamento livre 3x15'] },
      { id: 't7', alunoId: 'a10', tipo: 'Musculação', dia: 'Terça', objetivo: 'Hipertrofia — ombros', exercicios: ['Desenvolvimento 3x10', 'Elevação lateral 3x12', 'Encolhimento 3x15'] }
    ],
    checkins: checkins,
    planos: [
      { id: 'pl_mensal', nome: 'Mensal', valor: 89.90, duracaoDias: 30, ativo: true },
      { id: 'pl_trimestral', nome: 'Trimestral', valor: 239.90, duracaoDias: 90, ativo: true },
      { id: 'pl_anual', nome: 'Anual', valor: 799.90, duracaoDias: 365, ativo: true },
      { id: 'pl_semestral', nome: 'Semestral', valor: 459.90, duracaoDias: 180, ativo: true },
      { id: 'pl_promo', nome: 'Promocional', valor: 49.90, duracaoDias: 30, ativo: false }
    ],
    pagamentos: [
      { id: 'pg1', alunoId: 'a1', valor: 89.90, data: '2026-08-10', vencimento: '2026-09-10', forma: 'Pix', status: 'Pago' },
      { id: 'pg2', alunoId: 'a2', valor: 239.90, data: '2026-07-02', vencimento: '2026-10-02', forma: 'Cartão', status: 'Pago' },
      { id: 'pg3', alunoId: 'a5', valor: 239.90, data: '2026-07-18', vencimento: '2026-10-18', forma: 'Pix', status: 'Pago' },
      { id: 'pg4', alunoId: 'a6', valor: 89.90, data: '2026-08-25', vencimento: '2026-09-25', forma: 'Dinheiro', status: 'Pago' },
      { id: 'pg5', alunoId: 'a9', valor: 239.90, data: '2026-06-28', vencimento: '2026-09-28', forma: 'Cartão', status: 'Pago' },
      { id: 'pg6', alunoId: 'a10', valor: 799.90, data: '2026-05-12', vencimento: '2027-05-12', forma: 'Pix', status: 'Pago' }
    ],
    avaliacoes: [
      { id: 'av1', alunoId: 'a1', peso: 80, altura: 168, gordura: 22, data: '2026-08-15', obs: 'Início do acompanhamento' },
      { id: 'av2', alunoId: 'a1', peso: 78, altura: 168, gordura: 19, data: '2026-09-20', obs: 'Boa evolução' },
      { id: 'av3', alunoId: 'a2', peso: 85, altura: 180, gordura: 25, data: '2026-09-10', obs: 'Ganho de massa' },
      { id: 'av4', alunoId: 'a5', peso: 74, altura: 175, gordura: 18, data: '2026-09-18', obs: 'Manutenção' }
    ],
    sessoes: [
      { id: 'se1', alunoId: 'a1', treinoId: 't1', tipo: 'Musculação', data: '2026-09-18', duracaoMin: 45, volume: 1200, exercicios: [{ nome: 'Supino reto', series: 3, reps: 12, carga: 40 }, { nome: 'Puxada alta', series: 3, reps: 12, carga: 35 }] },
      { id: 'se2', alunoId: 'a2', treinoId: 't2', tipo: 'Funcional', data: '2026-09-19', duracaoMin: 50, volume: 1500, exercicios: [{ nome: 'Burpee', series: 4, reps: 15, carga: 0 }, { nome: 'Kettlebell swing', series: 3, reps: 20, carga: 16 }] }
    ],
    schema: SCHEMA_VERSION,
    // Módulo nutricional (nutricionista real prescreve; sem cardápio automático)
    anamneses: {
      a1: { objetivo: 'Hipertrofia', refeicoes: '4', restricoes: 'Sem lactose', obs: 'Rotina intensa de treino' },
      a2: { objetivo: 'Manutenção', refeicoes: '3', restricoes: '', obs: 'Prefere refeições rápidas' }
    },
    planosAlimentares: {
      a1: { data: '2026-09-18', autor: 'Nutri Helena (Nutricionista)', itens: [{ refeicao: 'Café da manhã', detalhe: '3 ovos + 60g aveia + café' }, { refeicao: 'Almoço', detalhe: '150g frango + arroz + salada' }, { refeicao: 'Jantar', detalhe: '150g peixe + batata + legumes' }], orientacoes: 'Ajustar proteína pós-treino conforme exame.' }
    },
    // Pedidos da profa. Maristela (pós-MVP): exames, treinos planejados, desafios e fórum
    exames: [
      { id: 'e1', alunoId: 'a1', nomeArquivo: 'hemograma.pdf', tipo: 'application/pdf', tamanhoKb: 320, data: '2026-09-15', obs: 'Rotina', parecer: 'Sem alterações relevantes.', conteudo: '', enviadoPor: 'Ana Souza' },
      { id: 'e2', alunoId: 'a2', nomeArquivo: 'glicemia.jpg', tipo: 'image/jpeg', tamanhoKb: 210, data: '2026-09-19', obs: 'Jejum 12h', parecer: '', conteudo: '', enviadoPor: 'Carlos Lima' },
      { id: 'e3', alunoId: 'a6', nomeArquivo: 'lipidograma.pdf', tipo: 'application/pdf', tamanhoKb: 280, data: '2026-09-12', obs: 'Perfil lipídico', parecer: 'Colesterol dentro da faixa.', conteudo: '', enviadoPor: 'Carla Nunes' }
    ],
    desafios: [
      { id: 'd1', titulo: '7 dias sem faltar', descricao: 'Treine 7 dias seguidos e registre o check-in. Vale para todos os perfis.', perfilAlvo: 'Todos', criadorNome: 'Academia NOCTIS', criadorPerfil: 'Administrador', data: '2026-09-20', participantes: ['a1', 'a2'] },
      { id: 'd2', titulo: 'Foco Hipertrofia: +4 treinos na semana', descricao: 'Sugestão da academia para o perfil Hipertrofia: complete 4 treinos de musculação na semana.', perfilAlvo: 'Hipertrofia', criadorNome: 'Academia NOCTIS', criadorPerfil: 'Administrador', data: '2026-09-21', participantes: [] },
      { id: 'd3', titulo: '12 treinos no mês', descricao: 'Mantenha a consistência: complete 12 treinos no mês e registre suas sessões.', perfilAlvo: 'Todos', criadorNome: 'Academia NOCTIS', criadorPerfil: 'Administrador', data: '2026-09-22', participantes: ['a1', 'a5', 'a6', 'a9'] },
      { id: 'd4', titulo: 'Foco Emagrecimento', descricao: 'Desafio do perfil Emagrecimento: 3 avaliações físicas no período.', perfilAlvo: 'Emagrecimento', criadorNome: 'Academia NOCTIS', criadorPerfil: 'Administrador', data: '2026-09-23', participantes: ['a7'] }
    ],
    forum: [
      { id: 'f1', titulo: 'Boas-vindas: apresente-se e conte seu objetivo', categoria: 'Dúvidas', fixado: true, autorNome: 'Admin', autorPerfil: 'Administrador', data: '2026-09-20',
        mensagens: [
          { autorNome: 'Admin', autorPerfil: 'Administrador', texto: 'Usem este espaço para trocar ideia sobre treino, dieta e desafios. Sejam bem-vindos!', data: '2026-09-20' },
          { autorNome: 'Ana Souza', autorPerfil: 'Aluno', texto: 'Oi! Meu foco é hipertrofia, bora pro desafio dos 7 dias!', data: '2026-09-21' }
        ] },
      { id: 'f2', titulo: 'Melhor horário pra treinar?', categoria: 'Dicas', fixado: false, autorNome: 'Carlos Lima', autorPerfil: 'Aluno', data: '2026-09-21',
        mensagens: [
          { autorNome: 'Carlos Lima', autorPerfil: 'Aluno', texto: 'Alguém treina de manhã? Sinto que rendo mais cedo.', data: '2026-09-21' },
          { autorNome: 'Personal Caio', autorPerfil: 'Personal', texto: 'O melhor horário é o que você consegue manter com constância.', data: '2026-09-21' },
          { autorNome: 'Ana Souza', autorPerfil: 'Aluno', texto: 'Eu treino 7h e adoro.', data: '2026-09-22' }
        ] },
      { id: 'f3', titulo: 'Aviso: manutenção da catraca', categoria: 'Avisos', fixado: true, autorNome: 'Admin', autorPerfil: 'Administrador', data: '2026-09-22',
        mensagens: [
          { autorNome: 'Admin', autorPerfil: 'Administrador', texto: 'A catraca ficará em manutenção no domingo das 8h às 12h. Check-in manual na recepção.', data: '2026-09-22' }
        ] }
    ]
  };
}

const Store = {
  db: null,
  carregar() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      this.db = raw ? JSON.parse(raw) : seedInicial();
    } catch (e) { this.db = seedInicial(); }
    if (!this.db.anamneses) this.db.anamneses = {};
    if (!this.db.planosAlimentares) this.db.planosAlimentares = {};
    if (!this.db.exames) this.db.exames = [];
    if (!this.db.desafios) this.db.desafios = [];
    if (!this.db.forum) this.db.forum = [];
  if (!Array.isArray(this.db.treinos)) this.db.treinos = [];
  if (!Array.isArray(this.db.planos)) this.db.planos = Object.keys(PLANOS).map(nome => ({ id: 'pl_' + nome.toLowerCase(), nome: nome, valor: PLANOS[nome], duracaoDias: nome === 'Mensal' ? 30 : nome === 'Trimestral' ? 90 : 365, ativo: true }));
  if (!Array.isArray(this.db.pagamentos)) this.db.pagamentos = [];
  if (!Array.isArray(this.db.avaliacoes)) this.db.avaliacoes = [];
  if (!Array.isArray(this.db.sessoes)) this.db.sessoes = [];
  this.db.schema = SCHEMA_VERSION;
  return this.db;
  },
  salvar() { localStorage.setItem(DB_KEY, JSON.stringify(this.db)); }
};
