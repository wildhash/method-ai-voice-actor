import { useState, useEffect } from 'react';
import { rewriteText, generateDialogue } from '../services/geminiService';
import { synthesizeSpeech, getVoices } from '../services/voiceService';
import './Studio.css';

function Studio() {
  const [mode, setMode] = useState('rewrite'); // 'rewrite' or 'generate'
  const [inputText, setInputText] = useState('');
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [characterTraits, setCharacterTraits] = useState('');
  const [scenario, setScenario] = useState('');
  const [outputText, setOutputText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const data = await getVoices();
      setVoices(data.voices || []);
      if (data.voices && data.voices.length > 0) {
        setSelectedVoice(data.voices[0].voice_id);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const handleRewrite = async () => {
    if (!inputText || !characterPrompt) return;

    setLoading(true);
    try {
      const result = await rewriteText(inputText, characterPrompt);
      setOutputText(result.rewrittenText);
    } catch (error) {
      console.error('Failed to rewrite text:', error);
      alert('Failed to rewrite text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!scenario || !characterName || !characterTraits) return;

    setLoading(true);
    try {
      const result = await generateDialogue(scenario, characterName, characterTraits);
      setOutputText(result.dialogue);
    } catch (error) {
      console.error('Failed to generate dialogue:', error);
      alert('Failed to generate dialogue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSynthesize = async () => {
    if (!outputText || !selectedVoice) return;

    setLoading(true);
    try {
      const audioBlob = await synthesizeSpeech(outputText, selectedVoice);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to synthesize speech:', error);
      alert('Failed to synthesize speech. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="studio">
      <div className="studio-container">
        <h1>Voice Actor Studio</h1>
        
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'rewrite' ? 'active' : ''}`}
            onClick={() => setMode('rewrite')}
          >
            Rewrite Text
          </button>
          <button
            className={`mode-btn ${mode === 'generate' ? 'active' : ''}`}
            onClick={() => setMode('generate')}
          >
            Generate Dialogue
          </button>
        </div>

        <div className="studio-workspace">
          <div className="input-panel">
            <h2>Input</h2>
            
            {mode === 'rewrite' ? (
              <>
                <div className="form-group">
                  <label>Text to Rewrite</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter the text you want to rewrite..."
                    rows={6}
                  />
                </div>
                <div className="form-group">
                  <label>Character Prompt</label>
                  <textarea
                    value={characterPrompt}
                    onChange={(e) => setCharacterPrompt(e.target.value)}
                    placeholder="Describe the character voice (e.g., 'You are a wise old wizard speaking dramatically...')"
                    rows={4}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleRewrite}
                  disabled={loading || !inputText || !characterPrompt}
                >
                  {loading ? 'Processing...' : 'Rewrite'}
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Character Name</label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="e.g., Captain Jack"
                  />
                </div>
                <div className="form-group">
                  <label>Character Traits</label>
                  <textarea
                    value={characterTraits}
                    onChange={(e) => setCharacterTraits(e.target.value)}
                    placeholder="Describe the character traits (e.g., 'bold, adventurous, witty')"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Scenario</label>
                  <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Describe the scenario (e.g., 'Discovering a hidden treasure chest')"
                    rows={4}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={loading || !characterName || !characterTraits || !scenario}
                >
                  {loading ? 'Generating...' : 'Generate Dialogue'}
                </button>
              </>
            )}
          </div>

          <div className="output-panel">
            <h2>Output</h2>
            <div className="form-group">
              <label>Generated Text</label>
              <textarea
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                placeholder="Generated text will appear here..."
                rows={10}
              />
            </div>

            <div className="voice-controls">
              <div className="form-group">
                <label>Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  {voices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleSynthesize}
                disabled={loading || !outputText || !selectedVoice}
              >
                {loading ? 'Synthesizing...' : 'Synthesize Speech'}
              </button>
            </div>

            {audioUrl && (
              <div className="audio-player">
                <audio controls src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Studio;
