Act as an expert Full-Stack Developer and UI/UX Designer. I am participating in the Trucker Path hackathon under the "Marketplace & Growth" track. I need to build a live, demoable working prototype of an AI-native fleet operations assistant.

Please provide the complete, functional code for a web-based prototype (Frontend: React.js with Tailwind CSS, Backend: Node.js/Express, Database: SQLite or mocked JSON data for quick deployment). Break the code down file-by-file so I can easily run it locally.

Here are the core features the application must include:

1. Smart Dispatch & Live Map (Frontend & Logic)

Integrate a map interface (using a library like React-Leaflet or Google Maps API) showing the mock live locations of a fleet of trucks.

Include a "New Immediate Load" button. When clicked, the system should evaluate all available drivers.

Create a matching algorithm that ranks drivers from "Best" to "Worst" based on:

Distance to the dispatch location.

Mocked environmental factors (traffic, weather, speed limits).

Hours of Service (HOS) availability.

Driver specialty and workload (e.g., prioritizing drivers willing to do long-haul vs. short-haul based on the load type).

Display this ranked list in a clean UI side-panel next to the map.

2. Proactive Alerts & Safety Compliance (Event Listeners & UI Notifications)

Simulate a backend tracking system that monitors truck telemetry and pushes alerts to a dashboard notification center.

Create an alert logic for "Idle Warning": If a truck's status is "Active Shift" but its location hasn't changed for 15 minutes, trigger a UI alert advising the dispatcher to contact the driver.

Create an alert logic for "Accident Detection": If a truck's speed drastically decreases from 40+ km/h to 0 instantly, trigger an emergency UI alert.

Include a simulated "Driver App View" component with an "SOS / Mark as Stolen" button. When clicked, it should simulate sending a high-priority alert with live coordinates to the dispatcher dashboard, and log a mock message sent to the CEO and Police.

3. Billing & Document Automation (Forms & Template Generation)

Create a "Post-Delivery" module.

Build a simple driver-facing form where they can upload or check off required documents (BOLs, PODs, fuel receipts, and rate confirmations).

Once submitted, write a backend function that takes this data, merges it into an HTML invoice template, and simulates automatically sending it to a client's email to speed up cash flow.

Execution Plan:
Please provide:

The package.json dependencies needed.

The mock data structure (JSON) for drivers, trucks, and loads.

The backend Express routes and logic.

The React frontend components.

Clear instructions on how to start the development servers. Ensure the code is robust enough to be a workable prototype for a hackathon presentation.


PART 2: Project Requirements & Implementation ArchitectureTo ensure this prototype is structured correctly and meets the constraints of the Trucker Path "Marketplace & Growth" track, please adhere to the following Product Requirements Document (PRD) and implementation structure.1. Product Requirements Document (PRD)Objective:
Design and build a live, demoable AI-native fleet operations assistant. The solution must help dispatchers of small and mid-size trucking fleets (5-50 trucks) make smarter, faster decisions to reduce cost per mile and driver downtime.Target Audience:Primary: Fleet Dispatchers (Web Dashboard)Secondary: Fleet Drivers (Simulated Mobile App View)Core Modules to Implement:
As per the hackathon rules, this prototype addresses multiple key problem areas:Module A: Smart Dispatch (Area: Smart Dispatch) Requirement: A visual map displaying active trucks.Requirement: An algorithm that ranks available drivers for a new load based on distance, Hours of Service (HOS), mocked traffic/weather data, and driver specialties.Module B: Proactive Alerts & Safety (Areas: Proactive Alerts, Safety & Compliance) Requirement: Automated alerts for anomalies (e.g., location stagnant for 15+ minutes while on an active shift, sudden deceleration indicating an accident).Requirement: A panic/SOS button on the driver interface to report a stolen vehicle, dispatching live coordinates.Module C: Billing & Document Automation (Area: Billing & Document Automation) Requirement: A portal for drivers to upload BOLs, PODs, fuel receipts, and rate confirmations.Requirement: Automated backend generation of an invoice template upon document submission.2. Implementation Details & ArchitecturePlease structure the full-stack application using the following directory and routing architecture.A. Frontend Architecture (React.js + React Router)Directory Structure:/src/components/ (Reusable UI elements like Buttons, Modals, MapCards)/src/pages/ (Main page views)/src/services/ (API call logic to backend)Routes (App.js):/ -> <Dashboard />: The main control center containing the live map, high-level metrics, and the incoming alert feed./dispatch -> <SmartDispatch />: The load-matching interface where the dispatcher enters load details and sees the AI-ranked list of available drivers./driver-portal -> <DriverAppView />: A simulated mobile-responsive view for the driver. Contains the "SOS/Mark Stolen" toggle and the Post-Delivery Document Upload form.B. Backend Architecture (Node.js + Express)Directory Structure:/controllers/ (Business logic for each route)/routes/ (Express route definitions)/data/ (Mock JSON database files)/utils/ (Helper functions like the matching algorithm and invoice generator)API Routes:Fleet Tracking:GET /api/fleet -> Returns the list of all trucks, current coordinates, speed, and driver HOS status.POST /api/fleet/alert -> Webhook to trigger an SOS, idle warning, or crash alert.Smart Match Algorithm:POST /api/dispatch/match -> Accepts origin/destination coordinates and load type. Returns a sorted array of drivers ranked from best to worst based on our custom algorithm.Billing & Docs:POST /api/billing/submit -> Accepts mock uploaded files (BOL, POD). Triggers the invoice generation utility and returns a success response with a link to the generated invoice.C. Database Schema (Mock JSON)Provide a mockDB.json file structured as follows:drivers: [{ id, name, specialty, hos_remaining, status }]trucks: [{ id, driver_id, lat, lng, speed, condition }]loads: [{ id, origin, destination, requirements, status }]3. Updated Execution PlanPlease output the code in the following order:Project Setup: Standard package.json configurations for both frontend and backend.Database: The mockDB.json file with sample data tailored to Tempe, Arizona (for localized map testing).Backend Services: The Express server setup, routing files, and the specific logic for the matching algorithm and invoice generator.Frontend Views: The React components, strictly following the routes outlined above.Run Instructions: Step-by-step commands to install dependencies and run both servers simultaneously for the live demo.