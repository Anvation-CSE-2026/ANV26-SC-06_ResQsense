import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from "react-leaflet";
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
  Database,
  Upload,
  Camera,
  ImageIcon,
  Type,
  MessageSquare,
  BellRing,
  Moon,
  Sun
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
  EmergencyAnalyticsDashboard,
  EmergencyAlertsDashboard,
  DijkstraNavigationDashboard,
  haversineDistKm
} from "./dashboards.jsx";

const API = import.meta.env.VITE_API_URL || "/api";
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

const ambulanceMovingIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `<div style="
    background-color: #059669;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 3px solid #ffffff;
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  ">🚑</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const redPulsingIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `<div style="
    background-color: #e11d48;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px solid #ffffff;
    box-shadow: 0 0 16px rgba(225, 29, 72, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
  ">🚨</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const blueWaypointIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `<div style="
    background-color: #2563eb;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 1px 5px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const citizenUserIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `<div style="
    background: radial-gradient(circle, #2563eb 0%, #1d4ed8 100%);
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 3.5px solid #ffffff;
    box-shadow: 0 0 0 7px rgba(37, 99, 235, 0.4), 0 4px 14px rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
  ">📍</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

function DijkstraRouteMap({
  squad,
  incident,
  pathCoordinates = [],
  alternativeCoordinates = [],
  dangerZones = [],
  vehiclePosition = null,
  isSimulating = false,
  networkNodes = []
}) {
  const center = incident ? [incident.lat || demoCenter[0], incident.lng || demoCenter[1]] : demoCenter;

  return (
    <div className="map-container-frame" style={{ height: "540px", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer center={center} zoom={13} scrollWheelZoom className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter center={vehiclePosition ? [vehiclePosition.lat, vehiclePosition.lng] : center} />

        {/* Active Hazard / Danger Zones (Dispersal Circles) */}
        {dangerZones.map(dz => (
          <Circle
            key={dz.id}
            center={[dz.lat, dz.lng]}
            radius={dz.radiusMeters || 1200}
            pathOptions={{
              color: "#e11d48",
              fillColor: "#e11d48",
              fillOpacity: 0.18,
              dashArray: "6, 6",
              weight: 2
            }}
          >
            <Popup>
              <div className="custom-map-popup">
                <span className="popup-tag danger">⚠️ ACTIVE HAZARD ZONE</span>
                <div className="popup-title">{dz.name}</div>
                <div className="popup-desc">{dz.alert}</div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Comparative Dotted Route (Un-avoided baseline path) */}
        {alternativeCoordinates.length > 1 && (
          <Polyline
            positions={alternativeCoordinates}
            pathOptions={{
              color: "#f59e0b",
              weight: 3,
              dashArray: "8, 8",
              opacity: 0.75
            }}
          />
        )}

        {/* Optimal Dijkstra Path (Glowing Emerald Polyline) */}
        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            pathOptions={{
              color: "#059669",
              weight: 6,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round"
            }}
          />
        )}

        {/* Intermediate Road Network Checkpoints */}
        {networkNodes.map(node => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={blueWaypointIcon}
          >
            <Popup>
              <div className="custom-map-popup">
                <span className="popup-tag info">ROAD JUNCTION</span>
                <div className="popup-title">{node.name}</div>
                <div className="popup-desc">{node.desc || "Arterial Network Checkpoint"}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Responding Squad (or animated moving vehicle during simulation) */}
        {squad && (
          <Marker
            position={vehiclePosition ? [vehiclePosition.lat, vehiclePosition.lng] : [squad.lat || demoCenter[0], squad.lng || demoCenter[1]]}
            icon={vehiclePosition ? ambulanceMovingIcon : greenIcon}
          >
            <Popup>
              <div className="custom-map-popup">
                <span className="popup-tag info">🚑 RESPONDING SQUAD</span>
                <div className="popup-title">{squad.name}</div>
                <div className="popup-desc">
                  Status: <b>{isSimulating ? "EN ROUTE (TRANSIT)" : "STAGING BASE"}</b><br/>
                  Personnel: {squad.personnel} responders
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Target Incident Epicenter */}
        {incident && (
          <Marker
            position={[incident.lat || demoCenter[0], incident.lng || demoCenter[1]]}
            icon={redPulsingIcon}
          >
            <Popup>
              <div className="custom-map-popup">
                <span className="popup-tag danger">🚨 TARGET DISASTER SITE</span>
                <div className="popup-title">{incident.type} ({incident.id})</div>
                <div className="popup-desc">
                  Priority: <b>{incident.priority}/100</b><br/>
                  Reported Affected: <b>{incident.people || 1} people</b>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

function MapCenter({ center, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
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

function LiveMap({ incidents, teams, center, onSelect, showTeams = true, filter = "ALL", userLocation = null }) {
  const filteredIncidents = incidents.filter(i => {
    if (filter === "CRITICAL") return i.priority >= 80;
    if (filter === "FLOOD") return i.type?.toLowerCase().includes("flood");
    return true;
  });

  // Zoom 10 fits a ~50km radius comfortably on screen
  const defaultZoom = userLocation ? 10 : 12;

  return (
    <div className="map-container-frame">
      <MapContainer center={center || demoCenter} zoom={defaultZoom} scrollWheelZoom className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter center={center} zoom={defaultZoom} />
        
        {/* Real-time Disaster Risk Heatmap */}
        <HeatmapOverlay incidents={filteredIncidents} />

        {/* 50km Citizen Safety Radar & Device Location Marker */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={50000} // 50 km in meters
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.08,
                weight: 2.5,
                dashArray: "6, 6"
              }}
            />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={citizenUserIcon}>
              <Popup>
                <div className="custom-map-popup">
                  <span className="popup-tag info">📍 YOUR LIVE LOCATION</span>
                  <div className="popup-title">Citizen Device Position</div>
                  <div className="popup-desc">
                    <b>50 km Safety Radar Active</b><br />
                    Coordinates: <b>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</b><br />
                    Accuracy: ±{Math.round(userLocation.accuracy || 10)}m
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {filteredIncidents.map(i => {
          const markerIcon = i.priority >= 80 ? redIcon : orangeIcon;
          const distKm = userLocation ? haversineDistKm(userLocation.lat, userLocation.lng, i.lat || demoCenter[0], i.lng || demoCenter[1]) : null;
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
                    {distKm !== null && (
                      <div style={{ marginTop: "6px", fontSize: "11.5px", color: distKm <= 50 ? "#2563eb" : "#64748b", fontWeight: "600" }}>
                        📍 {distKm.toFixed(1)} km from your location {distKm <= 50 ? "(Within 50km)" : "(Beyond 50km)"}
                      </div>
                    )}
                  </div>
                  <button className="popup-btn" onClick={() => onSelect?.(i)}>
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {showTeams && teams.map(t => {
          const distKm = userLocation ? haversineDistKm(userLocation.lat, userLocation.lng, t.lat, t.lng) : null;
          return (
            <Marker key={t.id} position={[t.lat, t.lng]} icon={greenIcon}>
              <Popup>
                <div className="custom-map-popup">
                  <span className="popup-tag info">{t.type} TEAM</span>
                  <div className="popup-title">{t.name}</div>
                  <div className="popup-desc">
                    Readiness: <b>{t.readiness}%</b> • Personnel: <b>{t.personnel}</b><br />
                    Equipment: {t.equipment?.join(", ") || "Standard"}
                    {distKm !== null && (
                      <div style={{ marginTop: "6px", fontSize: "11.5px", color: distKm <= 50 ? "#059669" : "#64748b", fontWeight: "600" }}>
                        🚑 {distKm.toFixed(1)} km from your location {distKm <= 50 ? "(Within 50km)" : "(Beyond 50km)"}
                      </div>
                    )}
                  </div>
                  <a className="popup-btn" href={`tel:${t.phone}`}>
                    Call {t.phone}
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
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

function Header({
  role,
  setRole,
  active,
  setActive,
  gps,
  setGps,
  rescueUser,
  adminUser,
  onSignOut,
  onOpenTwilio,
  criticalCount,
  theme,
  setTheme,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  const [locating, setLocating] = useState(false);

  const handleCitizenLocation = () => {
    if (!navigator.geolocation) {
      alert("⚠️ Geolocation is not supported by your browser or device.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const deviceGps = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 10,
          radiusKm: 50,
          enabledFromDevice: true,
          timestamp: Date.now()
        };
        setGps(deviceGps);
        // Redirect directly to the Live Map view centered on citizen with 50km radius
        setActive?.("Live Map");
      },
      (err) => {
        setLocating(false);
        setGps(null);
        let errorMsg = "⚠️ Location Access Required: Please enable device location / GPS permissions in your device settings to locate yourself on the 50km disaster radar map.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "⚠️ Location Permission Denied: Please enable Location / GPS permissions for this site in your browser or device settings, then click the Location button again.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = "⚠️ Device Location Unavailable: Please check that GPS / Location Services are turned ON on your phone or computer.";
        } else if (err.code === err.TIMEOUT) {
          errorMsg = "⚠️ Location request timed out. Please check your GPS signal and try clicking Location again.";
        }
        alert(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const isRescueAuth = !!rescueUser;
  const isAdminAuth = !!adminUser;
  const activeUser = role === "rescue" ? rescueUser : role === "admin" ? adminUser : null;

  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Mobile Hamburger Navigation Button */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}
          aria-label="Toggle navigation drawer"
          title="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="brand-wrapper" onClick={() => { setRole("citizen"); setActive?.("Dashboard"); }} style={{ cursor: "pointer" }}>
          <div className="brand-icon">R</div>
          <div className="brand-info">
            <h1>ResQ<span>Sense</span></h1>
            <small>Disaster Intelligence & Response</small>
          </div>
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

        {/* Twilio Emergency Dispatch Button — STRICTLY visible ONLY in Admin Command Center */}
        {role === "admin" && onOpenTwilio && (
          <button
            className="admin-twilio-trigger-btn"
            onClick={onOpenTwilio}
            title="Open Emergency Dispatch Console — Broadcast to NGO/Rescue via WhatsApp, SMS, or Voice Call"
          >
            <span className="admin-msg-icon-badge">
              <MessageSquare size={16} />
              {criticalCount > 0 && <span className="pulse-ping"></span>}
            </span>
            <span className="admin-twilio-label">🚨 Emergency Alerts</span>
            {criticalCount > 0 && (
              <span className="admin-twilio-pill">{criticalCount} Alert{criticalCount !== 1 ? "s" : ""}</span>
            )}
          </button>
        )}

        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>

        {/* Location Button — STRICTLY for Citizens Section Only */}
        {role === "citizen" && (
          <button
            className={`location-btn ${gps ? "active" : ""}`}
            onClick={handleCitizenLocation}
            title={gps ? "📍 Live Location Active (50km Radius) — Click to refresh & center" : "📍 Enable device location to view your 50km disaster radar map"}
            disabled={locating}
          >
            <LocateFixed size={15} />
            <span>{locating ? "Locating..." : gps ? "📍 50km Live GPS" : "Location"}</span>
          </button>
        )}

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

function Sidebar({ role, active, setActive, onOpenTwilio, mobileMenuOpen, setMobileMenuOpen }) {
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
    { label: "🧭 Rapid Route (Dijkstra)", icon: <Navigation size={18} /> },
    { label: "Operations Map", icon: <MapIcon size={18} /> },
    { label: "Resources", icon: <Package size={18} /> },
    { label: "Manpower Roster", icon: <Users size={18} /> }
  ];

  const adminItems = [
    { label: "Dashboard", icon: <Activity size={18} /> },
    { label: "Incident Queue", icon: <ShieldAlert size={18} /> },
    { label: "🚨 Emergency Alerts", icon: <Radio size={18} /> },
    { label: "🧭 Rapid Route (Dijkstra)", icon: <Navigation size={18} /> },
    { label: "Control Map", icon: <MapIcon size={18} /> },
    { label: "Resource Allocation", icon: <Package size={18} /> },
    { label: "Rescue Teams", icon: <Truck size={18} /> },
    { label: "Emergency Analytics", icon: <Activity size={18} /> }
  ];

  const navItems = role === "citizen" ? citizenItems : role === "rescue" ? rescueItems : adminItems;

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}
      <aside className={`app-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div className="sidebar-section-title">Navigation</div>
            <button
              className="sidebar-mobile-close-btn"
              onClick={() => setMobileMenuOpen?.(false)}
              aria-label="Close Sidebar Drawer"
            >
              <X size={16} />
            </button>
          </div>
          {navItems.map(item => (
            <button
              key={item.label}
              className={`sidebar-nav-btn ${active === item.label ? "active" : ""}`}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActive(item.label);
                }
                setMobileMenuOpen?.(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
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
  </>
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
  const [step, setStep] = useState(0); // 0-4 = triage questions, 5 = media upload
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [uploadDragOver, setUploadDragOver] = useState(false);

  const TOTAL_STEPS = 5; // 5 triage questions, then step 5 = media

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
    } else {
      setStep(TOTAL_STEPS); // Go to media upload step
    }
  }

  function handleImageFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please upload a valid image file (JPG, PNG, WEBP)."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image size must be under 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setImageDataUrl(e.target.result); setImageFileName(file.name); };
    reader.readAsDataURL(file);
  }

  async function handleSubmitMedia() {
    setLoading(true);
    const lastAnswer = answers[4];
    const peopleCount = lastAnswer?.includes("20+") ? 25 : lastAnswer?.includes("6-20") ? 10 : lastAnswer?.includes("2-5") ? 3 : 1;
    const isMedical = answers[2]?.toLowerCase().includes("serious") || answers[2]?.toLowerCase().includes("life");
    const accessStatus = answers[3]?.includes("Completely") ? "blocked" : answers[3]?.includes("Partially") ? "partial" : "yes";

    const payload = {
      disaster: answers[0],
      trapped: answers[1]?.replace(" people", "").replace("No", "0"),
      medical: isMedical,
      access: accessStatus,
      people: peopleCount,
      description: description.trim() || null,
      imageDataUrl: imageDataUrl || null,
      imageFileName: imageFileName || null
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
        priority: 85, severity: "CRITICAL", confidence: 84,
        reasons: ["Urgent hazard assessment generated", "Responder alert prepared"],
        required: { personnel: 6, resources: ["Medical Kit", "Rescue Vehicle"] },
        payload
      });
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setStep(0); setAnswers({}); setResult(null);
    setDescription(""); setImageDataUrl(null); setImageFileName("");
  }

  if (!open) {
    return (
      <button className="chat-circle-logo-trigger" onClick={() => setOpen(true)} aria-label="Open Emergency AI Assistant" title="Emergency Assistant">
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
            <small>
              {step < TOTAL_STEPS
                ? `Step ${step + 1} of ${TOTAL_STEPS + 1} — Triage Questions`
                : result ? "Triage Complete — Review & Dispatch"
                : `Step ${TOTAL_STEPS + 1} of ${TOTAL_STEPS + 1} — Evidence Upload`}
            </small>
          </div>
        </div>
        <button className="chat-close-btn" onClick={() => setOpen(false)}><X size={15} /></button>
      </div>

      {/* STEPS 0-4: Triage Questions */}
      {step < TOTAL_STEPS && !result && (
        <>
          <div className="chat-content-body">
            <div className="chat-bubble-bot">{questions[step].title}</div>
            <div className="chat-options-grid">
              {questions[step].options.map(opt => (
                <button key={opt} className="chat-choice-btn" onClick={() => handleAnswer(opt)}>{opt}</button>
              ))}
            </div>
          </div>
          <div className="chat-progress-indicator">
            <span>Question {step + 1} of {TOTAL_STEPS + 1}</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {[0, 1, 2, 3, 4, 5].map(idx => (
                <div
                  key={idx}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: idx <= step ? "var(--primary)" : "var(--bg-subtle)"
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* STEP 5: Media Evidence Upload + Free Text */}
      {step === TOTAL_STEPS && !result && (
        <div className="chat-content-body">
          <div className="chat-bubble-bot" style={{ marginBottom: "14px" }}>
            📸 Share a photo or describe your situation — this helps rescuers act faster and more accurately.
          </div>

          {/* Drag & Drop / Click Image Upload */}
          <div
            className={`sos-upload-zone${uploadDragOver ? " drag-over" : ""}${imageDataUrl ? " has-image" : ""}`}
            onDragOver={e => { e.preventDefault(); setUploadDragOver(true); }}
            onDragLeave={() => setUploadDragOver(false)}
            onDrop={e => { e.preventDefault(); setUploadDragOver(false); handleImageFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById("sos-file-input").click()}
            style={{ cursor: "pointer" }}
          >
            <input id="sos-file-input" type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => handleImageFile(e.target.files[0])} />
            {imageDataUrl ? (
              <div style={{ position: "relative" }}>
                <img src={imageDataUrl} alt="Evidence"
                  style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "8px" }} />
                <button
                  style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(0,0,0,0.65)",
                    border: "none", borderRadius: "50%", width: "24px", height: "24px",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={e => { e.stopPropagation(); setImageDataUrl(null); setImageFileName(""); }}
                >
                  <X size={12} color="#fff" />
                </button>
                <div style={{ fontSize: "11px", color: "#059669", marginTop: "6px", fontWeight: "600" }}>✓ {imageFileName}</div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "22px 12px" }}>
                <Camera size={30} color="#94a3b8" style={{ marginBottom: "8px" }} />
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Upload Photo Evidence</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Click or drag & drop · JPG, PNG, WEBP up to 5MB</div>
              </div>
            )}
          </div>

          {/* Free Text Description */}
          <div style={{ marginTop: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <Type size={14} /> Describe Your Situation (Optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Water level rising fast, 3 elderly people on second floor, main road flooded, need boat..."
              maxLength={500} rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1",
                fontSize: "13px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "right" }}>{description.length}/500</div>
          </div>

          <div className="chat-progress-indicator">
            <span>Step {TOTAL_STEPS + 1} of {TOTAL_STEPS + 1} — Evidence</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {[0, 1, 2, 3, 4, 5].map(idx => (
                <div key={idx} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
              ))}
            </div>
          </div>

          <div style={{ padding: "0 14px 14px", display: "flex", gap: "8px" }}>
            <button className="btn-chat-primary" onClick={handleSubmitMedia} disabled={loading} style={{ flex: 1 }}>
              {loading ? "Analyzing..." : "🚀 Run Triage & Proceed"}
            </button>
            <button className="btn-chat-secondary" onClick={handleSubmitMedia} disabled={loading}
              style={{ fontSize: "12px", padding: "10px 14px" }}>
              Skip →
            </button>
          </div>
        </div>
      )}

      {/* RESULT: Score + Dispatch */}
      {result && (
        <div className="chat-content-body">
          <div className="chat-result-view">
            <div className="chat-score-circle">{result.priority}<span>/100</span></div>
            <div className="chat-severity-pill">{result.severity} PRIORITY</div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
              Assessment Confidence: <b>{result.confidence}%</b>
            </p>
            {result.reasons && (
              <div className="chat-reasons-box">
                <b>Triage Factors:</b>
                <ul>{result.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}

            {/* Evidence preview in result */}
            {(result.payload?.description || result.payload?.imageDataUrl) && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px", fontSize: "12px" }}>
                <div style={{ fontWeight: "700", color: "#065f46", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Upload size={13} /> Evidence Attached — Transmitted to Rescue Team
                </div>
                {result.payload.imageDataUrl && (
                  <img src={result.payload.imageDataUrl} alt="Evidence"
                    style={{ width: "100%", maxHeight: "80px", objectFit: "cover", borderRadius: "6px", marginBottom: "6px" }} />
                )}
                {result.payload.description && (
                  <div style={{ color: "#047857", fontStyle: "italic" }}>"{result.payload.description}"</div>
                )}
              </div>
            )}

            <button className="btn-chat-primary" onClick={() => { onSOS(result); resetChat(); }}>
              🚨 Dispatch SOS Now
            </button>
            <button className="btn-chat-secondary" onClick={resetChat}>Restart Assessment</button>
          </div>
        </div>
      )}
    </div>
  );
}



function CitizenDashboard({ active, setActive, incidents, teams, gps, setGps, setIncidents, onOpenChat, onSelectIncident }) {
  const [weather, setWeather] = useState(null);
  const [mapFilter, setMapFilter] = useState("ALL");

  const incidentsWithin50km = React.useMemo(() => {
    if (!gps) return incidents;
    return incidents.filter(i => {
      const d = haversineDistKm(gps.lat, gps.lng, i.lat || demoCenter[0], i.lng || demoCenter[1]);
      return d <= 50;
    });
  }, [gps, incidents]);

  const teamsWithin50km = React.useMemo(() => {
    if (!gps) return teams;
    return teams.filter(t => {
      const d = haversineDistKm(gps.lat, gps.lng, t.lat, t.lng);
      return d <= 50;
    });
  }, [gps, teams]);

  useEffect(() => {
    const lat = gps?.lat || demoCenter[0];
    const lng = gps?.lng || demoCenter[1];
    const controller = new AbortController();

    fetch(`${API}/weather?lat=${lat}&lng=${lng}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
        return response.json();
      })
      .then(setWeather)
      .catch(error => {
        if (error.name !== "AbortError") {
          console.error("Unable to load weather:", error);
          setWeather(null);
        }
      });

    return () => controller.abort();
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

        {/* 50km Device Location Radar Banner */}
        {gps && (
          <div style={{
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1.5px solid #3b82f6",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            boxShadow: "0 2px 10px rgba(59, 130, 246, 0.12)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>📍</span>
              <div>
                <b style={{ color: "#1e40af", fontSize: "14px", display: "block" }}>
                  Your Device Location Active • 50 km Safety Radar
                </b>
                <span style={{ fontSize: "12px", color: "#2563eb" }}>
                  Centered at [{gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}] • You are clearly located at the map center with a 50km radius perimeter
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "#2563eb", color: "#fff", padding: "5px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "600" }}>
                {incidentsWithin50km.length} Incidents in 50km
              </span>
              <span style={{ background: "#059669", color: "#fff", padding: "5px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "600" }}>
                {teamsWithin50km.length} Rescue Teams in 50km
              </span>
            </div>
          </div>
        )}

        <div className="panel-card">
          <LiveMap
            incidents={incidents}
            teams={teams}
            center={gps ? [gps.lat, gps.lng] : demoCenter}
            onSelect={onSelectIncident}
            filter={mapFilter}
            userLocation={gps}
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
            <span className="page-eyebrow" style={{ color: "var(--danger)" }}>Critical Life Safety</span>
            <h2>Emergency SOS & Immediate Triage</h2>
            <p>Direct priority line to disaster response squads, ambulance dispatch, and NDRF force.</p>
          </div>
        </div>

        <div className="panel-card" style={{ background: "var(--danger-light)", border: "1px solid var(--danger-border)", textAlign: "center", padding: "36px 20px", marginBottom: "20px" }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: "12px" }} />
          <h3 style={{ color: "var(--danger)", fontSize: "22px", margin: "0 0 8px 0" }}>Are You or Someone Nearby in Immediate Danger?</h3>
          <p style={{ color: "var(--danger)", maxWidth: "560px", margin: "0 auto 20px auto", fontSize: "14px" }}>
            Upload a photo or describe your situation — we'll instantly transmit it to rescue teams and provide the nearest team contact number.
          </p>
          <button className="btn-sos" style={{ padding: "14px 32px", fontSize: "16px", borderRadius: "10px" }} onClick={onOpenChat}>
            <ShieldAlert size={20} /> 🚨 Launch Rapid SOS
          </button>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>24/7 Immediate Emergency Helplines</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <a href="tel:112" className="panel-card" style={{ textDecoration: "none", background: "var(--bg-subtle)", padding: "16px", border: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>National Unified Emergency</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)" }}>112</div>
              <small style={{ color: "var(--primary-dark)", fontWeight: "600" }}>Toll-Free • 24/7</small>
            </a>
            <a href="tel:1070" className="panel-card" style={{ textDecoration: "none", background: "var(--bg-subtle)", padding: "16px", border: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>State Disaster Management</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)" }}>1070</div>
              <small style={{ color: "var(--primary-dark)", fontWeight: "600" }}>Disaster Control Room</small>
            </a>
            <a href="tel:108" className="panel-card" style={{ textDecoration: "none", background: "var(--bg-subtle)", padding: "16px", border: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Emergency Ambulance</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)" }}>108</div>
              <small style={{ color: "var(--primary-dark)", fontWeight: "600" }}>Medical Evacuation</small>
            </a>
            <a href="tel:101" className="panel-card" style={{ textDecoration: "none", background: "var(--bg-subtle)", padding: "16px", border: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fire & Rescue Services</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)" }}>101</div>
              <small style={{ color: "var(--primary-dark)", fontWeight: "600" }}>Fire Rescue</small>
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
              🚨 Submit Emergency SOS
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
                      <span style={{ color: inc.assignedTeam ? "var(--success)" : "var(--text-muted)", fontWeight: "600" }}>
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
            <div style={{ marginTop: "16px", padding: "12px", background: "var(--bg-subtle)", borderRadius: "8px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>River Drainage Ingress</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Hooghly water surge level measured at +1.8m above mean seasonal threshold.</div>
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
            <p>Essential survival guidelines, household safety protocols, and emergency supply recommendations.</p>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>🎒 72-Hour Emergency Grab-Bag Essentials</h3>
          </div>
          <div className="preparedness-items">
            {[
              "Clean Drinking Water (3L per person/day)",
              "Trauma Bandages & Antiseptics",
              "High-Beam Waterproof Flashlight & Batteries",
              "Portable Battery/Solar Emergency Radio",
              "Essential Prescription Medicines (7-day supply)",
              "Waterproof Pouch with IDs & Emergency Cash"
            ].map(item => (
              <div className="preparedness-item" key={item}>{item}</div>
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
            <ShieldAlert size={17} /> 🚨 Rapid SOS
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Active Regional Alerts" value="03" icon={<Bell size={22} />} variant="rose" trend="High Alert Active" />
        <StatCard label="Verified Rescue Teams" value={teams.length ? `0${teams.length}` : "04"} icon={<Truck size={22} />} variant="green" trend="In Sector Standby" />
        <StatCard label="Response Personnel" value="36" icon={<Users size={22} />} variant="emerald" trend="Deployed & Ready" />
        <StatCard label="Weather Readiness" value={weather ? `${weather.current.temperature}°C` : "—"} icon={<CloudRain size={22} />} variant="amber" trend={weather?.mode === "LIVE" ? "Live weather" : "Weather data"} />
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
            userLocation={gps}
          />
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3>Local Meteorological Intel</h3>
              <p>Local forecast • Check official sources for warnings</p>
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
              <div className="weather-source">
                <span className={`weather-source-badge ${weather.mode === "LIVE" ? "live" : "demo"}`}>
                  {weather.mode === "LIVE" ? "LIVE" : "DEMO FALLBACK"}
                </span>
                {weather.mode === "LIVE" ? (
                  <a href={weather.sourceUrl} target="_blank" rel="noreferrer">Weather data: Open-Meteo</a>
                ) : (
                  <span>Sample conditions — not live weather</span>
                )}
                <span>Updated {new Date(weather.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          )}
          {weather?.daily?.length > 0 && (
            <div className="weather-forecast">
              <h4>3-day forecast</h4>
              {weather.daily.map(day => (
                <div className="forecast-row" key={day.date}>
                  <span>{new Date(`${day.date}T12:00:00`).toLocaleDateString([], { weekday: "short" })}</span>
                  <span>{day.condition}</span>
                  <span>{Math.round(day.high)}° / {Math.round(day.low)}°</span>
                  <small>{day.rainfall} mm rain</small>
                </div>
              ))}
            </div>
          )}

          <div className="alerts-list-group">
            <div className="alert-item-card critical">
              <div className="alert-item-title">
                <span>Demo incident scenario</span>
                <span className="priority-tag medium">Demo</span>
              </div>
              <p className="alert-item-body">
                Sample flood incident shown for demonstration; this is not a live alert.
              </p>
            </div>

            <div className="alert-item-card warning">
              <div className="alert-item-title">
                <span>Weather safety note</span>
                <span className="priority-tag medium">Forecast only</span>
              </div>
              <p className="alert-item-body">
                Open-Meteo forecasts are not official emergency warnings. Follow advisories from the India Meteorological Department.
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

function RescueDashboard({ active, setActive, incidents, teams, onSelectIncident, onAssignTeam, onRefreshData, selectedIncident }) {
  if (active === "Assignments") {
    return (
      <IncidentQueueDashboard
        incidents={incidents}
        teams={teams}
        onSelectIncident={onSelectIncident}
        onAssignTeam={onAssignTeam}
        onRefresh={onRefreshData}
        hideAssignedSquad={true}
        onOpenDijkstraRoute={(inc) => {
          onSelectIncident?.(inc);
          setActive?.("🧭 Rapid Route (Dijkstra)");
        }}
      />
    );
  }
  if (active === "🧭 Rapid Route (Dijkstra)" || active === "Rapid Route" || active === "Dijkstra Route") {
    return (
      <DijkstraNavigationDashboard
        incidents={incidents}
        teams={teams}
        DijkstraMapComponent={DijkstraRouteMap}
        initialIncidentId={selectedIncident?.id}
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
        role="rescue"
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
      hideAssignedSquad={true}
      onOpenDijkstra={() => setActive?.("🧭 Rapid Route (Dijkstra)")}
    />
  );
}

function AdminDashboard({ active, setActive, incidents, teams, onSelectIncident, onAssignTeam, onRefreshData, onOpenTwilio, selectedIncident }) {
  const pendingCount = teams.filter(t => t.verified === false || t.status === "PENDING_VERIFICATION").length;

  if (active === "Incident Queue") {
    return (
      <IncidentQueueDashboard
        incidents={incidents}
        teams={teams}
        onSelectIncident={onSelectIncident}
        onAssignTeam={onAssignTeam}
        onRefresh={onRefreshData}
        onOpenDijkstraRoute={(inc) => {
          onSelectIncident?.(inc);
          setActive?.("🧭 Rapid Route (Dijkstra)");
        }}
      />
    );
  }
  if (active === "🚨 Emergency Alerts" || active === "Emergency Alerts" || active === "Twilio Dispatch" || active === "🚨 Twilio Dispatch") {
    return (
      <EmergencyAlertsDashboard
        incidents={incidents}
        teams={teams}
        onOpenTwilio={onOpenTwilio}
      />
    );
  }
  if (active === "🧭 Rapid Route (Dijkstra)" || active === "Rapid Route" || active === "Dijkstra Route") {
    return (
      <DijkstraNavigationDashboard
        incidents={incidents}
        teams={teams}
        DijkstraMapComponent={DijkstraRouteMap}
        initialIncidentId={selectedIncident?.id}
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
        role="admin"
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
    <>
      {pendingCount > 0 && (
        <div style={{ padding: "0 clamp(16px, 3vw, 36px)", paddingTop: "18px", maxWidth: "1640px", margin: "0 auto", width: "100%" }}>
          <div
            style={{
              background: "#fffbeb",
              border: "1.5px solid #f59e0b",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              boxShadow: "0 2px 10px rgba(245,158,11,0.12)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>🚨</span>
              <div style={{ minWidth: 0, overflowWrap: "break-word" }}>
                <b style={{ color: "#92400e", fontSize: "14px", display: "block" }}>
                  {pendingCount} Rescue Squad{pendingCount !== 1 ? "s" : ""} Awaiting Admin Verification!
                </b>
                <p style={{ margin: 0, fontSize: "12px", color: "#b45309" }}>
                  Newly registered field units cannot be dispatched until verified by State Command Admin.
                </p>
              </div>
            </div>
            <button
              className="btn-chat-primary"
              style={{ padding: "8px 16px", fontSize: "12.5px", background: "#d97706", whiteSpace: "nowrap" }}
              onClick={() => setActive?.("Rescue Teams")}
            >
              Review & Verify Squads →
            </button>
          </div>
        </div>
      )}
      <DashboardOverview
        incidents={incidents}
        teams={teams}
        onSelectIncident={onSelectIncident}
        onAssignTeam={onAssignTeam}
        onRefresh={onRefreshData}
        LiveMapComponent={LiveMap}
        demoCenter={demoCenter}
        onOpenTwilio={onOpenTwilio}
        onOpenDijkstra={() => setActive?.("🧭 Rapid Route (Dijkstra)")}
      />
    </>
  );
}

// ============================================================================
// TWILIO SANDBOX EMERGENCY BROADCAST MODAL
// ============================================================================
function TwilioBroadcastModal({ open, onClose, incidents, teams }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [toPhone, setToPhone] = useState("+918210868501");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Find the selected incident object
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || null;

  // Calculate nearest verified NGO/Rescue team from the selected incident
  const nearestTeam = React.useMemo(() => {
    const verifiedSquads = (teams || []).filter(t => t.verified !== false && t.status !== "PENDING_VERIFICATION");
    if (!selectedIncident || !verifiedSquads.length) return null;
    const iLat = selectedIncident.lat || 22.5726;
    const iLng = selectedIncident.lng || 88.3639;
    const getDistKm = (t) => {
      if (!t.lat || !t.lng) return 999;
      const dLat = (t.lat - iLat) * 111;
      const dLng = (t.lng - iLng) * 111 * Math.cos(iLat * Math.PI / 180);
      return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
    };
    return [...verifiedSquads]
      .map(t => ({ ...t, dist: getDistKm(t) }))
      .sort((a, b) => a.dist - b.dist)[0] || null;
  }, [selectedIncident, teams]);

  // Auto-fill phone from nearest team
  React.useEffect(() => {
    if (nearestTeam?.phone && !toPhone) {
      setToPhone(nearestTeam.phone);
    }
  }, [nearestTeam]);

  // Generate default message preview
  const defaultMessage = selectedIncident
    ? `🚨 [RESQSENSE URGENT DISPATCH]\n` +
      `Attention: ${nearestTeam?.name || "Rescue Unit"}\n` +
      `Risk Area: ${selectedIncident.type || "Emergency"} (ID: ${selectedIncident.id})\n` +
      `Priority: ${selectedIncident.priority || 90}/100 [CRITICAL]\n` +
      `Epicenter Coords: ${selectedIncident.lat || "22.5726"}, ${selectedIncident.lng || "88.3639"}\n` +
      `Casualties Reported: ${selectedIncident.people || 1} people\n` +
      `ACTION: Depart to risk coordinates ASAP. Acknowledge deployment.\n` +
      `Dispatched by ResQSense Command Center`
    : "";

  React.useEffect(() => {
    if (selectedIncident && !customMessage) {
      setCustomMessage(defaultMessage);
    }
  }, [selectedIncidentId]);

  const handleClose = () => {
    setReceipt(null);
    setSelectedIncidentId("");
    setChannel("whatsapp");
    setToPhone("");
    setCustomMessage("");
    onClose();
  };

  const handleDispatch = async () => {
    if (!toPhone) { alert("Please enter a destination phone number."); return; }
    if (!customMessage.trim()) { alert("Please enter a dispatch message."); return; }
    setSending(true);
    try {
      // Normalize phone number (if 10 digits without country code, default to +91)
      let cleanPhone = toPhone.trim().replace(/[\s\-()]/g, "");
      if (!cleanPhone.startsWith("+") && !cleanPhone.startsWith("whatsapp:")) {
        if (cleanPhone.length === 10) cleanPhone = `+91${cleanPhone}`;
        else cleanPhone = `+${cleanPhone}`;
      }

      const API = import.meta.env.VITE_API_URL || "/api";
      const res = await fetch(`${API}/twilio/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: selectedIncident?.id || null,
          incidentType: selectedIncident?.type || "Emergency",
          lat: selectedIncident?.lat || null,
          lng: selectedIncident?.lng || null,
          priority: selectedIncident?.priority || 90,
          people: selectedIncident?.people || 1,
          teamId: nearestTeam?.id || null,
          teamName: nearestTeam?.name || "Rescue Unit",
          toPhone: cleanPhone,
          channel,
          customMessage: customMessage.trim()
        })
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}). Ensure backend is running.`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Dispatch failed");
      setReceipt(data);

      // If user selected WhatsApp, also open WhatsApp Web/App directly with the message
      if (channel === "whatsapp") {
        const phoneDigits = cleanPhone.replace(/[^0-9]/g, "");
        const waUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(customMessage.trim())}`;
        try {
          window.open(waUrl, "_blank");
        } catch {}
      }
    } catch (err) {
      alert("Dispatch Notice: " + err.message);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const criticalIncidents = incidents.filter(i => i.priority >= 80);
  const highIncidents = incidents.filter(i => i.priority >= 60 && i.priority < 80);

  return (
    <div className="twilio-modal-backdrop" onClick={handleClose}>
      <div className="twilio-modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="twilio-modal-header">
          <div className="twilio-modal-title-group">
            <div className="twilio-header-icon-circle">
              <BellRing size={22} />
            </div>
            <div>
              <h3>Emergency Dispatch Console</h3>
              <p>Notify nearest NGO / Rescue Squad via Twilio Sandbox & WhatsApp</p>
            </div>
          </div>
          <button className="twilio-close-btn" onClick={handleClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="twilio-modal-body">

          {/* Post-dispatch receipt */}
          {receipt ? (
            <div className="twilio-receipt-card">
              <div className="twilio-receipt-header">
                <div className="twilio-receipt-status">
                  <CheckCircle size={18} />
                  {receipt.simulated ? "Sandbox Dispatch Processed" : "Live Dispatch Sent"}
                </div>
                <span style={{ fontSize: "11px", color: "#64748b" }}>{new Date(receipt.timestamp).toLocaleString()}</span>
              </div>

              <div className="twilio-receipt-grid">
                <div className="twilio-receipt-item">
                  <span>Message SID</span>
                  <strong>{receipt.sid}</strong>
                </div>
                <div className="twilio-receipt-item">
                  <span>Status</span>
                  <strong>{receipt.status}</strong>
                </div>
                <div className="twilio-receipt-item">
                  <span>Channel</span>
                  <strong>{receipt.channel?.toUpperCase()}</strong>
                </div>
                <div className="twilio-receipt-item">
                  <span>Delivered To</span>
                  <strong>{receipt.to}</strong>
                </div>
                <div className="twilio-receipt-item">
                  <span>Incident</span>
                  <strong>{receipt.incidentId || "N/A"}</strong>
                </div>
                <div className="twilio-receipt-item">
                  <span>Target Team</span>
                  <strong>{receipt.teamName || "—"}</strong>
                </div>
              </div>

              {receipt.warning && (
                <div style={{ marginTop: "10px", padding: "10px 14px", borderRadius: "8px", background: "#fef3c7", border: "1px solid #f59e0b", color: "#92400e", fontSize: "12px", lineHeight: "1.5" }}>
                  ⚠️ {receipt.warning}
                </div>
              )}

              {receipt.instructions && !receipt.warning && (
                <div className="twilio-receipt-instructions">
                  ℹ️ {receipt.instructions}
                </div>
              )}

              {/* Direct WhatsApp Action Button */}
              {receipt.channel === "whatsapp" && (
                <a
                  href={`https://wa.me/${(receipt.to || "8210868501").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(customMessage || receipt.message || "🚨 Emergency Dispatch")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="twilio-dispatch-btn"
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "#25D366",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "14px",
                    padding: "12px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 14px rgba(37, 211, 102, 0.4)"
                  }}
                >
                  <MessageSquare size={18} />
                  Open in WhatsApp App / Web (Send to {receipt.to})
                </a>
              )}

              <button
                className="twilio-dispatch-btn"
                onClick={handleClose}
                style={{ marginTop: "10px", background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)" }}
              >
                Close Console
              </button>
            </div>
          ) : (
            <>
              {/* 1. Incident Selector */}
              <div className="twilio-form-section">
                <div className="twilio-section-label">
                  <ShieldAlert size={13} /> Select Active Incident
                </div>
                <div className="twilio-incident-select-box">
                  <select
                    className="twilio-incident-dropdown"
                    value={selectedIncidentId}
                    onChange={e => { setSelectedIncidentId(e.target.value); setCustomMessage(""); setToPhone(""); }}
                  >
                    <option value="">— Choose an incident to dispatch —</option>
                    {criticalIncidents.length > 0 && (
                      <optgroup label="🔴 CRITICAL PRIORITY">
                        {criticalIncidents.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.id} — {i.type} (Priority {i.priority}) · {i.people || 1} people
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {highIncidents.length > 0 && (
                      <optgroup label="🟠 HIGH PRIORITY">
                        {highIncidents.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.id} — {i.type} (Priority {i.priority}) · {i.people || 1} people
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="All Incidents">
                      {incidents.filter(i => i.priority < 60).map(i => (
                        <option key={i.id} value={i.id}>
                          {i.id} — {i.type} (Priority {i.priority || "?"}) · {i.people || 1} people
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {selectedIncident && (
                    <div className="twilio-risk-meta-grid">
                      <div className="twilio-risk-meta-item">
                        <span>Hazard Type</span>
                        <strong>{selectedIncident.type}</strong>
                      </div>
                      <div className="twilio-risk-meta-item">
                        <span>Priority</span>
                        <strong style={{ color: selectedIncident.priority >= 80 ? "#dc2626" : selectedIncident.priority >= 60 ? "#d97706" : "#059669" }}>
                          {selectedIncident.priority}/100
                        </strong>
                      </div>
                      <div className="twilio-risk-meta-item">
                        <span>Coordinates</span>
                        <strong>{selectedIncident.lat?.toFixed(4)}, {selectedIncident.lng?.toFixed(4)}</strong>
                      </div>
                      <div className="twilio-risk-meta-item">
                        <span>People Affected</span>
                        <strong>{selectedIncident.people || 1}</strong>
                      </div>
                      <div className="twilio-risk-meta-item">
                        <span>Status</span>
                        <strong>{selectedIncident.status}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Nearest NGO / Rescue */}
              {nearestTeam && (
                <div className="twilio-form-section">
                  <div className="twilio-section-label">
                    <Navigation size={13} /> Nearest Responder (Auto-Detected)
                  </div>
                  <div className="twilio-ngo-banner">
                    <div className="twilio-ngo-banner-header">
                      <span className="twilio-nearest-badge">
                        <Navigation size={11} /> Nearest Squad
                      </span>
                      <span className="twilio-dist-pill">📍 ~{nearestTeam.dist} km</span>
                    </div>
                    <h4 className="twilio-ngo-name">{nearestTeam.name}</h4>
                    <div className="twilio-ngo-meta">
                      <span>🏢 {nearestTeam.type}</span>
                      <span>📞 {nearestTeam.phone}</span>
                      <span>💪 {nearestTeam.personnel || "?"} personnel</span>
                      <span>Readiness: {nearestTeam.readiness || 90}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Channel Selector */}
              <div className="twilio-form-section">
                <div className="twilio-section-label">
                  <Send size={13} /> Choose Notification Channel
                </div>
                <div className="twilio-channel-grid">
                  <button
                    className={`twilio-channel-btn whatsapp ${channel === "whatsapp" ? "active" : ""}`}
                    onClick={() => setChannel("whatsapp")}
                  >
                    <div className="twilio-channel-icon-wrap">
                      <MessageSquare size={20} />
                    </div>
                    <div className="twilio-channel-btn-title">WhatsApp</div>
                    <div className="twilio-channel-btn-sub">Twilio Sandbox</div>
                  </button>
                  <button
                    className={`twilio-channel-btn sms ${channel === "sms" ? "active" : ""}`}
                    onClick={() => setChannel("sms")}
                  >
                    <div className="twilio-channel-icon-wrap">
                      <MessageCircle size={20} />
                    </div>
                    <div className="twilio-channel-btn-title">SMS</div>
                    <div className="twilio-channel-btn-sub">Text Message</div>
                  </button>
                  <button
                    className={`twilio-channel-btn call ${channel === "call" ? "active" : ""}`}
                    onClick={() => setChannel("call")}
                  >
                    <div className="twilio-channel-icon-wrap">
                      <Phone size={20} />
                    </div>
                    <div className="twilio-channel-btn-title">Voice Call</div>
                    <div className="twilio-channel-btn-sub">Auto-Dialer</div>
                  </button>
                </div>

                {channel === "whatsapp" && (
                  <div className="twilio-sandbox-note">
                    💬 <strong>Twilio WhatsApp Sandbox:</strong> Recipient must first send <code>join &lt;your-sandbox-keyword&gt;</code> to <code>+1 415 523 8886</code> on WhatsApp. Use <code>whatsapp:+91XXXXXXXXXX</code> format.
                  </div>
                )}
              </div>

              {/* 4. Phone Number */}
              <div className="twilio-form-section">
                <div className="twilio-section-label">
                  <Phone size={13} /> Destination Phone Number
                </div>
                <div className="twilio-phone-input-row">
                  <input
                    className="twilio-phone-input"
                    type="text"
                    placeholder={channel === "whatsapp" ? "whatsapp:+918210868501" : "+918210868501"}
                    value={toPhone}
                    onChange={e => setToPhone(e.target.value)}
                  />
                  <button
                    className="twilio-test-btn"
                    style={{ background: "#059669", color: "#fff", border: "none" }}
                    onClick={() => setToPhone("+918210868501")}
                  >
                    ⚡ Verified Phone
                  </button>
                  {nearestTeam?.phone && toPhone !== nearestTeam.phone && (
                    <button
                      className="twilio-test-btn"
                      onClick={() => setToPhone(nearestTeam.phone)}
                    >
                      Use NGO Number
                    </button>
                  )}
                </div>
              </div>

              {/* 5. Message */}
              <div className="twilio-form-section">
                <div className="twilio-section-label">
                  <FileText size={13} /> Dispatch Message Preview
                </div>
                <textarea
                  className="twilio-message-box"
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Emergency dispatch message will auto-generate when you select an incident..."
                  rows={5}
                />
              </div>

              {/* 6. Send Button */}
              <button
                className="twilio-dispatch-btn"
                onClick={handleDispatch}
                disabled={sending || !toPhone}
              >
                <Send size={18} />
                {sending ? "Dispatching Emergency Alert..." : `🚨 Send Emergency Broadcast via ${channel.toUpperCase()}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
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
          style={{ background: "var(--bg-subtle)", padding: "6px", borderRadius: "50%" }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="drawer-priority-badge">
        {incident.priority} <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ 100</span>
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

      {/* Citizen Evidence: Photo + Description */}
      {(incident.imageDataUrl || incident.description) && (
        <div style={{ marginBottom: "14px", border: "1px solid #fde68a", borderRadius: "10px", overflow: "hidden", background: "#fffbeb" }}>
          <div style={{ padding: "8px 12px", background: "#fef3c7", fontSize: "12px", fontWeight: "700", color: "#92400e", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #fde68a" }}>
            <Camera size={13} /> Citizen-Submitted Evidence
          </div>
          {incident.imageDataUrl && (
            <div style={{ padding: "10px" }}>
              <img
                src={incident.imageDataUrl}
                alt="Scene evidence"
                style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px", cursor: "pointer" }}
                onClick={() => window.open(incident.imageDataUrl, "_blank")}
                title="Click to view full size"
              />
              {incident.imageFileName && (
                <div style={{ fontSize: "11px", color: "#78716c", marginTop: "4px" }}>📎 {incident.imageFileName}</div>
              )}
            </div>
          )}
          {incident.description && (
            <div style={{ padding: "10px 12px", fontSize: "13px", color: "#44403c", lineHeight: "1.5", borderTop: incident.imageDataUrl ? "1px solid #fde68a" : "none" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#92400e", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Type size={11} /> Citizen's Account
              </div>
              <div style={{ fontStyle: "italic" }}>"{incident.description}"</div>
            </div>
          )}
        </div>
      )}

      {incident.assignedTeam && (
        <div style={{ background: "var(--success-light)", border: "1px solid var(--success-border)", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "12px", color: "var(--success)" }}>
          ✓ Assigned to Team <b>{incident.assignedTeam}</b>
        </div>
      )}

      {onAssignTeam && teams?.length > 0 && !incident.assignedTeam && (
        <div style={{ marginBottom: "10px" }}>
          <button
            className="btn-chat-primary"
            style={{ width: "100%", background: "var(--success)" }}
            onClick={() => onAssignTeam(incident.id, teams[0].id)}
          >
            Deploy Nearest Unit ({teams[0].name})
          </button>
        </div>
      )}

      {onOpenDijkstraRoute && (
        <div>
          <button
            className="btn-chat-primary"
            style={{ width: "100%", background: "#059669", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", fontSize: "13px" }}
            onClick={() => {
              onOpenDijkstraRoute(incident);
              onClose?.();
            }}
          >
            <Compass size={16} /> 🧭 Live Route to Incident (Dijkstra)
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
            try {
              await fetch(`${API}/auth/promote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role: "rescue" })
              });
              userProfile.role = "rescue";
            } catch {}
          }
          onLoginSuccess(userProfile);
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

            <button
              type="button"
              className="btn-chat-primary"
              style={{
                width: "100%",
                padding: "11px",
                marginBottom: "12px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                fontWeight: "700",
                fontSize: "13.5px",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onClick={() => {
                onLoginSuccess({
                  id: "RESCUE-DEMO",
                  name: "Captain Dev Sharma",
                  email: "responder@relief.org",
                  role: "rescue",
                  agency: "Rapid Relief Foundation",
                  badgeId: "SQ-101"
                });
              }}
            >
              ⚡ 1-Click Instant Rescue Team Access (Demo)
            </button>

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
            try {
              await fetch(`${API}/auth/promote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role: "admin" })
              });
              userProfile.role = "admin";
            } catch {}
          }
          onLoginSuccess(userProfile);
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

            <button
              type="button"
              className="btn-chat-primary"
              style={{
                width: "100%",
                padding: "11px",
                marginBottom: "12px",
                background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                fontWeight: "700",
                fontSize: "13.5px",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onClick={() => {
                onLoginSuccess({
                  id: "ADM-DEMO",
                  name: "Director Vikram Sen",
                  email: "admin@disastercontrol.gov",
                  role: "admin",
                  agency: "State Disaster Management Authority",
                  badgeId: "ADM-HQ-01"
                });
              }}
            >
              ⚡ 1-Click Instant State Command Access (Demo)
            </button>

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


// ============================================================================
// DIRECT SOS MODAL — Opens immediately with photo/text, no chatbot flow
// ============================================================================
function SOSDirectModal({ open, onClose, gps, teams, onSubmit }) {
  const [description, setDescription] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null); // holds { incidentId, nearestTeam }

  function handleImageFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please upload a valid image file (JPG, PNG, WEBP)."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = e => { setImageDataUrl(e.target.result); setImageFileName(file.name); };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!description.trim() && !imageDataUrl) {
      alert("Please upload a photo or describe your situation before submitting.");
      return;
    }
    setLoading(true);
    try {
      const result = await onSubmit({
        description: description.trim() || null,
        imageDataUrl: imageDataUrl || null,
        imageFileName: imageFileName || null,
        lat: gps?.lat || null,
        lng: gps?.lng || null,
      });
      // Find nearest NGO team and calculate distance
      const userLat = gps?.lat || demoCenter[0];
      const userLng = gps?.lng || demoCenter[1];
      const getDistKm = (t) => {
        if (!t.lat || !t.lng) return 999;
        const dLat = (t.lat - userLat) * 111;
        const dLng = (t.lng - userLng) * 111 * Math.cos(userLat * Math.PI / 180);
        return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
      };

      const sortedNGOs = (teams || [])
        .filter(t => t.type === "NGO")
        .map(t => ({ ...t, dist: getDistKm(t) }))
        .sort((a, b) => a.dist - b.dist);

      const nearestNGO = sortedNGOs[0] || (teams && teams[0] ? { ...teams[0], dist: getDistKm(teams[0]) } : null);
      const secondaryNGO = sortedNGOs[1] || null;

      setSubmitted({
        incidentId: result?.id || "SOS-" + Date.now(),
        nearestTeam: nearestNGO,
        secondaryTeam: secondaryNGO
      });
    } catch (err) {
      alert("Failed to submit SOS. Please call 112 immediately.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setDescription(""); setImageDataUrl(null); setImageFileName("");
    setDragOver(false); setLoading(false); setSubmitted(null);
    onClose();
  }

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }} onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div style={{
        background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.3)", overflow: "hidden", maxHeight: "92vh", overflowY: "auto"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
          padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "10px" }}>
              <ShieldAlert size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "17px", fontWeight: "800", color: "#fff" }}>Emergency SOS</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>Transmit directly to rescue dispatchers</div>
            </div>
          </div>
          <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} color="#fff" />
          </button>
        </div>

        {/* RESULT VIEW — after successful submit */}
        {submitted ? (
          <div style={{ padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>✅</div>
            <h3 style={{ color: "#065f46", fontSize: "18px", margin: "0 0 6px" }}>SOS Dispatched Successfully!</h3>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "18px", fontSize: "13px", color: "#047857" }}>
              Incident Reference: <b>{submitted.incidentId}</b><br />
              Your emergency evidence has been transmitted to dispatchers.
            </div>

            {/* Nearest NGO */}
            {submitted.nearestTeam && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "16px", marginBottom: "14px", textAlign: "left" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#92400e", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Phone size={12} /> NEAREST NGO RESCUE TEAM — CALL NOW
                  </span>
                  {submitted.nearestTeam.dist !== undefined && (
                    <span style={{ background: "#fef3c7", padding: "2px 8px", borderRadius: "12px", color: "#b45309", fontSize: "11px" }}>
                      📍 ~{submitted.nearestTeam.dist} km
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", marginBottom: "2px" }}>
                  {submitted.nearestTeam.name}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                  {submitted.nearestTeam.type} Relief Squad · Readiness: {submitted.nearestTeam.readiness || 90}%
                </div>
                <a
                  href={`tel:${submitted.nearestTeam.phone}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    color: "#fff", borderRadius: "10px", padding: "12px",
                    fontWeight: "800", fontSize: "15px", textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(5,150,105,0.35)"
                  }}
                >
                  <Phone size={18} /> Call {submitted.nearestTeam.phone}
                </a>
              </div>
            )}

            {/* Secondary NGO */}
            {submitted.secondaryTeam && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>{submitted.secondaryTeam.name}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Alternate NGO Squad · ~{submitted.secondaryTeam.dist} km</div>
                </div>
                <a
                  href={`tel:${submitted.secondaryTeam.phone}`}
                  style={{ padding: "6px 12px", background: "#0284c7", color: "#fff", borderRadius: "6px", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}
                >
                  Call
                </a>
              </div>
            )}

            {/* Helplines */}
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 14px", marginBottom: "18px", fontSize: "12px", color: "#1e40af", display: "flex", justifyContent: "space-around" }}>
              <span>🚨 National Emergency: <b><a href="tel:112" style={{ color: "#1e40af", textDecoration: "underline" }}>112</a></b></span>
              <span>🌊 NDRF Control: <b><a href="tel:1078" style={{ color: "#1e40af", textDecoration: "underline" }}>1078</a></b></span>
            </div>

            <button
              onClick={handleClose}
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 24px", fontWeight: "700", fontSize: "14px", cursor: "pointer", color: "#334155" }}
            >
              Close
            </button>
          </div>
        ) : (
          /* FORM VIEW */
          <div style={{ padding: "24px" }}>
            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "20px", lineHeight: "1.6" }}>
              📸 Upload a photo of the situation <b>and/or</b> describe what's happening. This information will be instantly transmitted to rescue teams and the admin control center.
            </p>

            {/* Photo Upload */}
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Camera size={14} /> Photo Evidence
            </label>
            <div
              className={`sos-upload-zone${dragOver ? " drag-over" : ""}${imageDataUrl ? " has-image" : ""}`}
              style={{ cursor: "pointer", marginBottom: "16px", margin: "0 0 16px 0" }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById("sos-direct-file").click()}
            >
              <input id="sos-direct-file" type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => handleImageFile(e.target.files[0])} />
              {imageDataUrl ? (
                <div style={{ position: "relative", padding: "6px" }}>
                  <img src={imageDataUrl} alt="Evidence" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px" }} />
                  <button
                    style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={e => { e.stopPropagation(); setImageDataUrl(null); setImageFileName(""); }}
                  ><X size={13} color="#fff" /></button>
                  <div style={{ fontSize: "11px", color: "#059669", marginTop: "6px", fontWeight: "600" }}>✓ {imageFileName}</div>
                </div>
              ) : (
                <div style={{ padding: "28px", textAlign: "center" }}>
                  <Camera size={36} color="#94a3b8" style={{ marginBottom: "10px" }} />
                  <div style={{ fontWeight: "700", color: "#334155", fontSize: "14px" }}>Click or Drag to Upload Photo</div>
                  <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>JPG, PNG, WEBP · Max 5MB</div>
                </div>
              )}
            </div>

            {/* Text description */}
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <Type size={14} /> Describe the Emergency *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Water rising fast, 3 elderly people stranded on 2nd floor, main road flooded, need a boat and medical help urgently..."
              maxLength={500} rows={4}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: "1.5", marginBottom: "4px" }}
            />
            <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "right", marginBottom: "20px" }}>{description.length}/500</div>

            {/* GPS status */}
            {gps && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "8px 12px", marginBottom: "16px", fontSize: "12px", color: "#047857", display: "flex", alignItems: "center", gap: "8px" }}>
                <LocateFixed size={13} /> Your GPS location will be attached automatically
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: "12px",
                background: loading ? "#94a3b8" : "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                color: "#fff", border: "none", fontWeight: "800", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px rgba(225,29,72,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
              }}
            >
              <ShieldAlert size={20} />
              {loading ? "Transmitting to Dispatch..." : "🚨 Send SOS & Notify Rescue Teams"}
            </button>

            <div style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>
              Or call immediately: <a href="tel:112" style={{ color: "#e11d48", fontWeight: "700" }}>112</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [role, setRole] = useState("citizen");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("resqsense_theme") === "dark" ? "dark" : "light";
    } catch (error) {
      console.warn("Unable to read saved theme preference:", error);
      return "light";
    }
  });
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
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [twilioModalOpen, setTwilioModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("resqsense_theme", theme);
    } catch (error) {
      console.warn("Unable to save theme preference:", error);
    }
  }, [theme]);

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
          setRole("rescue");
        } else if (profile.role === "admin") {
          setAdminUser(profile);
          localStorage.setItem("resqsense_admin_user", JSON.stringify(profile));
          setRole("admin");
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
      fetch(`${API}/teams?includePending=true`).then(r => r.json())
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
    setActive("Dashboard");
  };

  const handleSOSSubmit = async (triageResult) => {
    const payload = triageResult.payload || {};
    const body = {
      ...payload,
      lat: gps?.lat || demoCenter[0] + (Math.random() - 0.5) * 0.02,
      lng: gps?.lng || demoCenter[1] + (Math.random() - 0.5) * 0.02,
      description: payload.description || null,
      imageDataUrl: payload.imageDataUrl || null,
      imageFileName: payload.imageFileName || null
    };
    try {
      const res = await fetch(`${API}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const newInc = await res.json();
      setIncidents(prev => [newInc, ...prev]);
      return newInc;
    } catch {
      return null;
    }
  };

  // Direct SOS submit — used by SOSDirectModal (no chatbot triage, just raw evidence)
  const handleDirectSOSSubmit = async ({ description, imageDataUrl, imageFileName, lat, lng }) => {
    const body = {
      type: "Emergency SOS",
      disaster: "Emergency SOS",
      people: 1,
      medical: true,
      priority: 90,
      confidence: 80,
      lat: lat || gps?.lat || demoCenter[0] + (Math.random() - 0.5) * 0.02,
      lng: lng || gps?.lng || demoCenter[1] + (Math.random() - 0.5) * 0.02,
      description: description || null,
      imageDataUrl: imageDataUrl || null,
      imageFileName: imageFileName || null
    };
    const res = await fetch(`${API}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("Submit failed");
    const newInc = await res.json();
    setIncidents(prev => [newInc, ...prev]);
    return newInc;
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
      setSelectedIncident(updated);
      const openMap = window.confirm(
        `Responder Team ${teamId} has been successfully assigned to incident ${incidentId}!\n\nWould you like to open the Dijkstra Rapid Shortest-Path Route navigation map now?`
      );
      if (openMap) {
        setActive("🧭 Rapid Route (Dijkstra)");
      }
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
        onOpenTwilio={role === "admin" ? () => setTwilioModalOpen(true) : null}
        criticalCount={incidents.filter(i => i.priority >= 80).length}
        theme={theme}
        setTheme={setTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Citizen View: Free and open to everyone without login */}
      {role === "citizen" && (
        <div className="app-layout">
          <Sidebar
            role="citizen"
            active={active}
            setActive={setActive}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          <CitizenDashboard
            active={active}
            setActive={setActive}
            incidents={incidents}
            teams={teams}
            gps={gps}
            setGps={setGps}
            setIncidents={setIncidents}
            onOpenChat={() => setSosModalOpen(true)}
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
            <Sidebar
              role="rescue"
              active={active}
              setActive={setActive}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
            <RescueDashboard
              active={active}
              setActive={setActive}
              incidents={incidents}
              teams={teams}
              onSelectIncident={setSelectedIncident}
              onAssignTeam={null}
              onRefreshData={fetchData}
              selectedIncident={selectedIncident}
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
            <Sidebar
              role="admin"
              active={active}
              setActive={setActive}
              onOpenTwilio={() => setTwilioModalOpen(true)}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
            <AdminDashboard
              active={active}
              setActive={setActive}
              incidents={incidents}
              teams={teams}
              onSelectIncident={setSelectedIncident}
              onAssignTeam={handleAssignTeam}
              onRefreshData={fetchData}
              onOpenTwilio={() => setTwilioModalOpen(true)}
              selectedIncident={selectedIncident}
            />
          </div>
        )
      )}

      {/* SOSDirectModal — opened by all Rapid SOS buttons */}
      <SOSDirectModal
        open={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        gps={gps}
        teams={teams}
        onSubmit={handleDirectSOSSubmit}
      />

      {/* Chatbot — AI triage assistant, corner floating button — Citizen view ONLY */}
      {role === "citizen" && (
        <Chatbot
          gps={gps}
          onSOS={handleSOSSubmit}
          open={chatOpen}
          setOpen={setChatOpen}
        />
      )}

      {/* Twilio Emergency Broadcast Modal — Admin Only */}
      <TwilioBroadcastModal
        open={twilioModalOpen}
        onClose={() => setTwilioModalOpen(false)}
        incidents={incidents}
        teams={teams}
      />

      <IncidentDetailDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        teams={teams}
        onAssignTeam={role === "rescue" ? null : handleAssignTeam}
        onOpenDijkstraRoute={(inc) => {
          setSelectedIncident(inc);
          setActive("🧭 Rapid Route (Dijkstra)");
        }}
      />

      <footer className="app-footer">
        ResQSense Smart Disaster Response & Coordination Platform • High-Readiness Demo • Built with React & Leaflet
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
