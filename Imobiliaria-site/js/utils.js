/* ── Helpers ─────────────────────────────────────────────────── */
function showToast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    t.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${msg}`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}

function imovelCardHTML(im) {
    const fotos = im.fotos || [];
    const img = fotos[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600';
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
          ${im.banheiros ? `<div class="imovel-card-detail"><span class="icon">🚿</span>${im.banheiros} banos</div>` : ''}
          ${im.vagas ? `<div class="imovel-card-detail"><span class="icon">🚗</span>${im.vagas} vg.</div>` : ''}
        </div>
      </div>
    </div>`;
}

function corretorCardHTML(c) {
    return `
    <div class="corretor-card">
      <div class="corretor-card-img">
        <img src="${c.foto || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${c.nome}" loading="lazy" onerror="this.src='https://randomuser.me/api/portraits/lego/1.jpg'"/>
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

/* ── Navbar & mobile nav ──────────────────────────────────────── */
(function initNav() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    if (navbar && navbar.classList.contains('transparent')) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        });
    }

    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('open'));
    }
})();
