import { useState } from 'react';
import { PERSONAS, getPersonasArray } from '../personas';
import api from '../services/api';
import './MethodStudio.css';

function MethodStudio() {
  // State Management
  const [inputText, setInputText] = useState('');
  const [script, setScript] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('noir_detective');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const personas = getPersonasArray();
  const currentPersona = PERSONAS[selectedPersona];

  // The REHEARSE button handler
  const handleRehearsal = async () => {
    if (!inputText || !selectedPersona) return;

    setLoading(true);
    setScript('');
    setAudioUrl(null);

    try {
      // Call the /api/perform endpoint
      const response = await api.post('/perform', {
        text: inputText,
        personaKey: currentPersona.systemPrompt
      });

      const generatedScript = response.data.script;
      setScript(generatedScript);

      // Automatically trigger ElevenLabs TTS
      await synthesizeSpeech(generatedScript);
    } catch (error) {
      console.error('Failed to perform rehearsal:', error);
      alert('Failed to perform rehearsal. Please check your API configuration and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Synthesize speech using ElevenLabs
  const synthesizeSpeech = async (text) => {
    try {
      const response = await api.post('/voice/synthesize', {
        text,
        voiceId: currentPersona.elevenLabsVoiceId
      }, {
        responseType: 'blob'
      });

      const url = URL.createObjectURL(response.data);
      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to synthesize speech:', error);
      // Don't throw - we want to show the text even if audio fails
    }
  };

  return (
    <div className="method-studio">
      <div className="method-studio-container">
        <h1>Method AI - The Rehearsal Engine</h1>
        <p className="subtitle">Transform any text into character performances</p>

        <div className="three-column-layout">
          {/* Left Column: The Script */}
          <div className="column script-column">
            <div className="column-header">
              <h2>📜 The Script</h2>
              <p>Paste your raw text here</p>
            </div>
            <div className="column-content">
              <textarea
                className="script-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here... (documentation, scripts, manuals, or any text you want to transform)"
                rows={20}
              />
            </div>
          </div>

          {/* Center Column: The Director's Chair */}
          <div className="column director-column">
            <div className="column-header">
              <h2>🎬 The Director&apos;s Chair</h2>
              <p>Choose your persona</p>
            </div>
            <div className="column-content">
              <div className="persona-selector">
                <label htmlFor="persona-select">Select Persona:</label>
                <select
                  id="persona-select"
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  className="persona-dropdown"
                >
                  {personas.map((persona) => (
                    <option key={persona.key} value={persona.key}>
                      {persona.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="persona-info">
                <h3>Character Description:</h3>
                <p className="persona-description">
                  {currentPersona.systemPrompt}
                </p>
              </div>

              <button
                className="rehearse-btn"
                onClick={handleRehearsal}
                disabled={loading || !inputText}
              >
                {loading ? '🎭 PERFORMING...' : '🎭 REHEARSE'}
              </button>

              {loading && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>Method acting in progress...</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: The Performance */}
          <div className="column performance-column">
            <div className="column-header">
              <h2>🎤 The Performance</h2>
              <p>Generated character script</p>
            </div>
            <div className="column-content">
              <textarea
                className="performance-textarea"
                value={script}
                readOnly
                placeholder="The rewritten text in character will appear here..."
                rows={20}
              />

              {audioUrl && (
                <div className="audio-player-section">
                  <h3>🔊 Audio Performance</h3>
                  <audio controls src={audioUrl} className="audio-player">
                    Your browser does not support the audio element.
                  </audio>
                  <a href={audioUrl} download="performance.mp3" className="download-btn">
                    Download Audio
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MethodStudio;
