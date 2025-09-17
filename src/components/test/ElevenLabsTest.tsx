'use client'

import { useState } from 'react'
import { useElevenLabsTTS } from '@/app/v2/hooks/useElevenLabsTTS'
import { VOICE_PRESETS, MODELS } from '@/lib/elevenlabs'

export function ElevenLabsTest() {
  const [testText, setTestText] = useState('Hello! This is a test of Eleven Labs text-to-speech integration with our finance application.')
  const elevenLabsTTS = useElevenLabsTTS()

  const handleTest = () => {
    elevenLabsTTS.actions.speak(testText)
  }

  const handleStop = () => {
    elevenLabsTTS.actions.stop()
  }

  const handleCheckConfig = async () => {
    const isConfigured = await elevenLabsTTS.actions.checkConfiguration()
    alert(`Eleven Labs is ${isConfigured ? 'configured' : 'not configured'}`)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Eleven Labs TTS Test</h2>
      
      {/* Configuration Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Configuration Status</h3>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm ${
            elevenLabsTTS.state.isConfigured 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {elevenLabsTTS.state.isConfigured ? 'Configured' : 'Not Configured'}
          </div>
          <button
            onClick={handleCheckConfig}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Configuration
          </button>
        </div>
        {!elevenLabsTTS.state.isConfigured && (
          <p className="text-sm text-gray-600 mt-2">
            Add your ELEVENLABS_API_KEY to .env.docker to enable Eleven Labs TTS
          </p>
        )}
      </div>

      {/* Current State */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Current State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Loading: {elevenLabsTTS.state.isLoading ? 'Yes' : 'No'}</div>
          <div>Playing: {elevenLabsTTS.state.isPlaying ? 'Yes' : 'No'}</div>
          <div>Paused: {elevenLabsTTS.state.isPaused ? 'Yes' : 'No'}</div>
          <div>Characters Used: {elevenLabsTTS.state.charactersUsed}</div>
        </div>
        {elevenLabsTTS.state.error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
            Error: {elevenLabsTTS.state.error}
          </div>
        )}
      </div>

      {/* Voice Settings */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Voice Settings</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Voice Preset</label>
            <select
              value={elevenLabsTTS.settings.voice_preset}
              onChange={(e) => elevenLabsTTS.actions.updateSettings({ 
                voice_preset: e.target.value as keyof typeof VOICE_PRESETS 
              })}
              className="w-full p-2 border rounded"
            >
              {Object.keys(VOICE_PRESETS).map(preset => (
                <option key={preset} value={preset}>
                  {preset.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={elevenLabsTTS.settings.model_id}
              onChange={(e) => elevenLabsTTS.actions.updateSettings({ model_id: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {Object.entries(MODELS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Volume: {elevenLabsTTS.settings.volume}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={elevenLabsTTS.settings.volume}
              onChange={(e) => elevenLabsTTS.actions.updateSettings({ 
                volume: parseFloat(e.target.value) 
              })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Stability: {elevenLabsTTS.settings.voice_settings.stability}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={elevenLabsTTS.settings.voice_settings.stability}
              onChange={(e) => elevenLabsTTS.actions.updateSettings({ 
                voice_settings: {
                  ...elevenLabsTTS.settings.voice_settings,
                  stability: parseFloat(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Similarity Boost: {elevenLabsTTS.settings.voice_settings.similarity_boost}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={elevenLabsTTS.settings.voice_settings.similarity_boost}
              onChange={(e) => elevenLabsTTS.actions.updateSettings({ 
                voice_settings: {
                  ...elevenLabsTTS.settings.voice_settings,
                  similarity_boost: parseFloat(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Test Text */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Test Text</label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={4}
          placeholder="Enter text to convert to speech..."
        />
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={handleTest}
          disabled={!elevenLabsTTS.state.isConfigured || elevenLabsTTS.state.isLoading}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {elevenLabsTTS.state.isLoading ? 'Generating...' : 'Test Speech'}
        </button>
        
        <button
          onClick={handleStop}
          disabled={!elevenLabsTTS.state.isPlaying && !elevenLabsTTS.state.isLoading}
          className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Stop
        </button>

        {elevenLabsTTS.state.isPaused && (
          <button
            onClick={elevenLabsTTS.actions.resume}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Resume
          </button>
        )}

        {elevenLabsTTS.state.isPlaying && !elevenLabsTTS.state.isPaused && (
          <button
            onClick={elevenLabsTTS.actions.pause}
            className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Pause
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Setup Instructions</h3>
        <ol className="text-sm space-y-1">
          <li>1. Get your API key from <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Eleven Labs</a></li>
          <li>2. Add <code className="bg-gray-200 px-1 rounded">ELEVENLABS_API_KEY=your_key_here</code> to .env.docker</li>
          <li>3. Restart the Docker container</li>
          <li>4. Test the integration using this component</li>
        </ol>
      </div>
    </div>
  )
}
