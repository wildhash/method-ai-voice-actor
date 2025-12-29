# 🚀 Quick Start - Testing the Casting Director Feature

## Prerequisites
- Node.js installed
- Google Cloud account with Vertex AI enabled
- ElevenLabs account with Voice Design API access

## Step 1: Install Dependencies

```bash
# Backend dependencies (including new axios package)
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

## Step 2: Configure API Keys

```bash
# Copy environment template
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your actual keys:
```env
PORT=3001
GCP_PROJECT_ID=your-actual-project-id
GCP_REGION=us-central1
ELEVENLABS_API_KEY=xi_your_actual_key_here
```

## Step 3: Authenticate Google Cloud

```bash
# Login to Google Cloud
gcloud auth application-default login

# Verify your project
gcloud config get-value project
```

## Step 4: Start the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev
# Should see: "Server is running on port 3001"

# Terminal 2: Start Frontend
cd frontend
npm run dev
# Should see: "Local: http://localhost:5173"
```

## Step 5: Test the Feature

### Open the App
1. Navigate to http://localhost:5173
2. Click on **Method Studio** in the navigation

### Create Your First Custom Persona
1. Click the **🎭 Manage Cast** button
2. Fill in the form:
   - **Name**: `Robot Butler`
   - **Description**: `A sophisticated British butler who is actually a robot. Speaks with refined articulation but occasional mechanical glitches. Formal, polite, but with subtle digital undertones.`
3. Click **🎬 Audition Character**
4. Wait 15-30 seconds (you'll see progress indicators)
5. Success! Your persona is created

### Use Your Custom Persona
1. Select **Robot Butler ⭐** from the persona dropdown
2. Enter test text: `Good morning! Today's weather is quite pleasant.`
3. Click **🎭 REHEARSE**
4. Listen to the AI-generated audio with your custom voice!

### Try Deep Rehearsal Mode
1. Toggle **🧠 Deep Rehearsal Mode** (switches to Gemini 3.0 Pro)
2. Click **🎭 REHEARSE** again
3. Notice the more sophisticated script rewrite

### Delete the Persona
1. Open **🎭 Manage Cast** again
2. Find "Robot Butler" in the Custom Characters section
3. Click the 🗑️ button
4. Confirm deletion
5. Verify it's removed from the dropdown

## Quick Test Persona Ideas

Try creating these for different effects:

### 🤖 **Tech Personas**
- **AI Assistant**: `Helpful, cheerful AI with a slight digital echo. Speaks clearly with upbeat energy.`
- **Hacker**: `Fast-talking cyberpunk hacker with urban slang. Paranoid but brilliant.`

### 🎭 **Character Personas**  
- **Pirate Captain**: `Gruff, commanding pirate with a thick accent. Uses nautical terms and growls.`
- **Valley Girl**: `Teenage California girl. Like, totally uses 'like' constantly. Super enthusiastic!`

### 🌍 **Accent Personas**
- **Scottish Highlander**: `Strong Scottish burr. Speaks of lochs, clans, and Highland mist.`
- **Russian Spy**: `Cold, calculating Russian accent. Speaks in clipped, precise sentences.`

### 👻 **Fantasy Personas**
- **Ancient Dragon**: `Deep, rumbling voice of a thousand-year-old dragon. Wise but terrifying.`
- **Fairy**: `Tiny, high-pitched, playful voice. Giggles often. Speaks of mushroom circles.`

## Troubleshooting

### "Failed to create persona"
**Check:**
- ✅ ElevenLabs API key is correct in `.env`
- ✅ You have voice design quota remaining
- ✅ Backend server is running without errors

**Fix:**
```bash
# Verify backend logs
cd backend
npm run dev
# Look for connection errors
```

### "Persona not appearing"
**Check:**
- ✅ Check `backend/src/data/personas.json` was created
- ✅ Check browser console for errors (F12)
- ✅ Try refreshing the page

**Fix:**
```bash
# Check if data directory exists
ls -la backend/src/data/
# Should see personas.json after first creation
```

### Voice generation too slow
**This is normal!** 
- First generation: 20-30 seconds
- ElevenLabs needs to design and process the voice
- Consider it the "audition" process

### "Rate limit exceeded"
**You've hit ElevenLabs quota**
- Wait 60 seconds
- Check your ElevenLabs dashboard
- Consider upgrading plan for higher limits

## Verify Installation

Run these checks:

```bash
# Check backend dependencies
cd backend
npm list axios
# Should show: axios@1.6.x

# Check if data directory is writable
mkdir -p backend/src/data
touch backend/src/data/test.json
rm backend/src/data/test.json
# Should complete without errors

# Check Google Cloud auth
gcloud auth application-default print-access-token
# Should print a long token

# Check ElevenLabs connectivity
curl -H "xi-api-key: YOUR_KEY" https://api.elevenlabs.io/v1/voices
# Should return list of voices
```

## Expected Behavior

### ✅ Success Indicators
- Modal opens smoothly
- Form accepts input
- "Auditioning..." message appears
- Progress takes 15-30 seconds
- Persona appears in grid with ⭐
- Dropdown includes new persona
- Can rehearse with custom voice
- Delete removes persona

### ❌ Error Indicators  
- Red error messages in modal
- Network errors in console
- Empty dropdown
- Audio fails to play
- Personas don't persist after refresh

## Advanced Testing

### Test Error Handling
```javascript
// Try creating duplicate
1. Create persona "Test"
2. Try creating another "Test"
3. Should see "already exists" error

// Try empty fields
1. Leave name blank
2. Should see validation error
3. Same for description

// Try deleting default persona
1. Try to delete "Noir Detective"
2. Should see "Cannot delete default" error
```

### Test Persistence
```bash
# Create persona
# Stop both servers (Ctrl+C)
# Restart servers
# Check if persona still exists
```

### Test API Directly
```bash
# Get all personas
curl http://localhost:3001/api/personas

# Create persona (may take 30s)
curl -X POST http://localhost:3001/api/personas/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Robot","description":"A test robot voice"}'

# Delete persona
curl -X DELETE http://localhost:3001/api/personas/test_robot
```

## Performance Benchmarks

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Load personas | <500ms | From JSON file |
| Create persona | 15-30s | Gemini + ElevenLabs |
| Delete persona | 2-5s | ElevenLabs API call |
| Rehearse with custom | 3-8s | Same as default |
| Modal open/close | <100ms | Instant UI |

## Next Steps

Once testing is complete:
1. ✅ Create your real personas
2. 📤 Commit code to repository
3. 🚀 Deploy to production
4. 📊 Monitor usage and performance
5. 🎨 Customize UI to your brand

## Support Resources

- **API Documentation**: See `CASTING_DIRECTOR.md`
- **Architecture Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Main Docs**: See `README.md`
- **ElevenLabs Docs**: https://elevenlabs.io/docs
- **Vertex AI Docs**: https://cloud.google.com/vertex-ai/docs

---

**Have fun creating personas!** 🎭✨

The system is designed to be intuitive and creative. Don't be afraid to experiment with wild character ideas - that's where the magic happens!
