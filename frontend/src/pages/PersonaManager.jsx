import { useState } from 'react';
import { createPersona, deletePersona } from '../services/personaService';
import './PersonaManager.css';
import PropTypes from 'prop-types';

function PersonaManager({ personas, onPersonaCreated, onPersonaDeleted, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreatePersona = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      setError('Please provide both name and description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newPersona = await createPersona(name.trim(), description.trim());
      
      // Reset form
      setName('');
      setDescription('');
      
      // Notify parent component
      if (onPersonaCreated) {
        onPersonaCreated(newPersona);
      }
    } catch (err) {
      console.error('Failed to create persona:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create persona');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePersona = async (personaId, personaLabel) => {
    if (!confirm(`Are you sure you want to delete "${personaLabel}"? This will also remove the custom voice from ElevenLabs.`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deletePersona(personaId);
      
      // Notify parent component
      if (onPersonaDeleted) {
        onPersonaDeleted(personaId);
      }
    } catch (err) {
      console.error('Failed to delete persona:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete persona');
    } finally {
      setLoading(false);
    }
  };

  // Convert personas object to array
  const personasArray = Object.entries(personas).map(([key, value]) => ({
    id: key,
    ...value
  }));

  // Separate custom from default personas
  const customPersonas = personasArray.filter(p => p.isCustom);
  const defaultPersonas = personasArray.filter(p => !p.isCustom);

  return (
    <div className="persona-manager-overlay" onClick={onClose}>
      <div className="persona-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎭 Casting Director</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Create New Persona Form */}
          <div className="create-persona-section">
            <h3>✨ Cast a New Character</h3>
            <form onSubmit={handleCreatePersona} className="create-form">
              <div className="form-group">
                <label htmlFor="persona-name">Character Name</label>
                <input
                  id="persona-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Swamp Witch, Cyborg Ninja"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="persona-description">Character Vibe & Voice</label>
                <textarea
                  id="persona-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the character's personality, voice quality, speaking style, and background. Be specific! (e.g., 'Old, creaky, cackling, evil witch with a high-pitched voice from the depths of a murky swamp')"
                  rows={4}
                  disabled={loading}
                  required
                />
                <small>This will be used to generate both the voice and acting instructions</small>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="btn-create"
                disabled={loading || !name.trim() || !description.trim()}
              >
                {loading ? '🎬 Auditioning...' : '🎬 Audition Character'}
              </button>
              
              {loading && (
                <div className="loading-note">
                  <p>⏳ This may take 15-30 seconds...</p>
                  <p>Creating AI voice + system prompt with Gemini + ElevenLabs</p>
                </div>
              )}
            </form>
          </div>

          {/* Personas List */}
          <div className="personas-list-section">
            <h3>🎪 Your Cast</h3>

            {customPersonas.length > 0 && (
              <div className="personas-group">
                <h4>Custom Characters</h4>
                <div className="personas-grid">
                  {customPersonas.map((persona) => (
                    <div key={persona.id} className="persona-card custom">
                      <div className="persona-header">
                        <h5>{persona.label}</h5>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeletePersona(persona.id, persona.label)}
                          disabled={loading}
                          title="Delete persona"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="persona-description-short">
                        {persona.description || persona.systemPrompt.substring(0, 100) + '...'}
                      </p>
                      <small className="persona-meta">
                        Created: {new Date(persona.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="personas-group">
              <h4>Default Characters</h4>
              <div className="personas-grid">
                {defaultPersonas.map((persona) => (
                  <div key={persona.id} className="persona-card default">
                    <div className="persona-header">
                      <h5>{persona.label}</h5>
                      <span className="badge-default">Built-in</span>
                    </div>
                    <p className="persona-description-short">
                      {persona.systemPrompt.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PersonaManager.propTypes = {
  personas: PropTypes.object.isRequired,
  onPersonaCreated: PropTypes.func,
  onPersonaDeleted: PropTypes.func,
  onClose: PropTypes.func.isRequired
};

export default PersonaManager;
