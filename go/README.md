# NOF0 Backend - Go API Server

> High-performance Go backend for the NOF0 Alpha Arena, serving real-time AI trading data, analytics, and leaderboards.

**[Back to the project root](../README.md)** | **Status**: Production ready | **Version**: v1.1.0

---

## Overview

The NOF0 backend is a Go-Zero microservice that exposes seven REST endpoints to the frontend. Two data sources are supported:
- **File mode**: Load JSON snapshots instantly (ideal for development/demos)
- **Database mode**: Postgres + Redis (production)

### Key Features

| Feature | Description | Metric |
|---------|-------------|--------|
| **High performance** | Tuned data loaders | <10 ms latency (p90) |
| **Type safety** | Full Go type system | 27-field Trade, 11+ field Account |
| **Thorough testing** | Unit + integration | 88% data-layer coverage |
| **Dual data sources** | File/DB auto toggle | Optional Postgres + Redis |
| **Production ready** | CORS, logging, monitoring | Single binary deploy |

### Tech Stack {#tech-stack}

<table>
<tr>
<td width="50%">

**Backend**
- [Go-Zero](https://go-zero.dev/) – microservice framework
- [pgx/v5](https://github.com/jackc/pgx) – Postgres driver
- [go-redis](https://github.com/redis/go-redis) – Redis client

</td>
<td width="50%">

**Frontend (web/ folder)**
- React 18 + TypeScript
- Recharts
- TanStack Query

</td>
</tr>
</table>

---

## Quick Start

### Option 1: File data source (recommended for onboarding)

```bash
# 1. Clone and move into the backend folder
cd go

# 2. Install dependencies
go mod download

# 3. Build and run
go build -o nof0-api ./nof0.go
./nof0-api -f etc/nof0.yaml
```

The service exposes `http://localhost:8888`.

**Test the API**:
```bash
# Live prices
curl http://localhost:8888/api/crypto-prices

# AI leaderboard
curl http://localhost:8888/api/leaderboard

# Trade history
curl http://localhost:8888/api/trades
```

### Option 2: Docker Compose (Postgres + Redis)

```bash
# Spin up Postgres, Redis, and the API
docker-compose up -d

# Run database migrations
make migrate-up

# Import historical data (optional)
go run cmd/importer/main.go -dsn "postgres://nof0:nof0@localhost:5432/nof0?sslmode=disable"
```

### Requirements

- **Minimum**: Go 1.22+
- **Full stack**: Go 1.22+, Docker, Postgres 16, Redis 7

---

## API Endpoints

### Primary routes

<table>
<tr><th>Endpoint</th><th>Description</th><th>Latency</th><th>Sample</th></tr>
<tr>
  <td><code>/api/crypto-prices</code></td>
  <td>Live crypto prices</td>
  <td>~2ms</td>
  <td>

```json
{
  "prices": {
    "BTCUSDT": {"price": 68234.5, "timestamp": 1735228800000}
  }
}
```
  </td>
</tr>
<tr>
  <td><code>/api/leaderboard</code></td>
  <td>AI leaderboard</td>
  <td>~1ms</td>
  <td>

```json
{
  "leaderboard": [
    {"model_id": "qwen3-max", "equity": 12456.78, "sharpe": 1.23}
  ]
}
```
  </td>
</tr>
<tr>
  <td><code>/api/trades</code></td>
  <td>Full trade history</td>
  <td>~10ms</td>
  <td>Array of 27-field Trade objects</td>
</tr>
<tr>
  <td><code>/api/account-totals</code></td>
  <td>Accounts and open positions</td>
  <td>~150ms</td>
  <td>Includes `positions` map</td>
</tr>
<tr>
  <td><code>/api/analytics/:id</code></td>
  <td>Per-model analytics</td>
  <td>~2ms</td>
  <td>Model-level stats</td>
</tr>
</table>

**Full reference**: [API spec](../mcp/data/api-endpoints.json)

---

## Testing

```bash
# Run every unit test
./scripts/run-tests.sh

# Run integration suite
./scripts/run-integration-tests.sh

# Coverage report
go test -cover ./internal/data/
```

**Key metrics**:
- Data-layer coverage: 88%
- Integration suite: 100% endpoint coverage
- Documentation: [TEST_README.md](TEST_README.md)

---

## Layout

```
go/
├── nof0.go                   # Entry point
├── etc/nof0.yaml             # Config file
├── internal/
│   ├── handler/              # HTTP handlers
│   ├── logic/                # Business logic
│   ├── data/                 # File data source (JSON)
│   ├── repo/                 # DB data source (Postgres+Redis)
│   ├── model/                # DB models (generated)
│   ├── types/                # API types
│   ├── config/               # Config structs
│   └── svc/                  # Service context
├── cmd/importer/             # Data import CLI
├── migrations/               # Database migrations
├── test/                     # Integration test suite
└── scripts/                  # Automation scripts
    ├── run-tests.sh          # Unit tests
    └── run-integration-tests.sh
```

---

## Configuration

### Base config (`etc/nof0.yaml`)

```yaml
Name: nof0-api
Host: 0.0.0.0
Port: 8888
DataPath: ../mcp/data  # path for file data source

Cors:
  AllowOrigins: ['*']
```

### Database config (optional)

Enable the Postgres + Redis stack:

```yaml
Postgres:
  DSN: postgres://nof0:nof0@localhost:5432/nof0?sslmode=disable
  MaxOpen: 10
  MaxIdle: 5

Redis:
  Host: localhost:6379
  Type: node

TTL:
  Short: 10    # fast-moving data (pricing)
  Medium: 60   # list data (trades)
  Long: 300    # aggregated data (leaderboard)
```

**Bootstrap the database**:
```bash
# Run migrations
make migrate-up

# Import historical data
go run cmd/importer/main.go -dsn "$POSTGRES_DSN" -data ../mcp/data
```

**Architecture**: see [docs/data-architecture.md](docs/data-architecture.md) for a deep dive.

---

## Development Guide

### Add a new endpoint

1. Declare types in `internal/types/types.go`
2. Implement data access in `internal/data/loader.go` (file) or `internal/repo/` (DB)
3. Add business logic in `internal/logic/xxx_logic.go`
4. Register the route in `internal/handler/routes.go`
5. Write tests in `internal/logic/xxx_logic_test.go`

### Code quality

```bash
go fmt ./...              # formatting
golangci-lint run         # static analysis
go test ./... -cover      # tests + coverage
```

---

## Deployment

<table>
<tr>
<td width="50%">

**Docker (recommended)**
```bash
docker-compose up -d
```

</td>
<td width="50%">

**Binary**
```bash
go build -o nof0-api
./nof0-api -f etc/nof0.yaml
```

</td>
</tr>
</table>

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 8888 already in use | `kill $(lsof -ti:8888)` |
| Data files missing | Confirm `DataPath` points to `mcp/data` |
| DB connection fails | Validate `Postgres.DSN` and credentials |
| Tests fail | Ensure `mcp/data` exists with proper permissions |

More: [TEST_README.md#troubleshooting](TEST_README.md#troubleshooting)

---

## Changelog

### v1.1.0 (2025-10-26) – Data layer upgrade
- Added Postgres + Redis support
- Migration scripts and import tool
- DataSource abstraction for file/DB switching
- Materialized view and caching strategy

### v1.0.0 (2025-10-26) – Initial release
- All 7 REST endpoints implemented
- File data source (JSON) fully supported
- 88% data-layer coverage + 100% integration tests
- Docker deployment + automation scripts

---

## Resources

**Project docs**:
- [Project homepage](../README.md) – vision and roadmap
- [Testing guide](TEST_README.md) – unit & integration details
- [Data architecture](docs/data-architecture.md) – schema design
- [API spec](../mcp/data/README.md) – data contracts

**References**:
- [Go-Zero framework](https://go-zero.dev/)
- [NOF1 official site](https://nof1.ai/)

---

<div align="center">

**NOF0 Backend API**

**Version**: v1.1.0 | **Status**: Production ready | **Updated**: 2025-10-26

[Back to the project homepage](../README.md)

</div>
