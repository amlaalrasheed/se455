"""
SmartHomeAI — Simplified Test Suite
Run: python -m pytest tests/test_server.py -v
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
import pytest
from server import app, parse_rule_based, DEVICES

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c

# Health
def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"

# Devices
def test_get_devices(client):
    r = client.get("/api/devices")
    assert r.status_code == 200
    assert len(r.get_json()) >= 8

def test_update_device(client):
    r = client.put("/api/devices/1", json={"status":"on"}, content_type="application/json")
    assert r.status_code == 200
    assert r.get_json()["status"] == "on"

# NLP
def test_nlp_command(client):
    r = client.post("/api/nlp/command", json={"text":"Turn on the lights"}, content_type="application/json")
    assert r.status_code == 200
    assert "ai_response" in r.get_json()

def test_nlp_empty(client):
    r = client.post("/api/nlp/command", json={"text":""}, content_type="application/json")
    assert r.status_code == 400

def test_suggestions(client):
    r = client.get("/api/nlp/suggestions")
    assert r.status_code == 200
    assert len(r.get_json()) > 0

# Rule parser
def test_parse_turn_on():
    r, _ = parse_rule_based("Turn on the living room lights")
    assert r["intent"] == "device_control"
    assert r["action"] == "turn_on"
    assert r["device_type"] == "light"

def test_parse_scene():
    r, _ = parse_rule_based("Activate night mode")
    assert r["intent"] == "scene_activate"
    assert r["scene"] == "night mode"

def test_parse_temperature():
    r, _ = parse_rule_based("Set bedroom AC to 22 degrees")
    assert r["device_type"] == "ac"
    assert r["value"] == 22.0

def test_parse_lock():
    r, _ = parse_rule_based("Lock the front door")
    assert r["action"] == "lock"
    assert r["device_type"] == "door"

def test_parse_query():
    r, _ = parse_rule_based("What is the kitchen temperature?")
    assert r["intent"] == "query_status"

# Automation
def test_get_rules(client):
    r = client.get("/api/automation")
    assert r.status_code == 200
    assert len(r.get_json()) >= 3

def test_trigger_rule(client):
    r = client.post("/api/automation/1/trigger")
    assert r.status_code == 200

# Analytics
def test_analytics_summary(client):
    r = client.get("/api/analytics/summary")
    assert r.status_code == 200
    data = r.get_json()
    assert "total_devices" in data
    assert "active_devices" in data

def test_mqtt_log(client):
    r = client.get("/api/mqtt/log")
    assert r.status_code == 200
