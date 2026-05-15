import sys, os

# this adds the backend folder to the python path and allows the test file to import server.py even though its in another folder
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# we import pytest to create and run test cases
import pytest

# this imports flask app, rule based parser, and device data from the backend server
from server import app, parse_rule_based, DEVICES

@pytest.fixture
def client():
    #this enables the flask testing mode so that we can catch errors more easily during tests
    app.config["TESTING"] = True
    # this is a temp test client that sends fake requests to the api
    # this allows us to test the backend without having to run the server manually
    with app.test_client() as c:
        yield c

# Health check
def test_health(client):
    # calling the health endpoint to make sure that the backend is running
    r = client.get("/api/health")
    # the endpoint should return a successful http message
    assert r.status_code == 200
    # the response json should confirm that the server status is okay
    assert r.get_json()["status"] == "ok"

# Devices
def test_get_devices(client):
    # requesting the smart home devices list from the backend
    r = client.get("/api/devices")
    # the request should be successful
    assert r.status_code == 200
    # the project should result at least the default set of devices
    assert len(r.get_json()) >= 8

def test_update_device(client):
    # sending a PUT request to update device no.1 and turn it on
    r = client.put("/api/devices/1", json={"status":"on"}, content_type="application/json")
    # the update request should be successfull
    assert r.status_code == 200
    # the returned device status should match the new value that we set
    assert r.get_json()["status"] == "on"

# NLP
def test_nlp_command(client):
    # sending a natural language command to the nlp endpoint
    r = client.post("/api/nlp/command", json={"text":"Turn on the lights"}, content_type="application/json")
    # the endpoint should successfully process the command
    assert r.status_code == 200
    # the response should include an ai response field
    assert "ai_response" in r.get_json()

def test_nlp_empty(client):
    # sending an empty nlp command so that we can make sure that the backend handles any invalid input
    r = client.post("/api/nlp/command", json={"text":""}, content_type="application/json")
    # the empty commands should be rejected with a bad request response
    assert r.status_code == 400

def test_suggestions(client):
    # requesting an example of an nlp command from the backend
    r = client.get("/api/nlp/suggestions")
    # the request should succeed
    assert r.status_code == 200
    # the suggestions list shouldnt be empty
    assert len(r.get_json()) > 0

# Rule parser testing
def test_parse_turn_on():
    # this tests if the parser is correctly understanding a command about turning on the lights
    r, _ = parse_rule_based("Turn on the living room lights")
    # the parser should be able to classify this as a device control command
    assert r["intent"] == "device_control"
    # it should be detected as a turn_on action
    assert r["action"] == "turn_on"
    # it should detect the device type as light
    assert r["device_type"] == "light"

def test_parse_scene():
    # this tests whether the parser can recognize predefined scene commands
    r, _ = parse_rule_based("Activate night mode")
    # the command should be classified as scene activation
    assert r["intent"] == "scene_activate"
    # and the detected scene must be night mode
    assert r["scene"] == "night mode"

def test_parse_temperature():
    # this tests whether the parser is able to extract device type and numeric values for temp
    r, _ = parse_rule_based("Set bedroom AC to 22 degrees")
    # the parser should be able to identify the ac as the target device
    assert r["device_type"] == "ac"
    # the parser should extract the temp val as 22
    assert r["value"] == 22.0

def test_parse_lock():
    # this tests whether the parser can handle door lock mechanism commands
    r, _ = parse_rule_based("Lock the front door")
    # it should detect the action as lock
    assert r["action"] == "lock"
    # and the device type should be detected as door
    assert r["device_type"] == "door"

def test_parse_query():
    # this tests if the parser is able to recognize a status question as opposed to a control command
    r, _ = parse_rule_based("What is the kitchen temperature?")
    # it could classify the command as a status query
    assert r["intent"] == "query_status"

# Automation
def test_get_rules(client):
    # this requests the list of automation rules
    r = client.get("/api/automation")
    # the automation rules should successfully respond
    assert r.status_code == 200
    # the system should return at least the default automation rules
    assert len(r.get_json()) >= 3

def test_trigger_rule(client):
    # this manually triggers automation rule no.1
    r = client.post("/api/automation/1/trigger")
    # the request should succeed after the rule trigger
    assert r.status_code == 200

# Analytics
def test_analytics_summary(client):
    # we want to request the analytics summary from the backend
    r = client.get("/api/analytics/summary")
    # the analytics endpoint should respond successfully
    assert r.status_code == 200
    # we want to store the json response to check its fields
    data = r.get_json()
    # the total number of devices should be included in the summary
    assert "total_devices" in data
    # the summary should also include the number of currently active devices
    assert "active_devices" in data

def test_mqtt_log(client):
    # requesting the mqtt message log
    r = client.get("/api/mqtt/log")
    # should respond successfully
    assert r.status_code == 200
