# RESQSENSE 🚨
### Smart Disaster Management & Emergency Response Platform

RESQSENSE is a smart disaster management and emergency response platform designed to bridge the communication and coordination gap between **citizens, rescue teams, NGOs, and government authorities** during natural disasters.

The platform combines **weather and disaster information, citizen emergency reports, incident validation, priority scoring, resource allocation, and rescue-team coordination** into a unified system.

The primary objective of RESQSENSE is to reduce the time between **disaster detection → incident verification → prioritization → rescue assignment → response**.

---

## 🌍 Problem Statement

During natural disasters such as floods, cyclones, earthquakes, landslides, and extreme weather events, several problems can occur simultaneously:

- Citizens may not know whom to contact for immediate assistance.
- Emergency reports may be incomplete, duplicated, or difficult to verify.
- Rescue teams may lack a unified view of incidents.
- Critical incidents may not be prioritized effectively.
- Available manpower and resources may not be allocated optimally.
- Weather and disaster information is often distributed across multiple sources.
- Poor connectivity can prevent citizens from successfully submitting emergency requests.
- Authorities may lack real-time situational awareness across affected areas.

RESQSENSE addresses these gaps through a centralized disaster-response coordination platform.

---

## 🎯 Objectives

RESQSENSE aims to:

- Provide citizens with a simple emergency reporting and SOS mechanism.
- Collect structured information about emergency situations.
- Use authoritative meteorological information for situational awareness.
- Validate and cross-check emergency reports.
- Calculate transparent incident priority scores.
- Assign appropriate rescue teams based on incident requirements.
- Coordinate manpower and resources.
- Provide real-time incident visibility through interactive maps.
- Notify citizens, rescue teams, NGOs, and administrators.
- Support emergency reporting in situations with poor or intermittent connectivity.
- Maintain a unified operational view for disaster-response coordination.

---

# 🔄 RESQSENSE Response Workflow

```text
                    DISASTER / HAZARD
                           │
                           ▼
                ┌─────────────────────┐
                │ Detection & Reports │
                │                     │
                │ • Weather Data      │
                │ • Citizen Reports   │
                │ • NGO Reports       │
                │ • Authority Reports │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │      VALIDATE       │
                │                     │
                │ • Multi-source      │
                │ • Duplicate check   │
                │ • Confidence score  │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │     PRIORITIZE      │
                │                     │
                │ • Severity          │
                │ • People affected   │
                │ • Medical urgency   │
                │ • Accessibility     │
                │ • Risk factors      │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │       ASSIGN        │
                │                     │
                │ • Rescue Team       │
                │ • Manpower          │
                │ • Resources         │
                │ • ETA               │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │       RESCUE        │
                │                     │
                │ • En Route          │
                │ • On Scene          │
                │ • Rescuing          │
                │ • Completed         │
                └─────────────────────┘
```

---

# 👥 User Roles

RESQSENSE provides separate interfaces for three major user groups.

## 👤 Citizen

Citizens can:

- Access the emergency dashboard.
- Submit an SOS request.
- Report disaster incidents.
- Answer structured emergency questions through the chatbot.
- View weather and disaster alerts.
- View incidents on a map.
- Track their reported emergency.
- Receive notifications.
- Access disaster-related information.
- Find nearby verified rescue teams when location information is available.

### Emergency Chatbot

The emergency chatbot collects structured information through a short set of questions:

1. What happened?
2. Are people trapped?
3. Is anyone injured or in medical danger?
4. Can responders reach the location?
5. How many people need help?

The chatbot is responsible for **collecting structured information**.

The final priority is determined by the backend's deterministic scoring and validation logic rather than by the chatbot itself.

---

# 🚑 Rescue Team / NGO

Rescue teams can:

- View assigned incidents.
- View incident locations on a map.
- See incident priority and severity.
- View affected-person information.
- View required manpower and resources.
- Accept or reject assignments.
- Update rescue status.
- Track operational tasks.
- View relevant weather conditions.
- Coordinate emergency response.

Example operational status flow:

```text
REPORTED
    ↓
VALIDATING
    ↓
VERIFIED
    ↓
PRIORITIZED
    ↓
ASSIGNED
    ↓
ACCEPTED
    ↓
EN_ROUTE
    ↓
ON_SCENE
    ↓
RESCUING
    ↓
COMPLETED
```

---

# 🏢 Admin / Control Room

The administrator provides centralized disaster-response coordination.

Admin capabilities include:

- Unified disaster map.
- Incident monitoring.
- Incident verification.
- Priority queue.
- Rescue-team assignment.
- Resource allocation.
- Manpower allocation.
- Alert management.
- Operational monitoring.
- Incident analytics.
- Audit and activity monitoring.

The admin dashboard is designed to provide a **control-room style overview** of ongoing incidents and response operations.

---

# 🗺️ Interactive Disaster Map

Maps are a core component of RESQSENSE.

The map can be used to display:

- Emergency incidents.
- Rescue-team locations.
- Affected areas.
- Disaster-risk information.
- Weather information.
- Relevant alerts.
- Operational response locations.

GPS is optional.

The application should remain usable even when a user does not grant GPS permission. Users can instead provide or select a location manually.

---

# 🌦️ Weather & Meteorological Data

RESQSENSE uses meteorological information as an important input for disaster situational awareness, validation, and risk assessment.

For the India-focused implementation, the **India Meteorological Department (IMD)** is intended to serve as an authoritative meteorological data source.

Potential information includes:

- Current weather observations.
- Rainfall information.
- Weather forecasts.
- Weather warnings.
- District-level warnings.
- Other relevant meteorological information.

Weather information should **not automatically be treated as confirmation that a disaster has occurred**.

For example:

```text
Heavy Rain
     │
     ▼
Risk / Situational Indicator
     │
     ├── Citizen Reports
     ├── NGO Reports
     ├── Government Information
     └── Other Sources
              │
              ▼
       Validation / Confidence
              │
              ▼
       Incident Prioritization
```

This approach reduces false positives caused by interpreting weather conditions alone as confirmed disasters.

---

# 🧠 Priority Scoring

RESQSENSE uses a deterministic priority engine to help identify which incidents require urgent attention.

Factors can include:

- Number of people affected.
- Injuries.
- Medical emergency.
- Trapped persons.
- Disaster severity.
- Accessibility.
- Hazard conditions.
- Location risk.
- Available rescue resources.
- Other relevant incident information.

The output can include:

```text
Priority Score: 0–100
Severity: LOW / MEDIUM / HIGH / CRITICAL
Confidence: 0–100%
Reasons: [ ... ]
Required Manpower: ...
Required Resources: [ ... ]
Recommended Team: ...
```

The scoring process is designed to remain **transparent and explainable**.

---

# 🔎 Incident Validation

A major objective of RESQSENSE is to reduce false or unreliable emergency reports.

Incident confidence can be improved through cross-checking information from multiple sources, such as:

- Citizen reports.
- NGO/rescue-team reports.
- Government reports.
- Weather information.
- Official warnings.
- Multiple reports from the same geographical area.

The system can also identify potential duplicate reports and flag low-confidence incidents for administrative review.

---

# 🚨 Smart Rescue-Team Assignment

After an incident has been verified and prioritized, RESQSENSE can recommend an appropriate rescue team.

Matching factors may include:

- Incident priority.
- Distance from incident.
- Team availability.
- Team readiness.
- Team skills.
- Available equipment.
- Required manpower.
- Current workload.
- Estimated response time.

Example:

```text
Incident
   │
   ├── Priority: CRITICAL
   ├── People: 12
   ├── Medical Emergency: YES
   ├── Required: Medical + Rescue
   │
   ▼
Team Matching Engine
   │
   ├── Distance
   ├── Availability
   ├── Skills
   ├── Equipment
   └── ETA
   │
   ▼
Recommended Rescue Team
```

The system should prevent the same team/resource from being simultaneously allocated to incompatible incidents.

---

# 📱 Notifications & SMS

RESQSENSE can provide notifications to relevant stakeholders.

Possible notification events include:

- Disaster warning.
- New SOS report.
- Incident verification.
- Critical incident escalation.
- Rescue-team assignment.
- Assignment acceptance.
- Team en route.
- Rescue completion.

SMS functionality can be implemented through a provider such as **Twilio**, while in-app notifications can provide real-time operational updates.

API credentials and secrets must remain on the backend and must never be exposed to the frontend.

---

# 📡 Offline Emergency Support

Natural disasters can cause unreliable internet connectivity.

RESQSENSE is designed with an offline-first approach for emergency reporting.

The intended flow is:

```text
User creates SOS
       │
       ▼
Internet Available?
   ┌───┴────┐
  YES       NO
   │         │
   ▼         ▼
Send API   Local Queue
   │         │
   │         ▼
   │    Internet Restored
   │         │
   └────┬────┘
        ▼
     Sync Data
        │
        ▼
   Backend Processing
```

Local storage such as IndexedDB can be used to temporarily store unsent emergency reports.

Each report should use an idempotency mechanism to prevent duplicate incident creation during synchronization.

> Offline mode cannot guarantee immediate server-side processing or SMS delivery until connectivity is restored.

---

# 🔐 Security & Reliability

RESQSENSE should follow secure application practices including:

- Backend-only API secrets.
- Environment variables for credentials.
- Role-based access control.
- Input validation.
- API authentication.
- Rate limiting.
- Audit logging.
- Duplicate-request protection.
- Secure error handling.
- Data minimization.
- Controlled administrative access.

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────────────┐
│                 RESQSENSE                   │
├─────────────────────────────────────────────┤
│                                             │
│              FRONTEND                       │
│                                             │
│       React + Vite                          │
│       Citizen Dashboard                     │
│       Rescue Dashboard                      │
│       Admin Dashboard                       │
│       Interactive Maps                      │
│       Emergency Chatbot                     │
│                                             │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│                 BACKEND                     │
│                                             │
│       REST APIs                             │
│       Authentication                        │
│       Incident Management                   │
│       Priority Engine                       │
│       Validation Engine                     │
│       Allocation Engine                     │
│       Notification Service                  │
│                                             │
└──────────┬───────────┬───────────┬──────────┘
           │           │           │
           ▼           ▼           ▼
       Supabase      Weather     Notification
       Database      APIs        Services
                         │
                         ▼
                       IMD
```

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS
- Interactive map technology

## Backend

- Node.js
- Express.js
- REST APIs

## Database

- Supabase
- PostgreSQL

## Maps

- Leaflet
- OpenStreetMap

## External Data

- India Meteorological Department APIs
- Weather data providers / fallback providers
- Disaster-related information sources

## Notifications

- In-app notifications
- SMS integration such as Twilio

---

# 📁 Project Structure

```text
RESQSENSE/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── engines/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── websocket/
│   │   └── config/
│   │
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── scoring.md
│   ├── deployment.md
│   └── disaster-response-flow.md
│
├── .env.example
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Install:

- Node.js 18+
- npm
- Git

Clone the repository:

```bash
git clone https://github.com/KD799/ResQsense.git
cd ResQsense
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd ../backend
npm install
```

---

# ⚙️ Environment Variables

Create the required environment configuration based on `.env.example`.

Typical configuration may include:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

IMD_API_KEY=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

PORT=5000
```

> Never commit real API keys, passwords, tokens, or service credentials to GitHub.

---

# ▶️ Running the Application

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Then open the local development URL displayed by Vite.

---

# 🔌 API Integration Philosophy

RESQSENSE uses an adapter-based approach for external services.

Instead of tightly coupling the entire application to a single provider:

```text
                Weather Service
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
        IMD                  Fallback API
          │                       │
          └───────────┬───────────┘
                      ▼
               Normalized Data
                      │
                      ▼
              RESQSENSE Engine
```

This allows the platform to continue operating with cached or fallback information when an external service becomes temporarily unavailable.

The UI should clearly distinguish between:

- LIVE
- CACHED
- DEMO
- OFFLINE

data states.

---

# 🌐 Global Architecture

Although the initial disaster-response implementation focuses on India and uses IMD as an authoritative meteorological source, the core RESQSENSE architecture is intended to remain location-independent.

The system can use:

- GPS coordinates.
- Manually selected locations.
- Global map data.
- Region-specific weather providers.
- Region-specific disaster information sources.

Therefore, GPS is an optional enhancement rather than a requirement for opening or using the dashboard.

---

# 📊 Key Performance Indicators

RESQSENSE can evaluate disaster-response performance using metrics such as:

- Detection-to-verification time.
- Verification-to-assignment time.
- Assignment-to-response time.
- Average rescue-team ETA.
- Number of critical incidents resolved.
- Incident confidence.
- Priority distribution.
- Rescue-team readiness.
- Resource utilization.
- Duplicate/false report rate.

---

# 🧪 Development & Testing

Testing should cover:

- Emergency SOS submission.
- Chatbot data collection.
- Priority calculation.
- Incident validation.
- Duplicate detection.
- Rescue-team matching.
- Resource allocation.
- Role-based dashboards.
- Map rendering without GPS.
- GPS-enabled location features.
- Offline report queue.
- Reconnection and synchronization.
- API failure and fallback behavior.
- Notification delivery.
- Authentication and authorization.

---

# 🔮 Future Scope

Future versions of RESQSENSE can include:

- AI-assisted incident classification.
- Satellite and remote-sensing data.
- Computer-vision based damage assessment.
- Advanced flood and landslide risk modelling.
- IoT-based disaster sensors.
- Drone-assisted rescue coordination.
- Predictive resource positioning.
- Advanced route optimization.
- Multi-language emergency chatbot.
- Integration with additional government emergency systems.
- Real-time responder tracking.
- Advanced geospatial analytics.

---

# ⚠️ Important Disclaimer

RESQSENSE is a disaster-response coordination prototype intended to support situational awareness and emergency coordination.

The platform's automated scores, recommendations, weather information, and risk indicators should not be treated as a substitute for official emergency instructions or decisions made by competent government authorities and emergency-response organizations.

For actual emergencies, users should follow official emergency instructions and contact the appropriate emergency services.

---

# 🤝 Contribution

Contributions, suggestions, and improvements are welcome.

```bash
git checkout -b feature/your-feature
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

Please maintain clear commit messages and document significant architectural changes.

---

# 📄 License

This project is currently developed as a student/hackathon project.

The licensing terms should be finalized by the project owners before public production or commercial distribution.

---

# 👨‍💻 Project

**RESQSENSE**  
Smart Disaster Management & Emergency Response Platform

GitHub Repository:

[github.com/KD799/ResQsense](https://github.com/KD799/ResQsense.git?utm_source=chatgpt.com)

---

### Core Concept

> **Detect → Validate → Prioritize → Assign → Rescue**

RESQSENSE aims to transform fragmented disaster reporting into a coordinated, data-driven emergency response workflow.
