# Backend Imobiliária — Design Spec

**Data:** 2026-03-26
**Status:** Aprovado

---

## Contexto

O projeto é uma aplicação de gestão imobiliária composta por:
- **Frontend:** site estático em HTML/CSS/JS puro com dados em `localStorage`
- **Backend:** esqueleto Spring Boot 4.0.5 sem entidades ou endpoints

O objetivo é implementar a API REST completa que o frontend passará a consumir, substituindo o `localStorage`.

---

## Decisões Técnicas

| Decisão | Escolha |
|---|---|
| Autenticação | JWT (stateless) |
| Upload de fotos | Armazenamento local (`uploads/`) |
| Filtragem/Paginação | Backend (parâmetros de query) |
| Ambiente | Frontend em `localhost:5500`, backend em `localhost:8080` |
| Arquitetura | Controller → Service → Repository (camadas clássicas) |

---

## Stack

- Spring Boot 4.0.5
- Spring MVC (REST)
- Spring Data JPA
- Spring Security
- PostgreSQL (via Docker Compose)
- Lombok
- JJWT (io.jsonwebtoken) — adicionado ao build.gradle
- Java 17

---

## Estrutura de Pacotes

```
com.rafadev.imobliaria/
├── config/
│   ├── SecurityConfig.java       # Spring Security + JWT filter
│   ├── CorsConfig.java           # CORS para localhost:5500
│   └── JwtConfig.java            # segredo, expiração
├── controller/
│   ├── AuthController.java       # POST /api/auth/login
│   ├── ImovelController.java     # /api/imoveis
│   ├── CorretorController.java   # /api/corretores
│   ├── LeadController.java       # /api/leads
│   └── UploadController.java     # POST /api/upload
├── service/
│   ├── AuthService.java
│   ├── ImovelService.java
│   ├── CorretorService.java
│   └── LeadService.java
├── repository/
│   ├── ImovelRepository.java
│   ├── CorretorRepository.java
│   └── LeadRepository.java
├── entity/
│   ├── Imovel.java
│   ├── Corretor.java
│   └── Lead.java
├── dto/
│   ├── request/
│   │   ├── ImovelRequest.java
│   │   ├── CorretorRequest.java
│   │   ├── LeadRequest.java
│   │   └── LoginRequest.java
│   └── response/
│       ├── ImovelResponse.java
│       ├── CorretorResponse.java
│       ├── LeadResponse.java
│       ├── LoginResponse.java
│       └── PageResponse.java
└── ImobliariaApplication.java
```

---

## Entidades

### Imovel

| Campo | Tipo Java | Coluna |
|---|---|---|
| id | Long | id (PK, auto) |
| titulo | String | titulo |
| tipo | TipoImovel (enum) | tipo |
| finalidade | Finalidade (enum) | finalidade |
| preco | BigDecimal | preco |
| area | Double | area |
| quartos | Integer | quartos |
| banheiros | Integer | banheiros |
| vagas | Integer | vagas |
| bairro | String | bairro |
| cidade | String | cidade |
| estado | String | estado |
| cep | String | cep |
| endereco | String | endereco |
| descricao | String (TEXT) | descricao |
| destaque | boolean | destaque |
| fotos | List\<String\> | tabela `imovel_fotos` (@ElementCollection) |
| corretor | Corretor | corretor_id (FK) |
| criadoEm | LocalDateTime | criado_em |
| atualizadoEm | LocalDateTime | atualizado_em |

**Enum TipoImovel:** `APARTAMENTO`, `CASA`, `COBERTURA`, `STUDIO`, `SALA_COMERCIAL`, `TERRENO`, `GALPAO`
**Enum Finalidade:** `VENDA`, `ALUGUEL`

### Corretor

| Campo | Tipo Java | Coluna |
|---|---|---|
| id | Long | id (PK, auto) |
| nome | String | nome |
| creci | String | creci |
| telefone | String | telefone |
| email | String | email |
| especialidade | String | especialidade |
| foto | String | foto (URL do arquivo) |
| bio | String (TEXT) | bio |
| criadoEm | LocalDateTime | criado_em |
| atualizadoEm | LocalDateTime | atualizado_em |

### Lead

| Campo | Tipo Java | Coluna |
|---|---|---|
| id | Long | id (PK, auto) |
| nome | String | nome |
| email | String | email |
| telefone | String | telefone |
| interesse | InteresseLead (enum) | interesse |
| mensagem | String (TEXT) | mensagem |
| status | StatusLead (enum) | status |
| origem | String | origem |
| criadoEm | LocalDateTime | criado_em |
| atualizadoEm | LocalDateTime | atualizado_em |

**Enum InteresseLead:** `COMPRA`, `LOCACAO`, `VENDA`
**Enum StatusLead:** `NOVO`, `EM_CONTATO`, `NEGOCIANDO`, `FECHADO`

---

## Endpoints da API

### Auth
```
POST /api/auth/login
  Body: { "usuario": "admin", "senha": "admin123" }
  Response: { "token": "...", "tipo": "Bearer" }
```

### Imóveis
```
GET    /api/imoveis
  Params: finalidade, tipo, precoMin, precoMax, quartos, bairro, cidade, destaque, search, sort, page, size
  Response: PageResponse<ImovelResponse>

GET    /api/imoveis/{id}
  Response: ImovelResponse

POST   /api/imoveis              [JWT]
  Body: ImovelRequest
  Response: ImovelResponse (201)

PUT    /api/imoveis/{id}         [JWT]
  Body: ImovelRequest
  Response: ImovelResponse

DELETE /api/imoveis/{id}         [JWT]
  Response: 204 No Content
```

### Corretores
```
GET    /api/corretores
  Response: List<CorretorResponse>

GET    /api/corretores/{id}
  Response: CorretorResponse

POST   /api/corretores           [JWT]
  Body: CorretorRequest
  Response: CorretorResponse (201)

PUT    /api/corretores/{id}      [JWT]
  Body: CorretorRequest
  Response: CorretorResponse

DELETE /api/corretores/{id}      [JWT]
  Response: 204 No Content
```

### Leads
```
POST   /api/leads                [público]
  Body: LeadRequest
  Response: LeadResponse (201)

GET    /api/leads                [JWT]
  Params: status
  Response: List<LeadResponse>

PUT    /api/leads/{id}/status    [JWT]
  Body: { "status": "EM_CONTATO" }
  Response: LeadResponse
```

### Upload / Arquivos
```
POST   /api/upload               [JWT]
  Body: multipart/form-data, field "file"
  Response: { "url": "/api/files/uuid_filename.jpg" }

GET    /api/files/{filename}     [público]
  Response: arquivo binário
```

---

## Segurança

### JWT
- Biblioteca: `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson` (v0.12.x)
- Propriedades: `jwt.secret` (Base64, mínimo 256 bits), `jwt.expiration=86400000` (24h)
- `JwtAuthFilter extends OncePerRequestFilter` — extrai token do header `Authorization: Bearer <token>`, valida, injeta `UsernamePasswordAuthenticationToken` no `SecurityContextHolder`

### Rotas públicas (sem JWT)
- `GET /api/imoveis/**`
- `GET /api/corretores/**`
- `POST /api/leads`
- `GET /api/files/**`
- `POST /api/auth/login`

### Rotas protegidas (requerem JWT)
- Tudo mais: `POST/PUT/DELETE /api/imoveis`, `POST/PUT/DELETE /api/corretores`, `GET/PUT /api/leads`, `POST /api/upload`

### Credenciais admin
- Armazenadas em `application.properties`: `admin.username=admin`, `admin.password=admin123`
- Validadas no `AuthService` sem tabela de usuário no banco (pode ser evoluído depois)

---

## CORS

```java
origins: "http://localhost:5500", "http://127.0.0.1:5500"
methods: GET, POST, PUT, DELETE, OPTIONS
headers: Authorization, Content-Type
allowCredentials: false
```

---

## Configuração

### application.properties
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydatabase
spring.datasource.username=myuser
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

jwt.secret=<base64-encoded-secret-256bits>
jwt.expiration=86400000

admin.username=admin
admin.password=admin123

upload.dir=uploads/

server.port=8080
```

### compose.yaml (ajuste)
Porta do PostgreSQL exposta como `5432:5432` (host:container).

### build.gradle (adições)
```groovy
// JJWT
implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
runtimeOnly    'io.jsonwebtoken:jjwt-impl:0.12.6'
runtimeOnly    'io.jsonwebtoken:jjwt-jackson:0.12.6'
```

---

## Upload de Arquivos

- Diretório configurável via `upload.dir` em `application.properties`
- Nome do arquivo: `UUID + extensão original` (evita colisões)
- Tamanho máximo: 10MB por arquivo
- Tipos aceitos: jpeg, png, webp, gif
- `UploadController` usa `MultipartFile`, salva com `Files.copy()`
- `GET /api/files/{filename}` serve o arquivo com `Resource` + `Content-Type` detectado

---

## Tratamento de Erros

Classe `GlobalExceptionHandler` com `@RestControllerAdvice`:

| Exceção | HTTP Status |
|---|---|
| `EntityNotFoundException` | 404 Not Found |
| `MethodArgumentNotValidException` | 400 Bad Request (campos inválidos) |
| `AccessDeniedException` | 403 Forbidden |
| `AuthenticationException` | 401 Unauthorized |
| Exceções genéricas | 500 Internal Server Error |

Resposta padrão de erro:
```json
{
  "status": 400,
  "erro": "Requisição inválida",
  "mensagem": "O campo 'titulo' é obrigatório",
  "timestamp": "2026-03-26T10:00:00"
}
```

---

## Testes

- `ImobliariaApplicationTests` já existe — verificar que o contexto Spring sobe corretamente
- Testes de integração para os services principais com banco H2 em memória (`test` profile)
- Não implementar testes unitários com mocks para este escopo inicial

---

## Fora do Escopo

- Múltiplos usuários admin com tabela no banco
- Envio de e-mail para novos leads
- Geração de relatórios
- Cache
- Deploy / containerização do backend
