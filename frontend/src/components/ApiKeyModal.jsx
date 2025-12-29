import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { setUserApiKey, getUserApiKey, hasUserApiKey } from '../services/api';
import { getVoiceStatus } from '../services/voiceService';
import './ApiKeyModal.css';

const AFFILIATE_LINK = 'https://try.elevenlabs.io/ynnoa7cat7j9';

function ApiKeyModal({ isOpen, onClose, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await getVoiceStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Load API key from localStorage when modal opens
      const currentKey = getUserApiKey();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApiKey(currentKey || '');
      
      // Fetch current status
      fetchStatus();
    }
  }, [isOpen]);

  const handleSave = () => {
    setLoading(true);
    setUserApiKey(apiKey.trim() || null);
    setTimeout(() => {
      setLoading(false);
      onKeyUpdated?.();
      onClose();
    }, 300);
  };

  const handleClear = () => {
    setApiKey('');
    setUserApiKey(null);
    fetchStatus();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>🎤 Voice Settings</h2>
        
        {/* Current Status */}
        <div className={`status-box ${status?.tier || 'free'}`}>
          <div className="status-tier">
            {status?.tier === 'unlimited' ? '⭐ Unlimited Access' : '🆓 Free Tier'}
          </div>
          {status?.tier === 'free' && (
            <div className="status-remaining">
              {status?.remaining} / {status?.limit} requests remaining today
            </div>
          )}
        </div>

        {/* API Key Input */}
        <div className="api-key-section">
          <label>Your ElevenLabs API Key</label>
          <div className="input-group">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your ElevenLabs API key..."
            />
            <button 
              className="toggle-visibility"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          <small>Your key is stored locally and never sent to our servers.</small>
        </div>

        {/* Affiliate CTA */}
        <div className="affiliate-box">
          <p>Don&apos;t have an API key?</p>
          <a 
            href={AFFILIATE_LINK} 
            target="_blank" 
            rel="noopener noreferrer"
            className="affiliate-link"
          >
            🎁 Get ElevenLabs (Support Method AI)
          </a>
          <small>Sign up through our link to support this project!</small>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          {hasUserApiKey() && (
            <button className="btn-secondary" onClick={handleClear}>
              Clear Key
            </button>
          )}
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

ApiKeyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onKeyUpdated: PropTypes.func
};

export default ApiKeyModal;
