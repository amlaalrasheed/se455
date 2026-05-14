/**
 * SmartHomeAI — Final Presentation Generator
 * SE 455: Generative AI — Alfaisal University, Spring 2026
 * Run: node generate_presentation.js
 */
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3" × 7.5"
pres.title = "Smart Home Automation with LLM-Powered Natural Language Interfaces";
pres.author = "Layan Alshowaier, Almaha Alrasheed, Lateen Alhurasen, Moudi Alsadoon, Saba Siddiqui";

// ── Color Palette ──────────────────────────────────────────────
const C = {
  dark: "0F1629",    // slide backgrounds
  navy: "0D1B35",
  brand: "0EA5E9",   // sky blue primary
  brandDim: "1E3A5F",
  accent: "F59E0B",  // amber accent
  white: "FFFFFF",
  gray: "94A3B8",
  lightGray: "E2E8F0",
  green: "10B981",
  purple: "6366F1",
  surface: "1A2744",
};

// ── Master Settings ────────────────────────────────────────────
function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: C.dark };
  return s;
}
function lightSlide() {
  const s = pres.addSlide();
  s.background = { color: "F8FAFC" };
  return s;
}
function addLabel(s, text, x, y, w = 3, opts = {}) {
  s.addText(text.toUpperCase(), {
    x, y, w, h: 0.25,
    fontSize: 8, fontFace: "Calibri",
    color: C.brand, charSpacing: 3,
    bold: true, ...opts
  });
}
function addHeading(s, text, x, y, w = 12, size = 32, col = C.white) {
  s.addText(text, {
    x, y, w, h: 1.2,
    fontSize: size, fontFace: "Calibri",
    color: col, bold: true, align: "left",
  });
}
function addBody(s, text, x, y, w = 10, col = C.gray, size = 14) {
  s.addText(text, {
    x, y, w, h: 3,
    fontSize: size, fontFace: "Calibri",
    color: col, lineSpacingMultiple: 1.5,
  });
}
function accentLine(s, x, y, w = 1.2) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h: 0.04, fill: { color: C.brand } });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ═══════════════════════════════════════════════════════════════
{
  const s = darkSlide();
  // Background accent shape
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: C.brand } });
  s.addShape(pres.ShapeType.rect, { x: 9, y: 0, w: 4.3, h: 7.5, fill: { color: C.surface } });

  addLabel(s, "SE 455 · Generative AI · Spring 2026", 0.4, 0.5, 9);
  s.addText("Smart Home\nAutomation", {
    x: 0.4, y: 1.0, w: 8.3, h: 2.4,
    fontSize: 52, fontFace: "Calibri",
    color: C.white, bold: true, lineSpacingMultiple: 1.1,
  });
  s.addText("with LLM-Powered Natural Language Interfaces", {
    x: 0.4, y: 3.5, w: 8.3, h: 0.7,
    fontSize: 20, fontFace: "Calibri", color: C.brand,
  });
  accentLine(s, 0.4, 4.4, 3);
  s.addText("Layan Alshowaier · Almaha Alrasheed\nLateen Alhurasen · Moudi Alsadoon · Saba Siddiqui", {
    x: 0.4, y: 4.6, w: 8, h: 0.8,
    fontSize: 13, fontFace: "Calibri", color: C.gray,
    lineSpacingMultiple: 1.5,
  });
  s.addText("Instructor: Dr. Nidal Nasser\nAlfaisal University — College of Engineering", {
    x: 0.4, y: 5.6, w: 8, h: 0.6,
    fontSize: 11, fontFace: "Calibri", color: C.gray,
  });

  // Right panel content
  const cards = ["15 IoT Devices Simulated", "GPT-3.5 NLP Pipeline", "95% Command Accuracy", "Real-time WebSocket"];
  cards.forEach((c, i) => {
    const y = 1.2 + i * 1.3;
    s.addShape(pres.ShapeType.rect, { x: 9.4, y, w: 3.5, h: 1.0, fill: { color: C.brandDim }, line: { color: C.brand, width: 0.5 } });
    s.addText(c, { x: 9.6, y: y + 0.28, w: 3.1, h: 0.45, fontSize: 12, fontFace: "Calibri", color: C.white, bold: false });
  });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 2 — Problem Statement
// ═══════════════════════════════════════════════════════════════
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 1.1, fill: { color: C.surface } });
  addLabel(s, "Problem Statement", 0.5, 0.15, 5);
  addHeading(s, "The Smart Home Usability Gap", 0.5, 0.4, 12, 26);

  const problems = [
    { icon: "🔧", title: "Fragmented Control", desc: "Users must manage multiple disconnected apps — one per device ecosystem." },
    { icon: "🗣️", title: "Rigid Voice Commands", desc: "Traditional assistants require exact keyword phrasing; natural speech fails." },
    { icon: "📱", title: "Technical Barriers", desc: "Non-technical users, elderly, and persons with disabilities are excluded." },
    { icon: "🔄", title: "No Context Awareness", desc: "Devices cannot understand multi-step, conditional, or conversational commands." },
  ];

  problems.forEach((p, i) => {
    const col = i < 2 ? i : i;
    const row = i < 2 ? 0 : 1;
    const x = 0.5 + col * 6.3;
    const y = 1.4 + row * 2.8;
    s.addShape(pres.ShapeType.rect, { x, y, w: 5.9, h: 2.4, fill: { color: C.surface }, line: { color: C.brandDim, width: 1 } });
    s.addText(p.icon, { x: x + 0.2, y: y + 0.3, w: 0.7, h: 0.7, fontSize: 24 });
    s.addText(p.title, { x: x + 0.9, y: y + 0.3, w: 4.8, h: 0.5, fontSize: 14, fontFace: "Calibri", color: C.white, bold: true });
    s.addText(p.desc, { x: x + 0.2, y: y + 0.95, w: 5.4, h: 1.2, fontSize: 12, fontFace: "Calibri", color: C.gray, lineSpacingMultiple: 1.4 });
  });

  s.addText("LLMs provide a transformative solution: natural, conversational, multi-device control", {
    x: 0.5, y: 7.0, w: 12.3, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: C.brand, bold: true, align: "center",
  });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 3 — System Architecture
// ═══════════════════════════════════════════════════════════════
{
  const s = lightSlide();
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 1.0, fill: { color: C.dark } });
  addLabel(s, "System Architecture", 0.5, 0.1, 5, { color: C.brand });
  addHeading(s, "Hybrid LLM-IoT Architecture", 0.5, 0.3, 12, 22, C.white);

  // Architecture layers
  const layers = [
    { title: "User Interface Layer", items: ["React.js Dashboard", "Chat Interface", "Voice Input (opt.)"], color: C.brand },
    { title: "LLM Processing Layer", items: ["GPT-3.5 Turbo", "Intent Recognition", "Entity Extraction"], color: C.purple },
    { title: "API Gateway (FastAPI)", items: ["REST Endpoints", "WebSocket Server", "JWT Auth"], color: C.accent },
    { title: "IoT Control Layer", items: ["MQTT Protocol", "Device Simulator", "State Management"], color: C.green },
    { title: "Data Layer", items: ["SQLite/PostgreSQL", "Device Logs", "Command History"], color: "64748b" },
  ];

  layers.forEach((l, i) => {
    const x = 0.3 + i * 2.54;
    s.addShape(pres.ShapeType.rect, { x, y: 1.2, w: 2.3, h: 0.5, fill: { color: l.color } });
    s.addText(l.title, { x, y: 1.2, w: 2.3, h: 0.5, fontSize: 9.5, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle" });

    s.addShape(pres.ShapeType.rect, { x, y: 1.8, w: 2.3, h: 2.2, fill: { color: "F1F5F9" }, line: { color: l.color, width: 1.5 } });
    l.items.forEach((item, j) => {
      s.addText(`• ${item}`, { x: x + 0.1, y: 1.95 + j * 0.55, w: 2.1, h: 0.5, fontSize: 11, fontFace: "Calibri", color: "334155" });
    });

    if (i < layers.length - 1) {
      s.addShape(pres.ShapeType.rect, { x: x + 2.3, y: 2.7, w: 0.24, h: 0.15, fill: { color: "94A3B8" } });
    }
  });

  // AI Pipeline flow
  s.addShape(pres.ShapeType.rect, { x: 0.3, y: 4.3, w: 12.7, h: 2.8, fill: { color: "F8FAFC" }, line: { color: "CBD5E1", width: 0.8 } });
  addLabel(s, "NLP Processing Pipeline", 0.5, 4.35, 6, { color: "475569" });

  const pipe = [
    { step: "Natural Language Input", icon: "💬" },
    { step: "LLM Intent Parsing", icon: "🧠" },
    { step: "Entity Extraction", icon: "🔍" },
    { step: "Command Validation", icon: "✅" },
    { step: "Device Execution", icon: "⚡" },
    { step: "Feedback Response", icon: "📢" },
  ];

  pipe.forEach((p, i) => {
    const x = 0.5 + i * 2.08;
    s.addShape(pres.ShapeType.roundRect, { x, y: 4.7, w: 1.9, h: 1.1, rectRadius: 0.08, fill: { color: C.dark } });
    s.addText(p.icon, { x, y: 4.75, w: 1.9, h: 0.4, fontSize: 18, align: "center" });
    s.addText(p.step, { x, y: 5.2, w: 1.9, h: 0.55, fontSize: 9, fontFace: "Calibri", color: C.white, align: "center" });
    if (i < pipe.length - 1) {
      s.addText("→", { x: x + 1.9, y: 5.0, w: 0.18, h: 0.3, fontSize: 14, color: C.brand });
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 4 — NLP / AI Integration
// ═══════════════════════════════════════════════════════════════
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 1.0, fill: { color: C.surface } });
  addLabel(s, "AI & NLP Integration", 0.5, 0.1, 5);
  addHeading(s, "LLM Command Processing", 0.5, 0.3, 9, 22);

  // Input box
  s.addShape(pres.ShapeType.rect, { x: 0.4, y: 1.2, w: 5.5, h: 0.8, fill: { color: C.brandDim }, line: { color: C.brand, width: 1 } });
  s.addText("User Input: \"Turn off all lights in the kitchen after 11 PM\"", {
    x: 0.5, y: 1.28, w: 5.3, h: 0.65, fontSize: 11, fontFace: "Calibri",
    color: C.white, italic: true,
  });

  s.addText("↓ GPT-3.5 + Structured Prompt Engineering", {
    x: 0.4, y: 2.1, w: 5.5, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.brand,
  });

  // JSON output
  s.addShape(pres.ShapeType.rect, { x: 0.4, y: 2.6, w: 5.5, h: 3.2, fill: { color: "0D1B35" }, line: { color: C.brandDim, width: 1 } });
  const jsonLines = [
    ['{', C.white],
    ['  "intent": "device_control",', C.brand],
    ['  "device_type": "light",', C.gray],
    ['  "location": "kitchen",', C.gray],
    ['  "action": "turn_off",', C.accent],
    ['  "schedule": "11 PM",', C.green],
    ['  "multiple_devices": true,', C.gray],
    ['  "confidence": 0.97', C.white],
    ['}', C.white],
  ];
  jsonLines.forEach(([line, col], i) => {
    s.addText(line, {
      x: 0.5, y: 2.7 + i * 0.32, w: 5.2, h: 0.3,
      fontSize: 10.5, fontFace: "Courier New", color: col,
    });
  });

  // Features list
  const feats = [
    { t: "Dual-Mode NLP", d: "OpenAI GPT-3.5 primary; rule-based regex fallback for offline use" },
    { t: "Prompt Engineering", d: "Structured system prompt forces JSON output — no post-processing needed" },
    { t: "Context Window", d: "Last 4 conversation turns passed to maintain multi-turn dialogue context" },
    { t: "Intent Taxonomy", d: "5 intent classes: device_control · query_status · scene_activate · automation_create · unknown" },
    { t: "Entity Extraction", d: "Extracts device_type · location · action · value · unit · schedule in one pass" },
    { t: "Hallucination Guard", d: "Rule-based validator rejects impossible device/action combinations before execution" },
  ];

  feats.forEach((f, i) => {
    const y = 1.2 + i * 1.0;
    s.addShape(pres.ShapeType.rect, { x: 6.3, y, w: 6.6, h: 0.85, fill: { color: C.surface }, line: { color: C.brandDim, width: 0.5 } });
    s.addShape(pres.ShapeType.rect, { x: 6.3, y, w: 0.07, h: 0.85, fill: { color: C.brand } });
    s.addText(f.t, { x: 6.5, y: y + 0.06, w: 6.2, h: 0.28, fontSize: 12, fontFace: "Calibri", color: C.white, bold: true });
    s.addText(f.d, { x: 6.5, y: y + 0.36, w: 6.2, h: 0.42, fontSize: 10, fontFace: "Calibri", color: C.gray });
  });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 5 — Tech Stack & Implementation
// ═══════════════════════════════════════════════════════════════
{
  const s = lightSlide();
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 1.0, fill: { color: C.dark } });
  addLabel(s, "Implementation", 0.5, 0.1, 5, { color: C.brand });
  addHeading(s, "Technology Stack & Key Modules", 0.5, 0.3, 12, 22, C.white);

  const stack = [
    { layer: "Frontend", tech: "React.js + Vite", detail: "Real-time dashboard, chat UI, device cards, analytics charts", color: C.brand },
    { layer: "Styling", tech: "Tailwind CSS + Custom", detail: "Dark/light theme, responsive grid, animated transitions", color: "06B6D4" },
    { layer: "Backend", tech: "Python Flask", detail: "REST API, SQLAlchemy ORM, JWT auth, CORS, Flask-SocketIO", color: C.green },
    { layer: "AI/NLP", tech: "OpenAI GPT-3.5", detail: "Structured prompt → JSON intent, rule-based fallback parser", color: C.purple },
    { layer: "Database", tech: "SQLite → PostgreSQL", detail: "User, Device, Room, Command, AutomationRule, DeviceLog schemas", color: C.accent },
    { layer: "IoT/Comm.", tech: "MQTT Simulation", detail: "paho-mqtt publish/subscribe, WebSocket real-time state sync", color: "EF4444" },
    { layer: "Auth", tech: "JWT + bcrypt", detail: "Access + refresh tokens, role-based access (admin/user/guest)", color: "8B5CF6" },
    { layer: "DevOps", tech: "Docker + GitHub", detail: "docker-compose.yml, .env config, CI-ready structure", color: "64748b" },
  ];

  stack.forEach((item, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = 0.3 + col * 6.45;
    const y = 1.2 + row * 1.48;
    s.addShape(pres.ShapeType.rect, { x, y, w: 6.1, h: 1.28, fill: { color: C.dark }, line: { color: item.color, width: 1 } });
    s.addShape(pres.ShapeType.rect, { x, y, w: 0.07, h: 1.28, fill: { color: item.color } });
    s.addShape(pres.ShapeType.rect, { x: x + 0.15, y: y + 0.1, w: 1.2, h: 0.3, fill: { color: C.brandDim } });
    s.addText(item.layer, { x: x + 0.15, y: y + 0.1, w: 1.2, h: 0.3, fontSize: 8, fontFace: "Calibri", color: item.color, bold: true, align: "center", valign: "middle" });
    s.addText(item.tech, { x: x + 1.45, y: y + 0.1, w: 4.5, h: 0.3, fontSize: 13, fontFace: "Calibri", color: C.white, bold: true });
    s.addText(item.detail, { x: x + 0.15, y: y + 0.52, w: 5.8, h: 0.65, fontSize: 10.5, fontFace: "Calibri", color: "94A3B8" });
  });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 6 — Features & Demo
// ═══════════════════════════════════════════════════════════════
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 1.0, fill: { color: C.surface } });
  addLabel(s, "Key Features", 0.5, 0.1);
  addHeading(s, "System Capabilities", 0.5, 0.3, 12, 22);

  const features = [
    { icon: "🧠", title: "LLM Natural Language", points: ["Conversational command input", "Multi-device batch control", "Context-aware dialogue (4-turn)", "Rule-based offline fallback"] },
    { icon: "🏠", title: "Smart Device Control", points: ["15 simulated IoT devices", "6 room categories", "MQTT publish/subscribe", "Real-time WebSocket sync"] },
    { icon: "⚡", title: "Automation Engine", points: ["Scheduled rules (cron-based)", "Sensor trigger automation", "6 pre-defined smart scenes", "Manual rule triggering"] },
    { icon: "📊", title: "Analytics Dashboard", points: ["Command history & metrics", "Energy usage simulation", "Intent distribution charts", "NLP performance KPIs"] },
    { icon: "🔒", title: "Security & Auth", points: ["JWT access + refresh tokens", "Role-based access control", "Password hashing (bcrypt)", "HTTPS + CORS protection"] },
    { icon: "📱", title: "Responsive UI", points: ["React.js dashboard", "Mobile-first design", "Dark/light theme toggle", "Accessible (ARIA labels)"] },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 4.3;
    const y = 1.15 + row * 3.0;
    s.addShape(pres.ShapeType.rect, { x, y, w: 4.0, h: 2.7, fill: { color: C.surface }, line: { color: C.brandDim, width: 0.8 } });
    s.addText(f.icon, { x: x + 0.15, y: y + 0.12, w: 0.5, h: 0.5, fontSize: 20 });
    s.addText(f.title, { x: x + 0.65, y: y + 0.12, w: 3.2, h: 0.5, fontSize: 13, fontFace: "Calibri", color: C.white, bold: true });
    f.points.forEach((pt, j) => {
      s.addText([{ text: "› ", options: { color: C.brand, bold: true } }, { text: pt }], {
        x: x + 0.15, y: y + 0.75 + j * 0.44, w: 3.7, h: 0.38,
        fontSize: 10.5, fontFace: "Calibri", color: C.gray,
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 7 — Experimental Results
// ═══════════════════════════════════════════════════════════════
{
  const s = lightSlide();
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 1.0, fill: { color: C.dark } });
  addLabel(s, "Evaluation & Results", 0.5, 0.1, 5, { color: C.brand });
  addHeading(s, "Experimental Evaluation", 0.5, 0.3, 12, 22, C.white);

  const metrics = [
    { label: "Intent Accuracy", val: "92%", sub: "50-command test set", color: C.brand },
    { label: "Success Rate", val: "95%", sub: "Commands executed correctly", color: C.green },
    { label: "Avg. Latency", val: "280ms", sub: "End-to-end NLP processing", color: C.accent },
    { label: "Entity Recall", val: "88%", sub: "Device + location extraction", color: C.purple },
  ];

  metrics.forEach((m, i) => {
    const x = 0.3 + i * 3.18;
    s.addShape(pres.ShapeType.rect, { x, y: 1.15, w: 2.9, h: 1.6, fill: { color: C.dark } });
    s.addShape(pres.ShapeType.rect, { x, y: 1.15, w: 2.9, h: 0.08, fill: { color: m.color } });
    s.addText(m.val, { x, y: 1.4, w: 2.9, h: 0.8, fontSize: 36, fontFace: "Calibri", color: m.color, bold: true, align: "center" });
    s.addText(m.label, { x, y: 2.25, w: 2.9, h: 0.28, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "center" });
    s.addText(m.sub, { x, y: 2.55, w: 2.9, h: 0.22, fontSize: 9.5, fontFace: "Calibri", color: C.gray, align: "center" });
  });

  // Comparison table
  s.addShape(pres.ShapeType.rect, { x: 0.3, y: 3.0, w: 12.7, h: 0.45, fill: { color: C.dark } });
  const headers = ["System", "NLP Type", "Multi-Device", "Context-Aware", "Open Source", "Offline Fallback"];
  headers.forEach((h, i) => {
    s.addText(h, { x: 0.4 + i * 2.06, y: 3.05, w: 2.0, h: 0.35, fontSize: 9, fontFace: "Calibri", color: C.brand, bold: true, align: i === 0 ? "left" : "center" });
  });

  const rows = [
    ["SmartHomeAI (Ours)", "GPT-3.5 + Rules", "✅ Yes", "✅ Yes", "✅ Yes", "✅ Yes"],
    ["SAGE [9]", "LLM (GPT-4)", "✅ Yes", "⚠️ Partial", "❌ No", "❌ No"],
    ["SASHA [12]", "LLM Agent", "✅ Yes", "✅ Yes", "❌ No", "❌ No"],
    ["Vega [11]", "LLM + Rules", "✅ Yes", "⚠️ Partial", "✅ Yes", "❌ No"],
    ["Traditional VA", "Rule-Based", "⚠️ Limited", "❌ No", "✅ Yes", "✅ Yes"],
  ];

  rows.forEach((row, i) => {
    const bg = i === 0 ? "0D3250" : (i % 2 === 0 ? "F8FAFC" : "FFFFFF");
    s.addShape(pres.ShapeType.rect, { x: 0.3, y: 3.45 + i * 0.62, w: 12.7, h: 0.6, fill: { color: bg } });
    row.forEach((cell, j) => {
      const col = i === 0 ? C.white : "334155";
      s.addText(cell, { x: 0.4 + j * 2.06, y: 3.52 + i * 0.62, w: 2.0, h: 0.46, fontSize: 10, fontFace: "Calibri", color: i === 0 && j === 0 ? C.brand : col, bold: i === 0 && j === 0, align: j === 0 ? "left" : "center" });
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 8 — Conclusion & Future Work
// ═══════════════════════════════════════════════════════════════
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 7.5, fill: { color: C.dark } });
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 1.0, fill: { color: C.surface } });
  addLabel(s, "Conclusion", 0.5, 0.1);
  addHeading(s, "Key Contributions & Future Work", 0.5, 0.3, 12, 22);

  const contributions = [
    "Implemented a complete full-stack smart home system with LLM-powered NLP",
    "Achieved 92% intent accuracy using structured prompt engineering with GPT-3.5",
    "Built a dual-mode NLP pipeline (LLM-primary, rule-based fallback) for reliability",
    "Simulated 15 IoT devices across 6 rooms with MQTT and real-time WebSocket sync",
    "Designed a React dashboard with chat, automation rules, and analytics pages",
    "Evaluated against SAGE, SASHA, and Vega — competitive on all dimensions",
  ];

  s.addText("Contributions:", { x: 0.4, y: 1.15, w: 5.8, h: 0.4, fontSize: 13, fontFace: "Calibri", color: C.brand, bold: true });
  contributions.forEach((c, i) => {
    s.addText([{ text: "✓  ", options: { color: C.green, bold: true } }, { text: c }], {
      x: 0.4, y: 1.55 + i * 0.55, w: 5.8, h: 0.48,
      fontSize: 11, fontFace: "Calibri", color: C.gray,
    });
  });

  const future = [
    { item: "Edge Deployment", detail: "Run quantized SLM on ESP32/Raspberry Pi (aligns with UG-7/UG-8)" },
    { item: "Multimodal Input", detail: "Camera + speech recognition via Vision-Language Models (UG-12)" },
    { item: "Federated Learning", detail: "On-device personalization without cloud privacy exposure (UG-6)" },
    { item: "Voice Interface", detail: "Wake-word detection + speech-to-text → NLP pipeline integration" },
    { item: "Production Security", detail: "TLS mutual auth, prompt injection defense, anomaly detection" },
    { item: "Real Hardware", detail: "ESP32 with actual MQTT broker — transition from simulation" },
  ];

  s.addText("Future Work:", { x: 7.0, y: 1.15, w: 5.8, h: 0.4, fontSize: 13, fontFace: "Calibri", color: C.accent, bold: true });
  future.forEach((f, i) => {
    s.addShape(pres.ShapeType.rect, { x: 7.0, y: 1.55 + i * 0.78, w: 6.0, h: 0.68, fill: { color: C.surface }, line: { color: C.brandDim, width: 0.5 } });
    s.addText(f.item, { x: 7.15, y: 1.6 + i * 0.78, w: 5.7, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true });
    s.addText(f.detail, { x: 7.15, y: 1.87 + i * 0.78, w: 5.7, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.gray });
  });

  // Footer CTA
  s.addShape(pres.ShapeType.rect, { x: 0.3, y: 6.8, w: 12.7, h: 0.55, fill: { color: C.brandDim }, line: { color: C.brand, width: 0.8 } });
  s.addText("github.com/smarthomeai-se455  ·  Questions Welcome  ·  Thank You!", {
    x: 0.3, y: 6.82, w: 12.7, h: 0.48, fontSize: 13, fontFace: "Calibri",
    color: C.brand, align: "center", bold: true,
  });
}

// ── Save ───────────────────────────────────────────────────────
pres.writeFile({ fileName: "/mnt/user-data/outputs/SmartHomeAI_Presentation_SE455.pptx" })
  .then(() => console.log("✅  Presentation saved: SmartHomeAI_Presentation_SE455.pptx"))
  .catch(e => console.error("Error:", e));
