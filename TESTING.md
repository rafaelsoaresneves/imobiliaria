# 🧪 Guia de Teste — Frontend + Backend Integrados

## ✅ Checklist Pré-Teste

### 1. Inicie o PostgreSQL
```bash
cd C:\Projetos\imobiliaria\imobiliaria-backend\Imobliaria
docker compose up -d
```
Verificar se está rodando:
```bash
docker ps | grep postgres
```

### 2. Inicie o Backend
```bash
cd C:\Projetos\imobiliaria\imobiliaria-backend\Imobliaria
./gradlew bootRun
```
Aguarde aparecer: `Started ImobliariaApplication in X seconds`
Porta: `http://localhost:8080`

### 3. Inicie o Frontend (Live Server)
- Abra VS Code
- Vá para: `C:\Projetos\imobiliaria\Imobiliaria-site`
- Clique com botão direito em `index.html`
- Selecione: **"Open with Live Server"**
- Porta: `http://localhost:5500`

---

## 🔐 Passo 1: Login no Admin

1. Acesse: `http://localhost:5500/admin/`
2. Credenciais:
   - **Usuário**: `admin`
   - **Senha**: `admin123`
3. Clique em **"Entrar"**
4. Deve redirecionar para: `http://localhost:5500/admin/dashboard.html`

**✓ Se chegou aqui**: JWT está funcionando!

---

## 📸 Passo 2: Testar Upload de Imóvel

1. Acesse: `http://localhost:5500/admin/imoveis.html`
2. Clique em: **"+ Novo Imóvel"**
3. Preencha os campos obrigatórios:
   - **Título**: `Apartamento Garden em Higienópolis`
   - **Tipo**: `Apartamento`
   - **Finalidade**: `Venda`
   - **Preço**: `850000`

4. Vá para a seção **"Fotos do Imóvel"**:
   - Clique em **"Selecione uma ou mais imagens"**
   - Escolha **2-3 imagens** da sua máquina
   - Você deve ver **preview das imagens** (miniaturas)

5. Clique em **"💾 Salvar Imóvel"**

**Esperado**:
- Toast verde dizendo: `"Imóvel cadastrado com sucesso! ✓"`
- As imagens devem ser enviadas para o backend
- O imóvel aparece na tabela com as fotos exibidas

**Se der erro**:
- Verifique se o backend está rodando em `localhost:8080`
- Verifique se o PostgreSQL está rodando
- Abra o console do navegador (F12 → Console) e procure por erros de rede

---

## 👤 Passo 3: Testar Upload de Corretor

1. Acesse: `http://localhost:5500/admin/corretores.html`
2. Clique em: **"+ Novo Corretor"**
3. Preencha os campos obrigatórios:
   - **Nome Completo**: `João Silva`
   - **CRECI**: `CRECI-SP 123456`

4. Vá para a seção **"Foto do Corretor"**:
   - Clique em **"Selecione uma imagem"**
   - Escolha **1 imagem** da sua máquina
   - Você deve ver **preview da imagem**

5. Clique em **"💾 Salvar"**

**Esperado**:
- Toast verde: `"Corretor cadastrado! ✓"`
- A foto é enviada para o backend
- O corretor aparece na tabela com a foto exibida

---

## 📋 Passo 4: Testar Listagem no Site Público

1. Acesse a página pública: `http://localhost:5500/imoveis.html`
2. Deve listar o imóvel que você criou com as fotos
3. Clique no imóvel para ver detalhes: `http://localhost:5500/imovel-detalhe.html?id=X`

**Esperado**:
- Fotos do imóvel carregam corretamente
- Corretor aparece com sua foto

---

## 🔍 Troubleshooting

### ❌ "Erro ao salvar: Erro 401" ou "Não autorizado"
- O JWT expirou ou está inválido
- Solução: Faça login novamente

### ❌ "Erro ao enviar [arquivo.jpg]"
- O backend não está recebendo o arquivo
- Verifique se `localhost:8080` está acessível:
  ```bash
  curl http://localhost:8080/api/imoveis
  ```

### ❌ "Erro ao carregar imóveis" na tabela
- O backend está offline
- Verifique: `./gradlew bootRun` está rodando?

### ❌ "Connection refused" / Não consegue conectar
- PostgreSQL não está rodando
- Execute: `docker compose up -d`

---

## 📊 Verificações Técnicas

### Verificar PostgreSQL
```bash
docker ps
# Deve mostrar um container "postgres" rodando na porta 5432
```

### Verificar Backend (via curl)
```bash
# Sem autenticação (deve funcionar)
curl http://localhost:8080/api/imoveis?size=10

# Com autenticação
curl -H "Authorization: Bearer SEU_JWT_TOKEN" http://localhost:8080/api/leads
```

### Verificar Arquivos Salvos
```bash
ls -la C:\Projetos\imobiliaria\imobiliaria-backend\Imobliaria\uploads\
# Deve conter os arquivos de imagem enviados
```

---

## 🎯 Resumo da Integração

| Componente | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ Running | `http://localhost:5500` |
| Backend | ✅ Running | `http://localhost:8080` |
| PostgreSQL | ✅ Running | `localhost:5432` |
| Admin | ✅ Autenticado | `/admin/imoveis.html` |
| Upload | ✅ Funcional | `POST /api/upload` |
| Imóveis | ✅ CRUD | `GET/POST/PUT/DELETE /api/imoveis` |
| Corretores | ✅ CRUD | `GET/POST/PUT/DELETE /api/corretores` |
| Leads | ✅ CRUD | `GET/POST/PUT /api/leads` |

---

## 🚀 Próximos Passos

- [ ] Testar filtros de imóveis (`/imoveis.html?finalidade=venda`)
- [ ] Testar criação de leads via formulário de contato
- [ ] Testar edição de imóveis e corretores
- [ ] Testar exclusão de registros
- [ ] Testar paginação de imóveis
- [ ] Testar responsividade em mobile

---

**Dúvidas?** Verifique os logs do backend: `./gradlew bootRun` mostra errors em tempo real.
