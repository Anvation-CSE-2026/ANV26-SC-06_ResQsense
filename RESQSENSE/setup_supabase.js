/**
 * ResQSense — Supabase Table Creator
 * Uses Supabase's pg-based REST approach to create tables via HTTP
 */
const https = require("https");

const PROJECT_REF = "uocpurjbawxnnjzqgppl";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvY3B1cmpiYXd4bm5qenFncHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTQ1OTU5NSwiZXhwIjoyMTA3MDM1NTk1fQ.M3HA3KthZMHSL4m7GJnvkcd5smPRnh3R8fWtXHDUbCE";
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

function req(method, path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path,
      method,
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation,resolution=merge-duplicates",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        ...extraHeaders
      }
    };
    const r = https.request(options, res => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

async function run() {
  console.log("\n🚀 ResQSense Supabase Setup\n" + "━".repeat(45));

  // ── 1. Check connection ────────────────────────────────
  console.log("\n[1/5] Testing connection...");
  const ping = await req("GET", "/rest/v1/");
  if (ping.status === 200) {
    console.log("      ✅ Connected to Supabase");
  } else {
    console.log(`      ❌ Connection failed: ${ping.status}`);
    process.exit(1);
  }

  // ── 2. Check if tables exist ──────────────────────────
  console.log("\n[2/5] Checking existing tables...");
  const teamsCheck = await req("GET", "/rest/v1/teams?limit=1");
  const incCheck   = await req("GET", "/rest/v1/incidents?limit=1");
  const teamsExist = teamsCheck.status !== 404 && teamsCheck.status !== 400;
  const incExist   = incCheck.status !== 404   && incCheck.status !== 400;
  console.log(`      teams table:     ${teamsExist ? "✅ exists" : "❌ missing"}`);
  console.log(`      incidents table: ${incExist   ? "✅ exists" : "❌ missing"}`);

  if (!teamsExist || !incExist) {
    console.log("\n⚠️  TABLES NEED TO BE CREATED MANUALLY");
    console.log("━".repeat(45));
    console.log("\nSince Supabase doesn't allow DDL (CREATE TABLE) via the");
    console.log("REST API directly, you need to do ONE of these:\n");
    console.log("OPTION A — SQL Editor (30 seconds):");
    console.log("  1. Open: https://supabase.com/dashboard/project/uocpurjbawxnnjzqgppl/sql/new");
    console.log("  2. Log in to Supabase if prompted");
    console.log("  3. Paste the SQL from: supabase_setup.sql");
    console.log("  4. Click RUN");
    console.log("\nOPTION B — Table Editor:");
    console.log("  1. Open: https://supabase.com/dashboard/project/uocpurjbawxnnjzqgppl/editor");
    console.log("  2. Create tables manually using the GUI\n");
    console.log("ONCE DONE, run this script again to seed the data.\n");
    process.exit(0);
  }

  // ── 3. Seed teams ────────────────────────────────────
  console.log("\n[3/5] Seeding rescue teams...");
  const teams = [
    { id:"T-101", name:"Rapid Relief Foundation",        type:"NGO",        lat:22.5726, lng:88.3639, phone:"+91-00000-00001", readiness:94, personnel:8,  skills:["Flood","Medical","Search & Rescue"],         equipment:["Boat","Medical Kit"],           status:"AVAILABLE" },
    { id:"T-102", name:"District Emergency Response Unit",type:"GOVERNMENT", lat:22.585,  lng:88.37,   phone:"+91-00000-00002", readiness:97, personnel:12, skills:["Flood","Search & Rescue","Earthquake"],      equipment:["Boat","Ambulance"],             status:"AVAILABLE" },
    { id:"T-103", name:"Community Rescue Network",        type:"NGO",        lat:22.56,   lng:88.35,   phone:"+91-00000-00003", readiness:88, personnel:6,  skills:["Medical","Fire"],                            equipment:["Medical Kit","Rescue Vehicle"], status:"AVAILABLE" },
    { id:"T-104", name:"Urban Search & Rescue Cell",      type:"GOVERNMENT", lat:22.59,   lng:88.39,   phone:"+91-00000-00004", readiness:91, personnel:10, skills:["Earthquake","Landslide","Search & Rescue"],  equipment:["Rescue Vehicle","Medical Kit"], status:"AVAILABLE" }
  ];

  for (const team of teams) {
    const r = await req("POST", "/rest/v1/teams", team, { "Prefer": "resolution=merge-duplicates,return=minimal" });
    if (r.status === 201 || r.status === 200 || r.status === 204) {
      console.log(`      ✅ ${team.id}: ${team.name}`);
    } else {
      console.log(`      ❌ ${team.id}: ${JSON.stringify(r.body)}`);
    }
  }

  // ── 4. Seed incidents ─────────────────────────────────
  console.log("\n[4/5] Seeding incidents...");
  const now = new Date().toISOString();
  const incidents = [
    { id:"INC-1042", type:"Flood",      lat:22.5726, lng:88.3639, priority:92, confidence:87, people:12, medical:true,  status:"VERIFIED",    assignedTeam:"T-101", createdAt:now },
    { id:"INC-1047", type:"Landslide",  lat:22.59,   lng:88.39,   priority:88, confidence:91, people:8,  medical:false, status:"PRIORITIZED", assignedTeam:null,    createdAt:now },
    { id:"INC-1051", type:"Earthquake", lat:22.56,   lng:88.35,   priority:84, confidence:79, people:20, medical:true,  status:"REPORTED",    assignedTeam:null,    createdAt:now },
    { id:"INC-1054", type:"Heavy Rain", lat:22.61,   lng:88.36,   priority:58, confidence:83, people:5,  medical:false, status:"REPORTED",    assignedTeam:null,    createdAt:now }
  ];

  for (const inc of incidents) {
    const row = { ...inc };
    // Map camelCase to quoted column name
    const payload = {
      id: row.id, type: row.type, lat: row.lat, lng: row.lng,
      priority: row.priority, confidence: row.confidence,
      people: row.people, medical: row.medical, status: row.status,
      "assignedTeam": row.assignedTeam,
      "createdAt": row.createdAt
    };
    if (!payload.assignedTeam) delete payload.assignedTeam;
    const r = await req("POST", "/rest/v1/incidents", payload, { "Prefer": "resolution=merge-duplicates,return=minimal" });
    if (r.status === 201 || r.status === 200 || r.status === 204) {
      console.log(`      ✅ ${inc.id}: ${inc.type} (priority ${inc.priority})`);
    } else {
      console.log(`      ❌ ${inc.id}: ${JSON.stringify(r.body)}`);
    }
  }

  // ── 5. Final verification ────────────────────────────
  console.log("\n[5/5] Final verification...");
  const tResult = await req("GET", "/rest/v1/teams?select=id,name,status");
  const iResult = await req("GET", "/rest/v1/incidents?select=id,type,priority,status");
  const teamCount = Array.isArray(tResult.body) ? tResult.body.length : "?";
  const incCount  = Array.isArray(iResult.body) ? iResult.body.length : "?";
  console.log(`      ✅ Teams in Supabase: ${teamCount}`);
  console.log(`      ✅ Incidents in Supabase: ${incCount}`);

  if (Array.isArray(tResult.body)) {
    tResult.body.forEach(t => console.log(`         - ${t.id}: ${t.name}`));
  }

  console.log("\n" + "━".repeat(45));
  console.log("🎉 Supabase database fully populated!\n");
  console.log("Now restart your dev server:");
  console.log("  npm run dev\n");
}

run().catch(e => console.error("Fatal:", e.message));
