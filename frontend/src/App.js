import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import NeuroNavDashboard from './components/NeuroNavDashboard';
import GameDashboard from './components/GameDashboard'; // Import the GameDashboard component
import SetupPage from './components/SetupPage';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/neuronavdashboard" element={<NeuroNavDashboard />} />
          <Route path="/games" element={<GameDashboard />} /> {/* Add GameDashboard route */}
          <Route path="/setpage" element={<SetupPage/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
