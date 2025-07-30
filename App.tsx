import React, { useState, useCallback } from 'react';
import { AppState } from './types';
import type { Question, Answer, LearningStyleResult } from './types';
import { generateTestQuestions, analyzeAnswersAndGetResult } from './services/geminiService';
import PixelatedContainer from './components/PixelatedContainer';
import RetroButton from './components/RetroButton';
import LoadingIndicator from './components/LoadingIndicator';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.START);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<LearningStyleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const handleStartTest = useCallback(async () => {
    setAppState(AppState.LOADING);
    setLoadingMessage('퀘스트 불러오는 중...');
    setError(null);
    try {
      const fetchedQuestions = await generateTestQuestions();
      if (fetchedQuestions && fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setAppState(AppState.TESTING);
      } else {
        throw new Error("서버에서 질문을 가져오지 못했습니다.");
      }
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleAnswerSelect = useCallback(async (answer: Answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setAppState(AppState.ANALYZING);
      setLoadingMessage('스타일 분석 중...');
      try {
        const analysisResult = await analyzeAnswersAndGetResult(newAnswers);
        setResult(analysisResult);
        setAppState(AppState.RESULT);
      } catch (err: any) {
        setError(err.message || '분석 중 알 수 없는 오류가 발생했습니다.');
        setAppState(AppState.ERROR);
      }
    }
  }, [answers, currentQuestionIndex, questions.length]);

  const handleRestart = () => {
    setAppState(AppState.START);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.START:
        return (
          <PixelatedContainer className="text-center">
            <h1 className="text-4xl md:text-5xl text-[#fb6f92] mb-4">학습 스타일 탐험</h1>
            <p className="mb-8 text-lg text-slate-600">숨겨진 학습 능력을 발견해 보아요!</p>
            <RetroButton onClick={handleStartTest}>모험 시작!</RetroButton>
          </PixelatedContainer>
        );

      case AppState.LOADING:
      case AppState.ANALYZING:
        return <LoadingIndicator message={loadingMessage} />;

      case AppState.TESTING:
        const question = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        return (
          <PixelatedContainer className="w-full max-w-2xl">
            <div className="mb-4">
              <p className="text-[#fb6f92] font-bold">질문 {currentQuestionIndex + 1}/{questions.length}</p>
              <div className="w-full bg-pink-100 rounded-full h-4 mt-2">
                <div className="bg-pink-400 h-4 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl mb-8 leading-relaxed text-slate-700">{question.text}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option) => (
                <RetroButton
                  key={option.type + currentQuestionIndex}
                  onClick={() => handleAnswerSelect({ questionId: question.id, type: option.type })}
                  className="w-full text-sm md:text-base py-4"
                >
                  {option.text}
                </RetroButton>
              ))}
            </div>
          </PixelatedContainer>
        );

      case AppState.RESULT:
        if (!result) return <p>결과를 찾을 수 없습니다.</p>;
        return (
          <PixelatedContainer className="w-full max-w-3xl">
            <h2 className="text-3xl md:text-4xl text-pink-500 text-center mb-2 font-bold">{result.type}</h2>
            <h3 className="text-xl md:text-2xl text-center mb-6 text-slate-600">{result.title}</h3>
            <p className="mb-6 text-base leading-relaxed text-slate-700">{result.description}</p>
            <h4 className="text-lg md:text-xl text-pink-500 mb-4 font-bold">당신의 파워업 아이템!</h4>
            <ul className="list-none space-y-3 mb-8">
              {result.studyTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-pink-400 mr-3 text-xl">✨</span>
                  <span className="text-slate-600">{tip}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <RetroButton onClick={handleRestart}>다시 탐험하기</RetroButton>
            </div>
          </PixelatedContainer>
        );
      
      case AppState.ERROR:
        return (
            <PixelatedContainer className="text-center">
                <h1 className="text-3xl text-red-500 mb-4">앗, 이런!</h1>
                <p className="mb-8 text-slate-600">{error}</p>
                <RetroButton onClick={handleRestart}>다시 시작하기</RetroButton>
            </PixelatedContainer>
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col p-4 text-xl">
      <main className="flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
