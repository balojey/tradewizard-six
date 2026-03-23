# Market Intelligence Engine

> Multi-agent system for prediction market analysis using LangGraph and Opik observability

## Overview

The Market Intelligence Engine transforms prediction market data from Polymarket into explainable, probability-driven trade recommendations. Specialized AI agents independently analyze markets, construct competing theses, challenge each other's assumptions, and reach consensus on fair probability estimates.

### Core Principles

- **Adversarial Reasoning**: Multiple agents prevent groupthink and expose weak assumptions
- **Explainability First**: Every recommendation traces back to specific data signals
- **Graceful Degradation**: Partial failures don't crash the pipeline

### Key Features

- 🤖 Multi-Agent Analysis from different perspectives
- 🔄 Structured Debate Protocol with bull/bear theses
- 📊 Probability-Driven consensus with uncertainty quantification
- 🔍 Full Observability with Opik integration
- 🎯 Actionable Recommendations with entry/exit zones
- 🛡️ Robust Error Handling and recovery
- 🔧 Autonomous Tool-Calling Agents (ReAct pattern)
- 📰 Real-time News Intelligence with sentiment analysis
- 📈 Polymarket Tools for cross-market analysis
- 🧠 Agent Memory System for closed-loop analysis

## Quick Start

### Prerequisites

- Node.js 18+
- API keys for at least one LLM provider (OpenAI, Anthropic, Google, or Amazon Nova)
- (Optional) Opik API key for observability

### Setup (5 minutes)

```bash
# 1. Install dependencies
cd tradewizard-agents
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Build
npm run build

# 4. Run your first analysis
npm run cli -- analyze <polymarket-condition-id>
```

### Example Usage

```bash
# Basic analysis
npm run cli -- analyze 0x1234567890abcdef

# With debug information
npm run cli -- analyze 0x1234567890abcdef --debug

# Budget-friendly single-provider mode
npm run cli -- analyze 0x1234567890abcdef --single-provider openai --model gpt-4o-mini

# With cost tracking
npm run cli -- analyze 0x1234567890abcdef --show-costs --opik-trace
```

## Architecture

### LangGraph Workflow

```
Market Analysis Request
    ↓
[Market Ingestion] → Fetch market data
    ↓
[Memory Retrieval] → Load historical agent signals
    ↓
[Parallel Agent Execution] → All agents analyze simultaneously
    ├─ Breaking News Agent (autonomous tool-calling)
    ├─ Media Sentiment Agent (autonomous tool-calling)
    ├─ Polling Intelligence Agent (autonomous tool-calling)
    ├─ Market Microstructure Agent
    ├─ Probability Baseline Agent
    └─ Risk Assessment Agent
    ↓
[Thesis Construction] → Build bull and bear theses
    ↓
[Cross-Examination] → Adversarial testing
    ↓
[Consensus Engine] → Calculate unified probability
    ↓
[Recommendation Generation] → Create trade signal
    ↓
Trade Recommendation Output
```

### GraphState Schema

```typescript
const GraphState = Annotation.Root({
  // Input
  conditionId: Annotation<string>,
  
  // Market Ingestion
  mbd: Annotation<MarketBriefingDocument | null>,
  ingestionError: Annotation<IngestionError | null>,
  
  // Memory Context (Agent Memory System)
  memoryContext: Annotation<Map<string, AgentMemoryContext>>,
  
  // Agent Signals
  agentSignals: Annotation<AgentSignal[]>,
  agentErrors: Annotation<AgentError[]>,
  
  // Thesis Construction
  bullThesis: Annotation<Thesis | null>,
  bearThesis: Annotation<Thesis | null>,
  
  // Cross-Examination
  debateRecord: Annotation<DebateRecord | null>,
  
  // Consensus
  consensus: Annotation<ConsensusProbability | null>,
  
  // Final Recommendation
  recommendation: Annotation<TradeRecommendation | null>,
  
  // Audit Trail
  auditLog: Annotation<AuditEntry[]>
});
```

## Configuration

### LLM Configuration Modes

#### 1. Multi-Provider Mode (Default - Optimal Quality)

Uses different LLMs for different agents:

```bash
# .env
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4-turbo

ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_DEFAULT_MODEL=claude-3-sonnet-20240229

GOOGLE_API_KEY=...
GOOGLE_DEFAULT_MODEL=gemini-1.5-flash
```

**Agent-LLM Mapping:**
- Market Microstructure → GPT-4-turbo
- Probability Baseline → Gemini-2.5-flash
- Risk Assessment → Claude-3-sonnet

**Pros:** Diverse perspectives, better quality
**Cons:** Higher cost, multiple API keys

#### 2. Single-Provider Mode (Budget-Friendly)

Uses one LLM for all agents:

```bash
# .env
LLM_SINGLE_PROVIDER=google
GOOGLE_API_KEY=...
GOOGLE_DEFAULT_MODEL=gemini-2.5-flash
```

**Supported Providers:** openai, anthropic, google, nova

**Cost Comparison (per 100 analyses):**
- Multi-provider (premium): $10-15
- Multi-provider (Nova): $0.80-2
- Single-provider (gpt-4o-mini): $1-2
- Single-provider (Gemini): $0.60-1
- Single-provider (Nova Lite): $0.20-0.40

See [LLM Provider Setup Guide](./docs/LLM_PROVIDERS.md) for detailed setup.

### Core Configuration

```bash
# .env

# Opik Observability (optional)
OPIK_API_KEY=your_opik_api_key_here
OPIK_PROJECT_NAME=market-intelligence-engine
OPIK_TRACK_COSTS=true

# LangGraph
LANGGRAPH_CHECKPOINTER=memory      # Options: memory, sqlite, postgres
LANGGRAPH_RECURSION_LIMIT=25

# Agent Configuration
AGENT_TIMEOUT_MS=10000
MIN_AGENTS_REQUIRED=2

# NewsData (for autonomous agents)
NEWSDATA_API_KEY=your_newsdata_api_key_here
MAX_TOOL_CALLS=5
TOOL_CACHE_ENABLED=true

# Agent Memory System
MEMORY_SYSTEM_ENABLED=true
MEMORY_MAX_SIGNALS_PER_AGENT=3
MEMORY_QUERY_TIMEOUT_MS=5000

# Timestamps
ENABLE_HUMAN_READABLE_TIMESTAMPS=true
TIMESTAMP_TIMEZONE=America/New_York

# Consensus
MIN_EDGE_THRESHOLD=0.05
HIGH_DISAGREEMENT_THRESHOLD=0.15

# Remote Workflow Service (optional)
WORKFLOW_SERVICE_URL=https://your-workflow-service.com/analyze
DIGITALOCEAN_API_TOKEN=your_api_token_here
WORKFLOW_SERVICE_TIMEOUT_MS=120000
```

### Getting API Keys

1. **OpenAI**: https://platform.openai.com/api-keys
2. **Anthropic**: https://console.anthropic.com/
3. **Google**: https://ai.google.dev/
4. **Amazon Nova**: AWS Console → Bedrock
5. **Opik**: https://www.comet.com/opik
6. **NewsData**: https://newsdata.io

## Usage

### CLI Commands

```bash
# Analyze a market
npm run cli -- analyze <conditionId> [options]

# Query historical traces
npm run cli -- history <conditionId>

# Inspect checkpoint state
npm run cli -- checkpoint <conditionId>
```

**Common Options:**
- `--debug` - Show debug information
- `--visualize` - Generate workflow visualization
- `--opik-trace` - Display Opik trace URL
- `--single-provider <provider>` - Use single LLM provider
- `--model <model>` - Override default model
- `--show-costs` - Display LLM costs

### Programmatic Usage

```typescript
import { analyzeMarket } from './src/workflow';

const result = await analyzeMarket('0x1234567890abcdef');

console.log('Action:', result.recommendation.action);
console.log('Expected Value:', result.recommendation.expectedValue);
console.log('Explanation:', result.recommendation.explanation.summary);
```

### Example Output

```
═══════════════════════════════════════════════════════════════
TRADE RECOMMENDATION
═══════════════════════════════════════════════════════════════

Action: LONG_YES
Expected Value: $12.50 per $100 invested
Win Probability: 62%
Entry Zone: $0.48 - $0.52
Target Zone: $0.60 - $0.65
Liquidity Risk: Low

───────────────────────────────────────────────────────────────
EXPLANATION
───────────────────────────────────────────────────────────────

Summary: Market is underpricing the probability based on strong
fundamental catalysts and favorable risk/reward.

Core Thesis: Three major catalysts converge in Q2 2024, creating
a high-probability path to YES resolution.

Key Catalysts:
• Policy announcement expected March 15, 2024
• Historical precedent shows 75% success rate
• Market sentiment shifting based on polling data

Failure Scenarios:
• Unexpected regulatory intervention
• External economic shock
• Key stakeholder opposition emerges
```

## Development

### Project Structure

```
tradewizard-agents/
├── src/
│   ├── nodes/              # LangGraph nodes
│   │   ├── market-ingestion.ts
│   │   ├── memory-retrieval.ts
│   │   ├── agents.ts       # All intelligence agents
│   │   ├── thesis-construction.ts
│   │   ├── cross-examination.ts
│   │   ├── consensus-engine.ts
│   │   └── recommendation-generation.ts
│   ├── models/             # Data models
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── state.ts
│   ├── tools/              # LangChain tools
│   │   ├── newsdata-tools.ts
│   │   └── polymarket-tools.ts
│   ├── database/           # Persistence layer
│   │   ├── supabase.ts
│   │   ├── persistence.ts
│   │   ├── memory-retrieval.ts
│   │   └── migrate.ts
│   ├── utils/              # Utilities
│   │   ├── polymarket-client.ts
│   │   ├── audit-logger.ts
│   │   ├── timestamp-formatter.ts
│   │   └── opik-integration.ts
│   ├── config/             # Configuration
│   ├── workflow.ts         # LangGraph workflow
│   ├── cli.ts              # CLI interface
│   ├── monitor.ts          # Monitoring service
│   └── index.ts            # Entry point
├── docs/                   # Documentation
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Build & Development

```bash
# Build
npm run build

# Development mode with hot-reload
npm run dev

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

## Testing

### Unit Tests

```bash
npm test
```

Run specific test files:
```bash
npm test -- market-ingestion.test.ts
```

### Property-Based Tests

```bash
npm test -- *.property.test.ts
```

Validates correctness properties like:
- Market data retrieval completeness
- Agent signal structure validity
- Consensus probability structure
- Trade recommendation validity

### Integration Tests

```bash
npm test -- workflow.integration.test.ts
```

### Test Coverage

```bash
npm test -- --coverage
```

**Coverage Goals:**
- Unit tests: >80%
- Property tests: 100% of correctness properties
- Integration tests: All external API interactions

### End-to-End Testing

```bash
# Run E2E test suite once
npm run test:e2e

# Run continuous 48-hour monitoring
npm run test:e2e:continuous
```

## Deployment

### Node.js Deployment

```bash
# Build
npm run build

# Set environment variables
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
# ... other variables

# Run
npm start

# Or use PM2
npm install -g pm2
pm2 start dist/index.js --name market-intelligence-engine
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t market-intelligence-engine .
docker run -d --env-file .env --name market-intelligence-engine market-intelligence-engine
```

### Environment-Specific Configuration

**Development:**
```bash
LOG_LEVEL=debug
LANGGRAPH_CHECKPOINTER=memory
LLM_SINGLE_PROVIDER=openai
OPENAI_DEFAULT_MODEL=gpt-4o-mini
```

**Production:**
```bash
LOG_LEVEL=info
LANGGRAPH_CHECKPOINTER=sqlite
AUDIT_TRAIL_RETENTION_DAYS=90
OPIK_TRACK_COSTS=true
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No API keys configured | Check `.env` file, verify at least one LLM provider key is set |
| Market analysis failed | Verify condition ID is valid, check Polymarket API accessibility |
| Configuration invalid | Verify `.env` format, ensure required fields present |
| Tests timing out | Increase timeout in `vitest.config.ts`, check network connectivity |
| LangGraph recursion limit exceeded | Increase `LANGGRAPH_RECURSION_LIMIT` in `.env` |
| Opik traces not appearing | Verify `OPIK_API_KEY`, check `OPIK_PROJECT_NAME`, ensure network connectivity |
| Memory system not working | Verify `MEMORY_SYSTEM_ENABLED=true`, check database connection, verify historical signals exist |

### LangGraph Debugging

**Using LangGraph Studio:**

```bash
npm install -g @langchain/langgraph-studio
langgraph-studio
```

**Inspect graph state:**

```bash
npm run cli -- checkpoint <conditionId> --debug
```

**Enable debug logging:**

```bash
# .env
LOG_LEVEL=debug
```

### Opik Debugging

1. Access Opik dashboard: https://www.comet.com/opik
2. Find your trace by market ID (condition ID)
3. Inspect trace details: execution timeline, LLM inputs/outputs, token usage, costs

**Query traces programmatically:**

```typescript
import { OpikClient } from 'opik';

const client = new OpikClient({ apiKey: process.env.OPIK_API_KEY });
const traces = await client.getTraces({
  projectName: 'market-intelligence-engine',
  filter: { threadId: '0x1234567890abcdef' }
});
```

## Documentation

### Core Documentation
- **[CLI Documentation](./CLI.md)** - Complete CLI reference
- **[Documentation Hub](./docs/README.md)** - Central documentation index
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment
- **[Runbook](./docs/RUNBOOK.md)** - Operational procedures

### Feature Documentation
- **[Autonomous News Agents](./docs/AUTONOMOUS_NEWS_AGENTS.md)** - Tool-calling capabilities
- **[Agent Memory System](./src/database/MEMORY_SYSTEM_CONFIG.md)** - Closed-loop analysis
- **[Timestamp Formatting](./src/utils/TIMESTAMP_FORMATTING.md)** - Human-readable timestamps
- **[Workflow Service Logging](./docs/WORKFLOW_SERVICE_LOGGING.md)** - Remote execution logging
- **[Database Module](./src/database/README.md)** - Supabase integration

### Integration Guides
- **[LLM Provider Setup](./docs/LLM_PROVIDERS.md)** - OpenAI, Anthropic, Google, Nova setup
- **[Opik Integration](./docs/OPIK_GUIDE.md)** - Observability setup
- **[External Data Sources](./docs/EXTERNAL_DATA_SOURCES.md)** - NewsData.io and Polymarket APIs
- **[Autonomous Agents Migration](./docs/AUTONOMOUS_AGENTS_MIGRATION.md)** - Migration guide

### Advanced Topics
- **[Advanced Agent League](./docs/ADVANCED_AGENT_LEAGUE.md)** - Advanced patterns
- **[Examples](./docs/EXAMPLES.md)** - Code examples

### External Resources
- **[LangGraph Documentation](https://langchain-ai.github.io/langgraph/)**
- **[Opik Documentation](https://www.comet.com/docs/opik/)**
- **[Polymarket API](https://docs.polymarket.com/)**
- **[fast-check Documentation](https://fast-check.dev/)**

## License

ISC

---

**Built with ❤️ using LangGraph and Opik**
