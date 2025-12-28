import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="hero">
        <h1>Method-AI Voice Actor</h1>
        <p className="subtitle">
          A Gemini-powered rehearsal engine that transforms text into distinct character voices
        </p>
        <div className="features">
          <div className="feature-card">
            <h3>🎭 Character Rewriting</h3>
            <p>Use AI to rewrite text in different character voices and styles</p>
          </div>
          <div className="feature-card">
            <h3>🗣️ Voice Synthesis</h3>
            <p>Convert text to speech with ElevenLabs' premium voices</p>
          </div>
          <div className="feature-card">
            <h3>🎬 Dialogue Generation</h3>
            <p>Generate authentic character dialogue for any scenario</p>
          </div>
        </div>
        <div className="cta-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/studio')}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
