# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real estate (imobiliária) management application with two independent parts:

- **`Imobiliaria-site/`** — Frontend: complete, functional static site (pure HTML/CSS/JS, no build tool)
- **`imobiliaria-backend/Imobliaria/`** — Backend: Spring Boot skeleton (early stage, no entities or endpoints yet)

All UI text and data are in Portuguese (BR).

## Frontend

### Running
Open `Imobiliaria-site/index.html` directly in a browser — no server or build step required. All data persists in `localStorage`.

### Architecture

The data layer lives entirely in `js/data.js`, which implements a CRUD pseudo-database over `localStorage` for three entities:

- **Imovel** (property) — tipo, finalidade (venda/aluguel), preco, area, quartos, banheiros, vagas, fotos[], destaque, corretor
- **Corretor** (agent) — CRECI, especialidade, foto
- **Lead** (contact submission) — origem, status tracking

Each page has a 1:1 corresponding JS module (e.g., `imoveis.html` → `js/imoveis.js`). Admin pages are at `admin/` and guarded by a session check against `sessionStorage`. Admin credentials are hardcoded in `data.js` (`admin` / `admin123`).

Shared UI utilities (toast notifications, card templates, navbar init) live in `js/utils.js`.

### CSS Design System (`css/global.css`)
- Colors: Navy `#0A1628`, Gold `#C9A84C`
- Fonts: Playfair Display (headings), Inter (body)
- Spacing scale: `xs` through `4xl`
- Max container width: 1280px

Public pages use `css/public.css`; admin pages use `css/admin.css`.

## Backend

### Prerequisites
- Java 17
- Docker (for PostgreSQL via Docker Compose)

### Commands (run from `imobiliaria-backend/Imobliaria/`)

```bash
# Start database
docker compose up -d

# Run application
./gradlew bootRun          # Linux/Mac
gradlew.bat bootRun        # Windows

# Build
./gradlew build

# Test
./gradlew test

# Clean
./gradlew clean
```

### Stack
- Spring Boot 4.0.5 with Spring MVC and Spring Data JPA
- PostgreSQL (credentials in `compose.yaml`: user `myuser`, password `secret`, db `mydatabase`)
- Lombok for boilerplate reduction
- Gradle 9.4.0 (wrapper locked)

### Current State
Only the Spring Boot main class exists (`com.rafadev.imobliaria.ImobliariaApplication`). No entities, repositories, services, or controllers have been implemented yet. The backend is ready to be built out as the API counterpart to the frontend.

## Frontend → Backend Migration Path

The frontend's `data.js` is structured to be replaceable with REST API calls. When implementing the backend, mirror these entity shapes and expose standard CRUD endpoints so the frontend JS modules can switch data sources with minimal changes.
