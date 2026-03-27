# 🐳 Docker Setup — Imobiliária

## Início Rápido

### 1️⃣ Iniciar Docker Compose

```bash
cd C:\Projetos\imobiliaria\imobiliaria-backend\Imobliaria
docker compose up -d
```

**Esperado:**
```
✓ Creating network "imobliaria_imobiliaria-network"
✓ Creating imobiliaria-postgres ... done
✓ Creating imobiliaria-pgadmin ... done
```

### 2️⃣ Acessar os Serviços

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **PostgreSQL** | `localhost:5432` | `myuser` / `secret` |
| **pgAdmin** | `http://localhost:5050` | `admin@admin.com` / `admin` |

### 3️⃣ Parar Docker

```bash
docker compose down
```

---

## ✨ O que foi configurado?

### ✅ PostgreSQL
- **Banco**: `mydatabase`
- **Usuário**: `myuser`
- **Senha**: `secret`
- **Porta**: `5432`
- **Volume**: `postgres_data` (dados persistem após stop/start)

### ✅ pgAdmin
- **Banco de dados pré-configurado** — não precisa registrar manualmente!
- **Usuário**: `admin@admin.com`
- **Senha**: `admin`
- **Porta**: `5050`
- **Volume**: `pgadmin_data` (preferências persistem)

### ✅ Rede Interna
- Containers comunicam-se por nome: `postgres` em vez de IP
- Backend conecta em: `jdbc:postgresql://postgres:5432/mydatabase`

---

## 🔄 Conectar Backend ao PostgreSQL

Seu `application.properties` deve ter:

```properties
spring.datasource.url=jdbc:postgresql://postgres:5432/mydatabase
spring.datasource.username=myuser
spring.datasource.password=secret
```

**Nota**: Use `postgres` como hostname (nome do container), não `localhost`.

---

## 📊 Usar pgAdmin

1. Acesse `http://localhost:5050`
2. Login: `admin@admin.com` / `admin`
3. Expanda: **Servers** → **imobiliaria-postgres**
4. Expanda: **Databases** → **mydatabase** → **Schemas** → **public**
5. Veja suas tabelas (imoveis, corretores, leads, etc)

**Sem necessidade de configuração manual!** ✨

---

## 🛠️ Troubleshooting

### Erro: "Connection refused"
```bash
docker ps
# Verifique se os containers estão rodando
```

### Erro: "pgAdmin não carrega o servidor"
```bash
docker logs imobiliaria-pgadmin
# Verifique os logs
```

### Resetar tudo
```bash
docker compose down -v
# Remove containers, networks E volumes
docker compose up -d
# Inicia limpo
```

### Ver dados do PostgreSQL sem pgAdmin
```bash
docker exec -it imobiliaria-postgres psql -U myuser -d mydatabase -c "SELECT * FROM imoveis;"
```

---

## 📁 Arquivos Importantes

- `compose.yaml` — Configuração dos containers
- `pgadmin_servers.json` — Configuração automática do pgAdmin
- `application.properties` — Configuração do Spring Boot

---

**Pronto!** 🚀 Agora você não precisa configurar o servidor no pgAdmin toda vez!
