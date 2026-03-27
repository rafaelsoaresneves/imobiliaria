/* ── Property Listing Page ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('navToggle')?.addEventListener('click', () => {
        document.getElementById('navLinks')?.classList.toggle('open');
    });

    const params = new URLSearchParams(window.location.search);
    const finalidade = params.get('finalidade');
    const tipo = params.get('tipo');
    const busca = params.get('busca');
    const quartos = params.get('quartos');

    if (finalidade) document.getElementById('filtFinalidade').value = finalidade;
    if (tipo)       document.getElementById('filtTipo').value = tipo;
    if (busca)      document.getElementById('filtBusca').value = busca;
    if (quartos)    document.getElementById('filtQuartos').value = quartos;

    if (finalidade === 'venda') {
        document.getElementById('pageTitle').textContent = 'Imóveis à Venda';
        document.getElementById('pageSubtitle').textContent = 'Encontre o imóvel perfeito para comprar';
    } else if (finalidade === 'aluguel') {
        document.getElementById('pageTitle').textContent = 'Imóveis para Alugar';
        document.getElementById('pageSubtitle').textContent = 'Encontre o imóvel ideal para locação';
    }
    if (tipo) {
        const tipoLabel = { apartamento: 'Apartamentos', casa: 'Casas', cobertura: 'Coberturas', studio: 'Studios', 'sala-comercial': 'Salas Comerciais', terreno: 'Terrenos' };
        if (tipoLabel[tipo]) document.getElementById('pageTitle').textContent = tipoLabel[tipo];
    }

    await aplicarFiltros();

    document.getElementById('filtBusca')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') aplicarFiltros();
    });
});

async function aplicarFiltros() {
    const params = {
        finalidade: document.getElementById('filtFinalidade')?.value || '',
        tipo:       document.getElementById('filtTipo')?.value || '',
        quartos:    document.getElementById('filtQuartos')?.value || '',
        precoMin:   document.getElementById('filtPrecoMin')?.value || '',
        precoMax:   document.getElementById('filtPrecoMax')?.value || '',
        busca:      document.getElementById('filtBusca')?.value.trim() || '',
        ordenar:    document.getElementById('ordenar')?.value || 'recente',
    };

    try {
        const lista = await DB.imoveis.filter(params);
        renderGrid(lista);
    } catch {
        renderGrid([]);
    }
}

function limparFiltros() {
    ['filtFinalidade', 'filtTipo', 'filtQuartos', 'filtPrecoMin', 'filtPrecoMax', 'filtBusca'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    aplicarFiltros();
}

function renderGrid(lista) {
    const grid = document.getElementById('imoveisGrid');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('resultCount');
    if (!grid) return;

    if (count) count.textContent = `${lista.length} imóvel${lista.length !== 1 ? 'is' : 's'} encontrado${lista.length !== 1 ? 's' : ''}`;

    if (lista.length === 0) {
        grid.innerHTML = '';
        empty?.classList.remove('hidden');
        return;
    }
    empty?.classList.add('hidden');
    grid.innerHTML = lista.map(im => imovelCardHTML(im)).join('');
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
        <button class="imovel-card-fav" title="Favoritar" onclick="event.stopPropagation()">🤍</button>
      </div>
      <div class="imovel-card-body">
        <div class="imovel-card-preco">${DB.fmt.preco(im.preco, im.finalidade)}</div>
        <div class="imovel-card-titulo">${im.titulo}</div>
        <div class="imovel-card-loc">📍 ${im.bairro}, ${im.cidade} - ${im.estado}</div>
        <div class="imovel-card-details">
          ${im.area    ? `<div class="imovel-card-detail"><span class="icon">📐</span>${im.area}m²</div>` : ''}
          ${im.quartos ? `<div class="imovel-card-detail"><span class="icon">🛏</span>${im.quartos} qts</div>` : ''}
          ${im.banheiros ? `<div class="imovel-card-detail"><span class="icon">🚿</span>${im.banheiros} ban.</div>` : ''}
          ${im.vagas   ? `<div class="imovel-card-detail"><span class="icon">🚗</span>${im.vagas} vg.</div>` : ''}
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
