AI-Native Fleet Operations Assistant
An intelligent, full-stack web application designed for small and mid-size trucking companies. This project serves as a smart copilot for dispatchers and drivers, helping to optimize routing, improve safety, and accelerate revenue cycles.

Built for the Trucker Path "Marketplace & Growth" hackathon track.

Features
Smart Dispatch: Real-time fleet tracking map coupled with an AI matching algorithm that auto-assigns new loads based on driver proximity, weather, and Hours of Service (HOS).
Proactive Safety Alerts: Automatic UI notifications for suspicious idle times and sudden decelerations, alongside a "Driver SOS" button for emergencies.
Automated Billing: A driver portal for immediate post-delivery document upload (BOLs, PODs), which triggers our backend to automatically generate invoice templates and accelerate cash flow.
Tech Stack
Frontend: React, Vite, Tailwind CSS, React-Leaflet
Backend: Node.js, Express.js
Database: SQLite (managed via Prisma ORM)
Project Structure
/backend - The Node.js and Express backend server, including routes, mock DB seeding, and Prisma schema.
/prototype - The React and Vite frontend application, including the dispatcher dashboard and driver portal views.
Running the Project Locally
To run this application, you will need to open two separate terminal windows (one for the backend and one for the frontend).

1. Start the Backend Server
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Seed the SQLite database with starting data
npm run seed

# Start the Express server
npm start
(The backend runs on localhost:3000 by default)

2. Start the Frontend Application
In a new terminal window:

# Navigate to the frontend directory
cd prototype

# Install dependencies
npm install

# Start the development server
npm run dev
3. View the App
Once the frontend finishes compiling, navigate to http://localhost:5173/ in your web browser.

Use the Dispatcher Dashboard to view the live fleet map and test the AI-matching load assignment.
Navigate to the Driver Portal to test file uploading and the driver SOS features.
