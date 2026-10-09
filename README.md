# RESQSENSE — Smart Disaster Management & Response Platform



---

## 📌 About the Project

RESQSENSE is a smart disaster management and response platform designed to improve coordination between citizens, government authorities, NGOs, and rescue teams during natural disasters.

The platform aims to collect disaster reports, use external data sources to support disaster awareness, prioritize incidents based on urgency, and help authorities coordinate rescue operations more efficiently.

### 🎯 Problem Statement

During natural disasters, communication gaps between affected people and rescue organizations can delay emergency assistance. Information may be scattered across different channels, reports can be difficult to verify, and rescue resources may not reach the highest-priority incidents quickly enough.

### 💡 Our Solution

RESQSENSE provides a centralized platform to:

* Allow citizens to submit disaster and emergency reports.
* Display incident locations on an interactive map.
* Provide disaster-related information and chatbot assistance.
* Integrate weather and other relevant disaster data sources.
* Support incident verification and explainable priority scoring.
* Help administrators coordinate and assign rescue teams.
* Track rescue missions and incident status.

**Project workflow:** Detect → Validate → Prioritize → Assign → Rescue → Resolve

---

## 🌐 Live Deployment

**Live application:** https://res-qsense-mu.vercel.app/

**Source code:** https://github.com/Anvation-CSE-2026/ANV26-SC-06_ResQsense

The deployed application is hosted on Vercel. Features that require API credentials, backend configuration, or database setup may need additional configuration to work fully.

---

## 👥 User Roles

### 1. Citizen / User

* Submit disaster reports with location and incident details.
* View relevant incidents on a map.
* Access disaster awareness and safety information.
* Use chatbot assistance for general guidance.
* Receive relevant alerts when configured.

### 2. Admin / Government Authority

* Review and validate incoming reports.
* Monitor incidents and their priority levels.
* Coordinate available rescue teams.
* Assign and track rescue missions.
* Monitor incident status and response progress.

### 3. Rescue Team / NGO

* View assigned rescue missions.
* Access incident details and locations.
* Update mission status.
* Report progress and completion.
* Coordinate with the administration.

---

## ✨ Key Features

* **Incident reporting:** Collect structured information about emergencies.
* **Interactive mapping:** Display incident locations and support location-based awareness.
* **Priority scoring:** Use explainable rules to help identify urgent incidents.
* **Disaster information:** Present safety guidance and useful information.
* **Chatbot assistance:** Help users navigate information and reporting.
* **Weather integration:** Support disaster awareness using configured weather data sources.
* **Role-based dashboards:** Provide separate interfaces for citizens, administrators, and rescue teams.
* **Rescue coordination:** Support assignment and tracking of response missions.
* **Notifications:** Enable alerts when the required notification services are configured.
* **Offline resilience:** Future improvements can support locally queued reports and synchronization after connectivity returns.

*Note: The availability of each feature depends on the current implementation and configuration.*

---

## 🛠️ Technology Stack

| Component                     | Technology                                                   |
| ----------------------------- | ------------------------------------------------------------ |
| Frontend                      | React                                                        |
| Language                      | JavaScript or TypeScript, depending on project configuration |
| Database and backend services | Supabase                                                     |
| Authentication                | Supabase Auth, if configured                                 |
| Database                      | PostgreSQL through Supabase                                  |
| Maps                          | Mapbox or another configured mapping provider                |
| Deployment                    | Vercel                                                       |
| Version control               | Git and GitHub                                               |
| External data                 | Configured weather and disaster data APIs                    |

---

## 🏗️ System Workflow

1. **Detect:** A citizen submits an incident report, or a configured data source provides a relevant alert.
2. **Validate:** The report is checked for completeness, duplication, credibility, and other applicable validation rules.
3. **Prioritize:** A transparent scoring mechanism estimates incident urgency using relevant factors.
4. **Assign:** An authorized administrator coordinates an appropriate rescue team.
5. **Rescue:** The assigned team responds and updates mission progress.
6. **Resolve:** The incident is marked resolved after the appropriate confirmation.

### Priority Scoring

A rule-based priority score can consider factors such as:

* Number of people affected.
* Severity of the reported emergency.
* Immediate risk to life.
* Accessibility and location.
* Availability of rescue resources.
* Reliability and confirmation status of the report.

The scoring rules and thresholds should be documented and validated before operational use. Automated scores should assist human decision-makers rather than replace emergency authorities.

---

## 🗄️ Database Design

The following tables are a proposed design for Supabase. Adapt them to the actual database schema in the repository.

| Table                  | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `profiles`             | User profiles and roles                          |
| `organizations`        | Government bodies, NGOs, and other organizations |
| `rescue_teams`         | Rescue team details and availability             |
| `incidents`            | Disaster and emergency reports                   |
| `incident_media`       | Photos or other incident attachments             |
| `incident_sources`     | Source and verification information              |
| `missions`             | Rescue assignments and progress                  |
| `resources`            | Available equipment and resources                |
| `alerts`               | Disaster alerts and warnings                     |
| `notifications`        | User notification records                        |
| `emergency_contacts`   | Relevant emergency contact information           |
| `disaster_information` | Safety guidance and awareness content            |

---

## 🔐 Security and Reliability

* Use Supabase Authentication for user identity where configured.
* Apply Row Level Security (RLS) to protect database records.
* Restrict administrative actions to authorized roles.
* Validate user input before storing or processing reports.
* Keep private API keys and service-role credentials out of frontend code.
* Request browser location permission before accessing the user's location.
* Provide an appropriate fallback when location permission is denied.
* Clearly distinguish unverified reports from confirmed incidents.
* Do not rely solely on automated scores for life-critical decisions.

---

## 🚀 Getting Started

### Prerequisites

Install the following tools:

* [Node.js](https://nodejs.org/)
* npm
* [Git](https://git-scm.com/)
* A Supabase project, if required by the current application configuration

### 1. Clone the Repository

```bash
git clone https://github.com/Anvation-CSE-2026/ANV26-SC-06_ResQsense.git
```

### 2. Navigate to the Project

```bash
cd ANV26-SC-06_ResQsense
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root if the application uses these variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

Replace the example values with your actual project credentials. Include only the variables required by your implementation.

**Important:** Never put a Supabase service-role key, private API key, or other server-side secret in a frontend environment variable. Variables prefixed with `VITE_` are exposed to browser-side code.

### 5. Configure Supabase

1. Create or open your Supabase project.
2. Configure the database tables and relationships required by the application.
3. Enable and configure authentication if needed.
4. Apply appropriate Row Level Security policies.
5. Add the project URL and public client key to your local environment.

### 6. Start the Development Server

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal, usually `http://localhost:5173`.

If a command is unavailable, check the scripts defined in `package.json`.

### 7. Build for Production

```bash
npm run build
```

To preview the production build locally, if the project supports it:

```bash
npm run preview
```

---

## 📂 Project Structure

A suggested React project structure is shown below. The actual folders may differ depending on the current repository.

```text
ANV26-SC-06_ResQsense/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── CitizenDashboard/
│   │   ├── AdminDashboard/
│   │   └── RescueDashboard/
│   ├── layouts/
│   ├── services/
│   │   ├── supabase.js
│   │   ├── incidents.js
│   │   └── notifications.js
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🌦️ Potential External Integrations

Depending on the implementation, RESQSENSE can integrate with:

* Weather forecast and observation APIs.
* Official disaster alerts and public safety information sources.
* Mapping and geolocation services.
* SMS or other notification gateways.
* Supabase Realtime for live updates.

External data should be validated and its source and timestamp retained where appropriate. API integration does not itself guarantee that a disaster report is accurate.

---

## 🔮 Future Enhancements

* Offline-first reporting with automatic synchronization.
* Improved duplicate-report detection.
* More robust incident verification.
* Live rescue-team location sharing with appropriate consent.
* Resource availability and route planning.
* Multilingual chatbot and emergency guidance.
* Integration with verified government alert sources.
* Analytics for incident trends and response performance.
* Automated testing, monitoring, and audit logs.

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your changes with a descriptive message.
5. Push the branch and open a pull request.

---

## 📤 Git Commands

### If You Are Cloning the Existing Repository

```bash
git clone https://github.com/Anvation-CSE-2026/ANV26-SC-06_ResQsense.git
cd ANV26-SC-06_ResQsense
git pull origin main
```

### If You Have Already Cloned the Repository

After updating `README.md`, run:

```bash
git status
git add README.md
git commit -m "docs: update README with deployment and setup instructions"
git push origin main
```

If your default branch is not `main`, replace `main` with the correct branch name.

### If Your Local Project Is Not Connected to the Repository

Run these commands from the root of your existing project. Only use `git init` if the folder is not already a Git repository.

```bash
git init
git branch -M main
git remote add origin https://github.com/Anvation-CSE-2026/ANV26-SC-06_ResQsense.git
git add .
git commit -m "chore: initialize RESQSENSE project"
git push -u origin main
```

If `origin` already exists, do not add it again. Check the existing remote with:

```bash
git remote -v
```

If you need to change it, use:

```bash
git remote set-url origin https://github.com/Anvation-CSE-2026/ANV26-SC-06_ResQsense.git
```



---

## 📜 License

Add the license selected by the project maintainers. Until one is specified, the project's license status should be considered unspecified.

---


---

**RESQSENSE — Connecting communities with coordinated disaster response.**
