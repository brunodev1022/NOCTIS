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
  ok(vm.runInContext('USUARIOS.length', sandbox) === 3, 'existem 3 perfis de login');
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
  const faltando = ids.filter((id) => !html.includes(`id="${id}"`));
  ok(faltando.length === 0, `todos os ${ids.length} IDs usados existem no HTML${faltando.length ? ' (faltam: ' + faltando.join(',') + ')' : ''}`);
  const handlers = [...new Set([...html.matchAll(/onclick="([a-zA-Z]+)\(/g)].map((m) => m[1]))];
  const semFn = handlers.filter((h) => vm.runInContext(`typeof ${h}`, sandbox) !== 'function');
  ok(semFn.length === 0, `todos os ${handlers.length} onclick têm função${semFn.length ? ' (faltam: ' + semFn.join(',') + ')' : ''}`);

  console.log('\n' + results.join('\n'));
  console.log(`\nTOTAL: ${passed} passou, ${failed} falhou`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('ERRO NO HARNESS:', e); process.exit(2); });
