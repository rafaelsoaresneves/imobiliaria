/* ── Homepage JS ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    document.getElementById('navToggle')?.addEventListener('click', () => {
        document.getElementById('navLinks')?.classList.toggle('open');
    });

    // Load featured properties
    const destaqueGrid = document.getElementById('imoveisDestaque');
    if (destaqueGrid) {
        try {
            const [destaques, todos] = await Promise.all([
                DB.imoveis.filter({ destaque: true }),
                DB.imoveis.getAll(),
            ]);
            const el = document.getElementById('statImoveis');
            if (el) el.textContent = todos.length > 0 ? todos.length + '+' : '500+';

            if (destaques.length === 0) {
                destaqueGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--color-gray-400);padding:2rem;">Nenhum imóvel em destaque no momento.</p>';
            } else {
                destaqueGrid.innerHTML = destaques.slice(0, 6).map(imovelCardHTML).join('');
            }
        } catch {
            destaqueGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--color-gray-400);padding:2rem;">Erro ao carregar imóveis. Verifique se o servidor está rodando.</p>';
        }
    }

    // Load agents
    const corretoresHome = document.getElementById('corretoresHome');
    if (corretoresHome) {
        try {
            const corrs = await DB.corretores.getAll();
            if (corrs.length === 0) {
                corretoresHome.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--color-gray-400);">Nenhum corretor cadastrado.</p>';
            } else {
                corretoresHome.innerHTML = corrs.slice(0, 4).map(corretorCardHTML).join('');
            }
        } catch {
            corretoresHome.innerHTML = '';
        }
    }

    // Search tabs
    let searchFinalidade = 'venda';
    document.querySelectorAll('.search-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            searchFinalidade = tab.dataset.tab === 'alugar' ? 'aluguel' : 'venda';
        });
    });

    document.getElementById('searchBtn')?.addEventListener('click', () => {
        const busca = document.getElementById('searchBusca')?.value.trim();
        const tipo = document.getElementById('searchTipo')?.value;
        const quartos = document.getElementById('searchQuartos')?.value;
        const params = new URLSearchParams();
        params.set('finalidade', searchFinalidade);
        if (busca) params.set('busca', busca);
        if (tipo) params.set('tipo', tipo);
        if (quartos) params.set('quartos', quartos);
        window.location.href = `imoveis.html?${params.toString()}`;
    });

    document.getElementById('searchBusca')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('searchBtn')?.click();
    });
});

async function enviarLead() {
    const nome = document.getElementById('leadNome')?.value.trim();
    const email = document.getElementById('leadEmail')?.value.trim();
    const telefone = document.getElementById('leadTelefone')?.value.trim();
    const interesse = document.getElementById('leadInteresse')?.value;

    if (!nome || !email || !telefone) { showToast('Preencha nome, e-mail e telefone.', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('E-mail inválido.', 'error'); return; }

    try {
        await DB.leads.create({ nome, email, telefone, interesse, origem: 'homepage' });
        showToast('Recebemos seu contato! Em breve retornaremos. 🎉', 'success');
        ['leadNome', 'leadEmail', 'leadTelefone'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    } catch {
        showToast('Erro ao enviar. Tente novamente.', 'error');
    }
}

function imovelCardHTML(im) {
    const img = (im.fotos || [])[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600';
    return `
    <div class="imovel-card" onclick="location.href='imovel-detalhe.html?id=${im.id}'">
      <div class="imovel-card-img">
        <img src="${img}" alt="${im.titulo}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600'"/>
        <div class="imovel-card-badges">
          <span class="badge ${im.finalidade === 'aluguel' ? 'badge-navy' : 'badge-gold'}">${DB.fmt.finalidade(im.finalidade)}</span>
          ${im.destaque ? '<span class="badge badge-gold">⭐ Destaque</span>' : ''}
          <span class="badge badge-gray">${DB.fmt.tipo(im.tipo)}</span>
        </div>
        <button class="imovel-card-fav" title="Favoritar">🤍</button>
      </div>
      <div class="imovel-card-body">
        <div class="imovel-card-preco">${DB.fmt.preco(im.preco, im.finalidade)}</div>
        <div class="imovel-card-titulo">${im.titulo}</div>
        <div class="imovel-card-loc">📍 ${im.bairro}, ${im.cidade} - ${im.estado}</div>
        <div class="imovel-card-details">
          ${im.area ? `<div class="imovel-card-detail"><span class="icon">📐</span>${im.area}m²</div>` : ''}
          ${im.quartos ? `<div class="imovel-card-detail"><span class="icon">🛏</span>${im.quartos} qts</div>` : ''}
          ${im.banheiros ? `<div class="imovel-card-detail"><span class="icon">🚿</span>${im.banheiros} ban.</div>` : ''}
          ${im.vagas ? `<div class="imovel-card-detail"><span class="icon">🚗</span>${im.vagas} vg.</div>` : ''}
        </div>
      </div>
    </div>`;
}

function corretorCardHTML(c) {
    return `
    <div class="corretor-card">
      <div class="corretor-card-img">
        <img src="${c.foto || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${c.nome}" loading="lazy"/>
      </div>
      <div class="corretor-card-body">
        <h3>${c.nome}</h3>
        <p class="corretor-creci">${c.creci}</p>
        <p class="corretor-especialidade">${c.especialidade}</p>
        <div class="corretor-contatos">
          <a href="tel:${c.telefone}" class="corretor-contato-btn" title="Ligar">📞</a>
          <a href="mailto:${c.email}" class="corretor-contato-btn" title="E-mail">✉️</a>
          <a href="https://wa.me/55${c.telefone?.replace(/\D/g, '')}" target="_blank" class="corretor-contato-btn" title="WhatsApp">💬</a>
        </div>
      </div>
    </div>`;
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
