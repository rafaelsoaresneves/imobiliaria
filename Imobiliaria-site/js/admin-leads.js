/* ── Admin — Leads Management ────────────────────────────────── */
let deleteId = null;
let allLeads = [];
let statusFlt = '';

document.addEventListener('DOMContentLoaded', () => {
    if (!DB.auth.guard()) return;

    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    carregarTabela();
});

function carregarTabela() {
    allLeads = DB.leads.getAll();
    filtrarTabela();
}

function filtrarStatus(status) {
    statusFlt = status;
    // Update button styles
    ['fAll', 'fNovo', 'fContato', 'fNegoc', 'fFechado'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) { btn.className = 'btn btn-outline btn-sm'; }
    });
    const activeMap = { '': 'fAll', 'novo': 'fNovo', 'em-contato': 'fContato', 'negociando': 'fNegoc', 'fechado': 'fFechado' };
    const active = document.getElementById(activeMap[status]);
    if (active) active.className = 'btn btn-primary btn-sm';
    filtrarTabela();
}

function filtrarTabela() {
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
    let lista = allLeads;
    if (statusFlt) lista = lista.filter(l => l.status === statusFlt);
    if (q) lista = lista.filter(l =>
        l.nome?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.telefone?.includes(q)
    );
    renderTabela(lista);
}

function renderTabela(lista) {
    const tbody = document.getElementById('tableBody');
    const empty = document.getElementById('emptyTable');
    const count = document.getElementById('tCount');

    count.textContent = `${lista.length} lead${lista.length !== 1 ? 's' : ''}`;

    if (lista.length === 0) {
        tbody.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    const statusLabels = {
        novo: { label: 'Novo', cls: 'badge-info' },
        'em-contato': { label: 'Em Contato', cls: 'badge-warning' },
        negociando: { label: 'Negociando', cls: 'badge-success' },
        fechado: { label: 'Fechado', cls: 'badge-navy' },
    };

    tbody.innerHTML = lista.map(l => {
        const s = statusLabels[l.status] || { label: l.status, cls: 'badge-gray' };
        return `
    <tr>
      <td>
        <strong style="color:var(--color-navy);">${l.nome}</strong><br>
        <small style="color:var(--color-gray-400);">${l.mensagem ? l.mensagem.slice(0, 50) + (l.mensagem.length > 50 ? '...' : '') : '—'}</small>
      </td>
      <td><a href="mailto:${l.email}" style="color:var(--color-navy);font-size:0.85rem;">${l.email}</a></td>
      <td><a href="tel:${l.telefone}" style="color:var(--color-navy);font-size:0.85rem;">${l.telefone || '—'}</a></td>
      <td style="font-size:0.85rem;">${l.interesse || '—'}</td>
      <td><span class="badge badge-gray" style="font-size:0.7rem;">${l.origem || '—'}</span></td>
      <td style="font-size:0.82rem;color:var(--color-gray-400);">${DB.fmt.data(l.criadoEm)}</td>
      <td>
        <select class="status-select status-${l.status}" onchange="atualizarStatus('${l.id}', this.value, this)">
          <option value="novo"         ${l.status === 'novo' ? 'selected' : ''}>🔵 Novo</option>
          <option value="em-contato"   ${l.status === 'em-contato' ? 'selected' : ''}>🟡 Em Contato</option>
          <option value="negociando"   ${l.status === 'negociando' ? 'selected' : ''}>🟢 Negociando</option>
          <option value="fechado"      ${l.status === 'fechado' ? 'selected' : ''}>⚫ Fechado</option>
        </select>
      </td>
      <td>
        <div class="table-actions-cell">
          <a href="mailto:${l.email}" class="btn btn-outline btn-sm" title="Enviar e-mail">✉️</a>
          ${l.telefone ? `<a href="https://wa.me/55${l.telefone.replace(/\D/g, '')}" target="_blank" class="btn btn-success btn-sm" title="WhatsApp">💬</a>` : ''}
          <button class="btn btn-danger btn-sm" onclick="pedirExclusao('${l.id}')">🗑</button>
        </div>
      </td>
    </tr>`;
    }).join('');
}

function atualizarStatus(id, novoStatus, selectEl) {
    DB.leads.update(id, { status: novoStatus });
    // Update select class
    selectEl.className = `status-select status-${novoStatus}`;
    const labels = { novo: 'Novo', 'em-contato': 'Em Contato', negociando: 'Negociando', fechado: 'Fechado' };
    showToast(`Status atualizado: ${labels[novoStatus]}`, 'success');
    // Refresh counts
    allLeads = DB.leads.getAll();
}

function pedirExclusao(id) {
    deleteId = id;
    document.getElementById('modalConfirm').classList.add('active');
}

function fecharConfirm() {
    deleteId = null;
    document.getElementById('modalConfirm').classList.remove('active');
}

function confirmarExclusao() {
    if (deleteId) {
        DB.leads.remove(deleteId);
        showToast('Lead excluído.', 'info');
        carregarTabela();
    }
    fecharConfirm();
}

function logout() { DB.auth.logout(); window.location.href = 'index.html'; }

function showToast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}

document.getElementById('modalConfirm')?.addEventListener('click', e => {
    if (e.target.id === 'modalConfirm') fecharConfirm();
});
