/* ── Admin Dashboard JS ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    if (!DB.auth.guard()) return;

    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    try {
        const [imoveis, corretores, leads] = await Promise.all([
            DB.imoveis.getAll(),
            DB.corretores.getAll(),
            DB.leads.getAll(),
        ]);

        const destaques = imoveis.filter(i => i.destaque);
        document.getElementById('kpiImoveis').textContent = imoveis.length;
        document.getElementById('kpiCorretores').textContent = corretores.length;
        document.getElementById('kpiLeads').textContent = leads.length;
        document.getElementById('kpiDestaque').textContent = destaques.length;

        // Recent leads
        const tbody = document.getElementById('leadsTableBody');
        if (tbody) {
            const recent = leads.slice(0, 8);
            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="table-empty">Nenhum lead ainda.</td></tr>';
            } else {
                const statusLabels = { novo: '🔵 Novo', 'em-contato': '🟡 Em Contato', negociando: '🟢 Negociando', fechado: '⚫ Fechado' };
                tbody.innerHTML = recent.map(l => `
            <tr>
              <td><strong>${l.nome}</strong><br><small style="color:var(--color-gray-400)">${l.email}</small></td>
              <td>${l.interesse || '—'}</td>
              <td>${DB.fmt.data(l.criadoEm)}</td>
              <td><span class="badge ${statusClass(l.status)}">${statusLabels[l.status] || l.status}</span></td>
            </tr>
          `).join('');
            }
        }

        // Recent properties
        const recentEl = document.getElementById('recentImoveis');
        if (recentEl) {
            const recent = imoveis.slice(0, 5);
            if (recent.length === 0) {
                recentEl.innerHTML = '<p style="color:var(--color-gray-400);text-align:center;padding:1rem;">Nenhum imóvel cadastrado.</p>';
            } else {
                recentEl.innerHTML = recent.map(im => {
                    const img = (im.fotos || [])[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=60';
                    return `
              <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid var(--color-gray-100);">
                <img src="${img}" alt="${im.titulo}" style="width:48px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0;" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=60'" />
                <div style="flex:1;min-width:0;">
                  <p style="font-size:0.82rem;font-weight:600;color:var(--color-navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${im.titulo}</p>
                  <p style="font-size:0.75rem;color:var(--color-gray-400);">${DB.fmt.preco(im.preco, im.finalidade)}</p>
                </div>
                <span class="badge ${im.finalidade === 'aluguel' ? 'badge-navy' : 'badge-gold'}" style="font-size:0.65rem;">${DB.fmt.finalidade(im.finalidade)}</span>
              </div>`;
                }).join('');
            }
        }
    } catch (e) {
        console.error('Erro ao carregar dashboard:', e);
    }
});

function statusClass(s) {
    const map = { novo: 'badge-info', 'em-contato': 'badge-warning', negociando: 'badge-success', fechado: 'badge-navy' };
    return map[s] || 'badge-gray';
}

function logout() {
    DB.auth.logout();
    window.location.href = 'index.html';
}

function showToast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}
