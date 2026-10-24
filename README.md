# CodeShift AI — Prompt Engineering Code Translation & Evaluation Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.162-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?logo=react)](https://reactjs.org)
[![Monaco Editor](https://img.shields.io/badge/Editor-Monaco%20Editor-blue.svg)](https://microsoft.github.io/monaco-editor/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Testing-pytest%20%7C%20vitest-success.svg)](https://pytest.org)

**CodeShift AI** is an academic platform designed to systematically translate source code between **Java** and **Python**, analyze paradigm shifts, synthesize verifiable test cases, and empirically compare diverse prompt engineering strategies (**Zero-Shot Direct**, **Few-Shot In-Context**, **Chain-of-Thought**, **Role-Prompted Expert**, and **Iterative Self-Repair**).

---

## 🌟 Core Goals & Features

1. **Source Code Translation (Java $\leftrightarrow$ Python)**
   - High-fidelity translations maintaining asymptotic complexity, computational invariants, and idiomatic target conventions.
   - Monaco Editor split-view with syntax highlighting and side-by-side diff mode.

2. **Comparative Prompt Engineering Studio**
   - Head-to-head benchmarking of 4+ prompt strategies simultaneously.
   - Evaluates latency, token consumption, structural lines of code delta, and AST syntactic validity.

3. **Paradigm Shift & Invariant Explainer**
   - Breaks down architectural differences: static vs dynamic typing, JVM vs CPython memory models, stream collectors vs list comprehensions, exception hierarchies, and runtime edge cases.

4. **Target Language Test Synthesis**
   - Automatically generates runnable unit tests (`pytest` for Python, `JUnit 5` for Java) with concrete input/expected-output assertion vectors.

5. **Closed-Loop Iterative Self-Repair**
   - Diagnoses compiler traces, AST SyntaxErrors, or test assertion failures.
   - Feeds error feedback back into the prompt loop to produce patched candidates with convergence tracking.

6. **Host-Safe Sandboxing & Security**
   - **Strict Invariant**: Arbitrary submitted code is **never** executed directly on the host machine.
   - Safe static AST verification (`ast.parse` for Python, `javalang` for Java) performs zero execution.
   - Ephemeral, resource-capped container sandbox (`--network none`, `--memory 256m`, `--cap-drop=ALL`, non-root user) available when Docker is enabled.

---

## 🏗️ System Architecture

```
CodeShift-AI/
├── prompts/                         # Versioned prompt templates (isolated from business logic)
│   ├── translation/
│   │   ├── zero_shot_v1.yaml
│   │   ├── few_shot_v1.yaml
│   │   ├── chain_of_thought_v1.yaml
│   │   └── role_expert_v1.yaml
│   ├── explanation/
│   │   └── paradigm_diff_v1.yaml
│   ├── test_generation/
│   │   └── test_synthesis_v1.yaml
│   └── repair/
│       └── iterative_repair_v1.yaml
├── backend/                         # FastAPI Application & Engine
│   ├── app/
│   │   ├── main.py                 # App factory & database lifespan
│   │   ├── config.py               # Pydantic BaseSettings (.env)
│   │   ├── api/v1/endpoints/       # translate, explain, tests, repair, benchmark, health
│   │   ├── core/                   # security, exceptions, logging
│   │   ├── db/                     # SQLAlchemy async SQLite engine & models
│   │   ├── llm/                    # Gemini, OpenAI, Mock providers & factory
│   │   ├── prompt_engine/          # YAML registry & template rendering
│   │   ├── sandbox/                # Safe static AST analyzer & Docker runner
│   │   └── services/               # Translation, explanation, test gen, repair services
│   ├── tests/                      # Comprehensive pytest test suite (17 tests)
│   ├── requirements.txt
│   └── .env.example
└── frontend/                        # React + Vite + TypeScript + Monaco Editor
    ├── src/
    │   ├── App.tsx                 # Main application orchestrator
    │   ├── api/                    # Axios client & typed API interfaces
    │   ├── components/
    │   │   ├── common/Navbar.tsx
    │   │   ├── editor/             # CodeEditor & DiffEditorView
    │   │   ├── strategies/         # StrategySelector
    │   │   ├── explanation/        # Paradigm ExplanationView
    │   │   ├── tests/              # TestSynthesisView
    │   │   ├── repair/             # IterativeRepairView
    │   │   └── metrics/            # BenchmarkDashboard & stats
    │   └── test/app.test.tsx       # Vitest component test suite
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ (Tested on Node.js v24)
- (Optional) Docker for containerized test execution

---

### 1. Backend Setup & Run

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python3 -m venv ../venv
source ../venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your GEMINI_API_KEY or OPENAI_API_KEY (Defaults to 'mock' for safe offline testing)

# Run test suite
pytest -v

# Start FastAPI server (runs on http://127.0.0.1:8000)
uvicorn app.main:app --reload --port 8000
```

---

### 2. Frontend Setup & Run

```bash
# Navigate to frontend in a new terminal
cd frontend

# Install dependencies
npm install

# Run frontend tests
npm test

# Build production bundle
npm run build

# Start Vite dev server (runs on http://localhost:5173 with proxy to backend)
npm run dev
```

Visit **http://localhost:5173** to launch the CodeShift AI Studio.

---

## 🧪 Automated Test Verification

| Test Suite | Framework | Count | Status |
|---|---|---|---|
| **Health & DB Lifespan** | pytest / httpx ASGI | 1 | Passed |
| **Prompt Registry & Versioning** | pytest | 3 | Passed |
| **Safe Static AST Verification (Java & Python)** | pytest / javalang | 5 | Passed |
| **Single & Batch Translation API** | pytest | 4 | Passed |
| **Test Synthesis & Self-Repair Engine** | pytest | 3 | Passed |
| **Benchmark Metrics & SQLite Persistence** | pytest | 1 | Passed |
| **Frontend Navbar & Strategy Components** | Vitest / Testing Library | 2 | Passed |
| **Total Automated Tests** | | **19** | **100% Passed** |

---

## 🛡️ Security & Sandboxing Rules

1. **Host Isolation**: Submitted code is **never** executed with `subprocess` or `exec()` on the host operating system.
2. **Static AST Analysis**: Syntax verification runs through `ast.parse()` for Python and `javalang.parse.parse()` for Java, reading structure without executing code.
3. **Container Sandboxing**: When enabled (`ALLOW_DOCKER_EXECUTION=True`), runs inside ephemeral Alpine containers with:
   - `--network none` (zero outbound or inbound network access)
   - `--memory 256m` (strict RAM cap)
   - `--cpus 0.5` (strict CPU core cap)
   - `--cap-drop=ALL` (drops all Linux capabilities)
   - `--user 65534` (executes as unprivileged `nobody` user)
   - `timeout 10s` (automatic process termination)
4. **Secret Management**: API keys stay strictly on the backend inside `.env` (gitignored). Frontend never accesses keys.
