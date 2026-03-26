/* ============================================================
   IMOBILIÁRIA PREMIUM — DATA MANAGEMENT (localStorage)
   ============================================================ */

const DB = (() => {
  'use strict';

  const KEYS = {
    imoveis:   'imob_imoveis',
    corretores:'imob_corretores',
    leads:     'imob_leads',
    user:      'imob_user',
    session:   'imob_session',
  };

  /* ── Helpers ─────────────────────────────────────────────── */
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  }
  function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ── Generic CRUD ────────────────────────────────────────── */
  function getAll(key)      { return read(key); }
  function getById(key, id) { return read(key).find(i => i.id === id) || null; }
  function create(key, data) {
    const items = read(key);
    const item = { ...data, id: generateId(), criadoEm: new Date().toISOString() };
    items.unshift(item);
    write(key, items);
    return item;
  }
  function update(key, id, data) {
    const items = read(key);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data, atualizadoEm: new Date().toISOString() };
    write(key, items);
    return items[idx];
  }
  function remove(key, id) {
    const items = read(key).filter(i => i.id !== id);
    write(key, items);
    return true;
  }

  /* ── Imóveis ─────────────────────────────────────────────── */
  const imoveis = {
    getAll:  ()     => getAll(KEYS.imoveis),
    getById: (id)   => getById(KEYS.imoveis, id),
    create:  (data) => create(KEYS.imoveis, data),
    update:  (id, data) => update(KEYS.imoveis, id, data),
    remove:  (id) => remove(KEYS.imoveis, id),
    filter:  (params = {}) => {
      let list = getAll(KEYS.imoveis);
      if (params.finalidade) list = list.filter(i => i.finalidade === params.finalidade);
      if (params.tipo)       list = list.filter(i => i.tipo === params.tipo);
      if (params.bairro)     list = list.filter(i => i.bairro?.toLowerCase().includes(params.bairro.toLowerCase()));
      if (params.cidade)     list = list.filter(i => i.cidade?.toLowerCase().includes(params.cidade.toLowerCase()));
      if (params.quartos)    list = list.filter(i => Number(i.quartos) >= Number(params.quartos));
      if (params.precoMin)   list = list.filter(i => Number(i.preco) >= Number(params.precoMin));
      if (params.precoMax)   list = list.filter(i => Number(i.preco) <= Number(params.precoMax));
      if (params.destaque)   list = list.filter(i => i.destaque);
      if (params.busca)      list = list.filter(i =>
        i.titulo?.toLowerCase().includes(params.busca.toLowerCase()) ||
        i.bairro?.toLowerCase().includes(params.busca.toLowerCase()) ||
        i.cidade?.toLowerCase().includes(params.busca.toLowerCase())
      );
      if (params.ordenar === 'preco-asc')  list.sort((a,b) => Number(a.preco)-Number(b.preco));
      if (params.ordenar === 'preco-desc') list.sort((a,b) => Number(b.preco)-Number(a.preco));
      if (params.ordenar === 'recente')    list.sort((a,b) => new Date(b.criadoEm)-new Date(a.criadoEm));
      return list;
    },
  };

  /* ── Corretores ──────────────────────────────────────────── */
  const corretores = {
    getAll:  ()          => getAll(KEYS.corretores),
    getById: (id)        => getById(KEYS.corretores, id),
    create:  (data)      => create(KEYS.corretores, data),
    update:  (id, data)  => update(KEYS.corretores, id, data),
    remove:  (id)        => remove(KEYS.corretores, id),
  };

  /* ── Leads ───────────────────────────────────────────────── */
  const leads = {
    getAll:  ()         => getAll(KEYS.leads),
    getById: (id)       => getById(KEYS.leads, id),
    create:  (data)     => create(KEYS.leads, data),
    update:  (id, data) => update(KEYS.leads, id, data),
    remove:  (id)       => remove(KEYS.leads, id),
    filter:  (params={}) => {
      let list = getAll(KEYS.leads);
      if (params.status) list = list.filter(l => l.status === params.status);
      return list;
    },
  };

  /* ── Auth ────────────────────────────────────────────────── */
  const auth = {
    login(usuario, senha) {
      if (usuario === 'admin' && senha === 'admin123') {
        const session = { usuario, loginEm: new Date().toISOString() };
        sessionStorage.setItem(KEYS.session, JSON.stringify(session));
        return true;
      }
      return false;
    },
    logout() { sessionStorage.removeItem(KEYS.session); },
    isLoggedIn() { return !!sessionStorage.getItem(KEYS.session); },
    getSession() { try { return JSON.parse(sessionStorage.getItem(KEYS.session)); } catch { return null; } },
    guard() {
      if (!this.isLoggedIn()) {
        window.location.href = '/admin/index.html';
        return false;
      }
      return true;
    },
  };

  /* ── Seed Data ───────────────────────────────────────────── */
  function seed() {
    if (getAll(KEYS.imoveis).length > 0) return; // already seeded

    // Seed corretores
    const corrs = [
      { nome: 'Ricardo Almeida', creci: 'CRECI-SP 45231', telefone: '(11) 97842-3310', email: 'ricardo@premiereimob.com.br', especialidade: 'Alto Padrão', foto: 'https://randomuser.me/api/portraits/men/32.jpg', bio: 'Especialista em imóveis de alto padrão com mais de 12 anos de experiência no mercado.' },
      { nome: 'Fernanda Costa', creci: 'CRECI-SP 61087', telefone: '(11) 95571-2244', email: 'fernanda@premiereimob.com.br', especialidade: 'Residencial', foto: 'https://randomuser.me/api/portraits/women/44.jpg', bio: 'Consultora imobiliária com foco em imóveis residenciais e lançamentos.' },
      { nome: 'Marcelo Duarte', creci: 'CRECI-SP 38920', telefone: '(11) 98823-6601', email: 'marcelo@premiereimob.com.br', especialidade: 'Comercial', foto: 'https://randomuser.me/api/portraits/men/55.jpg', bio: 'Especializado em imóveis comerciais e salas de escritório.' },
      { nome: 'Ana Paula Ramos', creci: 'CRECI-SP 72445', telefone: '(11) 94490-8832', email: 'ana@premiereimob.com.br', especialidade: 'Locações', foto: 'https://randomuser.me/api/portraits/women/29.jpg', bio: 'Gestora de locação com expertise em contratos e administração de imóveis.' },
    ];
    corrs.forEach(c => create(KEYS.corretores, c));

    // Seed imóveis
    const imgs = {
      apt1: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'],
      apt2: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800'],
      casa1: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
      casa2: ['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800', 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800'],
      cobertura: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
      sala: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'],
    };

    const imoveisSeed = [
      { titulo:'Apartamento Garden Higienópolis', tipo:'apartamento', finalidade:'venda', preco:980000, area:120, quartos:3, banheiros:2, vagas:2, bairro:'Higienópolis', cidade:'São Paulo', estado:'SP', cep:'01239-010', endereco:'Rua da Consolação, 422', descricao:'Elegante apartamento garden com acabamento premium, varanda gourmet e área de lazer completa. Imóvel renovado com materiais de primeira linha, piso aquecido e automação residencial. Posição solar privilegiada, muito claro e arejado.', destaque:true, fotos:imgs.apt1, corretor: getAll(KEYS.corretores)[0]?.id },
      { titulo:'Cobertura Duplex Jardins', tipo:'cobertura', finalidade:'venda', preco:2800000, area:280, quartos:4, banheiros:4, vagas:3, bairro:'Jardins', cidade:'São Paulo', estado:'SP', cep:'01452-000', endereco:'Alameda Santos, 1800', descricao:'Cobertura duplex exclusiva nos Jardins com terraço privativo de 90m², piscina aquecida e vista panorâmica da cidade. Acabamento de altíssimo padrão, closet master e cinema privativo.', destaque:true, fotos:imgs.cobertura, corretor: getAll(KEYS.corretores)[0]?.id },
      { titulo:'Casa Condomínio Alphaville', tipo:'casa', finalidade:'venda', preco:1450000, area:320, quartos:4, banheiros:3, vagas:4, bairro:'Alphaville', cidade:'Barueri', estado:'SP', cep:'06474-900', endereco:'Rua Monet, 85', descricao:'Casa de arquitetura contemporânea em condomínio fechado com segurança 24h. Piscina, espaço gourmet, home theater e jardim paisagístico. Geração de energia solar instalada.', destaque:true, fotos:imgs.casa1, corretor: getAll(KEYS.corretores)[1]?.id },
      { titulo:'Apartamento Moderno Pinheiros', tipo:'apartamento', finalidade:'venda', preco:650000, area:85, quartos:2, banheiros:2, vagas:1, bairro:'Pinheiros', cidade:'São Paulo', estado:'SP', cep:'05422-010', endereco:'Rua dos Pinheiros, 330', descricao:'Apartamento moderno com design minimalista, pé-direito duplo e varanda integrada. Próximo ao metrô e às melhores opções de gastronomia de São Paulo.', destaque:false, fotos:imgs.apt2, corretor: getAll(KEYS.corretores)[1]?.id },
      { titulo:'Casa Térrea Alto de Pinheiros', tipo:'casa', finalidade:'venda', preco:1850000, area:250, quartos:3, banheiros:3, vagas:3, bairro:'Alto de Pinheiros', cidade:'São Paulo', estado:'SP', cep:'05461-000', endereco:'Av. Imperatriz Leopoldina, 220', descricao:'Casa térrea reformada totalmente, jardim exuberante e área de lazer com piscina aquecida. Localização privilegiada com fácil acesso às marginais.', destaque:false, fotos:imgs.casa2, corretor: getAll(KEYS.corretores)[2]?.id },
      { titulo:'Sala Comercial Paulista', tipo:'sala-comercial', finalidade:'venda', preco:420000, area:60, quartos:0, banheiros:1, vagas:1, bairro:'Bela Vista', cidade:'São Paulo', estado:'SP', cep:'01310-100', endereco:'Av. Paulista, 2100', descricao:'Sala comercial moderna na Avenida Paulista, em edifício triple A com infraestrutura completa. Ideal para escritório de advocacia, consultório ou coworking. Prédio com portaria 24h.', destaque:false, fotos:imgs.sala, corretor: getAll(KEYS.corretores)[2]?.id },
      { titulo:'Apartamento 3 Quartos — Locação', tipo:'apartamento', finalidade:'aluguel', preco:4800, area:110, quartos:3, banheiros:2, vagas:2, bairro:'Moema', cidade:'São Paulo', estado:'SP', cep:'04525-001', endereco:'Rua Honduras, 505', descricao:'Amplo apartamento em Moema com lazer completo: piscina, academia, salão de festas. Reformado, cozinha americana e varanda espaçosa com churrasqueira.', destaque:true, fotos:imgs.apt1, corretor: getAll(KEYS.corretores)[3]?.id },
      { titulo:'Studio Moderno — Locação', tipo:'studio', finalidade:'aluguel', preco:2900, area:38, quartos:1, banheiros:1, vagas:1, bairro:'Consolação', cidade:'São Paulo', estado:'SP', cep:'01302-010', endereco:'Rua da Consolação, 700', descricao:'Studio contemporâneo com acabamento premium, mobiliado e equipado. Prédio com portaria 24h e academia. Ideal para jovens profissionais.', destaque:false, fotos:imgs.apt2, corretor: getAll(KEYS.corretores)[3]?.id },
    ];

    imoveisSeed.forEach(im => create(KEYS.imoveis, im));

    // Seed leads
    const leadsSeed = [
      { nome:'Carlos Mendes', email:'carlos.mendes@gmail.com', telefone:'(11) 99234-5678', interesse:'Compra', mensagem:'Procuro apartamento 3 quartos em Pinheiros até R$ 800.000.', status:'novo', origem:'homepage' },
      { nome:'Mariana Souza', email:'mariana.souza@hotmail.com', telefone:'(11) 98765-4321', interesse:'Locação', mensagem:'Preciso alugar uma casa em Alphaville.', status:'em-contato', origem:'formulario-contato' },
      { nome:'Felipe Rodrigues', email:'felipe.r@empresa.com', telefone:'(11) 97654-3210', interesse:'Compra', mensagem:'Tenho interesse na cobertura dos Jardins.', status:'negociando', origem:'detalhe-imovel' },
      { nome:'Juliana Pereira', email:'ju.pereira@gmail.com', telefone:'(11) 95432-1234', interesse:'Venda', mensagem:'Quero vender meu apartamento em Higienópolis.', status:'novo', origem:'formulario-contato' },
    ];
    leadsSeed.forEach(l => create(KEYS.leads, l));
  }

  /* ── Formatters ──────────────────────────────────────────── */
  const fmt = {
    preco(valor, finalidade) {
      const formatted = Number(valor).toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 });
      return finalidade === 'aluguel' ? `${formatted}/mês` : formatted;
    },
    data(iso) {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('pt-BR');
    },
    tipo(t) {
      const map = { apartamento:'Apartamento', casa:'Casa', cobertura:'Cobertura', studio:'Studio', 'sala-comercial':'Sala Comercial', terreno:'Terreno', galpao:'Galpão' };
      return map[t] || t;
    },
    finalidade(f) {
      return f === 'aluguel' ? 'Locação' : 'Venda';
    },
  };

  // Run seed on first load
  seed();

  return { imoveis, corretores, leads, auth, fmt, KEYS };
})();
