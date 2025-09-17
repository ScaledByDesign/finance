'use client'

import { useState, useEffect } from 'react'
import { useVoiceChat } from '@/app/v2/hooks/useVoiceChat'

export default function MicrophoneTestPage() {
  const voiceChat = useVoiceChat()
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown')
  const [browserInfo, setBrowserInfo] = useState<string>('')

  useEffect(() => {
    // Get browser info
    setBrowserInfo(`${navigator.userAgent}`)
    
    // Check initial permission status
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setPermissionStatus(permission.state)
        
        permission.onchange = () => {
          setPermissionStatus(permission.state)
        }
      } else {
        setPermissionStatus('API not supported')
      }
    } catch (error) {
      console.error('Permission check error:', error)
      setPermissionStatus('Error checking permissions')
    }
  }

  const testMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Microphone access granted:', stream)
      setPermissionStatus('granted')
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Microphone access error:', error)
      setPermissionStatus('denied')
    }
  }

  const testSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    console.log('SpeechRecognition available:', !!SpeechRecognition)
    console.log('Speech synthesis available:', !!window.speechSynthesis)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Microphone & Voice Chat Debug</h1>
        
        {/* Browser Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
          <p className="text-sm text-gray-600 break-all">{browserInfo}</p>
        </div>

        {/* Permission Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Microphone Permission Status</h2>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              permissionStatus === 'granted' ? 'bg-green-100 text-green-800' :
              permissionStatus === 'denied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {permissionStatus}
            </span>
            <button
              onClick={checkPermissions}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Status
            </button>
            <button
              onClick={testMicrophoneAccess}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Request Microphone Access
            </button>
          </div>
        </div>

        {/* Speech Recognition Test */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Speech Recognition Test</h2>
          <div className="space-y-4">
            <button
              onClick={testSpeechRecognition}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test Speech Recognition Support
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Voice Chat State</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(voiceChat.state, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2">Voice Settings</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(voiceChat.voiceSettings, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Chat Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Voice Chat Controls</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={voiceChat.actions.startListening}
              disabled={voiceChat.state.isListening}
              className={`px-4 py-2 rounded ${
                voiceChat.state.isListening
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Start Listening
            </button>
            <button
              onClick={voiceChat.actions.stopListening}
              disabled={!voiceChat.state.isListening}
              className={`px-4 py-2 rounded ${
                !voiceChat.state.isListening
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Stop Listening
            </button>
            <button
              onClick={() => voiceChat.actions.speak('This is a test of the speech synthesis system.')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Speech
            </button>
          </div>
          
          {voiceChat.state.currentTranscript && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Current Transcript:</h3>
              <p className="bg-gray-100 p-3 rounded">{voiceChat.state.currentTranscript}</p>
            </div>
          )}
          
          {voiceChat.state.error && (
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-red-600">Error:</h3>
              <p className="bg-red-100 text-red-800 p-3 rounded">{voiceChat.state.error}</p>
            </div>
          )}
        </div>

        {/* Console Logs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Instructions</h2>
          <div className="space-y-2 text-sm">
            <p>1. Open browser developer tools (F12)</p>
            <p>2. Go to the Console tab</p>
            <p>3. Try the voice controls above and watch for console messages</p>
            <p>4. Check for any permission prompts in the browser</p>
            <p>5. Look for error messages related to microphone access</p>
          </div>
        </div>
      </div>
    </div>
  )
}
