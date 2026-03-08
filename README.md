A standalone vanilla chatbot interface with a Node.js/Express backend that proxies requests to the Google Gemini API.

🚀 Quick Start
1. Prerequisite: API Key
You must have a Google Gemini API Key.

Get one at aistudio.google.com
2. Setup & Installation
bash

# Clone the repository (if you haven't)
git clone https://github.com/Jammysk8/chatbot-maria.git
cd chatbot-maria
# Install dependencies
npm install
3. Configuration
Create a .env file in the root directory:

bash
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key_here" > .env
(Note: I configured server.js to look for this file in the project root.)

4. Run the Application
You need to run two processes (Backend & Frontend):

Terminal 1 (Backend Server):
bash
node server.js
# Runs on http://localhost:3005
Terminal 2 (Frontend Interface):
bash
# Use any static server, e.g., serve
npx serve -l 3000 .
# Runs on http://localhost:3000
🛠 Tech Stack
Frontend: Vanilla HTML5, CSS3 (Glassmorphism), JavaScript (ES6)
Backend: Node.js, Express, CORS AI: Gemini 2.0 Flash (@google/generative-ai)

⚠️ Troubleshooting
Port Conflicts: If port 3005 or 3000 is busy, change the port variable in  server.js and the fetch URL in script.js
API Error: Ensure your API key is valid and you have a stable internet connection.
