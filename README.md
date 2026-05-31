# QualiFlow - AI-Powered Omnichannel Lead Qualification Platform

[![CI Status](https://github.com/QualiFlow-ai/qualiflow.saas/workflows/Backend%20CI/badge.svg)](https://github.com/QualiFlow-ai/qualiflow.saas/actions)
[![Frontend CI](https://github.com/QualiFlow-ai/qualiflow.saas/workflows/Frontend%20CI/badge.svg)](https://github.com/QualiFlow-ai/qualiflow.saas/actions)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)

> **Enterprise-grade AI-powered platform for omnichannel lead capture, qualification, and engagement**

QualiFlow enables businesses to capture leads from multiple channels (chat, SMS, voice, Instagram, Facebook, WhatsApp), automatically qualify them using GPT-4, and seamlessly integrate with CRM systems—all while maintaining conversation context across channels.

---

## 🚀 Quick Start

### Prerequisites
- **.NET 10 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/10.0))
- **Node.js 20 LTS** ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git 2.40+** ([Download](https://git-scm.com/downloads))

### Local Development Setup

\`\`\`bash
# 1. Clone repository
git clone https://github.com/QualiFlow-ai/qualiflow.saas.git
cd qualiflow.saas

# 2. Start PostgreSQL
docker-compose up -d postgres

# 3. Verify PostgreSQL is running
docker ps
# Expected: postgres container running on port 5432
\`\`\`

**Database Access:**
- 🗄️ **PostgreSQL:** localhost:5432
- 👤 **User:** See `docker-compose.yml` or Doppler for credentials
- 🔑 **Password:** Configure via environment variables (see Secrets Management below)
- 📊 **Database:** `qualiflow`
- 🔌 **Extensions:** pgvector 0.8.1

### Secrets Management

**Development:** Use [Doppler](https://www.doppler.com/) for local development secrets:
```bash
doppler run -- dotnet run
```

**Production:** Secrets are stored in Azure Key Vault and automatically injected via managed identity.

---

## 🏗️ Architecture

**Architecture Pattern:** Modular Monolith with Clean Architecture + Vertical Slice Architecture (VSA)

**Technology Stack (Implemented):**
- **Backend:** .NET 10, C# 14, ASP.NET Core Web API, Entity Framework Core 10
- **Database:** PostgreSQL 17 with pgvector 0.8.1 extension
- **AI Integration:** OpenAI GPT-4 SDK v2.1.0 for lead qualification
- **Authentication:** JWT tokens with refresh token rotation
- **Validation:** FluentValidation for all DTOs
- **Mapping:** AutoMapper for entity-DTO transformations
- **Logging:** Serilog with structured logging + LoggerMessage source generators
- **Documentation:** Swagger/OpenAPI with comprehensive XML comments
- **Code Quality:** StyleCop, SonarAnalyzer, SecurityCodeScan
- **Infrastructure:** Docker, GitHub Actions CI/CD

### Project Structure

```
src/backend/
├── QualiFlow.API/              # Web API, Controllers, Hubs
├── QualiFlow.Application/      # Business Logic, Services, DTOs
├── QualiFlow.Domain/           # Entities, Enums, Interfaces
├── QualiFlow.Infrastructure/   # Data Access, External Services
└── tests/                      # Unit & Integration Tests
```

### Implemented Features

**Core Platform:**
- ✅ JWT authentication with access/refresh tokens (15 min / 7 days)
- ✅ Multi-tenancy with PostgreSQL RLS and businessId filtering
- ✅ Lead management with status transition validation
- ✅ Conversation management across multiple channels
- ✅ Message management with threading and read tracking
- ✅ Real-time communication via SignalR Hub
- ✅ Comprehensive business rule validation
- ✅ Soft delete support for all entities

**AI & Qualification:**
- ✅ OpenAI GPT-4 integration for AI-powered lead qualification
- ✅ BANT scoring with configurable weights
- ✅ Intent detection and sentiment analysis

**Onboarding & Channels (Sprint 5 - ✅ COMPLETE):**
- ✅ 4-step onboarding wizard (business profile, channels, AI config, completion)
- ✅ Multi-channel architecture (SMS, Voice, WhatsApp, Instagram, Facebook, ChatWidget)
- ✅ Twilio integration for SMS/Voice/WhatsApp (stub implementation with real SDK integration ready)
- ✅ Channel CRUD operations with verification endpoints
- ✅ Multi-tenancy with global query filters on 13 entities
- ✅ 103 total tests passing (58 unit + 45 integration)
- 🔄 Meta Graph API (Instagram/Facebook) - Deferred to Sprint 7+ (S5-BE-017)

### AI Capabilities

| Feature | Description |
|---------|-------------|
| Lead Qualification | AI-powered scoring with configurable criteria |
| Intent Detection | Identify customer intent from messages |
| Sentiment Analysis | Analyze message sentiment and emotions |
| Retry Logic | 3 attempts with exponential backoff |

### API Endpoints

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| `/api/v1/auth` | 9 | JWT + OAuth (Google, Microsoft, Facebook, Instagram) |
| `/api/v1/leads` | 6 | CRUD + Status transitions + AI Qualification |
| `/api/v1/conversations` | 7 | CRUD + Unread count + Archive |
| `/api/v1/messages` | 7 | CRUD + Mark as read + Search |
| `/api/v1/onboarding` | 6 | 4-step wizard + status/defaults |
| `/api/v1/channels` | 8 | CRUD + verify/active/by-type |
| `/api/v1/forms` | 10 | Dynamic forms + submissions |
| `/api/v1/business` | 3 | Business settings management |
| `/api/v1/users` | 3 | User profile management |
| `/api/v1/notes` | 5 | Conversation notes |
| `/api/v1/quick-replies` | 6 | Message templates |
| `/api/v1/files` | 3 | File uploads and management |
| `/api/v1/scoring` | 6 | BANT scoring criteria |
| `/api/v1/workflows` | 13 | Workflow execution + definitions |
| `/api/v1/surveys` | 8 | Survey CRUD + analytics |
| `/api/v1/tracking` | 2 | Email open/click tracking |
| `/api/v1/bulk-operations` | 5 | Bulk lead/contact operations |

**Total:** 250+ RESTful API endpoints with comprehensive OpenAPI documentation

**Test Coverage:** 103 tests passing (58 unit + 45 integration) with ≥80% code coverage

### CRM Capabilities

**Built-in CRM (Sprint 6 - MVP Default):**
- ✅ Contact management (CRUD)
- ✅ Deal pipeline (6 stages: New → Qualified → Proposal → Negotiation → Won/Lost)
- ✅ Activity tracking and notes
- ✅ Pipeline value calculations
- ✅ Win/loss analytics

**Architecture:** Extensible adapter pattern supports ANY CRM integration

### External Integrations

| Integration | Technology | Status | Purpose | Sprint |
|-------------|------------|--------|---------|--------|
| **CRM** ||||
| QualiFlow CRM | Built-in PostgreSQL | ✅ Default | Contact + Deal management | S6 |
| HubSpot | CRM API + OAuth | 📋 Planned | Optional external CRM | S7-8 |
| Salesforce | CRM API + OAuth | 📋 Planned | Optional external CRM | S7-8 |
| **AI & Communication** ||||
| OpenAI | GPT-4 | ✅ Complete | AI lead qualification & scoring | S3 |
| Twilio | SDK 7.6.0 | ✅ Stub Ready | SMS/Voice/WhatsApp provisioning | S5 |
| Meta Graph API | Instagram/Facebook | 🔄 Deferred | Social channel support | S7+ |
| Cal.com | Scheduling API | 📋 Planned | Appointment booking | S6 |
| **Automation** ||||
| Workflow Core | 3.x | ✅ Complete | Workflow automation engine | S9, S36 |
| React Flow | 11.x | ✅ Complete | Visual workflow designer | S10-12 |
| **Email & Surveys** ||||
| Email Tracking | Custom | ✅ Complete | Open/click tracking pixels | S36 |
| Survey Analytics | Custom | ✅ Complete | NPS scores, response timeline | S36 |

**Notes:**
- **Built-in CRM is DEFAULT** - All businesses get CRM functionality without external dependencies
- **External CRMs are OPTIONAL** - Businesses can upgrade to HubSpot/Salesforce during onboarding
- **Adapter Pattern** - Supports ANY CRM integration (Pipedrive, Zoho, custom webhooks)
- Twilio integration implemented as stub service (S5-BE-016) - ready for production credentials
- Meta Graph API (S5-BE-017) deferred to Sprint 7+ to prioritize built-in CRM in Sprint 6

---

## 💻 Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push and create pull request
git push origin feature/your-feature-name
```

### CI/CD Pipelines

- **Backend CI**: .NET build, test, code quality checks
- **Frontend CI**: TypeScript type checking, linting
- **Secrets Sync**: Azure Key Vault to GitHub Secrets

---

## 📄 License

Proprietary - All rights reserved

---

## 🤝 Contributing

This is a private repository. For contribution guidelines, please contact the project maintainers.
