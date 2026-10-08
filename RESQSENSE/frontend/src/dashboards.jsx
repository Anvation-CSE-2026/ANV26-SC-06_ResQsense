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
  LifeBuoy
} from "lucide-react";

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
  demoCenter
}) {
  const [stats, setStats] = useState(null);
  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || "");

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/stats")
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
                  <th>Assigned Squad</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.filter(i => i.priority >= 70).slice(0, 5).map(inc => (
                  <tr className="table-row-item" key={inc.id}>
                    <td><b>{inc.id}</b></td>
                    <td>{inc.type}</td>
                    <td><span className="priority-tag high">{inc.priority}</span></td>
                    <td>
                      <span style={{ fontSize: "12px", color: inc.assignedTeam ? "#059669" : "#64748b" }}>
                        {inc.assignedTeam ? `Team ${inc.assignedTeam}` : "Unassigned"}
                      </span>
                    </td>
                    <td>
                      <button className="btn-assign-primary" onClick={() => setSelectedIncidentForAssign(inc)}>
                        Assign
                      </button>
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

      {selectedIncidentForAssign && (
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
            {teams.map(t => (
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
export function IncidentQueueDashboard({ incidents, teams, onSelectIncident, onAssignTeam, onRefresh }) {
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
      const res = await fetch("http://localhost:5000/api/incidents", {
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
      await fetch(`http://localhost:5000/api/incidents/${incidentId}`, {
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
      await fetch(`http://localhost:5000/api/incidents/${incidentId}`, { method: "DELETE" });
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
          <span className="page-eyebrow">Triage & Queue Command</span>
          <h2>Incident Dispatch & Operations Queue</h2>
          <p>Real-time queue of all emergency SOS events, field reports, and triage priorities.</p>
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
                <th>Assigned Squad</th>
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
      {assignModalIncident && (
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
            {teams.map(t => (
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
    fetch("http://localhost:5000/api/control-map")
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
    fetch("http://localhost:5000/api/resources")
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
      const res = await fetch("http://localhost:5000/api/resources/allocate", {
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {filtered.map(res => {
          const pct = Math.round((res.deployed / res.total) * 100);
          return (
            <div key={res.id} className="panel-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>{res.category}</span>
                  <span className={`priority-tag ${res.status === "CRITICAL" ? "high" : res.status === "HIGH_DEMAND" ? "medium" : "low"}`}>
                    {res.status}
                  </span>
                </div>
                <h4 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>{res.name}</h4>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px 0" }}>Depot: {res.depot}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Available: <b style={{ color: "#059669" }}>{res.available}</b> {res.unit}</span>
                  <span>Deployed: {res.deployed} / {res.total}</span>
                </div>
                <div className="progress-track" style={{ height: "8px" }}>
                  <div className={`progress-fill ${pct > 80 ? "danger" : pct > 60 ? "warning" : ""}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>

              <button
                className="btn-chat-primary"
                style={{ marginTop: "16px", width: "100%", fontSize: "13px" }}
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
export function RescueTeamsDashboard({ teams, incidents, onRefresh }) {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // New squad form state
  const [squadName, setSquadName] = useState("");
  const [squadType, setSquadType] = useState("GOVERNMENT");
  const [squadPhone, setSquadPhone] = useState("+91-98000-00000");
  const [squadPersonnel, setSquadPersonnel] = useState("10");
  const [squadReadiness, setSquadReadiness] = useState("95");

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: squadName,
          type: squadType,
          phone: squadPhone,
          personnel: Number(squadPersonnel),
          readiness: Number(squadReadiness),
          skills: ["Search & Rescue", "Medical", "Flood"],
          equipment: ["Rescue Vehicle", "Medical Kit", "Boat"],
          status: "AVAILABLE"
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setSquadName("");
        onRefresh?.();
      }
    } catch (err) {
      alert("Error adding squad: " + err.message);
    }
  };

  const toggleTeamStatus = async (teamId, currentStatus) => {
    const newStatus = currentStatus === "AVAILABLE" ? "DEPLOYED" : "AVAILABLE";
    try {
      await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = teams.filter(t => {
    if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <main className="main-viewport">
      <div className="page-header-row">
        <div>
          <span className="page-eyebrow">Force Readiness & Roster</span>
          <h2>Rescue Force Directory & Team Readiness</h2>
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
            <small>Total Response Units</small>
            <strong>{teams.length}</strong>
            <span className="stat-trend">100% Verified</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper emerald"><Users size={22} /></div>
          <div className="stat-meta">
            <small>Total Mobilized Responders</small>
            <strong>{teams.reduce((acc, t) => acc + (t.personnel || 0), 0)}</strong>
            <span className="stat-trend">Ready for Triage</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><Activity size={22} /></div>
          <div className="stat-meta">
            <small>Units Available for Dispatch</small>
            <strong>{teams.filter(t => t.status === "AVAILABLE").length}</strong>
            <span className="stat-trend">Immediate Response</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper amber"><Clock size={22} /></div>
          <div className="stat-meta">
            <small>Currently Deployed in Field</small>
            <strong>{teams.filter(t => t.status === "DEPLOYED").length}</strong>
            <span className="stat-trend">On Active Missions</span>
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {filtered.map(team => (
          <div key={team.id} className="panel-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <span className="user-badge-tag">{team.id}</span>
                <span className={`priority-tag ${team.status === "AVAILABLE" ? "low" : "medium"}`}>
                  {team.status}
                </span>
              </div>

              <h4 style={{ margin: "0 0 4px 0", color: "#0f172a" }}>{team.name}</h4>
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
              <p>Add a verified field squad to the active roster.</p>
            </div>
            <form onSubmit={handleCreateSquad} style={{ padding: "24px" }}>
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
                <button type="submit" className="btn-chat-primary" style={{ flex: 1 }}>Register Unit</button>
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
    fetch("http://localhost:5000/api/analytics")
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
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "10px 0" }}>
            {(analytics?.hazardDistribution || [
              { type: "Flood", percentage: 45, count: 18 },
              { type: "Landslide", percentage: 20, count: 8 },
              { type: "Earthquake", percentage: 15, count: 6 },
              { type: "Heavy Rain", percentage: 12, count: 5 },
              { type: "Fire", percentage: 8, count: 3 }
            ]).map(item => (
              <div key={item.type}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  <span>{item.type}</span>
                  <span>{item.percentage}% ({item.count} reports)</span>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "10px 0" }}>
            {(analytics?.priorityBreakdown || [
              { label: "Critical Urgency (80-100)", count: 3, color: "#ef4444" },
              { label: "High Urgency (60-79)", count: 4, color: "#f59e0b" },
              { label: "Moderate Risk (30-59)", count: 6, color: "#3b82f6" },
              { label: "Low Urgency (<30)", count: 2, color: "#10b981" }
            ]).map(p => (
              <div key={p.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                  <span style={{ color: p.color }}>{p.label}</span>
                  <span><b>{p.count}</b> incidents</span>
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
