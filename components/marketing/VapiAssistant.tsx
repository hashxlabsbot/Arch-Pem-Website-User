'use client'

import { useEffect, useRef, useState } from 'react'
import type Vapi from '@vapi-ai/web'
import { MicIcon, MicOffIcon } from '@/components/icons'
import { VAPI_ASSISTANT_CONFIG } from '@/lib/vapiAssistant'

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY

type CallStatus = 'idle' | 'connecting' | 'active'

interface TranscriptLine {
  role: 'user' | 'assistant'
  text: string
}

interface TranscriptMessage {
  type: 'transcript'
  role: 'user' | 'assistant'
  transcriptType: 'partial' | 'final'
  transcript: string
}

function isTranscriptMessage(msg: unknown): msg is TranscriptMessage {
  return !!msg && typeof msg === 'object' && (msg as { type?: string }).type === 'transcript'
}

/**
 * Vapi's error event shape varies by failure stage (validation, Daily call
 * object creation, join, etc.) — see @vapi-ai/web's serializeError(). Rather
 * than showing one opaque message for every case, pull out enough detail to
 * tell the common failure classes (mic permission, no device, network) apart
 * so a real fix can be targeted instead of guessed at next time this fires.
 */
function describeVapiError(err: unknown): string {
  const raw = JSON.stringify(err)
  if (/NotAllowedError|Permission denied|permissions-error/i.test(raw)) {
    return 'Please allow microphone access in your browser, then try again.'
  }
  if (/NotFoundError|NotReadableError|no microphone|DevicesError/i.test(raw)) {
    return 'No working microphone was found. Please check your device and try again.'
  }
  if (/network|timeout|ECONNREFUSED|ERR_|failed to fetch|load failed/i.test(raw)) {
    return 'Network issue reaching the voice service. Please check your connection and try again.'
  }
  return 'Voice assistant hit an error. Please try again, or call/email us directly.'
}

/**
 * The assistant's audio track only starts playing once the WebRTC call has
 * joined — several awaited round-trips after the click that triggered it. By
 * then some browsers (Safari/iOS especially) no longer consider it a direct
 * result of a user gesture and silently block the SDK's internal <audio>
 * element, so the call looks "connected" (transcript + speaking indicator
 * both come from the data channel / track audio level, not playback) but no
 * sound comes out. Playing a near-silent buffer synchronously inside the
 * click handler unlocks audio playback for the rest of the page session.
 */
function unlockAudioPlayback() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const buffer = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(0)
    if (ctx.state === 'suspended') ctx.resume()
    setTimeout(() => ctx.close(), 1000)
  } catch {
    // best-effort unlock — safe to ignore if unsupported
  }
}

export default function VapiAssistant() {
  const [status, setStatus] = useState<CallStatus>('idle')
  const [muted, setMuted] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const vapiRef = useRef<Vapi | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!PUBLIC_KEY) return
    let cancelled = false

    import('@vapi-ai/web').then(({ default: VapiClient }) => {
      if (cancelled) return
      const vapi = new VapiClient(PUBLIC_KEY)
      vapiRef.current = vapi

      vapi.on('call-start', () => {
        setStatus('active')
        setTranscript([])
        setErrorMsg(null)
      })
      vapi.on('call-end', () => {
        setStatus('idle')
        setSpeaking(false)
        setMuted(false)
      })
      vapi.on('speech-start', () => setSpeaking(true))
      vapi.on('speech-end', () => setSpeaking(false))
      vapi.on('message', (msg: unknown) => {
        if (isTranscriptMessage(msg) && msg.transcriptType === 'final') {
          setTranscript((prev) => [...prev, { role: msg.role, text: msg.transcript }])
        }
      })
      vapi.on('error', (err: unknown) => {
        // eslint-disable-next-line no-console
        console.error('[vapi] call failed:', JSON.stringify(err, null, 2))
        setErrorMsg(describeVapiError(err))
        setStatus('idle')
      })
    })

    return () => {
      cancelled = true
      vapiRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  async function startCall() {
    if (!vapiRef.current || status !== 'idle') return
    unlockAudioPlayback()
    setStatus('connecting')
    setErrorMsg(null)
    try {
      await vapiRef.current.start(VAPI_ASSISTANT_CONFIG)
    } catch {
      setStatus('idle')
      setErrorMsg('Could not start the voice assistant. Please try again.')
    }
  }

  function endCall() {
    vapiRef.current?.stop()
    setStatus('idle')
  }

  function toggleMute() {
    if (!vapiRef.current) return
    const next = !muted
    vapiRef.current.setMuted(next)
    setMuted(next)
  }

  if (!PUBLIC_KEY) return null

  const open = status === 'connecting' || status === 'active'

  return (
    <>
      {open && (
        <div className="vapi-panel">
          <div className="vapi-panel-head">
            <div className={`vapi-orb${speaking ? ' speaking' : ''}`}>
              <MicIcon size={18} color="#fff" />
            </div>
            <div className="vapi-panel-head-text">
              <div className="vapi-panel-title">ARC PEM Assistant</div>
              <div className="vapi-panel-status">
                {status === 'connecting' ? 'Connecting…' : speaking ? 'Speaking…' : 'Listening…'}
              </div>
            </div>
            <button className="vapi-panel-close" onClick={endCall} aria-label="End call">✕</button>
          </div>

          <div className="vapi-transcript">
            {transcript.length === 0 && status === 'active' && (
              <div className="vapi-transcript-hint">
                Ask about pricing, features, offline security, or how to book a demo.
              </div>
            )}
            {transcript.map((line, i) => (
              <div key={i} className={`vapi-line vapi-line-${line.role}`}>{line.text}</div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          <div className="vapi-panel-actions">
            <button className="vapi-mute-btn" onClick={toggleMute}>
              {muted ? <MicOffIcon size={14} /> : <MicIcon size={14} />}
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <button className="vapi-end-btn" onClick={endCall}>End Call</button>
          </div>
        </div>
      )}

      {errorMsg && !open && <div className="vapi-error-toast">{errorMsg}</div>}

      <button
        className={`vapi-fab${open ? ' active' : ''}${status === 'connecting' ? ' connecting' : ''}`}
        onClick={open ? endCall : startCall}
        disabled={status === 'connecting'}
        aria-label={open ? 'End voice assistant call' : 'Talk to the ARC PEM voice assistant'}
      >
        {open ? <span className="vapi-fab-stop" /> : <MicIcon size={20} color="#fff" />}
      </button>
    </>
  )
}
