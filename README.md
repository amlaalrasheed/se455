# SmartHomeAI: A Smart Home Automation System with LLM-Powered Natural Language Interfaces
**SE 455: Generative AI | Dr. Nidal Nasser
**Team:** Layan Alshowaier - Almaha Alrasheed - Lateen Alhurasen - Moudi Alsadoon - Saba Siddiqui

## Quick Start

### Backend (1 file, 3 packages)
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python server.py               # → http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # → http://localhost:5173
```

### Optional — Enable GPT-3.5
Create `backend/.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

## What's Simplified vs Full Version
| | Simplified | Full |
|---|---|---|
| Backend files | 1 file | 15+ files |
| Packages | 3 | 14 |
| Database | None (memory) | SQLite + ORM |
| Auth | None | JWT + bcrypt |
| UI | Same | Same |
| LLM | Same | Same |
| MQTT | Same | Same |

## Project Structure
```
README.md
requirements.txt (backend)
.gitignore
docs/          deployment guide
frontend/      React dashboard (straight to dashboard)
backend/       server.py — single file Flask API
data/          devices.json, test_commands.json
models/        nlp_config.json
notebooks/     SmartHomeAI_Evaluation.ipynb
tests/         test_server.py
presentation/  PPTX slides
demo/          demo_script.md
```
