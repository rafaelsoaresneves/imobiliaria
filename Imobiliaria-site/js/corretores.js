/* ── Corretores Page ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navToggle')?.addEventListener('click', () => {
        document.getElementById('navLinks')?.classList.toggle('open');
    });

    const grid = document.getElementById('corretoresGrid');
    const empty = document.getElementById('emptyState');
    const corrs = DB.corretores.getAll();

    if (!grid) return;

    if (corrs.length === 0) {
        grid.innerHTML = '';
        empty?.classList.remove('hidden');
        return;
    }

    grid.innerHTML = corrs.map(c => `
    <div class="corretor-card">
      <div class="corretor-card-img">
        <img src="${c.foto || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${c.nome}" loading="lazy"
          onerror="this.src='https://randomuser.me/api/portraits/lego/1.jpg'"/>
      </div>
      <div class="corretor-card-body">
        <h3>${c.nome}</h3>
        <p class="corretor-creci">${c.creci}</p>
        <p class="corretor-especialidade">${c.especialidade}</p>
        ${c.bio ? `<p style="font-size:0.82rem;color:var(--color-gray-400);line-height:1.6;margin-bottom:1rem;">${c.bio}</p>` : ''}
        <div class="corretor-contatos">
          <a href="tel:${c.telefone}" class="corretor-contato-btn" title="Ligar">📞</a>
          <a href="mailto:${c.email}" class="corretor-contato-btn" title="E-mail">✉️</a>
          <a href="https://wa.me/55${c.telefone?.replace(/\D/g, '')}" target="_blank" class="corretor-contato-btn" title="WhatsApp">💬</a>
        </div>
      </div>
    </div>
  `).join('');
});

function showToast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}
