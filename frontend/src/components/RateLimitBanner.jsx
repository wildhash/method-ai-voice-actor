import PropTypes from 'prop-types';
import './RateLimitBanner.css';

const AFFILIATE_LINK = 'https://try.elevenlabs.io/ynnoa7cat7j9';

function RateLimitBanner({ error, onOpenSettings }) {
  if (!error?.isRateLimited) return null;

  return (
    <div className="rate-limit-banner">
      <div className="banner-content">
        <span className="banner-icon">⚠️</span>
        <div className="banner-text">
          <strong>Free tier limit reached!</strong>
          <p>You&apos;ve used all 10 free voice generations for today.</p>
        </div>
      </div>
      <div className="banner-actions">
        <button className="settings-btn" onClick={onOpenSettings}>
          Add API Key
        </button>
        <a 
          href={AFFILIATE_LINK} 
          target="_blank" 
          rel="noopener noreferrer"
          className="get-key-btn"
        >
          Get ElevenLabs Key →
        </a>
      </div>
    </div>
  );
}

RateLimitBanner.propTypes = {
  error: PropTypes.shape({
    isRateLimited: PropTypes.bool,
    message: PropTypes.string,
    affiliateLink: PropTypes.string
  }),
  onOpenSettings: PropTypes.func.isRequired
};

export default RateLimitBanner;
