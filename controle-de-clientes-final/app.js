(function () {
  'use strict';

  const KEY = 'controle_clientes_v4';
  const API = 'php/';
  const $ = (id) => document.getElementById(id);
  const clean = (v) => String(v ?? '').trim();
  const today = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  const addDays = (iso, days) => {
    const d = new Date((iso || today()) + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const uid = () => window.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const escapeHtml = (v) => clean(v).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const formatDate = (value) => {
    if (!value) return 'Sem data';
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  };
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let clients = [];
  let serverMode = false;
  let initialized = false;

  function toast(message, tone = 'normal') {
    const el = $('toast');
    el.textContent = message;
    el.dataset.tone = tone;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function setMode() {
    const badge = $('modeBadge');
    if (!badge) return;
    badge.textContent = serverMode ? 'BANCO' : 'LOCAL';
    badge.className = `mode-badge ${serverMode ? 'server' : 'local'}`;
    badge.title = serverMode ? 'Dados sincronizados com PHP + banco' : 'Dados salvos neste navegador';
  }

  function normalize(item) {
    return {
      id: clean(item.id) || uid(),
      name: clean(item.name ?? item.nome_cliente),
      date: clean(item.date ?? item.data_prevista),
      os: clean(item.os),
      notes: clean(item.notes ?? item.observacao),
      done: Boolean(item.done ?? item.concluido),
      createdAt: item.createdAt || item.criado_em || new Date().toISOString(),
      updatedAt: item.updatedAt || item.atualizado_em || new Date().toISOString()
    };
  }

  function loadLocal() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (Array.isArray(stored)) return stored.map(normalize).filter((x) => x.name);
    } catch (_) {}
    const seed = Array.isArray(window.CLIENTES_INICIAIS) ? window.CLIENTES_INICIAIS : [];
    const data = seed.map((row) => normalize({ id: uid(), name: row[0], date: row[1], os: row[2], done: row[3], notes: row[4] || '' }));
    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  }

  function saveLocal() {
    localStorage.setItem(KEY, JSON.stringify(clients));
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      cache: 'no-store',
      headers: {'Content-Type': 'application/json', ...(options.headers || {})},
      ...options
    });
    const text = await response.text();
    let json;
    try { json = JSON.parse(text); } catch (_) { throw new Error('Resposta do servidor inválida'); }
    if (!response.ok || json.ok === false) throw new Error(json.erro || 'Erro no servidor');
    return json;
  }

  async function tryServerLoad() {
    if (location.protocol === 'file:') return false;
    try {
      const data = await apiRequest('clientes.php', {method: 'GET'});
      if (!Array.isArray(data.clientes)) return false;
      clients = data.clientes.map(normalize).filter((x) => x.name);
      serverMode = true;
      return true;
    } catch (_) {
      return false;
    }
  }

  function visibleList() {
    const query = clean($('search').value).toLowerCase();
    const status = $('status').value;
    const period = $('period').value;
    const t = today();
    const end = addDays(t, 7);

    return clients.filter((c) => {
      if (status === 'pending' && c.done) return false;
      if (status === 'done' && !c.done) return false;
      if (period === 'today' && c.date !== t) return false;
      if (period === 'week' && (!c.date || c.date < t || c.date > end)) return false;
      if (period === 'overdue' && (!c.date || c.date >= t || c.done)) return false;
      if (period === 'nodate' && c.date) return false;
      if (query && !`${c.name} ${c.os} ${c.notes}`.toLowerCase().includes(query)) return false;
      return true;
    }).sort((a, b) => {
      if (a.done !== b.done) return Number(a.done) - Number(b.done);
      const ad = a.date || '9999-12-31';
      const bd = b.date || '9999-12-31';
      return ad.localeCompare(bd) || a.name.localeCompare(b.name, 'pt-BR');
    });
  }

  function dateBadge(c) {
    if (!c.date) return '<span class="muted">—</span>';
    const t = today();
    const cls = c.done ? '' : c.date === t ? 'today' : c.date < t ? 'overdue' : '';
    const label = c.date === t && !c.done ? 'Hoje' : formatDate(c.date);
    return `<span class="datebadge ${cls}">${label}</span>`;
  }

  function render() {
    const data = visibleList();
    $('tbody').innerHTML = data.map((c) => `
      <tr class="${c.done ? 'doneRow' : ''}">
        <td class="donecol"><input class="rowdone" type="checkbox" data-toggle="${escapeHtml(c.id)}" ${c.done ? 'checked' : ''} aria-label="Concluir ${escapeHtml(c.name)}"></td>
        <td><div class="client-cell"><span class="client ${c.done ? 'strike' : ''}">${escapeHtml(c.name)}</span>${c.date === today() && !c.done ? '<span class="mini-tag today-tag">HOJE</span>' : ''}</div></td>
        <td>${dateBadge(c)}</td>
        <td>${c.os ? `<span class="osbadge">${escapeHtml(c.os)}</span>` : '<span class="muted">—</span>'}</td>
        <td>${c.notes ? `<span class="note" title="${escapeHtml(c.notes)}">${escapeHtml(c.notes)}</span>` : '<span class="muted">—</span>'}</td>
        <td class="actionsCell"><button class="smallbtn" data-edit="${escapeHtml(c.id)}" type="button">Editar</button><button class="smallbtn danger" data-delete="${escapeHtml(c.id)}" type="button">Excluir</button></td>
      </tr>`).join('');

    $('empty').hidden = data.length !== 0;
    document.querySelector('.table-scroll').style.display = data.length ? '' : 'none';
    $('count').textContent = `${data.length} ${data.length === 1 ? 'registro' : 'registros'}`;
    $('resultCount').textContent = String(data.length);

    const t = today();
    $('sTotal').textContent = String(clients.length);
    $('sPending').textContent = String(clients.filter((c) => !c.done).length);
    $('sToday').textContent = String(clients.filter((c) => !c.done && c.date === t).length);
    $('sOverdue').textContent = String(clients.filter((c) => !c.done && c.date && c.date < t).length);
    $('sDone').textContent = String(clients.filter((c) => c.done).length);

    const labels = {all:'Todos os clientes',pending:'Clientes pendentes',done:'Clientes concluídos',today:'Atendimentos de hoje',week:'Próximos 7 dias',overdue:'Atendimentos atrasados',nodate:'Clientes sem data'};
    const period = $('period').value;
    const status = $('status').value;
    $('context').textContent = period !== 'all' ? labels[period] : labels[status];
  }

  function resetFilters() {
    $('search').value = '';
    $('status').value = 'all';
    $('period').value = 'all';
    document.querySelectorAll('.stat').forEach((x) => x.classList.remove('active'));
    render();
  }

  function openForm(client = null) {
    $('form').reset();
    $('editId').value = client ? client.id : '';
    $('modalTitle').textContent = client ? 'Editar cliente' : 'Novo cliente';
    if (client) {
      $('name').value = client.name;
      $('date').value = client.date;
      $('os').value = client.os;
      $('notes').value = client.notes;
      $('done').checked = client.done;
    }
    $('dialog').showModal();
    setTimeout(() => $('name').focus(), 30);
  }

  async function saveServer(payload, existingId) {
    const data = {...payload, id: existingId || ''};
    const result = await apiRequest('salvar_cliente.php', {method: 'POST', body: JSON.stringify({
      id: data.id,
      nome_cliente: data.name,
      data_prevista: data.date || null,
      os: data.os || null,
      observacao: data.notes || null,
      concluido: data.done ? 1 : 0
    })});
    return result.id;
  }

  $('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = clean($('name').value);
    if (!name) { $('name').focus(); return; }
    const payload = {name, date:$('date').value, os:clean($('os').value), notes:clean($('notes').value), done:$('done').checked, updatedAt:new Date().toISOString()};
    const existingId = $('editId').value;

    try {
      if (serverMode) {
        const savedId = await saveServer(payload, existingId);
        if (existingId) {
          const idx = clients.findIndex((c) => c.id === existingId);
          if (idx >= 0) clients[idx] = {...clients[idx], ...payload};
        } else {
          clients.push({id:savedId, createdAt:new Date().toISOString(), ...payload});
        }
      } else {
        if (existingId) {
          const idx = clients.findIndex((c) => c.id === existingId);
          if (idx >= 0) clients[idx] = {...clients[idx], ...payload};
        } else clients.push({id:uid(), createdAt:new Date().toISOString(), ...payload});
        saveLocal();
      }
      render();
      $('dialog').close();
      toast('Cadastro salvo com sucesso.');
    } catch (error) {
      if (serverMode) {
        serverMode = false;
        setMode();
        toast('Banco indisponível. Continuando em modo local.', 'warning');
        if (existingId) {
          const idx = clients.findIndex((c) => c.id === existingId);
          if (idx >= 0) clients[idx] = {...clients[idx], ...payload};
        } else clients.push({id:uid(), createdAt:new Date().toISOString(), ...payload});
        saveLocal(); render(); $('dialog').close();
      } else toast(error.message || 'Não foi possível salvar.', 'error');
    }
  });

  async function toggleDone(idValue, checked) {
    const c = clients.find((x) => x.id === idValue);
    if (!c) return;
    const old = c.done;
    c.done = checked;
    c.updatedAt = new Date().toISOString();
    render();
    try {
      if (serverMode) await apiRequest('atualizar_status.php', {method:'POST', body:JSON.stringify({id:idValue, concluido:checked ? 1 : 0})});
      else saveLocal();
      toast(checked ? 'Cliente concluído.' : 'Cliente reaberto.');
    } catch (_) {
      c.done = old; render(); toast('Não foi possível atualizar o status.', 'error');
    }
  }

  async function removeClient(idValue) {
    const c = clients.find((x) => x.id === idValue);
    if (!c) return;
    if (!window.confirm(`Excluir o cadastro de "${c.name}"?`)) return;
    const backup = c;
    clients = clients.filter((x) => x.id !== idValue);
    render();
    try {
      if (serverMode) await apiRequest('excluir_cliente.php', {method:'POST', body:JSON.stringify({id:idValue})});
      else saveLocal();
      toast('Cadastro excluído.');
    } catch (_) {
      clients.push(backup); render(); toast('Não foi possível excluir.', 'error');
    }
  }

  document.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-edit]');
    const del = event.target.closest('[data-delete]');
    if (edit) {
      const c = clients.find((x) => x.id === edit.dataset.edit);
      if (c) openForm(c);
    }
    if (del) removeClient(del.dataset.delete);
  });

  document.addEventListener('change', (event) => {
    const toggle = event.target.closest('[data-toggle]');
    if (toggle) toggleDone(toggle.dataset.toggle, toggle.checked);
  });

  document.querySelectorAll('.stat').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.stat').forEach((x) => x.classList.remove('active'));
    button.classList.add('active');
    const value = button.dataset.stat;
    if (value === 'all') { $('status').value='all'; $('period').value='all'; }
    else if (value === 'pending') { $('status').value='pending'; $('period').value='all'; }
    else if (value === 'done') { $('status').value='done'; $('period').value='all'; }
    else { $('status').value='pending'; $('period').value=value; }
    render();
  }));

  $('clearFilters').addEventListener('click', resetFilters);
  $('newBtn').addEventListener('click', () => openForm());
  $('emptyNew').addEventListener('click', () => openForm());
  $('closeBtn').addEventListener('click', () => $('dialog').close());
  $('cancelBtn').addEventListener('click', () => $('dialog').close());
  $('dialog').addEventListener('click', (event) => { if (event.target === $('dialog')) $('dialog').close(); });
  $('search').addEventListener('input', render);
  $('status').addEventListener('change', render);
  $('period').addEventListener('change', render);

  $('focusSearchBtn')?.addEventListener('click', () => $('search').focus());
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('search').focus(); }
    else if (!event.ctrlKey && !event.metaKey && event.key.toLowerCase() === 'n' && !$('dialog').open && document.activeElement?.tagName !== 'INPUT') { event.preventDefault(); openForm(); }
    else if (event.key === 'Escape' && $('dialog').open) $('dialog').close();
  });

  $('backupBtn').addEventListener('click', () => {
    const payload = {version:4, exportedAt:new Date().toISOString(), clients};
    download('controle-de-clientes-backup.json', JSON.stringify(payload, null, 2), 'application/json');
    toast('Backup criado.');
  });
  $('restoreBtn').addEventListener('click', () => $('restoreInput').click());
  $('restoreInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const data = Array.isArray(parsed) ? parsed : parsed.clients;
      if (!Array.isArray(data) || data.some((x) => !clean(x.name ?? x.nome_cliente))) throw new Error('Formato inválido');
      clients = data.map(normalize).filter((x) => x.name);
      if (serverMode) {
        for (const c of clients) await saveServer(c, c.id);
      } else saveLocal();
      render();
      toast(`${clients.length} cadastros restaurados.`);
    } catch (_) { toast('Backup inválido ou incompatível.', 'error'); }
    event.target.value = '';
  });
  $('exportBtn').addEventListener('click', () => {
    const rows = [['Cliente','Data prevista','OS','Concluído','Observação'], ...clients.map((c) => [c.name, c.date ? formatDate(c.date) : '', c.os, c.done ? 'Sim' : 'Não', c.notes])];
    const csv = rows.map((row) => row.map((v) => `"${String(v ?? '').replaceAll('"','""')}"`).join(';')).join('\r\n');
    download('clientes.csv', '\ufeff' + csv, 'text/csv;charset=utf-8');
    toast('CSV exportado.');
  });

  function download(filename, data, type) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([data], {type}));
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function start() {
    clients = loadLocal();
    serverMode = await tryServerLoad();
    setMode();
    render();
    initialized = true;
  }

  start();
})();
