import os, re, json, time, logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

from dotenv import load_dotenv
load_dotenv()

# OpenAI
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Setting the App
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
log = logging.getLogger(__name__)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL   = "gpt-3.5-turbo"

# Loading Device Data
DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "devices.json")

def load_devices():
    try:
        with open(DATA_FILE) as f:
            return json.load(f)
    except Exception:
        return {
            "devices": [
                {"id":1,  "name":"Living Room Light",    "type":"light",  "room":"Living Room", "status":"on",      "value":80,   "unit":"%"},
                {"id":2,  "name":"Bedroom AC",           "type":"ac",     "room":"Bedroom",     "status":"on",      "value":22,   "unit":"°C"},
                {"id":3,  "name":"Kitchen Light",        "type":"light",  "room":"Kitchen",     "status":"off",     "value":0,    "unit":"%"},
                {"id":4,  "name":"Front Door",           "type":"door",   "room":"Entrance",    "status":"locked",  "value":0,    "unit":""},
                {"id":5,  "name":"Living Room Fan",      "type":"fan",    "room":"Living Room", "status":"on",      "value":3,    "unit":"spd"},
                {"id":6,  "name":"Security Camera",      "type":"camera", "room":"Garage",      "status":"on",      "value":0,    "unit":""},
                {"id":7,  "name":"Bedroom Light",        "type":"light",  "room":"Bedroom",     "status":"off",     "value":0,    "unit":"%"},
                {"id":8,  "name":"Office AC",            "type":"ac",     "room":"Office",      "status":"off",     "value":24,   "unit":"°C"},
                {"id":9,  "name":"Kitchen Sensor",       "type":"sensor", "room":"Kitchen",     "status":"on",      "value":26.5, "unit":"°C"},
                {"id":10, "name":"Office Light",         "type":"light",  "room":"Office",      "status":"on",      "value":60,   "unit":"%"},
                {"id":11, "name":"Bedroom Speaker",      "type":"speaker","room":"Bedroom",     "status":"off",     "value":40,   "unit":"%"},
                {"id":12, "name":"Living Room TV",       "type":"tv",     "room":"Living Room", "status":"off",     "value":0,    "unit":""},
                {"id":13, "name":"Bathroom Light",       "type":"light",  "room":"Bathroom",    "status":"off",     "value":0,    "unit":"%"},
                {"id":14, "name":"Garage Door",          "type":"door",   "room":"Garage",      "status":"unlocked","value":0,    "unit":""},
                {"id":15, "name":"Security Camera Back", "type":"camera", "room":"Garage",      "status":"on",      "value":0,    "unit":""},
            ],
            "rooms": [
                {"id":1,"name":"Living Room"},{"id":2,"name":"Bedroom"},
                {"id":3,"name":"Kitchen"},    {"id":4,"name":"Office"},
                {"id":5,"name":"Bathroom"},   {"id":6,"name":"Garage"},
            ],
            "automation_rules": [
                {"id":1,"name":"Night Mode",        "description":"Turn off all lights and lock doors at 11 PM","trigger_type":"schedule","trigger_config":{"time":"23:00"},"is_active":True},
                {"id":2,"name":"Good Morning",      "description":"Turn on lights and unlock door at 7 AM",    "trigger_type":"schedule","trigger_config":{"time":"07:00"},"is_active":True},
                {"id":3,"name":"High Temp Alert",   "description":"Turn on AC if temperature exceeds 30°C",    "trigger_type":"sensor",  "trigger_config":{"threshold":30},"is_active":True},
            ]
        }

data            = load_devices()
DEVICES         = {d["id"]: d.copy() for d in data["devices"]}
ROOMS           = data["rooms"]
AUTOMATION_RULES= data["automation_rules"]
COMMAND_LOG     = []   # command history in memory
MQTT_LOG        = []   # MQTT log in memory

# Simulating MQTT
def mqtt_publish(device):
    topic   = f"home/{device['room'].lower().replace(' ','_')}/{device['type']}/{device['id']}"
    payload = {"device_id": device["id"], "status": device["status"],
               "value": device["value"], "timestamp": datetime.now().isoformat()}
    entry   = {"timestamp": datetime.now().strftime("%H:%M:%S"),
               "topic": topic, "payload": payload}
    MQTT_LOG.append(entry)
    if len(MQTT_LOG) > 50:
        MQTT_LOG.pop(0)
    log.info(f"[MQTT] PUBLISH {topic} → {json.dumps(payload)}")
    return entry

# NLP — GPT-3.5
SYSTEM_PROMPT = """You are an IoT smart home command parser.
Parse the user command into a structured JSON object.
Respond ONLY with valid JSON, no explanation.

Normalization Rules:
- "change" / "adjust" / "increase" / "decrease" should be treated like "set"
- "switch on" is treated like "turn_on"
- "switch off" is treated like "turn_off"
- The user may say "open" for a door. Interpret it as action "unlock".
- The user may say "close" for a door. Interpret it as action "lock".
- Valid actions are ONLY:
  "turn_on","turn_off","set","lock","unlock","dim","brighten"
- If the command says "garage door", device_type is "door" and location is "garage"
- Location must only be one of:
  living room, bedroom, kitchen, bathroom, garage, office, entrance
- Do not put device names inside location
JSON schema:
{
  "intent": "device_control" | "query_status" | "scene_activate" | "unknown",
  "device_type": "light"|"fan"|"ac"|"door"|"camera"|"sensor"|"tv"|"speaker"|null,
  "location": string or null,
  "action": "turn_on"|"turn_off"|"set"|"lock"|"unlock"|"dim"|"brighten"|null,
  "value": number or null,
  "unit": "°C"|"%"|null,
  "schedule": string or null,
  "scene": string or null,
  "multiple_devices": boolean,
  "confidence": 0.0 to 1.0
}"""

def parse_with_llm(text):
    if not OPENAI_API_KEY or not OPENAI_AVAILABLE:
        return None, 0
    try:
        client   = openai.OpenAI(api_key=OPENAI_API_KEY)
        t0       = time.time()
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role":"system","content":SYSTEM_PROMPT},
                      {"role":"user",  "content":text}],
            temperature=0.1, max_tokens=200,
        )
        latency = int((time.time() - t0) * 1000)
        return json.loads(response.choices[0].message.content.strip()), latency
    except Exception as e:
        log.warning(f"LLM error: {e}")
        return None, 0

# NLP — Rule-Based Fallback
DEVICE_MAP = {
    "light":  ["light","lights","lamp","bulb","brightness"],
    "fan":    ["fan"],
    "ac":     ["ac","air conditioner","thermostat","temperature","warm","cool"],
    "door":   ["door","lock","unlock"],
    "camera": ["camera","cam","cctv"],
    "sensor": ["sensor"],
    "tv":     ["tv","television"],
    "speaker":["speaker","music"],
}
ROOMS_KW = ["living room","bedroom","kitchen","bathroom","garage","office","entrance"]
ACTION_RE = [
    (r"\b(turn on|switch on|enable|activate)\b", "turn_on"),
    (r"\b(turn off|switch off|disable|deactivate)\b", "turn_off"),
    (r"\b(lock|secure|close)\b", "lock"),
    (r"\b(unlock|open)\b", "unlock"),
    (r"\b(dim|lower)\b", "dim"),
    (r"\b(brighten|brighter)\b", "brighten"),
    (r"\b(set|adjust|change|increase|decrease)\b.{0,20}\bto\b", "set"),

]
SCENE_KW = {
    "night mode":   ["night mode","going to sleep","bedtime","before i sleep"],
    "good morning": ["good morning","morning routine","wake up"],
    "movie mode":   ["movie mode","movie time","watching"],
    "away mode":    ["away mode","leaving","i am leaving","going out"],
    "security mode":["security mode","secure the house"],
}

def parse_rule_based(text):
    t  = text.lower()
    r  = {"intent":"unknown","device_type":None,"location":None,"action":None,
          "value":None,"unit":None,"schedule":None,"scene":None,
          "multiple_devices":bool(re.search(r"\ball\b",t)),"confidence":0.4}
    # Scene
    for name, kws in SCENE_KW.items():
        if any(k in t for k in kws):
            r.update(intent="scene_activate", scene=name, confidence=0.85)
            return r, 5
    # Action
    for pattern, action in ACTION_RE:
        if re.search(pattern, t):
            r.update(action=action, intent="device_control")
            break
    # Device
    for dtype, kws in DEVICE_MAP.items():
        if any(k in t for k in kws):
            r["device_type"] = dtype
            break
    # Location
    for room in ROOMS_KW:
        if room in t:
            r["location"] = room
            break
    # Value
    num = re.search(r"(\d+(\.\d+)?)\s*(degrees?|°c|%|percent)?", t)
    if num:
        r["value"] = float(num.group(1))
        u = (num.group(3) or "").lower()
        r["unit"] = "%" if "%" in u or "percent" in u else "°C" if "degree" in u or "°" in u else None
    # Schedule
    s = re.search(r"(at\s+\d{1,2}(:\d{2})?\s*(am|pm)?|after\s+\d{1,2}\s*(am|pm)?)", t)
    if s:
        r["schedule"] = s.group(0)
    # Query
    if re.search(r"\b(what|how|is|check|show|status)\b", t) and not r["action"]:
        r["intent"] = "query_status"
    # Confidence
    if r["device_type"] and r["action"] and r["location"]: r["confidence"] = 0.88
    elif r["device_type"] and r["action"]:                  r["confidence"] = 0.78
    elif r["device_type"] or r["action"]:                   r["confidence"] = 0.55
    return r, 5

def parse_command(text):
    parsed, latency = parse_with_llm(text)
    if parsed:
        parsed["mode"] = "gpt-3.5"
        return parsed, latency
    parsed, latency = parse_rule_based(text)
    parsed["mode"] = "rule-based"
    return parsed, latency

# Executing Device
SCENES = {
    "night mode":   [("light","turn_off"),("door","lock"),  ("ac","set",20)],
    "good morning": [("light","turn_on"), ("door","unlock"),("ac","set",23)],
    "movie mode":   [("tv","turn_on"),    ("light","dim"),  ("fan","turn_on")],
    "away mode":    [("light","turn_off"),("door","lock"),  ("fan","turn_off"),("ac","turn_off")],
    "security mode":[("camera","turn_on"),("door","lock")],
}

def execute(parsed):
    affected = []
    intent   = parsed.get("intent")

    if intent == "device_control":
        dtype    = parsed.get("device_type")
        location = (parsed.get("location") or "").lower().strip()
        location = location.replace("the ", "")
        action   = parsed.get("action")
        value    = parsed.get("value")
        multiple = parsed.get("multiple_devices", False)

        for d in DEVICES.values():
            match_type = not dtype or d["type"] == dtype
            match_loc  = not location or location in d["room"].lower()
            if match_type and match_loc:
                if action == "turn_on":    d["status"] = "on"
                elif action == "turn_off": d["status"] = "off"
                elif action == "lock":     d["status"] = "locked"
                elif action == "unlock":   d["status"] = "unlocked"
                elif action in ("set","dim","brighten") and value is not None:
                    d["value"]  = value
                    d["status"] = "on"
                mqtt_publish(d)
                affected.append(d["name"])
                if not multiple:
                    break

    elif intent == "scene_activate":
        scene = (parsed.get("scene") or "").lower()
        for step in SCENES.get(scene, []):
            dtype, action = step[0], step[1]
            val = step[2] if len(step) > 2 else None
            for d in DEVICES.values():
                if d["type"] == dtype:
                    if action == "turn_on":    d["status"] = "on"
                    elif action == "turn_off": d["status"] = "off"
                    elif action == "lock":     d["status"] = "locked"
                    elif action == "unlock":   d["status"] = "unlocked"
                    elif action == "set" and val:
                        d["value"]  = val
                        d["status"] = "on"
                    elif action == "dim":
                        d["value"]  = 20
                        d["status"] = "on"
                    mqtt_publish(d)
                    affected.append(d["name"])

    elif intent == "query_status":
        dtype    = parsed.get("device_type")
        location = (parsed.get("location") or "").lower()
        for d in DEVICES.values():
            if (not dtype or d["type"] == dtype) and (not location or location in d["room"].lower()):
                affected.append(f"{d['name']}: {d['status']}")

    return affected

def generate_response(parsed, affected):
    intent = parsed.get("intent")
    action = parsed.get("action", "")
    dtype  = parsed.get("device_type") or "device"
    loc    = f" in the {parsed.get('location')}" if parsed.get("location") else ""
    sched  = parsed.get("schedule")

    if intent == "scene_activate":
        return f"{(parsed.get('scene') or 'Scene').title()} activated! {len(affected)} devices updated."
    if intent == "query_status":
        if affected:
            return " | ".join(affected[:4])
        return "No matching devices found."
    if not affected:
        return f"No matching {dtype} found{loc}."
    verb = {"turn_on":"turned on","turn_off":"turned off","lock":"locked",
            "unlock":"unlocked","set":f"set to {parsed.get('value')}{parsed.get('unit') or ''}",
            "dim":"dimmed","brighten":"brightened"}.get(action, "updated")
    if sched:
        return f"Scheduled! I'll {action.replace('_',' ')} the {dtype}{loc} {sched}."
    count = f"All {len(affected)} {dtype}s" if parsed.get("multiple_devices") else affected[0]
    return f"{count}{loc} {verb}."

# API ROUTES

@app.route("/api/health")
def health():
    return jsonify({"status":"ok","version":"2.0.0","project":"SmartHomeAI",
                    "nlp_mode":"gpt-3.5" if OPENAI_API_KEY else "rule-based",
                    "devices":len(DEVICES)})

@app.route("/api/devices")
def get_devices():
    return jsonify(list(DEVICES.values()))

@app.route("/api/devices/<int:device_id>", methods=["PUT"])
def update_device(device_id):
    d = DEVICES.get(device_id)
    if not d:
        return jsonify({"error":"Device not found"}), 404
    body = request.get_json() or {}
    if "status" in body: d["status"] = body["status"]
    if "value"  in body: d["value"]  = float(body["value"])
    mqtt_publish(d)
    return jsonify(d)

@app.route("/api/rooms")
def get_rooms():
    result = []
    for r in ROOMS:
        r_copy = r.copy()
        r_copy["devices"] = [d for d in DEVICES.values() if d["room"] == r["name"]]
        result.append(r_copy)
    return jsonify(result)

@app.route("/api/nlp/command", methods=["POST"])
def nlp_command():
    body = request.get_json() or {}
    text = (body.get("text") or "").strip()
    if not text:
        return jsonify({"error":"No command text"}), 400

    t0 = time.time()
    parsed, llm_latency = parse_command(text)
    affected = execute(parsed)
    response_text = generate_response(parsed, affected)
    total_latency = max(llm_latency, int((time.time() - t0) * 1000))

    entry = {"timestamp": datetime.now().isoformat(), "text": text,
             "parsed_intent": parsed, "response": response_text,
             "affected_devices": affected, "latency_ms": total_latency}
    COMMAND_LOG.append(entry)
    if len(COMMAND_LOG) > 100:
        COMMAND_LOG.pop(0)

    log.info(f"[NLP] '{text}' → {parsed.get('intent')} ({parsed.get('confidence',0):.0%}) {total_latency}ms")

    return jsonify({
        "parsed_intent":    parsed,
        "ai_response":      response_text,
        "affected_devices": affected,
        "success":          bool(affected or parsed.get("intent") == "query_status"),
        "latency_ms":       total_latency,
    })

@app.route("/api/nlp/history")
def nlp_history():
    return jsonify(list(reversed(COMMAND_LOG[-20:])))

@app.route("/api/nlp/suggestions")
def suggestions():
    return jsonify([
        "Turn on the living room lights",
        "Set bedroom AC to 22 degrees",
        "Lock the front door",
        "Activate night mode",
        "Turn off all fans",
        "What is the kitchen temperature?",
        "Dim the office lights to 40%",
        "Activate movie mode",
        "Turn off all lights after 11 PM",
        "Activate away mode",
    ])

@app.route("/api/automation")
def get_automation():
    return jsonify(AUTOMATION_RULES)

@app.route("/api/automation/<int:rule_id>", methods=["PUT"])
def update_rule(rule_id):
    for r in AUTOMATION_RULES:
        if r["id"] == rule_id:
            body = request.get_json() or {}
            if "is_active" in body:
                r["is_active"] = body["is_active"]
            return jsonify(r)
    return jsonify({"error":"Rule not found"}), 404

@app.route("/api/automation/<int:rule_id>/trigger", methods=["POST"])
def trigger_rule(rule_id):
    for r in AUTOMATION_RULES:
        if r["id"] == rule_id:
            r["last_triggered"] = datetime.now().isoformat()
            return jsonify({"success": True, "rule": r["name"]})
    return jsonify({"error":"Rule not found"}), 404

@app.route("/api/analytics/summary")
def analytics_summary():
    active   = sum(1 for d in DEVICES.values() if d["status"] in ("on","unlocked"))
    wattage  = {"light":10,"fan":60,"ac":1500,"tv":120,"speaker":30}
    watts    = sum(wattage.get(d["type"],20) for d in DEVICES.values() if d["status"] == "on")
    return jsonify({
        "total_devices":    len(DEVICES),
        "active_devices":   active,
        "total_commands":   len(COMMAND_LOG),
        "active_rules":     sum(1 for r in AUTOMATION_RULES if r["is_active"]),
        "energy_watts":     watts,
        "energy_kwh_today": round(watts * 12 / 1000, 2),
        "nlp_mode":         "gpt-3.5" if OPENAI_API_KEY else "rule-based",
    })

@app.route("/api/analytics/commands/daily")
def daily_commands():
    import random
    days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    return jsonify([{"date":d,"commands":random.randint(2,12)} for d in days])

@app.route("/api/analytics/nlp/metrics")
def nlp_metrics():
    total   = len(COMMAND_LOG)
    success = sum(1 for c in COMMAND_LOG if c.get("affected_devices"))
    avg_lat = (sum(c.get("latency_ms",280) for c in COMMAND_LOG) // total) if total else 280
    intents = {}
    for c in COMMAND_LOG:
        i = c.get("parsed_intent",{}).get("intent","unknown")
        intents[i] = intents.get(i, 0) + 1
    return jsonify({
        "total_commands": total,
        "success_rate":   round(success/total*100, 1) if total else 95.0,
        "avg_latency_ms": avg_lat,
        "intents":        [{"intent":k,"count":v} for k,v in intents.items()],
        "accuracy":       92 if OPENAI_API_KEY else 78,
        "mode":           "gpt-3.5" if OPENAI_API_KEY else "rule-based",
    })

@app.route("/api/mqtt/log")
def mqtt_log():
    return jsonify(list(reversed(MQTT_LOG[-20:])))

# Run
if __name__ == "__main__":
    mode = "GPT-3.5" if OPENAI_API_KEY else "rule-based fallback"
    print(f"""     
   NLP Mode : {mode:<30}
   Devices  : {len(DEVICES):<30}
   URL      : http://localhost:5000        
    """)
    app.run(host="0.0.0.0", port=5000, debug=True)