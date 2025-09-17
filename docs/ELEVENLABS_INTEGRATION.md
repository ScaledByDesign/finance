# Eleven Labs Text-to-Speech Integration

This document describes the Eleven Labs TTS integration for high-quality voice synthesis in the AI chat interface.

## 🎯 Overview

The Eleven Labs integration provides premium text-to-speech capabilities that significantly enhance the voice chat experience with:

- **High-quality voice synthesis** - Professional-grade AI voices
- **Multiple voice options** - Choose from various voice presets
- **Customizable settings** - Adjust stability, similarity, and style
- **Fallback support** - Automatically falls back to browser TTS if not configured
- **Real-time status** - Visual indicators for TTS activity

## 🚀 Quick Setup

### 1. Get Eleven Labs API Key

1. Visit [Eleven Labs](https://elevenlabs.io/app/settings/api-keys)
2. Sign up for an account (free tier available)
3. Generate an API key from the settings page

### 2. Configure Environment

Add your API key to `.env.docker`:

```bash
# Eleven Labs Text-to-Speech Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 3. Restart Application

```bash
docker-compose restart app
```

### 4. Test Integration

Visit the test page: http://localhost:3002/test/elevenlabs

## 🏗️ Architecture

### Components

- **`src/lib/elevenlabs.ts`** - Core Eleven Labs client and utilities
- **`src/app/api/v1/tts/elevenlabs/route.ts`** - API endpoint for TTS requests
- **`src/app/v2/hooks/useElevenLabsTTS.ts`** - React hook for TTS functionality
- **`src/app/v2/components/voice-chat.tsx`** - Updated voice chat with Eleven Labs support

### API Endpoints

- `GET /api/v1/tts/elevenlabs` - Check configuration and get available voices
- `POST /api/v1/tts/elevenlabs` - Generate speech from text

### Voice Presets

The integration includes optimized voice presets for different use cases:

```typescript
// Professional voices for financial content
professional_male: 'pNInz6obpgDQGcFmaJgB'    // Adam - clear, professional
professional_female: 'EXAVITQu4vr4xnSDxMaL'  // Bella - warm, professional

// Conversational voices for casual chat
conversational_male: 'VR6AewLTigWG4xSOukaG'   // Arnold - friendly, conversational
conversational_female: 'oWAxZDx7w5VEj9dCyTzz' // Grace - natural, engaging

// Authoritative voices for important information
authoritative_male: 'bVMeCyTHy58xNoL34h3p'    // Jeremy - confident, clear
authoritative_female: 'ThT5KcBeYPX3keUQqHPh'  // Dorothy - authoritative, trustworthy
```

## 🎛️ Usage

### In Voice Chat

1. **Enable Voice** - Click the speaker icon in the voice chat interface
2. **Toggle Eleven Labs** - Click the "11" button to switch between Eleven Labs and browser TTS
3. **Automatic Speech** - AI responses are automatically spoken when voice is enabled

### Programmatic Usage

```typescript
import { useElevenLabsTTS } from '@/app/v2/hooks/useElevenLabsTTS'

function MyComponent() {
  const elevenLabsTTS = useElevenLabsTTS({
    voice_preset: 'professional_female',
    autoPlay: true,
    volume: 0.8,
  })

  const handleSpeak = () => {
    elevenLabsTTS.actions.speak('Hello, this is a test message.')
  }

  return (
    <div>
      <button onClick={handleSpeak} disabled={!elevenLabsTTS.state.isConfigured}>
        Speak
      </button>
      {elevenLabsTTS.state.isPlaying && <p>Speaking...</p>}
    </div>
  )
}
```

### API Usage

```typescript
// Generate speech
const response = await fetch('/api/v1/tts/elevenlabs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello, this is a test message.',
    voice_preset: 'professional_female',
    model_id: 'eleven_turbo_v2_5'
  })
})

const data = await response.json()
if (data.success) {
  const audio = new Audio(data.audio_url)
  audio.play()
}
```

## ⚙️ Configuration Options

### Voice Settings

```typescript
interface ElevenLabsTTSSettings {
  voice_preset: keyof typeof VOICE_PRESETS  // Voice to use
  model_id: string                          // AI model (turbo, multilingual, monolingual)
  voice_settings: {
    stability: number                       // 0-1, voice consistency
    similarity_boost: number                // 0-1, voice similarity to original
    style: number                          // 0-1, style exaggeration
    use_speaker_boost: boolean             // Enhance speaker clarity
  }
  autoPlay: boolean                        // Auto-play generated audio
  volume: number                           // 0-1, playback volume
}
```

### Models

- **`eleven_turbo_v2_5`** - Fastest generation, good quality
- **`eleven_multilingual_v2`** - Best for multiple languages
- **`eleven_monolingual_v1`** - Highest quality for English

## 🔧 Advanced Features

### Text Processing

The integration automatically cleans text for optimal TTS:

- Removes markdown formatting
- Handles code blocks and inline code
- Converts multiple newlines to periods
- Limits text length to API constraints

### Error Handling

- **Graceful fallback** to browser TTS if Eleven Labs fails
- **Automatic retry** for network issues
- **User-friendly error messages**
- **Configuration validation**

### Performance Optimization

- **Blob URL management** - Automatic cleanup of audio URLs
- **Request cancellation** - Abort ongoing requests when needed
- **Memory management** - Proper cleanup of audio elements

## 🎨 UI Integration

### Voice Controls

The voice chat interface includes:

- **Speaker icon** - Toggle voice output on/off
- **"11" button** - Switch between Eleven Labs and browser TTS
- **Status indicators** - Show TTS generation and playback status
- **Visual feedback** - Animated indicators during speech generation

### Status Display

```typescript
// Loading state
<div className="flex items-center gap-2">
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
  <span>Generating speech...</span>
</div>

// Playing state
<div className="flex items-center gap-2">
  <div className="flex gap-1">
    <div className="w-1 h-4 bg-blue-500 animate-pulse"></div>
    <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
  </div>
  <span>Speaking with Eleven Labs...</span>
</div>
```

## 🧪 Testing

### Test Page

Visit http://localhost:3002/test/elevenlabs to:

- Check configuration status
- Test different voices and settings
- Verify API connectivity
- Adjust voice parameters in real-time

### Manual Testing

```bash
# Check API status
curl http://localhost:3002/api/v1/tts/elevenlabs

# Test TTS generation
curl -X POST http://localhost:3002/api/v1/tts/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test.", "voice_preset": "professional_female"}'
```

## 🔒 Security & Privacy

- **API key protection** - Server-side only, never exposed to client
- **Request validation** - Input sanitization and length limits
- **Rate limiting** - Respects Eleven Labs API limits
- **Error handling** - No sensitive information in error messages

## 💰 Cost Management

- **Character tracking** - Monitor usage across sessions
- **Text optimization** - Automatic text cleaning to reduce costs
- **Fallback strategy** - Use browser TTS when appropriate
- **Length limits** - Prevent excessive API usage

## 🐛 Troubleshooting

### Common Issues

1. **"Not Configured" Error**
   - Verify `ELEVENLABS_API_KEY` is set in `.env.docker`
   - Restart the Docker container
   - Check API key validity at Eleven Labs dashboard

2. **"Failed to Generate Audio" Error**
   - Check internet connectivity
   - Verify API key has sufficient credits
   - Try a shorter text input

3. **No Audio Playback**
   - Check browser audio permissions
   - Verify volume settings
   - Try different voice presets

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=elevenlabs:*
```

## 🚀 Future Enhancements

- **Voice cloning** - Custom voice training
- **Real-time streaming** - Lower latency TTS
- **Voice effects** - Additional audio processing
- **Multi-language support** - Automatic language detection
- **Voice selection UI** - In-app voice browser

## 📚 Resources

- [Eleven Labs API Documentation](https://docs.elevenlabs.io/)
- [Voice Library](https://elevenlabs.io/voice-library)
- [Pricing Information](https://elevenlabs.io/pricing)
- [API Limits](https://docs.elevenlabs.io/api-reference/rate-limits)
