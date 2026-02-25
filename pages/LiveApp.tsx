import React, { useState, useEffect, useRef } from 'react';
import { getGeminiClient } from '../services/gemini';
import { LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, Radio, Volume2, Activity, AlertCircle } from 'lucide-react';
import { MODELS } from '../types';

// Audio Utils within file to ensure closure access
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  const uint8 = new Uint8Array(int16.buffer);
  
  // Custom encode function
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const base64Data = btoa(binary);

  return {
    data: base64Data,
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveApp: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [volume, setVolume] = useState(0);
  
  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); // To store session object for closing
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Visualizer animation
  useEffect(() => {
    let animId: number;
    if (isActive) {
      const updateVolume = () => {
        // Mock visualizer volume for UI effect since we process in backend/scriptprocessor
        setVolume(Math.random() * 100);
        animId = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } else {
      setVolume(0);
    }
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  const stopSession = () => {
    if (sessionRef.current) {
      // No explicit close method on the session object returned by promise, 
      // but we can stop sending data and close audio contexts.
      // The API doesn't expose a clean disconnect method on the returned session object easily in all versions,
      // but stopping audio contexts effectively ends the flow.
      // Actually, based on documentation, we can't easily "close" the websocket from client side 
      // except by letting it timeout or handling the connection drop.
      // We will refresh the page or component state to reset.
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    // Stop all playing sources
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    setIsActive(false);
    setStatus('disconnected');
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      const ai = getGeminiClient();

      // Setup Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are HolanTower, a sophisticated AI assistant. Keep responses concise and helpful.',
        },
        callbacks: {
          onopen: () => {
            console.log("Connection opened");
            setStatus('connected');
            setIsActive(true);

            if (!inputAudioContextRef.current) return;

            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
               sourcesRef.current.forEach(source => {
                 try { source.stop(); } catch(e) {}
               });
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Connection closed");
            stopSession();
          },
          onerror: (err) => {
            console.error("Connection error", err);
            setStatus('error');
            stopSession();
          }
        }
      });
      
      // Store session promise if needed, but we rely on closures mostly
      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start session:", error);
      setStatus('error');
      setIsActive(false);
    }
  };

  const toggleSession = () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 bg-tower-900 text-white relative overflow-hidden">
      
      {/* Background Pulse Effect */}
      {isActive && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
         </div>
      )}

      <div className="z-10 text-center space-y-8 max-w-lg w-full">
        <div>
           <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-tower-800 border border-tower-700 text-xs font-medium text-tower-400 mb-6">
              <Radio size={14} className={isActive ? "text-red-500 animate-pulse" : "text-tower-600"} />
              <span>{status === 'connected' ? 'LIVE BROADCAST ACTIVE' : status === 'connecting' ? 'ESTABLISHING LINK...' : 'CHANNEL OFFLINE'}</span>
           </div>
           <h2 className="text-4xl font-bold tracking-tight">Holan Live</h2>
           <p className="mt-4 text-tower-400">
             Real-time, low-latency audio channel with Gemini 2.5. Speak naturally to the tower.
           </p>
        </div>

        {/* Status Indicator / Visualizer Placeholder */}
        <div className="h-24 flex items-center justify-center space-x-2">
           {isActive ? (
             Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-3 bg-red-500 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(10, Math.random() * volume)}%`, opacity: 0.8 }}
                ></div>
             ))
           ) : (
             <div className="w-full h-[1px] bg-tower-800"></div>
           )}
        </div>

        {status === 'error' && (
           <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm flex items-center justify-center">
              <AlertCircle size={16} className="mr-2" />
              Connection Interrupted. Please check API Key or permissions.
           </div>
        )}

        <button
          onClick={toggleSession}
          className={`
             w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
             ${isActive 
               ? 'bg-red-600 hover:bg-red-700 shadow-red-900/40 ring-4 ring-red-900/20' 
               : 'bg-tower-700 hover:bg-tower-600 shadow-black/40'}
          `}
        >
          {isActive ? <MicOff size={32} /> : <Mic size={32} />}
        </button>

        <div className="text-xs text-tower-600">
           Microphone access required. Audio processed via WebSocket.
        </div>
      </div>
    </div>
  );
};

export default LiveApp;