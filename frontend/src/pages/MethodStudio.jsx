import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateScript } from '../services/geminiService';
import { getVoices, synthesizeSpeech } from '../services/voiceService';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import RateLimitBanner from '../components/RateLimitBanner';
import './MethodStudio.css';

// localStorage keys
const STORAGE_KEYS = {
  SCRIPT: 'method-studio-script',
  ASSIGNMENTS: 'method-studio-assignments',
  PROMPT: 'method-studio-prompt'
};

function MethodStudio({ onOpenSettings }) {
  // --- State ---
  const [stage, setStage] = useState('setup');
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
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  
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
  const audioUrlRef = useRef(null);

  // --- localStorage Persistence ---
  
  // Load saved data on mount
  useEffect(() => {
    const savedScript = localStorage.getItem(STORAGE_KEYS.SCRIPT);
    const savedAssignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    const savedPrompt = localStorage.getItem(STORAGE_KEYS.PROMPT);
    
    if (savedScript) setScript(savedScript);
    if (savedPrompt) setPrompt(savedPrompt);
    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments));
      } catch (e) {
        console.error('Failed to parse saved assignments:', e);
      }
    }
  }, []);

  // Save script when it changes
  useEffect(() => {
    if (script) {
      localStorage.setItem(STORAGE_KEYS.SCRIPT, script);
    }
  }, [script]);

  // Save assignments when they change
  useEffect(() => {
    if (Object.keys(assignments).length > 0) {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    }
  }, [assignments]);

  // Save prompt when it changes
  useEffect(() => {
    if (prompt) {
      localStorage.setItem(STORAGE_KEYS.PROMPT, prompt);
    }
  }, [prompt]);

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
    
    // Patterns that indicate scene directions, NOT character names
    const directionPatterns = [
      /^(INT\.|EXT\.|INTERIOR|EXTERIOR)/i,  // Scene headings
      /^(FADE|CUT|DISSOLVE|SMASH)/i,        // Transitions
      /^(CONTINUED|CONT'D|MORE)/i,          // Continuations
      /^(THE END|END OF|TITLE:)/i,          // Endings/titles
      /^\(.*\)$/,                            // Parentheticals
      /^[A-Z\s]+[-–—]\s*(DAY|NIGHT|MORNING|EVENING|LATER|CONTINUOUS)/i, // Scene headings
      /^\*.*\*$/,                            // Asterisk-wrapped directions
      /^---+$/,                              // Dividers
    ];
    
    const isDirection = (line) => {
      return directionPatterns.some(pattern => pattern.test(line));
    };
    
    // Check if line looks like a character name (for screenplay format)
    const isCharacterName = (line) => {
      // Must be all caps, relatively short, no periods, not a known direction
      return /^[A-Z][A-Z0-9\s'_-]{0,20}$/.test(line) && 
             !line.includes('.') && 
             !isDirection(line) &&
             line.split(' ').length <= 3;
    };
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check for explicit directions first
      if (isDirection(trimmed)) {
        parsed.push({ type: 'direction', text: trimmed, original: line });
        currentCharacter = null;
        return;
      }

      // Primary format: CHARACTER: Dialogue text (preferred)
      const simpleMatch = trimmed.match(/^([A-Z][A-Z0-9\s'_-]{0,20}):\s*(.+)$/);
      
      if (simpleMatch) {
        const char = simpleMatch[1].trim();
        const dialogueText = simpleMatch[2].trim();
        
        // Make sure it's not a time indicator like "LATER:" or "MEANWHILE:"
        const timeIndicators = ['LATER', 'MEANWHILE', 'EARLIER', 'MOMENTS', 'CONTINUOUS', 'SAME'];
        if (!timeIndicators.includes(char)) {
          chars.add(char);
          parsed.push({ type: 'dialogue', character: char, text: dialogueText, original: line });
          currentCharacter = null;
          return;
        }
      }
      
      // Screenplay format: Character name on its own line
      if (isCharacterName(trimmed)) {
        currentCharacter = trimmed.replace(/\s*\(.*?\)\s*/g, '').trim();
        chars.add(currentCharacter);
        return;
      }
      
      // If we have a current character, this is their dialogue
      if (currentCharacter) {
        if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
          // Parenthetical direction - skip it for voice
          parsed.push({ type: 'direction', text: trimmed, original: line });
        } else {
          parsed.push({ type: 'dialogue', character: currentCharacter, text: trimmed, original: line });
        }
        return;
      }
      
      // Anything else is a direction
      parsed.push({ type: 'direction', text: trimmed, original: line });
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

  const playLine = useCallback(async (text, voiceId) => {
    if (!voiceId) {
      // No voice assigned, wait briefly then advance
      setTimeout(() => advanceLine(), 1500);
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
        await audioRef.current.play();
      }
    } catch (err) {
      console.error('TTS Error:', err);
      setIsPlayingAudio(false);
      
      if (err.isRateLimited) {
        setRateLimitError(err);
        setIsRehearsing(false);
      } else {
        // On error, wait then advance
        setTimeout(() => advanceLine(), 1000);
      }
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlayingAudio(false);
    // Cleanup URL after playback
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    // Only advance after audio fully completes
    advanceLine();
  }, []);

  const advanceLine = useCallback(() => {
    setIsWaitingForUser(false);
    stopListening();
    setCurrentLineIndex(prev => prev + 1);
  }, [stopListening]);

  // Handle the current line based on who's speaking
  const processCurrentLine = useCallback(() => {
    if (!isRehearsing || currentLineIndex >= parsedLines.length) {
      if (currentLineIndex >= parsedLines.length && isRehearsing) {
        setIsRehearsing(false);
        setIsWaitingForUser(false);
      }
      return;
    }

    const currentLine = parsedLines[currentLineIndex];
    
    // Stage directions - auto advance after brief pause
    if (currentLine.type === 'direction') {
      setTimeout(() => advanceLine(), 2000);
      return;
    }

    const assignment = assignments[currentLine.character];
    if (!assignment) return;

    if (assignment.type === 'ai') {
      // AI's turn - play the voice
      setIsWaitingForUser(false);
      stopListening();
      playLine(currentLine.text, assignment.voiceId);
    } else {
      // User's turn - wait for them
      setIsWaitingForUser(true);
      if (isSpeechSupported) {
        resetTranscript();
        startListening();
      }
    }
  }, [currentLineIndex, isRehearsing, parsedLines, assignments, playLine, stopListening, startListening, resetTranscript, isSpeechSupported, advanceLine]);

  // Trigger line processing when currentLineIndex or isRehearsing changes
  useEffect(() => {
    processCurrentLine();
  }, [currentLineIndex, isRehearsing, processCurrentLine]);

  // Auto-scroll to current line
  useEffect(() => {
    if (isRehearsing) {
      const element = document.getElementById(`line-${currentLineIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex, isRehearsing]);

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
    setIsWaitingForUser(false);
  };

  // User clicked "I'm Done" button
  const handleUserDone = () => {
    stopListening();
    setIsWaitingForUser(false);
    advanceLine();
  };

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEYS.SCRIPT);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.PROMPT);
    setScript('');
    setAssignments({});
    setPrompt('');
    setParsedLines([]);
    setCharacters([]);
  };

  // Calculate progress
  const progressPercent = parsedLines.length > 0 
    ? Math.round((currentLineIndex / parsedLines.length) * 100) 
    : 0;

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
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? 'Writing...' : 'Generate Script'}
              </button>
            </div>
            {script && (
              <button className="clear-btn" onClick={clearSavedData}>
                Clear Saved Script
              </button>
            )}
          </div>
          
          <div className="editor-panel">
            <h3>Or Paste Script</h3>
            <textarea 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Format: CHARACTER: Dialogue text&#10;&#10;Example:&#10;HERO: I won't let you get away with this.&#10;VILLAIN: You're too late, the plan is already in motion."
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
                    alert("No characters detected. Use format: CHARACTER: Dialogue");
                  }
                }}
              >
                Next: Casting →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: CASTING */}
      {stage === 'casting' && (
        <div className="stage-container casting-stage">
          <h3>Cast Your Scene</h3>
          <p className="casting-hint">Assign yourself to one character. AI will voice the others.</p>
          <div className="casting-grid">
            {characters.map(char => (
              <div key={char} className="cast-card">
                <div className="char-name">{char}</div>
                <div className="role-selector">
                  <label className={assignments[char]?.type === 'user' ? 'selected' : ''}>
                    <input 
                      type="radio" 
                      name={`role-${char}`}
                      checked={assignments[char]?.type === 'user'}
                      onChange={() => handleCasting(char, 'user', null)}
                    />
                    🎤 Me (I&apos;ll speak this)
                  </label>
                  <label className={assignments[char]?.type === 'ai' ? 'selected' : ''}>
                    <input 
                      type="radio" 
                      name={`role-${char}`}
                      checked={assignments[char]?.type === 'ai'}
                      onChange={() => handleCasting(char, 'ai', availableVoices[0]?.voice_id)}
                    />
                    🤖 AI Actor
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
            <button onClick={() => setStage('setup')}>← Back</button>
            <button className="primary-btn" onClick={startRehearsal}>
              🎬 Start Rehearsal
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: REHEARSAL */}
      {stage === 'rehearsal' && (
        <div className="stage-container rehearsal-stage">
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            <span className="progress-text">
              Line {Math.min(currentLineIndex + 1, parsedLines.length)} of {parsedLines.length}
            </span>
          </div>

          <div className="script-display">
            {parsedLines.map((line, idx) => {
              const isCurrent = idx === currentLineIndex;
              const isPast = idx < currentLineIndex;
              const isUser = assignments[line.character]?.type === 'user';
              
              return (
                <div 
                  key={idx} 
                  id={`line-${idx}`}
                  className={`script-line ${line.type} ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''} ${isUser ? 'user-line' : 'ai-line'}`}
                >
                  {line.type === 'dialogue' && (
                    <div className="character-label">
                      {isUser ? '🎤 ' : '🤖 '}{line.character}
                    </div>
                  )}
                  <div className="text-content">{line.text}</div>
                </div>
              );
            })}
          </div>

          {/* User "I'm Done" Button - Only shows on user turns */}
          {isWaitingForUser && isRehearsing && (
            <div className="user-done-container">
              <div className="listening-indicator">
                <span className="pulse-dot"></span>
                {isListening ? 'Listening to you...' : 'Your turn to speak'}
              </div>
              {transcript && (
                <div className="live-transcript">&ldquo;{transcript}&rdquo;</div>
              )}
              <button className="done-btn" onClick={handleUserDone}>
                ✓ I&apos;m Done Speaking
              </button>
            </div>
          )}

          {/* AI Speaking Indicator */}
          {isPlayingAudio && (
            <div className="ai-speaking-container">
              <div className="speaking-indicator">
                <span className="sound-wave">🔊</span>
                AI is speaking...
              </div>
            </div>
          )}

          <div className="controls-bar">
            <div className="status-indicator">
              {!isRehearsing && currentLineIndex >= parsedLines.length ? (
                <span className="status-complete">🎉 Scene Complete!</span>
              ) : isWaitingForUser ? (
                <span className="status-user">🎤 YOUR TURN</span>
              ) : isPlayingAudio ? (
                <span className="status-ai">🔊 AI Speaking</span>
              ) : (
                <span className="status-waiting">⏳ Loading...</span>
              )}
            </div>

            <div className="buttons">
              <button onClick={() => setIsRehearsing(!isRehearsing)}>
                {isRehearsing ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button onClick={advanceLine} className="skip-btn">
                Skip →
              </button>
              <button 
                className="restart-btn"
                onClick={() => {
                  setCurrentLineIndex(0);
                  setIsRehearsing(true);
                  setIsWaitingForUser(false);
                }}
              >
                ↺ Restart
              </button>
              <button onClick={() => {
                setIsRehearsing(false);
                setIsWaitingForUser(false);
                stopListening();
                setStage('casting');
              }}>
                ✕ Stop
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
