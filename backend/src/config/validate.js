/**
 * Environment validation module
 * Validates required environment variables on startup
 */

export const validateEnvironment = () => {
  const required = [];
  const warnings = [];

  // Check Gemini API key
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    required.push('GEMINI_API_KEY or GOOGLE_API_KEY');
  }

  // Check ElevenLabs API key
  if (!process.env.ELEVENLABS_API_KEY) {
    required.push('ELEVENLABS_API_KEY');
  }

  // Optional but recommended
  if (!process.env.ALLOWED_ORIGINS) {
    warnings.push('ALLOWED_ORIGINS not set - using default localhost origins');
  }

  // Log warnings
  warnings.forEach(w => console.warn(`⚠️  Warning: ${w}`));

  // Fail on missing required vars
  if (required.length > 0) {
    console.error('❌ Missing required environment variables:');
    required.forEach(r => console.error(`   - ${r}`));
    console.error('\nPlease set these in your .env file or environment.');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
};

export default validateEnvironment;
