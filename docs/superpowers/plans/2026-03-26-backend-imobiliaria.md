# Backend Imobiliária — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete Spring Boot REST API for the real estate management site, replacing the frontend's localStorage data layer.

**Architecture:** Layered architecture (Controller → Service → Repository) with Spring Security + JWT for admin authentication. Public endpoints (GET) are unauthenticated; write operations (POST/PUT/DELETE) require a Bearer token obtained via `/api/auth/login`.

**Tech Stack:** Spring Boot 4.0.5, Spring MVC, Spring Data JPA, Spring Security, PostgreSQL (Docker), Lombok, JJWT 0.12.6, Java 17

---

## File Map

All Java files live under:
`imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/`

All test files live under:
`imobiliaria-backend/Imobliaria/src/test/java/com/rafadev/imobliaria/`

Resources: `imobiliaria-backend/Imobliaria/src/main/resources/`
Test resources: `imobiliaria-backend/Imobliaria/src/test/resources/`

```
Files to create:
├── build.gradle                                         MODIFY
├── compose.yaml                                         MODIFY
├── src/main/resources/application.properties            CREATE
├── src/test/resources/application-test.properties       CREATE
├── entity/enums/TipoImovel.java                         CREATE
├── entity/enums/Finalidade.java                         CREATE
├── entity/enums/InteresseLead.java                      CREATE
├── entity/enums/StatusLead.java                         CREATE
├── entity/Corretor.java                                 CREATE
├── entity/Imovel.java                                   CREATE
├── entity/Lead.java                                     CREATE
├── repository/CorretorRepository.java                   CREATE
├── repository/ImovelRepository.java                     CREATE
├── repository/LeadRepository.java                       CREATE
├── dto/request/LoginRequest.java                        CREATE
├── dto/request/CorretorRequest.java                     CREATE
├── dto/request/ImovelRequest.java                       CREATE
├── dto/request/LeadRequest.java                         CREATE
├── dto/request/AtualizarStatusLeadRequest.java          CREATE
├── dto/response/LoginResponse.java                      CREATE
├── dto/response/CorretorResumoResponse.java             CREATE
├── dto/response/CorretorResponse.java                   CREATE
├── dto/response/ImovelResponse.java                     CREATE
├── dto/response/LeadResponse.java                       CREATE
├── dto/response/UploadResponse.java                     CREATE
├── dto/response/ErroResponse.java                       CREATE
├── dto/response/PageResponse.java                       CREATE
├── exception/EntityNotFoundException.java               CREATE
├── exception/GlobalExceptionHandler.java                CREATE
├── config/JwtConfig.java                                CREATE
├── security/JwtUtil.java                                CREATE
├── security/JwtAuthFilter.java                          CREATE
├── config/SecurityConfig.java                           CREATE
├── service/AuthService.java                             CREATE
├── controller/AuthController.java                       CREATE
├── service/CorretorService.java                         CREATE
├── controller/CorretorController.java                   CREATE
├── repository/ImovelSpec.java                           CREATE
├── service/ImovelService.java                           CREATE
├── controller/ImovelController.java                     CREATE
├── service/LeadService.java                             CREATE
├── controller/LeadController.java                       CREATE
├── controller/UploadController.java                     CREATE
└── test/...ServiceTest.java (4 test files)              CREATE
```

---

### Task 1: Configuração inicial

**Files:**
- Modify: `imobiliaria-backend/Imobliaria/build.gradle`
- Modify: `imobiliaria-backend/Imobliaria/compose.yaml`
- Create: `imobiliaria-backend/Imobliaria/src/main/resources/application.properties`
- Create: `imobiliaria-backend/Imobliaria/src/test/resources/application-test.properties`

- [ ] **Step 1: Substituir build.gradle**

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '4.0.5'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.rafadev'
version = '0.0.1-SNAPSHOT'
description = 'Imobliaria'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-webmvc'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
    runtimeOnly    'io.jsonwebtoken:jjwt-impl:0.12.6'
    runtimeOnly    'io.jsonwebtoken:jjwt-jackson:0.12.6'

    compileOnly 'org.projectlombok:lombok'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    runtimeOnly 'org.postgresql:postgresql'
    annotationProcessor 'org.projectlombok:lombok'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testRuntimeOnly 'com.h2database:h2'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

- [ ] **Step 2: Corrigir compose.yaml para expor porta 5432**

```yaml
services:
  postgres:
    image: 'postgres:latest'
    environment:
      - 'POSTGRES_DB=mydatabase'
      - 'POSTGRES_PASSWORD=secret'
      - 'POSTGRES_USER=myuser'
    ports:
      - '5432:5432'
```

- [ ] **Step 3: Criar application.properties**

Criar `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydatabase
spring.datasource.username=myuser
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

jwt.secret=dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBqd3QgdG9rZW5z
jwt.expiration=86400000

admin.username=admin
admin.password=admin123

upload.dir=uploads/

server.port=8080
```

> Nota: o `jwt.secret` acima é uma string Base64 de 64 bytes (512 bits) gerada para este projeto. Pode ser substituído por outro segredo Base64 com mínimo 32 bytes.

- [ ] **Step 4: Criar application-test.properties**

Criar `src/test/resources/application-test.properties`:

```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop

jwt.secret=dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBqd3QgdG9rZW5z
jwt.expiration=86400000

admin.username=admin
admin.password=admin123

upload.dir=uploads-test/
```

- [ ] **Step 5: Verificar que o Gradle resolve as dependências**

```bash
cd imobiliaria-backend/Imobliaria
./gradlew dependencies --configuration compileClasspath
```

Esperado: sem erros de resolução. As dependências `jjwt-api`, `spring-boot-starter-security`, e `spring-boot-starter-validation` devem aparecer na árvore.

- [ ] **Step 6: Commit**

```bash
git add imobiliaria-backend/Imobliaria/build.gradle
git add imobiliaria-backend/Imobliaria/compose.yaml
git add imobiliaria-backend/Imobliaria/src/main/resources/application.properties
git add imobiliaria-backend/Imobliaria/src/test/resources/application-test.properties
git commit -m "chore: add security, JWT, validation deps; configure application.properties"
```

---

### Task 2: Enums

**Files:**
- Create: `entity/enums/TipoImovel.java`
- Create: `entity/enums/Finalidade.java`
- Create: `entity/enums/InteresseLead.java`
- Create: `entity/enums/StatusLead.java`

- [ ] **Step 1: Criar TipoImovel.java**

```java
package com.rafadev.imobliaria.entity.enums;

public enum TipoImovel {
    APARTAMENTO,
    CASA,
    COBERTURA,
    STUDIO,
    SALA_COMERCIAL,
    TERRENO,
    GALPAO
}
```

- [ ] **Step 2: Criar Finalidade.java**

```java
package com.rafadev.imobliaria.entity.enums;

public enum Finalidade {
    VENDA,
    ALUGUEL
}
```

- [ ] **Step 3: Criar InteresseLead.java**

```java
package com.rafadev.imobliaria.entity.enums;

public enum InteresseLead {
    COMPRA,
    LOCACAO,
    VENDA
}
```

- [ ] **Step 4: Criar StatusLead.java**

```java
package com.rafadev.imobliaria.entity.enums;

public enum StatusLead {
    NOVO,
    EM_CONTATO,
    NEGOCIANDO,
    FECHADO
}
```

- [ ] **Step 5: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/entity/enums/
git commit -m "feat: add domain enums (TipoImovel, Finalidade, InteresseLead, StatusLead)"
```

---

### Task 3: Entidades JPA

**Files:**
- Create: `entity/Corretor.java`
- Create: `entity/Imovel.java`
- Create: `entity/Lead.java`

- [ ] **Step 1: Criar Corretor.java**

```java
package com.rafadev.imobliaria.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "corretores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Corretor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String creci;

    private String telefone;

    @Column(nullable = false, unique = true)
    private String email;

    private String especialidade;

    private String foto;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
```

- [ ] **Step 2: Criar Imovel.java**

```java
package com.rafadev.imobliaria.entity;

import com.rafadev.imobliaria.entity.enums.Finalidade;
import com.rafadev.imobliaria.entity.enums.TipoImovel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "imoveis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Imovel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoImovel tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Finalidade finalidade;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal preco;

    private Double area;

    private Integer quartos;

    private Integer banheiros;

    private Integer vagas;

    private String bairro;

    private String cidade;

    private String estado;

    private String cep;

    private String endereco;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false)
    private boolean destaque = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "imovel_fotos", joinColumns = @JoinColumn(name = "imovel_id"))
    @Column(name = "foto_url")
    @Builder.Default
    private List<String> fotos = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "corretor_id")
    private Corretor corretor;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
```

- [ ] **Step 3: Criar Lead.java**

```java
package com.rafadev.imobliaria.entity;

import com.rafadev.imobliaria.entity.enums.InteresseLead;
import com.rafadev.imobliaria.entity.enums.StatusLead;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String email;

    private String telefone;

    @Enumerated(EnumType.STRING)
    private InteresseLead interesse;

    @Column(columnDefinition = "TEXT")
    private String mensagem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatusLead status = StatusLead.NOVO;

    private String origem;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
```

- [ ] **Step 4: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/entity/
git commit -m "feat: add JPA entities Corretor, Imovel, Lead"
```

---

### Task 4: Repositórios

**Files:**
- Create: `repository/CorretorRepository.java`
- Create: `repository/ImovelRepository.java`
- Create: `repository/LeadRepository.java`

- [ ] **Step 1: Criar CorretorRepository.java**

```java
package com.rafadev.imobliaria.repository;

import com.rafadev.imobliaria.entity.Corretor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorretorRepository extends JpaRepository<Corretor, Long> {
}
```

- [ ] **Step 2: Criar ImovelRepository.java**

```java
package com.rafadev.imobliaria.repository;

import com.rafadev.imobliaria.entity.Imovel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ImovelRepository extends JpaRepository<Imovel, Long>, JpaSpecificationExecutor<Imovel> {
}
```

- [ ] **Step 3: Criar LeadRepository.java**

```java
package com.rafadev.imobliaria.repository;

import com.rafadev.imobliaria.entity.Lead;
import com.rafadev.imobliaria.entity.enums.StatusLead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByStatus(StatusLead status);
}
```

- [ ] **Step 4: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/repository/
git commit -m "feat: add JPA repositories"
```

---

### Task 5: DTOs

**Files:**
- Create: `dto/request/LoginRequest.java`
- Create: `dto/request/CorretorRequest.java`
- Create: `dto/request/ImovelRequest.java`
- Create: `dto/request/LeadRequest.java`
- Create: `dto/request/AtualizarStatusLeadRequest.java`
- Create: `dto/response/LoginResponse.java`
- Create: `dto/response/CorretorResumoResponse.java`
- Create: `dto/response/CorretorResponse.java`
- Create: `dto/response/ImovelResponse.java`
- Create: `dto/response/LeadResponse.java`
- Create: `dto/response/UploadResponse.java`
- Create: `dto/response/ErroResponse.java`
- Create: `dto/response/PageResponse.java`

- [ ] **Step 1: Criar DTOs de request**

`dto/request/LoginRequest.java`:
```java
package com.rafadev.imobliaria.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String usuario;
    @NotBlank
    private String senha;
}
```

`dto/request/CorretorRequest.java`:
```java
package com.rafadev.imobliaria.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CorretorRequest {
    @NotBlank
    private String nome;
    @NotBlank
    private String creci;
    private String telefone;
    @NotBlank
    @Email
    private String email;
    private String especialidade;
    private String foto;
    private String bio;
}
```

`dto/request/ImovelRequest.java`:
```java
package com.rafadev.imobliaria.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ImovelRequest {
    @NotBlank
    private String titulo;
    @NotBlank
    private String tipo;
    @NotBlank
    private String finalidade;
    @NotNull
    @Positive
    private BigDecimal preco;
    private Double area;
    private Integer quartos;
    private Integer banheiros;
    private Integer vagas;
    private String bairro;
    private String cidade;
    private String estado;
    private String cep;
    private String endereco;
    private String descricao;
    private boolean destaque = false;
    private List<String> fotos;
    private Long corretorId;
}
```

`dto/request/LeadRequest.java`:
```java
package com.rafadev.imobliaria.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeadRequest {
    @NotBlank
    private String nome;
    @NotBlank
    @Email
    private String email;
    private String telefone;
    private String interesse;
    private String mensagem;
    private String origem;
}
```

`dto/request/AtualizarStatusLeadRequest.java`:
```java
package com.rafadev.imobliaria.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AtualizarStatusLeadRequest {
    @NotBlank
    private String status;
}
```

- [ ] **Step 2: Criar DTOs de response**

`dto/response/LoginResponse.java`:
```java
package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tipo;
}
```

`dto/response/CorretorResumoResponse.java`:
```java
package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorretorResumoResponse {
    private Long id;
    private String nome;
    private String creci;
    private String foto;
}
```

`dto/response/CorretorResponse.java`:
```java
package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorretorResponse {
    private Long id;
    private String nome;
    private String creci;
    private String telefone;
    private String email;
    private String especialidade;
    private String foto;
    private String bio;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
```

`dto/response/ImovelResponse.java`:
```java
package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImovelResponse {
    private Long id;
    private String titulo;
    private String tipo;
    private String finalidade;
    private BigDecimal preco;
    private Double area;
    private Integer quartos;
    private Integer banheiros;
    private Integer vagas;
    private String bairro;
    private String cidade;
    private String estado;
    private String cep;
    private String endereco;
    private String descricao;
    private boolean destaque;
    private List<String> fotos;
    private CorretorResumoResponse corretor;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
```

`dto/response/LeadResponse.java`:
```java
package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadResponse {
    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private String interesse;
    private String mensagem;
    private String status;
    private String origem;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
```

`dto/response/UploadResponse.java`:
```java
package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UploadResponse {
    private String url;
}
```

`dto/response/ErroResponse.java`:
```java
package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErroResponse {
    private int status;
    private String erro;
    private String mensagem;
    private LocalDateTime timestamp;
}
```

`dto/response/PageResponse.java`:
```java
package com.rafadev.imobliaria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> conteudo;
    private int pagina;
    private int tamanhoPagina;
    private long totalElementos;
    private int totalPaginas;
    private boolean ultima;
}
```

- [ ] **Step 3: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/dto/
git commit -m "feat: add request and response DTOs"
```

---

### Task 6: Tratamento de Erros Global

**Files:**
- Create: `exception/EntityNotFoundException.java`
- Create: `exception/GlobalExceptionHandler.java`

- [ ] **Step 1: Criar EntityNotFoundException.java**

```java
package com.rafadev.imobliaria.exception;

public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }
}
```

- [ ] **Step 2: Criar GlobalExceptionHandler.java**

```java
package com.rafadev.imobliaria.exception;

import com.rafadev.imobliaria.dto.response.ErroResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErroResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErroResponse(404, "Não encontrado", ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> handleValidation(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErroResponse(400, "Requisição inválida", mensagem, LocalDateTime.now()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErroResponse(401, "Não autorizado", ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErroResponse(403, "Acesso negado", ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErroResponse(400, "Requisição inválida", ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErroResponse(500, "Erro interno", "Ocorreu um erro inesperado", LocalDateTime.now()));
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/exception/
git commit -m "feat: add global exception handler"
```

---

### Task 7: JWT — JwtConfig, JwtUtil, JwtAuthFilter

**Files:**
- Create: `config/JwtConfig.java`
- Create: `security/JwtUtil.java`
- Create: `security/JwtAuthFilter.java`

- [ ] **Step 1: Criar JwtConfig.java**

```java
package com.rafadev.imobliaria.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    private String secret;
    private long expiration;
}
```

- [ ] **Step 2: Criar JwtUtil.java**

```java
package com.rafadev.imobliaria.security;

import com.rafadev.imobliaria.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtConfig jwtConfig;

    public String gerarToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getExpiration()))
                .signWith(getSignKey())
                .compact();
    }

    public String extrairUsername(String token) {
        return getClaims(token).getSubject();
    }

    public boolean validarToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

- [ ] **Step 3: Criar JwtAuthFilter.java**

```java
package com.rafadev.imobliaria.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validarToken(token)) {
                String username = jwtUtil.extrairUsername(token);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        username, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/config/JwtConfig.java
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/security/
git commit -m "feat: add JWT config, util, and auth filter"
```

---

### Task 8: Spring Security — SecurityConfig

**Files:**
- Create: `config/SecurityConfig.java`

- [ ] **Step 1: Criar SecurityConfig.java**

```java
package com.rafadev.imobliaria.config;

import com.rafadev.imobliaria.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET,  "/api/imoveis/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/corretores/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/leads").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/files/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5500", "http://127.0.0.1:5500"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/config/SecurityConfig.java
git commit -m "feat: configure Spring Security with JWT filter and CORS"
```

---

### Task 9: Auth — AuthService, AuthController + Teste

**Files:**
- Create: `service/AuthService.java`
- Create: `controller/AuthController.java`
- Create: `test/.../AuthServiceTest.java`

- [ ] **Step 1: Escrever teste falho**

Criar `src/test/java/com/rafadev/imobliaria/AuthServiceTest.java`:

```java
package com.rafadev.imobliaria;

import com.rafadev.imobliaria.dto.request.LoginRequest;
import com.rafadev.imobliaria.dto.response.LoginResponse;
import com.rafadev.imobliaria.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    void loginComCredenciaisCorretasRetornaToken() {
        LoginRequest request = new LoginRequest();
        request.setUsuario("admin");
        request.setSenha("admin123");

        LoginResponse response = authService.login(request);

        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getTipo()).isEqualTo("Bearer");
    }

    @Test
    void loginComCredenciaisErradasLancaExcecao() {
        LoginRequest request = new LoginRequest();
        request.setUsuario("admin");
        request.setSenha("errada");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }
}
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
cd imobiliaria-backend/Imobliaria
./gradlew test --tests "com.rafadev.imobliaria.AuthServiceTest" 2>&1 | tail -20
```

Esperado: FAIL — `AuthService` não existe ainda.

- [ ] **Step 3: Criar AuthService.java**

```java
package com.rafadev.imobliaria.service;

import com.rafadev.imobliaria.dto.request.LoginRequest;
import com.rafadev.imobliaria.dto.response.LoginResponse;
import com.rafadev.imobliaria.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        if (!request.getUsuario().equals(adminUsername) || !request.getSenha().equals(adminPassword)) {
            throw new BadCredentialsException("Usuário ou senha inválidos");
        }
        String token = jwtUtil.gerarToken(request.getUsuario());
        return new LoginResponse(token, "Bearer");
    }
}
```

- [ ] **Step 4: Criar AuthController.java**

```java
package com.rafadev.imobliaria.controller;

import com.rafadev.imobliaria.dto.request.LoginRequest;
import com.rafadev.imobliaria.dto.response.LoginResponse;
import com.rafadev.imobliaria.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

```bash
./gradlew test --tests "com.rafadev.imobliaria.AuthServiceTest"
```

Esperado: BUILD SUCCESSFUL, 2 tests passed.

- [ ] **Step 6: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/service/AuthService.java
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/controller/AuthController.java
git add imobiliaria-backend/Imobliaria/src/test/java/com/rafadev/imobliaria/AuthServiceTest.java
git commit -m "feat: add auth service, controller, and tests"
```

---

### Task 10: Corretor CRUD — CorretorService, CorretorController + Teste

**Files:**
- Create: `service/CorretorService.java`
- Create: `controller/CorretorController.java`
- Create: `test/.../CorretorServiceTest.java`

- [ ] **Step 1: Escrever teste falho**

Criar `src/test/java/com/rafadev/imobliaria/CorretorServiceTest.java`:

```java
package com.rafadev.imobliaria;

import com.rafadev.imobliaria.dto.request.CorretorRequest;
import com.rafadev.imobliaria.dto.response.CorretorResponse;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.service.CorretorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CorretorServiceTest {

    @Autowired
    private CorretorService corretorService;

    private CorretorRequest novoCorretorRequest() {
        CorretorRequest req = new CorretorRequest();
        req.setNome("João Silva");
        req.setCreci("12345-SP");
        req.setEmail("joao@imob.com");
        req.setTelefone("11999990000");
        req.setEspecialidade("Residencial");
        req.setBio("Especialista em residências");
        return req;
    }

    @Test
    void criarCorretorRetornaCorretorComId() {
        CorretorResponse response = corretorService.criar(novoCorretorRequest());

        assertThat(response.getId()).isNotNull();
        assertThat(response.getNome()).isEqualTo("João Silva");
        assertThat(response.getCreci()).isEqualTo("12345-SP");
    }

    @Test
    void listarCorretoresRetornaLista() {
        corretorService.criar(novoCorretorRequest());
        List<CorretorResponse> lista = corretorService.listarTodos();
        assertThat(lista).hasSize(1);
    }

    @Test
    void buscarPorIdInexistentelancaExcecao() {
        assertThatThrownBy(() -> corretorService.buscarPorId(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void atualizarCorretorAlteraCampos() {
        CorretorResponse criado = corretorService.criar(novoCorretorRequest());
        CorretorRequest atualizacao = novoCorretorRequest();
        atualizacao.setNome("João Santos");

        CorretorResponse atualizado = corretorService.atualizar(criado.getId(), atualizacao);

        assertThat(atualizado.getNome()).isEqualTo("João Santos");
    }

    @Test
    void removerCorretorRemoveDoBanco() {
        CorretorResponse criado = corretorService.criar(novoCorretorRequest());
        corretorService.remover(criado.getId());

        assertThatThrownBy(() -> corretorService.buscarPorId(criado.getId()))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
./gradlew test --tests "com.rafadev.imobliaria.CorretorServiceTest" 2>&1 | tail -10
```

Esperado: FAIL — `CorretorService` não existe.

- [ ] **Step 3: Criar CorretorService.java**

```java
package com.rafadev.imobliaria.service;

import com.rafadev.imobliaria.dto.request.CorretorRequest;
import com.rafadev.imobliaria.dto.response.CorretorResponse;
import com.rafadev.imobliaria.entity.Corretor;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.repository.CorretorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CorretorService {

    private final CorretorRepository corretorRepository;

    public List<CorretorResponse> listarTodos() {
        return corretorRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CorretorResponse buscarPorId(Long id) {
        return toResponse(findById(id));
    }

    public CorretorResponse criar(CorretorRequest request) {
        Corretor corretor = Corretor.builder()
                .nome(request.getNome())
                .creci(request.getCreci())
                .telefone(request.getTelefone())
                .email(request.getEmail())
                .especialidade(request.getEspecialidade())
                .foto(request.getFoto())
                .bio(request.getBio())
                .build();
        return toResponse(corretorRepository.save(corretor));
    }

    public CorretorResponse atualizar(Long id, CorretorRequest request) {
        Corretor corretor = findById(id);
        corretor.setNome(request.getNome());
        corretor.setCreci(request.getCreci());
        corretor.setTelefone(request.getTelefone());
        corretor.setEmail(request.getEmail());
        corretor.setEspecialidade(request.getEspecialidade());
        corretor.setFoto(request.getFoto());
        corretor.setBio(request.getBio());
        return toResponse(corretorRepository.save(corretor));
    }

    public void remover(Long id) {
        findById(id);
        corretorRepository.deleteById(id);
    }

    private Corretor findById(Long id) {
        return corretorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Corretor não encontrado com id: " + id));
    }

    private CorretorResponse toResponse(Corretor c) {
        return CorretorResponse.builder()
                .id(c.getId())
                .nome(c.getNome())
                .creci(c.getCreci())
                .telefone(c.getTelefone())
                .email(c.getEmail())
                .especialidade(c.getEspecialidade())
                .foto(c.getFoto())
                .bio(c.getBio())
                .criadoEm(c.getCriadoEm())
                .atualizadoEm(c.getAtualizadoEm())
                .build();
    }
}
```

- [ ] **Step 4: Criar CorretorController.java**

```java
package com.rafadev.imobliaria.controller;

import com.rafadev.imobliaria.dto.request.CorretorRequest;
import com.rafadev.imobliaria.dto.response.CorretorResponse;
import com.rafadev.imobliaria.service.CorretorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/corretores")
@RequiredArgsConstructor
public class CorretorController {

    private final CorretorService corretorService;

    @GetMapping
    public ResponseEntity<List<CorretorResponse>> listar() {
        return ResponseEntity.ok(corretorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CorretorResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(corretorService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CorretorResponse> criar(@RequestBody @Valid CorretorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(corretorService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CorretorResponse> atualizar(@PathVariable Long id,
                                                       @RequestBody @Valid CorretorRequest request) {
        return ResponseEntity.ok(corretorService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        corretorService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

```bash
./gradlew test --tests "com.rafadev.imobliaria.CorretorServiceTest"
```

Esperado: BUILD SUCCESSFUL, 5 tests passed.

- [ ] **Step 6: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/service/CorretorService.java
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/controller/CorretorController.java
git add imobiliaria-backend/Imobliaria/src/test/java/com/rafadev/imobliaria/CorretorServiceTest.java
git commit -m "feat: add corretor CRUD service, controller, and tests"
```

---

### Task 11: Imóvel — ImovelSpec, ImovelService, ImovelController + Teste

**Files:**
- Create: `repository/ImovelSpec.java`
- Create: `service/ImovelService.java`
- Create: `controller/ImovelController.java`
- Create: `test/.../ImovelServiceTest.java`

- [ ] **Step 1: Escrever teste falho**

Criar `src/test/java/com/rafadev/imobliaria/ImovelServiceTest.java`:

```java
package com.rafadev.imobliaria;

import com.rafadev.imobliaria.dto.request.ImovelRequest;
import com.rafadev.imobliaria.dto.response.ImovelResponse;
import com.rafadev.imobliaria.dto.response.PageResponse;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.service.ImovelService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ImovelServiceTest {

    @Autowired
    private ImovelService imovelService;

    private ImovelRequest novoImovelRequest() {
        ImovelRequest req = new ImovelRequest();
        req.setTitulo("Apartamento no Centro");
        req.setTipo("APARTAMENTO");
        req.setFinalidade("VENDA");
        req.setPreco(new BigDecimal("450000"));
        req.setArea(80.0);
        req.setQuartos(3);
        req.setBanheiros(2);
        req.setVagas(1);
        req.setBairro("Centro");
        req.setCidade("São Paulo");
        req.setEstado("SP");
        req.setFotos(List.of("/api/files/foto1.jpg"));
        return req;
    }

    @Test
    void criarImovelRetornaImovelComId() {
        ImovelResponse response = imovelService.criar(novoImovelRequest());

        assertThat(response.getId()).isNotNull();
        assertThat(response.getTitulo()).isEqualTo("Apartamento no Centro");
        assertThat(response.getTipo()).isEqualTo("APARTAMENTO");
        assertThat(response.getFinalidade()).isEqualTo("VENDA");
    }

    @Test
    void listarComFiltroFinalidadeRetornaApenasVenda() {
        ImovelRequest venda = novoImovelRequest();
        venda.setFinalidade("VENDA");
        imovelService.criar(venda);

        ImovelRequest aluguel = novoImovelRequest();
        aluguel.setFinalidade("ALUGUEL");
        aluguel.setTitulo("Apartamento para Aluguel");
        imovelService.criar(aluguel);

        PageResponse<ImovelResponse> result = imovelService.listar(
                "VENDA", null, null, null, null, null, null, null, null, 0, 10, "criadoEm,desc");

        assertThat(result.getConteudo()).hasSize(1);
        assertThat(result.getConteudo().get(0).getFinalidade()).isEqualTo("VENDA");
    }

    @Test
    void buscarPorIdInexistenteLeancaExcecao() {
        assertThatThrownBy(() -> imovelService.buscarPorId(999L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void removerImovelRemoveDoBanco() {
        ImovelResponse criado = imovelService.criar(novoImovelRequest());
        imovelService.remover(criado.getId());

        assertThatThrownBy(() -> imovelService.buscarPorId(criado.getId()))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
./gradlew test --tests "com.rafadev.imobliaria.ImovelServiceTest" 2>&1 | tail -10
```

Esperado: FAIL — `ImovelService` não existe.

- [ ] **Step 3: Criar ImovelSpec.java**

```java
package com.rafadev.imobliaria.repository;

import com.rafadev.imobliaria.entity.Imovel;
import com.rafadev.imobliaria.entity.enums.Finalidade;
import com.rafadev.imobliaria.entity.enums.TipoImovel;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ImovelSpec {

    public static Specification<Imovel> build(
            Finalidade finalidade,
            TipoImovel tipo,
            BigDecimal precoMin,
            BigDecimal precoMax,
            Integer quartos,
            String bairro,
            String cidade,
            Boolean destaque,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (finalidade != null) {
                predicates.add(cb.equal(root.get("finalidade"), finalidade));
            }
            if (tipo != null) {
                predicates.add(cb.equal(root.get("tipo"), tipo));
            }
            if (precoMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("preco"), precoMin));
            }
            if (precoMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("preco"), precoMax));
            }
            if (quartos != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("quartos"), quartos));
            }
            if (bairro != null && !bairro.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("bairro")), "%" + bairro.toLowerCase() + "%"));
            }
            if (cidade != null && !cidade.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("cidade")), "%" + cidade.toLowerCase() + "%"));
            }
            if (destaque != null) {
                predicates.add(cb.equal(root.get("destaque"), destaque));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("titulo")), pattern),
                    cb.like(cb.lower(root.get("bairro")), pattern),
                    cb.like(cb.lower(root.get("cidade")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

- [ ] **Step 4: Criar ImovelService.java**

```java
package com.rafadev.imobliaria.service;

import com.rafadev.imobliaria.dto.request.ImovelRequest;
import com.rafadev.imobliaria.dto.response.CorretorResumoResponse;
import com.rafadev.imobliaria.dto.response.ImovelResponse;
import com.rafadev.imobliaria.dto.response.PageResponse;
import com.rafadev.imobliaria.entity.Corretor;
import com.rafadev.imobliaria.entity.Imovel;
import com.rafadev.imobliaria.entity.enums.Finalidade;
import com.rafadev.imobliaria.entity.enums.TipoImovel;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.repository.CorretorRepository;
import com.rafadev.imobliaria.repository.ImovelRepository;
import com.rafadev.imobliaria.repository.ImovelSpec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ImovelService {

    private final ImovelRepository imovelRepository;
    private final CorretorRepository corretorRepository;

    public PageResponse<ImovelResponse> listar(
            String finalidadeStr, String tipoStr,
            BigDecimal precoMin, BigDecimal precoMax,
            Integer quartos, String bairro, String cidade,
            Boolean destaque, String search,
            int page, int size, String sort) {

        Finalidade finalidade = parseEnum(Finalidade.class, finalidadeStr);
        TipoImovel tipo = parseEnum(TipoImovel.class, tipoStr);

        String[] sortParts = sort != null ? sort.split(",") : new String[]{"criadoEm", "desc"};
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<Imovel> resultPage = imovelRepository.findAll(
                ImovelSpec.build(finalidade, tipo, precoMin, precoMax, quartos, bairro, cidade, destaque, search),
                pageable);

        return new PageResponse<>(
                resultPage.getContent().stream().map(this::toResponse).toList(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isLast());
    }

    public ImovelResponse buscarPorId(Long id) {
        return toResponse(findById(id));
    }

    public ImovelResponse criar(ImovelRequest request) {
        Imovel imovel = buildFromRequest(new Imovel(), request);
        return toResponse(imovelRepository.save(imovel));
    }

    public ImovelResponse atualizar(Long id, ImovelRequest request) {
        Imovel imovel = buildFromRequest(findById(id), request);
        return toResponse(imovelRepository.save(imovel));
    }

    public void remover(Long id) {
        findById(id);
        imovelRepository.deleteById(id);
    }

    private Imovel buildFromRequest(Imovel imovel, ImovelRequest request) {
        imovel.setTitulo(request.getTitulo());
        imovel.setTipo(TipoImovel.valueOf(request.getTipo().toUpperCase()));
        imovel.setFinalidade(Finalidade.valueOf(request.getFinalidade().toUpperCase()));
        imovel.setPreco(request.getPreco());
        imovel.setArea(request.getArea());
        imovel.setQuartos(request.getQuartos());
        imovel.setBanheiros(request.getBanheiros());
        imovel.setVagas(request.getVagas());
        imovel.setBairro(request.getBairro());
        imovel.setCidade(request.getCidade());
        imovel.setEstado(request.getEstado());
        imovel.setCep(request.getCep());
        imovel.setEndereco(request.getEndereco());
        imovel.setDescricao(request.getDescricao());
        imovel.setDestaque(request.isDestaque());
        imovel.setFotos(request.getFotos() != null ? request.getFotos() : new ArrayList<>());

        if (request.getCorretorId() != null) {
            Corretor corretor = corretorRepository.findById(request.getCorretorId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Corretor não encontrado com id: " + request.getCorretorId()));
            imovel.setCorretor(corretor);
        } else {
            imovel.setCorretor(null);
        }

        return imovel;
    }

    private Imovel findById(Long id) {
        return imovelRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Imóvel não encontrado com id: " + id));
    }

    private ImovelResponse toResponse(Imovel imovel) {
        CorretorResumoResponse corretorResumo = null;
        if (imovel.getCorretor() != null) {
            corretorResumo = CorretorResumoResponse.builder()
                    .id(imovel.getCorretor().getId())
                    .nome(imovel.getCorretor().getNome())
                    .creci(imovel.getCorretor().getCreci())
                    .foto(imovel.getCorretor().getFoto())
                    .build();
        }
        return ImovelResponse.builder()
                .id(imovel.getId())
                .titulo(imovel.getTitulo())
                .tipo(imovel.getTipo().name())
                .finalidade(imovel.getFinalidade().name())
                .preco(imovel.getPreco())
                .area(imovel.getArea())
                .quartos(imovel.getQuartos())
                .banheiros(imovel.getBanheiros())
                .vagas(imovel.getVagas())
                .bairro(imovel.getBairro())
                .cidade(imovel.getCidade())
                .estado(imovel.getEstado())
                .cep(imovel.getCep())
                .endereco(imovel.getEndereco())
                .descricao(imovel.getDescricao())
                .destaque(imovel.isDestaque())
                .fotos(imovel.getFotos())
                .corretor(corretorResumo)
                .criadoEm(imovel.getCriadoEm())
                .atualizadoEm(imovel.getAtualizadoEm())
                .build();
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Valor inválido para " + enumClass.getSimpleName() + ": " + value);
        }
    }
}
```

- [ ] **Step 5: Criar ImovelController.java**

```java
package com.rafadev.imobliaria.controller;

import com.rafadev.imobliaria.dto.request.ImovelRequest;
import com.rafadev.imobliaria.dto.response.ImovelResponse;
import com.rafadev.imobliaria.dto.response.PageResponse;
import com.rafadev.imobliaria.service.ImovelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/imoveis")
@RequiredArgsConstructor
public class ImovelController {

    private final ImovelService imovelService;

    @GetMapping
    public ResponseEntity<PageResponse<ImovelResponse>> listar(
            @RequestParam(required = false) String finalidade,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @RequestParam(required = false) Integer quartos,
            @RequestParam(required = false) String bairro,
            @RequestParam(required = false) String cidade,
            @RequestParam(required = false) Boolean destaque,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "criadoEm,desc") String sort) {
        return ResponseEntity.ok(imovelService.listar(
                finalidade, tipo, precoMin, precoMax,
                quartos, bairro, cidade, destaque, search,
                page, size, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImovelResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(imovelService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ImovelResponse> criar(@RequestBody @Valid ImovelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(imovelService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImovelResponse> atualizar(@PathVariable Long id,
                                                      @RequestBody @Valid ImovelRequest request) {
        return ResponseEntity.ok(imovelService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        imovelService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 6: Rodar o teste e confirmar que passa**

```bash
./gradlew test --tests "com.rafadev.imobliaria.ImovelServiceTest"
```

Esperado: BUILD SUCCESSFUL, 4 tests passed.

- [ ] **Step 7: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/repository/ImovelSpec.java
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/service/ImovelService.java
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/controller/ImovelController.java
git add imobiliaria-backend/Imobliaria/src/test/java/com/rafadev/imobliaria/ImovelServiceTest.java
git commit -m "feat: add imovel CRUD with filtering, pagination, service, controller, and tests"
```

---

### Task 12: Lead — LeadService, LeadController + Teste

**Files:**
- Create: `service/LeadService.java`
- Create: `controller/LeadController.java`
- Create: `test/.../LeadServiceTest.java`

- [ ] **Step 1: Escrever teste falho**

Criar `src/test/java/com/rafadev/imobliaria/LeadServiceTest.java`:

```java
package com.rafadev.imobliaria;

import com.rafadev.imobliaria.dto.request.AtualizarStatusLeadRequest;
import com.rafadev.imobliaria.dto.request.LeadRequest;
import com.rafadev.imobliaria.dto.response.LeadResponse;
import com.rafadev.imobliaria.service.LeadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LeadServiceTest {

    @Autowired
    private LeadService leadService;

    private LeadRequest novoLeadRequest() {
        LeadRequest req = new LeadRequest();
        req.setNome("Maria Oliveira");
        req.setEmail("maria@email.com");
        req.setTelefone("11988887777");
        req.setInteresse("COMPRA");
        req.setMensagem("Interesse em apartamento de 3 quartos");
        req.setOrigem("formulario-contato");
        return req;
    }

    @Test
    void criarLeadDefinStatusNovo() {
        LeadResponse response = leadService.criar(novoLeadRequest());

        assertThat(response.getId()).isNotNull();
        assertThat(response.getNome()).isEqualTo("Maria Oliveira");
        assertThat(response.getStatus()).isEqualTo("NOVO");
    }

    @Test
    void listarTodosRetornaLeads() {
        leadService.criar(novoLeadRequest());
        List<LeadResponse> lista = leadService.listarTodos(null);
        assertThat(lista).hasSize(1);
    }

    @Test
    void listarPorStatusFiltraCorretamente() {
        leadService.criar(novoLeadRequest());
        List<LeadResponse> novos = leadService.listarTodos("NOVO");
        List<LeadResponse> fechados = leadService.listarTodos("FECHADO");
        assertThat(novos).hasSize(1);
        assertThat(fechados).isEmpty();
    }

    @Test
    void atualizarStatusAlteraStatusDoLead() {
        LeadResponse criado = leadService.criar(novoLeadRequest());
        AtualizarStatusLeadRequest statusReq = new AtualizarStatusLeadRequest();
        statusReq.setStatus("EM_CONTATO");

        LeadResponse atualizado = leadService.atualizarStatus(criado.getId(), statusReq);

        assertThat(atualizado.getStatus()).isEqualTo("EM_CONTATO");
    }
}
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
./gradlew test --tests "com.rafadev.imobliaria.LeadServiceTest" 2>&1 | tail -10
```

Esperado: FAIL — `LeadService` não existe.

- [ ] **Step 3: Criar LeadService.java**

```java
package com.rafadev.imobliaria.service;

import com.rafadev.imobliaria.dto.request.AtualizarStatusLeadRequest;
import com.rafadev.imobliaria.dto.request.LeadRequest;
import com.rafadev.imobliaria.dto.response.LeadResponse;
import com.rafadev.imobliaria.entity.Lead;
import com.rafadev.imobliaria.entity.enums.InteresseLead;
import com.rafadev.imobliaria.entity.enums.StatusLead;
import com.rafadev.imobliaria.exception.EntityNotFoundException;
import com.rafadev.imobliaria.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;

    public List<LeadResponse> listarTodos(String statusStr) {
        if (statusStr != null && !statusStr.isBlank()) {
            StatusLead status = StatusLead.valueOf(statusStr.toUpperCase());
            return leadRepository.findByStatus(status).stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        return leadRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public LeadResponse criar(LeadRequest request) {
        InteresseLead interesse = null;
        if (request.getInteresse() != null && !request.getInteresse().isBlank()) {
            try {
                interesse = InteresseLead.valueOf(request.getInteresse().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Interesse inválido: " + request.getInteresse());
            }
        }

        Lead lead = Lead.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .telefone(request.getTelefone())
                .interesse(interesse)
                .mensagem(request.getMensagem())
                .status(StatusLead.NOVO)
                .origem(request.getOrigem())
                .build();

        return toResponse(leadRepository.save(lead));
    }

    public LeadResponse atualizarStatus(Long id, AtualizarStatusLeadRequest request) {
        Lead lead = findById(id);
        try {
            lead.setStatus(StatusLead.valueOf(request.getStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status inválido: " + request.getStatus());
        }
        return toResponse(leadRepository.save(lead));
    }

    private Lead findById(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lead não encontrado com id: " + id));
    }

    private LeadResponse toResponse(Lead lead) {
        return LeadResponse.builder()
                .id(lead.getId())
                .nome(lead.getNome())
                .email(lead.getEmail())
                .telefone(lead.getTelefone())
                .interesse(lead.getInteresse() != null ? lead.getInteresse().name() : null)
                .mensagem(lead.getMensagem())
                .status(lead.getStatus().name())
                .origem(lead.getOrigem())
                .criadoEm(lead.getCriadoEm())
                .atualizadoEm(lead.getAtualizadoEm())
                .build();
    }
}
```

- [ ] **Step 4: Criar LeadController.java**

```java
package com.rafadev.imobliaria.controller;

import com.rafadev.imobliaria.dto.request.AtualizarStatusLeadRequest;
import com.rafadev.imobliaria.dto.request.LeadRequest;
import com.rafadev.imobliaria.dto.response.LeadResponse;
import com.rafadev.imobliaria.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @PostMapping
    public ResponseEntity<LeadResponse> criar(@RequestBody @Valid LeadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<LeadResponse>> listar(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(leadService.listarTodos(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LeadResponse> atualizarStatus(@PathVariable Long id,
                                                          @RequestBody @Valid AtualizarStatusLeadRequest request) {
        return ResponseEntity.ok(leadService.atualizarStatus(id, request));
    }
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

```bash
./gradlew test --tests "com.rafadev.imobliaria.LeadServiceTest"
```

Esperado: BUILD SUCCESSFUL, 4 tests passed.

- [ ] **Step 6: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/service/LeadService.java
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/controller/LeadController.java
git add imobiliaria-backend/Imobliaria/src/test/java/com/rafadev/imobliaria/LeadServiceTest.java
git commit -m "feat: add lead service, controller, and tests"
```

---

### Task 13: Upload de Arquivos — UploadController

**Files:**
- Create: `controller/UploadController.java`

- [ ] **Step 1: Criar UploadController.java**

```java
package com.rafadev.imobliaria.controller;

import com.rafadev.imobliaria.dto.response.UploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UploadController {

    private static final List<String> TIPOS_PERMITIDOS = List.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    @Value("${upload.dir}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !TIPOS_PERMITIDOS.contains(contentType)) {
            return ResponseEntity.badRequest().build();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = UUID.randomUUID() + extension;
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        return ResponseEntity.ok(new UploadResponse("/api/files/" + filename));
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) throws MalformedURLException {
        Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";
        } catch (IOException ignored) {}

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add imobiliaria-backend/Imobliaria/src/main/java/com/rafadev/imobliaria/controller/UploadController.java
git commit -m "feat: add file upload and serve endpoints"
```

---

### Task 14: Verificação Final

- [ ] **Step 1: Subir o banco PostgreSQL via Docker**

```bash
cd imobiliaria-backend/Imobliaria
docker compose up -d
```

Esperado: container `postgres` criado e rodando na porta 5432.

Verificar: `docker compose ps` deve mostrar status `running`.

- [ ] **Step 2: Rodar todos os testes**

```bash
./gradlew test
```

Esperado: BUILD SUCCESSFUL com todos os testes passando.

- [ ] **Step 3: Verificar que ImobliariaApplicationTests passa**

O arquivo `src/test/java/com/rafadev/imobliaria/ImobliariaApplicationTests.java` existente deve passar. Se falhar, verifique que o perfil `test` está sendo usado — adicione `@ActiveProfiles("test")` à classe se necessário:

```java
package com.rafadev.imobliaria;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ImobliariaApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 4: Iniciar a aplicação com PostgreSQL rodando**

```bash
./gradlew bootRun
```

Esperado: aplicação inicia sem erros em `http://localhost:8080`. O Hibernate cria automaticamente as tabelas (`ddl-auto=update`).

- [ ] **Step 5: Smoke test manual — login**

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin123"}' | python -m json.tool
```

Esperado:
```json
{
  "token": "eyJ...",
  "tipo": "Bearer"
}
```

- [ ] **Step 6: Smoke test manual — criar corretor**

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin123"}' | python -c "import sys,json; print(json.load(sys.stdin)['token'])")

curl -s -X POST http://localhost:8080/api/corretores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nome":"João Silva","creci":"12345-SP","email":"joao@imob.com","telefone":"11999990000","especialidade":"Residencial","bio":"Bio do corretor"}' | python -m json.tool
```

Esperado: objeto `CorretorResponse` com `id` gerado.

- [ ] **Step 7: Commit final**

```bash
git add -A
git commit -m "feat: complete backend implementation with all endpoints, security, and tests"
```
