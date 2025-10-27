import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VirtualLab } from './components/VirtualLab';
import { ActionPanel } from './components/ActionPanel';
import { AiAssistant } from './components/AiAssistant';
import { AuthorInfoModal } from './components/AuthorInfoModal';
import { getAiResponse, getInitialGreeting } from './services/geminiService';
import { ActionType, LabState, AiMessage, Quiz, MessageSender } from './types';
import { useSoundEffects } from './hooks/useSoundEffects';

// Helper functions for audio decoding
function decode(base64: string): Uint8Array {
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

const initialLabState: LabState = {
  isHeating: false,
  showVapor: false,
  isIceOnLid: false,
  showCondensation: false,
  isIceInWater: false,
  isSaltInWater: false,
};

// Fix: Changed return type from JSX.Element to React.ReactElement to resolve namespace issue.
export default function App(): React.ReactElement {
  const [labState, setLabState] = useState<LabState>(initialLabState);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionHistory, setActionHistory] = useState<ActionType[]>([]);
  const [usedQuizQuestions, setUsedQuizQuestions] = useState<string[]>([]);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);


  const labStateRef = useRef(labState);
  labStateRef.current = labState;
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEffects = useSoundEffects(audioContextRef);
  const prevMessagesLength = useRef(messages.length);

  const handleApiError = (error: any) => {
    console.error('An API error occurred:', error);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: MessageSender.AI, text: 'Ôi, có lỗi kết nối với AI rồi. Con hãy thử tải lại trang nhé.' }]);
    setIsLoading(false);
  };

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if(AudioContext) {
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  }, []);

  const playAudio = useCallback(async (base64Audio: string | null | undefined) => {
    if (!base64Audio || !audioContextRef.current) {
        return;
    }
    try {
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
    } catch (error) {
        console.error("Failed to play audio:", error);
    }
  }, []);

  const loadInitialGreeting = useCallback(async () => {
    setIsLoading(true);
    setMessages([]);
    try {
      const { text, audio } = await getInitialGreeting();
      setMessages([{ id: 'init', sender: MessageSender.AI, text, audio }]);
      playAudio(audio);
    } catch (error) {
      console.error('Failed to get initial greeting:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [playAudio]);

  useEffect(() => {
    loadInitialGreeting();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    // Play sound on new AI message, but not the initial greeting
    if (messages.length > prevMessagesLength.current) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender === MessageSender.AI && lastMessage.id !== 'init' && lastMessage.id !== 'api-key-error') {
            soundEffects.playReceive();
        }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, soundEffects]);

  const handleAction = useCallback(async (action: ActionType) => {
    initAudioContext();
    soundEffects.playClick();
    if (isLoading) return;
    setIsLoading(true);
    setActionHistory(prev => [...prev, action]);

    // Optimistically update UI
    if (action === ActionType.HEAT_WATER) {
      setLabState(s => ({ ...s, isHeating: true }));
      setTimeout(() => setLabState(s => ({ ...s, showVapor: true })), 2000);
    }
    if (action === ActionType.ADD_ICE && labStateRef.current.showVapor) {
      setLabState(s => ({ ...s, isIceOnLid: true }));
      setTimeout(() => setLabState(s => ({ ...s, showCondensation: true })), 2000);
    }
     if (action === ActionType.DROP_ICE_IN_WATER) {
      setLabState(s => ({ ...s, isIceInWater: true }));
      // Simulate water cooling down
      setTimeout(() => setLabState(s => ({ ...s, showVapor: false, isHeating: false })), 5000);
    }
    if (action === ActionType.DISSOLVE_SALT) {
      setLabState(s => ({ ...s, isSaltInWater: true }));
    }
    
    try {
      const response = await getAiResponse(action, labStateRef.current, actionHistory, undefined, undefined, usedQuizQuestions);
      const newAiMessage = { id: Date.now().toString(), sender: MessageSender.AI, text: response.explanation, audio: response.audio };
      setMessages(prev => [...prev, newAiMessage]);
      playAudio(response.audio);

      if (response.quiz) {
        setCurrentQuiz(response.quiz);
        setUsedQuizQuestions(prev => [...prev, response.quiz!.question]);
      }
    } catch (error) {
       handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, actionHistory, playAudio, soundEffects, initAudioContext, usedQuizQuestions]);

  const handleUserMessage = useCallback(async (message: string) => {
    initAudioContext();
    soundEffects.playSend();
    if (isLoading) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: MessageSender.USER, text: message }]);
    setIsLoading(true);
    
    const isQuizAnswer = !!currentQuiz;
    const action = isQuizAnswer ? ActionType.ANSWER_QUIZ : ActionType.ASK_QUESTION;

    try {
        const response = await getAiResponse(action, labStateRef.current, actionHistory, message, currentQuiz ?? undefined, usedQuizQuestions);
        const newAiMessage = { id: `${Date.now()}-feedback`, sender: MessageSender.AI, text: response.explanation, audio: response.audio };
        setMessages(prev => [...prev, newAiMessage]);
        playAudio(response.audio);

        if (response.quiz) {
            setCurrentQuiz(response.quiz);
            setUsedQuizQuestions(prev => [...prev, response.quiz!.question]);
        }

    } catch (error) {
        handleApiError(error);
    } finally {
        if (isQuizAnswer) {
            setCurrentQuiz(null);
        }
        setIsLoading(false);
    }
  }, [isLoading, currentQuiz, actionHistory, playAudio, soundEffects, initAudioContext, usedQuizQuestions]);

  const handleReset = useCallback(() => {
    initAudioContext();
    soundEffects.playClick();
    setLabState(initialLabState);
    setCurrentQuiz(null);
    setActionHistory([]);
    setUsedQuizQuestions([]);
    loadInitialGreeting();
  }, [initAudioContext, soundEffects, loadInitialGreeting]);

  return (
    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 min-h-screen text-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="text-center mb-6">
         <div className="hidden sm:flex justify-between items-center text-sm font-semibold text-gray-700 mb-4">
            <span>Trường Tiểu Học Phước Mỹ Trung</span>
            <span>Ứng dụng AI Trong Giảng Dạy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-600">AI Lab</h1>
        <div>
          <p className="text-lg sm:text-xl font-bold text-amber-600">Phòng Thí Nghiệm Ảo Một Số Hiện Tượng Của Nước</p>
          <p className="text-sm sm:text-base text-amber-600 mt-1">(Trích Sách Giáo Khoa Môn Khoa Học Lớp 4)</p>
        </div>
      </header>
      <main className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
        <div className="md:col-span-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-2 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden border border-blue-200">
          <VirtualLab state={labState} />
        </div>
        <div className="md:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex flex-col border border-blue-200">
            <AiAssistant 
              messages={messages}
              quiz={currentQuiz}
              isLoading={isLoading}
              onSendMessage={handleUserMessage}
            />
            <ActionPanel onAction={handleAction} labState={labState} isLoading={isLoading} />
            <div className="text-center mt-4 space-y-3">
              <button 
                onClick={handleReset}
                className="w-full px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Làm Lại
              </button>
               <button 
                onClick={() => setIsAuthorModalOpen(true)}
                className="w-full px-8 py-3 bg-yellow-800 text-white font-bold rounded-full shadow-lg hover:bg-yellow-900 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400"
              >
                Tác Giả
              </button>
            </div>
        </div>
      </main>
      <AuthorInfoModal isOpen={isAuthorModalOpen} onClose={() => setIsAuthorModalOpen(false)} />
    </div>
  );
}