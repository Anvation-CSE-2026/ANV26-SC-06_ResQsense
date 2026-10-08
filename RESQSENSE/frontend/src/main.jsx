import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Bell,
  Map as MapIcon,
  ShieldAlert,
  Users,
  Truck,
  Info,
  Settings,
  Phone,
  Navigation,
  Activity,
  Package,
  CheckCircle,
  Clock,
  Menu,
  X,
  LocateFixed,
  MessageCircle,
  AlertTriangle,
  Flame,
  Droplets,
  CloudRain,
  Radio,
  LifeBuoy,
  FileText,
  Send,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Compass,
  Lock,
  LogOut,
  Key,
  Database
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import { loadHeatmapPlugin } from "./heatLayer.js";
import {
  supabase,
  isSupabaseConfigured,
  supabaseSignUp,
  supabaseSignIn,
  supabaseSignOut,
  getSupabaseSession,
  parseSupabaseUser
} from "./supabase.js";
import {
  DashboardOverview,
  IncidentQueueDashboard,
  ControlMapDashboard,
  ResourceAllocationDashboard,
  RescueTeamsDashboard,
  EmergencyAnalyticsDashboard
} from "./dashboards.jsx";

const API = "http://localhost:5000/api";
const demoCenter = [22.5726, 88.3639];

// Fix Leaflet marker icon asset URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

// Custom colored map markers for clear visual distinction
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `<div style="
      background-color: ${color};
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

const redIcon = createCustomIcon("#e11d48");
const orangeIcon = createCustomIcon("#d97706");
const greenIcon = createCustomIcon("#10b981");

function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

// Heatmap Layer component for Leaflet
function HeatmapOverlay({ incidents }) {
  const map = useMap();

  useEffect(() => {
    let heatLayerInstance = null;
    let isMounted = true;

    // Generate disaster density points from incidents
    const heatPoints = [];
    incidents.forEach(i => {
      const lat = i.lat || demoCenter[0];
      const lng = i.lng || demoCenter[1];
      const intensity = Math.min(1.0, Math.max(0.35, (i.priority || 60) / 100));

      // Primary hazard epicenter
      heatPoints.push([lat, lng, intensity]);

      // Multi-tier radial dispersal rings to form natural disaster heat zones
      if (i.priority >= 80) {
        const ring1 = 0.007;
        const ring2 = 0.013;
        [
          [ring1, ring1], [-ring1, -ring1], [ring1, -ring1], [-ring1, ring1],
          [ring2, 0], [-ring2, 0], [0, ring2], [0, -ring2]
        ].forEach(([dlat, dlng]) => {
          heatPoints.push([lat + dlat, lng + dlng, intensity * 0.65]);
        });
      } else if (i.priority >= 60) {
        const ring = 0.006;
        [
          [ring, ring], [-ring, -ring], [ring, -ring], [-ring, ring]
        ].forEach(([dlat, dlng]) => {
          heatPoints.push([lat + dlat, lng + dlng, intensity * 0.5]);
        });
      }
    });

    loadHeatmapPlugin().then(heatLayerFn => {
      if (!isMounted || !map || !heatLayerFn || heatPoints.length === 0) return;

      heatLayerInstance = heatLayerFn(heatPoints, {
        radius: 42,
        blur: 28,
        maxZoom: 16,
        max: 1.0,
        minOpacity: 0.38,
        gradient: {
          0.10: "#10b981", // Low risk buffer (emerald)
          0.30: "#34d399", // Mild hazard (mint green)
          0.50: "#facc15", // Warning zone (yellow)
          0.70: "#f97316", // Severe danger (orange)
          0.95: "#ef4444"  // Critical disaster hotspot (crimson)
        }
      });

      heatLayerInstance.addTo(map);
    });

    return () => {
      isMounted = false;
      if (heatLayerInstance && map) {
        try {
          map.removeLayer(heatLayerInstance);
        } catch {
          // ignore cleanup error if map unmounted
        }
      }
    };
  }, [map, incidents]);

  return null;
}

function LiveMap({ incidents, teams, center, onSelect, showTeams = true, filter = "ALL" }) {
  const filteredIncidents = incidents.filter(i => {
    if (filter === "CRITICAL") return i.priority >= 80;
    if (filter === "FLOOD") return i.type?.toLowerCase().includes("flood");
    return true;
  });

  return (
    <div className="map-container-frame">
      <MapContainer center={center || demoCenter} zoom={12} scrollWheelZoom className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter center={center} />
        
        {/* Real-time Disaster Risk Heatmap */}
        <HeatmapOverlay incidents={filteredIncidents} />

        {filteredIncidents.map(i => {
          const markerIcon = i.priority >= 80 ? redIcon : orangeIcon;
          return (
            <Marker
              key={i.id}
              position={[i.lat || demoCenter[0], i.lng || demoCenter[1]]}
              icon={markerIcon}
              eventHandlers={{ click: () => onSelect?.(i) }}
            >
              <Popup>
                <div className="custom-map-popup">
                  <span className={`popup-tag ${i.priority >= 80 ? "danger" : "info"}`}>
                    Priority {i.priority}/100 • Hotspot
                  </span>
                  <div className="popup-title">{i.type} Incident</div>
                  <div className="popup-desc">
                    ID: <b>{i.id}</b> • {i.people || 1} people affected<br />
                    Status: <span style={{ textTransform: "capitalize" }}>{i.status}</span>
                  </div>
                  <button className="popup-btn" onClick={() => onSelect?.(i)}>
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {showTeams && teams.map(t => (
          <Marker key={t.id} position={[t.lat, t.lng]} icon={greenIcon}>
            <Popup>
              <div className="custom-map-popup">
                <span className="popup-tag info">{t.type} TEAM</span>
                <div className="popup-title">{t.name}</div>
                <div className="popup-desc">
                  Readiness: <b>{t.readiness}%</b> • Personnel: <b>{t.personnel}</b><br />
                  Equipment: {t.equipment?.join(", ") || "Standard"}
                </div>
                <a className="popup-btn" href={`tel:${t.phone}`}>
                  Call {t.phone}
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="map-floating-legend">
        <div className="heatmap-gradient-bar">
          <span>Heat Intensity:</span>
          <div className="gradient-track" title="Thermal Heatmap Scale"></div>
          <span>Critical</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot red"></div>
          <span>Epicenter (&ge;80)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot green"></div>
          <span>Rescue Base</span>
        </div>
      </div>
    </div>
  );
}

function Header({ role, setRole, active, setActive, gps, setGps, rescueUser, adminUser, onSignOut }) {
  const toggleLocation = () => {
    if (gps) {
      setGps(null);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          p => setGps({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
          () => {
            // Fallback default coordinates for smooth demo experience
            setGps({ lat: 22.5726, lng: 88.3639, accuracy: 10 });
          }
        );
      } else {
        setGps({ lat: 22.5726, lng: 88.3639, accuracy: 10 });
      }
    }
  };

  const isRescueAuth = !!rescueUser;
  const isAdminAuth = !!adminUser;
  const activeUser = role === "rescue" ? rescueUser : role === "admin" ? adminUser : null;

  return (
    <header className="app-header">
      <div className="brand-wrapper" onClick={() => { setRole("citizen"); setActive?.("Dashboard"); }} style={{ cursor: "pointer" }}>
        <div className="brand-icon">R</div>
        <div className="brand-info">
          <h1>ResQ<span>Sense</span></h1>
          <small>Disaster Intelligence & Response</small>
        </div>
      </div>

      <div className="role-segmented-control">
        <button
          className={`role-tab-btn ${role === "citizen" ? "active" : ""}`}
          onClick={() => { setRole("citizen"); setActive?.("Dashboard"); }}
          title="Free public citizen access without login"
        >
          <LifeBuoy size={14} /> Citizen (Public)
        </button>
        <button
          className={`role-tab-btn ${role === "rescue" ? "active" : ""}`}
          onClick={() => { setRole("rescue"); setActive?.("Dashboard"); }}
          title={isRescueAuth ? "Authorized Rescue Console" : "Rescue Team Login Required"}
        >
          <Truck size={14} /> Rescue Team {!isRescueAuth && <Lock size={12} style={{ opacity: 0.65, marginLeft: 2 }} />}
        </button>
        <button
          className={`role-tab-btn ${role === "admin" ? "active" : ""}`}
          onClick={() => { setRole("admin"); setActive?.("Dashboard"); }}
          title={isAdminAuth ? "Authorized Command Console" : "Admin Command Login Required"}
        >
          <Radio size={14} /> Admin Control {!isAdminAuth && <Lock size={12} style={{ opacity: 0.65, marginLeft: 2 }} />}
        </button>
      </div>

      <div className="header-actions">
        <div className="status-pill">
          <div className="pulse-dot"></div>
          <span>System Live</span>
        </div>

        <button
          className={`location-btn ${gps ? "active" : ""}`}
          onClick={toggleLocation}
          title="Click to toggle GPS location"
        >
          <LocateFixed size={15} />
          {gps ? "GPS Active" : "Enable Location"}
        </button>

        {activeUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              className="header-user-profile"
              title={`Authenticated as ${activeUser.name} (${activeUser.agency || activeUser.role})`}
            >
              <div className="avatar-circle">
                {activeUser.name ? activeUser.name[0].toUpperCase() : activeUser.role[0].toUpperCase()}
              </div>
              <span className="user-badge-tag">
                {activeUser.badgeId || activeUser.name}
              </span>
            </div>
            <button
              className="btn-signout-chip"
              onClick={() => onSignOut(role)}
              title="Sign Out of this Session"
            >
              <LogOut size={13} /> Exit
            </button>
          </div>
        ) : (
          <div className="avatar-circle" title={role}>
            {role === "citizen" ? "C" : role === "rescue" ? "R" : "A"}
          </div>
        )}
      </div>
    </header>
  );
}

function Sidebar({ role, active, setActive }) {
  const citizenItems = [
    { label: "Dashboard", icon: <Activity size={18} /> },
    { label: "Live Map", icon: <MapIcon size={18} /> },
    { label: "Emergency SOS", icon: <ShieldAlert size={18} /> },
    { label: "My Reports", icon: <FileText size={18} /> },
    { label: "Local Intel", icon: <Compass size={18} /> },
    { label: "Preparedness", icon: <Info size={18} /> }
  ];

  const rescueItems = [
    { label: "Dashboard", icon: <Activity size={18} /> },
    { label: "Assignments", icon: <Truck size={18} /> },
    { label: "Operations Map", icon: <MapIcon size={18} /> },
    { label: "Resources", icon: <Package size={18} /> },
    { label: "Manpower Roster", icon: <Users size={18} /> }
  ];

  const adminItems = [
    { label: "Dashboard", icon: <Activity size={18} /> },
    { label: "Incident Queue", icon: <ShieldAlert size={18} /> },
    { label: "Control Map", icon: <MapIcon size={18} /> },
    { label: "Resource Allocation", icon: <Package size={18} /> },
    { label: "Rescue Teams", icon: <Truck size={18} /> },
    { label: "Emergency Analytics", icon: <Radio size={18} /> }
  ];

  const navItems = role === "citizen" ? citizenItems : role === "rescue" ? rescueItems : adminItems;

  return (
    <aside className="app-sidebar">
      <div>
        <div className="sidebar-section-title">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.label}
            className={`sidebar-nav-btn ${active === item.label ? "active" : ""}`}
            onClick={() => setActive(item.label)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="helpline-box">
        <h4><Phone size={14} /> National Helplines</h4>
        <p>Immediate dispatch & relief numbers (24/7 Toll-Free)</p>
        <div className="helpline-pills">
          <a href="tel:112" className="helpline-tag">
            <span>National Emergency</span>
            <span>112</span>
          </a>
          <a href="tel:1070" className="helpline-tag">
            <span>Disaster Management</span>
            <span>1070</span>
          </a>
          <a href="tel:108" className="helpline-tag">
            <span>Medical Ambulance</span>
            <span>108</span>
          </a>
        </div>
      </div>
    </aside>
  );
}

function StatCard({ label, value, icon, variant = "blue", trend }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon-wrapper ${variant}`}>{icon}</div>
      <div className="stat-meta">
        <small>{label}</small>
        <strong>{value}</strong>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  );
}

function Chatbot({ gps, onSOS, open, setOpen }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    { title: "What disaster or hazard are you facing?", options: ["Flood", "Landslide", "Earthquake", "Fire", "Heavy Rain", "Cyclone"] },
    { title: "Are there people trapped or stranded?", options: ["No", "1-2 people", "3-5 people", "5+ people"] },
    { title: "Is anyone critically or seriously injured?", options: ["No injuries", "Minor cuts", "Serious injuries", "Life-threatening"] },
    { title: "Can rescue vehicles reach your current spot?", options: ["Roads open", "Partially blocked", "Completely cut off", "Unknown"] },
    { title: "Approximate count of individuals requiring aid?", options: ["1 person", "2-5 people", "6-20 people", "20+ people"] }
  ];

  async function handleAnswer(choice) {
    const nextAnswers = { ...answers, [step]: choice };
    setAnswers(nextAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    const peopleCount = choice.includes("20+") ? 25 : choice.includes("6-20") ? 10 : choice.includes("2-5") ? 3 : 1;
    const isMedical = nextAnswers[2]?.toLowerCase().includes("serious") || nextAnswers[2]?.toLowerCase().includes("life");
    const accessStatus = nextAnswers[3]?.includes("Completely") ? "blocked" : nextAnswers[3]?.includes("Partially") ? "partial" : "yes";

    const payload = {
      disaster: nextAnswers[0],
      trapped: nextAnswers[1]?.replace(" people", "").replace("No", "0"),
      medical: isMedical,
      access: accessStatus,
      people: peopleCount
    };

    try {
      const res = await fetch(`${API}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult({ ...data, payload });
    } catch {
      setResult({
        priority: 85,
        severity: "CRITICAL",
        confidence: 84,
        reasons: ["Urgent hazard assessment generated", "Responder alert prepared"],
        required: { personnel: 6, resources: ["Medical Kit", "Rescue Vehicle"] },
        payload
      });
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  if (!open) {
    return (
      <button
        className="chat-circle-logo-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open Emergency AI Assistant"
        title="Emergency Assistant"
      >
        <div className="chat-circle-logo-inner">
          <MessageCircle size={26} />
          <div className="chat-online-badge"></div>
        </div>
        <div className="chat-logo-tooltip">Emergency Assistant AI</div>
      </button>
    );
  }

  return (
    <div className="chatbot-panel-wrapper">
      <div className="chat-header-bar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="chat-header-logo-badge">
            <MessageCircle size={18} color="#ffffff" />
          </div>
          <div className="chat-header-info">
            <h4>Emergency Assistant AI</h4>
            <small>5-step structured triage & responder dispatch</small>
          </div>
        </div>
        <button className="chat-close-btn" onClick={() => setOpen(false)}>
          <X size={15} />
        </button>
      </div>

      {!result ? (
        <>
          <div className="chat-content-body">
            <div className="chat-bubble-bot">{questions[step].title}</div>
            <div className="chat-options-grid">
              {questions[step].options.map(opt => (
                <button key={opt} className="chat-choice-btn" onClick={() => handleAnswer(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="chat-progress-indicator">
            <span>Question {step + 1} of 5</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {[0, 1, 2, 3, 4].map(idx => (
                <div
                  key={idx}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: idx <= step ? "#10b981" : "#d1e7dd"
                  }}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="chat-content-body">
          <div className="chat-result-view">
            <div className="chat-score-circle">
              {result.priority}
              <span>/100</span>
            </div>
            <div className="chat-severity-pill">{result.severity} PRIORITY</div>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
              Assessment Confidence: <b>{result.confidence}%</b>
            </p>

            {result.reasons && (
              <div className="chat-reasons-box">
                <b>Triage Factors:</b>
                <ul>
                  {result.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="btn-chat-primary"
              onClick={() => {
                onSOS(result);
                resetChat();
              }}
            >
              🚨 Dispatch SOS Now
            </button>
            <button className="btn-chat-secondary" onClick={resetChat}>
              Restart Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CitizenDashboard({ active, setActive, incidents, teams, gps, setIncidents, onOpenChat, onSelectIncident }) {
  const [weather, setWeather] = useState(null);
  const [mapFilter, setMapFilter] = useState("ALL");
  const [bagChecklist, setBagChecklist] = useState({
    water: true,
    firstAid: true,
    flashlight: true,
    radio: false,
    medicines: false,
    docs: false
  });

  useEffect(() => {
    const lat = gps?.lat || demoCenter[0];
    const lng = gps?.lng || demoCenter[1];
    fetch(`${API}/weather?lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then(setWeather)
      .catch(() => {});
  }, [gps]);

  const guidelines = [
    { title: "Flood Evacuation", icon: <Droplets size={18} />, desc: "Move immediately to higher ground. Disconnect electric main fuses. Never walk or drive in moving waters." },
    { title: "Earthquake Protocol", icon: <Activity size={18} />, desc: "Drop, Cover, and Hold on. Stay clear of overhead glass, lighting fixtures, and exterior brick walls." },
    { title: "Landslide Warnings", icon: <AlertTriangle size={18} />, desc: "Listen for unusual rumbling or tree cracking sounds. Evacuate valleys and steep mud slopes immediately." },
    { title: "Emergency Go-Bag", icon: <Package size={18} />, desc: "Pack 72-hour clean water, non-perishable food, water purifier tablets, flashlight, and essential medicines." },
    { title: "Emergency Helplines", icon: <Phone size={18} />, desc: "Toll-free 112 connects to unified state disaster police, fire, medical ambulance and NDRF teams." },
    { title: "Water Purification", icon: <ShieldCheck size={18} />, desc: "Boil water vigorously for 3 minutes or use chlorine tablets. Do not drink flood or tap water directly." }
  ];

  // 1. LIVE MAP VIEW
  if (active === "Live Map") {
    return (
      <main className="main-viewport">
        <div className="page-header-row">
          <div>
            <span className="page-eyebrow">Citizen Situational Awareness</span>
            <h2>Statewide Live Hazard & Shelter Map</h2>
            <p>Real-time spatial visualization of active alerts, flood zones, and nearby rescue forces.</p>
          </div>
          <div className="header-right-btns">
            <button className={`btn-pill-filter ${mapFilter === "ALL" ? "active" : ""}`} onClick={() => setMapFilter("ALL")}>All Hazards</button>
            <button className={`btn-pill-filter ${mapFilter === "CRITICAL" ? "active" : ""}`} onClick={() => setMapFilter("CRITICAL")}>Critical Only</button>
            <button className={`btn-pill-filter ${mapFilter === "FLOOD" ? "active" : ""}`} onClick={() => setMapFilter("FLOOD")}>Floods</button>
          </div>
        </div>
        <div className="panel-card">
          <LiveMap
            incidents={incidents}
            teams={teams}
            center={gps ? [gps.lat, gps.lng] : demoCenter}
            onSelect={onSelectIncident}
            filter={mapFilter}
          />
        </div>
      </main>
    );
  }

  // 2. EMERGENCY SOS VIEW
  if (active === "Emergency SOS") {
    return (
      <main className="main-viewport">
        <div className="page-header-row">
          <div>
            <span className="page-eyebrow" style={{ color: "#e11d48" }}>Critical Life Safety</span>
            <h2>Emergency SOS & Immediate Triage</h2>
            <p>Direct priority line to disaster response squads, ambulance dispatch, and NDRF force.</p>
          </div>
        </div>

        <div className="panel-card" style={{ background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)", border: "1px solid #fecdd3", textAlign: "center", padding: "36px 20px", marginBottom: "20px" }}>
          <ShieldAlert size={48} color="#e11d48" style={{ marginBottom: "12px" }} />
          <h3 style={{ color: "#9f1239", fontSize: "22px", margin: "0 0 8px 0" }}>Are You or Someone Nearby in Immediate Danger?</h3>
          <p style={{ color: "#be123c", maxWidth: "560px", margin: "0 auto 20px auto", fontSize: "14px" }}>
            Click the button below to launch our instant AI triage assistant. Your GPS coordinates and hazard severity will be transmitted immediately to field dispatchers.
          </p>
          <button className="btn-sos" style={{ padding: "14px 32px", fontSize: "16px", borderRadius: "10px" }} onClick={onOpenChat}>
            <ShieldAlert size={20} /> Launch Rapid SOS Triage
          </button>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>24/7 Immediate Emergency Helplines</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <a href="tel:112" className="panel-card" style={{ textDecoration: "none", background: "#f8fafc", padding: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>National Unified Emergency</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>112</div>
              <small style={{ color: "#059669", fontWeight: "600" }}>Toll-Free • 24/7</small>
            </a>
            <a href="tel:1070" className="panel-card" style={{ textDecoration: "none", background: "#f8fafc", padding: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>State Disaster Management</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>1070</div>
              <small style={{ color: "#059669", fontWeight: "600" }}>Disaster Control Room</small>
            </a>
            <a href="tel:108" className="panel-card" style={{ textDecoration: "none", background: "#f8fafc", padding: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Emergency Ambulance</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>108</div>
              <small style={{ color: "#059669", fontWeight: "600" }}>Medical Evacuation</small>
            </a>
            <a href="tel:101" className="panel-card" style={{ textDecoration: "none", background: "#f8fafc", padding: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Fire & Rescue Services</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>101</div>
              <small style={{ color: "#059669", fontWeight: "600" }}>Fire Rescue</small>
            </a>
          </div>
        </div>
      </main>
    );
  }

  // 3. MY REPORTS VIEW
  if (active === "My Reports") {
    return (
      <main className="main-viewport">
        <div className="page-header-row">
          <div>
            <span className="page-eyebrow">Community Tracking</span>
            <h2>Disaster Incident Reports Status</h2>
            <p>Live progress tracking of all civilian SOS reports and responder assignments.</p>
          </div>
          <div className="header-right-btns">
            <button className="btn-chat-primary" onClick={onOpenChat}>
              + Submit New SOS Report
            </button>
          </div>
        </div>

        <div className="panel-card">
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Hazard Type</th>
                  <th>Priority Score</th>
                  <th>People Needing Aid</th>
                  <th>Status</th>
                  <th>Assigned Force</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(inc => (
                  <tr className="table-row-item" key={inc.id}>
                    <td><b>{inc.id}</b></td>
                    <td>{inc.type}</td>
                    <td>
                      <span className={`priority-tag ${inc.priority >= 80 ? "high" : inc.priority >= 60 ? "medium" : "low"}`}>
                        {inc.priority} / 100
                      </span>
                    </td>
                    <td>{inc.people || 1} people</td>
                    <td><span className="status-badge verified">{inc.status}</span></td>
                    <td>
                      <span style={{ color: inc.assignedTeam ? "#059669" : "#64748b", fontWeight: "600" }}>
                        {inc.assignedTeam ? `Team ${inc.assignedTeam}` : "Triage in progress"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  }

  // 4. LOCAL INTEL VIEW
  if (active === "Local Intel") {
    return (
      <main className="main-viewport">
        <div className="page-header-row">
          <div>
            <span className="page-eyebrow">Environmental Monitoring</span>
            <h2>Local Meteorological & Hazard Intelligence</h2>
            <p>Real-time atmospheric telemetry, flood ingress levels, and sector warnings.</p>
          </div>
        </div>

        <div className="grid-equal-2">
          <div className="panel-card">
            <div className="panel-header">
              <h3>Live Atmospheric Telemetry</h3>
            </div>
            {weather && (
              <div className="weather-card-box">
                <div className="weather-temp-group">
                  <span className="weather-temp">{weather.current.temperature}°</span>
                  <span className="weather-condition">{weather.current.condition}</span>
                </div>
                <div className="weather-details-pills">
                  <span>Rainfall: <b>{weather.current.rainfall} mm</b></span>
                  <span>Wind Speed: <b>{weather.current.wind} km/h</b></span>
                  <span>Humidity: <b>{weather.current.humidity}%</b></span>
                </div>
              </div>
            )}
            <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>River Drainage Ingress</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Hooghly water surge level measured at +1.8m above mean seasonal threshold.</div>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <h3>Active Regional Advisories</h3>
            </div>
            <div className="alerts-list-group">
              <div className="alert-item-card critical">
                <div className="alert-item-title">
                  <span>Critical River Basin Advisory</span>
                  <span className="priority-tag high">High Alert</span>
                </div>
                <p className="alert-item-body">
                  Low-lying riverside corridors in Sector 4 are experiencing water ingress. Residents should follow safe evacuation routes.
                </p>
              </div>

              <div className="alert-item-card warning">
                <div className="alert-item-title">
                  <span>Flash Precipitation Advisory</span>
                  <span className="priority-tag medium">Caution</span>
                </div>
                <p className="alert-item-body">
                  Anticipated rainfall exceeding 25mm/hr in the next 3 hours. Avoid underground underpasses and low embankments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 5. PREPAREDNESS VIEW
  if (active === "Preparedness") {
    return (
      <main className="main-viewport">
        <div className="page-header-row">
          <div>
            <span className="page-eyebrow">Civilian Defense & Preparedness</span>
            <h2>Disaster Preparedness & Survival Manual</h2>
            <p>Interactive checklists, survival guidelines, and household safety protocols.</p>
          </div>
        </div>

        <div className="panel-card" style={{ marginBottom: "20px" }}>
          <div className="panel-header">
            <h3>🎒 72-Hour Emergency Grab-Bag Checklist</h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Tick items to verify readiness</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", padding: "10px 0" }}>
            {[
              { id: "water", label: "Clean Drinking Water (3L per person/day)" },
              { id: "firstAid", label: "Trauma Bandages & Antiseptics" },
              { id: "flashlight", label: "High-Beam Waterproof Flashlight & Batteries" },
              { id: "radio", label: "Portable Battery/Solar Emergency Radio" },
              { id: "medicines", label: "Essential Prescription Medicines (7-day supply)" },
              { id: "docs", label: "Waterproof Pouch with IDs & Emergency Cash" }
            ].map(item => (
              <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "#f8fafc", borderRadius: "8px", cursor: "pointer", border: "1px solid #e2e8f0" }}>
                <input
                  type="checkbox"
                  checked={!!bagChecklist[item.id]}
                  onChange={e => setBagChecklist({ ...bagChecklist, [item.id]: e.target.checked })}
                />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>Verified Disaster Safety Protocols</h3>
          </div>
          <div className="guidelines-grid">
            {guidelines.map(g => (
              <div className="guideline-card" key={g.title}>
                <div className="guideline-card-icon">{g.icon}</div>
                <h4>{g.title}</h4>
                <p>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // 6. DEFAULT CITIZEN DASHBOARD (Overview)
  return (
    <main className="main-viewport">
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">Citizen Safety Network</span>
          <h2>Live Emergency Response Portal</h2>
          <p>Real-time neighborhood incident monitoring, meteorological intelligence, and verified rescue dispatch.</p>
        </div>
        <div className="header-right-btns">
          <button className="btn-sos" onClick={onOpenChat}>
            <ShieldAlert size={17} /> Rapid SOS Triage
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Active Regional Alerts" value="03" icon={<Bell size={22} />} variant="rose" trend="High Alert Active" />
        <StatCard label="Verified Rescue Teams" value={teams.length ? `0${teams.length}` : "04"} icon={<Truck size={22} />} variant="green" trend="In Sector Standby" />
        <StatCard label="Response Personnel" value="36" icon={<Users size={22} />} variant="emerald" trend="Deployed & Ready" />
        <StatCard label="Weather Readiness" value={weather ? `${weather.current.temperature}°C` : "29°C"} icon={<CloudRain size={22} />} variant="amber" trend="Monsoon Advisory" />
      </div>

      <div className="dashboard-grid-2-1">
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>Live Incident & Responder Map</h3>
              <p>Real-time spatial visualization of active alerts and nearby rescue forces</p>
            </div>
            <div className="panel-header-actions">
              <button
                className={`btn-pill-filter ${mapFilter === "ALL" ? "active" : ""}`}
                onClick={() => setMapFilter("ALL")}
              >
                All Hazards
              </button>
              <button
                className={`btn-pill-filter ${mapFilter === "CRITICAL" ? "active" : ""}`}
                onClick={() => setMapFilter("CRITICAL")}
              >
                Critical Only
              </button>
              <button
                className={`btn-pill-filter ${mapFilter === "FLOOD" ? "active" : ""}`}
                onClick={() => setMapFilter("FLOOD")}
              >
                Floods
              </button>
            </div>
          </div>
          <LiveMap
            incidents={incidents}
            teams={teams}
            center={gps ? [gps.lat, gps.lng] : demoCenter}
            onSelect={onSelectIncident}
            filter={mapFilter}
          />
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>Local Meteorological Intel</h3>
              <p>Localized conditions and warnings</p>
            </div>
          </div>

          {weather && (
            <div className="weather-card-box">
              <div className="weather-temp-group">
                <span className="weather-temp">{weather.current.temperature}°</span>
                <span className="weather-condition">{weather.current.condition}</span>
              </div>
              <div className="weather-details-pills">
                <span>Rainfall: <b>{weather.current.rainfall} mm</b></span>
                <span>Wind: <b>{weather.current.wind} km/h</b></span>
                <span>Humidity: <b>{weather.current.humidity}%</b></span>
              </div>
            </div>
          )}

          <div className="alerts-list-group">
            <div className="alert-item-card critical">
              <div className="alert-item-title">
                <span>Critical Flood Warning</span>
                <span className="priority-tag high">Priority 92</span>
              </div>
              <p className="alert-item-body">
                Heavy waterlogging reported in low-lying riverside corridors. Relief boats deployed in Sector 4.
              </p>
            </div>

            <div className="alert-item-card warning">
              <div className="alert-item-title">
                <span>Rainfall Flash Advisory</span>
                <span className="priority-tag medium">Caution</span>
              </div>
              <p className="alert-item-body">
                Anticipated precipitation rate exceeding 25mm/hr. Residents in basements should seek ground elevations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Disaster Preparedness & Safety Directives</h3>
            <p>Verified civilian checklists and life-saving instructions</p>
          </div>
        </div>
        <div className="guidelines-grid">
          {guidelines.map(g => (
            <div className="guideline-card" key={g.title}>
              <div className="guideline-card-icon">{g.icon}</div>
              <h4>{g.title}</h4>
              <p>{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function RescueDashboard({ active, incidents, teams, onSelectIncident, onAssignTeam, onRefreshData }) {
  if (active === "Assignments") {
    return (
      <IncidentQueueDashboard
        incidents={incidents}
        teams={teams}
        onSelectIncident={onSelectIncident}
        onAssignTeam={onAssignTeam}
        onRefresh={onRefreshData}
      />
    );
  }
  if (active === "Operations Map") {
    return (
      <ControlMapDashboard
        incidents={incidents}
        teams={teams}
        onSelectIncident={onSelectIncident}
        onAssignTeam={onAssignTeam}
        LiveMapComponent={LiveMap}
        demoCenter={demoCenter}
      />
    );
  }
  if (active === "Resources") {
    return (
      <ResourceAllocationDashboard
        incidents={incidents}
        teams={teams}
      />
    );
  }
  if (active === "Manpower Roster") {
    return (
      <RescueTeamsDashboard
        teams={teams}
        incidents={incidents}
        onRefresh={onRefreshData}
      />
    );
  }
  // Default is "Dashboard"
  return (
    <DashboardOverview
      incidents={incidents}
      teams={teams}
      onSelectIncident={onSelectIncident}
      onAssignTeam={onAssignTeam}
      onRefresh={onRefreshData}
      LiveMapComponent={LiveMap}
      demoCenter={demoCenter}
    />
  );
}

function AdminDashboard({ active, incidents, teams, onSelectIncident, onAssignTeam, onRefreshData }) {
  if (active === "Incident Queue") {
    return (
      <IncidentQueueDashboard
        incidents={incidents}
        teams={teams}
        onSelectIncident={onSelectIncident}
        onAssignTeam={onAssignTeam}
        onRefresh={onRefreshData}
      />
    );
  }
  if (active === "Control Map") {
    return (
      <ControlMapDashboard
        incidents={incidents}
        teams={teams}
        onSelectIncident={onSelectIncident}
        onAssignTeam={onAssignTeam}
        LiveMapComponent={LiveMap}
        demoCenter={demoCenter}
      />
    );
  }
  if (active === "Resource Allocation") {
    return (
      <ResourceAllocationDashboard
        incidents={incidents}
        teams={teams}
      />
    );
  }
  if (active === "Rescue Teams") {
    return (
      <RescueTeamsDashboard
        teams={teams}
        incidents={incidents}
        onRefresh={onRefreshData}
      />
    );
  }
  if (active === "Emergency Analytics") {
    return (
      <EmergencyAnalyticsDashboard
        incidents={incidents}
        teams={teams}
      />
    );
  }
  // Default is "Dashboard"
  return (
    <DashboardOverview
      incidents={incidents}
      teams={teams}
      onSelectIncident={onSelectIncident}
      onAssignTeam={onAssignTeam}
      onRefresh={onRefreshData}
      LiveMapComponent={LiveMap}
      demoCenter={demoCenter}
    />
  );
}

function IncidentDetailDrawer({ incident, onClose, teams, onAssignTeam }) {
  if (!incident) return null;

  return (
    <div className="detail-drawer">
      <div className="drawer-header">
        <h3>Incident {incident.id}</h3>
        <button
          onClick={onClose}
          style={{ background: "#f1f5f9", padding: "6px", borderRadius: "50%" }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="drawer-priority-badge">
        {incident.priority} <span style={{ fontSize: "14px", color: "#64748b" }}>/ 100</span>
      </div>

      <div className="drawer-info-grid">
        <div>
          <small>Hazard Type</small>
          <strong>{incident.type}</strong>
        </div>
        <div>
          <small>Status</small>
          <strong style={{ textTransform: "capitalize" }}>{incident.status}</strong>
        </div>
        <div>
          <small>Casualties / Affected</small>
          <strong>{incident.people || 1} Persons</strong>
        </div>
        <div>
          <small>Medical Urgent</small>
          <strong>{incident.medical ? "Yes" : "No"}</strong>
        </div>
      </div>

      {incident.assignedTeam && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "12px", color: "#065f46" }}>
          ✓ Assigned to Team <b>{incident.assignedTeam}</b>
        </div>
      )}

      {onAssignTeam && teams?.length > 0 && !incident.assignedTeam && (
        <div>
          <button
            className="btn-chat-primary"
            style={{ background: "#059669" }}
            onClick={() => onAssignTeam(incident.id, teams[0].id)}
          >
            Deploy Nearest Unit ({teams[0].name})
          </button>
        </div>
      )}
    </div>
  );
}

function RescueLoginPage({ onLoginSuccess, onBackToCitizen }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [agency, setAgency] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        // ── Supabase Auth Path ─────────────────────────────────
        if (isRegister) {
          const data = await supabaseSignUp({ email, password, role: "rescue", name, badgeId, agency });
          if (data?.user) {
            const userProfile = parseSupabaseUser(data.user);
            onLoginSuccess(userProfile);
          } else {
            setError("Registration successful! Please check your email to confirm your account, then sign in.");
          }
        } else {
          const data = await supabaseSignIn({ email, password });
          const userProfile = parseSupabaseUser(data.user);
          if (userProfile.role !== "rescue") {
            await supabaseSignOut();
            setError(`Access Denied: This account is authorized for '${userProfile.role}' operations, not 'rescue'.`);
          } else {
            onLoginSuccess(userProfile);
          }
        }
      } else {
        // ── Fallback: Local Express API ────────────────────────
        const endpoint = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
        const payload = isRegister
          ? { email, password, role: "rescue", name, badgeId, agency }
          : { email, password, role: "rescue" };
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Authentication failed.");
        } else {
          localStorage.setItem("resqsense_rescue_user", JSON.stringify(data.user));
          localStorage.setItem("resqsense_rescue_token", data.token);
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-portal-viewport">
      <div className="auth-container-card">
        <div className="auth-banner-header rescue-theme">
          <div className="auth-banner-badge">
            <Truck size={12} /> Rescue Force Clearance
          </div>
          <h3>Rescue Team Operations Login</h3>
          <p>
            Exclusive console for deployed rescue squads, field response teams, and medical evacuation units.
          </p>
        </div>

        <div className="auth-body-content">
          <div className="auth-mode-switch">
            <button
              type="button"
              className={`auth-mode-btn ${!isRegister ? "active" : ""}`}
              onClick={() => { setIsRegister(false); setError(""); }}
            >
              Sign In as Responder
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${isRegister ? "active" : ""}`}
              onClick={() => { setIsRegister(true); setError(""); }}
            >
              Register New Rescue Unit
            </button>
          </div>

          {error && (
            <div className="auth-error-box">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isSupabaseConfigured ? (
            <div className="auth-notice-box supabase">
              <Database size={16} />
              <span>
                🔐 Supabase Auth enabled — credentials are securely stored in Supabase database. No default accounts.
              </span>
            </div>
          ) : (
            <div className="auth-notice-box">
              <ShieldCheck size={16} />
              <span>
                Demo mode: credentials saved locally. Add Supabase keys in <code>.env</code> for full persistence.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="auth-input-group">
                  <label className="auth-label">Squad Leader / Responder Name *</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Capt. Rajesh Roy"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="auth-input-group">
                    <label className="auth-label">Unit Call Sign / Code *</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. RESCUE-04"
                      value={badgeId}
                      onChange={e => setBadgeId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="auth-input-group">
                    <label className="auth-label">Organization / NGO *</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Rapid Relief NGO"
                      value={agency}
                      onChange={e => setAgency(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="auth-input-group">
              <label className="auth-label">Official Email Address *</label>
              <input
                type="email"
                className="auth-input"
                placeholder="unit@resqteam.org or official email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password *</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {isRegister && (
              <div className="auth-input-group">
                <label className="auth-label">Confirm Password *</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? "Authenticating..." : isRegister ? "Register & Enter Rescue Console" : "Sign In & Unlock Rescue Dashboard"}
            </button>

            <button type="button" className="btn-auth-back" onClick={onBackToCitizen}>
              ← Return to Public Citizen Portal (Free Access)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AdminLoginPage({ onLoginSuccess, onBackToCitizen }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [agency, setAgency] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        // ── Supabase Auth Path ─────────────────────────────────
        if (isRegister) {
          const data = await supabaseSignUp({ email, password, role: "admin", name, badgeId, agency });
          if (data?.user) {
            const userProfile = parseSupabaseUser(data.user);
            onLoginSuccess(userProfile);
          } else {
            setError("Registration successful! Please check your email to confirm your account, then sign in.");
          }
        } else {
          const data = await supabaseSignIn({ email, password });
          const userProfile = parseSupabaseUser(data.user);
          if (userProfile.role !== "admin") {
            await supabaseSignOut();
            setError(`Access Denied: This account is authorized for '${userProfile.role}' operations, not 'admin'.`);
          } else {
            onLoginSuccess(userProfile);
          }
        }
      } else {
        // ── Fallback: Local Express API ────────────────────────
        const endpoint = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
        const payload = isRegister
          ? { email, password, role: "admin", name, badgeId, agency }
          : { email, password, role: "admin" };
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Authentication failed.");
        } else {
          localStorage.setItem("resqsense_admin_user", JSON.stringify(data.user));
          localStorage.setItem("resqsense_admin_token", data.token);
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-portal-viewport">
      <div className="auth-container-card">
        <div className="auth-banner-header admin-theme">
          <div className="auth-banner-badge">
            <Radio size={12} /> State Command Authorization
          </div>
          <h3>Admin Control Center Login</h3>
          <p>
            Restricted access for state disaster directors, incident coordinators, and triage supervisors.
          </p>
        </div>

        <div className="auth-body-content">
          <div className="auth-mode-switch">
            <button
              type="button"
              className={`auth-mode-btn ${!isRegister ? "active" : ""}`}
              onClick={() => { setIsRegister(false); setError(""); }}
            >
              Sign In as Administrator
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${isRegister ? "active" : ""}`}
              onClick={() => { setIsRegister(true); setError(""); }}
            >
              Register Command Officer
            </button>
          </div>

          {error && (
            <div className="auth-error-box">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isSupabaseConfigured ? (
            <div className="auth-notice-box supabase">
              <Database size={16} />
              <span>
                🔐 Supabase Auth enabled — credentials are securely stored in Supabase database. No default accounts.
              </span>
            </div>
          ) : (
            <div className="auth-notice-box">
              <ShieldCheck size={16} />
              <span>
                Demo mode: credentials saved locally. Add Supabase keys in <code>.env</code> for full persistence.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="auth-input-group">
                  <label className="auth-label">Command Officer Full Name *</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Director Vikram Sen"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="auth-input-group">
                    <label className="auth-label">State Clearance ID *</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. ADM-HQ-01"
                      value={badgeId}
                      onChange={e => setBadgeId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="auth-input-group">
                    <label className="auth-label">Authority Division *</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. State Disaster Authority"
                      value={agency}
                      onChange={e => setAgency(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="auth-input-group">
              <label className="auth-label">Official Command Email *</label>
              <input
                type="email"
                className="auth-input"
                placeholder="officer@disastercontrol.gov"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password *</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {isRegister && (
              <div className="auth-input-group">
                <label className="auth-label">Confirm Password *</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? "Authenticating..." : isRegister ? "Register & Enter Command Center" : "Sign In & Unlock Admin Console"}
            </button>

            <button type="button" className="btn-auth-back" onClick={onBackToCitizen}>
              ← Return to Public Citizen Portal (Free Access)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [role, setRole] = useState("citizen");
  const [rescueUser, setRescueUser] = useState(() => {
    try {
      const s = localStorage.getItem("resqsense_rescue_user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const s = localStorage.getItem("resqsense_admin_user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [active, setActive] = useState("Dashboard");
  const [gps, setGps] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // ── Supabase: Restore session on app load ────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Restore existing Supabase session on page load/refresh
    getSupabaseSession().then(({ user }) => {
      if (user) {
        const profile = parseSupabaseUser(user);
        if (profile.role === "rescue") {
          setRescueUser(profile);
          setRole("rescue");
        } else if (profile.role === "admin") {
          setAdminUser(profile);
          setRole("admin");
        }
      }
    });

    // Listen for auth state changes (sign in / sign out events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const profile = parseSupabaseUser(session.user);
        if (profile.role === "rescue") {
          setRescueUser(profile);
          localStorage.setItem("resqsense_rescue_user", JSON.stringify(profile));
        } else if (profile.role === "admin") {
          setAdminUser(profile);
          localStorage.setItem("resqsense_admin_user", JSON.stringify(profile));
        }
      } else if (event === "SIGNED_OUT") {
        setRescueUser(null);
        setAdminUser(null);
        setRole("citizen");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch(`${API}/incidents`).then(r => r.json()),
      fetch(`${API}/teams`).then(r => r.json())
    ])
      .then(([incData, teamData]) => {
        setIncidents(incData);
        setTeams(teamData);
      })
      .catch(err => console.error("API load error:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setActive("Dashboard");
  }, [role]);

  const handleSignOut = async (signoutRole) => {
    if (isSupabaseConfigured) {
      try { await supabaseSignOut(); } catch { /* ignore */ }
    }
    if (signoutRole === "rescue") {
      localStorage.removeItem("resqsense_rescue_user");
      localStorage.removeItem("resqsense_rescue_token");
      setRescueUser(null);
    } else if (signoutRole === "admin") {
      localStorage.removeItem("resqsense_admin_user");
      localStorage.removeItem("resqsense_admin_token");
      setAdminUser(null);
    }
    setRole("citizen");
  };

  const handleRescueLoginSuccess = (user) => {
    localStorage.setItem("resqsense_rescue_user", JSON.stringify(user));
    setRescueUser(user);
    setRole("rescue");
  };

  const handleAdminLoginSuccess = (user) => {
    localStorage.setItem("resqsense_admin_user", JSON.stringify(user));
    setAdminUser(user);
    setRole("admin");
  };

  const handleSOSSubmit = async (triageResult) => {
    const payload = triageResult.payload || {};
    const body = {
      ...payload,
      lat: gps?.lat || demoCenter[0] + (Math.random() - 0.5) * 0.02,
      lng: gps?.lng || demoCenter[1] + (Math.random() - 0.5) * 0.02
    };

    try {
      const res = await fetch(`${API}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const newInc = await res.json();
      setIncidents(prev => [newInc, ...prev]);
      alert(`Emergency SOS successfully registered!\nIncident ID: ${newInc.id}\nPriority Score: ${newInc.priority}/100\nNearest rescue teams have been notified.`);
    } catch {
      alert("SOS submitted in demo mode.");
    }
  };

  const handleAssignTeam = async (incidentId, teamId) => {
    try {
      const res = await fetch(`${API}/incidents/${incidentId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId })
      });
      const updated = await res.json();
      setIncidents(prev => prev.map(i => (i.id === incidentId ? updated : i)));
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(updated);
      }
      alert(`Responder Team ${teamId} has been successfully assigned to incident ${incidentId}.`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Header
        role={role}
        setRole={setRole}
        active={active}
        setActive={setActive}
        gps={gps}
        setGps={setGps}
        rescueUser={rescueUser}
        adminUser={adminUser}
        onSignOut={handleSignOut}
      />

      {/* Citizen View: Free and open to everyone without login */}
      {role === "citizen" && (
        <div className="app-layout">
          <Sidebar role="citizen" active={active} setActive={setActive} />
          <CitizenDashboard
            active={active}
            setActive={setActive}
            incidents={incidents}
            teams={teams}
            gps={gps}
            setIncidents={setIncidents}
            onOpenChat={() => setChatOpen(true)}
            onSelectIncident={setSelectedIncident}
          />
        </div>
      )}

      {/* Rescue Team View: Login page first if not logged in, then Rescue Console */}
      {role === "rescue" && (
        !rescueUser ? (
          <RescueLoginPage
            onLoginSuccess={handleRescueLoginSuccess}
            onBackToCitizen={() => { setRole("citizen"); setActive("Dashboard"); }}
          />
        ) : (
          <div className="app-layout">
            <Sidebar role="rescue" active={active} setActive={setActive} />
            <RescueDashboard
              active={active}
              incidents={incidents}
              teams={teams}
              onSelectIncident={setSelectedIncident}
              onAssignTeam={handleAssignTeam}
              onRefreshData={fetchData}
            />
          </div>
        )
      )}

      {/* Admin View: Login page first if not logged in, then Admin Command Center */}
      {role === "admin" && (
        !adminUser ? (
          <AdminLoginPage
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToCitizen={() => { setRole("citizen"); setActive("Dashboard"); }}
          />
        ) : (
          <div className="app-layout">
            <Sidebar role="admin" active={active} setActive={setActive} />
            <AdminDashboard
              active={active}
              incidents={incidents}
              teams={teams}
              onSelectIncident={setSelectedIncident}
              onAssignTeam={handleAssignTeam}
              onRefreshData={fetchData}
            />
          </div>
        )
      )}

      <Chatbot
        gps={gps}
        onSOS={handleSOSSubmit}
        open={chatOpen}
        setOpen={setChatOpen}
      />

      <IncidentDetailDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        teams={teams}
        onAssignTeam={handleAssignTeam}
      />

      <footer className="app-footer">
        ResQSense Smart Disaster Response & Coordination Platform • High-Readiness Demo • Built with React & Leaflet
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
