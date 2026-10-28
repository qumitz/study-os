import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Shield, 
  Image as ImageIcon, 
  Upload, 
  Clipboard, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Loader2, 
  Bold, 
  Heading1, 
  Heading2, 
  List, 
  Quote, 
  Code 
} from 'lucide-react';
import { Topic, Question } from '../types';
import { extractImagesFromClipboard, extractImagesFromFiles, formatMarkdownImage } from '../lib/imageUtils';
import { SynopsisViewer } from './SynopsisViewer';

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

  // Content mode: Editor or Live Preview
  const [contentViewMode, setContentViewMode] = useState<'editor' | 'preview'>('editor');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageFeedback, setImageFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Helper to insert markdown text at current cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + textToInsert);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = content;
    const next = current.substring(0, start) + textToInsert + current.substring(end);
    setContent(next);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };

  // Handle Ctrl+V clipboard paste with images
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const images = await extractImagesFromClipboard(e);
    if (images.length > 0) {
      e.preventDefault();
      setIsProcessingImage(true);
      let insertion = '';
      images.forEach(img => {
        insertion += formatMarkdownImage(img.name, img.dataUrl);
      });
      insertTextAtCursor(insertion);
      setIsProcessingImage(false);
      setImageFeedback(`✓ Вставлено изображений: ${images.length} (из буфера обмена)`);
      setTimeout(() => setImageFeedback(null), 3500);
    }
  };

  // Handle file picker upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingImage(true);
    const images = await extractImagesFromFiles(files);
    if (images.length > 0) {
      let insertion = '';
      images.forEach(img => {
        insertion += formatMarkdownImage(img.name, img.dataUrl);
      });
      insertTextAtCursor(insertion);
      setImageFeedback(`✓ Загружено изображений: ${images.length} (с устройства)`);
      setTimeout(() => setImageFeedback(null), 3500);
    }
    setIsProcessingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle clipboard read button
  const handlePasteButtonClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find(type => type.startsWith('image/'));
          if (imageType) {
            setIsProcessingImage(true);
            const blob = await item.getType(imageType);
            const file = new File([blob], `Иллюстрация_${new Date().toLocaleTimeString('ru-RU')}`, { type: imageType });
            const images = await extractImagesFromFiles([file]);
            if (images.length > 0) {
              insertTextAtCursor(formatMarkdownImage(images[0].name, images[0].dataUrl));
              setImageFeedback('✓ Изображение успешно вставлено из буфера обмена!');
              setTimeout(() => setImageFeedback(null), 3500);
            }
            setIsProcessingImage(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Clipboard read failed or permission denied:', e);
    }
    // Fallback notification
    setImageFeedback('💡 Поставьте курсор в поле конспекта и нажмите Ctrl+V для вставки');
    setTimeout(() => setImageFeedback(null), 4000);
  };

  // Handle drag & drop over the editor
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsProcessingImage(true);
      const images = await extractImagesFromFiles(e.dataTransfer.files);
      if (images.length > 0) {
        let insertion = '';
        images.forEach(img => {
          insertion += formatMarkdownImage(img.name, img.dataUrl);
        });
        insertTextAtCursor(insertion);
        setImageFeedback(`✓ Загружено изображений: ${images.length} (drag-and-drop)`);
        setTimeout(() => setImageFeedback(null), 3500);
      }
      setIsProcessingImage(false);
    }
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

  // Count embedded images
  const embeddedImagesCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Device Upload */}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1E24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                Редактирование темы {topic.code}: «{topic.title}»
              </h3>
              <span className="text-xs text-gray-500">
                Конспекты, иллюстрации из буфера обмена / устройства и тестовые задания
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
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

          {/* LECTURE NOTES & IMAGE INSERTION SECTION */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Содержание конспекта лекции (с поддержкой иллюстраций)
                </label>
                {embeddedImagesCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>{embeddedImagesCount} карт.</span>
                  </span>
                )}
              </div>

              {/* View mode toggle: Editor vs Preview */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-gray-100 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setContentViewMode('editor')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    contentViewMode === 'editor'
                      ? 'bg-white dark:bg-[#252B35] text-gray-900 dark:text-white shadow-xs font-semibold'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Редактор</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentViewMode('preview')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    contentViewMode === 'preview'
                      ? 'bg-white dark:bg-[#252B35] text-gray-900 dark:text-white shadow-xs font-semibold'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Предпросмотр</span>
                </button>
              </div>
            </div>

            {/* Quick Action Toolbar for Images and Markdown */}
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Upload from device button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#252B35] border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  title="Загрузить изображение с устройства (PNG, JPG, SVG, WebP)"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Загрузить с устройства</span>
                </button>

                {/* Paste from clipboard button */}
                <button
                  type="button"
                  onClick={handlePasteButtonClick}
                  disabled={isProcessingImage}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#252B35] border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  title="Вставить скопированную картинку или скриншот (или нажмите Ctrl+V)"
                >
                  <Clipboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Вставить из буфера (Ctrl+V)</span>
                </button>

                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

                {/* Markdown formatting quick buttons */}
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('## Заголовок раздела\n')}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs"
                  title="Заголовок H2"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('### Подраздел\n')}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs"
                  title="Подзаголовок H3"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('**важный термин**')}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs"
                  title="Жирный текст"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('- Пункт списка\n- Второй пункт\n')}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs"
                  title="Список"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('> Важное примечание для студентов\n')}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs"
                  title="Цитата / Выделенное примечание"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>

              {isProcessingImage && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Оптимизация изображения...</span>
                </div>
              )}
            </div>

            {/* Notification / Feedback Banner */}
            {imageFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{imageFeedback}</span>
              </div>
            )}

            {/* Editor or Preview Pane */}
            {contentViewMode === 'editor' ? (
              <div 
                className={`relative rounded-xl transition-all ${
                  isDragging 
                    ? 'ring-2 ring-blue-500 bg-blue-50/20' 
                    : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <textarea
                  ref={textareaRef}
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Введите текст лекции в формате Markdown... Картинки можно вставлять нажатием Ctrl+V или перетаскиванием файлов сюда."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Drag-over overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-xs border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center pointer-events-none">
                    <div className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 shadow-lg text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Upload className="w-4 h-4 animate-bounce" />
                      <span>Отпустите файлы для вставки в конспект</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1 px-1">
                  <span>💡 Вставляйте скриншоты схем или графиков напрямую через <strong>Ctrl+V</strong> в любое место текста.</span>
                  <span>{content.length} симв.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 max-h-96 overflow-y-auto">
                <SynopsisViewer content={content} />
              </div>
            )}
          </div>

          {/* Questions Editor */}
          {topic.test && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Вопросы теста ({questions.length} шт.)
                </h4>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
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
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
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
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1E24]">
          <div className="text-xs text-gray-500">
            {embeddedImagesCount > 0 ? (
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                ✓ В конспект встроено иллюстраций: {embeddedImagesCount}
              </span>
            ) : (
              <span>Иллюстрации можно вставлять в любое место текста конспекта</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить тему</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
