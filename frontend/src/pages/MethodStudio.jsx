import { useState, useEffect } from 'react';
import { PERSONAS, getPersonasArray } from '../personas';
import api from '../services/api';
import { getAllPersonas } from '../services/personaService';
import PersonaManager from './PersonaManager';
import './MethodStudio.css';

function MethodStudio() {
  // State Management
  const [inputText, setInputText] = useState('');
  const [script, setScript] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('noir_detective');
  const [deepRehearsal, setDeepRehearsal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [showPersonaManager, setShowPersonaManager] = useState(false);
  const [allPersonas, setAllPersonas] = useState(PERSONAS);

  const personas = getPersonasArray();
  const currentPersona = allPersonas[selectedPersona] || PERSONAS[selectedPersona];

  // Load all personas (default + custom) on mount
  useEffect(() => {
    loadAllPersonas();
  }, []);

  const loadAllPersonas = async () => {
    try {
      const fetchedPersonas = await getAllPersonas();
      // Ensure we have a valid object, not an array or null
      if (fetchedPersonas && typeof fetchedPersonas === 'object' && !Array.isArray(fetchedPersonas)) {
        setAllPersonas(fetchedPersonas);
      } else {
        console.warn('Invalid personas format received, using defaults');
        setAllPersonas(PERSONAS);
      }
    } catch (error) {
      console.error('Failed to load personas:', error);
      // Fall back to default personas
      setAllPersonas(PERSONAS);
    }
  };

  // Cleanup audio URL on unmount or when new audio is generated
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // The REHEARSE button handler
  const handleRehearsal = async () => {
    if (!inputText || !selectedPersona || !currentPersona) return;

    setLoading(true);
    setScript('');
    setAudioUrl(null);

    try {
      // Call the /api/gemini/perform endpoint
      const response = await api.post('/gemini/perform', {
        text: inputText,
        personaKey: currentPersona.systemPrompt,
        deepRehearsal: deepRehearsal
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
    if (!currentPersona || !currentPersona.elevenLabsVoiceId) {
      console.error('Cannot synthesize speech: persona or voice ID missing');
      return;
    }

    try {
      // Revoke previous audio URL to prevent memory leaks
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

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
                  {allPersonas && typeof allPersonas === 'object' && Object.entries(allPersonas).map(([key, persona]) => (
                    <option key={key} value={key}>
                      {persona?.label || key} {persona?.isCustom ? '⭐' : ''}
                    </option>
                  ))}
                </select>
                <button 
                  className="btn-manage-cast"
                  onClick={() => setShowPersonaManager(true)}
                  title="Manage personas"
                >
                  🎭 Manage Cast
                </button>
              </div>

              <div className="persona-info">
                <h3>Character Description:</h3>
                <p className="persona-description">
                  {currentPersona?.systemPrompt || 'Select a persona'}
                </p>
              </div>

              <div className="deep-rehearsal-toggle">
                <label className="toggle-container">
                  <input
                    type="checkbox"
                    checked={deepRehearsal}
                    onChange={(e) => setDeepRehearsal(e.target.checked)}
                  />
                  <span className="toggle-label">
                    🧠 Deep Rehearsal Mode
                  </span>
                </label>
                <p className="toggle-description">
                  {deepRehearsal 
                    ? "Using Gemini 3.0 Pro for highly analytical breakdown (slower but smarter)"
                    : "Using Gemini 3.0 Flash for fast performance (optimized for speed)"
                  }
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

        {/* Persona Manager Modal */}
        {showPersonaManager && (
          <PersonaManager
            personas={allPersonas}
            onPersonaCreated={(newPersona) => {
              // Reload all personas to get the updated list
              loadAllPersonas();
              // Optionally select the new persona
              setSelectedPersona(newPersona.id);
            }}
            onPersonaDeleted={(deletedId) => {
              // Reload all personas
              loadAllPersonas();
              // If the deleted persona was selected, switch to a default
              if (selectedPersona === deletedId) {
                setSelectedPersona('noir_detective');
              }
            }}
            onClose={() => setShowPersonaManager(false)}
          />
        )}
      </div>
    </div>
  );
}

export default MethodStudio;
