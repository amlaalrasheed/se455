# Demo Script — SmartHomeAI
## SE 455 Final Presentation | May 17, 2026

### Setup
1. `cd backend && python server.py`
2. `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Put backend terminal on second screen

### Demo (10 minutes)
1. Show Dashboard — stat cards, device grid, scene shortcuts
2. Toggle a light card — watch MQTT log update
3. AI Control tab — type: "Turn on the living room lights"
4. Type: "Activate night mode" — watch MQTT log show multiple devices
5. Devices tab — room filter tabs, toggle switches
6. Automation tab — show rules, click Run
7. Analytics tab — NLP metrics, system comparison chart
8. Open notebook — show evaluation results

### Key Points
- MQTT is the industry-standard IoT protocol
- GPT-3.5 achieves 92% accuracy at 15x lower cost than GPT-4
- Rule-based fallback works offline (78% accuracy)
- Hardware-ready — swap simulator for real ESP32 with zero code changes
