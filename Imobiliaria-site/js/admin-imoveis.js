/* ── Admin — Imóveis CRUD ────────────────────────────────────── */
let currentId = null;
let deleteId = null;
let allImoveis = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!DB.auth.guard()) return;

    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    // Populate corretor select
    try {
        const corretores = await DB.corretores.getAll();
        const corretorSel = document.getElementById('mCorretor');
        corretores.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.nome;
            corretorSel.appendChild(opt);
        });
    } catch {}

    await carregarTabela();
});

async function carregarTabela() {
    try {
        allImoveis = await DB.imoveis.getAll();
        filtrarTabela();
    } catch {
        showToast('Erro ao carregar imóveis.', 'error');
    }
}

function filtrarTabela() {
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const fn = document.getElementById('filtFinalidade')?.value || '';
    let lista = allImoveis;
    if (q) lista = lista.filter(i => i.titulo?.toLowerCase().includes(q) || i.bairro?.toLowerCase().includes(q) || i.cidade?.toLowerCase().includes(q));
    if (fn) lista = lista.filter(i => i.finalidade === fn);
    renderTabela(lista);
}

function renderTabela(lista) {
    const tbody = document.getElementById('tableBody');
    const empty = document.getElementById('emptyTable');
    const count = document.getElementById('tCount');

    count.textContent = `${lista.length} imóvel${lista.length !== 1 ? 'is' : ''}`;

    if (lista.length === 0) {
        tbody.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    tbody.innerHTML = lista.map(im => {
        const img = (im.fotos || [])[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80';
        return `
      <tr>
        <td><img src="${img}" alt="" class="table-img" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80'" /></td>
        <td>
          <strong style="font-size:0.875rem;color:var(--color-navy);">${im.titulo}</strong><br>
          <small style="color:var(--color-gray-400);">📍 ${im.bairro}, ${im.cidade}</small>
        </td>
        <td>${DB.fmt.tipo(im.tipo)}</td>
        <td><span class="badge ${im.finalidade === 'aluguel' ? 'badge-navy' : 'badge-gold'}">${DB.fmt.finalidade(im.finalidade)}</span></td>
        <td style="font-weight:600;color:var(--color-navy);">${DB.fmt.preco(im.preco, im.finalidade)}</td>
        <td>
          <button onclick="toggleDestaque(${im.id}, ${im.destaque})" title="${im.destaque ? 'Remover destaque' : 'Marcar destaque'}"
            style="background:none;border:none;cursor:pointer;font-size:1.2rem;" >
            ${im.destaque ? '⭐' : '☆'}
          </button>
        </td>
        <td>
          <div class="table-actions-cell">
            <a href="../imovel-detalhe.html?id=${im.id}" target="_blank" class="btn btn-outline btn-sm" title="Ver no site">🔍</a>
            <button class="btn btn-outline btn-sm" onclick="editarImovel(${im.id})">✏️ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="pedirExclusao(${im.id})">🗑</button>
          </div>
        </td>
      </tr>`;
    }).join('');
}

function abrirModalImovel(id) {
    currentId = id || null;
    const modal = document.getElementById('modalImovel');
    document.getElementById('modalTitle').textContent = id ? 'Editar Imóvel' : 'Novo Imóvel';

    ['mTitulo', 'mPreco', 'mArea', 'mQuartos', 'mBanheiros', 'mVagas', 'mEndereco', 'mBairro', 'mCep', 'mDescricao', 'mFotos'].forEach(f => {
        const el = document.getElementById(f);
        if (el) el.value = '';
    });
    document.getElementById('mCidade').value = 'São Paulo';
    document.getElementById('mEstado').value = 'SP';
    document.getElementById('mTipo').value = 'apartamento';
    document.getElementById('mFinalidade').value = 'venda';
    document.getElementById('mDestaque').checked = false;
    document.getElementById('mCorretor').value = '';
    document.getElementById('imovelId').value = '';

    if (id) {
        const im = allImoveis.find(x => x.id === id);
        if (im) {
            document.getElementById('imovelId').value = im.id;
            document.getElementById('mTitulo').value = im.titulo || '';
            document.getElementById('mTipo').value = im.tipo || 'apartamento';
            document.getElementById('mFinalidade').value = im.finalidade || 'venda';
            document.getElementById('mPreco').value = im.preco || '';
            document.getElementById('mArea').value = im.area || '';
            document.getElementById('mQuartos').value = im.quartos || '';
            document.getElementById('mBanheiros').value = im.banheiros || '';
            document.getElementById('mVagas').value = im.vagas || '';
            document.getElementById('mEndereco').value = im.endereco || '';
            document.getElementById('mBairro').value = im.bairro || '';
            document.getElementById('mCidade').value = im.cidade || 'São Paulo';
            document.getElementById('mEstado').value = im.estado || 'SP';
            document.getElementById('mCep').value = im.cep || '';
            document.getElementById('mDescricao').value = im.descricao || '';
            document.getElementById('mFotos').value = (im.fotos || []).join('\n');
            document.getElementById('mDestaque').checked = !!im.destaque;
            // corretor agora é objeto {id, nome, creci, foto}
            document.getElementById('mCorretor').value = im.corretor?.id || '';
        }
    }

    modal.classList.add('active');
}

function editarImovel(id) { abrirModalImovel(id); }

function fecharModal() {
    document.getElementById('modalImovel').classList.remove('active');
}

async function salvarImovel() {
    const titulo = document.getElementById('mTitulo').value.trim();
    const preco = document.getElementById('mPreco').value.trim();
    if (!titulo) { showToast('O título é obrigatório.', 'error'); return; }
    if (!preco)  { showToast('Informe o preço.', 'error'); return; }

    const fotosRaw = document.getElementById('mFotos').value.trim();
    const fotos = fotosRaw ? fotosRaw.split('\n').map(f => f.trim()).filter(Boolean) : [];
    const corretorIdVal = document.getElementById('mCorretor').value;

    const dados = {
        titulo,
        tipo:       document.getElementById('mTipo').value,
        finalidade: document.getElementById('mFinalidade').value,
        preco:      Number(preco),
        area:       Number(document.getElementById('mArea').value) || 0,
        quartos:    Number(document.getElementById('mQuartos').value) || 0,
        banheiros:  Number(document.getElementById('mBanheiros').value) || 0,
        vagas:      Number(document.getElementById('mVagas').value) || 0,
        endereco:   document.getElementById('mEndereco').value.trim(),
        bairro:     document.getElementById('mBairro').value.trim(),
        cidade:     document.getElementById('mCidade').value.trim(),
        estado:     document.getElementById('mEstado').value.trim().toUpperCase(),
        cep:        document.getElementById('mCep').value.trim(),
        descricao:  document.getElementById('mDescricao').value.trim(),
        destaque:   document.getElementById('mDestaque').checked,
        fotos,
        corretorId: corretorIdVal ? Number(corretorIdVal) : null,
    };

    try {
        const id = document.getElementById('imovelId').value;
        if (id) {
            await DB.imoveis.update(id, dados);
            showToast('Imóvel atualizado com sucesso! ✓', 'success');
        } else {
            await DB.imoveis.create(dados);
            showToast('Imóvel cadastrado com sucesso! ✓', 'success');
        }
        fecharModal();
        await carregarTabela();
    } catch (e) {
        showToast('Erro ao salvar: ' + e.message, 'error');
    }
}

async function toggleDestaque(id, atual) {
    try {
        await DB.imoveis.update(id, { destaque: !atual });
        await carregarTabela();
        showToast(!atual ? 'Marcado como destaque ⭐' : 'Destaque removido', 'info');
    } catch (e) {
        showToast('Erro: ' + e.message, 'error');
    }
}

function pedirExclusao(id) {
    deleteId = id;
    document.getElementById('modalConfirm').classList.add('active');
}

function fecharConfirm() {
    deleteId = null;
    document.getElementById('modalConfirm').classList.remove('active');
}

async function confirmarExclusao() {
    if (deleteId) {
        try {
            await DB.imoveis.remove(deleteId);
            showToast('Imóvel excluído.', 'info');
            await carregarTabela();
        } catch (e) {
            showToast('Erro ao excluir: ' + e.message, 'error');
        }
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

['modalImovel', 'modalConfirm'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => {
        if (e.target.id === id) {
            if (id === 'modalImovel') fecharModal();
            else fecharConfirm();
        }
    });
});
