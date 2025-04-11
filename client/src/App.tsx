import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Screenshot from './pages/Screenshot';
import WebSearch from './pages/WebSearch';
import GoogleAnalytics from './pages/GoogleAnalytics';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Screenshot />} />
            <Route path="/screenshot" element={<Screenshot />} />
            <Route path="/websearch" element={<WebSearch />} />
            <Route path="/google-analytics" element={<GoogleAnalytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
