// store.js — camada de dados (espelha o Loop: 7 telas)
// MVP = Matrícula + Check-in (+ Login e Financeiro do backlog)
// Fase 4 = Anamnese + Plano alimentar + Dashboard do aluno
const DB_KEY = 'noctis_mvp_v1';

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
  return {
    alunos: [
      { id: 'a1', nome: 'Ana Souza', idade: 24, fone: '(11) 98811-2233', plano: 'Mensal', status: 'Ativo', mensalidade: 'Paga', desde: '2026-08-10' },
      { id: 'a2', nome: 'Carlos Lima', idade: 31, fone: '(11) 97722-3344', plano: 'Trimestral', status: 'Ativo', mensalidade: 'Paga', desde: '2026-07-02' },
      { id: 'a3', nome: 'Beatriz Rocha', idade: 27, fone: '(11) 96633-4455', plano: 'Anual', status: 'Ativo', mensalidade: 'Pendente', desde: '2026-06-15' },
      { id: 'a4', nome: 'Diego Martins', idade: 35, fone: '(11) 95544-5566', plano: 'Mensal', status: 'Inativo', mensalidade: 'Pendente', desde: '2026-05-20' }
    ],
    treinos: [
      { id: 't1', alunoId: 'a1', tipo: 'Musculação', dia: 'Segunda', exercicios: ['Supino reto 3x12', 'Agachamento 4x10', 'Puxada alta 3x12'] },
      { id: 't2', alunoId: 'a2', tipo: 'Funcional', dia: 'Quarta', exercicios: ['Burpee 4x15', 'Kettlebell swing 3x20', 'Prancha 3x1min'] }
    ],
    checkins: {},
    // Fase 4 — Módulo Nutricional (estrutura pronta, tela marca "Fase 4")
    anamneses: {},
    planosAlimentares: {},
    // Pedidos da profa. Maristela (pós-MVP): exames, treinos planejados, desafios e fórum
    exames: [],
    desafios: [
      { id: 'd1', titulo: '7 dias sem faltar', descricao: 'Treine 7 dias seguidos e registre o check-in. Vale para todos os perfis.', perfilAlvo: 'Todos', criadorNome: 'Academia NOCTIS', criadorPerfil: 'Administrador', data: '2026-09-20', participantes: ['a1', 'a2'] },
      { id: 'd2', titulo: 'Foco Hipertrofia: +4 treinos na semana', descricao: 'Sugestão da academia para o perfil Hipertrofia: complete 4 treinos de musculação na semana.', perfilAlvo: 'Hipertrofia', criadorNome: 'Academia NOCTIS', criadorPerfil: 'Administrador', data: '2026-09-21', participantes: [] }
    ],
    forum: [
      { id: 'f1', titulo: 'Boas-vindas: apresente-se e conte seu objetivo', autorNome: 'Admin', autorPerfil: 'Administrador', data: '2026-09-20',
        mensagens: [
          { autorNome: 'Admin', autorPerfil: 'Administrador', texto: 'Usem este espaço para trocar ideia sobre treino, dieta e desafios. Sejam bem-vindos!', data: '2026-09-20' },
          { autorNome: 'Ana Souza', autorPerfil: 'Aluno', texto: 'Oi! Meu foco é hipertrofia, bora pro desafio dos 7 dias!', data: '2026-09-21' }
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
    return this.db;
  },
  salvar() { localStorage.setItem(DB_KEY, JSON.stringify(this.db)); }
};
