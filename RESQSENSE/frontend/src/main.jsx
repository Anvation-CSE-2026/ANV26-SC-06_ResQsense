import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {MapContainer,TileLayer,Marker,Popup,useMap} from "react-leaflet";
import L from "leaflet";
import {Bell,Map as MapIcon,ShieldAlert,Users,Truck,Info,Settings,Phone,Navigation,Activity,Package,CheckCircle,Clock,Menu,X,LocateFixed,MessageCircle} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./styles.css";

const API="http://localhost:5000/api";
const demoCenter=[22.5726,88.3639];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
 iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
 shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function MapCenter({center}){const map=useMap(); useEffect(()=>{if(center)map.setView(center,13)},[center]); return null;}

function LiveMap({incidents,teams,center,onSelect,showTeams=true}){
 return <div className="mapWrap">
   <MapContainer center={center||demoCenter} zoom={12} scrollWheelZoom className="map">
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
    <MapCenter center={center}/>
    {incidents.map(i=><Marker key={i.id} position={[i.lat,i.lng]} eventHandlers={{click:()=>onSelect?.(i)}}>
      <Popup><b>{i.id}</b><br/>{i.type}<br/><strong>Priority {i.priority}</strong><br/>Status: {i.status}</Popup>
    </Marker>)}
    {showTeams&&teams.map(t=><Marker key={t.id} position={[t.lat,t.lng]}>
      <Popup><b>{t.name}</b><br/>{t.type}<br/>Readiness {t.readiness}%<br/>Personnel {t.personnel}<br/><a href={`tel:${t.phone}`}>Call team</a></Popup>
    </Marker>)}
   </MapContainer>
   <div className="mapLegend"><span>🔴 Critical</span><span>🟠 High</span><span>🟡 Medium</span><span>🔵 Rescue team</span></div>
 </div>
}

function Header({role,setRole,gps,setGps}){
 const enable=()=>navigator.geolocation?.getCurrentPosition(
   p=>setGps({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy}),
   ()=>setGps(null)
 );
 return <header>
   <div className="brand"><div className="brandMark">R</div><div><b>RESQSENSE</b><small>Smart Disaster Response</small></div></div>
   <div className="roleSwitch">{["citizen","rescue","admin"].map(r=><button className={role===r?"active":""} onClick={()=>setRole(r)} key={r}>{r}</button>)}</div>
   <div className="headActions">
     <button className={gps?"location on":"location"} onClick={enable}><LocateFixed size={16}/>{gps?"Location ON":"Enable Location"}</button>
     <Bell size={19}/><div className="avatar">{role[0].toUpperCase()}</div>
   </div>
 </header>
}

function Sidebar({role,active,setActive}){
 const citizen=["Dashboard","Emergency SOS","My Reports","Alerts","Information","Rescue Teams","Settings"];
 const rescue=["Dashboard","Assignments","Resources","Manpower","Live Incidents","Settings"];
 const admin=["Dashboard","Incident Queue","Priority Queue","Resource Allocation","Rescue Teams","Alerts","Analytics","Audit Logs"];
 const items=role==="citizen"?citizen:role==="rescue"?rescue:admin;
 return <aside><div className="mobileTitle">MENU</div>{items.map((x,i)=><button key={x} className={active===x?"nav active":"nav"} onClick={()=>setActive(x)}>{i===0?<Activity size={17}/>:x==="Information"?<Info size={17}/>:x.includes("Resource")?<Package size={17}/>:x.includes("Rescue")?<Truck size={17}/>:x.includes("Incident")?<MapIcon size={17}/>:<ShieldAlert size={17}/>} {x}</button>)}</aside>
}

function Stat({label,value,icon}){return <div className="stat"><div className="statIcon">{icon}</div><div><small>{label}</small><strong>{value}</strong></div></div>}

function Chatbot({gps,onSOS}){
 const [open,setOpen]=useState(true),[step,setStep]=useState(0),[answers,setAnswers]=useState({}),[result,setResult]=useState(null);
 const questions=[
  ["What happened?",["Flood","Landslide","Earthquake","Fire","Heavy Rain","Cyclone"]],
  ["Are people trapped?",["No","1-2","3-5","5+"]],
  ["Is anyone injured?",["No","Minor","Serious","Life-threatening"]],
  ["Can responders reach you?",["Yes","Partially blocked","Completely blocked","Unknown"]],
  ["How many people need help?",["1","2-5","6-20","20+"]]
 ];
 async function answer(v){
  const a={...answers,[step]:v}; setAnswers(a);
  if(step<4){setStep(step+1);return}
  const people=v==="20+"?25:v==="6-20"?10:v==="2-5"?3:1;
  const payload={disaster:a[0],trapped:a[1],medical:a[2].toLowerCase().includes("serious")||a[2].includes("life"),access:a[3]==="Completely blocked"?"blocked":a[3]==="Partially blocked"?"partial":"yes",people};
  const r=await fetch(API+"/triage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(x=>x.json());
  setResult({...r,payload});
 }
 if(!open)return <button className="chatFloat" onClick={()=>setOpen(true)}><MessageCircle/> Emergency Assistant</button>;
 return <div className="chatbot">
  <div className="chatHead"><div><b>Emergency Assistant</b><small>5-question rapid triage</small></div><button onClick={()=>setOpen(false)}><X size={17}/></button></div>
  {!result?<><div className="chatBody"><div className="botBubble">{questions[step][0]}</div><div className="choices">{questions[step][1].map(v=><button onClick={()=>answer(v)} key={v}>{v}</button>)}</div></div><div className="progress">Question {step+1} of 5</div></>
  :<div className="chatBody"><div className="resultScore">{result.priority}<small>/100</small></div><h3>{result.severity} PRIORITY</h3><p>Confidence: <b>{result.confidence}%</b></p>{gps?<p>📍 Location available — nearby teams can be found.</p>:<div className="locationNotice">📍 Enable GPS or enter a location to find the nearest rescue team.</div>}<button className="primary" onClick={()=>onSOS(result)}>Submit SOS</button><button className="secondary" onClick={()=>{setStep(0);setAnswers({});setResult(null)}}>Start Again</button></div>}
 </div>
}

function Citizen({incidents,teams,gps,setIncidents}){
 const [selected,setSelected]=useState(null);
 const [weather,setWeather]=useState(null);
 useEffect(()=>{if(gps)fetch(`${API}/weather?lat=${gps.lat}&lng=${gps.lng}`).then(r=>r.json()).then(setWeather)},[gps]);
 async function sos(r){
  const p=r.payload||{};
  const body={...p,lat:gps?.lat,lng:gps?.lng};
  const x=await fetch(API+"/incidents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json());
  setIncidents([x,...incidents]); alert(`SOS ${x.id} submitted. Priority ${x.priority}.`);
 }
 return <main>
  <div className="pageTitle"><div><span className="eyebrow">CITIZEN PORTAL</span><h1>Emergency Response Dashboard</h1><p>Get alerts, report incidents and connect with verified responders.</p></div><button className="sos" onClick={()=>alert("Use the Emergency Assistant or report form to submit a structured SOS.")}>🚨 EMERGENCY SOS</button></div>
  <div className="stats"><Stat label="Active Alerts" value="03" icon={<Bell/>}/><Stat label="My Reports" value="02" icon={<ShieldAlert/>}/><Stat label="Nearby Teams" value={gps?"03":"—"} icon={<Users/>}/><Stat label="Local Weather" value={weather?"Live":"—"} icon={<Activity/>}/></div>
  <div className="dashboardGrid">
   <section className="panel mapPanel"><div className="panelHead"><div><h2>Live Disaster Map</h2><span>{gps?"Location enabled":"Map works without GPS • enable location for nearby results"}</span></div><button className="outline"><MapIcon size={16}/> Layers</button></div><LiveMap incidents={incidents} teams={teams} center={gps?[gps.lat,gps.lng]:demoCenter} onSelect={setSelected}/></section>
   <section className="panel alerts"><div className="panelHead"><h2>Local Intelligence</h2><span>Live / demo data</span></div>{weather&&<div className="weather"><b>{weather.current.temperature}°C</b><span>{weather.current.condition}</span><span>Rain {weather.current.rainfall} mm • Wind {weather.current.wind} km/h</span></div>}<div className="alertItem critical"><b>High-risk incident detected</b><span>Flood • Priority 92 • 12 people</span></div><div className="alertItem"><b>Heavy rainfall advisory</b><span>Check low-lying areas and follow official instructions.</span></div><div className="alertItem"><b>Location</b><span>{gps?"Coordinates available for nearby response":"GPS optional — use the button above when you need nearby response teams."}</span></div></section>
  </div>
  <section className="panel"><div className="panelHead"><h2>Information</h2><span>Emergency preparedness</span></div><div className="infoCards">{["Flood Safety","Earthquake Safety","Landslide Safety","Cyclone Safety","Emergency Kit","Important Helplines"].map(x=><div className="infoCard" key={x}><Info size={18}/><b>{x}</b><p>Practical guidance for emergency preparedness and response.</p></div>)}</div></section>
  {selected&&<div className="sideDetail"><button onClick={()=>setSelected(null)}><X/></button><h2>{selected.id}</h2><b>{selected.type}</b><div className="bigPriority">{selected.priority}</div><p>Confidence {selected.confidence}%</p><p>{selected.people} people affected</p></div>}
  <Chatbot gps={gps} onSOS={sos}/>
 </main>
}

function Rescue({incidents,teams}){
 const [selected,setSelected]=useState(null);
 return <main><div className="pageTitle"><div><span className="eyebrow">RESCUE OPERATIONS</span><h1>Response Team Dashboard</h1><p>NGO and government responders manage assignments, manpower and resources.</p></div><div className="teamStatus">● TEAM AVAILABLE</div></div>
 <div className="stats"><Stat label="Active Assignments" value="03" icon={<Truck/>}/><Stat label="Pending" value="05" icon={<Clock/>}/><Stat label="Personnel Available" value="24" icon={<Users/>}/><Stat label="Resource Readiness" value="82%" icon={<Package/>}/></div>
 <section className="panel mapPanel"><div className="panelHead"><div><h2>Operational Live Map</h2><span>Incidents + rescue teams + response area</span></div></div><LiveMap incidents={incidents} teams={teams} center={demoCenter} onSelect={setSelected}/></section>
 <section className="panel"><div className="panelHead"><h2>Incoming Assignments</h2><span>Sorted by priority</span></div><div className="table">{incidents.slice(0,4).map(i=><div className="row" key={i.id}><b>{i.id}</b><span>{i.type}</span><strong className={i.priority>=80?"danger":i.priority>=60?"warn":"normal"}>{i.priority}</strong><span>{i.people} people</span><span>{i.status}</span><button className="primarySmall">VIEW</button></div>)}</div></section>
 </main>
}

function Admin({incidents,teams}){
 return <main><div className="pageTitle"><div><span className="eyebrow">CONTROL ROOM</span><h1>Disaster Management Center</h1><p>Verify incidents, prioritize response and allocate resources.</p></div><div className="liveBadge">● LIVE MONITORING</div></div>
 <div className="stats"><Stat label="Active Incidents" value="42" icon={<ShieldAlert/>}/><Stat label="Critical" value="08" icon={<Activity/>}/><Stat label="Rescue Teams" value="27" icon={<Truck/>}/><Stat label="Personnel" value="184" icon={<Users/>}/></div>
 <section className="panel mapPanel"><div className="panelHead"><div><h2>Unified Disaster Map</h2><span>All incidents, NGO/government teams and operational layers</span></div><button className="outline">Filter</button></div><LiveMap incidents={incidents} teams={teams} center={demoCenter}/></section>
 <div className="twoCol"><section className="panel"><div className="panelHead"><h2>Critical Incident Queue</h2></div>{incidents.filter(i=>i.priority>=80).map(i=><div className="incidentRow" key={i.id}><div><b>{i.id}</b><span>{i.type} • {i.people} people</span></div><strong className="danger">{i.priority}</strong><button className="primarySmall">ASSIGN</button></div>)}</section><section className="panel"><div className="panelHead"><h2>Resource Allocation</h2></div>{[["Personnel","184 / 240"],["Vehicles","18 / 25"],["Medical Kits","82%"],["Boats","6 / 10"]].map(x=><div className="resource" key={x[0]}><div><b>{x[0]}</b><span>{x[1]}</span></div><div className="bar"><i style={{width:x[0]==="Medical Kits"?"82%":x[0]==="Personnel"?"77%":"70%"}}/></div></div>)}</section></div>
 </main>
}

function App(){
 const [role,setRole]=useState("citizen"),[active,setActive]=useState("Dashboard"),[gps,setGps]=useState(null);
 const [incidents,setIncidents]=useState([]),[teams,setTeams]=useState([]);
 useEffect(()=>{Promise.all([fetch(API+"/incidents").then(r=>r.json()),fetch(API+"/teams").then(r=>r.json())]).then(([a,b])=>{setIncidents(a);setTeams(b)})},[]);
 useEffect(()=>setActive("Dashboard"),[role]);
 return <><Header role={role} setRole={setRole} gps={gps} setGps={setGps}/><div className="layout"><Sidebar role={role} active={active} setActive={setActive}/>{role==="citizen"?<Citizen incidents={incidents} teams={teams} gps={gps} setIncidents={setIncidents}/>:role==="rescue"?<Rescue incidents={incidents} teams={teams}/>:<Admin incidents={incidents} teams={teams}/>}</div><footer>RESQSENSE • Demonstration MVP • Map data © OpenStreetMap contributors • Demo data only</footer></>
}
createRoot(document.getElementById("root")).render(<App/>);
