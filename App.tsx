import React, { useState, useCallback } from 'react';
import { generateLogo, refineLogo } from './services/geminiService';
import Spinner from './components/Spinner';

function App() {
  const [description, setDescription] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [generatedLogo, setGeneratedLogo] = useState<{ url: string; base64: string; mimeType: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      setError('로고를 생성할 서비스 설명을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedLogo(null);
    setFeedback('');
    try {
      const { base64, mimeType } = await generateLogo(description);
      setGeneratedLogo({ url: `data:${mimeType};base64,${base64}`, base64, mimeType });
    } catch (err) {
      setError('로고 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [description]);

  const handleRefine = useCallback(async () => {
    if (!generatedLogo || !feedback.trim()) {
      setError('수정할 로고가 없거나 피드백이 입력되지 않았습니다.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
        const { base64, mimeType } = await refineLogo(generatedLogo.base64, generatedLogo.mimeType, feedback);
        setGeneratedLogo({ url: `data:${mimeType};base64,${base64}`, base64, mimeType });
        setFeedback('');
    } catch (err) {
        setError('로고 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [generatedLogo, feedback]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">
            AI 로고 생성기
          </h1>
          <p className="text-gray-400 mt-1">아이디어를 입력하여 비즈니스를 위한 아름다운 로고를 만드세요.</p>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Controls Panel */}
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="description" className="text-lg font-semibold mb-2 text-gray-300 block">1. 어떤 로고를 원하시나요?</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 개발자를 위한 커피숍 '코드앤브루'"
                className="w-full bg-gray-800 p-3 text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none rounded-lg border border-gray-700 shadow-sm transition"
                rows={3}
              />
               <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="mt-3 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading && !generatedLogo ? <Spinner /> : null}
                <span className="ml-2">로고 생성하기</span>
              </button>
            </div>

            {generatedLogo && (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 animate-fade-in">
                <label htmlFor="feedback" className="text-lg font-semibold mb-2 text-gray-300 block">2. 로고 수정하기</label>
                <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="예: 파란색을 더 사용해주세요, 더 미니멀하게 만들어주세요"
                    className="w-full bg-gray-800 p-3 text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:outline-none rounded-lg border border-gray-700 shadow-sm transition"
                    rows={3}
                />
                <button
                    onClick={handleRefine}
                    disabled={isLoading}
                    className="mt-3 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isLoading && feedback ? <Spinner /> : null}
                    <span className="ml-2">피드백 반영하여 수정</span>
                </button>
              </div>
            )}
            {error && <p className="mt-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-md">{error}</p>}
          </div>

          {/* Output Panel */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-gray-300">생성된 로고</h2>
            <div className="flex-grow bg-gray-800 rounded-lg border border-gray-700 shadow-lg min-h-[400px] flex items-center justify-center p-4">
              {isLoading ? (
                <div className="flex flex-col items-center text-gray-400">
                    <Spinner />
                    <span className="mt-4 text-lg">AI가 로고를 만들고 있습니다...</span>
                </div>
              ) : generatedLogo ? (
                <img 
                  src={generatedLogo.url} 
                  alt="Generated Logo" 
                  className="max-w-full max-h-full object-contain rounded-md animate-fade-in"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p>생성된 로고가 여기에 표시됩니다.</p>
                  <p className="text-sm mt-1">왼쪽에서 서비스 설명을 입력하고 시작하세요.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
          <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
}

export default App;