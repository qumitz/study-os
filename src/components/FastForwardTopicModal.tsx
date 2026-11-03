import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  FastForward, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Users, 
  BookOpen, 
  Loader2, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { Subject, Topic } from '../types';
import { getAvailableGroups } from '../lib/groupRegistry';
import { computeCurriculumFastForward, fastForwardGroupCurriculum } from '../lib/curriculumSync';

interface FastForwardTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  allSubjects?: Subject[];
  initialTopicId?: string;
  initialGroupName?: string;
  currentTeacherName?: string;
  onSuccess?: (affectedStudents: number, completedTopics: number) => void;
}

export const FastForwardTopicModal: React.FC<FastForwardTopicModalProps> = ({
  isOpen,
  onClose,
  subject,
  allSubjects = [],
  initialTopicId,
  initialGroupName = '37В',
  currentTeacherName = 'Преподаватель',
  onSuccess
}) => {
  if (!isOpen) return null;

  const availableGroups = getAvailableGroups();
  const subjectsList = allSubjects.length > 0 ? allSubjects : [subject];

  // Active subject state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subject.id);
  const activeSubject = useMemo(() => {
    return subjectsList.find(s => s.id === selectedSubjectId) || subject;
  }, [subjectsList, selectedSubjectId, subject]);

  // Active group state
  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroupName);

  // Active target topic state
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    if (initialTopicId && activeSubject.topics.some(t => t.id === initialTopicId)) {
      return initialTopicId;
    }
    // Default to a middle topic or first available
    return activeSubject.topics[Math.min(2, activeSubject.topics.length - 1)]?.id || '';
  });

  // Grade options
  const [assignGrades, setAssignGrades] = useState<boolean>(false);
  const [defaultScore, setDefaultScore] = useState<number>(8);

  // Status & feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  // Update topic if subject changed
  useEffect(() => {
    if (!activeSubject.topics.some(t => t.id === selectedTopicId)) {
      setSelectedTopicId(activeSubject.topics[0]?.id || '');
    }
  }, [activeSubject, selectedTopicId]);

  // If initialTopicId changes when opening
  useEffect(() => {
    if (initialTopicId && activeSubject.topics.some(t => t.id === initialTopicId)) {
      setSelectedTopicId(initialTopicId);
    }
  }, [initialTopicId, activeSubject]);

  // Compute fast-forward breakdown
  const { precedingTopics, targetTopic, subsequentTopics } = useMemo(() => {
    return computeCurriculumFastForward(activeSubject, selectedTopicId);
  }, [activeSubject, selectedTopicId]);

  const handleSubmit = async () => {
    if (!targetTopic) return;
    setIsSubmitting(true);
    setSuccessFeedback(null);

    try {
      const res = await fastForwardGroupCurriculum({
        groupName: selectedGroup,
        subject: activeSubject,
        targetTopicId: selectedTopicId,
        teacherName: currentTeacherName,
        assignGrades,
        defaultScore
      });

      if (res.success) {
        setSuccessFeedback(`Успешно! Зачтено ${res.completedCount} тем для группы ${selectedGroup}.`);
        if (onSuccess) {
          onSuccess(res.affectedStudentsCount, res.completedCount);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Fast-forward error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1A1A18] border border-[#E3E3DE] dark:border-[#30302D] rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E3DE] dark:border-[#30302D] bg-[#F7F7F5] dark:bg-[#222220]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#111827] dark:text-[#F3F3EF]">
                Быстрый перевод группы к теме
              </h3>
              <p className="text-xs text-[#666661] dark:text-[#B0B0A9]">
                Автоматический зачёт всех предшествующих тем для студентов
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Group & Subject Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Group Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Целевая группа</span>
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111110] text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.name}>
                    Группа {g.name} ({g.course} курс)
                  </option>
                ))}
                <option value="Все группы">Все группы колледжа</option>
              </select>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Учебный предмет</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111110] text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {subjectsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Topic Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>Выберите тему, на которую перевести группу:</span>
              </span>
              <span className="text-[11px] text-gray-400">
                Всего тем в плане: {activeSubject.topics.length}
              </span>
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 text-[#111827] dark:text-[#F3F3EF] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {activeSubject.topics.map((t, idx) => (
                <option key={t.id} value={t.id}>
                  {t.code} — {t.title} ({idx + 1}-я в плане)
                </option>
              ))}
            </select>
          </div>

          {/* Preview: What will happen */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F7F7F5] dark:bg-[#151514] p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Предварительный просмотр изменений:</span>
            </h4>

            {/* Target active topic */}
            {targetTopic && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  ▶
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                    Станет текущей активной темой:
                  </div>
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-0.5">
                    {targetTopic.code} — {targetTopic.title}
                  </div>
                </div>
              </div>
            )}

            {/* Preceding completed topics */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Автоматически засчитаются как пройденные ({precedingTopics.length} тем):
                </span>
                {precedingTopics.length === 0 && (
                  <span className="text-gray-400 text-[11px]">Нет (это первая тема)</span>
                )}
              </div>

              {precedingTopics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-lg bg-white dark:bg-[#1A1A18] border border-gray-200 dark:border-gray-800">
                  {precedingTopics.map((pt) => (
                    <span
                      key={pt.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                      title={pt.title}
                    >
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{pt.code}</span>
                      <span className="truncate max-w-[120px] opacity-80">{pt.title}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Subsequent topics note */}
            {subsequentTopics.length > 0 && (
              <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span>Последующие темы ({subsequentTopics.length}) останутся заблокированными до завершения текущей.</span>
              </div>
            )}
          </div>

          {/* Optional: Assign Default Scores */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3.5 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={assignGrades}
                onChange={(e) => setAssignGrades(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-medium text-gray-800 dark:text-gray-200 block">
                  Также проставить базовую оценку за прошедшие тесты в журнал
                </span>
                <span className="text-gray-500 dark:text-gray-400 block mt-0.5">
                  Если выключено (рекомендуется), темы будут просто считаться пройденными без лишних отметок, а реальные оценки вы сможете выставить вручную в журнале.
                </span>
              </div>
            </label>

            {assignGrades && (
              <div className="pl-6 pt-1 flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Оценка за каждый тест:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={defaultScore}
                  onChange={(e) => setDefaultScore(Math.max(1, Math.min(10, parseInt(e.target.value) || 8)))}
                  className="w-16 px-2 py-1 text-xs font-semibold text-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111110] text-[#111827] dark:text-[#F3F3EF]"
                />
                <span className="text-[11px] text-gray-400">баллов (по 10-балльной системе)</span>
              </div>
            )}
          </div>

          {/* Info Callout */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="leading-relaxed">
              У всех учеников группы <strong>{selectedGroup}</strong> темы вплоть до выбранной сразу будут открыты и пройдены. Студентам не придётся заново проходить все тесты с начала года.
            </div>
          </div>

          {/* Success Banner */}
          {successFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successFeedback}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#E3E3DE] dark:border-[#30302D] bg-[#F7F7F5] dark:bg-[#222220] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !targetTopic}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Применение...</span>
              </>
            ) : (
              <>
                <FastForward className="w-4 h-4" />
                <span>Зачесть темы и перевести группу</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
