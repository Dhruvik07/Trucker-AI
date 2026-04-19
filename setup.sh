#!/bin/bash

# Navigate to the workspace directory
cd /home/vijay/git/globehack

# Create the Vite React app
echo "Creating Vite React app in ./prototype..."
npx -y create-vite@latest prototype --template react

# Navigate into the project
cd prototype

# Install core dependencies
echo "Installing base dependencies..."
npm install

# Install necessary UI and map libraries
echo "Installing lucide-react, react-leaflet, leaflet..."
npm install lucide-react react-leaflet leaflet

echo ""
echo "========================================================="
echo "Setup complete! The Vite project is ready in ./prototype."
echo "Please let me know once you have run this script,"
echo "so I can proceed to write the React application files."
echo "========================================================="
