import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { generateScript } from '../services/geminiService';
import { getVoices, synthesizeSpeech } from '../services/voiceService';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import RateLimitBanner from '../components/RateLimitBanner';
import './MethodStudio.css';

function MethodStudio({ onOpenSettings }) {
  // --- State ---
  const [stage, setStage] = useState('setup'); // 'setup', 'casting', 'rehearsal'
  const [script, setScript] = useState('');
  const [parsedLines, setParsedLines] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [availableVoices, setAvailableVoices] = useState([]);
  
  // Rehearsal State
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isRehearsing, setIsRehearsing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(null);
  
  // Generation State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Hooks
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported: isSpeechSupported 
  } = useSpeechRecognition();
  
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null); // Track URL for cleanup
  const scriptEndRef = useRef(null);

  // --- Effects ---

  // Load voices on mount
  useEffect(() => {
    loadVoices();
  }, []);

  // Parse script whenever it changes
  useEffect(() => {
    if (script) {
      const { lines, chars } = parseScriptText(script);
      setParsedLines(lines);
      setCharacters(chars);
    }
  }, [script]);

  // Rehearsal Loop
  useEffect(() => {
    if (!isRehearsing || currentLineIndex >= parsedLines.length) {
      if (currentLineIndex >= parsedLines.length && isRehearsing) {
        setIsRehearsing(false);
      }
      return;
    }

    const currentLine = parsedLines[currentLineIndex];
    
    if (currentLine.type === 'direction') {
      const timer = setTimeout(() => {
        advanceLine();
      }, 2000);
      return () => clearTimeout(timer);
    }

    const assignment = assignments[currentLine.character];
    if (!assignment) return;

    if (assignment.type === 'ai') {
      stopListening();
      playLine(currentLine.text, assignment.voiceId);
    } else {
      if (isSpeechSupported) {
        resetTranscript();
        startListening();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLineIndex, isRehearsing, assignments]);

  // Auto-scroll
  useEffect(() => {
    if (isRehearsing && scriptEndRef.current) {
      const element = document.getElementById(`line-${currentLineIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex, isRehearsing]);

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  // --- Logic ---

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

  const parseScriptText = (text) => {
    const lines = text.split('\n');
    const parsed = [];
    const chars = new Set();
    let currentCharacter = null;
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const simpleMatch = trimmed.match(/^([A-Z][A-Z0-9\s_-]*?):\s*(.+)$/);
      
      if (simpleMatch) {
        const char = simpleMatch[1].trim();
        const dialogueText = simpleMatch[2].trim();
        chars.add(char);
        parsed.push({ type: 'dialogue', character: char, text: dialogueText, original: line });
        currentCharacter = null;
      } 
      else if (/^[A-Z][A-Z0-9\s()]*$/.test(trimmed) && trimmed.length < 30) {
        currentCharacter = trimmed.replace(/\s*\(.*?\)\s*/g, '').trim();
        chars.add(currentCharacter);
      }
      else if (currentCharacter) {
        if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
           parsed.push({ type: 'direction', text: trimmed, original: line });
        } else {
           parsed.push({ type: 'dialogue', character: currentCharacter, text: trimmed, original: line });
        }
      }
      else {
        parsed.push({ type: 'direction', text: trimmed, original: line });
      }
    });

    return { lines: parsed, chars: Array.from(chars) };
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const data = await generateScript(prompt);
      if (data && data.script) {
        setScript(data.script);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate script');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCasting = (char, type, voiceId) => {
    setAssignments(prev => ({
      ...prev,
      [char]: { type, voiceId }
    }));
  };

  const autoCast = () => {
    const newAssignments = {};
    const voices = [...availableVoices];
    
    characters.forEach((char, index) => {
      if (index === 0) {
        newAssignments[char] = { type: 'user', voiceId: null };
      } else {
        const randomVoice = voices[Math.floor(Math.random() * voices.length)];
        newAssignments[char] = { type: 'ai', voiceId: randomVoice?.voice_id };
      }
    });
    setAssignments(newAssignments);
  };

  const playLine = async (text, voiceId) => {
    if (!voiceId) {
      setTimeout(advanceLine, 2000);
      return;
    }
    
    setIsPlayingAudio(true);
    setRateLimitError(null);
    
    try {
      const audioBlob = await synthesizeSpeech(text, voiceId);
      
      // Cleanup previous URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      const url = URL.createObjectURL(audioBlob);
      audioUrlRef.current = url;
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (err) {
      console.error('TTS Error:', err);
      setIsPlayingAudio(false);
      
      if (err.isRateLimited) {
        setRateLimitError(err);
        setIsRehearsing(false);
      } else {
        advanceLine();
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    // Cleanup URL after playback
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    advanceLine();
  };

  const advanceLine = () => {
    setCurrentLineIndex(prev => prev + 1);
  };

  const startRehearsal = () => {
    const unassigned = characters.filter(c => !assignments[c]);
    if (unassigned.length > 0) {
      alert(`Please assign roles for: ${unassigned.join(', ')}`);
      return;
    }
    setRateLimitError(null);
    setStage('rehearsal');
    setCurrentLineIndex(0);
    setIsRehearsing(true);
  };

  // --- Render ---

  return (
    <div className="method-studio">
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded} 
        style={{ display: 'none' }} 
      />

      <header className="studio-header">
        <h1>Method Studio</h1>
        <div className="steps">
          <div className={`step ${stage === 'setup' ? 'active' : ''}`}>1. Script</div>
          <div className={`step ${stage === 'casting' ? 'active' : ''}`}>2. Casting</div>
          <div className={`step ${stage === 'rehearsal' ? 'active' : ''}`}>3. Rehearsal</div>
        </div>
      </header>

      <RateLimitBanner error={rateLimitError} onOpenSettings={onOpenSettings} />

      {/* STAGE 1: SETUP */}
      {stage === 'setup' && (
        <div className="stage-container setup-stage">
          <div className="generation-panel">
            <h3>Generate Scene</h3>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="E.g., A tense negotiation between a spy and a villain..." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? 'Writing...' : 'Generate Script'}
              </button>
            </div>
          </div>
          
          <div className="editor-panel">
            <h3>Or Paste Script</h3>
            <textarea 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="INT. SCENE - DAY&#10;&#10;CHARACTER&#10;Dialogue here..."
            />
            <div className="actions">
              <button 
                className="primary-btn"
                disabled={!script.trim()}
                onClick={() => {
                  if (characters.length > 0) {
                    autoCast();
                    setStage('casting');
                  } else {
                    alert("No characters detected. Check script format.");
                  }
                }}
              >
                Next: Casting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: CASTING */}
      {stage === 'casting' && (
        <div className="stage-container casting-stage">
          <h3>Cast Your Scene</h3>
          <div className="casting-grid">
            {characters.map(char => (
              <div key={char} className="cast-card">
                <div className="char-name">{char}</div>
                <div className="role-selector">
                  <label>
                    <input 
                      type="radio" 
                      name={`role-${char}`}
                      checked={assignments[char]?.type === 'user'}
                      onChange={() => handleCasting(char, 'user', null)}
                    />
                    Me (User)
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name={`role-${char}`}
                      checked={assignments[char]?.type === 'ai'}
                      onChange={() => handleCasting(char, 'ai', availableVoices[0]?.voice_id)}
                    />
                    AI Actor
                  </label>
                </div>
                
                {assignments[char]?.type === 'ai' && (
                  <select 
                    value={assignments[char]?.voiceId || ''}
                    onChange={(e) => handleCasting(char, 'ai', e.target.value)}
                  >
                    {availableVoices.map(v => (
                      <option key={v.voice_id} value={v.voice_id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
          <div className="actions">
            <button onClick={() => setStage('setup')}>Back</button>
            <button className="primary-btn" onClick={startRehearsal}>Start Rehearsal</button>
          </div>
        </div>
      )}

      {/* STAGE 3: REHEARSAL */}
      {stage === 'rehearsal' && (
        <div className="stage-container rehearsal-stage">
          <div className="script-display">
            {parsedLines.map((line, idx) => {
              const isCurrent = idx === currentLineIndex;
              const isUser = assignments[line.character]?.type === 'user';
              
              return (
                <div 
                  key={idx} 
                  id={`line-${idx}`}
                  className={`script-line ${line.type} ${isCurrent ? 'current' : ''} ${isUser ? 'user-line' : 'ai-line'}`}
                >
                  {line.type === 'dialogue' && (
                    <div className="character-label">{line.character}</div>
                  )}
                  <div className="text-content">{line.text}</div>
                </div>
              );
            })}
            <div ref={scriptEndRef} />
          </div>

          <div className="controls-bar">
            <div className="status-indicator">
              {isRehearsing && parsedLines[currentLineIndex] && (
                <>
                  {assignments[parsedLines[currentLineIndex].character]?.type === 'user' ? (
                    <span className="status-user">
                      {isListening ? '🎤 Listening...' : 'Your Turn'}
                    </span>
                  ) : (
                    <span className="status-ai">
                      {isPlayingAudio ? '🔊 Speaking...' : 'Waiting...'}
                    </span>
                  )}
                </>
              )}
            </div>
            
            <div className="transcript-preview">
              {isListening && transcript}
            </div>

            <div className="buttons">
              <button onClick={() => setIsRehearsing(!isRehearsing)}>
                {isRehearsing ? 'Pause' : 'Resume'}
              </button>
              <button onClick={advanceLine} className="next-btn">
                Next Line ➔
              </button>
              <button onClick={() => {
                setIsRehearsing(false);
                setStage('casting');
              }}>
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

MethodStudio.propTypes = {
  onOpenSettings: PropTypes.func
};

export default MethodStudio;
