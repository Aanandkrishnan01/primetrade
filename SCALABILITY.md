# Scalability & Deployment Notes

## Current Architecture

The application follows a **modular monolith** pattern that is designed to scale both vertically and horizontally.

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js   │────▶│   FastAPI    │────▶│   SQLite/    │
│  Frontend   │     │   Backend    │     │  PostgreSQL  │
│  (Port 3000)│◀────│  (Port 8000) │◀────│  Database    │
└─────────────┘     └──────────────┘     └──────────────┘
```

## Scalability Strategies

### 1. Database Scaling
- **Current**: SQLite for development simplicity
- **Production**: Switch to PostgreSQL by changing `DATABASE_URL` in `.env`
- **Future**: Read replicas, connection pooling (PgBouncer), database sharding

```env
# Production PostgreSQL
DATABASE_URL=postgresql://user:password@db-host:5432/primetrade
```

### 2. Caching Layer (Redis)
Add Redis for:
- **Session caching** — Store JWT blacklist for token revocation
- **API response caching** — Cache frequently accessed task lists
- **Rate limiting** — Prevent brute-force login attempts

```python
# Example Redis integration
import redis
cache = redis.Redis(host='localhost', port=6379, db=0)

# Cache task list for 60 seconds
cached = cache.get(f"tasks:{user_id}:{page}")
if cached:
    return json.loads(cached)
```

### 3. Horizontal Scaling
- **Stateless API** — JWT tokens make the API stateless, enabling multiple instances
- **Load Balancer** — Use Nginx or AWS ALB to distribute traffic
- **Container Orchestration** — Deploy with Docker + Kubernetes

```yaml
# docker-compose.yml (example)
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://...
    deploy:
      replicas: 3

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 4. Microservices Migration Path
The modular structure allows easy extraction into microservices:

```
Current Monolith          →    Future Microservices
─────────────────              ──────────────────────
api/v1/auth.py            →    Auth Service
api/v1/tasks.py           →    Task Service
api/v1/users.py           →    User Management Service
```

Each service would:
- Have its own database
- Communicate via REST or message queues (RabbitMQ/Kafka)
- Be independently deployable

### 5. Logging & Monitoring
- **Structured Logging** — Use `python-json-logger` for JSON log output
- **APM** — Integrate with tools like Datadog, New Relic, or open-source (Prometheus + Grafana)
- **Health Checks** — Already implemented at `/health` endpoint

### 6. API Rate Limiting
```python
# Using slowapi for rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    ...
```

### 7. Docker Deployment

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Summary

| Strategy | Complexity | Impact |
|----------|-----------|--------|
| PostgreSQL migration | Low | High |
| Redis caching | Medium | High |
| Docker deployment | Medium | High |
| Load balancing | Medium | High |
| Microservices split | High | Very High |
| Rate limiting | Low | Medium |
| Logging/Monitoring | Low | Medium |

The current architecture is designed to handle the transition from a single-server setup to a distributed, production-grade system with minimal refactoring.
