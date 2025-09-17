import { ElevenLabsTest } from '@/components/test/ElevenLabsTest'

export default function ElevenLabsTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Eleven Labs TTS Integration Test</h1>
        <ElevenLabsTest />
      </div>
    </div>
  )
}
