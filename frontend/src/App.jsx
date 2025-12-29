import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Home from './pages/Home';
import Studio from './pages/Studio';
import MethodStudio from './pages/MethodStudio';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <nav className="navbar">
            <Link to="/" className="nav-brand">Method-AI</Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/method" className="nav-link">Method Studio</Link>
              <Link to="/studio" className="nav-link">Classic Studio</Link>
            </div>
          </nav>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/method" element={<MethodStudio />} />
            <Route path="/studio" element={<Studio />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
