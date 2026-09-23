// app.js — MVP espelhando o Loop (7 telas)
// Tela 1 Login (3 perfis) | Tela 2 Matrícula | Tela 3 Check-in (valida pagamento)
// Tela 4 Financeiro | Telas 5-6 Nutrição (Fase 4) | Tela 7 Dashboard do Aluno

let chartPlanos = null, chartCheckins = null;
let usuarioLogado = null;
const $ = (id) => document.getElementById(id);
const hojeISO = () => new Date().toISOString().slice(0, 10);
const BRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ---------- VERIFICAÇÃO ANTI-ROBÔS (dispara no clique em Entrar) ----------
// MVP 100% front-end: ao tentar logar, roda a checagem e só então valida.
// Vale 1 sessão (sessionStorage) para não repetir a cada login da demo.
let verificando = false;
let humanoOK = false;
try { humanoOK = sessionStorage.getItem('noctis_human') === '1'; } catch (e) {}
function marcarVerificado() {
  humanoOK = true;
  const widget = $('login-verify');
  widget.classList.remove('busy');
  widget.classList.add('ok');
  $('verify-spinner').classList.add('hidden');
  $('verify-label').textContent = 'Verificado';
}
function rodarVerificacao(depois) {  if (verificando) return;
  verificando = true;
  const widget = $('login-verify');
  widget.classList.add('busy');
  $('verify-spinner').classList.remove('hidden');
  $('verify-label').textContent = 'Verificando...';
  setTimeout(() => {
    verificando = false;
    marcarVerificado();
    try { sessionStorage.setItem('noctis_human', '1'); } catch (e) {}
    depois();
  }, 1400);
}

// Clique direto na caixinha também verifica (sem logar ainda)
function tocarVerify() {
  if (humanoOK || verificando) return;
  rodarVerificacao(() => {});
}

// ---------- TELA 1: LOGIN ----------
function fazerLogin() {
  if (verificando) return;
  if (!humanoOK) { rodarVerificacao(fazerLogin); return; } // verifica antes de validar
  const email = $('login-email').value.trim().toLowerCase();
  const senha = $('login-senha').value;
  const u = USUARIOS.find(x => x.email === email && x.senha === senha);
  if (!u) { $('login-erro').textContent = 'E-mail ou senha inválidos. Use um dos usuários demo.'; return; }
  usuarioLogado = u;
  sessionStorage.setItem('fit_user', JSON.stringify(u));
  entrar();
}
function entrar() {
  $('login-screen').style.display = 'none';
  $('app').classList.remove('hidden');
  if (window.NOCTIS_BG) window.NOCTIS_BG.parar(); // desliga o 3D dentro do painel
  $('user-nome').textContent = usuarioLogado.nome;
  $('user-perfil').textContent = usuarioLogado.perfil;
  // Controle de acesso por perfil (regra simples de explicar)
  document.querySelectorAll('#nav .nav-btn').forEach(b => {
    const permitido = b.dataset.perfis.split(',').includes(usuarioLogado.perfil);
    b.style.display = permitido ? '' : 'none';
  });
  // Aluno cai direto no dashboard do aluno
  if (usuarioLogado.perfil === 'Aluno') irPara('dashaluno');
  recarregarTudo();
}
function sair() { sessionStorage.removeItem('fit_user'); location.reload(); }
// Aluno só enxerga os próprios dados: resolve o registro vinculado ao login.
// Se o registro for excluído, cai no primeiro aluno (evita tela vazia na demo).
function meuAlunoId() {
  const meu = Store.db.alunos.find(a => a.id === usuarioLogado.alunoId);
  return (meu || Store.db.alunos[0] || {}).id || '';
}
function idAlvoDashAluno() {
  return (usuarioLogado && usuarioLogado.perfil === 'Aluno') ? meuAlunoId() : $('dash-aluno').value;
}
function irPara(route) {
  document.querySelectorAll('#nav .nav-btn').forEach(b => b.classList.toggle('active', b.dataset.route === route));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('view-' + route).classList.add('active');
}
document.querySelectorAll('#nav .nav-btn').forEach(b => b.addEventListener('click', () => irPara(b.dataset.route)));

// ---------- DASHBOARD ----------
function atualizarDashboard() {
  const { alunos, checkins } = Store.db;
  const ativos = alunos.filter(a => a.status === 'Ativo');
  const recebido = alunos.filter(a => a.mensalidade === 'Paga').reduce((s, a) => s + (PLANOS[a.plano] || 0), 0);
  const pendente = alunos.filter(a => a.mensalidade === 'Pendente').reduce((s, a) => s + (PLANOS[a.plano] || 0), 0);
  $('hoje').textContent = new Date().toLocaleDateString('pt-BR');
  $('kpi-alunos').textContent = alunos.length;
  $('kpi-ativos').textContent = ativos.length + ' ativos';
  $('kpi-checkins').textContent = (checkins[hojeISO()] || []).length;
  $('kpi-receita').textContent = BRL(recebido);
  $('kpi-pendente').textContent = BRL(pendente);
  desenharGraficos();
}
function desenharGraficos() {
  const { alunos, checkins } = Store.db;
  if (chartPlanos) chartPlanos.destroy();
  chartPlanos = new Chart($('chart-planos'), { type: 'doughnut',
    data: { labels: ['Mensal', 'Trimestral', 'Anual'],
      datasets: [{ data: ['Mensal', 'Trimestral', 'Anual'].map(p => alunos.filter(a => a.plano === p).length) }] },
    options: { plugins: { legend: { position: 'bottom' } } } });
  const dias = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
  if (chartCheckins) chartCheckins.destroy();
  chartCheckins = new Chart($('chart-checkins'), { type: 'bar',
    data: { labels: dias.map(d => d.slice(8) + '/' + d.slice(5, 7)),
      datasets: [{ data: dias.map(d => (checkins[d] || []).length) }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } });
}

// ---------- TELA 2: MATRÍCULA ----------
function listarAlunos() {
  const busca = $('busca-aluno').value.toLowerCase();
  const fp = $('filtro-plano').value, fs = $('filtro-status').value;
  const lista = Store.db.alunos.filter(a => a.nome.toLowerCase().includes(busca) && (!fp || a.plano === fp) && (!fs || a.status === fs));
  $('tb-alunos').innerHTML = lista.map(a => `
    <tr><td><strong>${a.nome}</strong><br><small style="color:#9aa6b5">${a.fone} · ${a.idade} anos</small></td>
    <td>${a.plano}</td>
    <td><span class="badge ${a.status.toLowerCase()}">${a.status}</span></td>
    <td><span class="badge ${a.mensalidade === 'Paga' ? 'paga' : 'pendente'}">${a.mensalidade}</span></td>
    <td><button class="btn small ghost" onclick="editarAluno('${a.id}')">Editar</button>
    <button class="btn small danger" onclick="excluirAluno('${a.id}')">Excluir</button></td></tr>`).join('')
    || '<tr><td colspan="5">Nenhum aluno encontrado</td></tr>';
}
function abrirModalAluno() { $('modal-aluno-titulo').textContent = 'Nova matrícula'; $('f-aluno-id').value = ''; $('f-aluno-nome').value = ''; $('f-aluno-idade').value = ''; $('f-aluno-fone').value = ''; $('modal-aluno').classList.add('open'); }
function fecharModalAluno() { $('modal-aluno').classList.remove('open'); }
function editarAluno(id) { const a = Store.db.alunos.find(x => x.id === id);
  $('modal-aluno-titulo').textContent = 'Editar matrícula'; $('f-aluno-id').value = a.id; $('f-aluno-nome').value = a.nome;
  $('f-aluno-idade').value = a.idade; $('f-aluno-fone').value = a.fone; $('f-aluno-plano').value = a.plano;
  $('f-aluno-status').value = a.status; $('f-aluno-mens').value = a.mensalidade; $('modal-aluno').classList.add('open'); }
function salvarAluno() {
  const nome = $('f-aluno-nome').value.trim();
  if (!nome) return alert('Digite o nome do aluno');
  const id = $('f-aluno-id').value || ('a' + Date.now());
  const antigo = Store.db.alunos.find(x => x.id === id);
  const dados = { id, nome, idade: Number($('f-aluno-idade').value) || 0, fone: $('f-aluno-fone').value,
    plano: $('f-aluno-plano').value, status: $('f-aluno-status').value, mensalidade: $('f-aluno-mens').value,
    desde: antigo?.desde || hojeISO() };
  const i = Store.db.alunos.findIndex(x => x.id === id);
  i >= 0 ? Store.db.alunos[i] = dados : Store.db.alunos.push(dados);
  Store.salvar(); fecharModalAluno(); recarregarTudo();
}
function excluirAluno(id) { if (!confirm('Excluir matrícula e treinos deste aluno?')) return;
  Store.db.alunos = Store.db.alunos.filter(a => a.id !== id);
  Store.db.treinos = Store.db.treinos.filter(t => t.alunoId !== id);
  Store.salvar(); recarregarTudo(); }
function exportarAlunosCSV() {
  const csv = 'nome,idade,telefone,plano,status,mensalidade\n' + Store.db.alunos.map(a => `${a.nome},${a.idade},${a.fone},${a.plano},${a.status},${a.mensalidade}`).join('\n');
  const el = document.createElement('a');
  el.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); el.download = 'matriculas.csv'; el.click();
}

// ---------- TELA 3: CHECK-IN (valida pagamento + acesso) ----------
function fazerCheckin() {
  const alunoId = $('checkin-aluno').value;
  const msg = $('checkin-msg');
  const a = Store.db.alunos.find(x => x.id === alunoId);
  if (!a) { msg.textContent = 'Escolha um aluno.'; return; }
  // REGRA DO MVP (escopo do Loop): só entra se Ativo E mensalidade Paga
  if (a.status !== 'Ativo') { msg.textContent = `${a.nome} está INATIVO — acesso bloqueado. Fale com a recepção.`; return; }
  if (a.mensalidade !== 'Paga') { msg.textContent = `${a.nome} com mensalidade PENDENTE — valide o pagamento no Financeiro.`; return; }
  const hoje = hojeISO();
  Store.db.checkins[hoje] = Store.db.checkins[hoje] || [];
  Store.db.checkins[hoje].push({ alunoId, hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) });
  Store.salvar(); msg.textContent = `Acesso liberado: ${a.nome}. Bom treino.`; recarregarTudo();
}
function listarCheckins() {
  const lista = Store.db.checkins[hojeISO()] || [];
  $('checkin-hoje-total').textContent = lista.length;
  $('tb-checkins').innerHTML = lista.map((c, i) => { const al = Store.db.alunos.find(a => a.id === c.alunoId);
    return `<tr><td>${al ? al.nome : '—'}</td><td>${c.hora}</td><td><button class="btn small danger" onclick="removerCheckin(${i})">Remover</button></td></tr>`; }).join('')
    || '<tr><td colspan="3">Nenhum acesso hoje</td></tr>';
}
function removerCheckin(i) { Store.db.checkins[hojeISO()].splice(i, 1); Store.salvar(); recarregarTudo(); }

// ---------- TELA 4: FINANCEIRO ----------
function listarFinanceiro() {
  const alunos = Store.db.alunos.filter(a => a.status === 'Ativo');
  const recebido = alunos.filter(a => a.mensalidade === 'Paga').reduce((s, a) => s + PLANOS[a.plano], 0);
  const areceber = alunos.filter(a => a.mensalidade === 'Pendente').reduce((s, a) => s + PLANOS[a.plano], 0);
  $('fin-recebido').textContent = BRL(recebido);
  $('fin-areceber').textContent = BRL(areceber);
  $('fin-inad').textContent = alunos.filter(a => a.mensalidade === 'Pendente').length;
  $('tb-financeiro').innerHTML = alunos.map(a => `
    <tr><td>${a.nome}</td><td>${a.plano}</td><td>${BRL(PLANOS[a.plano])}</td>
    <td><span class="badge ${a.mensalidade === 'Paga' ? 'paga' : 'pendente'}">${a.mensalidade}</span></td>
    <td><button class="btn small ghost" onclick="alternarMensalidade('${a.id}')">Alternar</button></td></tr>`).join('')
    || '<tr><td colspan="5">Sem alunos ativos</td></tr>';
}
function alternarMensalidade(id) { const a = Store.db.alunos.find(x => x.id === id);
  a.mensalidade = a.mensalidade === 'Paga' ? 'Pendente' : 'Paga'; Store.salvar(); recarregarTudo(); }

// ---------- TELAS 5-6: NUTRIÇÃO (Fase 4) ----------
function salvarAnamnese() {
  const alunoId = $('anam-aluno').value;
  if (!alunoId) return alert('Escolha um aluno');
  Store.db.anamneses[alunoId] = { objetivo: $('anam-objetivo').value, refeicoes: $('anam-refeicoes').value,
    restricoes: $('anam-restricoes').value, obs: $('anam-obs').value };
  Store.salvar(); alert('Anamnese salva!');
}
const CARDAPIOS = {
  Hipertrofia: ['Café: ovos + aveia + banana', 'Almoço: arroz, frango 150g, feijão, salada', 'Pré-treino: batata-doce + whey', 'Jantar: carne + legumes + arroz'],
  Emagrecimento: ['Café: iogurte natural + chia + fruta', 'Almoço: salada grande + frango grelhado', 'Lanche: whey + maçã', 'Jantar: omelete + legumes'],
  Manutenção: ['Café: pão integral + ovos + café', 'Almoço: arroz, feijão, carne, salada', 'Lanche: fruta + castanhas', 'Jantar: frango + legumes']
};
function gerarPlano() {
  const alunoId = $('plano-aluno').value;
  const al = Store.db.alunos.find(a => a.id === alunoId);
  const anam = Store.db.anamneses[alunoId];
  const objetivo = anam?.objetivo || 'Manutenção';
  const itens = CARDAPIOS[objetivo].map(x => `<li>${x}</li>`).join('');
  Store.db.planosAlimentares[alunoId] = { objetivo, data: hojeISO() }; Store.salvar();
  $('plano-result').innerHTML = `<h2>Cardápio — ${al ? al.nome : ''} (${objetivo})</h2><ul>${itens}</ul>
    <small style="color:#9aa6b5">Modelo ilustrativo do MVP — prescrição real exige nutricionista (ver Riscos/LGPD no README).</small>`;
}

// ---------- TELA 7: DASHBOARD DO ALUNO ----------
function verDashAluno() {
  const id = idAlvoDashAluno();
  const a = Store.db.alunos.find(x => x.id === id);
  if (!a) { $('dash-aluno-box').innerHTML = ''; return; }
  const treinos = Store.db.treinos.filter(t => t.alunoId === id);
  const totalCheckins = Object.values(Store.db.checkins).flat().filter(c => c.alunoId === id).length;
  const anam = Store.db.anamneses[id];
  $('dash-aluno-box').innerHTML = `
    <div class="cards">
      <div class="card"><span class="label">Plano</span><strong style="font-size:22px">${a.plano}</strong><small>${BRL(PLANOS[a.plano])}</small></div>
      <div class="card ${a.mensalidade === 'Paga' ? 'green' : 'orange'}"><span class="label">Mensalidade</span><strong style="font-size:22px">${a.mensalidade}</strong></div>
      <div class="card"><span class="label">Treinos</span><strong>${treinos.length}</strong></div>
      <div class="card orange"><span class="label">Presenças</span><strong>${totalCheckins}</strong></div>
    </div>
    <div class="panel"><h2>Meus treinos</h2>${treinos.map(t => `<p><strong>${t.tipo}</strong> · ${t.dia}<br><small>${t.exercicios.join(' · ')}</small></p>`).join('') || '<p>Nenhum treino montado.</p>'}</div>
    <div class="panel"><h2>Anamnese</h2><p>${anam ? `${anam.objetivo} · ${anam.refeicoes} refeições/dia · ${anam.restricoes || 'sem restrições'}` : 'Anamnese ainda não preenchida (Fase 4).'}</p></div>`;
}

// ---------- INIT ----------
function preencherSelects() {
  const opts = Store.db.alunos.map(a => `<option value="${a.id}">${a.nome} — ${a.plano} (${a.mensalidade})</option>`).join('');
  ['checkin-aluno', 'anam-aluno', 'plano-aluno', 'dash-aluno'].forEach(id => { $(id).innerHTML = opts || '<option value="">Cadastre um aluno</option>'; });
  // Perfil Aluno: esconde o seletor e trava no próprio registro (privacidade)
  const souAluno = usuarioLogado && usuarioLogado.perfil === 'Aluno';
  $('dash-aluno').parentElement.style.display = souAluno ? 'none' : '';
  if (souAluno) {
    const meu = meuAlunoId();
    const a = Store.db.alunos.find(x => x.id === meu);
    if (a) $('dash-aluno').innerHTML = `<option value="${a.id}">${a.nome}</option>`;
  }
  // Carrega anamnese ao trocar aluno
  const carregar = () => { const an = Store.db.anamneses[$('anam-aluno').value];
    if (an) { $('anam-objetivo').value = an.objetivo; $('anam-refeicoes').value = an.refeicoes; $('anam-restricoes').value = an.restricoes; $('anam-obs').value = an.obs; } };
  $('anam-aluno').onchange = carregar; $('dash-aluno').onchange = verDashAluno; carregar();
}
function recarregarTudo() { preencherSelects(); listarAlunos(); listarCheckins(); listarFinanceiro(); verDashAluno(); atualizarDashboard(); }
['busca-aluno', 'filtro-plano', 'filtro-status'].forEach(id => $(id).addEventListener('input', listarAlunos));

Store.carregar();
// Intro cinematográfica: 1x por sessão (clique pula direto)
try {
  if (sessionStorage.getItem('noctis_intro') === '1') $('intro').classList.add('done');
  else {
    const pularIntro = () => { $('intro').classList.add('done'); try { sessionStorage.setItem('noctis_intro', '1'); } catch (e) {} };
    $('intro').addEventListener('click', pularIntro);
    setTimeout(pularIntro, 3300);
  }
} catch (e) { const el = $('intro'); if (el) setTimeout(() => el.classList.add('done'), 2800); }
// Verificação já feita nesta sessão: mostra o check direto no login
if (humanoOK) marcarVerificado();
// Mantém login na mesma aba (sessionStorage) — prático na demo
try { const s = sessionStorage.getItem('fit_user'); if (s) { usuarioLogado = JSON.parse(s); entrar(); } } catch (e) {}
