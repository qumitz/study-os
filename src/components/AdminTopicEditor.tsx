import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Edit3, Shield } from 'lucide-react';
import { Topic, Question } from '../types';

interface AdminTopicEditorProps {
  topic: Topic;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTopic: Topic) => void;
}

export const AdminTopicEditor: React.FC<AdminTopicEditorProps> = ({
  topic,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(topic.title);
  const [shortDesc, setShortDesc] = useState(topic.shortDescription);
  const [hours, setHours] = useState(topic.hours);
  const [summary, setSummary] = useState(topic.synopsis.summary);
  const [content, setContent] = useState(topic.synopsis.content);
  const [keyPointsText, setKeyPointsText] = useState(topic.synopsis.keyPoints.join('\n'));

  // Test questions
  const [questions, setQuestions] = useState<Question[]>(topic.test?.questions || []);

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q-custom-${Date.now()}`,
      question: 'Новый вопрос теста...',
      options: ['Вариант A', 'Вариант B', 'Вариант C', 'Вариант D'],
      correctIndex: 0,
      explanation: 'Пояснение к правильному ответу...'
    };
    setQuestions(prev => [...prev, newQ]);
  };

  const handleUpdateQuestion = (idx: number, updated: Partial<Question>) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updated };
      return copy;
    });
  };

  const handleDeleteQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const updated: Topic = {
      ...topic,
      title,
      shortDescription: shortDesc,
      hours: Number(hours),
      synopsis: {
        ...topic.synopsis,
        summary,
        keyPoints: keyPointsText.split('\n').filter(p => p.trim().length > 0),
        content
      },
      test: topic.test ? {
        ...topic.test,
        questions
      } : undefined
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1E24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                Панель администратора: Редактирование темы {topic.code}
              </h3>
              <span className="text-xs text-gray-500">
                Все изменения сохраняются в базу данных Study OS
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Название темы</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Часы (по КТП)</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Short description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Краткое описание темы</label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Synopsis Summary */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Краткая суть конспекта (плашка)</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Key points */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Ключевые тезисы (каждый с новой строки)</label>
            <textarea
              rows={3}
              value={keyPointsText}
              onChange={(e) => setKeyPointsText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono"
            />
          </div>

          {/* Full content */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Полный текст лекции (Markdown)</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono leading-relaxed"
            />
          </div>

          {/* Questions Editor */}
          {topic.test && (
            <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Вопросы теста ({questions.length} шт.)
                </h4>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить вопрос</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#181B21] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Вопрос №{qIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIdx)}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Удалить</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(qIdx, { question: e.target.value })}
                      placeholder="Текст вопроса..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium"
                    />

                    {/* Options */}
                    <div className="space-y-1.5 pl-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() => handleUpdateQuestion(qIdx, { correctIndex: optIdx })}
                            className="text-blue-600"
                            title="Отметить как правильный ответ"
                          />
                          <span className="text-xs font-bold text-gray-400 w-4">
                            {String.fromCharCode(65 + optIdx)}:
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[optIdx] = e.target.value;
                              handleUpdateQuestion(qIdx, { options: newOpts });
                            }}
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestion(qIdx, { explanation: e.target.value })}
                      placeholder="Пояснение к правильному ответу..."
                      className="w-full px-3 py-1 text-[11px] rounded-lg bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-700 text-gray-500 italic"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1E24]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить тему</span>
          </button>
        </div>
      </div>
    </div>
  );
};
