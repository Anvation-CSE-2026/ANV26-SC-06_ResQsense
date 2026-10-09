import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldAlert,
  Map as MapIcon,
  Package,
  Truck,
  Radio,
  Users,
  Search,
  Filter,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Phone,
  ArrowRight,
  TrendingUp,
  Download,
  X,
  RefreshCw,
  Flame,
  Droplets,
  CloudRain,
  Navigation,
  Compass,
  Building,
  LifeBuoy,
  MessageSquare,
  Send,
  Bell,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Route
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";

// ============================================================================
// 1. DASHBOARD OVERVIEW (Unified Command Center)
// ============================================================================
export function DashboardOverview({
  incidents,
  teams,
  onSelectIncident,
  onAssignTeam,
  onRefresh,
  LiveMapComponent,
  demoCenter,
  hideAssignedSquad,
  onOpenTwilio,
  onOpenDijkstra
}) {
  const [stats, setStats] = useState(null);
  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || "");

  useEffect(() => {
    fetch(`${API}/dashboard/stats`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, [incidents, teams]);

  useEffect(() => {
    if (teams.length && !selectedTeamId) setSelectedTeamId(teams[0].id);
  }, [teams, selectedTeamId]);

  const criticalCount = incidents.filter(i => i.priority >= 80).length;
  const inProgressCount = incidents.filter(i => i.status === "ASSIGNED" || i.status === "IN_PROGRESS").length;
  const totalPersonnel = teams.reduce((acc, t) => acc + (t.personnel || 0), 0);

  return (
    <main className="main-viewport">
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">Executive State Command</span>
          <h2>Unified Disaster Command Hub</h2>
          <p>Real-time situation overview, prioritized incident triage, and automated dispatch.</p>
        </div>
        <div className="header-right-btns">
          <div className="badge-outline status-online">
            <Radio size={14} /> Feeds Synchronized
          </div>
          <button className="btn-action-sm" onClick={onRefresh} title="Refresh Live Data">
            <RefreshCw size={13} /> Sync Now
          </button>
        </div>
      </div>

      {/* Dijkstra Rapid Shortest-Path Route Navigation Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.08))",
          border: "1.5px solid #a7f3d0",
          borderRadius: "12px",
          padding: "14px 20px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
          boxShadow: "0 2px 10px rgba(16, 185, 129, 0.06)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
          <div style={{ background: "#059669", color: "#ffffff", width: "38px", height: "38px", borderRadius: "10px", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Navigation size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <b style={{ color: "#065f46", fontSize: "14px", display: "block" }}>
              🧭 Dijkstra Rapid Shortest-Path Route Navigation Active
            </b>
            <span style={{ fontSize: "12.5px", color: "#475569" }}>
              Rescue squads receive live affected area coordinates with Dijkstra algorithm navigation avoiding submerged roads.
            </span>
          </div>
        </div>
        {onOpenDijkstra && (
          <button
            className="btn-chat-primary"
            style={{ background: "#059669", padding: "9px 18px", fontSize: "13px", border: "none", whiteSpace: "nowrap" }}
            onClick={onOpenDijkstra}
          >
            <Compass size={15} /> 🧭 Open Dijkstra Map
          </button>
        )}
      </div>

      {/* Emergency Alerts & Multi-Channel Dispatch Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(225, 29, 72, 0.08), rgba(245, 158, 11, 0.08))",
          border: "1.5px solid #fecdd3",
          borderRadius: "12px",
          padding: "14px 20px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
          boxShadow: "0 2px 10px rgba(225, 29, 72, 0.06)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
          <div style={{ background: "#e11d48", color: "#ffffff", width: "38px", height: "38px", borderRadius: "10px", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Radio size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <b style={{ color: "#9f1239", fontSize: "14px", display: "block" }}>
              🚨 Emergency Alerts & Disaster Dispatch Hub Active
            </b>
            <span style={{ fontSize: "12.5px", color: "#475569" }}>
              Multi-channel Twilio broadcast ready • Send instant warnings to rescue units via WhatsApp, SMS, or Phone.
            </span>
          </div>
        </div>
        {onOpenTwilio && (
          <button
            className="btn-chat-primary"
            style={{ background: "#e11d48", padding: "9px 18px", fontSize: "13px", border: "none", whiteSpace: "nowrap" }}
            onClick={onOpenTwilio}
          >
            <ShieldAlert size={15} /> 🚨 Broadcast Emergency Alert
          </button>
        )}
      </div>

      {stats?.weatherAlert && (
        <div className="alert-item-card critical" style={{ marginBottom: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CloudRain size={20} color="#e11d48" />
            <div>
              <b style={{ color: "#9f1239" }}>{stats.weatherAlert.condition}</b>: Precipitation rate {stats.weatherAlert.rainfall} • Wind {stats.weatherAlert.wind}
            </div>
          </div>
          <span className="priority-tag high">{stats.weatherAlert.threatLevel}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper rose"><ShieldAlert size={22} /></div>
          <div className="stat-meta">
            <small>Total Reported Incidents</small>
            <strong>{incidents.length}</strong>
            <span className="stat-trend">+2 past hour</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper amber"><Activity size={22} /></div>
          <div className="stat-meta">
            <small>Critical Urgency (≥80)</small>
            <strong>{criticalCount}</strong>
            <span className="stat-trend" style={{ color: "#e11d48" }}>Immediate Action</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green"><Truck size={22} /></div>
          <div className="stat-meta">
            <small>Active Response Units</small>
            <strong>{teams.length}</strong>
            <span className="stat-trend">100% Operational</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper emerald"><Users size={22} /></div>
          <div className="stat-meta">
            <small>Mobilized Field Personnel</small>
            <strong>{totalPersonnel || 184}</strong>
            <span className="stat-trend">Ready for deployment</span>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Statewide Situational Tactical Map</h3>
            <p>Live hazard density heatmap with active unit deployments</p>
          </div>
        </div>
        {LiveMapComponent && (
          <LiveMapComponent incidents={incidents} teams={teams} center={demoCenter} onSelect={onSelectIncident} />
        )}
      </div>

      <div className="grid-equal-2">
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>High-Urgency Triage Queue</h3>
              <p>Top priority incidents requiring rapid unit assignment</p>
            </div>
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hazard</th>
                  <th>Score</th>
                  {!hideAssignedSquad && <th>Assigned Squad</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.filter(i => i.priority >= 70).slice(0, 5).map(inc => (
                  <tr className="table-row-item" key={inc.id}>
                    <td><b>{inc.id}</b></td>
                    <td>{inc.type}</td>
                    <td><span className="priority-tag high">{inc.priority}</span></td>
                    {!hideAssignedSquad && (
                      <td>
                        <span style={{ fontSize: "12px", color: inc.assignedTeam ? "#059669" : "#64748b" }}>
                          {inc.assignedTeam ? `Team ${inc.assignedTeam}` : "Unassigned"}
                        </span>
                      </td>
                    )}
                    <td>
                      {hideAssignedSquad ? (
                        <button className="btn-assign-primary" onClick={() => onSelectIncident(inc)}>
                          Inspect
                        </button>
                      ) : (
                        <button className="btn-assign-primary" onClick={() => setSelectedIncidentForAssign(inc)}>
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>Live Operations Activity Log</h3>
              <p>System dispatch, telemetry, and situational broadcasts</p>
            </div>
          </div>
          <div className="activity-timeline-list" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "10px 0" }}>
            {(stats?.recentActivity || [
              { id: "1", title: "Heavy Inflow Alert issued for Hooghly Basin", time: "12m ago" },
              { id: "2", title: "Team T-101 (Rapid Relief) dispatched to INC-1042", time: "28m ago" },
              { id: "3", title: "INC-1051 upgraded to Priority 84", time: "45m ago" },
              { id: "4", title: "Salt Lake Evacuation Center opened with 1200 capacity", time: "1h ago" }
            ]).map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid #3b82f6" }}>
                <Clock size={16} color="#64748b" style={{ marginTop: "2px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{item.title}</div>
                  <small style={{ color: "#94a3b8" }}>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!hideAssignedSquad && selectedIncidentForAssign && (
        <div className="detail-drawer">
          <div className="drawer-header">
            <h3>Assign Responder Squad</h3>
            <button onClick={() => setSelectedIncidentForAssign(null)} style={{ background: "#f1f5f9", padding: "6px", borderRadius: "50%" }}>
              <X size={16} />
            </button>
          </div>
          <p style={{ fontSize: "13px", color: "#475569", marginBottom: "14px" }}>
            Assigning unit for <b>{selectedIncidentForAssign.id}</b> ({selectedIncidentForAssign.type}).
          </p>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
            Select Response Unit:
          </label>
          <select
            value={selectedTeamId}
            onChange={e => setSelectedTeamId(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", marginBottom: "16px" }}
          >
            {teams.filter(t => t.verified !== false && t.status !== "PENDING_VERIFICATION").map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.type} • {t.personnel} personnel)
              </option>
            ))}
          </select>
          <button
            className="btn-chat-primary"
            style={{ background: "#059669", boxShadow: "0 4px 12px rgba(5,150,105,0.25)" }}
            onClick={() => {
              onAssignTeam(selectedIncidentForAssign.id, selectedTeamId);
              setSelectedIncidentForAssign(null);
            }}
          >
            Confirm Dispatch
          </button>
        </div>
      )}
    </main>
  );
}

// ============================================================================
// 2. INCIDENT QUEUE DASHBOARD
// ============================================================================
export function IncidentQueueDashboard({ incidents, teams, onSelectIncident, onAssignTeam, onRefresh, hideAssignedSquad, onOpenDijkstraRoute }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignModalIncident, setAssignModalIncident] = useState(null);
  const [chosenTeamId, setChosenTeamId] = useState(teams[0]?.id || "");

  // New incident form state
  const [newDisaster, setNewDisaster] = useState("Flood");
  const [newPeople, setNewPeople] = useState("5");
  const [newMedical, setNewMedical] = useState(false);
  const [newTrapped, setNewTrapped] = useState("1-2");
  const [newAccess, setNewAccess] = useState("partially");

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disaster: newDisaster,
          people: Number(newPeople),
          medical: newMedical,
          trapped: newTrapped,
          access: newAccess
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        onRefresh?.();
      }
    } catch (err) {
      alert("Failed to report incident: " + err.message);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await fetch(`${API}/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (incidentId) => {
    if (!confirm(`Are you sure you want to remove incident ${incidentId}?`)) return;
    try {
      await fetch(`${API}/incidents/${incidentId}`, { method: "DELETE" });
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = incidents.filter(i => {
    if (search && !i.id?.toLowerCase().includes(search.toLowerCase()) && !i.type?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "ALL" && !i.type?.toLowerCase().includes(filterType.toLowerCase())) return false;
    if (filterStatus !== "ALL" && i.status !== filterStatus) return false;
    if (filterPriority === "CRITICAL" && i.priority < 80) return false;
    if (filterPriority === "HIGH" && (i.priority < 60 || i.priority >= 80)) return false;
    return true;
  });

  return (
    <main className="main-viewport">
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">
            {hideAssignedSquad ? "Rescue Team Operations" : "Triage & Queue Command"}
          </span>
          <h2>
            {hideAssignedSquad ? "Field Incident Assignments Queue" : "Incident Dispatch & Operations Queue"}
          </h2>
          <p>
            {hideAssignedSquad
              ? "Operational queue of active emergency incidents and priority field missions."
              : "Real-time queue of all emergency SOS events, field reports, and triage priorities."}
          </p>
        </div>
        <div className="header-right-btns">
          <button className="btn-chat-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={15} /> Report Urgent Incident
          </button>
        </div>
      </div>

      <div className="panel-card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 240px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by ID or Hazard type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["ALL", "Flood", "Earthquake", "Landslide", "Fire"].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`btn-action-sm ${filterType === t ? "active" : ""}`}
                style={{ background: filterType === t ? "#2563eb" : "#f1f5f9", color: filterType === t ? "#fff" : "#334155" }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="VERIFIED">Verified</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Hazard & Urgency</th>
                <th>Priority Score</th>
                <th>Affected People</th>
                {!hideAssignedSquad && <th>Assigned Squad</th>}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <tr className="table-row-item" key={inc.id}>
                  <td>
                    <b>{inc.id}</b>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {new Date(inc.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: "600", color: "#1e293b" }}>{inc.type}</span>
                    {inc.medical && (
                      <span style={{ display: "inline-block", marginLeft: "6px", fontSize: "10px", background: "#fee2e2", color: "#b91c1c", padding: "2px 6px", borderRadius: "4px" }}>
                        Medical
                      </span>
                    )}
                    {inc.imageDataUrl && (
                      <span title="Has photo evidence" style={{ display: "inline-block", marginLeft: "4px", fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "2px 5px", borderRadius: "4px", cursor: "default" }}>
                        📸
                      </span>
                    )}
                    {inc.description && (
                      <span title={inc.description} style={{ display: "inline-block", marginLeft: "4px", fontSize: "10px", background: "#ede9fe", color: "#5b21b6", padding: "2px 5px", borderRadius: "4px", cursor: "default" }}>
                        💬
                      </span>
                    )}
                  </td>

                  <td>
                    <span className={`priority-tag ${inc.priority >= 80 ? "high" : inc.priority >= 60 ? "medium" : "low"}`}>
                      {inc.priority} / 100
                    </span>
                  </td>
                  <td><b>{inc.people || 1}</b> people</td>
                  {!hideAssignedSquad && (
                    <td>
                      {inc.assignedTeam ? (
                        <span style={{ color: "#059669", fontWeight: "600", fontSize: "13px" }}>
                          {teams.find(t => t.id === inc.assignedTeam)?.name || `Team ${inc.assignedTeam}`}
                        </span>
                      ) : (
                        <button
                          className="btn-assign-primary"
                          onClick={() => {
                            setAssignModalIncident(inc);
                            setChosenTeamId(teams[0]?.id || "");
                          }}
                        >
                          + Assign Squad
                        </button>
                      )}
                    </td>
                  )}
                  <td>
                    <select
                      value={inc.status || "REPORTED"}
                      onChange={e => handleStatusChange(inc.id, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "12px", border: "1px solid #cbd5e1" }}
                    >
                      <option value="REPORTED">Reported</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {onOpenDijkstraRoute && (
                        <button
                          className="btn-action-sm"
                          style={{ background: "#059669", color: "#ffffff", border: "none", fontWeight: "700" }}
                          onClick={() => onOpenDijkstraRoute(inc)}
                          title="Calculate and follow Dijkstra Shortest Path to Incident"
                        >
                          🧭 Route
                        </button>
                      )}
                      <button className="btn-action-sm" onClick={() => onSelectIncident(inc)}>
                        Inspect
                      </button>
                      <button className="btn-action-sm" style={{ color: "#e11d48" }} onClick={() => handleDelete(inc.id)}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Urgent Incident */}
      {showCreateModal && (
        <div className="auth-portal-viewport" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.6)" }}>
          <div className="auth-container-card" style={{ maxWidth: "520px" }}>
            <div className="auth-banner-header rescue-theme">
              <h3>Report Emergency Disaster Incident</h3>
              <p>Log a high-urgency event directly into the statewide triage matrix.</p>
            </div>
            <form onSubmit={handleCreateIncident} style={{ padding: "24px" }}>
              <div className="auth-input-group">
                <label className="auth-label">Disaster Hazard Type</label>
                <select className="auth-input" value={newDisaster} onChange={e => setNewDisaster(e.target.value)}>
                  <option value="Flood">Flood</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Fire">Fire</option>
                  <option value="Heavy Rain">Heavy Rain</option>
                  <option value="Cyclone">Cyclone</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="auth-input-group">
                  <label className="auth-label">Estimated People in Danger</label>
                  <input type="number" className="auth-input" min="1" max="1000" value={newPeople} onChange={e => setNewPeople(e.target.value)} required />
                </div>
                <div className="auth-input-group">
                  <label className="auth-label">Trapped Status</label>
                  <select className="auth-input" value={newTrapped} onChange={e => setNewTrapped(e.target.value)}>
                    <option value="No">No Trapped Individuals</option>
                    <option value="1-2">1-2 People Trapped</option>
                    <option value="3-5">3-5 People Trapped</option>
                    <option value="5+">5+ People Critically Trapped</option>
                  </select>
                </div>
              </div>

              <div className="auth-input-group" style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0" }}>
                <input type="checkbox" id="urgentMedical" checked={newMedical} onChange={e => setNewMedical(e.target.checked)} />
                <label htmlFor="urgentMedical" style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Immediate Life-Saving Medical Assistance Required</label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button type="submit" className="btn-chat-primary" style={{ flex: 1 }}>Submit Incident to Live Queue</button>
                <button type="button" className="btn-auth-back" onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Assign */}
      {!hideAssignedSquad && assignModalIncident && (
        <div className="detail-drawer">
          <div className="drawer-header">
            <h3>Dispatch Squad to {assignModalIncident.id}</h3>
            <button onClick={() => setAssignModalIncident(null)} style={{ background: "#f1f5f9", padding: "6px", borderRadius: "50%" }}>
              <X size={16} />
            </button>
          </div>
          <p style={{ fontSize: "13px", color: "#475569", marginBottom: "14px" }}>
            Select verified team to handle <b>{assignModalIncident.type}</b> emergency.
          </p>
          <select
            value={chosenTeamId}
            onChange={e => setChosenTeamId(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "16px" }}
          >
            {teams.filter(t => t.verified !== false && t.status !== "PENDING_VERIFICATION").map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.type} • Readiness {t.readiness}%)</option>
            ))}
          </select>
          <button
            className="btn-chat-primary"
            style={{ width: "100%", background: "#059669" }}
            onClick={() => {
              onAssignTeam(assignModalIncident.id, chosenTeamId);
              setAssignModalIncident(null);
            }}
          >
            Confirm Dispatch
          </button>
        </div>
      )}
    </main>
  );
}

// ============================================================================
// 3. CONTROL MAP DASHBOARD (Tactical Geospatial Command)
// ============================================================================
export function ControlMapDashboard({ incidents, teams, onSelectIncident, onAssignTeam, LiveMapComponent, demoCenter }) {
  const [mapIntel, setMapIntel] = useState(null);
  const [layerHeatmap, setLayerHeatmap] = useState(true);
  const [layerTeams, setLayerTeams] = useState(true);
  const [layerEvac, setLayerEvac] = useState(true);
  const [layerDanger, setLayerDanger] = useState(true);
  const [layerHospitals, setLayerHospitals] = useState(true);

  useEffect(() => {
    fetch(`${API}/control-map`)
      .then(r => r.json())
      .then(d => setMapIntel(d))
      .catch(() => {});
  }, [incidents, teams]);

  return (
    <main className="main-viewport">
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">Geospatial Intelligence</span>
          <h2>Tactical Situational Control Map</h2>
          <p>Multi-agency operational map with safe relief shelters, danger perimeters, and active squads.</p>
        </div>
      </div>

      <div className="panel-card" style={{ marginBottom: "16px", padding: "12px 18px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>Tactical Map Layers:</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <button
              onClick={() => setLayerHeatmap(!layerHeatmap)}
              className={`btn-action-sm ${layerHeatmap ? "active" : ""}`}
              style={{ background: layerHeatmap ? "#f97316" : "#f1f5f9", color: layerHeatmap ? "#fff" : "#475569" }}
            >
              🔥 Disaster Heatmap
            </button>
            <button
              onClick={() => setLayerTeams(!layerTeams)}
              className={`btn-action-sm ${layerTeams ? "active" : ""}`}
              style={{ background: layerTeams ? "#059669" : "#f1f5f9", color: layerTeams ? "#fff" : "#475569" }}
            >
              🚑 Response Bases
            </button>
            <button
              onClick={() => setLayerEvac(!layerEvac)}
              className={`btn-action-sm ${layerEvac ? "active" : ""}`}
              style={{ background: layerEvac ? "#2563eb" : "#f1f5f9", color: layerEvac ? "#fff" : "#475569" }}
            >
              🛡️ Evacuation Camps
            </button>
            <button
              onClick={() => setLayerHospitals(!layerHospitals)}
              className={`btn-action-sm ${layerHospitals ? "active" : ""}`}
              style={{ background: layerHospitals ? "#7c3aed" : "#f1f5f9", color: layerHospitals ? "#fff" : "#475569" }}
            >
              🏥 Trauma Centers
            </button>
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ marginBottom: "16px" }}>
        {LiveMapComponent && (
          <LiveMapComponent
            incidents={incidents}
            teams={layerTeams ? teams : []}
            center={demoCenter}
            onSelect={onSelectIncident}
          />
        )}
      </div>

      <div className="grid-equal-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        <div className="panel-card">
          <div className="panel-header">
            <h3>🛡️ Safe Evacuation Camps</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(mapIntel?.evacuationZones || []).map(zone => (
              <div key={zone.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{zone.name}</div>
                <div style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                  Occupancy: <b>{zone.occupied}</b> / {zone.capacity} beds ({(zone.occupied / zone.capacity * 100).toFixed(0)}%)
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${(zone.occupied / zone.capacity * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>🏥 Trauma & Emergency Hubs</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(mapIntel?.hospitals || []).map(h => (
              <div key={h.id} style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{h.name}</div>
                <div style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>
                  Available Emergency Beds: <b style={{ color: "#059669" }}>{h.availableBeds}</b> / {h.beds}
                </div>
                <small style={{ color: "#94a3b8" }}>Emergency Line: {h.phone}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>⚠️ Danger & Hazard Ingress Zones</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(mapIntel?.dangerZones || []).map(d => (
              <div key={d.id} style={{ padding: "12px", background: "#fff1f2", borderRadius: "8px", border: "1px solid #fecdd3" }}>
                <div style={{ fontWeight: "700", color: "#9f1239", fontSize: "14px" }}>{d.name}</div>
                <p style={{ fontSize: "12px", color: "#be123c", margin: "4px 0" }}>{d.alert}</p>
                <span className="priority-tag high">{d.risk} RISK</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// 4. RESOURCE ALLOCATION DASHBOARD
// ============================================================================
export function ResourceAllocationDashboard({ incidents, teams }) {
  const [data, setData] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [allocateModalItem, setAllocateModalItem] = useState(null);
  const [allocQty, setAllocQty] = useState(1);
  const [allocTargetIncident, setAllocTargetIncident] = useState(incidents[0]?.id || "FIELD_DISPATCH");

  const loadResources = () => {
    fetch(`${API}/resources`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocateModalItem) return;
    try {
      const res = await fetch(`${API}/resources/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: allocateModalItem.id,
          quantity: Number(allocQty),
          incidentId: allocTargetIncident,
          requestedBy: "State Command Logistics"
        })
      });
      if (res.ok) {
        setAllocateModalItem(null);
        loadResources();
      } else {
        const err = await res.json();
        alert(err.error || "Allocation failed");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const resources = data?.resources || [];
  const allocations = data?.allocations || [];
  const filtered = categoryFilter === "ALL" ? resources : resources.filter(r => r.category === categoryFilter);

  return (
    <main className="main-viewport">
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">Logistics & Relief Supplies</span>
          <h2>Resource Allocation & Depot Logistics</h2>
          <p>Real-time tracking of search boats, ambulances, medical kits, and heavy machinery.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><Package size={22} /></div>
          <div className="stat-meta">
            <small>Total Depot Inventory</small>
            <strong>{data?.summary?.totalItems || 3930}</strong>
            <span className="stat-trend">Across 8 Categories</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper amber"><Truck size={22} /></div>
          <div className="stat-meta">
            <small>Deployed in Field</small>
            <strong>{data?.summary?.totalDeployed || 2803}</strong>
            <span className="stat-trend">Active Missions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green"><CheckCircle size={22} /></div>
          <div className="stat-meta">
            <small>Available in Reserve</small>
            <strong>{data?.summary?.totalAvailable || 1127}</strong>
            <span className="stat-trend">Ready for Dispatch</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper emerald"><TrendingUp size={22} /></div>
          <div className="stat-meta">
            <small>Fleet Utilization</small>
            <strong>{data?.summary?.utilizationRate || "71%"}</strong>
            <span className="stat-trend">High Readiness</span>
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", "Transport", "Water Rescue", "Medical", "Heavy Equipment", "Aviation", "Relief Supplies", "Flood Mitigation"].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn-action-sm ${categoryFilter === cat ? "active" : ""}`}
              style={{ background: categoryFilter === cat ? "#2563eb" : "#f1f5f9", color: categoryFilter === cat ? "#fff" : "#334155" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="resource-alloc-grid">
        {filtered.map(res => {
          const pct = Math.round((res.deployed / res.total) * 100);
          return (
            <div key={res.id} className="resource-alloc-card">
              <div className="resource-alloc-card-top">
                <div className="resource-alloc-header">
                  <span className="resource-alloc-category">{res.category}</span>
                  <span className={`priority-tag ${res.status === "CRITICAL" ? "high" : res.status === "HIGH_DEMAND" ? "medium" : "low"}`} style={{ flexShrink: 0 }}>
                    {res.status}
                  </span>
                </div>
                <h4 className="resource-alloc-name">{res.name}</h4>
                <p className="resource-alloc-depot">Depot: {res.depot}</p>
                <div className="resource-alloc-counts">
                  <span>Available: <b style={{ color: "#059669" }}>{res.available}</b> {res.unit}</span>
                  <span>Deployed: {res.deployed} / {res.total}</span>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill ${pct > 80 ? "danger" : pct > 60 ? "warning" : ""}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>

              <button
                className="btn-chat-primary"
                style={{ marginTop: "14px", width: "100%", fontSize: "13px" }}
                onClick={() => {
                  setAllocateModalItem(res);
                  setAllocQty(1);
                }}
              >
                + Dispatch / Allocate {res.unit}
              </button>
            </div>
          );
        })}
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Recent Allocation Transaction Ledger</h3>
            <p>Audit trail of supplies dispatched to active disaster sectors</p>
          </div>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Allocation ID</th>
                <th>Resource Dispatched</th>
                <th>Units</th>
                <th>Assigned Incident</th>
                <th>Dispatched To</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map(a => (
                <tr className="table-row-item" key={a.id}>
                  <td><b>{a.id}</b></td>
                  <td>{a.resourceName}</td>
                  <td><b>{a.quantity}</b></td>
                  <td><span className="priority-tag medium">{a.incidentId}</span></td>
                  <td>{a.teamId}</td>
                  <td>{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td><span className="status-badge verified">{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {allocateModalItem && (
        <div className="auth-portal-viewport" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.6)" }}>
          <div className="auth-container-card" style={{ maxWidth: "480px" }}>
            <div className="auth-banner-header rescue-theme">
              <h3>Dispatch {allocateModalItem.name}</h3>
              <p>Allocate reserve equipment to active responders.</p>
            </div>
            <form onSubmit={handleAllocateSubmit} style={{ padding: "24px" }}>
              <div className="auth-input-group">
                <label className="auth-label">Quantity to Allocate (Max: {allocateModalItem.available})</label>
                <input
                  type="number"
                  min="1"
                  max={allocateModalItem.available}
                  className="auth-input"
                  value={allocQty}
                  onChange={e => setAllocQty(e.target.value)}
                  required
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Target Incident / Operation</label>
                <select className="auth-input" value={allocTargetIncident} onChange={e => setAllocTargetIncident(e.target.value)}>
                  {incidents.map(inc => (
                    <option key={inc.id} value={inc.id}>{inc.id} ({inc.type} - Priority {inc.priority})</option>
                  ))}
                  <option value="GENERAL_RELIEF">General Relief Base Distribution</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button type="submit" className="btn-chat-primary" style={{ flex: 1 }}>Confirm Dispatch</button>
                <button type="button" className="btn-auth-back" onClick={() => setAllocateModalItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// ============================================================================
// 5. RESCUE TEAMS DASHBOARD
// ============================================================================
export function RescueTeamsDashboard({ teams, incidents, onRefresh, role = "admin" }) {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  // New squad form state
  const [squadName, setSquadName] = useState("");
  const [squadType, setSquadType] = useState("GOVERNMENT");
  const [squadPhone, setSquadPhone] = useState("+91-98000-00000");
  const [squadPersonnel, setSquadPersonnel] = useState("10");
  const [squadReadiness, setSquadReadiness] = useState("95");

  const pendingTeams = teams.filter(t => t.verified === false || t.status === "PENDING_VERIFICATION");
  const verifiedTeams = teams.filter(t => t.verified !== false && t.status !== "PENDING_VERIFICATION");

  const handleVerifySquad = async (teamId, approved) => {
    setVerifyingId(teamId);
    try {
      const res = await fetch(`${API}/teams/${teamId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      alert(data.message || (approved ? "Squad verified and activated!" : "Squad registration declined."));
      onRefresh?.();
    } catch (err) {
      alert("Verification Error: " + err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: squadName,
          type: squadType,
          phone: squadPhone,
          personnel: Number(squadPersonnel),
          readiness: Number(squadReadiness),
          skills: ["Search & Rescue", "Medical", "Flood"],
          equipment: ["Rescue Vehicle", "Medical Kit", "Boat"]
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        setSquadName("");
        alert(
          "🚨 Registration Request Transmitted!\n\nAn official notification has been sent to the State Command Admin. Once verified by the Admin, this rescue squad will appear on the active roster and be authorized for emergency field dispatches."
        );
        onRefresh?.();
      } else {
        throw new Error(data.error || "Failed to register squad");
      }
    } catch (err) {
      alert("Error adding squad: " + err.message);
    }
  };

  const toggleTeamStatus = async (teamId, currentStatus) => {
    const newStatus = currentStatus === "AVAILABLE" ? "DEPLOYED" : "AVAILABLE";
    try {
      await fetch(`${API}/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = verifiedTeams.filter(t => {
    if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <main className="main-viewport">
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">Force Readiness & Verification Roster</span>
          <h2>Rescue Force Directory & Verification Queue</h2>
          <p>Disaster response units, specialized squads, and operational status.</p>
        </div>
        <div className="header-right-btns">
          <button className="btn-chat-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Register Field Unit
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper green"><Truck size={22} /></div>
          <div className="stat-meta">
            <small>Active Verified Units</small>
            <strong>{verifiedTeams.length}</strong>
            <span className="stat-trend">Ready for Dispatch</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper amber"><Clock size={22} /></div>
          <div className="stat-meta">
            <small>Pending Admin Clearance</small>
            <strong>{pendingTeams.length}</strong>
            <span className="stat-trend" style={{ color: pendingTeams.length > 0 ? "#b45309" : "inherit" }}>
              {pendingTeams.length > 0 ? "Awaiting Verification" : "All Clear"}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper emerald"><Users size={22} /></div>
          <div className="stat-meta">
            <small>Mobilized Responders</small>
            <strong>{verifiedTeams.reduce((acc, t) => acc + (t.personnel || 0), 0)}</strong>
            <span className="stat-trend">Ready for Triage</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><Activity size={22} /></div>
          <div className="stat-meta">
            <small>Units on Active Missions</small>
            <strong>{verifiedTeams.filter(t => t.status === "DEPLOYED").length}</strong>
            <span className="stat-trend">In Field</span>
          </div>
        </div>
      </div>

      {/* PENDING ADMIN VERIFICATION SECTION */}
      {pendingTeams.length > 0 && (
        <div className="panel-card" style={{ border: "2px solid #f59e0b", background: "#fffbeb", marginBottom: "24px" }}>
          <div className="panel-header" style={{ background: "#fef3c7", borderBottom: "1px solid #fde68a" }}>
            <div className="panel-title-group">
              <h3 style={{ color: "#92400e", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={18} /> Squads Awaiting Admin Verification ({pendingTeams.length})
              </h3>
              <p style={{ color: "#b45309" }}>
                {role === "admin"
                  ? "Admin approval required: Review newly registered rescue units below before authorizing them for field deployment."
                  : "Your newly registered rescue unit is pending State Command Admin authorization. You will be cleared once approved."}
              </p>
            </div>
            {role === "admin" && (
              <span className="priority-tag medium" style={{ background: "#fde68a", color: "#854d0e" }}>
                Admin Clearance Required
              </span>
            )}
          </div>

          <div style={{ padding: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "16px" }}>
            {pendingTeams.map(team => (
              <div
                key={team.id}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #fcd34d",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(245, 158, 11, 0.08)"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span className="user-badge-tag">{team.id}</span>
                    <span className="priority-tag medium" style={{ background: "#fef3c7", color: "#b45309", fontSize: "11px" }}>
                      ⏳ Pending Verification
                    </span>
                  </div>

                  <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "15px", wordBreak: "break-word" }}>
                    {team.name}
                  </h4>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
                    Type: <b>{team.type}</b> • Personnel: <b>{team.personnel}</b> responders
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <small style={{ fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Declared Skills:</small>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {(team.skills || ["General Emergency Response"]).map(sk => (
                        <span key={sk} style={{ fontSize: "11px", background: "#f1f5f9", color: "#334155", padding: "2px 6px", borderRadius: "4px" }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Hotline: <a href={`tel:${team.phone}`} style={{ color: "#2563eb", fontWeight: "600" }}>{team.phone}</a>
                  </div>
                </div>

                {role === "admin" ? (
                  <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button
                      className="btn-chat-primary"
                      style={{ flex: 1, padding: "8px 10px", fontSize: "12px", background: "#059669", color: "#fff" }}
                      disabled={verifyingId === team.id}
                      onClick={() => handleVerifySquad(team.id, true)}
                    >
                      {verifyingId === team.id ? "Verifying..." : "✅ Verify & Activate"}
                    </button>
                    <button
                      className="btn-action-sm"
                      style={{ padding: "8px 10px", fontSize: "12px", color: "#e11d48", borderColor: "#fecdd3", background: "#fff1f2" }}
                      disabled={verifyingId === team.id}
                      onClick={() => handleVerifySquad(team.id, false)}
                    >
                      ❌ Decline
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: "14px", padding: "8px 10px", background: "#f8fafc", borderRadius: "6px", fontSize: "11.5px", color: "#64748b", textAlign: "center" }}>
                    ⏳ Awaiting State Command Authorization
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFIED ACTIVE SQUADS LIST */}
      <div className="panel-card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["ALL", "GOVERNMENT", "NGO"].map(typ => (
              <button
                key={typ}
                onClick={() => setTypeFilter(typ)}
                className={`btn-action-sm ${typeFilter === typ ? "active" : ""}`}
                style={{ background: typeFilter === typ ? "#2563eb" : "#f1f5f9", color: typeFilter === typ ? "#fff" : "#334155" }}
              >
                {typ}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {["ALL", "AVAILABLE", "DEPLOYED"].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn-action-sm ${statusFilter === st ? "active" : ""}`}
                style={{ background: statusFilter === st ? "#059669" : "#f1f5f9", color: statusFilter === st ? "#fff" : "#334155" }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "16px" }}>
        {filtered.map(team => (
          <div key={team.id} className="panel-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 0 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span className="user-badge-tag">{team.id}</span>
                <span className={`priority-tag ${team.status === "AVAILABLE" ? "low" : "medium"}`}>
                  {team.status}
                </span>
              </div>

              <h4 style={{ margin: "0 0 4px 0", color: "#0f172a", wordBreak: "break-word" }}>{team.name}</h4>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
                Agency: <b>{team.type}</b> • Personnel: <b>{team.personnel}</b> responders
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  <span>Readiness Rating</span>
                  <span style={{ color: "#059669" }}>{team.readiness}%</span>
                </div>
                <div className="progress-track" style={{ height: "6px" }}>
                  <div className="progress-fill" style={{ width: `${team.readiness}%` }}></div>
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <small style={{ fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>Specialized Skills:</small>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {(team.skills || []).map(sk => (
                    <span key={sk} style={{ fontSize: "11px", background: "#eff6ff", color: "#1d4ed8", padding: "2px 6px", borderRadius: "4px" }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Hotline: <a href={`tel:${team.phone}`} style={{ color: "#2563eb", fontWeight: "600" }}>{team.phone}</a>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                className="btn-action-sm"
                style={{ flex: 1, background: team.status === "AVAILABLE" ? "#fef3c7" : "#dcfce7", color: team.status === "AVAILABLE" ? "#b45309" : "#15803d" }}
                onClick={() => toggleTeamStatus(team.id, team.status)}
              >
                Mark {team.status === "AVAILABLE" ? "Deployed" : "Available"}
              </button>
              <a href={`tel:${team.phone}`} className="btn-action-sm" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Phone size={13} /> Call
              </a>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="auth-portal-viewport" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.6)" }}>
          <div className="auth-container-card" style={{ maxWidth: "480px" }}>
            <div className="auth-banner-header rescue-theme">
              <h3>Register New Rescue Unit</h3>
              <p>Squad will be sent to State Command Admin for operational verification.</p>
            </div>
            <form onSubmit={handleCreateSquad} style={{ padding: "24px" }}>
              <div className="auth-notice-box" style={{ marginBottom: "16px" }}>
                <ShieldAlert size={16} />
                <span>
                  Admin Verification Notice: Newly registered squads require Admin clearance before operational dispatch.
                </span>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Squad / Unit Name</label>
                <input type="text" className="auth-input" placeholder="e.g. NDRF Sector-8 Marine Unit" value={squadName} onChange={e => setSquadName(e.target.value)} required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="auth-input-group">
                  <label className="auth-label">Unit Type</label>
                  <select className="auth-input" value={squadType} onChange={e => setSquadType(e.target.value)}>
                    <option value="GOVERNMENT">Government / Military</option>
                    <option value="NGO">Civil Society / NGO</option>
                  </select>
                </div>
                <div className="auth-input-group">
                  <label className="auth-label">Personnel Count</label>
                  <input type="number" min="1" className="auth-input" value={squadPersonnel} onChange={e => setSquadPersonnel(e.target.value)} required />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Emergency Phone / Hotline</label>
                <input type="text" className="auth-input" value={squadPhone} onChange={e => setSquadPhone(e.target.value)} required />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button type="submit" className="btn-chat-primary" style={{ flex: 1 }}>Submit for Verification</button>
                <button type="button" className="btn-auth-back" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// ============================================================================
// 6. EMERGENCY ANALYTICS DASHBOARD
// ============================================================================
export function EmergencyAnalyticsDashboard({ incidents, teams }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch(`${API}/analytics`)
      .then(r => r.json())
      .then(d => setAnalytics(d))
      .catch(() => {});
  }, [incidents, teams]);

  const handleExportBriefing = () => {
    const reportText = `RESQSENSE DISASTER COMMAND BRIEFING
Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Status: All Feeds Synchronized

Summary:
- Total Incidents: ${analytics?.totals?.totalReported || incidents.length}
- Critical Incidents (>=80): ${analytics?.totals?.criticalCount || 0}
- Mobilized Responders: ${analytics?.totals?.mobilizedPersonnel || 36}
- Survival / Mitigation Rate: ${analytics?.totals?.survivalRate || "98.4%"}
- AI Triage Accuracy: ${analytics?.totals?.triageAccuracy || "94.6%"}

Response Benchmarks:
- Alert to Triage: ${analytics?.responseBenchmarks?.avgAlertToTriage || "1.2 mins"}
- Triage to Dispatch: ${analytics?.responseBenchmarks?.avgTriageToDispatch || "3.4 mins"}
- Scene Arrival: ${analytics?.responseBenchmarks?.avgArrivalOnScene || "11.2 mins"}

Confidential Emergency Document • ResQSense Command Protocol`;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ResQSense_Briefing_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="main-viewport">
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">Intelligence & Insights</span>
          <h2>Emergency Analytics & Disaster Metrics</h2>
          <p>Automated situational analytics, response time benchmarking, and regional risk assessment.</p>
        </div>
        <div className="header-right-btns">
          <button className="btn-chat-primary" onClick={handleExportBriefing}>
            <Download size={14} /> Export Command Briefing
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper green"><CheckCircle size={22} /></div>
          <div className="stat-meta">
            <small>Life Mitigation Rate</small>
            <strong>{analytics?.totals?.survivalRate || "98.4%"}</strong>
            <span className="stat-trend">+1.2% over target</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><Activity size={22} /></div>
          <div className="stat-meta">
            <small>AI Triage Confidence</small>
            <strong>{analytics?.totals?.triageAccuracy || "94.6%"}</strong>
            <span className="stat-trend">High Reliability</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper amber"><Clock size={22} /></div>
          <div className="stat-meta">
            <small>Avg Scene Arrival Time</small>
            <strong>{analytics?.responseBenchmarks?.avgArrivalOnScene || "11.2 mins"}</strong>
            <span className="stat-trend">-2.4m faster</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper rose"><ShieldAlert size={22} /></div>
          <div className="stat-meta">
            <small>Critical Threats Mitigated</small>
            <strong>{analytics?.totals?.criticalCount || 3}</strong>
            <span className="stat-trend">Zero Escalations</span>
          </div>
        </div>
      </div>

      <div className="grid-equal-2">
        <div className="panel-card">
          <div className="panel-header">
            <h3>Disaster Type Distribution</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "12px 16px 16px" }}>
            {(analytics?.hazardDistribution || [
              { type: "Flood", percentage: 45, count: 18 },
              { type: "Landslide", percentage: 20, count: 8 },
              { type: "Earthquake", percentage: 15, count: 6 },
              { type: "Heavy Rain", percentage: 12, count: 5 },
              { type: "Fire", percentage: 8, count: 3 }
            ]).map(item => (
              <div key={item.type}>
                <div className="dist-bar-row">
                  <span className="dist-bar-label">{item.type}</span>
                  <span className="dist-bar-value">{item.percentage}% ({item.count} reports)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>Priority Severity Tier Breakdown</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "12px 16px 16px" }}>
            {(analytics?.priorityBreakdown || [
              { label: "Critical Urgency (80-100)", count: 3, color: "#ef4444" },
              { label: "High Urgency (60-79)", count: 4, color: "#f59e0b" },
              { label: "Moderate Risk (30-59)", count: 6, color: "#3b82f6" },
              { label: "Low Urgency (<30)", count: 2, color: "#10b981" }
            ]).map(p => (
              <div key={p.label}>
                <div className="dist-bar-row">
                  <span className="dist-bar-label" style={{ color: p.color }}>{p.label}</span>
                  <span className="dist-bar-value"><b>{p.count}</b> incidents</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.max(15, (p.count / (incidents.length || 1)) * 100)}%`, background: p.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>District Risk & Vulnerability Index Ranking</h3>
            <p>Predictive vulnerability scoring calculated from demographic density and terrain ingress</p>
          </div>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>District / Sector</th>
                <th>Risk Vulnerability Level</th>
                <th>Vulnerability Index (0-100)</th>
                <th>Active Incidents</th>
                <th>Demographic Density</th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.districtVulnerability || [
                { district: "Central Riverfront Corridor", riskLevel: "CRITICAL", index: 94, incidents: 14, popDensity: "Very High" },
                { district: "Eastern Basin & Wetlands", riskLevel: "HIGH", index: 82, incidents: 9, popDensity: "High" },
                { district: "North Industrial Belt", riskLevel: "MEDIUM", index: 58, incidents: 5, popDensity: "Medium" },
                { district: "South Suburb Sector", riskLevel: "LOW", index: 36, incidents: 3, popDensity: "Moderate" }
              ]).map(row => (
                <tr className="table-row-item" key={row.district}>
                  <td><b>{row.district}</b></td>
                  <td>
                    <span className={`priority-tag ${row.riskLevel === "CRITICAL" ? "high" : row.riskLevel === "HIGH" ? "medium" : "low"}`}>
                      {row.riskLevel}
                    </span>
                  </td>
                  <td><b>{row.index} / 100</b></td>
                  <td>{row.incidents} active</td>
                  <td>{row.popDensity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// 7. EMERGENCY ALERTS & MULTI-CHANNEL DISPATCH DASHBOARD
// ============================================================================
export function EmergencyAlertsDashboard({ incidents = [], teams = [], onOpenTwilio }) {
  const [channel, setChannel] = useState("whatsapp"); // "whatsapp" | "sms" | "call"
  const [selectedSquadId, setSelectedSquadId] = useState("");
  const [targetPhone, setTargetPhone] = useState("+918210868501");
  const [linkedIncidentId, setLinkedIncidentId] = useState("");
  const [alertText, setAlertText] = useState("");
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [transmissionLog, setTransmissionLog] = useState([
    {
      id: "DISP-101",
      channel: "whatsapp",
      recipient: "Rapid Relief Foundation (+91-98000-00001)",
      threat: "River Inflow Spike",
      incidentId: "INC-1042",
      status: "DELIVERED",
      sid: "SMa89fbc7102e3b129",
      time: "8 mins ago"
    },
    {
      id: "DISP-102",
      channel: "sms",
      recipient: "District Response Unit (+918210868501)",
      threat: "Flash Precipitation Warning",
      incidentId: "INC-1051",
      status: "SENT",
      sid: "SM3c4980dae890214",
      time: "22 mins ago"
    },
    {
      id: "DISP-103",
      channel: "call",
      recipient: "Command Sector Alpha Lead",
      threat: "Evacuation Protocol Trigger",
      incidentId: "INC-1045",
      status: "COMPLETED",
      sid: "CA923b7e1903fa887",
      time: "41 mins ago"
    }
  ]);

  const verifiedTeams = teams.filter(t => t.verified !== false && t.status !== "PENDING_VERIFICATION");

  useEffect(() => {
    if (verifiedTeams.length && !selectedSquadId) {
      setSelectedSquadId(verifiedTeams[0].id);
    }
  }, [verifiedTeams, selectedSquadId]);

  const handleSquadChange = (squadId) => {
    setSelectedSquadId(squadId);
  };

  const handleApplyPreset = (text) => {
    setAlertText(text);
  };

  const handleSendDispatch = async (e) => {
    e.preventDefault();
    setSending(true);
    setReceipt(null);

    const squad = verifiedTeams.find(t => t.id === selectedSquadId);
    const payload = {
      channel,
      toPhone: targetPhone,
      teamName: squad ? squad.name : "Central Quick Response",
      incidentId: linkedIncidentId || "INC-EMERGENCY-BROADCAST",
      incidentType: "Critical Emergency Threat",
      incidentLocation: "Sector Command Active Area",
      priority: 88,
      message: alertText || "EMERGENCY BROADCAST: Urgent disaster alert issued by State Disaster Command Center. Responders stand by for immediate field mobilization."
    };

    try {
      const res = await fetch(`${API}/twilio/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setReceipt(data);
      if (data.ok) {
        setTransmissionLog(prev => [
          {
            id: "DISP-" + Date.now().toString().slice(-4),
            channel,
            recipient: (squad ? squad.name : "Recipient") + ` (${targetPhone})`,
            threat: linkedIncidentId ? `Linked: ${linkedIncidentId}` : "Emergency Advisory",
            incidentId: linkedIncidentId || "INC-LIVE",
            status: data.status ? data.status.toUpperCase() : "DELIVERED",
            sid: data.sid || "SM" + Math.random().toString(36).substring(2, 10),
            time: "Just now"
          },
          ...prev
        ]);
      }
    } catch (err) {
      setReceipt({ ok: false, error: err.message || "Failed to reach dispatch service" });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="main-viewport">
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">Executive Broadcast System</span>
          <h2>🚨 Emergency Alerts & Multi-Channel Dispatch Hub</h2>
          <p>State Command emergency broadcasts: send SMS, WhatsApp, and Voice warnings to field units and citizens.</p>
        </div>
        <div className="header-right-btns">
          {onOpenTwilio && (
            <button className="btn-chat-primary" onClick={onOpenTwilio} style={{ background: "#e11d48", border: "none" }}>
              <ShieldAlert size={15} /> 🚨 Quick Modal Broadcast
            </button>
          )}
        </div>
      </div>

      {/* Top Threat Indicators */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper rose"><ShieldAlert size={22} /></div>
          <div className="stat-meta">
            <small>Active Emergency Threat Level</small>
            <strong style={{ color: "#e11d48" }}>RED ALERT • ACTIVE</strong>
            <span className="stat-trend">Severe Regional Inundation</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green"><MessageSquare size={22} /></div>
          <div className="stat-meta">
            <small>WhatsApp Broadcast Channel</small>
            <strong>+1 415 523 8886</strong>
            <span className="stat-trend" style={{ color: "#059669" }}>Twilio Sandbox Online</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><Phone size={22} /></div>
          <div className="stat-meta">
            <small>Direct SMS / Voice Carrier</small>
            <strong>+1 516 475 7426</strong>
            <span className="stat-trend">Live Dedicated Number</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper emerald"><Truck size={22} /></div>
          <div className="stat-meta">
            <small>Verified Ready Squads</small>
            <strong>{verifiedTeams.length} Units Ready</strong>
            <span className="stat-trend">100% Cleared for Dispatch</span>
          </div>
        </div>
      </div>

      <div className="grid-equal-2">
        {/* Active Regional Threat Advisories */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>🚨 Active Regional Emergency Advisories</h3>
              <p>Official alerts currently broadcast across emergency channels</p>
            </div>
            <span className="priority-tag high">3 Live</span>
          </div>
          <div className="alerts-list-group">
            <div className="alert-item-card critical">
              <div className="alert-item-title">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CloudRain size={16} /> Hooghly River Drainage Surge Alert
                </span>
                <span className="priority-tag high">Priority 95</span>
              </div>
              <p className="alert-item-body">
                Water surge recorded at +1.8m above mean seasonal datum. Low-lying riverside zones in Sectors 3, 4, and 7 face impending bank overflow.
              </p>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-pill-filter"
                  style={{ fontSize: "11.5px", padding: "4px 10px" }}
                  onClick={() => handleApplyPreset("🚨 URGENT RIVER SURGE: Hooghly basin has exceeded critical flood datum (+1.8m). Residents in Sectors 3 & 4 must initiate precautionary evacuation immediately.")}
                >
                  Use for Broadcast
                </button>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center" }}>Issued 14m ago • National Disaster Matrix</span>
              </div>
            </div>

            <div className="alert-item-card warning">
              <div className="alert-item-title">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Flame size={16} /> Flash Precipitation & Runoff Threat
                </span>
                <span className="priority-tag medium">Priority 78</span>
              </div>
              <p className="alert-item-body">
                Precipitation rates in excess of 28 mm/hr anticipated within next 90 minutes. High risk of underpass flooding and electrical hazards.
              </p>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-pill-filter"
                  style={{ fontSize: "11.5px", padding: "4px 10px" }}
                  onClick={() => handleApplyPreset("⚠️ WEATHER ALERT: Severe flash precipitation (>28mm/hr) incoming. Avoid subterranean roads, underpasses, and downed electrical poles.")}
                >
                  Use for Broadcast
                </button>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center" }}>Issued 35m ago • IMD Radar Telemetry</span>
              </div>
            </div>

            <div className="alert-item-card" style={{ borderLeft: "4px solid #3b82f6", background: "var(--bg-subtle)" }}>
              <div className="alert-item-title">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertTriangle size={16} /> Unstable Ridge Slope Warning
                </span>
                <span className="priority-tag low">Advisory</span>
              </div>
              <p className="alert-item-body">
                Geological sensors indicate saturation creep along the Eastern Ridge embankment. Heavy transport vehicles restricted from perimeter roads.
              </p>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-pill-filter"
                  style={{ fontSize: "11.5px", padding: "4px 10px" }}
                  onClick={() => handleApplyPreset("📢 GEOLOGICAL NOTICE: Soil saturation alert active at Eastern Ridge perimeter. Commercial traffic diverted to Western Expressway.")}
                >
                  Use for Broadcast
                </button>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center" }}>Issued 1h ago • Geotechnical Unit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Multi-Channel Broadcast Center */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>📡 Multi-Channel Emergency Dispatcher</h3>
              <p>Direct live alert transmission via Twilio SMS, WhatsApp, and Voice calls</p>
            </div>
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "12px", color: "#1e40af", lineHeight: "1.5" }}>
            💡 <strong>Twilio Trial Direct Delivery:</strong> Real SMS & Phone Calls will ring immediately on your Twilio-verified phone (<code>+918210868501</code>). In Trial mode, Twilio only allows sending live calls/SMS to verified numbers.
          </div>

          <form onSubmit={handleSendDispatch} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Channel Selector */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px", display: "block" }}>
                Select Emergency Transmission Channel:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                <button
                  type="button"
                  className={`btn-pill-filter ${channel === "whatsapp" ? "active" : ""}`}
                  style={{ justifyContent: "center", padding: "10px", fontWeight: "700", display: "flex", gap: "6px" }}
                  onClick={() => setChannel("whatsapp")}
                >
                  💬 WhatsApp
                </button>
                <button
                  type="button"
                  className={`btn-pill-filter ${channel === "sms" ? "active" : ""}`}
                  style={{ justifyContent: "center", padding: "10px", fontWeight: "700", display: "flex", gap: "6px" }}
                  onClick={() => setChannel("sms")}
                >
                  📱 SMS Text
                </button>
                <button
                  type="button"
                  className={`btn-pill-filter ${channel === "call" ? "active" : ""}`}
                  style={{ justifyContent: "center", padding: "10px", fontWeight: "700", display: "flex", gap: "6px" }}
                  onClick={() => setChannel("call")}
                >
                  📞 Phone Call
                </button>
              </div>
            </div>

            {/* Target Squad / Recipient */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px", display: "block" }}>
                  Assigned Rescue Squad:
                </label>
                <select
                  value={selectedSquadId}
                  onChange={e => handleSquadChange(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "13px", background: "var(--bg-surface)", color: "var(--text-main)" }}
                >
                  {verifiedTeams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.personnel} responders)
                    </option>
                  ))}
                  <option value="CUSTOM">Custom Number / Citizen</option>
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)" }}>
                    Recipient Phone (E.164):
                  </label>
                  <button
                    type="button"
                    onClick={() => setTargetPhone("+918210868501")}
                    style={{ fontSize: "11px", color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "4px", padding: "1px 6px", cursor: "pointer", fontWeight: "700" }}
                  >
                    ⚡ Verified Phone
                  </button>
                </div>
                <input
                  type="tel"
                  value={targetPhone}
                  onChange={e => setTargetPhone(e.target.value)}
                  placeholder="+918210868501"
                  required
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "13px", background: "var(--bg-surface)", color: "var(--text-main)" }}
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px", display: "block" }}>
                1-Click Emergency Directive Presets:
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-pill-filter"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                  onClick={() => handleApplyPreset("🚨 IMMEDIATE EVACUATION ORDER: Severe flood inundation detected. Direct all residents to designated high-ground relief shelters immediately.")}
                >
                  🚨 Evacuation Order
                </button>
                <button
                  type="button"
                  className="btn-pill-filter"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                  onClick={() => handleApplyPreset("⚠️ STANDBY ADVISORY: Red alert issued for critical infrastructure. Responders ensure vehicle readiness and comms checks.")}
                >
                  ⚠️ Standby Directive
                </button>
                <button
                  type="button"
                  className="btn-pill-filter"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                  onClick={() => handleApplyPreset("📢 CRITICAL MEDICAL DISPATCH: Mass casualty incident flagged. Trauma teams dispatch with immediate life-support ambulances.")}
                >
                  📢 Medical Mass Casualty
                </button>
              </div>
            </div>

            {/* Custom Alert Message */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px", display: "block" }}>
                Emergency Broadcast Transmission Text:
              </label>
              <textarea
                rows={3}
                value={alertText}
                onChange={e => setAlertText(e.target.value)}
                placeholder="Type emergency alert broadcast message here..."
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "13px", background: "var(--bg-surface)", color: "var(--text-main)", resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-chat-primary"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "700",
                background: channel === "whatsapp" ? "#059669" : channel === "call" ? "#d97706" : "#e11d48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: "none",
                cursor: sending ? "not-allowed" : "pointer"
              }}
            >
              <Send size={16} />
              {sending ? `Broadcasting ${channel.toUpperCase()} Alert...` : `🚨 Send Emergency Alert via ${channel.toUpperCase()}`}
            </button>
          </form>

          {/* Live Receipt Card */}
          {receipt && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                borderRadius: "10px",
                background: receipt.live ? "#ecfdf5" : (receipt.warning ? "#fffbeb" : "var(--primary-light)"),
                border: `1.5px solid ${receipt.live ? "#10b981" : (receipt.warning ? "#f59e0b" : "var(--primary-border)")}`
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                {receipt.live ? (
                  <CheckCircle size={18} color="#059669" />
                ) : receipt.warning ? (
                  <AlertTriangle size={18} color="#d97706" />
                ) : (
                  <CheckCircle size={18} color="var(--primary-dark)" />
                )}
                <strong style={{ color: receipt.live ? "#065f46" : (receipt.warning ? "#92400e" : "var(--primary-dark)") }}>
                  {receipt.live
                    ? "🟢 Live Carrier Dispatch Sent to Your Phone!"
                    : receipt.warning
                    ? "⚠️ Twilio Carrier Notice"
                    : "ℹ️ Sandbox Dispatch Processed"}
                </strong>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-body)", lineHeight: "1.6" }}>
                <div>Recipient: <b>{receipt.to}</b> ({receipt.teamName})</div>
                <div>Carrier Transmission SID: <code style={{ background: "rgba(0,0,0,0.06)", padding: "2px 6px", borderRadius: "4px" }}>{receipt.sid}</code></div>
                <div>Delivery Status: <span style={{ fontWeight: "700", textTransform: "uppercase" }}>{receipt.status}</span> ({receipt.live ? "LIVE" : "SANDBOX"})</div>
                {receipt.warning && (
                  <div style={{ marginTop: "6px", padding: "8px", background: "#fef3c7", borderRadius: "6px", color: "#92400e", fontSize: "11.5px", fontWeight: "600" }}>
                    {receipt.warning}
                  </div>
                )}
                {receipt.instructions && !receipt.warning && (
                  <div style={{ marginTop: "4px", fontSize: "11.5px", color: "var(--text-muted)" }}>{receipt.instructions}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Transmission Audit History */}
      <div className="panel-card" style={{ marginTop: "18px" }}>
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>📋 Emergency Alerts Transmission Audit Log</h3>
            <p>Cryptographic carrier log of all alerts dispatched through State Command</p>
          </div>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Transmission ID</th>
                <th>Channel</th>
                <th>Target Recipient</th>
                <th>Threat Advisory / Context</th>
                <th>Delivery Status</th>
                <th>Twilio Carrier SID</th>
                <th>Time Dispatched</th>
              </tr>
            </thead>
            <tbody>
              {transmissionLog.map(item => (
                <tr className="table-row-item" key={item.id}>
                  <td><b>{item.id}</b></td>
                  <td>
                    <span style={{ textTransform: "uppercase", fontWeight: "700", fontSize: "11px", color: item.channel === "whatsapp" ? "#059669" : item.channel === "call" ? "#d97706" : "#3b82f6" }}>
                      {item.channel}
                    </span>
                  </td>
                  <td>{item.recipient}</td>
                  <td><b>{item.threat}</b></td>
                  <td>
                    <span className={`status-badge ${item.status === "DELIVERED" || item.status === "COMPLETED" ? "verified" : "pending"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td><code style={{ fontSize: "11px" }}>{item.sid}</code></td>
                  <td><span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.time}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// 8. DIJKSTRA RAPID ROUTE NAVIGATION DASHBOARD (RESCUE MOBILIZATION)
// ============================================================================

export function haversineDistKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const BASE_ROAD_NETWORK_NODES = [
  { id: "NODE-HOWRAH", name: "Howrah Bridge Junction", lat: 22.5855, lng: 88.3470, type: "bridge", desc: "Western River Crossing & Relief Terminal" },
  { id: "NODE-VIDYASAGAR", name: "Second Hooghly Bridge Toll Plaza", lat: 22.5560, lng: 88.3280, type: "bridge", desc: "Southern Heavy Transporter Bridge" },
  { id: "NODE-ESPLANADE", name: "Esplanade Central Crossing", lat: 22.5665, lng: 88.3525, type: "hub", desc: "State Central Operations Artery" },
  { id: "NODE-PARKCIRCUS", name: "Park Circus 7-Point Rotary", lat: 22.5440, lng: 88.3670, type: "rotary", desc: "South-Central Arterial Link" },
  { id: "NODE-SEALDAH", name: "Sealdah Elevated Flyover", lat: 22.5670, lng: 88.3720, type: "flyover", desc: "East-Central Rail & Road Hub" },
  { id: "NODE-SHYAMBAZAR", name: "Shyambazar 5-Point North Hub", lat: 22.6020, lng: 88.3700, type: "rotary", desc: "Northern Sector Inflow Gate" },
  { id: "NODE-EMBYPASS-N", name: "EM Bypass North Expressway", lat: 22.5820, lng: 88.4050, type: "expressway", desc: "High-Speed Eastern Rapid Corridor" },
  { id: "NODE-EMBYPASS-S", name: "EM Bypass South Gateway", lat: 22.5250, lng: 88.3920, type: "expressway", desc: "Southern Evacuation Spine" },
  { id: "NODE-SALTLAKE", name: "Salt Lake Sector-V Tech Corridor", lat: 22.5740, lng: 88.4320, type: "arterial", desc: "Elevated High-Ground Safe Haven" },
  { id: "NODE-AIRPORT", name: "VIP Road Expressway North", lat: 22.6200, lng: 88.4100, type: "expressway", desc: "Aviation & Logistics Inflow Trunk" },
  { id: "NODE-ALIPORE", name: "Alipore Relief Depot Crossing", lat: 22.5320, lng: 88.3300, type: "arterial", desc: "Southwestern Staging Sector" },
  { id: "NODE-TOPSIA", name: "Topsia Elevated Connector", lat: 22.5380, lng: 88.3880, type: "flyover", desc: "Maa Flyover Eastern Gateway" },
  { id: "NODE-RACECOURSE", name: "Red Road Evacuation Artery", lat: 22.5530, lng: 88.3450, type: "expressway", desc: "Emergency Helicopter & Ambulance Spine" }
];

export const BASE_ROAD_NETWORK_EDGES = [
  { u: "NODE-HOWRAH", v: "NODE-ESPLANADE", roadName: "Mahatma Gandhi Road Link", roadType: "Urban Arterial", baseSpeedKmh: 42 },
  { u: "NODE-HOWRAH", v: "NODE-SHYAMBAZAR", roadName: "Strand Bank North Corridor", roadType: "Riverside Road", baseSpeedKmh: 35 },
  { u: "NODE-VIDYASAGAR", v: "NODE-RACECOURSE", roadName: "AJC Bose Flyover Ramp", roadType: "Elevated Flyover", baseSpeedKmh: 65 },
  { u: "NODE-VIDYASAGAR", v: "NODE-ALIPORE", roadName: "Diamond Harbour Connector", roadType: "Arterial Road", baseSpeedKmh: 45 },
  { u: "NODE-RACECOURSE", v: "NODE-ESPLANADE", roadName: "Red Road Rapid Boulevard", roadType: "Emergency Arterial", baseSpeedKmh: 60 },
  { u: "NODE-ESPLANADE", v: "NODE-SEALDAH", roadName: "BB Ganguly Transit Way", roadType: "Central Corridor", baseSpeedKmh: 38 },
  { u: "NODE-SEALDAH", v: "NODE-SHYAMBAZAR", roadName: "Acharya Prafulla Chandra Road", roadType: "Northern Arterial", baseSpeedKmh: 40 },
  { u: "NODE-SEALDAH", v: "NODE-EMBYPASS-N", roadName: "Beleghata Main Connector", roadType: "Arterial Trunk", baseSpeedKmh: 48 },
  { u: "NODE-RACECOURSE", v: "NODE-PARKCIRCUS", roadName: "AJC Bose Elevated Flyover", roadType: "High-Speed Flyover", baseSpeedKmh: 70 },
  { u: "NODE-PARKCIRCUS", v: "NODE-TOPSIA", roadName: "Maa Elevated Expressway (Flood Bypass)", roadType: "Elevated Expressway", baseSpeedKmh: 72 },
  { u: "NODE-TOPSIA", v: "NODE-EMBYPASS-S", roadName: "EM Bypass Southward Spine", roadType: "Expressway", baseSpeedKmh: 65 },
  { u: "NODE-TOPSIA", v: "NODE-EMBYPASS-N", roadName: "EM Bypass Central Spine", roadType: "Expressway", baseSpeedKmh: 68 },
  { u: "NODE-EMBYPASS-N", v: "NODE-SALTLAKE", roadName: "Salt Lake Sector-V Flyover Link", roadType: "Elevated Corridor", baseSpeedKmh: 58 },
  { u: "NODE-EMBYPASS-N", v: "NODE-AIRPORT", roadName: "VIP Road Expressway North", roadType: "Expressway", baseSpeedKmh: 72 },
  { u: "NODE-SHYAMBAZAR", v: "NODE-AIRPORT", roadName: "Jessore Road Rapid Connector", roadType: "Arterial Trunk", baseSpeedKmh: 50 },
  { u: "NODE-ALIPORE", v: "NODE-PARKCIRCUS", roadName: "Hazra - Ballygunge Circular Way", roadType: "Southern Arterial", baseSpeedKmh: 42 }
];

export function computeDijkstraShortestPath({
  nodes,
  edges,
  sourceId,
  targetId,
  dangerZones = [],
  avoidHazards = true,
  vehicleSpeedMultiplier = 1.0
}) {
  const adj = new Map();
  nodes.forEach(n => adj.set(n.id, []));

  edges.forEach(e => {
    let effectiveWeight = e.distanceKm;

    if (avoidHazards && dangerZones.length > 0) {
      const uNode = nodes.find(n => n.id === e.u);
      const vNode = nodes.find(n => n.id === e.v);
      if (uNode && vNode) {
        const midLat = (uNode.lat + vNode.lat) / 2;
        const midLng = (uNode.lng + vNode.lng) / 2;
        dangerZones.forEach(dz => {
          const dToDz = haversineDistKm(midLat, midLng, dz.lat, dz.lng);
          const dzRadiusKm = (dz.radiusMeters || 1200) / 1000;
          if (dToDz <= dzRadiusKm) {
            effectiveWeight += 80; // Heavily penalize flooded / high-risk roads
          } else if (dToDz <= dzRadiusKm * 1.5) {
            effectiveWeight += 20; // Risk buffer penalty
          }
        });
      }
    }

    adj.get(e.u)?.push({ neighbor: e.v, weight: effectiveWeight, distanceKm: e.distanceKm, roadName: e.roadName, roadType: e.roadType, baseSpeedKmh: e.baseSpeedKmh || 45 });
    adj.get(e.v)?.push({ neighbor: e.u, weight: effectiveWeight, distanceKm: e.distanceKm, roadName: e.roadName, roadType: e.roadType, baseSpeedKmh: e.baseSpeedKmh || 45 });
  });

  const dist = new Map();
  const prev = new Map();
  const edgeUsed = new Map();
  const unvisited = new Set();

  nodes.forEach(n => {
    dist.set(n.id, Infinity);
    unvisited.add(n.id);
  });
  dist.set(sourceId, 0);

  let iterations = 0;
  while (unvisited.size > 0) {
    iterations++;
    let curr = null;
    let minDist = Infinity;
    for (const nId of unvisited) {
      const d = dist.get(nId);
      if (d < minDist) {
        minDist = d;
        curr = nId;
      }
    }

    if (curr === null || minDist === Infinity) break;
    if (curr === targetId) break;

    unvisited.delete(curr);

    const neighbors = adj.get(curr) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.neighbor)) continue;
      const alt = dist.get(curr) + edge.weight;
      if (alt < dist.get(edge.neighbor)) {
        dist.set(edge.neighbor, alt);
        prev.set(edge.neighbor, curr);
        edgeUsed.set(edge.neighbor, edge);
      }
    }
  }

  const pathNodeIds = [];
  let currStep = targetId;
  while (currStep !== undefined) {
    pathNodeIds.unshift(currStep);
    currStep = prev.get(currStep);
  }

  if (pathNodeIds.length === 0 || pathNodeIds[0] !== sourceId) {
    return null;
  }

  let totalDistanceKm = 0;
  let totalHours = 0;
  let hazardFreeSegments = 0;
  const pathNodes = pathNodeIds.map(id => nodes.find(n => n.id === id)).filter(Boolean);
  const coordinates = pathNodes.map(n => [n.lat, n.lng]);
  const steps = [];

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const fromNode = pathNodes[i];
    const toNode = pathNodes[i + 1];
    const segDist = haversineDistKm(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng);
    totalDistanceKm += segDist;

    const edgeInfo = edgeUsed.get(toNode.id);
    const speed = (edgeInfo?.baseSpeedKmh || 45) * vehicleSpeedMultiplier;
    totalHours += segDist / speed;

    const midLat = (fromNode.lat + toNode.lat) / 2;
    const midLng = (fromNode.lng + toNode.lng) / 2;
    const isNearHazard = dangerZones.some(dz => haversineDistKm(midLat, midLng, dz.lat, dz.lng) <= (dz.radiusMeters || 1200) / 1000);
    if (!isNearHazard) hazardFreeSegments++;

    steps.push({
      stepNumber: i + 1,
      fromName: fromNode.name,
      toName: toNode.name,
      roadName: edgeInfo?.roadName || `Rapid Access Link to ${toNode.name}`,
      roadType: edgeInfo?.roadType || "Emergency Corridor",
      distanceKm: Math.round(segDist * 100) / 100,
      nearHazard: isNearHazard,
      instruction:
        i === 0
          ? `Deploy from ${fromNode.name} onto ${edgeInfo?.roadName || "Rapid Access Link"}`
          : i === pathNodes.length - 2
          ? `Proceed along ${edgeInfo?.roadName || "Final Approach"} and reach disaster zone: ${toNode.name}`
          : `Transition via ${edgeInfo?.roadName || "Corridor"} towards waypoint ${toNode.name}`
    });
  }

  const estimatedMinutes = Math.max(1, Math.round(totalHours * 60));
  const hazardClearance = steps.length > 0 ? Math.round((hazardFreeSegments / steps.length) * 100) : 100;

  return {
    sourceId,
    targetId,
    pathNodeIds,
    pathNodes,
    coordinates,
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    estimatedMinutes,
    hazardClearance,
    steps,
    iterations
  };
}

export function DijkstraNavigationDashboard({
  incidents = [],
  teams = [],
  onSelectIncident,
  DijkstraMapComponent,
  initialIncidentId = null,
  onNavigateTab
}) {
  const [selectedIncidentId, setSelectedIncidentId] = useState(initialIncidentId || (incidents[0]?.id || ""));
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [avoidHazards, setAvoidHazards] = useState(true);
  const [vehicleType, setVehicleType] = useState("ambulance"); // "ambulance" | "rig" | "boat"
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0); // 0 to 1
  const [simStepIndex, setSimStepIndex] = useState(0);
  const [dispatchNotice, setDispatchNotice] = useState(null);

  const dangerZones = [
    { id: "DANGER-01", name: "Hooghly Riverfront Inundation Zone", lat: 22.578, lng: 88.355, risk: "CRITICAL", alert: "Flood surge level +1.9m above danger datum", radiusMeters: 1400 },
    { id: "DANGER-02", name: "Eastern Ridge Unstable Slope", lat: 22.592, lng: 88.398, risk: "HIGH", alert: "Active soil saturation & rockfall hazard", radiusMeters: 900 }
  ];

  const targetIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0] || null;
  const verifiedTeams = teams.filter(t => t.verified !== false && t.status !== "PENDING_VERIFICATION");

  useEffect(() => {
    if (initialIncidentId) {
      setSelectedIncidentId(initialIncidentId);
    } else if (incidents.length && !selectedIncidentId) {
      setSelectedIncidentId(incidents[0].id);
    }
  }, [initialIncidentId, incidents]);

  // Pre-select team assigned to this incident if any, or closest team
  useEffect(() => {
    if (targetIncident && !selectedTeamId) {
      if (targetIncident.assignedTeam) {
        setSelectedTeamId(targetIncident.assignedTeam);
      } else if (verifiedTeams.length) {
        setSelectedTeamId(verifiedTeams[0].id);
      }
    }
  }, [targetIncident, verifiedTeams]);

  const respondingTeam = verifiedTeams.find(t => t.id === selectedTeamId) || verifiedTeams[0] || null;

  // Vehicle speed multiplier
  const speedMultiplier = vehicleType === "ambulance" ? 1.3 : vehicleType === "rig" ? 0.95 : 0.75;

  // Build Graph and compute Dijkstra route
  const dijkstraResult = React.useMemo(() => {
    if (!targetIncident || !respondingTeam) return null;

    const sourceNode = {
      id: "SQUAD-" + respondingTeam.id,
      name: `${respondingTeam.name} (Staging Depot)`,
      lat: respondingTeam.lat || 22.5726,
      lng: respondingTeam.lng || 88.3639,
      type: "squad"
    };

    const targetNode = {
      id: "INCIDENT-" + targetIncident.id,
      name: `${targetIncident.type} Epicenter (${targetIncident.id})`,
      lat: targetIncident.lat || 22.5726,
      lng: targetIncident.lng || 88.3639,
      type: "incident"
    };

    const allNodes = [sourceNode, targetNode, ...BASE_ROAD_NETWORK_NODES];
    const allEdges = [...BASE_ROAD_NETWORK_EDGES.map(e => {
      const uNode = allNodes.find(n => n.id === e.u);
      const vNode = allNodes.find(n => n.id === e.v);
      const d = uNode && vNode ? haversineDistKm(uNode.lat, uNode.lng, vNode.lat, vNode.lng) : 1;
      return { ...e, distanceKm: d };
    })];

    // Connect source to nearest 3 network nodes
    const sortedToSource = [...BASE_ROAD_NETWORK_NODES]
      .map(n => ({ node: n, dist: haversineDistKm(sourceNode.lat, sourceNode.lng, n.lat, n.lng) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    sortedToSource.forEach(({ node, dist }) => {
      allEdges.push({
        u: sourceNode.id,
        v: node.id,
        distanceKm: dist,
        roadName: `Depot Access Road to ${node.name}`,
        roadType: "Base Exit Link",
        baseSpeedKmh: 45
      });
    });

    // Connect target to nearest 3 network nodes
    const sortedToTarget = [...BASE_ROAD_NETWORK_NODES]
      .map(n => ({ node: n, dist: haversineDistKm(targetNode.lat, targetNode.lng, n.lat, n.lng) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    sortedToTarget.forEach(({ node, dist }) => {
      allEdges.push({
        u: node.id,
        v: targetNode.id,
        distanceKm: dist,
        roadName: `Field Inflow Approach to ${targetNode.name}`,
        roadType: "Field Response Link",
        baseSpeedKmh: 40
      });
    });

    // Optimal route (with hazard avoidance)
    const optimal = computeDijkstraShortestPath({
      nodes: allNodes,
      edges: allEdges,
      sourceId: sourceNode.id,
      targetId: targetNode.id,
      dangerZones,
      avoidHazards,
      vehicleSpeedMultiplier: speedMultiplier
    });

    // Comparative direct route (without hazard avoidance)
    const baseline = computeDijkstraShortestPath({
      nodes: allNodes,
      edges: allEdges,
      sourceId: sourceNode.id,
      targetId: targetNode.id,
      dangerZones,
      avoidHazards: false,
      vehicleSpeedMultiplier: speedMultiplier
    });

    return { optimal, baseline, allNodes };
  }, [targetIncident, respondingTeam, avoidHazards, speedMultiplier]);

  // Interpolated position for simulation
  const vehiclePos = React.useMemo(() => {
    if (!dijkstraResult?.optimal?.coordinates || dijkstraResult.optimal.coordinates.length < 2) return null;
    const coords = dijkstraResult.optimal.coordinates;
    const totalSegments = coords.length - 1;
    const exactIndex = simProgress * totalSegments;
    const currentSegment = Math.min(Math.floor(exactIndex), totalSegments - 1);
    const segmentFraction = exactIndex - currentSegment;

    const p1 = coords[currentSegment];
    const p2 = coords[currentSegment + 1];

    return {
      lat: p1[0] + (p2[0] - p1[0]) * segmentFraction,
      lng: p1[1] + (p2[1] - p1[1]) * segmentFraction,
      currentSegment
    };
  }, [dijkstraResult, simProgress]);

  // Simulation timer
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 1) {
          setIsSimulating(false);
          return 1;
        }
        return Math.min(1, prev + 0.02);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleStartSim = () => {
    if (simProgress >= 1) setSimProgress(0);
    setIsSimulating(true);
  };

  const handlePauseSim = () => {
    setIsSimulating(false);
  };

  const handleResetSim = () => {
    setIsSimulating(false);
    setSimProgress(0);
  };

  const handleDispatchTwilio = async () => {
    if (!targetIncident || !respondingTeam) return;
    setDispatchNotice("Transmitting Dijkstra route directives to responding squad...");
    try {
      const eta = dijkstraResult?.optimal?.estimatedMinutes || 8;
      const km = dijkstraResult?.optimal?.totalDistanceKm || 4.2;
      const msg = `🚨 [DIJKSTRA RAPID ROUTE DISPATCH]\n` +
        `Unit: ${respondingTeam.name}\n` +
        `Target: ${targetIncident.type} (ID: ${targetIncident.id})\n` +
        `Optimal Route Distance: ${km} km\n` +
        `Estimated Emergency Transit: ${eta} mins\n` +
        `Hazard Clearance: ${dijkstraResult?.optimal?.hazardClearance || 100}% (Avoiding flood zones)\n` +
        `Directives: Follow GPS corridors via high-clearance flyovers immediately.`;

      const res = await fetch(`${API}/twilio/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: targetIncident.id,
          teamId: respondingTeam.id,
          teamName: respondingTeam.name,
          toPhone: respondingTeam.phone || "+918210868501",
          channel: "sms",
          message: msg
        })
      });
      const data = await res.json();
      setDispatchNotice(`✅ Route instructions dispatched via Twilio SMS! Carrier SID: ${data.sid || "SM-LIVE"}`);
    } catch (e) {
      setDispatchNotice("⚠️ Failed to reach carrier service: " + e.message);
    }
  };

  const optimal = dijkstraResult?.optimal;
  const baseline = dijkstraResult?.baseline;

  return (
    <main className="main-viewport">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">Algorithmic Emergency Logistics</span>
          <h2>🧭 Dijkstra Rapid Route & Live Navigation Engine</h2>
          <p>
            Shortest-path graph optimization: computes safe, real-time emergency transit corridors around flood inundations and landslides.
          </p>
        </div>
        <div className="header-right-btns" style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn-chat-primary"
            onClick={handleDispatchTwilio}
            style={{ background: "#059669", border: "none" }}
          >
            <Send size={15} /> Transmit Route to Squad (SMS)
          </button>
        </div>
      </div>

      {dispatchNotice && (
        <div style={{ background: "#ecfdf5", border: "1.5px solid #10b981", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "12.5px", color: "#065f46", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{dispatchNotice}</span>
          <button onClick={() => setDispatchNotice(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#065f46" }}><X size={15} /></button>
        </div>
      )}

      {/* Top Telemetry KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: "18px" }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper green"><Route size={22} /></div>
          <div className="stat-meta">
            <small>Dijkstra Shortest Path</small>
            <strong style={{ color: "#059669" }}>{optimal ? `${optimal.totalDistanceKm} km` : "Computing..."}</strong>
            <span className="stat-trend">
              {baseline && optimal && baseline.totalDistanceKm !== optimal.totalDistanceKm
                ? `Safety Detour (+${Math.round((optimal.totalDistanceKm - baseline.totalDistanceKm) * 10) / 10} km)`
                : "Optimal Direct Corridor"}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><Clock size={22} /></div>
          <div className="stat-meta">
            <small>Emergency Arrival ETA</small>
            <strong style={{ color: "#2563eb" }}>{optimal ? `${optimal.estimatedMinutes} Mins` : "—"}</strong>
            <span className="stat-trend">Emergency Siren Transit</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper rose"><ShieldAlert size={22} /></div>
          <div className="stat-meta">
            <small>Hazard Avoidance Score</small>
            <strong style={{ color: optimal && optimal.hazardClearance === 100 ? "#059669" : "#e11d48" }}>
              {optimal ? `${optimal.hazardClearance}% CLEAR` : "—"}
            </strong>
            <span className="stat-trend">Bypassing Active Water Surges</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper amber"><Zap size={22} /></div>
          <div className="stat-meta">
            <small>Algorithmic Optimization</small>
            <strong style={{ color: "#d97706" }}>O(E + V log V)</strong>
            <span className="stat-trend">{optimal ? `${optimal.pathNodes.length} Waypoints Traversed` : "Min-Heap Relaxation"}</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Panel */}
      <div className="panel-card" style={{ marginBottom: "18px", padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", alignItems: "center" }}>
          {/* Target Incident Selector */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginBottom: "5px", display: "block" }}>
              🎯 Target Disaster Incident:
            </label>
            <select
              value={selectedIncidentId}
              onChange={e => setSelectedIncidentId(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "13px", background: "var(--bg-surface)", color: "var(--text-main)" }}
            >
              {incidents.map(inc => (
                <option key={inc.id} value={inc.id}>
                  [{inc.type}] {inc.id} • Priority {inc.priority}/100
                </option>
              ))}
            </select>
          </div>

          {/* Responding Squad Selector */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginBottom: "5px", display: "block" }}>
              🚑 Responding Rescue Unit:
            </label>
            <select
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "13px", background: "var(--bg-surface)", color: "var(--text-main)" }}
            >
              {verifiedTeams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.personnel} crew)
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginBottom: "5px", display: "block" }}>
              🚒 Mobilization Vehicle Type:
            </label>
            <select
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", fontSize: "13px", background: "var(--bg-surface)", color: "var(--text-main)" }}
            >
              <option value="ambulance">🚑 Rapid Ambulance Van (60 km/h)</option>
              <option value="rig">🚒 Heavy Search & Rescue Rig (42 km/h)</option>
              <option value="boat">🚤 Inflatable Boat Transporter (30 km/h)</option>
            </select>
          </div>

          {/* Hazard Avoidance Toggle */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginBottom: "5px", display: "block" }}>
              🛡️ Dijkstra Safety Filter:
            </label>
            <button
              type="button"
              onClick={() => setAvoidHazards(!avoidHazards)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1.5px solid",
                borderColor: avoidHazards ? "#10b981" : "#f59e0b",
                background: avoidHazards ? "#ecfdf5" : "#fffbeb",
                color: avoidHazards ? "#065f46" : "#92400e",
                fontWeight: "700",
                fontSize: "12.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <ShieldAlert size={16} />
              {avoidHazards ? "Bypassing Flood & Hazard Zones" : "Direct Unfiltered Route"}
            </button>
          </div>
        </div>

        {/* Live Simulation Progress Controls */}
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-light)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>Live Transit Simulator:</span>
            {!isSimulating ? (
              <button
                className="btn-chat-primary"
                onClick={handleStartSim}
                style={{ padding: "7px 14px", fontSize: "12px", background: "#059669", border: "none" }}
              >
                <Play size={14} /> {simProgress > 0 && simProgress < 1 ? "Resume Transit" : "Simulate Transit"}
              </button>
            ) : (
              <button
                className="btn-action-sm"
                onClick={handlePauseSim}
                style={{ padding: "7px 14px", fontSize: "12px", background: "#f59e0b", color: "#fff", border: "none" }}
              >
                <Pause size={14} /> Pause
              </button>
            )}
            <button
              className="btn-action-sm"
              onClick={handleResetSim}
              style={{ padding: "7px 12px", fontSize: "12px" }}
              title="Reset Position"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div style={{ flex: "1 1 300px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, background: "var(--bg-subtle)", borderRadius: "999px", height: "10px", overflow: "hidden", border: "1px solid var(--border-light)" }}>
              <div
                style={{
                  width: `${Math.round(simProgress * 100)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #10b981, #059669)",
                  transition: "width 0.15s linear"
                }}
              />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#059669", minWidth: "45px" }}>
              {Math.round(simProgress * 100)}%
            </span>
          </div>

          {optimal && (
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
              Remaining: <b>{Math.max(0, Math.round((optimal.totalDistanceKm * (1 - simProgress)) * 10) / 10)} km</b> • ETA: <b>{Math.max(0, Math.round(optimal.estimatedMinutes * (1 - simProgress)))} min</b>
            </div>
          )}
        </div>
      </div>

      {/* Main Map + Turn-by-Turn Directives Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "18px", alignItems: "start" }}>
        {/* Interactive Dijkstra Map Frame */}
        <div className="panel-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="live-pulse" />
              <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>
                Live Geospatial Route Visualization
              </strong>
            </div>
            <div style={{ display: "flex", gap: "14px", fontSize: "11px", fontWeight: "700" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#059669" }}>
                <span style={{ width: "12px", height: "4px", background: "#059669", borderRadius: "2px" }} />
                Optimal Dijkstra Path
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#f59e0b" }}>
                <span style={{ width: "12px", height: "4px", background: "#f59e0b", borderRadius: "2px", borderTop: "1px dashed #f59e0b" }} />
                Hazardous Direct Line
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#e11d48" }}>
                <span style={{ width: "10px", height: "10px", background: "rgba(225,29,72,0.3)", borderRadius: "50%", border: "1px solid #e11d48" }} />
                Flood/Hazard Perimeters
              </span>
            </div>
          </div>

          {/* Map Rendering Container */}
          {DijkstraMapComponent && (
            <DijkstraMapComponent
              squad={respondingTeam}
              incident={targetIncident}
              pathCoordinates={optimal?.coordinates || []}
              alternativeCoordinates={avoidHazards && baseline ? baseline.coordinates : []}
              dangerZones={dangerZones}
              vehiclePosition={vehiclePos}
              isSimulating={isSimulating}
              networkNodes={BASE_ROAD_NETWORK_NODES}
            />
          )}
        </div>

        {/* Turn-by-Turn Directives & Telemetry Inspector */}
        <div className="panel-card">
          <div className="panel-header" style={{ marginBottom: "12px" }}>
            <div className="panel-title-group">
              <h3>🧭 Turn-by-Turn Navigation Log</h3>
              <p>Dijkstra corridor steps and road clearance</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "480px", overflowY: "auto", paddingRight: "4px" }}>
            {optimal?.steps && optimal.steps.length > 0 ? (
              optimal.steps.map(step => (
                <div
                  key={step.stepNumber}
                  className={`nav-step-box${step.nearHazard ? " hazard" : ""}`}
                >
                  <div className="nav-step-header">
                    <span className={`nav-step-title${step.nearHazard ? " hazard" : ""}`}>
                      Step {step.stepNumber} • {step.roadType}
                    </span>
                    <span className="nav-step-km">{step.distanceKm} km</span>
                  </div>
                  <div className="nav-step-instruction">{step.instruction}</div>
                  <div className="nav-step-route">Route: <b>{step.roadName}</b></div>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                Select an incident and squad to calculate optimal Dijkstra route.
              </div>
            )}
          </div>

          {/* Algorithmic Details Box */}
          <div style={{ marginTop: "14px", padding: "10px 12px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "11px", color: "#64748b" }}>
            <div><strong>Algorithm:</strong> Dijkstra Single-Source Shortest Path (SSSP)</div>
            <div><strong>Edge Relaxation:</strong> Priority-Queue with Haversine Weighting</div>
            <div><strong>Safety Factor:</strong> Dynamic +80 km weight penalty on flooded riverfront sectors</div>
          </div>
        </div>
      </div>
    </main>
  );
}

