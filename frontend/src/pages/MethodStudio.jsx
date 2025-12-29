import { useState, useEffect, useRef } from 'react';
import { PERSONAS } from '../personas';
import api from '../services/api';
import { getAllPersonas } from '../services/personaService';
import { getVoices } from '../services/voiceService';
import PersonaManager from './PersonaManager';
import './MethodStudio.css';

function MethodStudio() {
  // Script & Rehearsal State
  const [script, setScript] = useState('');
  const [parsedLines, setParsedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userCharacter, setUserCharacter] = useState('');
  const [partnerCharacter, setPartnerCharacter] = useState('');
  const [detectedCharacters, setDetectedCharacters] = useState([]);
  
  // Persona & Voice State
  const [selectedPersona, setSelectedPersona] = useState('noir_detective');
  const [allPersonas, setAllPersonas] = useState(PERSONAS);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceOverride, setSelectedVoiceOverride] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [isRehearsing, setIsRehearsing] = useState(false);
  const [showPersonaManager, setShowPersonaManager] = useState(false);
  const [rehearsalHistory, setRehearsalHistory] = useState([]);
  
  const chatEndRef = useRef(null);
  const currentPersona = allPersonas[selectedPersona] || PERSONAS[selectedPersona];

  // Define load functions first
  const loadAllPersonas = async () => {
    try {
      const fetchedPersonas = await getAllPersonas();
      if (fetchedPersonas && typeof fetchedPersonas === 'object' && !Array.isArray(fetchedPersonas)) {
        setAllPersonas(fetchedPersonas);
      } else {
        setAllPersonas(PERSONAS);
      }
    } catch (error) {
      console.error('Failed to load personas:', error);
      setAllPersonas(PERSONAS);
    }
  };

  const loadVoices = async () => {
    try {
      const data = await getVoices();
      let voicesList = [];
      if (data.voices && Array.isArray(data.voices)) {
        voicesList = data.voices;
      } else if (Array.isArray(data)) {
        voicesList = data;
      }
      setAvailableVoices(voicesList);
    } catch (err) {
      console.error('Failed to load voices:', err);
    }
  };

  // Load personas and voices on mount
  useEffect(() => {
    loadAllPersonas();
    loadVoices();
  }, []);

  // Scroll to bottom of rehearsal
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rehearsalHistory, loading]);

  // Parse script into lines with character names
  const parseScript = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed = [];
    const characters = new Set();
    
    // Common patterns: "CHARACTER: dialogue" or "CHARACTER\ndialogue"
    const linePattern = /^([A-Z][A-Z0-9\s_-]*?):\s*(.+)$/;
    
    lines.forEach((line, index) => {
      const match = line.match(linePattern);
      if (match) {
        const character = match[1].trim();
        const dialogue = match[2].trim();
        characters.add(character);
        parsed.push({
          index,
          character,
          dialogue,
          raw: line
        });
      } else if (line.trim() && parsed.length > 0) {
        // Continuation of previous line
        parsed[parsed.length - 1].dialogue += ' ' + line.trim();
        parsed[parsed.length - 1].raw += '\n' + line;
      } else if (line.trim()) {
        // Stage direction or unattributed line
        parsed.push({
          index,
          character: 'STAGE DIRECTION',
          dialogue: line.trim(),
          raw: line,
          isDirection: true
        });
      }
    });
    
    setParsedLines(parsed);
    setDetectedCharacters(Array.from(characters));
    
    // Auto-assign first two characters
    const charArray = Array.from(characters);
    if (charArray.length >= 1 && !userCharacter) {
      setUserCharacter(charArray[0]);
    }
    if (charArray.length >= 2 && !partnerCharacter) {
      setPartnerCharacter(charArray[1]);
    }
  };

  // Parse script when it changes
  useEffect(() => {
    if (script.trim()) {
      parseScript(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);

  // Start rehearsal
  const startRehearsal = () => {
    if (parsedLines.length === 0) {
      alert('Please enter a script first');
      return;
    }
    if (!userCharacter || !partnerCharacter) {
      alert('Please select your character and your scene partner');
      return;
    }
    setIsRehearsing(true);
    setCurrentLineIndex(0);
    setRehearsalHistory([]);
    advanceToNextCue(0);
  };

  // Advance to next cue
  const advanceToNextCue = (startIndex) => {
    // Find the next line that's either user's or partner's
    for (let i = startIndex; i < parsedLines.length; i++) {
      const line = parsedLines[i];
      if (line.character === userCharacter || line.character === partnerCharacter) {
        setCurrentLineIndex(i);
        return;
      }
    }
    // End of script
    setIsRehearsing(false);
    alert('🎬 Scene Complete! Great rehearsal!');
  };

  // Handle reading a line (user clicks to deliver their line)
  const deliverLine = async () => {
    const currentLine = parsedLines[currentLineIndex];
    if (!currentLine) return;

    // Add user's line to history
    setRehearsalHistory(prev => [...prev, {
      character: currentLine.character,
      dialogue: currentLine.dialogue,
      isUser: currentLine.character === userCharacter
    }]);

    // Find the next line
    const nextIndex = currentLineIndex + 1;
    
    // Check if next line is partner's
    if (nextIndex < parsedLines.length) {
      const nextLine = parsedLines[nextIndex];
      
      if (nextLine.character === partnerCharacter) {
        // Partner responds
        setLoading(true);
        await speakPartnerLine(nextLine.dialogue);
        setLoading(false);
        
        // Add partner's line to history
        setRehearsalHistory(prev => [...prev, {
          character: nextLine.character,
          dialogue: nextLine.dialogue,
          isUser: false
        }]);
        
        // Advance past partner's line
        advanceToNextCue(nextIndex + 1);
      } else {
        // Next line is user's or direction
        advanceToNextCue(nextIndex);
      }
    } else {
      // End of script
      setIsRehearsing(false);
      alert('🎬 Scene Complete! Great rehearsal!');
    }
  };

  // Speak partner's line with TTS
  const speakPartnerLine = async (text) => {
    const voiceId = selectedVoiceOverride || currentPersona?.elevenLabsVoiceId;
    
    if (!voiceId) {
      console.warn('No voice ID available');
      return;
    }

    try {
      const response = await api.post('/voice/synthesize', {
        text: text,
        voiceId: voiceId
      }, {
        responseType: 'blob'
      });
      
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      
      await new Promise((resolve) => {
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play().catch(resolve);
      });
      
      URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error('Failed to synthesize speech:', error);
    }
  };

  // Stop rehearsal
  const stopRehearsal = () => {
    setIsRehearsing(false);
    setCurrentLineIndex(0);
  };

  // Get current line for display
  const currentLine = parsedLines[currentLineIndex];
  const isUserTurn = currentLine?.character === userCharacter;

  return (
    <div className="method-studio">
      <div className="method-studio-container">
        <h1>Method AI - Scene Rehearsal</h1>
        <p className="subtitle">Rehearse scenes with an AI scene partner</p>

        <div className="studio-layout">
          {/* Left Column: Script & Controls */}
          <div className="column script-column">
            <div className="column-header">
              <h2>📜 The Script</h2>
            </div>
            <div className="column-content">
              {!isRehearsing ? (
                <>
                  <div className="control-group">
                    <label>Paste your script:</label>
                    <textarea
                      className="script-textarea"
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      placeholder={`Paste your script here. Format each line as:\n\nCHARACTER: Their dialogue goes here.\nOTHER CHARACTER: Their response.\n\nExample:\nDETECTIVE: Where were you on the night of the murder?\nSUSPECT: I was at home, alone. You can't prove anything.`}
                      rows={12}
                    />
                  </div>

                  {detectedCharacters.length > 0 && (
                    <div className="character-assignment">
                      <h4>🎭 Cast Assignment</h4>
                      <div className="assignment-row">
                        <label>You play:</label>
                        <select 
                          value={userCharacter} 
                          onChange={(e) => setUserCharacter(e.target.value)}
                        >
                          <option value="">Select your character...</option>
                          {detectedCharacters.map(char => (
                            <option key={char} value={char}>{char}</option>
                          ))}
                        </select>
                      </div>
                      <div className="assignment-row">
                        <label>Scene partner plays:</label>
                        <select 
                          value={partnerCharacter} 
                          onChange={(e) => setPartnerCharacter(e.target.value)}
                        >
                          <option value="">Select partner character...</option>
                          {detectedCharacters.map(char => (
                            <option key={char} value={char}>{char}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="control-group">
                    <label>Partner Voice:</label>
                    <select
                      value={selectedVoiceOverride || currentPersona?.elevenLabsVoiceId || ''}
                      onChange={(e) => setSelectedVoiceOverride(e.target.value)}
                      className="voice-dropdown"
                    >
                      <option value="">Select a voice...</option>
                      {availableVoices.map(voice => (
                        <option key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    className="btn-start-rehearsal"
                    onClick={startRehearsal}
                    disabled={parsedLines.length === 0 || !userCharacter || !partnerCharacter}
                  >
                    🎬 Start Rehearsal
                  </button>
                </>
              ) : (
                <>
                  <div className="script-preview">
                    <h4>Full Script</h4>
                    <div className="script-lines">
                      {parsedLines.map((line, idx) => (
                        <div 
                          key={idx} 
                          className={`script-line ${idx === currentLineIndex ? 'current' : ''} ${idx < currentLineIndex ? 'done' : ''}`}
                        >
                          <span className="line-character">{line.character}:</span>
                          <span className="line-dialogue">{line.dialogue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="btn-stop-rehearsal" onClick={stopRehearsal}>
                    ⏹️ End Rehearsal
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Rehearsal Area */}
          <div className="column scene-column">
            <div className="column-header">
              <h2>🎭 Rehearsal</h2>
            </div>
            <div className="rehearsal-container">
              {!isRehearsing ? (
                <div className="empty-state">
                  <p>Paste a script and click &quot;Start Rehearsal&quot; to begin</p>
                </div>
              ) : (
                <>
                  <div className="rehearsal-history">
                    {rehearsalHistory.map((entry, idx) => (
                      <div key={idx} className={`rehearsal-line ${entry.isUser ? 'user' : 'partner'}`}>
                        <div className="line-header">{entry.character}</div>
                        <div className="line-text">{entry.dialogue}</div>
                      </div>
                    ))}
                    {loading && (
                      <div className="rehearsal-line partner loading">
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Current Cue */}
                  {currentLine && (
                    <div className="current-cue">
                      {isUserTurn ? (
                        <>
                          <div className="cue-label">YOUR LINE ({currentLine.character}):</div>
                          <div className="cue-text">{currentLine.dialogue}</div>
                          <button 
                            className="btn-deliver-line"
                            onClick={deliverLine}
                            disabled={loading}
                          >
                            🎤 Deliver Line
                          </button>
                        </>
                      ) : (
                        <div className="waiting-for-partner">
                          <div className="cue-label">Waiting for {currentLine.character}...</div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Persona Manager Modal */}
        {showPersonaManager && (
          <PersonaManager
            personas={allPersonas}
            onPersonaCreated={(newPersona) => {
              loadAllPersonas();
              setSelectedPersona(newPersona.id);
            }}
            onPersonaDeleted={(deletedId) => {
              loadAllPersonas();
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
