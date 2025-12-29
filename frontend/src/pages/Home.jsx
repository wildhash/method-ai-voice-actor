import { useNavigate } from 'react-router-dom';
import './Home.css';

const AFFILIATE_LINK = 'https://try.elevenlabs.io/ynnoa7cat7j9';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="hero">
        <h1>Method-AI Voice Actor</h1>
        <p className="subtitle">
          A Gemini-powered rehearsal engine that transforms text into distinct character voices
        </p>
        
        {/* Free tier badge */}
        <div className="free-tier-badge">
          ✨ <strong>10 free voice generations daily</strong> — no sign-up required!
        </div>

        <div className="features">
          <div className="feature-card">
            <h3>🎭 Character Rewriting</h3>
            <p>Use AI to rewrite text in different character voices and styles</p>
          </div>
          <div className="feature-card">
            <h3>🗣️ Voice Synthesis</h3>
            <p>Convert text to speech with ElevenLabs&apos; premium voices</p>
          </div>
          <div className="feature-card">
            <h3>🎬 Dialogue Generation</h3>
            <p>Generate authentic character dialogue for any scenario</p>
          </div>
        </div>

        <div className="cta-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/method')}
          >
            Try Method Studio
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/studio')}
          >
            Classic Studio
          </button>
        </div>

        {/* Affiliate section */}
        <div className="affiliate-section">
          <p className="affiliate-text">
            Need more than 10 daily generations? Get your own ElevenLabs API key:
          </p>
          <a 
            href={AFFILIATE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="affiliate-link"
          >
            Get ElevenLabs API Key →
          </a>
          <p className="affiliate-note">
            (Using this link supports Method-AI development 💜)
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
