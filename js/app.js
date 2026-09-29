// app.js — MVP espelhando o Loop + pedidos da profa. Maristela
// Tela 1 Login (5 perfis) | Tela 2 Matrícula | Tela 3 Check-in (valida pagamento)
// Tela 4 Financeiro | Telas 5-6 Nutrição (nutricionista prescreve) | Tela 7 Dashboard do Aluno
// Tela 07 Treinos (personal) | Tela 08 Exames (aluno → nutri) | Tela 09 Desafios | Tela 10 Fórum

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
  if (typeof window !== 'undefined' && window.NOCTIS_BG) window.NOCTIS_BG.parar(); // desliga o 3D dentro do painel
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
// Aluno opera sempre sobre o próprio registro nas telas pessoais
function idAlvoPessoal(selectId) {
  return (usuarioLogado && usuarioLogado.perfil === 'Aluno') ? meuAlunoId() : $(selectId).value;
}
const podeGerenciarTreinos = () => usuarioLogado && ['Administrador', 'Personal', 'Funcionário'].includes(usuarioLogado.perfil);
const podeGerenciarNutri = () => usuarioLogado && ['Administrador', 'Nutricionista', 'Funcionário'].includes(usuarioLogado.perfil);
const podeGerenciarFinanceiro = () => usuarioLogado && ['Administrador', 'Funcionário'].includes(usuarioLogado.perfil);
const ehAluno = () => usuarioLogado && usuarioLogado.perfil === 'Aluno';
// Helpers de front (dia da semana PT, presenças, filtro rápido) — tudo no navegador
const DIAS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const diaHojePT = () => DIAS_PT[new Date().getDay()];
function presencasTotais() { const m = {}; Object.values(Store.db.checkins).flat().forEach(c => { m[c.alunoId] = (m[c.alunoId] || 0) + 1; }); return m; }
function filtrarDia(dia) { $('treino-filtro-dia').value = dia; listarTreinos(); }
function irPara(route) {
  document.querySelectorAll('#nav .nav-btn').forEach(b => b.classList.toggle('active', b.dataset.route === route));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('view-' + route).classList.add('active');
}
document.querySelectorAll('#nav .nav-btn').forEach(b => b.addEventListener('click', () => irPara(b.dataset.route)));

// ---------- DASHBOARD ----------
let chartSpark = null;
function turnoAtual() { const h = new Date().getHours(); return h < 12 ? 'MANHÃ' : h < 18 ? 'TARDE' : 'NOITE'; }
function atualizarDashboard() {
  const { alunos, checkins } = Store.db;
  const ativos = alunos.filter(a => a.status === 'Ativo');
  const recebido = alunos.filter(a => a.mensalidade === 'Paga').reduce((s, a) => s + (PLANOS[a.plano] || 0), 0);
  const pendente = alunos.filter(a => a.mensalidade === 'Pendente').reduce((s, a) => s + (PLANOS[a.plano] || 0), 0);
  const potencial = ativos.reduce((s, a) => s + (PLANOS[a.plano] || 0), 0);
  const inad = ativos.filter(a => a.mensalidade === 'Pendente');
  const pagantes = alunos.filter(a => a.mensalidade === 'Paga').length;
  const hojeLista = checkins[hojeISO()] || [];
  $('hoje').textContent = new Date().toLocaleDateString('pt-BR');
  const dt = $('dash-turno'); if (dt) dt.textContent = 'TURNO ' + turnoAtual();
  $('kpi-alunos').textContent = alunos.length;
  $('kpi-ativos').textContent = ativos.length + ' ativos';
  $('kpi-checkins').textContent = hojeLista.length;
  $('kpi-receita').textContent = BRL(recebido);
  $('kpi-pendente').textContent = BRL(pendente);
  const tk = $('kpi-ticket'); if (tk) tk.textContent = BRL(pagantes ? recebido / pagantes : 0);
  const ki = $('kpi-inad'); if (ki) ki.textContent = inad.length;
  const pct = potencial ? Math.round(recebido / potencial * 100) : 0;
  const d = $('kpi-receita-delta'); if (d) d.textContent = pct + '% DA META';
  const mf = $('meta-bar-fill'); if (mf) mf.style.width = pct + '%';
  const mt = $('meta-txt'); if (mt) mt.textContent = BRL(recebido) + ' / ' + BRL(potencial) + ' potencial';
  const cap = 40, oc = Math.min(100, Math.round(hojeLista.length / cap * 100));
  const of = $('ocup-bar-fill'); if (of) of.style.width = oc + '%';
  const ot = $('ocup-txt'); if (ot) ot.textContent = hojeLista.length + '/' + cap + ' VAGAS DE PICO · ' + oc + '%';
  // pico por hora
  const porHora = {};
  hojeLista.forEach(c => { const h = (c.hora || '').slice(0, 2); porHora[h] = (porHora[h] || 0) + 1; });
  const pico = Object.entries(porHora).sort((a, b) => b[1] - a[1])[0];
  const ph = $('pico-hora'); if (ph) ph.textContent = pico ? pico[0] + 'h' : '—';
  // inadimplentes top 4
  const di = $('dash-inadimplentes');
  if (di) di.innerHTML = inad.slice(0, 4).map(a => `<div class="feed-row"><span class="feed-name">${a.nome}</span><span class="badge pendente">${a.plano} · ${BRL(PLANOS[a.plano] || 0)}</span>${podeGerenciarFinanceiro() ? `<button class="btn small ghost" onclick="alternarMensalidade('${a.id}')">Dar baixa</button>` : ''}</div>`).join('') || '<p class="muted">Ninguém pendente. Base limpa.</p>';
  // atividade ao vivo (últimos 6, todos os dias, mais recentes primeiro)
  const todos = Object.entries(checkins).flatMap(([data, arr]) => (arr || []).map(c => ({ ...c, data }))).slice(-6).reverse();
  const da = $('dash-atividade');
  if (da) da.innerHTML = todos.map(c => { const al = alunos.find(a => a.id === c.alunoId); return `<div class="feed-row"><span class="live-dot sm"></span><span class="avatar xs">${iniciais(al ? al.nome : '?')}</span><span class="feed-name">${al ? al.nome : '—'}</span><span class="mono muted">${(c.data || '').slice(8)}/${(c.data || '').slice(5, 7)} · ${c.hora || ''}</span></div>`; }).join('') || '<p class="muted">Sem movimento ainda hoje.</p>';
  // ranking da semana (inspirado no Strava): top 5 por presenças totais
  const rk = $('dash-ranking');
  if (rk) { const pres = presencasTotais();
    rk.innerHTML = [...alunos].sort((a, b) => (pres[b.id] || 0) - (pres[a.id] || 0)).slice(0, 5).map((a, i) => `<div class="rank-row"><span class="rank-pos anton">${String(i + 1).padStart(2, '0')}</span><span class="avatar sm">${iniciais(a.nome)}</span><span class="feed-name">${a.nome}<br><small class="muted">${a.plano} · ${a.status}</small></span><strong class="mono">${pres[a.id] || 0} <small class="muted">presenças</small></strong></div>`).join('') || '<p class="muted">Sem presenças ainda.</p>'; }
  desenharGraficos();
}
function desenharGraficos() {
  const { alunos, checkins } = Store.db;
  const VIO = ['#8b5cf6', '#a78bfa', '#4c1d95'];
  if (typeof Chart !== 'undefined' && Chart.defaults) { Chart.defaults.color = '#8f8fa5'; Chart.defaults.font.family = "'JetBrains Mono',monospace"; Chart.defaults.font.size = 10; }
  const dadosPlanos = ['Mensal', 'Trimestral', 'Anual'].map(p => alunos.filter(a => a.plano === p).length);
  if (chartPlanos) chartPlanos.destroy();
  chartPlanos = new Chart($('chart-planos'), { type: 'doughnut',
    data: { labels: ['Mensal', 'Trimestral', 'Anual'],
      datasets: [{ data: dadosPlanos, backgroundColor: VIO, borderColor: '#12121b', borderWidth: 3, hoverOffset: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } } });
  const lg = $('planos-legend');
  if (lg) lg.innerHTML = ['Mensal', 'Trimestral', 'Anual'].map((p, i) => { const tot = dadosPlanos.reduce((s, v) => s + v, 0) || 1; return `<div class="legend-row"><span class="legend-dot" style="background:${VIO[i]}"></span><span>${p}</span><strong class="mono">${dadosPlanos[i]} · ${Math.round(dadosPlanos[i] / tot * 100)}%</strong></div>`; }).join('');
  const dias = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
  const vals = dias.map(d => (checkins[d] || []).length);
  if (chartCheckins) chartCheckins.destroy();
  chartCheckins = new Chart($('chart-checkins'), { type: 'bar',
    data: { labels: dias.map(d => d.slice(8) + '/' + d.slice(5, 7)),
      datasets: [{ data: vals, backgroundColor: vals.map((_, i) => i === 6 ? '#a78bfa' : 'rgba(139,92,246,.35)'), borderRadius: 5, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, suggestedMax: Math.max(4, ...vals), ticks: { stepSize: 1 }, grid: { color: 'rgba(36,36,49,.6)' } } } } });
  const total7 = vals.reduce((s, v) => s + v, 0);
  const fv = $('fluxo-vazio'); if (fv) fv.classList.toggle('hidden', total7 > 0);
  const t7 = $('checkins-7d'); if (t7) t7.textContent = vals.reduce((s, v) => s + v, 0);
  const md = $('checkins-media'); if (md) md.textContent = (vals.reduce((s, v) => s + v, 0) / 7).toFixed(1);
  // sparkline de receita (acumulado 7d proporcional aos check-ins pagantes como pulso operacional)
  const sc = $('chart-spark');
  if (sc) { if (chartSpark) chartSpark.destroy(); chartSpark = new Chart(sc, { type: 'line', data: { labels: dias, datasets: [{ data: vals, borderColor: '#a78bfa', borderWidth: 2, pointRadius: 0, tension: .45, fill: true, backgroundColor: 'rgba(139,92,246,.14)' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, animation: { duration: 600 } } }); }
}

// ---------- TELA 2: MATRÍCULA ----------
function listarAlunos() {
  const busca = $('busca-aluno').value.toLowerCase();
  const fp = $('filtro-plano').value, fs = $('filtro-status').value;
  const lista = Store.db.alunos.filter(a => a.nome.toLowerCase().includes(busca) && (!fp || a.plano === fp) && (!fs || a.status === fs));
  $('tb-alunos').innerHTML = lista.map(a => `
    <tr><td><div class="member"><span class="avatar sm">${iniciais(a.nome)}</span><span><strong>${a.nome}</strong><br><small style="color:#9aa6b5">${a.fone} · ${a.idade} anos</small></span></div></td>
    <td><span class="badge paga">${a.plano}</span></td>
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
    return `<tr><td><div class="member"><span class="avatar sm">${iniciais(al ? al.nome : '?')}</span><span>${al ? al.nome : '—'}</span></div></td><td class="mono">${c.hora}</td><td><button class="btn small danger" onclick="removerCheckin(${i})">Remover</button></td></tr>`; }).join('')
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
  if (!a) return;
  if (!podeGerenciarFinanceiro()) return alert('Só Admin ou Funcionário dão baixa em mensalidade.');
  a.mensalidade = a.mensalidade === 'Paga' ? 'Pendente' : 'Paga'; Store.salvar(); recarregarTudo(); }

// ---------- TELAS 5-6: NUTRIÇÃO (nutricionista prescreve) ----------
function salvarAnamnese() {
  if (!podeGerenciarNutri()) return alert('Só a equipe de nutrição registra anamnese.');
  const alunoId = $('anam-aluno').value;
  if (!alunoId) return alert('Escolha um aluno');
  Store.db.anamneses[alunoId] = { objetivo: $('anam-objetivo').value, refeicoes: $('anam-refeicoes').value,
    restricoes: $('anam-restricoes').value, obs: $('anam-obs').value };
  Store.salvar(); alert('Anamnese salva!');
}
// ---------- TELA 05: PLANO ALIMENTAR (100% manual — nutricionista real prescreve) ----------
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function addRefeicao(nome = '', detalhe = '') {
  $('plano-itens').innerHTML += `<div class="ref-row"><input class="ref-nome" placeholder="Refeição (ex: Café da manhã)" value="${esc(nome)}"><input class="ref-detalhe" placeholder="Prescrição (ex: 3 ovos + 60g aveia)" value="${esc(detalhe)}"><button class="btn small danger" onclick="removerLinhaRefeicao(this)">×</button></div>`;
}
function removerLinhaRefeicao(btn) { btn.parentElement.remove(); }
function preencherFormPlano(alunoId) {
  const box = $('plano-itens'); if (!box) return;
  const plan = Store.db.planosAlimentares[alunoId];
  box.innerHTML = '';
  (plan && plan.itens && plan.itens.length ? plan.itens : [{ refeicao: '', detalhe: '' }]).forEach(it => addRefeicao(it.refeicao, it.detalhe));
  $('plano-orientacoes').value = (plan && plan.orientacoes) || '';
}
function salvarPlanoManual() {
  if (!podeGerenciarNutri()) return alert('Só a equipe de nutrição prescreve o plano.');
  const alunoId = $('plano-aluno').value;
  if (!alunoId) return alert('Escolha um aluno');
  const itens = [...document.querySelectorAll('#plano-itens .ref-row')].map(r => ({
    refeicao: r.querySelector('.ref-nome').value.trim(),
    detalhe: r.querySelector('.ref-detalhe').value.trim()
  })).filter(x => x.refeicao || x.detalhe);
  if (!itens.length) return alert('Adicione ao menos uma refeição ao plano.');
  Store.db.planosAlimentares[alunoId] = { data: hojeISO(), autor: `${usuarioLogado.nome} (${usuarioLogado.perfil})`, itens, orientacoes: $('plano-orientacoes').value.trim() };
  Store.salvar(); renderPlanoResult(alunoId); alert('Plano salvo!');
}
function renderPlanoResult(alunoId) {
  const al = Store.db.alunos.find(a => a.id === alunoId);
  const plan = Store.db.planosAlimentares[alunoId];
  if (!plan || !plan.itens) { $('plano-result').innerHTML = '<p class="muted">Nenhum plano prescrito ainda. O nutricionista monta manualmente acima.</p>'; return; }
  const itens = plan.itens.map(x => `<li><strong>${esc(x.refeicao)}</strong> — ${esc(x.detalhe)}</li>`).join('');
  const editavel = podeGerenciarNutri();
  const examesAl = (Store.db.exames || []).filter(e => e.alunoId === alunoId);
  $('plano-result').innerHTML = `<h2>Plano — ${al ? al.nome : ''}</h2><ul>${itens}</ul>
    <p class="muted">Prescrito por ${esc(plan.autor || 'Equipe')} em ${(plan.data || '').split('-').reverse().join('/')}</p>
    <label>Orientações do nutricionista ${editavel ? '' : '(somente leitura)'}<textarea id="plano-orient" rows="3" ${editavel ? '' : 'disabled'} placeholder="Ex: ajustar proteína pós-treino conforme exame...">${esc(plan.orientacoes)}</textarea></label>
    ${editavel ? '<button class="btn small" onclick="salvarOrientacoes()">Salvar orientações</button>' : ''}
    <div class="panel" style="margin:14px 0 0"><div class="tele">EXAMES DO ALUNO · BASE DO PLANEJAMENTO (${examesAl.length})</div>${examesAl.map(e => `<p><strong>${e.nomeArquivo}</strong> <small class="muted">${(e.data || '').split('-').reverse().join('/')} · ${e.obs || 'sem obs'}</small><br><small>${e.parecer ? 'Parecer: ' + e.parecer : 'Aguardando análise na Tela 08'}</small></p>`).join('') || '<p class="muted">Nenhum exame enviado. Peça ao aluno na Tela 08.</p>'}<button class="btn small ghost" onclick="irPara('exames')">Abrir exames</button></div>
    <br><small style="color:#9aa6b5">Prescrição do nutricionista responsável — sem cardápio automático (ver Riscos/LGPD no README).</small>`;
}
function salvarOrientacoes() {
  if (!podeGerenciarNutri()) return alert('Só a equipe de nutrição edita orientações.');
  const alunoId = idAlvoPessoal('plano-aluno');
  if (Store.db.planosAlimentares[alunoId]) {
    Store.db.planosAlimentares[alunoId].orientacoes = $('plano-orient').value;
    Store.db.planosAlimentares[alunoId].autor = `${usuarioLogado.nome} (${usuarioLogado.perfil})`;
    Store.salvar(); alert('Orientações salvas!');
  }
}

// ---------- TELA 7: DASHBOARD DO ALUNO ----------
function iniciais(nome) { return (nome || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
function verDashAluno() {
  const id = idAlvoDashAluno();
  const a = Store.db.alunos.find(x => x.id === id);
  if (!a) { $('dash-aluno-box').innerHTML = ''; return; }
  const treinos = Store.db.treinos.filter(t => t.alunoId === id);
  const allChecks = Object.entries(Store.db.checkins).flatMap(([data, arr]) => (arr || []).map(c => ({ ...c, data }))).filter(c => c.alunoId === id).sort((x, y) => (x.data + x.hora).localeCompare(y.data + y.hora));
  const totalCheckins = allChecks.length;
  const dias7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
  const marks = dias7.map(d => allChecks.some(c => c.data === d) ? 1 : 0);
  const streak = (() => { let s = 0; for (let i = 6; i >= 0; i--) { if (marks[i]) s++; else if (i === 6) continue; else break; } return s; })();
  const anam = Store.db.anamneses[id];
  const nExames = (Store.db.exames || []).filter(e => e.alunoId === id).length;
  const meusDesafios = (Store.db.desafios || []).filter(d => (d.participantes || []).includes(id));
  const plan = Store.db.planosAlimentares[id];
  const prox = treinos[0];
  const treinoHoje = treinos.filter(t => t.dia === diaHojePT());
  const nivel = totalCheckins >= 20 ? 'ELITE' : totalCheckins >= 10 ? 'RITMO' : totalCheckins >= 4 ? 'EMBALO' : 'BASE';
  $('dash-aluno-box').innerHTML = `
    <div class="panel al-hero">
      <div class="al-avatar anton">${iniciais(a.nome)}</div>
      <div class="al-main">
        <div class="tele">ATLETA · NÍVEL ${nivel} · STREAK ${streak}D</div>
        <h2 class="anton al-name">${a.nome}</h2>
        <div class="al-pills"><span class="badge paga">${a.plano} · ${BRL(PLANOS[a.plano] || 0)}</span><span class="badge ${a.mensalidade === 'Paga' ? 'paga' : 'pendente'}">${a.mensalidade}</span><small class="muted mono">DESDE ${(a.desde || '').split('-').reverse().join('/')}</small></div>
        <div class="al-week">${dias7.map((d, i) => `<span class="al-day ${marks[i] ? 'on' : ''}" title="${d}">${'STQQSSD'[(new Date(d + 'T12:00').getDay() + 6) % 7] || '•'}</span>`).join('')}</div>
      </div>
      <div class="al-score"><span class="tele">PRESENÇAS</span><strong class="anton">${totalCheckins}</strong><small class="muted mono">${treinos.length} treinos · ${nExames} exames</small></div>
    </div>
    <div class="dash-grid al-grid">
      <div class="panel al-today"><div class="tele">TREINO DE HOJE · ${diaHojePT().toUpperCase()}</div>${treinoHoje.length ? `<h2 class="anton">${treinoHoje[0].tipo}</h2><p class="muted">${(treinoHoje[0].exercicios || []).slice(0, 3).join(' · ')}${(treinoHoje[0].exercicios || []).length > 3 ? ' · ...' : ''}</p><button class="btn small" onclick="irPara('treinos')">Abrir treino</button>` : '<p class="muted">Descanso programado. Aproveita pra revisar o plano alimentar.</p>'}</div>
      <div class="panel"><div class="tele">PRÓXIMO TREINO</div>${prox ? `<h2>${prox.tipo} · ${prox.dia}</h2><p class="muted">${prox.objetivo || ''}</p><ul>${(prox.exercicios || []).slice(0, 4).map(e => `<li>${e}</li>`).join('')}</ul><button class="btn small ghost" onclick="irPara('treinos')">Ver todos</button>` : '<p class="muted">Nenhum treino montado. Fala com o personal.</p>'}</div>
      <div class="panel"><div class="tele">PLANO · ${plan && plan.itens ? 'PRESCRITO' : 'A PRESCREVER'}</div>${plan && plan.itens ? `<h2>${plan.itens.length} refeições</h2><p class="muted">por ${plan.autor || 'Equipe'}</p><button class="btn small ghost" onclick="irPara('plano')">Abrir plano</button>` : '<p class="muted">O nutricionista monta teu plano na Tela 05.</p>'}</div>
      <div class="panel"><div class="tele">DESAFIOS · ${meusDesafios.length} ATIVOS</div>${meusDesafios.slice(0, 3).map(d => `<div class="feed-row"><span class="feed-name">${d.titulo}</span><span class="badge paga">${d.perfilAlvo}</span></div>`).join('') || '<p class="muted">Entra num desafio na Tela 09.</p>'}<button class="btn small ghost" onclick="irPara('desafios')">Ver desafios</button></div>
    </div>
    <div class="panel"><div class="tele">FICHA · ANAMNESE</div><p>${anam ? `${anam.objetivo} · ${anam.refeicoes} refeições/dia · ${anam.restricoes || 'sem restrições'}` : 'Anamnese ainda não preenchida (Fase 4).'}</p></div>`;
}

// ---------- TELA 07: TREINOS (personal planeja por perfil/objetivo) ----------
function listarTreinos() {
  const alunoId = $('treino-aluno').value;
  const dia = $('treino-filtro-dia').value;
  const box = $('treinos-lista');
  const podeEditar = podeGerenciarTreinos();
  const btnNovo = $('btn-novo-treino');
  if (btnNovo) btnNovo.style.display = podeEditar ? '' : 'none';
  let lista = Store.db.treinos.filter(t => (!alunoId || t.alunoId === alunoId) && (!dia || t.dia === dia));
  if (ehAluno()) lista = Store.db.treinos.filter(t => t.alunoId === meuAlunoId() && (!dia || t.dia === dia));
  document.querySelectorAll('.chips .chip').forEach(ch => ch.classList.toggle('on', (dia === '' && ch.textContent === 'Todos') || (dia && ch.textContent === dia.slice(0, 3))));
  const hojeD = diaHojePT();
  if (!dia) lista = [...lista].sort((a, b) => ((b.dia === hojeD) ? 1 : 0) - ((a.dia === hojeD) ? 1 : 0));
  if (!lista.length) { box.innerHTML = '<div class="panel empty"><h2>Nenhum treino aqui</h2><p class="muted">O personal monta o planejamento de acordo com o perfil e o objetivo do aluno.</p></div>'; return; }
  box.innerHTML = `<div class="work-grid">` + lista.map(t => {
    const al = Store.db.alunos.find(a => a.id === t.alunoId);
    const isHoje = t.dia === hojeD;
    const ex = t.exercicios || [];
    return `<div class="panel work-card ${isHoje ? 'today' : ''}">${isHoje ? '<span class="today-tag">HOJE</span>' : ''}
      <div class="work-top"><span class="day-chip">${t.dia}</span><small class="mono muted">${ex.length} MOVIMENTOS</small></div>
      <h2 class="anton work-title">${t.tipo}</h2>
      <p class="muted">${t.objetivo || ''}</p>
      <ul class="work-list">${ex.slice(0, 3).map(e => `<li>${e}</li>`).join('')}${ex.length > 3 ? `<li class="muted">+${ex.length - 3} movimentos</li>` : ''}</ul>
      <div class="work-foot"><small class="muted">${al ? al.nome : 'aluno removido'} · por ${t.criadoPor || 'equipe'}</small>${podeEditar ? `<span><button class="btn small ghost" onclick="editarTreino('${t.id}')">Editar</button> <button class="btn small danger" onclick="excluirTreino('${t.id}')">Excluir</button></span>` : ''}</div></div>`;
  }).join('') + `</div>`;
}
function abrirModalTreino() {
  if (!podeGerenciarTreinos()) return alert('Só Personal, Funcionário ou Admin montam treinos.');
  $('modal-treino-titulo').textContent = 'Novo treino'; $('f-treino-id').value = '';
  $('f-treino-tipo').value = ''; $('f-treino-objetivo').value = ''; $('f-treino-exercicios').value = '';
  $('modal-treino').classList.add('open');
}
function fecharModalTreino() { $('modal-treino').classList.remove('open'); }
function editarTreino(id) {
  if (!podeGerenciarTreinos()) return alert('Só Personal, Funcionário ou Admin montam treinos.');
  const t = Store.db.treinos.find(x => x.id === id); if (!t) return;
  $('modal-treino-titulo').textContent = 'Editar treino'; $('f-treino-id').value = t.id;
  $('f-treino-aluno').value = t.alunoId; $('f-treino-tipo').value = t.tipo; $('f-treino-dia').value = t.dia;
  $('f-treino-objetivo').value = t.objetivo || ''; $('f-treino-exercicios').value = (t.exercicios || []).join('\n');
  $('modal-treino').classList.add('open');
}
function salvarTreino() {
  if (!podeGerenciarTreinos()) return alert('Só Personal, Funcionário ou Admin montam treinos.');
  const alunoId = $('f-treino-aluno').value;
  const tipo = $('f-treino-tipo').value.trim();
  if (!alunoId) return alert('Escolha um aluno');
  if (!tipo) return alert('Digite o tipo do treino');
  const exercicios = $('f-treino-exercicios').value.split('\n').map(s => s.trim()).filter(Boolean);
  const id = $('f-treino-id').value || ('t' + Date.now());
  const dados = { id, alunoId, tipo, dia: $('f-treino-dia').value, objetivo: $('f-treino-objetivo').value.trim(), exercicios, criadoPor: usuarioLogado.nome };
  const i = Store.db.treinos.findIndex(x => x.id === id);
  i >= 0 ? Store.db.treinos[i] = dados : Store.db.treinos.push(dados);
  Store.salvar(); fecharModalTreino(); recarregarTudo();
}
function excluirTreino(id) {
  if (!confirm('Excluir este treino?')) return;
  Store.db.treinos = Store.db.treinos.filter(t => t.id !== id);
  Store.salvar(); recarregarTudo();
}

// ---------- TELA 08: EXAMES (aluno envia, nutri analisa) ----------
function listarExames() {
  const filtro = idAlvoPessoal('exame-aluno');
  const podeParecer = podeGerenciarNutri();
  const lista = Store.db.exames.filter(e => !filtro || e.alunoId === filtro)
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  $('tb-exames').innerHTML = lista.map(e => {
    const al = Store.db.alunos.find(a => a.id === e.alunoId);
    return `<tr><td><strong>${e.nomeArquivo}</strong><br><small style="color:#9aa6b5">${e.tipo || ''} · ${e.tamanhoKb ? e.tamanhoKb + ' KB' : ''} · ${e.obs || ''}</small></td>`
      + `<td>${al ? al.nome : '—'}</td><td>${(e.data || '').split('-').reverse().join('/')}</td>`
      + `<td>${podeParecer
        ? `<textarea id="parecer-${e.id}" rows="2" placeholder="Parecer da nutrição...">${e.parecer || ''}</textarea><br><button class="btn small ghost" onclick="salvarParecer('${e.id}')">Salvar parecer</button>`
        : (e.parecer ? e.parecer : '<span class="muted">Aguardando análise</span>')}</td>`
      + `<td>${e.conteudo ? `<button class="btn small ghost" onclick="baixarExame('${e.id}')">Baixar</button>` : ''} <button class="btn small danger" onclick="removerExame('${e.id}')">Remover</button></td></tr>`;
  }).join('') || '<tr><td colspan="5">Nenhum exame enviado</td></tr>';
}
function uploadExame() {
  const alunoId = idAlvoPessoal('exame-aluno');
  if (!alunoId) return alert('Escolha um aluno');
  const file = $('exame-arquivo').files && $('exame-arquivo').files[0];
  if (!file) return alert('Escolha um arquivo');
  if (file.size > 1.5 * 1024 * 1024) return alert('Arquivo maior que 1,5 MB — comprima ou envie um PDF leve (limite do localStorage).');
  const okTipo = (file.type || '').startsWith('image/') || file.type === 'application/pdf';
  if (!okTipo) return alert('Envie PDF ou imagem (JPG, PNG, WEBP).');
  const reader = new FileReader();
  reader.onload = () => {
    const reg = { id: 'e' + Date.now(), alunoId, nomeArquivo: file.name, tipo: file.type,
      tamanhoKb: Math.round(file.size / 1024), data: hojeISO(), obs: $('exame-obs').value.trim(),
      parecer: '', conteudo: reader.result, enviadoPor: usuarioLogado.nome };
    Store.db.exames.push(reg);
    try { Store.salvar(); }
    catch (e) { Store.db.exames = Store.db.exames.filter(x => x.id !== reg.id); return alert('Navegador sem espaço (localStorage cheio). Apague exames antigos e tente de novo.'); }
    $('exame-obs').value = ''; $('exame-arquivo').value = ''; recarregarTudo();
  };
  reader.readAsDataURL(file);
}
function baixarExame(id) {
  const e = Store.db.exames.find(x => x.id === id); if (!e || !e.conteudo) return;
  const a = document.createElement('a'); a.href = e.conteudo; a.download = e.nomeArquivo; a.click();
}
function removerExame(id) {
  const e = Store.db.exames.find(x => x.id === id); if (!e) return;
  const dono = usuarioLogado.perfil === 'Administrador' || e.enviadoPor === usuarioLogado.nome || (ehAluno() && e.alunoId === meuAlunoId());
  if (!dono) return alert('Só o admin, quem enviou ou o próprio aluno removem este exame.');
  if (!confirm('Remover este exame?')) return;
  Store.db.exames = Store.db.exames.filter(e => e.id !== id);
  Store.salvar(); recarregarTudo();
}
function salvarParecer(id) {
  if (!podeGerenciarNutri()) return alert('Só a equipe de nutrição registra parecer.');
  const e = Store.db.exames.find(x => x.id === id); if (!e) return;
  e.parecer = $('parecer-' + id).value.trim();
  Store.salvar(); recarregarTudo();
}

// ---------- TELA 09: DESAFIOS (academia sugere por perfil, aluno cria os próprios) ----------
function listarDesafios() {
  const filtro = $('desafio-filtro').value;
  const lista = Store.db.desafios.filter(d => !filtro || d.perfilAlvo === filtro);
  const meuId = usuarioLogado && usuarioLogado.perfil === 'Aluno' ? meuAlunoId() : null;
  const pres = presencasTotais();
  const nAtivos = Store.db.alunos.filter(a => a.status === 'Ativo').length || 1;
  $('desafios-lista').innerHTML = lista.map(d => {
    const parts = d.participantes || [];
    const n = parts.length;
    const participo = meuId ? parts.includes(meuId) : false;
    const stack = parts.slice(0, 5).map(pid => { const pa = Store.db.alunos.find(a => a.id === pid); return `<span class="avatar xs" title="${pa ? pa.nome : pid}">${iniciais(pa ? pa.nome : '?')}</span>`; }).join('') + (n > 5 ? `<span class="avatar xs more">+${n - 5}</span>` : '');
    const lid = [...parts].sort((a, b) => (pres[b] || 0) - (pres[a] || 0))[0];
    const liderNome = lid ? (Store.db.alunos.find(a => a.id === lid) || {}).nome : null;
    const pct = Math.min(100, Math.round(n / nAtivos * 100));
    return `<div class="panel chal-card"><div class="chal-band"><span class="badge paga">${d.perfilAlvo}</span><small class="mono muted">${(d.data || '').split('-').reverse().join('/')} · POR ${d.criadorNome}</small></div>`
      + `<h2 class="anton chal-title">${d.titulo}</h2><p class="muted">${d.descricao || ''}</p>`
      + `<div class="meta-track"><div class="meta-fill" style="width:${pct}%"></div></div>`
      + `<small class="mono muted">${n} INSCRITOS · ${liderNome ? 'LÍDER ' + liderNome.toUpperCase() : 'SEM LÍDER AINDA'}</small>`
      + `<div class="stack">${stack || '<small class="muted">Seja o primeiro a entrar</small>'}</div>`
      + `<div class="chal-actions">${meuId
        ? (participo ? `<button class="btn small ghost" onclick="sairDesafio('${d.id}')">Sair do desafio</button>` : `<button class="btn small" onclick="participarDesafio('${d.id}')">Participar</button>`)
        : `<small class="muted">Participantes: ${parts.map(pid => (Store.db.alunos.find(a => a.id === pid) || {}).nome || pid).join(', ') || '—'}</small>`}`
      + ` <button class="btn small danger" onclick="excluirDesafio('${d.id}')">Excluir</button></div></div>`;
  }).join('') || '<div class="panel empty"><h2>Nenhum desafio ainda</h2><p class="muted">A academia pode sugerir por perfil e o aluno pode criar o próprio.</p></div>';
}
function abrirModalDesafio() { $('f-desafio-titulo').value = ''; $('f-desafio-desc').value = ''; $('modal-desafio').classList.add('open'); }
function fecharModalDesafio() { $('modal-desafio').classList.remove('open'); }
function salvarDesafio() {
  const titulo = $('f-desafio-titulo').value.trim();
  if (!titulo) return alert('Digite o título do desafio');
  Store.db.desafios.push({ id: 'd' + Date.now(), titulo, descricao: $('f-desafio-desc').value.trim(),
    perfilAlvo: $('f-desafio-perfil').value, criadorNome: usuarioLogado.nome, criadorPerfil: usuarioLogado.perfil,
    data: hojeISO(), participantes: [] });
  Store.salvar(); fecharModalDesafio(); recarregarTudo();
}
function participarDesafio(id) {
  if (!ehAluno()) return alert('Entre como Aluno para participar de desafios.');
  const d = Store.db.desafios.find(x => x.id === id); if (!d) return;
  const meuId = meuAlunoId();
  d.participantes = d.participantes || [];
  if (!d.participantes.includes(meuId)) d.participantes.push(meuId);
  Store.salvar(); recarregarTudo();
}
function sairDesafio(id) {
  if (!ehAluno()) return alert('Entre como Aluno para sair de desafios.');
  const d = Store.db.desafios.find(x => x.id === id); if (!d) return;
  d.participantes = (d.participantes || []).filter(p => p !== meuAlunoId());
  Store.salvar(); recarregarTudo();
}
function excluirDesafio(id) {
  const d = Store.db.desafios.find(x => x.id === id); if (!d) return;
  const dono = d.criadorNome === usuarioLogado.nome || usuarioLogado.perfil === 'Administrador';
  if (!dono) return alert('Só o criador ou o admin excluem este desafio.');
  if (!confirm('Excluir este desafio?')) return;
  Store.db.desafios = Store.db.desafios.filter(x => x.id !== id);
  Store.salvar(); recarregarTudo();
}

// ---------- TELA 10: FÓRUM (clientes e equipe interagem) ----------
let forumAberto = null;
function listarForum() {
  const lista = [...Store.db.forum].reverse();
  const box = $('forum-lista');
  if (forumAberto) { if (box) box.innerHTML = ''; renderForumDetalhe(); return; }
  if ($('forum-detalhe')) { $('forum-detalhe').classList.add('hidden'); $('forum-detalhe').innerHTML = ''; }
  if (!box) return;
  box.innerHTML = lista.map(t => `<div class="panel topic-card" onclick="abrirTopico('${t.id}')" style="cursor:pointer"><span class="avatar sm">${iniciais(t.autorNome)}</span><span class="topic-main"><h2>${t.titulo}</h2><small class="muted">por ${t.autorNome} (${t.autorPerfil}) · ${(t.data || '').split('-').reverse().join('/')}</small></span><span class="reply-pill mono">${(t.mensagens || []).length} MSGS</span></div>`).join('')
    || '<div class="panel empty"><h2>Nenhum tópico ainda</h2><p class="muted">Crie o primeiro e chame a galera.</p></div>';
}
function abrirModalTopico() { $('f-topico-titulo').value = ''; $('f-topico-msg').value = ''; $('modal-topico').classList.add('open'); }
function fecharModalTopico() { $('modal-topico').classList.remove('open'); }
function salvarTopico() {
  const titulo = $('f-topico-titulo').value.trim();
  const texto = $('f-topico-msg').value.trim();
  if (!titulo || !texto) return alert('Digite título e mensagem');
  Store.db.forum.push({ id: 'f' + Date.now(), titulo, autorNome: usuarioLogado.nome, autorPerfil: usuarioLogado.perfil,
    data: hojeISO(), mensagens: [{ autorNome: usuarioLogado.nome, autorPerfil: usuarioLogado.perfil, texto, data: hojeISO() }] });
  Store.salvar(); fecharModalTopico(); forumAberto = null; recarregarTudo();
}
function abrirTopico(id) { forumAberto = id; listarForum(); }
function voltarForum() { forumAberto = null; listarForum(); }
function renderForumDetalhe() {
  const t = Store.db.forum.find(x => x.id === forumAberto);
  const det = $('forum-detalhe');
  if (!t) { forumAberto = null; listarForum(); return; }
  det.classList.remove('hidden');
  det.innerHTML = `<button class="btn small ghost" onclick="voltarForum()">← Voltar</button><div class="panel"><h2>${t.titulo}</h2><small class="muted">por ${t.autorNome} (${t.autorPerfil})</small></div>`
    + t.mensagens.map(m => `<div class="panel forum-msg"><div class="member"><span class="avatar sm">${iniciais(m.autorNome)}</span><span><strong>${m.autorNome}</strong> <small class="muted">(${m.autorPerfil}) · ${(m.data || '').split('-').reverse().join('/')}</small></span></div><p>${m.texto}</p></div>`).join('')
    + `<div class="panel"><label>Responder<textarea id="forum-resp" rows="3" placeholder="Escreva sua resposta..."></textarea></label><button class="btn" onclick="responderTopico()">Enviar resposta</button></div>`;
}
function responderTopico() {
  const t = Store.db.forum.find(x => x.id === forumAberto); if (!t) return;
  const texto = $('forum-resp').value.trim();
  if (!texto) return alert('Digite sua resposta');
  t.mensagens.push({ autorNome: usuarioLogado.nome, autorPerfil: usuarioLogado.perfil, texto, data: hojeISO() });
  Store.salvar(); recarregarTudo();
}

// ---------- INIT ----------
function preencherSelects() {
  const opts = Store.db.alunos.map(a => `<option value="${a.id}">${a.nome} — ${a.plano} (${a.mensalidade})</option>`).join('') || '<option value="">Cadastre um aluno</option>';
  ['checkin-aluno', 'anam-aluno', 'plano-aluno', 'dash-aluno', 'treino-aluno', 'exame-aluno', 'f-treino-aluno'].forEach(id => { const el = $(id); if (el) el.innerHTML = opts; });
  // Perfil Aluno: esconde os seletores e trava no próprio registro (privacidade)
  const souAluno = usuarioLogado && usuarioLogado.perfil === 'Aluno';
  ['dash-aluno', 'treino-aluno', 'exame-aluno', 'plano-aluno'].forEach(id => {
    const el = $(id);
    if (el && el.parentElement) el.parentElement.style.display = souAluno ? 'none' : '';
  });
  if (souAluno) {
    const meu = meuAlunoId();
    const a = Store.db.alunos.find(x => x.id === meu);
    if (a) ['dash-aluno', 'treino-aluno', 'exame-aluno', 'plano-aluno'].forEach(id => { const el = $(id); if (el) el.innerHTML = `<option value="${a.id}">${a.nome}</option>`; });
  }
  // Carrega anamnese + plano ao trocar aluno
  const carregar = () => { const an = Store.db.anamneses[$('anam-aluno').value];
    if (an) { $('anam-objetivo').value = an.objetivo; $('anam-refeicoes').value = an.refeicoes; $('anam-restricoes').value = an.restricoes; $('anam-obs').value = an.obs; } };
  $('anam-aluno').onchange = carregar;
  $('dash-aluno').onchange = verDashAluno;
  if ($('treino-aluno')) $('treino-aluno').onchange = listarTreinos;
  if ($('treino-filtro-dia')) $('treino-filtro-dia').onchange = listarTreinos;
  if ($('exame-aluno')) $('exame-aluno').onchange = listarExames;
  if ($('plano-aluno')) $('plano-aluno').onchange = () => { preencherFormPlano(idAlvoPessoal('plano-aluno')); renderPlanoResult(idAlvoPessoal('plano-aluno')); };
  if ($('desafio-filtro')) $('desafio-filtro').onchange = listarDesafios;
  // Aluno acompanha o próprio plano em leitura; só a nutrição prescreve (nutri real, sem auto-cardápio)
  const pf = $('plano-form'); if (pf) pf.style.display = podeGerenciarNutri() ? '' : 'none';
  carregar();
  preencherFormPlano(idAlvoPessoal('plano-aluno'));
  renderPlanoResult(idAlvoPessoal('plano-aluno'));
}
function recarregarTudo() { preencherSelects(); listarAlunos(); listarCheckins(); listarFinanceiro(); verDashAluno(); atualizarDashboard(); listarTreinos(); listarExames(); listarDesafios(); listarForum(); }
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
