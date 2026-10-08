Dev Bhoomi: Himachal Tourism & Algorithmic Concierge
An interactive, machine-learning-powered tourism portal for Himachal Pradesh. This platform serves as an official-grade registry for Himalayan heritage, offering a verified ML journey optimizer, live transit telemetry mapped via OpenStreetMap, and a comprehensive geographic directory of the 12 mountain realms.

Live Demo: [Insert Vercel URL Here]

Backend API: [Insert Render URL Here]

✨ Key Features
🗺️ The 12 Realms Registry: Deep dive into the history, dialects, indigenous cooperatives, and safety protocols of every district in Himachal Pradesh.

🤖 Journey Optimizer Engine: A Scikit-Learn Machine Learning model (RandomForestRegressor) that predicts accurate trip costs, lodging constraints, and contingency reserves based on origin, destination, days, and budget constraints.

🛣️ Open Highway Telemetry: Real-time mountain routing calculating actual road distances, driving times, and carrier tariffs between any points in the state. Rendered dynamically using Leaflet.

🛡️ Emergency Command Grid: Essential safety regulations, winter transit rules, environmental protection protocols, and direct state disaster management hotlines.

🎖️ Hall of Fame: A dedicated repository honoring the defenders and pioneers of the state, including Param Vir Chakra recipients and Olympic champions.

🛠️ Tech Stack
Frontend:

React.js (Vite)

Leaflet & React-Leaflet (Interactive mapping)

Custom CSS (UI/UX designed for desktop & mobile)

Deployed on Vercel

Backend:

Python 3 & Flask

Flask-SQLAlchemy (Database management)

Scikit-Learn, Pandas, NumPy (Machine Learning & Data Processing)

Gunicorn (WSGI HTTP Server)

Deployed on Render

🚀 Local Installation & Setup
To run this project locally on your machine, you will need Node.js and Python installed.

1. Clone the Repository
Bash
git clone https://github.com/Shivam6453/hp_trip_maker.git
cd hp_trip_maker
2. Backend Setup
Navigate to the backend directory, create a virtual environment, install the dependencies, and start the Flask server.

Bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py
The backend will start on [http://127.0.0.1:5000](http://127.0.0.1:5000)

3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, install the Node packages, and start the Vite development server.

Bash
cd frontend
npm install
npm run dev
The frontend will start on http://localhost:5173 (or similar). Open this in your browser.

🧠 Machine Learning Architecture
The predictive features of this application (Trip Optimizer and Transit Tracker) are powered by offline Machine Learning models trained on historical HRTC and mountain transit data.

Algorithms Used: RandomForestRegressor

Optimization: The models are constrained with max_depth=12 and n_estimators=80 to minimize the serialized payload size (under 5MB) while retaining extreme accuracy for mountain terrain calculations, ensuring seamless deployment on cloud providers.

👨‍💻 Author
Shivam Kaundal

B.Tech, Engineering Physics @ NIT Hamirpur
