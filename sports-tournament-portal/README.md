# 🏆 SportsPro – Sports Tournament Management Portal

An interactive, responsive single-page web application (SPA) built with **React 18**, **Vite**, **React Router v6**, **Lucide Icons**, and a **JSON Server REST API**.

Developed for managing sports tournaments, registered teams, player rosters, match schedules, live match results, and dynamic points tables / standings.

---

## 🌟 Key Features

### 1. 📊 Interactive Dashboard
- Real-time stat cards tracking:
  - Total Tournaments, Teams, Players, and Matches
  - Ongoing Tournaments, Completed Matches, and Upcoming Matches
  - Recorded Results count
  - Click-through navigation from any metric card directly to its management page
- Quick action shortcuts to register tournaments, teams, matches, and results
- Recent Results feed displaying match scores, winners, and remarks
- Upcoming match fixtures timeline with date badges and venue details
- Live standings / points table quick banner

### 2. 🏅 Tournament Management
- **List Tournaments**: Full search by name, multi-filter by Sport (Cricket, Football, Basketball, Tennis, etc.) and Status (Upcoming, Ongoing, Completed)
- **Create & Edit**: Tournament creation with comprehensive form validation (start/end date logic, required fields)
- **Tournament Details Hub**:
  - Live **Points Table & Standings** with ranks (🥇, 🥈, 🥉), Played, Won, Drawn, Lost, Differential, and Points
  - **Participating Teams** roster with coach, captain, and squad counts
  - **Fixtures & Schedule** with instant "Record Result" action shortcuts
  - **Overview** metadata with status badge and dates

### 3. 👥 Team Management
- **Team Registry**: View all teams with sports, tournament associations, coach, captain, and city
- **Live Squad Counts**: Displays player counts per team in real-time
- **Team Details View (`/teams/:id`)**:
  - Head Coach, Captain, City, Registration Date, and linked Tournament
  - Squad Size, Matches Scheduled, and Record (W-D-L)
  - Full player roster table with jersey numbers, positions, and contacts
  - Match history and upcoming fixtures for this team

### 4. 🏃 Player Management
- Register players with full details: Name, Age, Gender, Sport, Team, Position, Jersey Number, Email, and Phone
- Auto-syncs player sport with the selected team's sport
- Filters teams by selected sport during registration
- Search players by name and filter by team and sport

### 5. 📅 Match Scheduling
- Schedule matches between teams within the same tournament
- Team selection dynamically filters to teams in the chosen tournament and prevents scheduling a team against itself
- Date, Time, Venue, and Status tracking (Scheduled, In Progress, Completed)
- Quick "Record Result" medal shortcut button on pending matches

### 6. 🥇 Match Results & Scoring
- Record scores for completed matches (`teamAScore` vs `teamBScore`)
- Auto-evaluates winner or draw based on scores with live visual feedback
- Adds match remarks and timestamps
- Pre-selection support via query parameter (`/results/new?matchId=mX`) from Match Schedule or Tournament Details
- Automatically updates match status to **Completed** upon recording results

### 7. 📈 Live Standings & Points Table (`/standings`)
- Dedicated competition leaderboard page
- Switch between tournaments with a single dropdown
- Calculates points (Win = 3, Draw = 1, Loss = 0), Goal/Score differential, and rank ordering
- Highlights tournament leader, total scores, and competition completion progress

### 8. 🛡️ Form Validation & Error Handling
- Robust client-side validation for all forms (dates, numbers, email format, duplicate match results)
- Inline field errors and visual hints
- Confirm dialogs before performing destructive deletes
- Toast / alert banners for successful creations and updates

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **React 18** | UI component architecture & state management (`useState`, `useEffect`, custom hooks) |
| **Vite 5** | High-performance build tool & local development server |
| **React Router v6** | Client-side routing with nested paths and parameter handling |
| **JSON Server** | Full REST API backend simulating a real database (`db.json`) |
| **Lucide React** | Clean, modern vector icons for sports, navigation, and actions |
| **CSS3** | Modern vanilla CSS with CSS variables, Flexbox, CSS Grid, and responsive breakpoints |

---

## 📁 Project Structure

```text
sports-tournament-portal/
├── public/
│   └── trophy.svg             # Application favicon
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ConfirmDialog.jsx  # Reusable confirmation modal for deletions
│   │   ├── ErrorMessage.jsx   # Error alert with retry button
│   │   ├── Loading.jsx        # Loading spinner with message
│   │   ├── Navbar.jsx         # Top navigation bar with breadcrumbs
│   │   ├── SearchBar.jsx      # Reusable search input component
│   │   ├── Sidebar.jsx        # Responsive navigation sidebar
│   │   └── StatCard.jsx       # Interactive metric card component
│   ├── hooks/
│   │   └── useFetch.js        # Custom hook for data fetching & caching
│   ├── pages/                 # Route views & form pages
│   │   ├── Dashboard.jsx      # Overview dashboard
│   │   ├── Tournaments.jsx    # Tournaments table & filters
│   │   ├── TournamentForm.jsx # Add / Edit tournament
│   │   ├── TournamentDetails.jsx # Comprehensive tournament hub
│   │   ├── Teams.jsx          # Teams table & filters
│   │   ├── TeamForm.jsx       # Register / Edit team
│   │   ├── TeamDetails.jsx    # Team profile, squad roster & fixtures
│   │   ├── Players.jsx        # Players table & filters
│   │   ├── PlayerForm.jsx     # Add / Edit player
│   │   ├── Matches.jsx        # Match schedule & status tracking
│   │   ├── MatchForm.jsx      # Schedule / Edit match
│   │   ├── Results.jsx        # Results table & score cards
│   │   ├── ResultForm.jsx     # Record / Edit match result
│   │   ├── Standings.jsx      # Live points table & leaderboard
│   │   └── NotFound.jsx       # 404 page
│   ├── services/
│   │   └── api.js             # Centralized API service layer for JSON Server
│   ├── styles/                # Modular stylesheets
│   │   ├── dashboard.css      # Dashboard & stat card layouts
│   │   ├── forms.css          # Form inputs, labels, grids & detail cards
│   │   ├── layout.css         # Shell, sidebar, navbar & breadcrumbs
│   │   └── tables.css         # Tables, controls, search bar & pagination footer
│   ├── utils/
│   │   ├── formatters.js      # Date, time, status badge formatters
│   │   └── validation.js      # Schema validators for all entities
│   ├── App.jsx                # Application routes and main shell
│   ├── index.css              # Global styles, theme variables, reset & badges
│   └── main.jsx               # React DOM root entry
├── db.json                    # Mock database with tournaments, teams, players, matches, results
├── index.html                 # HTML entry point with Inter font & favicon
├── package.json               # Dependencies & scripts
└── vite.config.js             # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Installation
In the `sports-tournament-portal` directory, install all required dependencies:
```bash
npm install
```

### 2. Start the Backend API (JSON Server)
In a terminal, run the mock REST API server:
```bash
npm run server
```
The REST API will be running at `http://localhost:3000`.

### 3. Start the Frontend (Vite Dev Server)
In another terminal, start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to the local URL displayed (default: `http://localhost:5173`).

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```
Built static files will be generated in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 📡 REST API Endpoints

The JSON Server exposes the following REST endpoints on `http://localhost:3000`:

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| **Tournaments** | `GET` | `/tournaments` | List all tournaments |
| | `GET` | `/tournaments/:id` | Get tournament by ID |
| | `POST` | `/tournaments` | Create a tournament |
| | `PUT` | `/tournaments/:id` | Update tournament |
| | `DELETE`| `/tournaments/:id` | Delete tournament |
| **Teams** | `GET` | `/teams` | List all teams |
| | `GET` | `/teams/:id` | Get team by ID |
| | `POST` | `/teams` | Register a new team |
| | `PUT` | `/teams/:id` | Update team details |
| | `DELETE`| `/teams/:id` | Delete team |
| **Players** | `GET` | `/players` | List all players |
| | `GET` | `/players/:id` | Get player by ID |
| | `POST` | `/players` | Add a new player |
| | `PUT` | `/players/:id` | Update player |
| | `DELETE`| `/players/:id` | Delete player |
| **Matches** | `GET` | `/matches` | List all matches |
| | `GET` | `/matches/:id` | Get match by ID |
| | `POST` | `/matches` | Schedule a match |
| | `PUT` | `/matches/:id` | Update match details |
| | `DELETE`| `/matches/:id` | Delete match |
| **Results** | `GET` | `/results` | List all match results |
| | `GET` | `/results/:id` | Get result by ID |
| | `POST` | `/results` | Record match result |
| | `PUT` | `/results/:id` | Update match result |
| | `DELETE`| `/results/:id` | Delete match result |

---

## 🎨 UI & Responsive Design
- Clean and modern sports-themed aesthetic with dark navy sidebar (`#0f172a`), royal blue accents (`#1a56db`), and crisp typography using the **Inter** font family.
- Fully responsive across desktop, tablet, and mobile devices:
  - Collapsible drawer sidebar on mobile with hamburger toggle
  - Flex and grid layouts that smoothly adapt to smaller screen sizes
  - Touch-friendly action buttons and inputs
