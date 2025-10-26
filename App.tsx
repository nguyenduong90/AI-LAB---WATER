import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VirtualLab } from './components/VirtualLab';
import { ActionPanel } from './components/ActionPanel';
import { AiAssistant } from './components/AiAssistant';
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

const ApiKeySelectionScreen: React.FC<{ onApiKeySet: (key: string) => void }> = ({ onApiKeySet }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError('Vui lòng nhập API Key.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Test the key by making an initial, lightweight call.
      await getInitialGreeting(inputValue);
      onApiKeySet(inputValue);
    } catch (err) {
      console.error('API Key validation failed:', err);
      setError('API Key không hợp lệ hoặc đã xảy ra lỗi mạng. Vui lòng kiểm tra lại Key và thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-lg text-center w-full">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Chào mừng đến với AI Lab!</h1>
        <p className="text-gray-700 mb-4">
          Để bắt đầu, vui lòng nhập Google AI API Key của bạn vào ô bên dưới.
        </p>
        <div className="mb-4">
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Dán API Key của bạn vào đây"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <p className="text-gray-600 mb-6 text-sm">
          Nếu chưa có API Key, bạn có thể 
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 font-semibold hover:underline mx-1"
          >
            tạo một key mới tại đây
          </a>.
        </p>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-wait"
        >
          {isLoading ? 'Đang xác thực...' : 'Bắt đầu Thí nghiệm'}
        </button>
        <p className="text-xs text-gray-500 mt-4">
          Key của bạn sẽ chỉ được lưu trong trình duyệt cho phiên này.
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            Tìm hiểu thêm về thanh toán.
          </a>
        </p>
      </form>
    </div>
  );
};


// Fix: Changed return type from JSX.Element to React.ReactElement to resolve namespace issue.
export default function App(): React.ReactElement {
  const [labState, setLabState] = useState<LabState>(initialLabState);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionHistory, setActionHistory] = useState<ActionType[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const labStateRef = useRef(labState);
  labStateRef.current = labState;
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEffects = useSoundEffects(audioContextRef);
  const prevMessagesLength = useRef(messages.length);

  const handleApiError = (error: any) => {
    console.error('An API error occurred:', error);
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMessage.includes("api key not valid") || errorMessage.includes("permission denied") || errorMessage.includes("requested entity was not found")) {
        setMessages(prev => [...prev, { id: 'api-key-error', sender: MessageSender.AI, text: 'API Key của bạn không hợp lệ hoặc đã hết hạn. Vui lòng nhập lại một Key khác để tiếp tục.' }]);
        setApiKey(null);
    } else {
       setMessages(prev => [...prev, { id: Date.now().toString(), sender: MessageSender.AI, text: 'Ôi, có lỗi xảy ra rồi. Con thử lại nhé?' }]);
    }
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
    if (!apiKey) return;
    setIsLoading(true);
    setMessages([]);
    try {
      const { text, audio } = await getInitialGreeting(apiKey);
      setMessages([{ id: 'init', sender: MessageSender.AI, text, audio }]);
      playAudio(audio);
    } catch (error) {
      console.error('Failed to get initial greeting:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [playAudio, apiKey]);

  useEffect(() => {
    if (apiKey) {
        loadInitialGreeting();
    }
  }, [apiKey]);
  
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
    if (isLoading || !apiKey) return;
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
      const response = await getAiResponse(apiKey, action, labStateRef.current, actionHistory);
      const newAiMessage = { id: Date.now().toString(), sender: MessageSender.AI, text: response.explanation, audio: response.audio };
      setMessages(prev => [...prev, newAiMessage]);
      playAudio(response.audio);

      if (response.quiz) {
        setCurrentQuiz(response.quiz);
      }
    } catch (error) {
       handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, actionHistory, playAudio, soundEffects, initAudioContext, apiKey]);

  const handleUserMessage = useCallback(async (message: string) => {
    initAudioContext();
    soundEffects.playSend();
    if (isLoading || !apiKey) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: MessageSender.USER, text: message }]);
    setIsLoading(true);
    
    const isQuizAnswer = !!currentQuiz;
    const action = isQuizAnswer ? ActionType.ANSWER_QUIZ : ActionType.ASK_QUESTION;

    try {
        const response = await getAiResponse(apiKey, action, labStateRef.current, actionHistory, message, currentQuiz ?? undefined);
        const newAiMessage = { id: `${Date.now()}-feedback`, sender: MessageSender.AI, text: response.explanation, audio: response.audio };
        setMessages(prev => [...prev, newAiMessage]);
        playAudio(response.audio);

        if (response.quiz) {
            setCurrentQuiz(response.quiz);
        }

    } catch (error) {
        handleApiError(error);
    } finally {
        if (isQuizAnswer) {
            setCurrentQuiz(null);
        }
        setIsLoading(false);
    }
  }, [isLoading, currentQuiz, actionHistory, playAudio, soundEffects, initAudioContext, apiKey]);

  const handleReset = useCallback(() => {
    initAudioContext();
    soundEffects.playClick();
    setLabState(initialLabState);
    setCurrentQuiz(null);
    setActionHistory([]);
    loadInitialGreeting();
  }, [initAudioContext, soundEffects, loadInitialGreeting]);

  if (!apiKey) {
    return <ApiKeySelectionScreen onApiKeySet={setApiKey} />;
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 min-h-screen text-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="relative text-center mb-6 pt-8 sm:pt-0">
         <div className="absolute top-0 left-0">
            <h2 className="text-base font-semibold text-gray-700">Trường Tiểu Học Phước Mỹ Trung</h2>
        </div>
        <div className="absolute top-0 right-0">
            <h2 className="text-base font-semibold text-gray-700">Ứng dụng AI Trong Giảng Dạy</h2>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-600">AI Lab</h1>
        <p className="text-lg sm:text-xl font-bold text-amber-600">Phòng Thí Nghiệm Ảo Các Hiện Tượng Khoa Học Lớp 4</p>
      </header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center relative overflow-hidden border border-blue-200">
          <VirtualLab state={labState} />
        </div>
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex flex-col border border-blue-200">
            <AiAssistant 
              messages={messages}
              quiz={currentQuiz}
              isLoading={isLoading}
              onSendMessage={handleUserMessage}
            />
            <ActionPanel onAction={handleAction} labState={labState} isLoading={isLoading} />
            <div className="text-center mt-4">
              <button 
                onClick={handleReset}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Làm Lại
              </button>
            </div>
        </div>
      </main>
    </div>
  );
}
