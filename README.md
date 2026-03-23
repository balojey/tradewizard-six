# TradeWizard

> AI-powered prediction trading platform providing intelligent analysis and trading recommendations for real-world outcomes on Polymarket.

TradeWizard transforms prediction markets from speculative guessing into guided, intelligence-driven trading. Our multi-agent AI system analyzes markets from multiple perspectives to provide explainable trade recommendations with clear reasoning, catalysts, and risk scenarios.

## Quick Links

- **[DOA Workflow Service](doa/README.md)** - Python LangGraph service
- **[TradeWizard Agents](tradewizard-agents/README.md)** - Node.js monitor & CLI
- **[Frontend](tradewizard-frontend/README.md)** - Next.js web app
- **[Product Docs](docs/)** - Architecture and design specifications

## System Architecture

```
tradewizard/
├── doa/                    # Python workflow service (LangGraph + Llama)
├── tradewizard-agents/     # Node.js monitor & CLI
├── tradewizard-frontend/   # Next.js web application
├── docs/                   # Product and technical documentation
└── .kiro/                  # AI assistant configuration
```

### Components

| Component | Purpose | Tech Stack |
|-----------|---------|-----------|
| **doa/** | Executes market analysis workflows | Python 3.10+, LangGraph, Digital Ocean Gradient AI |
| **tradewizard-agents/** | Market discovery, scheduling, monitoring | Node.js 18+, TypeScript, Supabase |
| **tradewizard-frontend/** | Web UI for trading and analysis | Next.js 16, React 19, Tailwind CSS |

### Data Flow

```
Monitor Service (tradewizard-agents)
  ↓ HTTP Request
Workflow Service (doa)
  ↓ LangGraph Execution
15+ Specialized AI Agents
  ↓ Analysis Results
Supabase (Persistence)
  ↓ API
Frontend (tradewizard-frontend)
```

## Getting Started

### Prerequisites

- Python 3.10+ and Node.js 18+
- Digital Ocean account with Gradient AI access
- Supabase account (free tier works)
- Digital Ocean API token and Inference key

### Option 1: Full Stack (Recommended)

**Setup time: ~10 minutes**

```bash
# 1. Set up database
cd tradewizard-agents
npx supabase link --project-ref your-project-ref
npx supabase db push

# 2. Deploy DOA workflow service
cd ../doa
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
export DIGITALOCEAN_API_TOKEN=your_token
gradient agent run  # Runs on http://localhost:8080

# 3. Start monitor service (new terminal)
cd ../tradewizard-agents
npm install && cp .env.example .env
# Edit .env: set WORKFLOW_SERVICE_URL=http://localhost:8080/run
npm run build && npm run monitor:start

# 4. Verify
npm run monitor:status
```

### Option 2: Local Execution Only

```bash
cd tradewizard-agents
npx supabase link --project-ref your-project-ref
npx supabase db push
npm install && cp .env.example .env
# Configure LLM providers (OpenAI, Anthropic, Google, or Amazon Nova)
npm run build
npm run cli -- analyze <polymarket-condition-id>
```

### Option 3: Frontend Only

```bash
cd tradewizard-frontend
npm install && cp .env.example .env.local
# Configure environment variables
npm run dev  # http://localhost:3000
```

## Key Features

- **Multi-Agent Analysis**: 15+ specialized agents analyzing news, polling, sentiment, and market dynamics
- **Adversarial Testing**: Cross-examination agents challenge assumptions and identify risks
- **Explainable Recommendations**: Clear buy/sell signals with detailed reasoning chains
- **Real-time Integration**: Live market prices and news data from Polymarket and NewsData.io
- **Automated Monitoring**: 24/7 market discovery and analysis with configurable intervals
- **Professional UI**: Bloomberg Terminal-style analytics with portfolio tracking

## Technology Stack

### DOA Workflow Service
- **Runtime**: Python 3.10+ with type hints
- **AI Framework**: LangGraph for multi-agent workflows
- **LLM Provider**: Digital Ocean Gradient AI (Llama-3.3-70b, Llama-3.1-8b)
- **HTTP Framework**: FastAPI or Flask for service endpoints
- **Testing**: pytest with Hypothesis for property-based testing

### TradeWizard Agents (Monitor & CLI)
- **Runtime**: Node.js 18+ with TypeScript
- **Features**: Market discovery, scheduling, data persistence
- **Workflow Execution**: Local LangGraph OR remote DOA service
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest with property-based testing (fast-check)

### Frontend
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4
- **State Management**: React Query (@tanstack/react-query)
- **Authentication**: Magic Link SDK
- **Blockchain**: ethers.js v5 and viem

## Development

### Common Commands

#### DOA Workflow Service
```bash
cd doa

# Start service locally
export DIGITALOCEAN_API_TOKEN=your_token
gradient agent run
# Service runs on http://localhost:8080

# Deploy to production
gradient agent deploy

# Test the service
curl --location 'http://localhost:8080/run' \
    --header 'Content-Type: application/json' \
    --data '{"condition_id": "0x1234567890abcdef"}'

# Run tests
pytest
pytest --cov=.  # With coverage

# Code quality
black . --line-length=120
flake8 . --max-line-length=120
```

#### TradeWizard Agents (Monitor & CLI)
```bash
cd tradewizard-agents

# Monitor service
npm run monitor:start    # Start monitoring
npm run monitor:stop     # Stop monitoring
npm run monitor:status   # Check status
npm run monitor:trigger  # Manual trigger

# CLI commands
npm run cli -- analyze <condition-id>
npm run cli -- history <condition-id>

# Testing
npm test                 # Run all tests
npm run test:e2e         # E2E tests
```

#### Frontend
```bash
cd tradewizard-frontend

npm run dev    # Start dev server
npm run build  # Build for production
npm run lint   # ESLint checking
```

## Documentation

### Getting Started
- **[DOA Workflow Service (doa/README.md)](doa/README.md)** - Python workflow service setup
- **[TradeWizard Agents (tradewizard-agents/README.md)](tradewizard-agents/README.md)** - Monitor and CLI documentation
- **[Frontend (tradewizard-frontend/README.md)](tradewizard-frontend/README.md)** - Frontend development guide

### Product Documentation
- [Product Overview](docs/TradeWizard.md) - Detailed product specification
- [AI Debate Protocol](docs/TradeWizard%20Debate%20Protocol.md) - Multi-agent system design
- [Technical Architecture](docs/Trade%20Wizard%20—%20Market%20Debate%20League%20(agent%20System%20Specification).md) - System specification

### Architecture Overview

**Workflow Execution Options:**

1. **Remote Execution (Recommended for Production)**
   - DOA service handles all LangGraph workflow execution
   - TradeWizard monitor handles scheduling and data persistence
   - Cost-effective with Digital Ocean Gradient AI (Llama models)
   - Separates concerns: monitoring vs. analysis

2. **Local Execution (Development/Testing)**
   - TradeWizard agents execute workflows locally
   - Supports multiple LLM providers (OpenAI, Anthropic, Google, Amazon Nova)
   - No separate DOA service needed
   - Useful for development and testing

## Configuration

### Environment Variables

#### DOA Workflow Service (doa/.env)
```bash
# Digital Ocean Gradient AI (REQUIRED)
DIGITALOCEAN_INFERENCE_KEY=your_gradient_model_access_key

# LLM Configuration
LLM_MODEL_NAME=llama-3.3-70b-instruct
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000

# Polymarket Configuration
POLYMARKET_GAMMA_API_URL=https://gamma-api.polymarket.com
POLYMARKET_CLOB_API_URL=https://clob.polymarket.com

# Database (for agent memory system)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ENABLE_PERSISTENCE=true

# Observability (optional)
OPIK_API_KEY=your_opik_api_key
OPIK_PROJECT_NAME=doa-market-analysis
OPIK_WORKSPACE=your_workspace
OPIK_TRACK_COSTS=true

# Agent Configuration
AGENT_TIMEOUT_MS=45000
AGENT_MAX_RETRIES=3
```

#### TradeWizard Agents (tradewizard-agents/.env)

**Option 1: Remote Workflow Execution (Recommended)**
```bash
# Remote DOA Workflow Service
WORKFLOW_SERVICE_URL=http://localhost:8080/run
WORKFLOW_SERVICE_TIMEOUT_MS=120000
DIGITALOCEAN_API_TOKEN=your_api_token

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# External APIs
NEWSDATA_API_KEY=your_newsdata_key

# Monitor Configuration
ANALYSIS_INTERVAL_HOURS=24
MAX_MARKETS_PER_CYCLE=3
```

**Option 2: Local Workflow Execution**
```bash
# Leave WORKFLOW_SERVICE_URL unset for local execution

# LLM Providers (configure at least one)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Or use single provider mode (budget-friendly)
LLM_SINGLE_PROVIDER=openai
OPENAI_DEFAULT_MODEL=gpt-4o-mini

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# External APIs
NEWSDATA_API_KEY=your_newsdata_key
```

#### Frontend (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Magic Link
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=your_magic_key

# Polymarket
NEXT_PUBLIC_POLYMARKET_API_URL=https://clob.polymarket.com
```

## Deployment

### Recommended Architecture

```
Production Setup:
1. DOA Workflow Service → Digital Ocean Gradient AI Platform
2. TradeWizard Monitor → Digital Ocean Droplet or Docker
3. Frontend → Vercel
4. Database → Supabase (managed PostgreSQL)
```

### DOA Workflow Service

**Deploy to Digital Ocean Gradient AI Platform:**

```bash
cd doa

# Configure agent name in .gradient/agent.yml
# agent_name: tradewizard-doa-agent

# Deploy to Gradient AI Platform
gradient agent deploy

# The deployment will return an endpoint URL like:
# https://agents.do-ai.run/<DEPLOYED_AGENT_ID>/main/run
```

**Invoke deployed agent:**

```bash
curl --location 'https://agents.do-ai.run/<DEPLOYED_AGENT_ID>/main/run' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer <DIGITALOCEAN_API_TOKEN>' \
    --data '{
        "condition_id": "0x1234567890abcdef"
    }'
```

### TradeWizard Monitor

```bash
cd tradewizard-agents

# Set WORKFLOW_SERVICE_URL to your deployed DOA service URL
# Example: WORKFLOW_SERVICE_URL=https://agents.do-ai.run/<DEPLOYED_AGENT_ID>/main/run
# Set DIGITALOCEAN_API_TOKEN for authentication

npm run build
npm run monitor:start

# Or use PM2 for process management
pm2 start dist/cli-monitor.js --name tradewizard-monitor
```

### Frontend
- **Recommended**: Deploy to Vercel (automatic Next.js optimization)
- **Alternative**: Docker with nginx

See [DOA Deployment Guide](doa/README.md#deployment) and [TradeWizard Agents Deployment Guide](tradewizard-agents/docs/DEPLOYMENT.md) for detailed instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality
- TypeScript strict mode with no `any` types
- ESLint + Prettier for consistent formatting
- Property-based testing for correctness properties
- Comprehensive test coverage requirements

## License

This project is proprietary software. All rights reserved.

## Support

- 📧 Email: support@tradewizard.ai
- 📖 Documentation: [docs/](docs/)
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**Disclaimer**: TradeWizard provides AI-generated analysis for educational and informational purposes. All trading involves risk. Past performance does not guarantee future results. Please trade responsibly.