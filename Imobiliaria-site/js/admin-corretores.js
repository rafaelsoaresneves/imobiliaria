/* ── Admin — Corretores CRUD ─────────────────────────────────── */
let deleteId = null;
let allCorretores = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!DB.auth.guard()) return;

    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    carregarTabela();
});

function carregarTabela() {
    allCorretores = DB.corretores.getAll();
    filtrarTabela();
}

function filtrarTabela() {
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
    let lista = allCorretores;
    if (q) lista = lista.filter(c =>
        c.nome?.toLowerCase().includes(q) ||
        c.creci?.toLowerCase().includes(q) ||
        c.especialidade?.toLowerCase().includes(q)
    );
    renderTabela(lista);
}

function renderTabela(lista) {
    const tbody = document.getElementById('tableBody');
    const empty = document.getElementById('emptyTable');
    const count = document.getElementById('tCount');

    count.textContent = `${lista.length} corretor${lista.length !== 1 ? 'es' : ''}`;

    if (lista.length === 0) {
        tbody.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    tbody.innerHTML = lista.map(c => `
    <tr>
      <td><img src="${c.foto || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="" class="table-avatar" onerror="this.src='https://randomuser.me/api/portraits/lego/1.jpg'" /></td>
      <td><strong style="color:var(--color-navy);">${c.nome}</strong></td>
      <td style="color:var(--color-gold);font-size:0.82rem;font-weight:600;">${c.creci}</td>
      <td><span class="badge badge-gray">${c.especialidade}</span></td>
      <td><a href="tel:${c.telefone}" style="color:var(--color-navy);">${c.telefone}</a></td>
      <td><a href="mailto:${c.email}" style="color:var(--color-navy);font-size:0.82rem;">${c.email}</a></td>
      <td>
        <div class="table-actions-cell">
          <button class="btn btn-outline btn-sm" onclick="editarCorretor('${c.id}')">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="pedirExclusao('${c.id}')">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function abrirModalCorretor() {
    document.getElementById('corretorId').value = '';
    document.getElementById('modalTitle').textContent = 'Novo Corretor';
    ['mNome', 'mCreci', 'mTelefone', 'mEmail', 'mFoto', 'mBio'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('mEspecialidade').value = 'Alto Padrão';
    document.getElementById('modalCorretor').classList.add('active');
}

function editarCorretor(id) {
    const c = DB.corretores.getById(id);
    if (!c) return;
    document.getElementById('corretorId').value = id;
    document.getElementById('modalTitle').textContent = 'Editar Corretor';
    document.getElementById('mNome').value = c.nome || '';
    document.getElementById('mCreci').value = c.creci || '';
    document.getElementById('mTelefone').value = c.telefone || '';
    document.getElementById('mEmail').value = c.email || '';
    document.getElementById('mEspecialidade').value = c.especialidade || 'Alto Padrão';
    document.getElementById('mFoto').value = c.foto || '';
    document.getElementById('mBio').value = c.bio || '';
    document.getElementById('modalCorretor').classList.add('active');
}

function fecharModal() {
    document.getElementById('modalCorretor').classList.remove('active');
}

function salvarCorretor() {
    const nome = document.getElementById('mNome').value.trim();
    const creci = document.getElementById('mCreci').value.trim();
    if (!nome) { showToast('O nome é obrigatório.', 'error'); return; }
    if (!creci) { showToast('O CRECI é obrigatório.', 'error'); return; }

    const dados = {
        nome,
        creci,
        telefone: document.getElementById('mTelefone').value.trim(),
        email: document.getElementById('mEmail').value.trim(),
        especialidade: document.getElementById('mEspecialidade').value,
        foto: document.getElementById('mFoto').value.trim(),
        bio: document.getElementById('mBio').value.trim(),
    };

    const id = document.getElementById('corretorId').value;
    if (id) {
        DB.corretores.update(id, dados);
        showToast('Corretor atualizado! ✓', 'success');
    } else {
        DB.corretores.create(dados);
        showToast('Corretor cadastrado! ✓', 'success');
    }

    fecharModal();
    carregarTabela();
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
        DB.corretores.remove(deleteId);
        showToast('Corretor excluído.', 'info');
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

['modalCorretor', 'modalConfirm'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => {
        if (e.target.id === id) {
            if (id === 'modalCorretor') fecharModal();
            else fecharConfirm();
        }
    });
});
