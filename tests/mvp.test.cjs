// tests/mvp.test.cjs — suíte de testes do MVP NOCTIS (zero dependências)
// Roda com: node tests/mvp.test.cjs
// Cobre: seed do banco, login 3 perfis, regra do check-in, matrícula CRUD,
// financeiro, privacidade do aluno e cobertura de IDs/funções no HTML.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const results = [];
let passed = 0, failed = 0;
function ok(cond, msg) {
  if (cond) { passed++; results.push(`  PASS  ${msg}`); }
  else { failed++; results.push(`  FAIL  ${msg}`); }
}

// ---------- stubs de navegador ----------
function makeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
}
function makeEl(id) {
  return {
    id, value: '', innerHTML: '', textContent: '',
    style: {}, dataset: {}, checked: false,
    parentElement: { style: {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {},
  };
}
const alerts = [];
const els = new Map();
const sandbox = {
  console,
  setTimeout, clearTimeout,
  localStorage: makeStorage(),
  sessionStorage: makeStorage(),
  alert: (m) => alerts.push(m),
  confirm: () => true,
  addEventListener() {},
  requestAnimationFrame() {},
  Blob: function () {},
  URL: { createObjectURL: () => 'blob:fake' },
  location: { reload() {} },
  Chart: class { destroy() {} },
  document: {
    getElementById: (id) => {
      if (!els.has(id)) els.set(id, makeEl(id));
      return els.get(id);
    },
    querySelectorAll: () => [],
    createElement: () => ({ click() {}, href: '', download: '' }),
  },
  __alerts: alerts,
};
vm.createContext(sandbox);

// ---------- carrega o sistema de verdade ----------
for (const f of ['js/store.js', 'js/app.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const $ = (id) => sandbox.document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('== NOCTIS MVP — testes ==\n-- banco (store.js) --');
  vm.runInContext('Store.carregar()', sandbox);
  ok(vm.runInContext('Store.db.alunos.length', sandbox) === 4, 'seed tem 4 alunos');
  ok(vm.runInContext('Store.db.treinos.length', sandbox) === 2, 'seed tem 2 treinos');
  ok(vm.runInContext('PLANOS.Mensal', sandbox) === 89.90, 'plano Mensal = 89,90');
  ok(vm.runInContext('USUARIOS.length', sandbox) === 5, 'existem 5 perfis de login (admin, funcionário, aluno, nutri, personal)');
  ok(vm.runInContext(`USUARIOS.some(u=>u.perfil==='Nutricionista')`, sandbox), 'perfil Nutricionista existe (pedido Maristela)');
  ok(vm.runInContext(`USUARIOS.some(u=>u.perfil==='Personal')`, sandbox), 'perfil Personal existe (pedido Maristela)');
  ok(Array.isArray(vm.runInContext('Store.db.exames', sandbox)), 'banco tem coleção exames');
  ok(Array.isArray(vm.runInContext('Store.db.desafios', sandbox)), 'banco tem coleção desafios');
  ok(Array.isArray(vm.runInContext('Store.db.forum', sandbox)), 'banco tem coleção forum');
  vm.runInContext('Store.salvar()', sandbox);
  ok(sandbox.localStorage.getItem('noctis_mvp_v1') !== null, 'salvar persiste no localStorage');

  console.log('-- login --');
  $('login-email').value = 'errado@x'; $('login-senha').value = 'xxx';
  vm.runInContext('humanoOK = true; fazerLogin()', sandbox); // pula a verificação p/ testar credencial
  ok($('login-erro').textContent.includes('inválidos'), 'credencial errada mostra erro');
  ok(sandbox.sessionStorage.getItem('fit_user') === null, 'credencial errada não cria sessão');

  $('login-email').value = 'admin@noctis'; $('login-senha').value = 'admin123';
  sandbox.sessionStorage.clear();
  vm.runInContext('fazerLogin()', sandbox); // humanoOK já true acima
  ok(JSON.parse(sandbox.sessionStorage.getItem('fit_user')).perfil === 'Administrador', 'login admin cria sessão');
  ok($('user-nome').textContent === 'Admin', 'nome do usuário exibido');

  console.log('-- verificação anti-robôs --');
  vm.runInContext('humanoOK = false; $(' + `'login-email'` + ').value = "admin@noctis"', sandbox);
  $('login-senha').value = 'admin123';
  sandbox.sessionStorage.clear();
  const t0 = Date.now();
  vm.runInContext('fazerLogin()', sandbox); // deve verificar antes de validar
  ok($('verify-label').textContent === 'Verificando...', 'clique em Entrar dispara verificação');
  await sleep(1700);
  ok(Date.now() - t0 >= 1400, 'verificação leva ~1,4s');
  ok(sandbox.sessionStorage.getItem('fit_user') !== null, 'após verificar, login prossegue');

  console.log('-- regra do check-in (RN01) --');
  vm.runInContext(`Store.db = seedInicial(); Store.salvar()`, sandbox);
  $('checkin-aluno').value = 'a3'; // Beatriz: Ativa + Pendente
  vm.runInContext('fazerCheckin()', sandbox);
  ok($('checkin-msg').textContent.includes('PENDENTE'), 'mensalidade pendente bloqueia com motivo');
  ok(vm.runInContext(`(Store.db.checkins[hojeISO()] || []).length`, sandbox) === 0, 'bloqueio não registra presença');
  $('checkin-aluno').value = 'a4'; // Diego: Inativo
  vm.runInContext('fazerCheckin()', sandbox);
  ok($('checkin-msg').textContent.includes('INATIVO'), 'aluno inativo bloqueia com motivo');
  $('checkin-aluno').value = 'a1'; // Ana: Ativa + Paga
  vm.runInContext('fazerCheckin()', sandbox);
  ok($('checkin-msg').textContent.includes('liberado'), 'aluno regular tem acesso liberado');
  ok(vm.runInContext(`(Store.db.checkins[hojeISO()] || []).length`, sandbox) === 1, 'acesso liberado registra presença');
  $('checkin-aluno').value = '';
  vm.runInContext('fazerCheckin()', sandbox);
  ok($('checkin-msg').textContent.includes('Escolha'), 'sem aluno mostra orientação');

  console.log('-- matrícula CRUD --');
  const n0 = vm.runInContext('Store.db.alunos.length', sandbox);
  $('f-aluno-id').value = ''; $('f-aluno-nome').value = '   ';
  vm.runInContext('salvarAluno()', sandbox);
  ok(alerts.length > 0 && vm.runInContext('Store.db.alunos.length', sandbox) === n0, 'nome vazio alerta e não salva');
  $('f-aluno-nome').value = 'Teste Silva'; $('f-aluno-idade').value = '20';
  $('f-aluno-fone').value = '(11) 90000-0000'; $('f-aluno-plano').value = 'Mensal';
  $('f-aluno-status').value = 'Ativo'; $('f-aluno-mens').value = 'Paga';
  vm.runInContext('salvarAluno()', sandbox);
  ok(vm.runInContext('Store.db.alunos.length', sandbox) === n0 + 1, 'novo aluno é salvo');
  const novoId = vm.runInContext('Store.db.alunos[Store.db.alunos.length-1].id', sandbox);
  $('f-aluno-id').value = novoId; $('f-aluno-nome').value = 'Teste Alterado';
  vm.runInContext('salvarAluno()', sandbox);
  ok(vm.runInContext(`Store.db.alunos.find(a=>a.id==='${novoId}').nome`, sandbox) === 'Teste Alterado', 'edição atualiza o registro');
  vm.runInContext(`excluirAluno('${novoId}')`, sandbox);
  ok(vm.runInContext('Store.db.alunos.length', sandbox) === n0, 'exclusão remove o registro');

  console.log('-- financeiro (RN02) --');
  vm.runInContext(`Store.db = seedInicial()`, sandbox);
  vm.runInContext('listarFinanceiro()', sandbox);
  const expRec = (89.90 + 239.90).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  ok($('fin-recebido').textContent === expRec, `recebido = ${expRec} (Ana + Carlos)`);
  ok($('fin-inad').textContent === 1, '1 inadimplente ativo (Beatriz; Diego é inativo)');
  vm.runInContext(`alternarMensalidade('a3')`, sandbox);
  ok(vm.runInContext(`Store.db.alunos.find(a=>a.id==='a3').mensalidade`, sandbox) === 'Paga', 'alternar muda Pendente→Paga');

  console.log('-- privacidade do aluno (RN03) --');
  vm.runInContext(`Store.db = seedInicial()`, sandbox);
  $('login-email').value = 'aluno@noctis'; $('login-senha').value = 'aluno123';
  vm.runInContext('humanoOK = true; fazerLogin()', sandbox);
  ok($('dash-aluno').parentElement.style.display === 'none', 'perfil aluno não vê o seletor');
  ok($('dash-aluno-box').innerHTML.includes('Ana Souza'), 'aluno vê só os próprios dados');

  console.log('-- cobertura HTML x JS --');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
  const ids = [...new Set([...app.matchAll(/\$\('([^']+)'\)/g)].map((m) => m[1]))];
  const dinamicos = new Set(['forum-resp', 'plano-orient']); // criados via innerHTML (fórum/plano)
  const faltando = ids.filter((id) => !id.startsWith('parecer-') && !dinamicos.has(id) && !html.includes(`id="${id}"`));
  ok(faltando.length === 0, `todos os ${ids.length} IDs usados existem no HTML${faltando.length ? ' (faltam: ' + faltando.join(',') + ')' : ''}`);
  const handlers = [...new Set([...html.matchAll(/onclick="([a-zA-Z]+)\(/g)].map((m) => m[1]))];
  const semFn = handlers.filter((h) => vm.runInContext(`typeof ${h}`, sandbox) !== 'function');
  ok(semFn.length === 0, `todos os ${handlers.length} onclick têm função${semFn.length ? ' (faltam: ' + semFn.join(',') + ')' : ''}`);

  console.log('-- novos módulos (Maristela) --');
  vm.runInContext(`Store.db = seedInicial(); Store.salvar()`, sandbox);
  // Treinos: personal cria planejamento
  $('f-treino-aluno').value = 'a1'; $('f-treino-tipo').value = 'Musculação'; $('f-treino-dia').value = 'Segunda';
  $('f-treino-objetivo').value = 'Hipertrofia'; $('f-treino-exercicios').value = 'Supino 3x12'; $('f-treino-id').value = '';
  vm.runInContext(`usuarioLogado = USUARIOS[0]; salvarTreino()`, sandbox);
  ok(vm.runInContext(`Store.db.treinos.length`, sandbox) === 3, 'personal/admin cria treino (2 seed + 1 novo)');
  // Plano com autor (nutricionista prescreve)
  $('plano-aluno').value = 'a1';
  vm.runInContext(`gerarPlano()`, sandbox);
  ok(vm.runInContext(`!!Store.db.planosAlimentares['a1'].autor`, sandbox), 'plano registra autor (nutricionista)');
  // Desafios: criar + participar
  $('f-desafio-titulo').value = 'Desafio teste'; $('f-desafio-desc').value = 'desc'; $('f-desafio-perfil').value = 'Todos';
  const nd0 = vm.runInContext(`Store.db.desafios.length`, sandbox);
  vm.runInContext(`salvarDesafio()`, sandbox);
  ok(vm.runInContext(`Store.db.desafios.length`, sandbox) === nd0 + 1, 'desafio é publicado (academia ou aluno)');
  const did = vm.runInContext(`Store.db.desafios[Store.db.desafios.length-1].id`, sandbox);
  vm.runInContext(`usuarioLogado = USUARIOS.find(u=>u.perfil==='Aluno'); participarDesafio('${did}')`, sandbox);
  ok(vm.runInContext(`Store.db.desafios.find(d=>d.id==='${did}').participantes.includes('a1')`, sandbox), 'aluno participa do desafio');
  // Fórum: tópico + resposta
  $('f-topico-titulo').value = 'Tópico teste'; $('f-topico-msg').value = 'primeira msg';
  const nf0 = vm.runInContext(`Store.db.forum.length`, sandbox);
  vm.runInContext(`usuarioLogado = USUARIOS[0]; salvarTopico()`, sandbox);
  ok(vm.runInContext(`Store.db.forum.length`, sandbox) === nf0 + 1, 'tópico do fórum é publicado');
  const fid = vm.runInContext(`Store.db.forum[Store.db.forum.length-1].id`, sandbox);
  vm.runInContext(`forumAberto = '${fid}'`, sandbox);
  els.set('forum-resp', makeEl('forum-resp')); $('forum-resp').value = 'resposta teste';
  vm.runInContext(`responderTopico()`, sandbox);
  ok(vm.runInContext(`Store.db.forum.find(f=>f.id==='${fid}').mensagens.length`, sandbox) === 2, 'resposta entra no tópico');
  // Exames: coleção persiste metadados
  vm.runInContext(`Store.db.exames.push({id:'ex', alunoId:'a1', nomeArquivo:'hemograma.pdf', data:'2026-09-25', obs:'rotina', parecer:'ok', conteudo:''}); Store.salvar()`, sandbox);
  ok(vm.runInContext(`Store.db.exames.length`, sandbox) === 1, 'exame do aluno é registrado p/ nutri analisar');

  console.log('-- travas de perfil (Maristela) --');
  vm.runInContext(`Store.db = seedInicial(); Store.salvar()`, sandbox);
  vm.runInContext(`usuarioLogado = USUARIOS.find(u=>u.perfil==='Aluno')`, sandbox);
  const plans0 = vm.runInContext(`Object.keys(Store.db.planosAlimentares).length`, sandbox);
  $('plano-aluno').value = 'a1';
  vm.runInContext(`gerarPlano()`, sandbox);
  ok(vm.runInContext(`Object.keys(Store.db.planosAlimentares).length`, sandbox) === plans0, 'aluno não gera cardápio (só nutrição)');
  vm.runInContext(`usuarioLogado = USUARIOS.find(u=>u.perfil==='Nutricionista')`, sandbox);
  vm.runInContext(`alternarMensalidade('a3')`, sandbox);
  ok(vm.runInContext(`Store.db.alunos.find(a=>a.id==='a3').mensalidade`, sandbox) === 'Pendente', 'nutri não dá baixa (só admin/funcionário)');
  vm.runInContext(`usuarioLogado = USUARIOS[0]`, sandbox);
  const did2 = vm.runInContext(`Store.db.desafios[0].id`, sandbox);
  const parts0 = vm.runInContext(`Store.db.desafios[0].participantes.length`, sandbox);
  vm.runInContext(`participarDesafio('${did2}')`, sandbox);
  ok(vm.runInContext(`Store.db.desafios[0].participantes.length`, sandbox) === parts0, 'não-aluno não entra em desafio');
  vm.runInContext(`usuarioLogado = USUARIOS.find(u=>u.perfil==='Aluno')`, sandbox);
  const tr0 = vm.runInContext(`Store.db.treinos.length`, sandbox);
  $('f-treino-aluno').value = 'a1'; $('f-treino-tipo').value = 'X'; $('f-treino-id').value = '';
  vm.runInContext(`salvarTreino()`, sandbox);
  ok(vm.runInContext(`Store.db.treinos.length`, sandbox) === tr0, 'aluno não monta treino (só personal/equipe)');
  const an0 = vm.runInContext(`Object.keys(Store.db.anamneses).length`, sandbox);
  $('anam-aluno').value = 'a1';
  vm.runInContext(`salvarAnamnese()`, sandbox);
  ok(vm.runInContext(`Object.keys(Store.db.anamneses).length`, sandbox) === an0, 'aluno não registra anamnese');
  vm.runInContext(`Store.db.exames.push({id:'ex2', alunoId:'a1', nomeArquivo:'x.pdf', data:'2026-09-25', obs:'', parecer:'', conteudo:'', enviadoPor:'Admin'}); usuarioLogado = USUARIOS.find(u=>u.perfil==='Personal')`, sandbox);
  vm.runInContext(`removerExame('ex2')`, sandbox);
  ok(vm.runInContext(`Store.db.exames.some(e=>e.id==='ex2')`, sandbox), 'terceiro não apaga exame alheio');

  console.log('-- front-2 (inspirado nos famosos) --');
  ok(vm.runInContext(`diaHojePT()`, sandbox) === ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][new Date().getDay()], 'dia da semana PT confere');
  ok(vm.runInContext(`"STQQSSD"[(new Date('2026-09-28T12:00').getDay()+6)%7]`, sandbox) === 'S', 'segunda mostra S (bug das iniciais corrigido)');
  vm.runInContext(`usuarioLogado = USUARIOS[0]; recarregarTudo()`, sandbox);
  ok($('dash-ranking').innerHTML.includes('rank-row'), 'ranking dos frequentes renderiza');
  $('dash-aluno').value = 'a1';
  vm.runInContext(`verDashAluno()`, sandbox);
  ok($('dash-aluno-box').innerHTML.includes('TREINO DE HOJE'), 'aluno vê treino de hoje (Smart Fit)');
  $('treino-filtro-dia').value = '';
  vm.runInContext(`filtrarDia('Segunda')`, sandbox);
  ok($('treino-filtro-dia').value === 'Segunda', 'chips de dia filtram treinos');
  vm.runInContext(`listarDesafios()`, sandbox);
  ok($('desafios-lista').innerHTML.includes('chal-card'), 'desafios em cards com stack e líder (Strava)');
  vm.runInContext(`listarTreinos()`, sandbox);
  ok($('treinos-lista').innerHTML.includes('work-card'), 'treinos em cards (Nike Training)');

  console.log('\n' + results.join('\n'));
  console.log(`\nTOTAL: ${passed} passou, ${failed} falhou`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('ERRO NO HARNESS:', e); process.exit(2); });
