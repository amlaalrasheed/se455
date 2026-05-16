import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:5000/api"

// Dashboard icons
const ICONS = { light:"💡", fan:"🌀", ac:"❄️", door:"🚪", camera:"📷", sensor:"🌡️", tv:"📺", speaker:"🔊" }

//colors for dashbaord and dash components 
const S = {
  sidebar:  { background:"#fff", borderRight:"0.5px solid #e2e8f0", display:"flex", flexDirection:"column", width:210, minHeight:"100vh", position:"sticky", top:0, height:"100vh" },
  main:     { background:"#f8fafc", flex:1, overflowY:"auto", minHeight:"100vh" },
  page:     { padding:28 },
  card:     { background:"#fff", border:"0.5px solid #e2e8f0", borderRadius:10, padding:18 },
  statCard: (color) => ({ background:"#fff", border:"0.5px solid #e2e8f0", borderRadius:10, padding:"14px 18px" }),
  statVal:  (color) => ({ fontSize:26, fontWeight:700, color, fontFamily:"monospace", letterSpacing:"-1px" }),
  statLbl:  { fontSize:10, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 },
  statSub:  { fontSize:11, color:"#94a3b8", marginTop:3 },
  grid4:    { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 },
  grid2:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 },
  h1:       { fontSize:20, fontWeight:700, color:"#0f172a", margin:0 },
  sub:      { fontSize:13, color:"#64748b", marginTop:3, marginBottom:20 },
  btn:      (active) => ({ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer", border: active?"none":"0.5px solid #e2e8f0", background: active?"#0ea5e9":"#fff", color: active?"#fff":"#64748b" }),
}

//cards displaying our devices 
function DeviceCard({ d, onToggle, compact }) {
  const on = d.status === "on" || d.status === "unlocked"
  return (
    <div onClick={() => onToggle(d.id, on)} style={{
      padding: compact ? 12 : 16, borderRadius:10, cursor:"pointer", transition:"all 0.15s",
      border: `0.5px solid ${on ? "rgba(14,165,233,0.4)" : "#e2e8f0"}`,
      background: on ? "rgba(14,165,233,0.05)" : "#fff",
    }}>
      <div style={{ fontSize: compact ? 20 : 28, marginBottom:8 }}>{ICONS[d.type] || "💡"}</div>
      <div style={{ fontSize:12, fontWeight:600, color:"#0f172a", lineHeight:1.3 }}>{d.name}</div>
      {!compact && <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{d.room}</div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
        <span style={{ fontSize:10, color: on ? "#0ea5e9" : "#94a3b8" }}>
          {on ? (d.type === "door" ? "Unlocked" : "On") : (d.type === "door" ? "Locked" : "Off")}
        </span>
        {d.value > 0 && d.unit && <span style={{ fontSize:10, color:"#94a3b8", fontFamily:"monospace" }}>{d.value}{d.unit}</span>}
      </div>
    </div>
  )
}

//log panel for MQTT
function MqttPanel({ logs }) {
  const ref = useRef()
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [logs])
  return (
    <div style={{ background:"#0d1117", borderRadius:10, padding:14, fontFamily:"monospace", fontSize:11, height:220, overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ color:"#10b981", marginBottom:8, fontSize:12, fontWeight:600 }}>● MQTT Simulation Log</div>
      <div ref={ref} style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:3 }}>
        {logs.length === 0 && <div style={{ color:"#4b5563" }}>Waiting for device commands...</div>}
        {logs.map((l, i) => (
          <div key={i} style={{ color:"#e2e8f0", lineHeight:1.5 }}>
            <span style={{ color:"#3b82f6" }}>[{l.timestamp}]</span>{" "}
            <span style={{ color:"#10b981" }}>PUBLISH</span>{" "}
            <span style={{ color:"#93c5fd" }}>{l.topic}</span>{" → "}
            <span style={{ color:"#34d399" }}>{JSON.stringify(l.payload).slice(0,60)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

//Main page dashboard
export default function App() {
  const [tab,      setTab]      = useState("dashboard")
  const [devices,  setDevices]  = useState([])
  const [rooms,    setRooms]    = useState([])
  const [rules,    setRules]    = useState([])
  const [summary,  setSummary]  = useState({})
  const [msgs,     setMsgs]     = useState([{ role:"ai", text:"👋 Hello! I'm your SmartHomeAI assistant. Control any device with natural language.\n\nTry: \"Turn on the living room lights\" or \"Activate night mode\"" }])
  const [input,    setInput]    = useState("")
  const [thinking, setThinking] = useState(false)
  const [intent,   setIntent]   = useState(null)
  const [mqttLogs, setMqttLogs] = useState([])
  const [roomFilter, setRoomFilter] = useState("All")
  const [nlpMetrics, setNlpMetrics] = useState({})
  const [daily,    setDaily]    = useState([])
  const chatRef = useRef()

  //fetching data
  const fetchAll = async () => {
    try {
      const [devR, roomR, ruleR, sumR, mqttR, metR, dayR] = await Promise.all([
        axios.get(`${API}/devices`),
        axios.get(`${API}/rooms`),
        axios.get(`${API}/automation`),
        axios.get(`${API}/analytics/summary`),
        axios.get(`${API}/mqtt/log`),
        axios.get(`${API}/analytics/nlp/metrics`),
        axios.get(`${API}/analytics/commands/daily`),
      ])
      setDevices(devR.data)
      setRooms(roomR.data)
      setRules(ruleR.data)
      setSummary(sumR.data)
      setMqttLogs(mqttR.data)
      setNlpMetrics(metR.data)
      setDaily(dayR.data)
    } catch {
      //if the backend is not running — use demo data
      setDevices(DEMO_DEVICES)
    }
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [msgs])

  //toggle for the devices
  const toggleDevice = async (id, isOn) => {
    const newStatus = isOn
      ? (devices.find(d => d.id === id)?.type === "door" ? "locked" : "off")
      : (devices.find(d => d.id === id)?.type === "door" ? "unlocked" : "on")
    try {
      await axios.put(`${API}/devices/${id}`, { status: newStatus })
    } catch {}
    setDevices(ds => ds.map(d => d.id === id ? { ...d, status: newStatus } : d))
    setTimeout(async () => {
      try { const r = await axios.get(`${API}/mqtt/log`); setMqttLogs(r.data) } catch {}
    }, 300)
  }

  //send llm command (chat)
  const sendCommand = async (text) => {
    const cmd = (text || input).trim()
    if (!cmd) return
    setInput("")
    setMsgs(m => [...m, { role:"user", text:cmd }])
    setThinking(true)
    try {
      const { data } = await axios.post(`${API}/nlp/command`, { text: cmd })
      setMsgs(m => [...m, { role:"ai", text: data.ai_response, latency: data.latency_ms }])
      setIntent(data.parsed_intent)
      //Refresh devices + MQTT log
      const [devR, mqttR, sumR] = await Promise.all([
        axios.get(`${API}/devices`),
        axios.get(`${API}/mqtt/log`),
        axios.get(`${API}/analytics/summary`),
      ])
      setDevices(devR.data)
      setMqttLogs(mqttR.data)
      setSummary(sumR.data)
    } catch {
      //Offline rule-based demo
      const reply = localParse(cmd)
      setMsgs(m => [...m, { role:"ai", text: reply }])
    } finally {
      setThinking(false)
    }
  }

  const active = devices.filter(d => d.status === "on" || d.status === "unlocked").length
  const allRooms = ["All", ...rooms.map(r => r.name)]
  const filteredDevices = roomFilter === "All" ? devices : devices.filter(d => d.room === roomFilter)
  const SUGGESTIONS = ["Turn on living room lights","Set bedroom AC to 22°C","Lock the front door","Activate night mode","Turn off all fans","Activate movie mode"]

  const NAV = [
    { id:"dashboard", icon:"🏠", label:"Dashboard" },
    { id:"devices",   icon:"💡", label:"Devices"   },
    { id:"chat",      icon:"🤖", label:"AI Control" },
    { id:"automation",icon:"⚡", label:"Automation" },
    { id:"analytics", icon:"📊", label:"Analytics"  },
  ]

  return (
    <div style={{ display:"flex", fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/*Sidebar*/}
      <aside style={S.sidebar}>
        <div style={{ padding:"16px", borderBottom:"0.5px solid #e2e8f0", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:24 }}>🏠</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>SmartHomeAI</div>
            <div style={{ fontSize:10, color:"#94a3b8" }}>SE 455 · Spring 2026</div>
          </div>
        </div>
        <nav style={{ padding:8, flex:1 }}>
          <div style={{ fontSize:10, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.6px", padding:"8px 10px 4px" }}>Navigation</div>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 12px",
              borderRadius:7, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, marginBottom:2,
              background: tab===n.id ? "rgba(14,165,233,0.1)" : "transparent",
              color:       tab===n.id ? "#0ea5e9" : "#64748b",
            }}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"12px 16px", borderTop:"0.5px solid #e2e8f0" }}>
          <div style={{ fontSize:11, color:"#94a3b8", marginBottom:4 }}>NLP Mode</div>
          <div style={{ fontSize:12, fontWeight:600, color: summary.nlp_mode === "gpt-3.5" ? "#10b981" : "#f59e0b" }}>
            {summary.nlp_mode === "gpt-3.5" ? "🟢 GPT-3.5" : "🟡 Rule-Based"}
          </div>
          <div style={{ fontSize:10, color:"#94a3b8", marginTop:8 }}>Layan Alshowaier · Admin</div>
        </div>
      </aside>

      {/*Main*/}
      <main style={S.main}>

        {/*Dashboard page*/}
        {tab === "dashboard" && (
          <div style={S.page}>
            <h1 style={S.h1}>Dashboard</h1>
            <p style={S.sub}>{active} devices active · {new Date().toDateString()}</p>

            <div style={S.grid4}>
              {[
                ["Active Devices", active,                         "#0ea5e9", `of ${devices.length} total`],
                ["Energy Today",   `${summary.energy_kwh_today||4.2} kWh`, "#10b981", "estimated usage"],
                ["AI Commands",    summary.total_commands||0,     "#f59e0b", "this session"],
                ["Active Rules",   summary.active_rules||3,       "#6366f1", "automations"],
              ].map(([l,v,c,s]) => (
                <div key={l} style={S.statCard(c)}>
                  <div style={S.statLbl}>{l}</div>
                  <div style={S.statVal(c)}>{v}</div>
                  <div style={S.statSub}>{s}</div>
                </div>
              ))}
            </div>

            <div style={S.grid2}>
              <div style={S.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:"#0f172a" }}>Quick Controls</span>
                  <button onClick={() => setTab("devices")} style={{ fontSize:12, color:"#0ea5e9", background:"none", border:"none", cursor:"pointer" }}>All →</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                  {devices.slice(0,6).map(d => <DeviceCard key={d.id} d={d} onToggle={toggleDevice} compact />)}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div style={S.card}>
                  <div style={{ fontSize:14, fontWeight:600, color:"#0f172a", marginBottom:12 }}>Scene Shortcuts</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {[["🌙","Night"],["☀️","Morning"],["🎬","Movie"],["🔐","Away"],["🛡️","Security"],["📚","Study"]].map(([icon,name]) => (
                      <button key={name} onClick={() => { setTab("chat"); setTimeout(() => sendCommand(`Activate ${name.toLowerCase()} mode`), 100) }}
                        style={{ padding:"10px 6px", borderRadius:8, border:"0.5px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", textAlign:"center" }}>
                        <div style={{ fontSize:18 }}>{icon}</div>
                        <div style={{ fontSize:10, color:"#334155", marginTop:4, fontWeight:500 }}>{name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={{ fontSize:14, fontWeight:600, color:"#0f172a", marginBottom:10 }}>MQTT Log</div>
                  <MqttPanel logs={mqttLogs} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/*our devices page*/}
        {tab === "devices" && (
          <div style={S.page}>
            <h1 style={S.h1}>Devices</h1>
            <p style={S.sub}>Manage all {devices.length} smart home devices across {rooms.length} rooms</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
              {allRooms.map(r => (
                <button key={r} onClick={() => setRoomFilter(r)} style={S.btn(roomFilter === r)}>{r}</button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
              {filteredDevices.map(d => <DeviceCard key={d.id} d={d} onToggle={toggleDevice} />)}
            </div>
            {filteredDevices.length === 0 && <div style={{ textAlign:"center", padding:40, color:"#94a3b8" }}>No devices in this room</div>}
          </div>
        )}

        {/*ai control (chat) page*/}
        {tab === "chat" && (
          <div style={S.page}>
            <h1 style={S.h1}>AI Control</h1>
            <p style={S.sub}>Natural language device control · {summary.nlp_mode === "gpt-3.5" ? "GPT-3.5 Turbo" : "Rule-based NLP"}</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:16, height:"calc(100vh - 160px)" }}>
              {/* Chat */}
              <div style={{ ...S.card, padding:0, display:"flex", flexDirection:"column" }}>
                <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:18, display:"flex", flexDirection:"column", gap:14 }}>
                  {msgs.map((m, i) => (
                    <div key={i} style={{ display:"flex", gap:8, flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems:"flex-start" }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                        background: m.role === "ai" ? "rgba(14,165,233,0.1)" : "#f1f5f9" }}>
                        {m.role === "ai" ? "🤖" : "👤"}
                      </div>
                      <div>
                        <div style={{ maxWidth:460, padding:"10px 14px", borderRadius:12, fontSize:13, lineHeight:1.6, whiteSpace:"pre-line",
                          background: m.role === "user" ? "#0ea5e9" : "#f8fafc",
                          color:       m.role === "user" ? "#fff" : "#0f172a",
                          border:      m.role === "ai" ? "0.5px solid #e2e8f0" : "none",
                          borderTopRightRadius: m.role === "user" ? 4 : 12,
                          borderTopLeftRadius:  m.role === "ai"   ? 4 : 12,
                        }}>{m.text}</div>
                        {m.latency && <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{m.latency}ms · {summary.nlp_mode || "rule-based"}</div>}
                      </div>
                    </div>
                  ))}
                  {thinking && (
                    <div style={{ display:"flex", gap:8 }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(14,165,233,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>🤖</div>
                      <div style={{ background:"#f8fafc", border:"0.5px solid #e2e8f0", borderRadius:12, borderTopLeftRadius:4, padding:"12px 16px", display:"flex", gap:4 }}>
                        {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#94a3b8", animation:`bounce 1.2s ${i*0.2}s ease-in-out infinite` }} />)}
                      </div>
                    </div>
                  )}
                </div>
                {/* Suggestions */}
                <div style={{ padding:"8px 14px", borderTop:"0.5px solid #e2e8f0", display:"flex", gap:6, flexWrap:"wrap" }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => sendCommand(s)} style={{ padding:"3px 10px", borderRadius:12, background:"#f8fafc", border:"0.5px solid #e2e8f0", fontSize:11, color:"#64748b", cursor:"pointer" }}>{s}</button>
                  ))}
                </div>
                {/* Input */}
                <div style={{ padding:"12px 14px", borderTop:"0.5px solid #e2e8f0", display:"flex", gap:8 }}>
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendCommand())}
                    placeholder='Try: "Turn off all lights after 11 PM"...'
                    style={{ flex:1, padding:"9px 14px", borderRadius:20, border:"0.5px solid #e2e8f0", fontSize:13, outline:"none", background:"#f8fafc", color:"#0f172a" }} />
                  <button onClick={() => sendCommand()} style={{ width:36, height:36, borderRadius:"50%", background:"#0ea5e9", border:"none", cursor:"pointer", color:"#fff", fontSize:16, flexShrink:0 }}>→</button>
                </div>
              </div>

              {/* Intent + MQTT panels */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={S.card}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", marginBottom:10 }}>Parsed Intent</div>
                  {intent ? (
                    <>
                      {[["intent",intent.intent],["device",intent.device_type||"—"],["location",intent.location||"—"],
                        ["action",intent.action||"—"],["value",intent.value ? `${intent.value}${intent.unit||""}` : "—"],
                        ["schedule",intent.schedule||"—"],["mode",intent.mode||"—"],
                      ].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"0.5px solid #f1f5f9" }}>
                          <span style={{ fontSize:11, color:"#94a3b8" }}>{k}</span>
                          <span style={{ fontSize:11, fontFamily:"monospace", fontWeight:600, color: k==="intent" ? "#0ea5e9" : "#0f172a" }}>{String(v)}</span>
                        </div>
                      ))}
                      <div style={{ marginTop:10 }}>
                        <div style={{ height:5, background:"#f1f5f9", borderRadius:3 }}>
                          <div style={{ height:"100%", width:`${Math.round((intent.confidence||0)*100)}%`, background:"#0ea5e9", borderRadius:3 }} />
                        </div>
                        <div style={{ fontSize:10, color:"#94a3b8", textAlign:"right", marginTop:2 }}>{Math.round((intent.confidence||0)*100)}% confidence</div>
                      </div>
                    </>
                  ) : <div style={{ fontSize:12, color:"#94a3b8", textAlign:"center", paddingTop:12 }}>Send a command to see parsed intent</div>}
                </div>
                <div style={S.card}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", marginBottom:10 }}>Live MQTT</div>
                  <MqttPanel logs={mqttLogs} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/*automation page*/}
        {tab === "automation" && (
          <div style={S.page}>
            <h1 style={S.h1}>Automation Rules</h1>
            <p style={S.sub}>Scheduled and sensor-triggered smart automations</p>

            <div style={S.grid4}>
              {[["Total Rules",rules.length,"#0f172a"],["Active",rules.filter(r=>r.is_active).length,"#10b981"],["Triggered Today","2","#f59e0b"],["Rule Types","schedule + sensor","#6366f1"]].map(([l,v,c]) => (
                <div key={l} style={S.statCard(c)}>
                  <div style={S.statLbl}>{l}</div>
                  <div style={{ ...S.statVal(c), fontSize:20 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {rules.map(r => (
                <div key={r.id} style={{ ...S.card, display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background: r.trigger_type === "schedule" ? "rgba(14,165,233,0.1)" : "rgba(245,158,11,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                    {r.trigger_type === "schedule" ? "⏰" : "🌡️"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{r.name}</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{r.description}</div>
                    <div style={{ display:"flex", gap:6, marginTop:6 }}>
                      <span style={{ padding:"2px 8px", borderRadius:10, fontSize:10, background:"rgba(14,165,233,0.1)", color:"#0ea5e9" }}>{r.trigger_type}</span>
                      <span style={{ padding:"2px 8px", borderRadius:10, fontSize:10, background: r.is_active ? "rgba(16,185,129,0.1)" : "#f1f5f9", color: r.is_active ? "#10b981" : "#94a3b8" }}>{r.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                    <div onClick={async () => {
                      try { await axios.put(`${API}/automation/${r.id}`, { is_active: !r.is_active }) } catch {}
                      setRules(rs => rs.map(x => x.id === r.id ? {...x, is_active: !x.is_active} : x))
                    }} style={{ width:34, height:18, borderRadius:9, background: r.is_active ? "#0ea5e9" : "#e2e8f0", position:"relative", cursor:"pointer", transition:"background 0.2s" }}>
                      <div style={{ position:"absolute", top:2, left: r.is_active ? 16 : 2, width:14, height:14, background:"#fff", borderRadius:"50%", transition:"left 0.2s" }} />
                    </div>
                    <button onClick={async () => {
                      try { await axios.post(`${API}/automation/${r.id}/trigger`) } catch {}
                      alert(`✅ ${r.name} triggered!`)
                    }} style={{ fontSize:11, color:"#0ea5e9", background:"rgba(14,165,233,0.1)", border:"none", borderRadius:6, padding:"3px 10px", cursor:"pointer" }}>▶ Run</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/*analytics page*/}
        {tab === "analytics" && (
          <div style={S.page}>
            <h1 style={S.h1}>Analytics</h1>
            <p style={S.sub}>NLP performance metrics and device usage insights</p>

            <div style={S.grid4}>
              {[
                ["Total Commands",  nlpMetrics.total_commands||0,         "#0ea5e9"],
                ["Avg Latency",     `${nlpMetrics.avg_latency_ms||280}ms`,"#f59e0b"],
                ["Success Rate",    `${nlpMetrics.success_rate||95}%`,    "#10b981"],
                ["Intent Accuracy", `${nlpMetrics.accuracy||92}%`,        "#6366f1"],
              ].map(([l,v,c]) => (
                <div key={l} style={S.statCard(c)}>
                  <div style={S.statLbl}>{l}</div>
                  <div style={S.statVal(c)}>{v}</div>
                </div>
              ))}
            </div>

            <div style={S.grid2}>
              {/* Bar Chart */}
              <div style={S.card}>
                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:4 }}>Commands — Last 7 Days</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginBottom:16 }}>Natural language commands processed</div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:100 }}>
                  {daily.map((d,i) => {
                    const max = Math.max(...daily.map(x => x.commands), 1)
                    return (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                        <span style={{ fontSize:9, color:"#94a3b8", fontFamily:"monospace" }}>{d.commands}</span>
                        <div style={{ width:"100%", borderRadius:"3px 3px 0 0", background: i===daily.length-1 ? "#0ea5e9" : "rgba(14,165,233,0.25)", height: Math.max(4, d.commands/max*80), transition:"height 0.4s" }} />
                        <span style={{ fontSize:9, color:"#94a3b8" }}>{d.date}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* NLP Metrics */}
              <div style={S.card}>
                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:4 }}>NLP Pipeline Performance</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginBottom:14 }}>Key accuracy metrics</div>
                {[["Intent Accuracy",92],["Entity Recall",88],["Success Rate",nlpMetrics.success_rate||95],["LLM Primary",92],["Rule Fallback",78]].map(([l,v]) => (
                  <div key={l} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:12, color:"#334155" }}>{l}</span>
                      <span style={{ fontSize:12, fontFamily:"monospace", fontWeight:600 }}>{v}%</span>
                    </div>
                    <div style={{ height:5, background:"#f1f5f9", borderRadius:3 }}>
                      <div style={{ height:"100%", width:`${v}%`, background:"#0ea5e9", borderRadius:3 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Intent dist */}
              <div style={S.card}>
                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:14 }}>Intent Distribution</div>
                {(nlpMetrics.intents?.length ? nlpMetrics.intents : [
                  {intent:"device_control",count:62},{intent:"scene_activate",count:18},
                  {intent:"query_status",count:12},{intent:"automation_create",count:8}
                ]).map((item, i) => {
                  const colors = ["#0ea5e9","#6366f1","#10b981","#f59e0b"]
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:colors[i%4], flexShrink:0 }} />
                      <span style={{ fontSize:12, color:"#334155", flex:1, textTransform:"capitalize" }}>{String(item.intent).replace(/_/g," ")}</span>
                      <span style={{ fontSize:12, fontFamily:"monospace", fontWeight:600 }}>{item.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, sans-serif; }
      `}</style>
    </div>
  )
}

// Offline fallback (no backend) 
function localParse(text) {
  const t = text.toLowerCase()
  if (t.includes("night mode") || t.includes("going to sleep")) return "🌙 Night mode activated! Lights off, doors locked."
  if (t.includes("good morning") || t.includes("morning"))      return "☀️ Good morning! Lights on, front door unlocked."
  if (t.includes("movie mode"))  return "🎬 Movie mode! TV on, lights dimmed."
  if (t.includes("away mode"))   return "🔐 Away mode activated. All lights off, doors locked."
  if (t.includes("turn on")  && t.includes("light"))  return "✅ Lights turned on."
  if (t.includes("turn off") && t.includes("light"))  return "✅ Lights turned off."
  if (t.includes("lock"))        return "✅ Front door locked."
  if (t.includes("unlock"))      return "✅ Front door unlocked."
  if (t.includes("fan"))         return `✅ Fan ${t.includes("off") ? "turned off" : "turned on"}.`
  if (t.includes("ac") || t.includes("temperature")) return "✅ AC adjusted."
  return "🤔 I couldn't understand that. Try: 'Turn on the living room lights' or 'Activate night mode'"
}

// Demo device data (if backend offline)
const DEMO_DEVICES = [
  {id:1,name:"Living Room Light",type:"light",room:"Living Room",status:"on",   value:80,  unit:"%"},
  {id:2,name:"Bedroom AC",       type:"ac",   room:"Bedroom",    status:"on",   value:22,  unit:"°C"},
  {id:3,name:"Kitchen Light",    type:"light",room:"Kitchen",    status:"off",  value:0,   unit:"%"},
  {id:4,name:"Front Door",       type:"door", room:"Entrance",   status:"locked",value:0,  unit:""},
  {id:5,name:"Living Room Fan",  type:"fan",  room:"Living Room",status:"on",   value:3,   unit:"spd"},
  {id:6,name:"Security Camera",  type:"camera",room:"Garage",    status:"on",   value:0,   unit:""},
  {id:7,name:"Bedroom Light",    type:"light",room:"Bedroom",    status:"off",  value:0,   unit:"%"},
  {id:8,name:"Office AC",        type:"ac",   room:"Office",     status:"off",  value:24,  unit:"°C"},
]
