# 🗳 Webová Anketa

Full-stack webová aplikace pro hlasování v anketě s persistentními výsledky, strukturovaným logováním a chráněným reset endpointem.

## Architektura

```
webpoll/
├── backend/          # Express API + PostgreSQL
├── frontend/         # React + Vite SPA
├── docker-compose.yml
└── .env.example
```

## Rychlý start (Docker)

```bash
# 1. Klonovat repozitář
git clone https://github.com/your-org/webpoll.git
cd webpoll

# 2. Zkopírovat a upravit environment variables
cp .env.example .env
nano .env   # nastavte RESET_TOKEN a VITE_API_URL

# 3. Spustit celý stack
docker compose up --build -d

# Frontend: http://localhost
# Backend API: http://localhost:4000
```

## Environment Variables

### Backend (`backend/.env`)
| Proměnná | Popis | Výchozí |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `RESET_TOKEN` | Tajný token pro reset | — |
| `PORT` | Port backendu | `4000` |
| `FRONTEND_URL` | CORS origin frontendů | — |

### Frontend (`frontend/.env`)
| Proměnná | Popis | Výchozí |
|---|---|---|
| `VITE_API_URL` | URL backendu | `http://localhost:4000` |

## API Endpoints

### `GET /api/poll`
Vrátí otázku a aktuální výsledky.

```json
{
  "question": "Jaký typ programovacího jazyka preferujete?",
  "options": [
    { "id": 1, "label": "Jazyk nízké úrovně (C, Assembly)", "votes": 5 }
  ]
}
```

### `POST /api/poll/vote`
Uloží hlas pro zvolenou možnost.

**Request:**
```json
{ "optionId": 1 }
```

**Response:** aktualizované výsledky + `success: true`

### `POST /api/poll/reset`
Vynuluje všechny hlasy. Chráněno tokenem.

**Request:**
```json
{ "token": "vas-tajny-token" }
```

| Situace | Status |
|---|---|
| Token správný | `200 OK` |
| Token špatný | `401 Unauthorized` |
| Chyba serveru | `500 Internal Server Error` |

**Příklad curl:**
```bash
curl -X POST http://localhost:4000/api/poll/reset \
  -H "Content-Type: application/json" \
  -d '{"token": "vas-tajny-token"}'
```

## Logování

### Backend (Winston)
Události logované do **konzole** a **souboru** (`logs/app-YYYY-MM-DD.log`):

| Emoji | Událost | Úroveň |
|---|---|---|
| 📥 | Přijetí požadavku na hlasování | Info |
| 🗳 | Úspěšné přidání hlasu | Info |
| 📊 | Zobrazení výsledků | Info |
| 🔐 | Úspěšný reset | Info |
| ⚠️ | Neúspěšný reset – špatný token | Warning |
| ❌ | Neočekávané chyby | Error |

### Frontend (console)
```js
console.log("[Poll] Načítání ankety...")
console.log("[Poll] Hlas odeslán:", selectedOption)
console.log("[UI] Výsledky zobrazeny")
console.error("[UI] API error:", error)
```

## Vývoj bez Dockeru

```bash
# PostgreSQL musí běžet lokálně nebo v Dockeru:
docker run -d --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres:16

# Backend
cd backend
cp .env.example .env
npm install
npm run dev    # http://localhost:4000

# Frontend (nové okno)
cd frontend
cp .env.example .env
npm install
npm run dev    # http://localhost:5173
```

## Hlášení chyb

Otevřete issue na [GitHub Issues](https://github.com/JackReaperCZ/PollApp/issues).

## Použité technologie

- **Express** — REST API, middleware, routing
- **React + Vite** — SPA frontend s rychlým HMR
- **PostgreSQL** — relační databáze pro persistenci hlasů
- **Docker + Docker Compose** — kontejnerizace a orchestrace
- **Winston** — strukturované logování (Info / Warning / Error)
- **React Router** — klientské routování
