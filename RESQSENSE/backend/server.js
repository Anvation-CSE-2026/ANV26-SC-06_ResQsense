const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const teams = [
  { id:"T-101", name:"Rapid Relief Foundation", type:"NGO", lat:22.5726, lng:88.3639, phone:"+91-00000-00001", readiness:94, personnel:8, skills:["Flood","Medical","Search & Rescue"], equipment:["Boat","Medical Kit"], status:"AVAILABLE" },
  { id:"T-102", name:"District Emergency Response Unit", type:"GOVERNMENT", lat:22.585, lng:88.37, phone:"+91-00000-00002", readiness:97, personnel:12, skills:["Flood","Search & Rescue","Earthquake"], equipment:["Boat","Ambulance"], status:"AVAILABLE" },
  { id:"T-103", name:"Community Rescue Network", type:"NGO", lat:22.56, lng:88.35, phone:"+91-00000-00003", readiness:88, personnel:6, skills:["Medical","Fire"], equipment:["Medical Kit","Rescue Vehicle"], status:"AVAILABLE" },
  { id:"T-104", name:"Urban Search & Rescue Cell", type:"GOVERNMENT", lat:22.59, lng:88.39, phone:"+91-00000-00004", readiness:91, personnel:10, skills:["Earthquake","Landslide","Search & Rescue"], equipment:["Rescue Vehicle","Medical Kit"], status:"AVAILABLE" }
];

let incidents = [
  { id:"INC-1042", type:"Flood", lat:22.5726, lng:88.3639, priority:92, confidence:87, people:12, medical:true, status:"VERIFIED", assignedTeam:"T-101" },
  { id:"INC-1047", type:"Landslide", lat:22.59, lng:88.39, priority:88, confidence:91, people:8, medical:false, status:"PRIORITIZED", assignedTeam:null },
  { id:"INC-1051", type:"Earthquake", lat:22.56, lng:88.35, priority:84, confidence:79, people:20, medical:true, status:"REPORTED", assignedTeam:null },
  { id:"INC-1054", type:"Heavy Rain", lat:22.61, lng:88.36, priority:58, confidence:83, people:5, medical:false, status:"REPORTED", assignedTeam:null }
];

function priorityScore(a) {
  const hazard = { Flood:30, Landslide:30, Earthquake:30, Fire:28, Cyclone:30, "Heavy Rain":18 }[a.disaster] || 20;
  const people = Math.min(20, a.people > 20 ? 20 : a.people);
  const medical = a.medical === "life" ? 15 : a.medical === "serious" ? 12 : a.medical ? 8 : 0;
  const trapped = a.trapped === "5+" ? 15 : a.trapped === "3-5" ? 12 : a.trapped === "1-2" ? 7 : 0;
  const access = a.access === "blocked" ? 10 : a.access === "partial" ? 6 : 2;
  const vulnerable = a.vulnerable ? 5 : 0;
  return Math.min(100, hazard + people + medical + trapped + access + vulnerable);
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R=6371, r=Math.PI/180;
  const dLat=(lat2-lat1)*r, dLon=(lon2-lon1)*r;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

app.get("/api/health", (_,res)=>res.json({ok:true, service:"RESQSENSE API", mode:"DEMO"}));
app.get("/api/incidents", (_,res)=>res.json(incidents));
app.get("/api/teams", (_,res)=>res.json(teams));

app.get("/api/weather", async (req,res)=>{
  const {lat,lng}=req.query;
  res.json({
    mode:"DEMO",
    location:{lat:Number(lat)||0,lng:Number(lng)||0},
    current:{temperature:29, humidity:78, wind:14, rainfall:18, condition:"Heavy Rain"},
    alerts:["Heavy rainfall possible in the selected area"]
  });
});

app.get("/api/teams/nearby", (req,res)=>{
  const lat=Number(req.query.lat), lng=Number(req.query.lng);
  if(!Number.isFinite(lat)||!Number.isFinite(lng)) return res.status(400).json({error:"Valid coordinates required"});
  const result=teams.map(t=>({...t,distance:Number(distanceKm(lat,lng,t.lat,t.lng).toFixed(2)),eta:Math.max(5,Math.round(distanceKm(lat,lng,t.lat,t.lng)*5))}))
    .sort((a,b)=>a.distance-b.distance);
  res.json(result);
});

app.post("/api/triage",(req,res)=>{
  const score=priorityScore(req.body);
  const severity=score>=80?"CRITICAL":score>=60?"HIGH":score>=30?"MEDIUM":"LOW";
  const confidence= req.body.disaster && req.body.people ? 82 : 65;
  res.json({
    priority:score,
    severity,
    confidence,
    reasons:[
      req.body.people>5?"Multiple people affected":"Limited people reported",
      req.body.medical?"Medical urgency reported":"No medical urgency reported",
      req.body.access==="blocked"?"Access is blocked":"Access appears possible"
    ],
    required:{personnel: score>=80?6:score>=60?4:2, resources: score>=80?["Medical Kit","Rescue Vehicle"]:["Basic Rescue Kit"]}
  });
});

app.post("/api/incidents",(req,res)=>{
  const body=req.body;
  const score=priorityScore(body);
  const incident={
    id:"INC-"+(1060+incidents.length),
    type:body.disaster||"Other",
    lat:Number(body.lat)||null,
    lng:Number(body.lng)||null,
    priority:score,
    confidence:82,
    people:Number(body.people)||1,
    medical:Boolean(body.medical),
    status:"REPORTED",
    assignedTeam:null
  };
  incidents.unshift(incident);
  res.status(201).json(incident);
});

app.post("/api/incidents/:id/assign",(req,res)=>{
  const incident=incidents.find(i=>i.id===req.params.id);
  if(!incident) return res.status(404).json({error:"Incident not found"});
  incident.assignedTeam=req.body.teamId||null;
  incident.status="ASSIGNED";
  res.json(incident);
});

app.listen(PORT,()=>console.log(`RESQSENSE API running on http://localhost:${PORT}`));
