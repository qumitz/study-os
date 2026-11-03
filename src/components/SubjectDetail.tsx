import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Layers, 
  ListFilter, 
  FlaskConical, 
  CheckSquare, 
  Clock, 
  Award,
  ChevronRight,
  BookOpen,
  Sparkles,
  FileText,
  FastForward
} from 'lucide-react';
import { FastForwardTopicModal } from './FastForwardTopicModal';
import { Subject, Topic, TopicStatus, StudentProgress, User, PracticalWork } from '../types';
import { SkillTree } from './SkillTree';
import { TopicModal } from './TopicModal';
import { PracticalReportEditor } from './PracticalReportEditor';
import { getStudentPracticalSubmission } from '../lib/practicalSubmissionRegistry';

interface SubjectDetailProps {
  subject: Subject;
  progress: StudentProgress;
  currentUser: User;
  onBack: () => void;
  onUpdateProgress: (
    topicId: string, 
    score: number,
    answers?: Record<number, number>,
    correctCount?: number,
    totalQuestions?: number
  ) => void;
  onSaveTopic?: (updatedTopic: Topic) => void;
  allSubjects?: Subject[];
  onSelectSubject?: (subjectId: string) => void;
  initialViewMode?: 'tree' | 'list' | 'practicals' | 'tests';
}

export const SubjectDetail: React.FC<SubjectDetailProps> = ({
  subject,
  progress,
  currentUser,
  onBack,
  onUpdateProgress,
  onSaveTopic,
  allSubjects,
  onSelectSubject,
  initialViewMode
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'practicals' | 'tests'>(initialViewMode || 'tree');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showFastForwardModal, setShowFastForwardModal] = useState<boolean>(false);
  const [fastForwardTopicId, setFastForwardTopicId] = useState<string | undefined>(undefined);
  const [activePracticalForEditor, setActivePracticalForEditor] = useState<PracticalWork | null>(null);

  // Compute progress statistics
  const isTeacherOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const totalTopics = subject.topics.length;
  const completedTopicsCount = subject.topics.filter(
    t => progress.topicStatuses[t.id] === 'completed'
  ).length;
  const progressPercent = Math.round((completedTopicsCount / totalTopics) * 100);

  // Find next recommended topic (the first one with 'in_progress' status)
  const recommendedTopic = subject.topics.find(
    t => progress.topicStatuses[t.id] === 'in_progress'
  ) || subject.topics[0];

  return (
    <div className="flex flex-col gap-3.5 sm:gap-6 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden animate-in fade-in duration-200">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF] transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline">Назад к предметам</span>
            <span className="inline xs:hidden">Назад</span>
          </button>

          {allSubjects && allSubjects.length > 1 && onSelectSubject && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200 dark:border-gray-800 min-w-0">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] hidden sm:inline shrink-0">Сменить:</span>
              <select
                value={subject.id}
                onChange={(e) => onSelectSubject(e.target.value)}
                className="text-xs font-semibold bg-gray-50 dark:bg-[#181B21] text-[#111827] dark:text-[#F3F3EF] rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[140px] xs:max-w-[200px] sm:max-w-[280px] truncate"
              >
                {allSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <span className="text-[11px] sm:text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">
          План: {subject.totalHours} ч. ({subject.theoryHours} теор. / {subject.practiceHours} практ.)
        </span>
      </div>

      {/* Subject Header Banner */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-mono font-bold text-lg sm:text-xl shrink-0">
            &lt;/&gt;
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-2xl font-bold text-[#111827] dark:text-[#F3F3EF] truncate">
                {subject.title}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                Группа {subject.group}
              </span>
            </div>
            <p className="text-[11px] sm:text-sm text-[#6B7280] dark:text-[#8E95A2] mt-0.5 break-words line-clamp-2">
              {subject.department} • Преподаватель: <strong className="text-[#374151] dark:text-[#D1D5DB] font-semibold">{subject.teacher}</strong>
            </p>
          </div>
        </div>

        {/* Header Progress Pill */}
        <div className="flex flex-col md:items-end w-full md:w-auto min-w-[180px] shrink-0">
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Прогресс курса</span>
            <span className="text-xs sm:text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div 
              className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#6B7280] dark:text-[#8E95A2] mt-1">
            Завершено {completedTopicsCount} из {totalTopics} тем
          </span>
        </div>
      </div>

      {/* View Switcher Tabs (Tree, List, Practicals, Tests) */}
      <div className="flex items-center gap-1.5 border-b border-[#E5E7EB] dark:border-[#262A32] pb-1 overflow-x-auto no-scrollbar">

        <button
          onClick={() => setViewMode('tree')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 rounded-t-xl transition-all shrink-0 cursor-pointer ${
            viewMode === 'tree'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            <span className="sm:hidden">Древо</span>
            <span className="hidden sm:inline">Интерактивное Древо</span>
          </span>
          <span className="hidden sm:inline px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Карта
          </span>
        </button>

        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 rounded-t-xl transition-all shrink-0 cursor-pointer ${
            viewMode === 'list'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>
            <span className="sm:hidden">Темы</span>
            <span className="hidden sm:inline">Темы списком</span>
          </span>
        </button>

        <button
          onClick={() => setViewMode('practicals')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 rounded-t-xl transition-all shrink-0 cursor-pointer ${
            viewMode === 'practicals'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>
            <span className="sm:hidden">Практика (4)</span>
            <span className="hidden sm:inline">Практические работы (4)</span>
          </span>
        </button>

        <button
          onClick={() => setViewMode('tests')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 rounded-t-xl transition-all shrink-0 cursor-pointer ${
            viewMode === 'tests'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>
            <span className="sm:hidden">Тесты</span>
            <span className="hidden sm:inline">Тесты и ОКР</span>
          </span>
        </button>
      </div>

      {/* Main Content Area depending on ViewMode */}
      {viewMode === 'tree' ? (
        <div className="space-y-2 sm:space-y-4 w-full max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 px-1">
            <span className="hidden sm:inline text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              {isTeacherOrAdmin
                ? 'Режим преподавателя: вам открыт свободный доступ к любой теме для проверки содержания, ответов и редактирования.'
                : 'Перемещайте карту мышкой и нажимайте на доступные узлы тем, чтобы открыть конспект и пройти тест.'}
            </span>
            <div className="text-[11px] sm:text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] truncate max-w-full">
              {isTeacherOrAdmin ? 'Доступ ко всем темам открыт' : `Текущая тема: ${recommendedTopic.code} — ${recommendedTopic.title}`}
            </div>
            {isTeacherOrAdmin && (
              <button
                type="button"
                onClick={() => {
                  setFastForwardTopicId(undefined);
                  setShowFastForwardModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-xs cursor-pointer"
                title="Перевести всех учеников на конкретную тему и зачесть предыдущие"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Перевести группу к теме</span>
              </button>
            )}
          </div>

          {/* Interactive Skill Tree Canvas */}
          <div className="w-full max-w-full overflow-hidden rounded-2xl">
            <SkillTree
              topics={subject.topics}
              topicStatuses={progress.topicStatuses}
              grades={progress.grades}
              onSelectTopic={(topic) => setSelectedTopic(topic)}
              isTeacher={isTeacherOrAdmin}
            />
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* List View (like on the moodboard) with left topics list and right progress panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics List Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {subject.topics.map((topic, index) => {
              const status: TopicStatus = progress.topicStatuses[topic.id] || 'locked';
              const grade = progress.grades[topic.id];
              const isLocked = !isTeacherOrAdmin && status === 'locked';

              return (
                <div
                  key={topic.id}
                  onClick={() => !isLocked && setSelectedTopic(topic)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3 sm:gap-4 ${
                    status === 'completed'
                      ? 'bg-white dark:bg-[#15181E] border-emerald-500/40 hover:border-emerald-500 cursor-pointer'
                      : isTeacherOrAdmin
                      ? 'bg-white dark:bg-[#15181E] border-indigo-500/40 hover:border-indigo-500 hover:shadow-sm cursor-pointer'
                      : status === 'in_progress'
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-[#2563EB] ring-1 ring-[#2563EB]/20 hover:border-[#2563EB] cursor-pointer'
                      : 'bg-gray-50/70 dark:bg-[#121418]/60 border-gray-200 dark:border-gray-800/80 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${
                      status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isTeacherOrAdmin
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {topic.code}
                    </span>

                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#111827] dark:text-[#F3F3EF] leading-snug">
                        {topic.title}
                      </span>
                      <span className="text-xs text-[#6B7280] dark:text-[#8E95A2] mt-0.5 line-clamp-1">
                        {topic.shortDescription}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    {status === 'completed' ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <span>Пройдено</span>
                        {grade && <span className="font-mono">({grade.score}/10)</span>}
                      </span>
                    ) : isTeacherOrAdmin ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        Ознакомиться
                      </span>
                    ) : status === 'in_progress' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        В процессе
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        Не начато
                      </span>
                    )}

                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    {isTeacherOrAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFastForwardTopicId(topic.id);
                          setShowFastForwardModal(true);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                        title={`Перевести группу на тему ${topic.code} и зачесть все темы до неё`}
                      >
                        <FastForward className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Recommended Topic & Donut Chart (Moodboard exact match) */}
          <div className="space-y-6">
            {/* Recommended Topic Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-sm space-y-3">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                Рекомендуемая тема
              </span>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                {recommendedTopic.title}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#8E95A2] line-clamp-2">
                {recommendedTopic.shortDescription}
              </p>
              <button
                onClick={() => setSelectedTopic(recommendedTopic)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Перейти к изучению
              </button>
            </div>

            {/* Circular Progress Gauge */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-sm flex flex-col items-center text-center space-y-4">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                Прогресс по темам
              </span>

              {/* Circular Gauge Graphic */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-gray-100 dark:text-gray-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="text-[#2563EB] transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-[#111827] dark:text-[#F3F3EF]">
                    {progressPercent}%
                  </span>
                  <span className="text-[11px] text-[#6B7280] dark:text-[#8E95A2]">
                    {completedTopicsCount} / {totalTopics} тем
                  </span>
                </div>
              </div>

              <div className="w-full pt-2 border-t border-gray-100 dark:border-gray-800/80 text-xs text-[#6B7280] dark:text-[#8E95A2]">
                Осталось изучить: <strong className="text-[#111827] dark:text-[#F3F3EF]">{totalTopics - completedTopicsCount} тем</strong>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === 'practicals' ? (
        /* Practicals list */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subject.practicalWorks.map(pr => {
            const relatedTopic = subject.topics.find(t => t.practicalWorkRef === pr.number);
            const submission = getStudentPracticalSubmission(currentUser.id, subject.id, pr.number);
            const isCompleted = submission?.status === 'graded' || (relatedTopic && progress.topicStatuses[relatedTopic.id] === 'completed');

            return (
              <div key={pr.id} className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      Практическая работа № {pr.number}
                    </span>
                    <span className="text-xs text-[#6B7280] dark:text-[#8E95A2]">
                      {pr.hours} учебных часа
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                    {pr.title}
                  </h3>

                  <div className="text-xs text-[#4B5563] dark:text-[#A1A7B3] space-y-1.5">
                    <strong>Цель работы:</strong>
                    <p>{pr.goals}</p>
                  </div>

                  <div className="text-xs text-[#4B5563] dark:text-[#A1A7B3] space-y-1">
                    <strong>Задачи:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                      {pr.tasks.map((task, idx) => (
                        <li key={idx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5">
                    {submission?.status === 'graded' ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        ✓ Проверено • Оценка: {submission.grade}/10
                      </span>
                    ) : submission?.status === 'submitted' ? (
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        На проверке у преподавателя
                      </span>
                    ) : submission?.status === 'needs_revision' ? (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        ⚠️ Требуется доработка
                      </span>
                    ) : submission?.status === 'draft' ? (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        📝 Черновик сохранён
                      </span>
                    ) : (
                      <span className={`text-xs font-semibold ${isCompleted ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {isCompleted ? '✓ Отчёт сдан' : 'Ожидает выполнения'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActivePracticalForEditor(pr)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{submission?.status ? 'Открыть отчёт (Word)' : 'Выполнить в Word →'}</span>
                    </button>

                    {relatedTopic && (
                      <button
                        onClick={() => setSelectedTopic(relatedTopic)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                        title="Открыть конспект"
                      >
                        Тема
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tests list */
        <div className="space-y-4">
          {subject.topics.filter(t => t.test).map(topic => {
            const test = topic.test!;
            const status = progress.topicStatuses[topic.id];
            const grade = progress.grades[topic.id];
            const isCompleted = status === 'completed';
            const isLocked = !isTeacherOrAdmin && status === 'locked';

            return (
              <div 
                key={topic.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    topic.isExam
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {topic.code}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                      {test.title}
                    </h3>
                    <span className="text-xs text-[#6B7280] dark:text-[#8E95A2] mt-0.5">
                      {test.questions.length} вопросов • Время: {test.durationMinutes} мин • {isTeacherOrAdmin ? 'Режим учителя (просмотр ответов)' : '1 попытка'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Оценка: {grade?.score}/10
                      </span>
                      <button
                        onClick={() => setSelectedTopic(topic)}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {isTeacherOrAdmin ? 'Просмотр вопросов' : 'Разбор'}
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={isLocked}
                      onClick={() => setSelectedTopic(topic)}
                      className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                        isTeacherOrAdmin
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-[#2563EB] hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white'
                      }`}
                    >
                      {isTeacherOrAdmin ? 'Ознакомиться с тестом' : isLocked ? 'Заблокировано' : 'Начать тест'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Topic modal popup */}
      {selectedTopic && (
        <TopicModal
          topic={selectedTopic}
          isAdmin={currentUser.role === 'admin'}
          isTeacher={currentUser.role === 'teacher'}
          onClose={() => setSelectedTopic(null)}
          onCompleteTopic={(topicId, score, answers, correctCount, totalQuestions) => {
            onUpdateProgress(topicId, score, answers, correctCount, totalQuestions);
          }}
          onSaveTopic={(updated) => {
            setSelectedTopic(updated);
            onSaveTopic?.(updated);
          }}
          isCompleted={progress.topicStatuses[selectedTopic.id] === 'completed'}
          savedGrade={progress.grades[selectedTopic.id]}
          onFastForward={(topicId) => {
            setSelectedTopic(null);
            setFastForwardTopicId(topicId);
            setShowFastForwardModal(true);
          }}
        />
      )}
      {/* Fast Forward Modal */}
      <FastForwardTopicModal
        isOpen={showFastForwardModal}
        onClose={() => setShowFastForwardModal(false)}
        subject={subject}
        initialTopicId={fastForwardTopicId}
        initialGroupName={currentUser.group && currentUser.group !== 'Все группы' ? currentUser.group : '37В'}
        currentTeacherName={currentUser.name}
      />

      {/* Practical Report Editor (Embedded Word) */}
      {activePracticalForEditor && (
        <PracticalReportEditor
          work={activePracticalForEditor}
          subjectId={subject.id}
          subjectTitle={subject.title}
          currentUser={currentUser}
          onClose={() => setActivePracticalForEditor(null)}
          onSubmitted={() => {
            setActivePracticalForEditor(null);
          }}
        />
      )}
    </div>
  );
};
