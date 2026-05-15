# Deployment Guide

## Run Locally
```bash
# Backend
cd backend
pip install -r requirements.txt
python server.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```
Open: http://localhost:5173

## Add GPT-3.5
```bash
echo "OPENAI_API_KEY=sk-the-key" > backend/.env
```
Restart backend. NLP mode switches from "rule-based" to "gpt-3.5" automatically.

## Troubleshooting
| Problem | Fix |
|---|---|
| Port 5000 in use | Change port in server.py last line |
| npm not found | Install Node.js from nodejs.org |
| CORS error | Make sure backend is on port 5000 |
