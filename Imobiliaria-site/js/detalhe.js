/* ── Property Detail Page ────────────────────────────────────── */
let currentImovelFotos = [];
let lightboxIdx = 0;

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('navToggle')?.addEventListener('click', () => {
        document.getElementById('navLinks')?.classList.toggle('open');
    });

    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
        document.getElementById('imovelTitulo').textContent = 'Imóvel não encontrado';
        return;
    }

    try {
        const im = await DB.imoveis.getById(id);
        if (!im) {
            document.getElementById('imovelTitulo').textContent = 'Imóvel não encontrado';
            return;
        }
        renderImovel(im);
        renderSimilares(im);
    } catch {
        document.getElementById('imovelTitulo').textContent = 'Erro ao carregar imóvel';
    }
});

function renderImovel(im) {
    currentImovelFotos = im.fotos?.length ? im.fotos : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900'];

    document.title = `${im.titulo} — Première Imóveis`;
    document.getElementById('pageTitle').textContent = im.titulo;
    document.getElementById('imovelTitulo').textContent = im.titulo;
    document.getElementById('breadcrumbTitulo').textContent = im.titulo;
    document.getElementById('imovelEndereco').textContent = `${im.endereco}, ${im.bairro} — ${im.cidade}/${im.estado}`;
    document.getElementById('imovelPreco').textContent = DB.fmt.preco(im.preco, im.finalidade);
    document.getElementById('imovelFinalidade').textContent = DB.fmt.finalidade(im.finalidade);

    const mainPhoto = document.getElementById('mainPhoto');
    if (mainPhoto) mainPhoto.src = currentImovelFotos[0];

    const thumbsEl = document.getElementById('galleryThumbs');
    if (thumbsEl && currentImovelFotos.length > 1) {
        thumbsEl.style.display = 'contents';
        const showThumbs = currentImovelFotos.slice(1, 3);
        thumbsEl.innerHTML = showThumbs.map((src, i) => {
            const isLast = i === showThumbs.length - 1 && currentImovelFotos.length > 3;
            return `
        <div class="gallery-img-wrap gallery-more" onclick="openLightbox(${i + 1})" style="position:relative;overflow:hidden;">
          <img src="${src}" alt="Foto ${i + 2}" class="gallery-img" />
          ${isLast ? `<div class="gallery-overlay">+${currentImovelFotos.length - 3} fotos</div>` : ''}
        </div>`;
        }).join('');
    }

    const badgesEl = document.getElementById('badgesArea');
    if (badgesEl) {
        badgesEl.innerHTML = `
      <span class="badge ${im.finalidade === 'aluguel' ? 'badge-navy' : 'badge-gold'}" style="font-size:0.85rem;padding:0.35rem 1rem;">${DB.fmt.finalidade(im.finalidade)}</span>
      <span class="badge badge-gray" style="font-size:0.85rem;padding:0.35rem 1rem;">${DB.fmt.tipo(im.tipo)}</span>
      ${im.destaque ? '<span class="badge badge-gold" style="font-size:0.85rem;padding:0.35rem 1rem;">⭐ Destaque</span>' : ''}
    `;
    }

    const infoEl = document.getElementById('infoGrid');
    if (infoEl) {
        const infos = [
            { label: 'Área',      value: im.area ? `${im.area}m²` : '—' },
            { label: 'Quartos',   value: im.quartos   || '—' },
            { label: 'Banheiros', value: im.banheiros || '—' },
            { label: 'Vagas',     value: im.vagas     || '—' },
        ];
        infoEl.innerHTML = infos.map(i => `
      <div class="info-item">
        <div class="value">${i.value}</div>
        <div class="label">${i.label}</div>
      </div>`).join('');
    }

    const descEl = document.getElementById('imovelDesc');
    if (descEl) descEl.textContent = im.descricao || 'Descrição não disponível.';

    const locEl = document.getElementById('imovelLocFull');
    if (locEl) locEl.textContent = `${im.endereco}, ${im.bairro}, ${im.cidade} - ${im.estado}, CEP ${im.cep}`;

    // Corretor vem embutido na resposta da API como objeto {id, nome, creci, foto}
    // Não precisa mais chamar DB.corretores.getById()
    if (im.corretor) {
        const c = im.corretor;
        document.getElementById('corretorCard').style.display = 'flex';
        document.getElementById('corretorFoto').src = c.foto || '';
        document.getElementById('corretorNome').textContent = c.nome;
        document.getElementById('corretorCreci').textContent = c.creci;
        const tel = c.telefone || '';
        document.getElementById('corretorTel').href = `tel:${tel}`;
        document.getElementById('corretorTel').textContent = `📞 ${tel}`;
        document.getElementById('corretorWp').href = `https://wa.me/55${tel.replace(/\D/g, '')}`;
    }
}

async function renderSimilares(im) {
    const container = document.getElementById('similares');
    if (!container) return;
    try {
        let similares = (await DB.imoveis.filter({ tipo: im.tipo, finalidade: im.finalidade }))
            .filter(i => String(i.id) !== String(im.id))
            .slice(0, 3);

        if (similares.length === 0) {
            const todos = await DB.imoveis.getAll();
            similares = todos.filter(i => String(i.id) !== String(im.id)).slice(0, 3);
        }
        container.innerHTML = similares.map(i => imovelCardHTML(i)).join('');
    } catch {
        container.innerHTML = '';
    }
}

function openLightbox(idx) {
    lightboxIdx = idx;
    const lb = document.getElementById('lightbox');
    lb.style.display = 'flex';
    document.getElementById('lightboxImg').src = currentImovelFotos[lightboxIdx];
    document.getElementById('lightboxCount').textContent = `${lightboxIdx + 1} / ${currentImovelFotos.length}`;
}
function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }
function lightboxPrev() {
    lightboxIdx = (lightboxIdx - 1 + currentImovelFotos.length) % currentImovelFotos.length;
    openLightbox(lightboxIdx);
}
function lightboxNext() {
    lightboxIdx = (lightboxIdx + 1) % currentImovelFotos.length;
    openLightbox(lightboxIdx);
}
document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (lb && lb.style.display !== 'none') {
        if (e.key === 'ArrowLeft') lightboxPrev();
        if (e.key === 'ArrowRight') lightboxNext();
        if (e.key === 'Escape') closeLightbox();
    }
});

async function enviarInteresse() {
    const nome = document.getElementById('sNome')?.value.trim();
    const email = document.getElementById('sEmail')?.value.trim();
    const telefone = document.getElementById('sTelefone')?.value.trim();
    const mensagem = document.getElementById('sMensagem')?.value.trim();

    if (!nome || !email) { showToast('Preencha nome e e-mail.', 'error'); return; }

    try {
        await DB.leads.create({ nome, email, telefone, mensagem, interesse: 'Imóvel Específico', origem: 'detalhe-imovel' });
        showToast('Solicitação enviada! Entraremos em contato em breve. 🎉', 'success');
        ['sNome', 'sEmail', 'sTelefone', 'sMensagem'].forEach(id2 => {
            const el = document.getElementById(id2);
            if (el) el.value = '';
        });
    } catch {
        showToast('Erro ao enviar. Tente novamente.', 'error');
    }
}

function imovelCardHTML(im) {
    const fotos = im.fotos || [];
    const img = fotos[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600';
    return `
    <div class="imovel-card" onclick="location.href='imovel-detalhe.html?id=${im.id}'">
      <div class="imovel-card-img">
        <img src="${img}" alt="${im.titulo}" loading="lazy" />
        <div class="imovel-card-badges">
          <span class="badge ${im.finalidade === 'aluguel' ? 'badge-navy' : 'badge-gold'}">${DB.fmt.finalidade(im.finalidade)}</span>
          <span class="badge badge-gray">${DB.fmt.tipo(im.tipo)}</span>
        </div>
      </div>
      <div class="imovel-card-body">
        <div class="imovel-card-preco">${DB.fmt.preco(im.preco, im.finalidade)}</div>
        <div class="imovel-card-titulo">${im.titulo}</div>
        <div class="imovel-card-loc">📍 ${im.bairro}, ${im.cidade}</div>
        <div class="imovel-card-details">
          ${im.area    ? `<div class="imovel-card-detail">📐 ${im.area}m²</div>` : ''}
          ${im.quartos ? `<div class="imovel-card-detail">🛏 ${im.quartos} qts</div>` : ''}
          ${im.vagas   ? `<div class="imovel-card-detail">🚗 ${im.vagas} vg.</div>` : ''}
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
