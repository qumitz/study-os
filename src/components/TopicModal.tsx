import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  Lock,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Edit3
} from 'lucide-react';
import { Topic, Question } from '../types';
import { AdminTopicEditor } from './AdminTopicEditor';
import { SynopsisViewer } from './SynopsisViewer';

interface TopicModalProps {
  topic: Topic | null;
  onClose: () => void;
  onCompleteTopic: (
    topicId: string, 
    score: number,
    answers?: Record<number, number>,
    correctCount?: number,
    totalQuestions?: number
  ) => void;
  isCompleted: boolean;
  savedGrade?: { score: number; completedAt: string };
  isAdmin?: boolean;
  isTeacher?: boolean;
  onSaveTopic?: (updatedTopic: Topic) => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  topic,
  onClose,
  onCompleteTopic,
  isCompleted,
  savedGrade,
  isAdmin = false,
  isTeacher = false,
  onSaveTopic
}) => {
  if (!topic) return null;

  const isTeacherOrAdmin = isAdmin || isTeacher;
  const [activeTab, setActiveTab] = useState<'synopsis' | 'test'>('synopsis');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isTeacherPreviewMode, setIsTeacherPreviewMode] = useState(false);
  
  // Test state
  const test = topic.test;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [testFinished, setTestFinished] = useState(false);
  const [testScore, setTestScore] = useState<number | null>(savedGrade?.score ?? null);
  const [timeLeft, setTimeLeft] = useState<number>((test?.durationMinutes ?? 15) * 60);
  const [timerActive, setTimerActive] = useState(false);

  // Start timer when entering test tab if not completed and not in teacher inspection mode
  useEffect(() => {
    if (activeTab === 'test' && !isCompleted && !testFinished && !timerActive && !isTeacherOrAdmin) {
      setTimerActive(true);
    }
  }, [activeTab, isCompleted, testFinished, timerActive, isTeacherOrAdmin]);

  useEffect(() => {
    if (!timerActive || testFinished || isCompleted || isTeacherOrAdmin) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, testFinished, isCompleted, selectedAnswers, isTeacherOrAdmin]);

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    if (isCompleted || testFinished) return; // Prevent changing after submission
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitTest = () => {
    if (!test || testFinished || isCompleted) return;
    setTimerActive(false);

    // Calculate score on 10-point scale
    let correctCount = 0;
    test.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.max(
      2,
      Math.round((correctCount / test.questions.length) * 10)
    );

    setTestScore(calculatedScore);
    setTestFinished(true);
    onCompleteTopic(
      topic.id, 
      calculatedScore, 
      selectedAnswers, 
      correctCount, 
      test.questions.length
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#FFFFFF] dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E5E7EB] dark:border-[#262A32] bg-[#F9FAFB] dark:bg-[#181B21]">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
              topic.isExam 
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
            }`}>
              {topic.code}
            </span>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-semibold text-[#111827] dark:text-[#F3F3EF] leading-snug line-clamp-1">
                {topic.title}
              </h2>
              <span className="text-xs text-[#6B7280] dark:text-[#8E95A2]">
                Объём: {topic.hours} ч. • {topic.isExam ? 'Обязательный контроль' : 'Теория и самопроверка'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isTeacherOrAdmin && (
              <button
                onClick={() => setIsEditorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Редактировать тему {isAdmin ? '(Админ)' : '(Преподаватель)'}</span>
              </button>
            )}

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-[#E5E7EB] dark:border-[#262A32] bg-[#FFFFFF] dark:bg-[#15181E]">
          <button
            onClick={() => setActiveTab('synopsis')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'synopsis'
                ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
                : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Конспект лекции</span>
          </button>

          {test && (
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'test'
                  ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
                  : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Тест по теме</span>
              {isCompleted ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Сдано: {savedGrade?.score ?? testScore}/10
                </span>
              ) : isTeacherOrAdmin ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Режим учителя
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  1 попытка
                </span>
              )}
            </button>
          )}
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {activeTab === 'synopsis' ? (
            /* SYNOPSIS TAB */
            <div className="space-y-6">
              {/* Summary highlight */}
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-950 dark:text-blue-200">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">
                  Краткая суть темы
                </h4>
                <p className="text-sm leading-relaxed">
                  {topic.synopsis.summary}
                </p>
              </div>

              {/* Key points bullets */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1C2027] border border-[#E5E7EB] dark:border-[#2B313A]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] mb-3">
                  Ключевые тезисы для конспекта:
                </h4>
                <ul className="space-y-2">
                  {topic.synopsis.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#374151] dark:text-[#D1D5DB]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2"></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full lecture content with image and lightbox support */}
              <div className="pt-2">
                <SynopsisViewer content={topic.synopsis.content} />
              </div>

              {/* Footer action to start test */}
              {test && (
                <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#262A32] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    <Clock className="w-4 h-4" />
                    <span>Время на тест: {test.durationMinutes} мин • 10-балльная шкала</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('test')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
                  >
                    <span>
                      {isCompleted 
                        ? 'Посмотреть результаты теста' 
                        : isTeacherOrAdmin 
                        ? 'Ознакомиться с тестом и ответами' 
                        : 'Перейти к тесту'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : test ? (
            isTeacherOrAdmin && !isTeacherPreviewMode ? (
                /* TEACHER INSPECTION VIEW */
                <div className="space-y-6">
                  {/* Teacher Inspection Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                            Режим преподавателя: Полный обзор теста и эталонов
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200/70 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                            {test.questions.length} вопросов
                          </span>
                        </div>
                        <span className="text-xs text-indigo-700 dark:text-indigo-300/80">
                          Сдавать тест не требуется. Ниже представлены все вопросы, эталонные правильные ответы и пояснения.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsEditorOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Редактировать тест</span>
                      </button>
                      <button
                        onClick={() => setIsTeacherPreviewMode(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-950 text-xs font-semibold transition-colors"
                      >
                        <span>Симуляция студента</span>
                      </button>
                    </div>
                  </div>

                  {/* Question by question breakdown for teacher */}
                  <div className="space-y-4">
                    {test.questions.map((q, qIdx) => (
                      <div 
                        key={q.id || qIdx} 
                        className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181B21] shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                              {qIdx + 1}
                            </span>
                            <h4 className="text-sm font-semibold text-[#111827] dark:text-[#F3F3EF] leading-snug">
                              {q.question}
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono font-medium text-gray-500 shrink-0">
                            Макс. балл: 10
                          </span>
                        </div>

                        {/* Options with correct highlighted */}
                        <div className="space-y-2 pl-8">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = optIdx === q.correctIndex;
                            return (
                              <div 
                                key={optIdx} 
                                className={`p-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 border transition-colors ${
                                  isCorrect
                                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium'
                                    : 'bg-gray-50/60 dark:bg-[#121418] border-gray-200 dark:border-gray-800/80 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                {isCorrect && (
                                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Эталонный ответ</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Pedagogical Explanation */}
                        {q.explanation && (
                          <div className="ml-8 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                            <span className="font-semibold block text-blue-700 dark:text-blue-400">
                              Методическое пояснение для студента:
                            </span>
                            <p className="leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* REGULAR STUDENT TEST FORM / OR TEACHER PREVIEW SIMULATION */
                <div className="space-y-6">
                  {isTeacherPreviewMode && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        Режим симуляции прохождения теста (оценка не повлияет на успеваемость)
                      </span>
                      <button
                        onClick={() => setIsTeacherPreviewMode(false)}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        ← Вернуться к обзору учителя
                      </button>
                    </div>
                  )}

                  {/* Test Header Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                          Режим строгого тестирования
                        </span>
                        <span className="text-xs text-amber-700 dark:text-amber-400/90">
                          Тест проходится один раз. Оценка автоматически заносится в ведомость группы 37В.
                        </span>
                      </div>
                    </div>

                    {!isCompleted && !testFinished && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#15181E] border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold shrink-0">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(timeLeft)}</span>
                      </div>
                    )}
                  </div>

              {/* Already Completed or Finished View */}
              {(isCompleted || testFinished) ? (
                <div className="space-y-6 text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-2">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827] dark:text-[#F3F3EF]">
                    Тест завершён!
                  </h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-lg">
                    <span>Итоговая оценка:</span>
                    <span className="text-2xl text-emerald-600 dark:text-emerald-400">
                      {savedGrade?.score ?? testScore} / 10
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] max-w-md mx-auto">
                    Оценка сохранена в электронном журнале преподавателя Селедцова А.И. для студента группы 37В. Следующая тема разблокирована на древе предметов!
                  </p>

                  {/* Review questions */}
                  <div className="mt-8 text-left space-y-4">
                    <h4 className="text-sm font-semibold text-[#111827] dark:text-[#F3F3EF] border-b pb-2 dark:border-gray-800">
                      Разбор вопросов:
                    </h4>
                    {test?.questions.map((q, qIdx) => {
                      const userAns = selectedAnswers[qIdx];
                      const isCorrect = userAns === q.correctIndex;
                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#181B21] space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-gray-500">{qIdx + 1}.</span>
                            <span className="text-xs sm:text-sm font-medium text-[#111827] dark:text-[#F3F3EF]">{q.question}</span>
                          </div>
                          <div className="text-xs space-y-1 pl-4">
                            {q.options.map((opt, optIdx) => {
                              const isTarget = optIdx === q.correctIndex;
                              const isChosen = optIdx === userAns;
                              let badgeClass = 'text-gray-600 dark:text-gray-400';
                              if (isTarget) badgeClass = 'text-emerald-600 font-semibold dark:text-emerald-400';
                              if (isChosen && !isTarget) badgeClass = 'text-rose-600 font-semibold dark:text-rose-400 line-through';
                              return (
                                <div key={optIdx} className={`flex items-center gap-2 ${badgeClass}`}>
                                  <span>{isTarget ? '✓' : isChosen ? '✗' : '•'}</span>
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-4 border-l-2 border-blue-400 mt-2">
                            {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Ongoing Question Form */
                <div className="space-y-6">
                    {/* Question progress count */}
                    <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      <span>Вопрос {currentQuestionIndex + 1} из {test.questions.length}</span>
                      <span>Отвечено: {Object.keys(selectedAnswers).length} / {test.questions.length}</span>
                    </div>

                    {/* Question card */}
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#181B21] border border-[#E5E7EB] dark:border-[#262A32] space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#111827] dark:text-[#F3F3EF]">
                        {test.questions[currentQuestionIndex].question}
                      </h3>

                      {/* Options */}
                      <div className="space-y-2.5">
                        {test.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(currentQuestionIndex, optIdx)}
                              className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-xs sm:text-sm text-left transition-all border ${
                                isSelected
                                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] dark:bg-blue-950/40 dark:border-[#3B82F6] dark:text-blue-300 font-medium'
                                  : 'bg-white dark:bg-[#121418] border-gray-200 dark:border-gray-800 text-[#374151] dark:text-[#D1D5DB] hover:border-gray-300 dark:hover:border-gray-700'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 border ${
                                isSelected 
                                  ? 'border-[#2563EB] bg-[#2563EB] text-white' 
                                  : 'border-gray-300 dark:border-gray-700 text-gray-500'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Question navigation footer */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        ← Предыдущий
                      </button>

                      {currentQuestionIndex < test.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                        >
                          Следующий вопрос →
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitTest}
                          disabled={Object.keys(selectedAnswers).length < test.questions.length}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          Завершить тест и сдать
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : null}
        </div>
      </div>

      {/* Admin Topic Editor Modal */}
      {isTeacherOrAdmin && (
        <AdminTopicEditor
          topic={topic}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={(updated) => {
            onSaveTopic?.(updated);
            setIsEditorOpen(false);
          }}
        />
      )}
    </div>
  );
};
