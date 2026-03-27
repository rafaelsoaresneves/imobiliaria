/* ============================================================
   IMOBILIÁRIA PREMIUM — API CLIENT (REST Backend)
   Base URL: http://localhost:8080
   ============================================================ */

const DB = (() => {
  'use strict';

  const API = 'http://localhost:8080';
  const TOKEN_KEY = 'imob_jwt';
  const SESSION_KEY = 'imob_session';

  /* ── Normalização de enums (frontend ↔ backend) ─────────── */
  const TIPO_TO_API = {
    'apartamento':   'APARTAMENTO',
    'casa':          'CASA',
    'cobertura':     'COBERTURA',
    'studio':        'STUDIO',
    'sala-comercial':'SALA_COMERCIAL',
    'terreno':       'TERRENO',
    'galpao':        'GALPAO',
  };
  const TIPO_FROM_API = Object.fromEntries(Object.entries(TIPO_TO_API).map(([k, v]) => [v, k]));

  const FIN_TO_API   = { 'venda': 'VENDA', 'aluguel': 'ALUGUEL' };
  const FIN_FROM_API = { 'VENDA': 'venda', 'ALUGUEL': 'aluguel' };

  const STATUS_TO_API = {
    'novo':        'NOVO',
    'em-contato':  'EM_CONTATO',
    'negociando':  'NEGOCIANDO',
    'fechado':     'FECHADO',
  };
  const STATUS_FROM_API = Object.fromEntries(Object.entries(STATUS_TO_API).map(([k, v]) => [v, k]));

  const INTERESSE_TO_API = {
    'Compra':           'COMPRA',
    'Locação':          'LOCACAO',
    'Venda':            'VENDA',
    'Imóvel Específico':'COMPRA',
  };
  const INTERESSE_FROM_API = { 'COMPRA': 'Compra', 'LOCACAO': 'Locação', 'VENDA': 'Venda' };

  /* ── HTTP helper ─────────────────────────────────────────── */
  async function req(method, path, body, needsAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (needsAuth) {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const opts = { method, headers };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(`${API}${path}`, opts);

    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try { const e = await res.json(); msg = e.mensagem || e.message || msg; } catch {}
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  /* ── Normalização de objetos ─────────────────────────────── */
  function normImovel(im) {
    if (!im) return null;
    return {
      ...im,
      tipo:       TIPO_FROM_API[im.tipo]  || im.tipo?.toLowerCase()  || '',
      finalidade: FIN_FROM_API[im.finalidade] || im.finalidade?.toLowerCase() || '',
    };
  }

  function denormImovel(data) {
    return {
      titulo:     data.titulo,
      tipo:       TIPO_TO_API[data.tipo]  || data.tipo?.toUpperCase()  || '',
      finalidade: FIN_TO_API[data.finalidade] || data.finalidade?.toUpperCase() || '',
      preco:      Number(data.preco),
      area:       data.area   ? Number(data.area)   : null,
      quartos:    data.quartos  ? Number(data.quartos)  : null,
      banheiros:  data.banheiros ? Number(data.banheiros) : null,
      vagas:      data.vagas   ? Number(data.vagas)   : null,
      bairro:     data.bairro    || null,
      cidade:     data.cidade    || null,
      estado:     data.estado    || null,
      cep:        data.cep       || null,
      endereco:   data.endereco  || null,
      descricao:  data.descricao || null,
      destaque:   !!data.destaque,
      fotos:      Array.isArray(data.fotos) ? data.fotos : [],
      corretorId: data.corretorId ? Number(data.corretorId) : null,
    };
  }

  function normLead(l) {
    if (!l) return null;
    return {
      ...l,
      status:    STATUS_FROM_API[l.status]       || l.status?.toLowerCase()    || 'novo',
      interesse: INTERESSE_FROM_API[l.interesse] || l.interesse || '',
    };
  }

  function denormLead(data) {
    return {
      nome:      data.nome,
      email:     data.email,
      telefone:  data.telefone   || null,
      interesse: INTERESSE_TO_API[data.interesse] || data.interesse?.toUpperCase() || null,
      mensagem:  data.mensagem   || null,
      origem:    data.origem     || null,
    };
  }

  /* ── Auth ────────────────────────────────────────────────── */
  const auth = {
    async login(usuario, senha) {
      try {
        const res = await req('POST', '/api/auth/login', { usuario, senha });
        sessionStorage.setItem(TOKEN_KEY, res.token);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ usuario, loginEm: new Date().toISOString() }));
        return true;
      } catch {
        return false;
      }
    },
    logout() {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    },
    isLoggedIn() { return !!sessionStorage.getItem(TOKEN_KEY); },
    getSession() {
      try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
    },
    guard() {
      if (!this.isLoggedIn()) {
        window.location.href = window.location.pathname.includes('/admin/')
          ? 'index.html'
          : 'admin/index.html';
        return false;
      }
      return true;
    },
  };

  /* ── Imóveis ─────────────────────────────────────────────── */
  const imoveis = {
    async getAll() {
      const res = await req('GET', '/api/imoveis?size=100&sort=criadoEm,desc');
      return (res.conteudo || []).map(normImovel);
    },
    async getById(id) {
      return normImovel(await req('GET', `/api/imoveis/${id}`));
    },
    async create(data) {
      return normImovel(await req('POST', '/api/imoveis', denormImovel(data), true));
    },
    async update(id, data) {
      // Para toggleDestaque, busca o objeto atual e mescla
      if (Object.keys(data).length < 5) {
        const atual = await this.getById(id);
        data = { ...atual, ...data, corretorId: atual.corretor?.id || null };
      }
      return normImovel(await req('PUT', `/api/imoveis/${id}`, denormImovel(data), true));
    },
    async remove(id) {
      await req('DELETE', `/api/imoveis/${id}`, undefined, true);
      return true;
    },
    async filter(params = {}) {
      const qp = new URLSearchParams();
      if (params.finalidade) qp.set('finalidade', FIN_TO_API[params.finalidade] || params.finalidade.toUpperCase());
      if (params.tipo)       qp.set('tipo', TIPO_TO_API[params.tipo] || params.tipo.toUpperCase());
      if (params.quartos)    qp.set('quartos', params.quartos);
      if (params.precoMin)   qp.set('precoMin', params.precoMin);
      if (params.precoMax)   qp.set('precoMax', params.precoMax);
      if (params.bairro)     qp.set('bairro', params.bairro);
      if (params.cidade)     qp.set('cidade', params.cidade);
      if (params.destaque)   qp.set('destaque', 'true');
      if (params.busca)      qp.set('search', params.busca);
      if (params.ordenar === 'preco-asc')  qp.set('sort', 'preco,asc');
      else if (params.ordenar === 'preco-desc') qp.set('sort', 'preco,desc');
      else qp.set('sort', 'criadoEm,desc');
      qp.set('size', params.size || 100);
      qp.set('page', params.page || 0);
      const res = await req('GET', `/api/imoveis?${qp}`);
      return (res.conteudo || []).map(normImovel);
    },
  };

  /* ── Corretores ──────────────────────────────────────────── */
  const corretores = {
    async getAll()        { return req('GET', '/api/corretores'); },
    async getById(id)     { return req('GET', `/api/corretores/${id}`); },
    async create(data)    { return req('POST', '/api/corretores', data, true); },
    async update(id, data){ return req('PUT',  `/api/corretores/${id}`, data, true); },
    async remove(id)      { await req('DELETE', `/api/corretores/${id}`, undefined, true); return true; },
  };

  /* ── Leads ───────────────────────────────────────────────── */
  const leads = {
    async getAll() {
      const list = await req('GET', '/api/leads', undefined, true);
      return list.map(normLead);
    },
    async getById(id) {
      const list = await this.getAll();
      return list.find(l => String(l.id) === String(id)) || null;
    },
    async create(data) {
      return normLead(await req('POST', '/api/leads', denormLead(data)));
    },
    async update(id, data) {
      if (data.status !== undefined) {
        const apiStatus = STATUS_TO_API[data.status] || data.status.toUpperCase();
        return normLead(await req('PUT', `/api/leads/${id}/status`, { status: apiStatus }, true));
      }
      return null;
    },
    async remove(id) {
      await req('DELETE', `/api/leads/${id}`, undefined, true);
      return true;
    },
    async filter(params = {}) {
      const list = await this.getAll();
      if (params.status) return list.filter(l => l.status === params.status);
      return list;
    },
  };

  /* ── Formatters ──────────────────────────────────────────── */
  const fmt = {
    preco(valor, finalidade) {
      const formatted = Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
      return finalidade === 'aluguel' ? `${formatted}/mês` : formatted;
    },
    data(iso) {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('pt-BR');
    },
    tipo(t) {
      const map = { apartamento: 'Apartamento', casa: 'Casa', cobertura: 'Cobertura', studio: 'Studio', 'sala-comercial': 'Sala Comercial', terreno: 'Terreno', galpao: 'Galpão' };
      return map[t] || t;
    },
    finalidade(f) {
      return f === 'aluguel' ? 'Locação' : 'Venda';
    },
  };

  return { imoveis, corretores, leads, auth, fmt };
})();
