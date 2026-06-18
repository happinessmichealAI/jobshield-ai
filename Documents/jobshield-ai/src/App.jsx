import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Analyze from './pages/Analyze';
import Result from './pages/Result';
import Compare from './pages/Compare';
import Tracker from './pages/Tracker';
import Dashboard from './pages/Dashboard';
import Recruiter from './pages/Recruiter';
import Offer from './pages/Offer';
import Interview from './pages/Interview';
import EmailScan from './pages/EmailScan';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recruiter" element={<Recruiter />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/email-scan" element={<EmailScan />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// Made with Bob
