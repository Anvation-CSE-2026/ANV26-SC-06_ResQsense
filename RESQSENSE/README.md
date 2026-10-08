# RESQSENSE — Smart Disaster Response & Coordination Platform

A hackathon-ready global disaster response MVP connecting Citizens, Rescue Teams (NGO/Government), and Admin Control Rooms.

## Core flow

Detect → Validate → Prioritize → Assign → Rescue

## Features

- Three dashboards: Citizen, Rescue Team, Admin
- Mandatory live map on all dashboards
- GPS is optional; dashboard/map never depends on GPS permission
- Manual location search/selection
- Five-question emergency chatbot
- Deterministic priority scoring
- Confidence scoring
- Nearby rescue-team matching
- Resource and manpower recommendations
- Incident lifecycle tracking
- Weather adapter with mock fallback
- Real-time-ready architecture
- Demo SMS notification mode
- Responsive emergency UI

## Run

Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Open:
http://localhost:5173

API:
http://localhost:5000/api/health

## Demo

Choose Citizen, Rescue Team, or Admin from the role switcher.

The included data is illustrative demo data. Do not use demo contact numbers for real emergencies.

## Production extensions

Connect PostgreSQL/PostGIS, Socket.IO, a real weather provider, official disaster feeds, SMS provider, authentication, and verified rescue organizations before real-world deployment.
