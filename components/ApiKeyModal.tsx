
import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
  error?: string | null;
}

const DEMO_API_KEY = 'AIzaSyBOXbpV3lvP6UtUK1irEj4t79WSWG4sdrY';

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, error }) => {
  const [key, setKey] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Chép');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(key);
  };
  
  const handleCopyDemoKey = () => {
    navigator.clipboard.writeText(DEMO_API_KEY).then(() => {
        setKey(DEMO_API_KEY);
        setCopyButtonText('Đã chép!');
        setTimeout(() => setCopyButtonText('Chép'), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div 
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 m-4 text-gray-800 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-blue-900">Nhập API Key</h2>
        <p className="mt-2 text-gray-600">Để sử dụng Trợ lý AI, bạn cần cung cấp một Google AI API Key.</p>
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Dán API Key của bạn vào đây"
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="mt-4 w-full px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:scale-100"
            disabled={!key.trim()}
          >
            Lưu và Bắt đầu
          </button>
        </form>

        <div className="mt-6 border-t border-blue-200/50 pt-4 text-sm text-gray-700 space-y-4">
            <div>
                <p className="font-semibold">Chưa có API Key?</p>
                <p className="mt-1">Bạn có thể dùng key demo dưới đây để chạy thử phần mềm:</p>
                <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded-lg border border-gray-300">
                    <code className="text-xs text-gray-700 break-all select-all">{DEMO_API_KEY}</code>
                    <button 
                        onClick={handleCopyDemoKey}
                        className="ml-2 px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-md hover:bg-gray-300 transition-colors"
                    >
                        {copyButtonText}
                    </button>
                </div>
            </div>
             <div>
                <p className="mt-1">Hoặc tạo một API Key mới miễn phí tại Google AI Studio:</p>
                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-2 block w-full px-8 py-3 bg-green-600 text-white text-center font-bold rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                    Tạo API Key mới
                </a>
            </div>
        </div>

         <p className="text-xs text-gray-500 mt-6 text-center">
            API Key của bạn sẽ được lưu an toàn trong trình duyệt và không được chia sẻ đi đâu khác.
        </p>
      </div>
    </div>
  );
};
