import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  Award, 
  BookOpen, 
  FlaskConical, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Topic, TopicStatus } from '../types';

interface SkillTreeProps {
  topics: Topic[];
  topicStatuses: Record<string, TopicStatus>;
  grades: Record<string, { score: number; completedAt: string }>;
  onSelectTopic: (topic: Topic) => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  topics,
  topicStatuses,
  grades,
  onSelectTopic,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if left click and not on a node button
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(prev + delta, 0.6), 1.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl border border-[#E5E7EB] dark:border-[#262A32] bg-[#FBFBFA] dark:bg-[#0F1115] overflow-hidden select-none shadow-inner">
      {/* Canvas Grid Background */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full cursor-grab active:cursor-grabbing skill-tree-grid overflow-hidden relative`}
      >
        {/* Transformable Canvas Group */}
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            width: '2800px',
            height: '800px',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {/* SVG Connections Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {topics.map(topic => {
              return topic.prerequisites.map(prereqId => {
                const prereq = topics.find(t => t.id === prereqId);
                if (!prereq) return null;

                const isSameColumn = Math.abs(topic.position.x - prereq.position.x) < 80;
                let startX: number, startY: number, endX: number, endY: number, pathData: string;

                if (isSameColumn) {
                  // Vertical connection within the same column
                  startX = prereq.position.x + 128;
                  startY = prereq.position.y + 115;
                  endX = topic.position.x + 128;
                  endY = topic.position.y;
                  const dy = Math.max(Math.abs(endY - startY) * 0.4, 20);
                  pathData = `M ${startX} ${startY} C ${startX} ${startY + dy}, ${endX} ${endY - dy}, ${endX} ${endY}`;
                } else {
                  // Horizontal connection from left column to right column
                  startX = prereq.position.x + 256;
                  startY = prereq.position.y + 55;
                  endX = topic.position.x;
                  endY = topic.position.y + 55;
                  const dx = Math.max(Math.abs(endX - startX) * 0.5, 30);
                  pathData = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
                }

                const isPrereqDone = topicStatuses[prereq.id] === 'completed';
                const isCurrentActive = topicStatuses[topic.id] !== 'locked';
                const strokeColor = isPrereqDone && isCurrentActive
                  ? '#10B981'
                  : isCurrentActive
                  ? '#2563EB'
                  : 'rgba(156, 163, 175, 0.35)';

                return (
                  <g key={`${prereq.id}->${topic.id}`}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isCurrentActive ? 2.5 : 1.5}
                      strokeDasharray={isCurrentActive ? 'none' : '5,5'}
                      strokeLinecap="round"
                      className="transition-colors duration-300"
                    />
                    <circle 
                      cx={startX} 
                      cy={startY} 
                      r={isCurrentActive ? "3.5" : "2.5"} 
                      fill={strokeColor} 
                      className="transition-colors duration-300"
                    />
                    <circle 
                      cx={endX} 
                      cy={endY} 
                      r={isCurrentActive ? "3.5" : "2.5"} 
                      fill={strokeColor} 
                      className="transition-colors duration-300"
                    />
                  </g>
                );
              });
            })}
          </svg>

          {/* Interactive Topic Nodes */}
          {topics.map(topic => {
            const status: TopicStatus = topicStatuses[topic.id] || 'locked';
            const grade = grades[topic.id];
            const isCompleted = status === 'completed';
            const isAvailable = status === 'in_progress';
            const isLocked = status === 'locked';

            return (
              <div
                key={topic.id}
                style={{
                  left: `${topic.position.x}px`,
                  top: `${topic.position.y}px`,
                  position: 'absolute'
                }}
                className="z-10"
              >
                <div
                  onClick={() => {
                    if (!isLocked) {
                      onSelectTopic(topic);
                    }
                  }}
                  className={`group relative flex flex-col w-64 p-3.5 rounded-2xl border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-white dark:bg-[#181B21] border-emerald-500/50 shadow-md shadow-emerald-500/10 hover:border-emerald-500 hover:shadow-lg cursor-pointer'
                      : isAvailable
                      ? 'bg-white dark:bg-[#181B21] border-[#2563EB] shadow-lg shadow-blue-500/15 ring-2 ring-[#2563EB]/30 hover:scale-[1.02] cursor-pointer'
                      : 'bg-gray-100/80 dark:bg-[#14161C]/80 border-gray-200 dark:border-gray-800/80 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Exam badge glow */}
                  {topic.isExam && (
                    <div className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      ОКР
                    </div>
                  )}

                  {/* Node Header: Code, Title, Status Icon */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : isAvailable
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {topic.code}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          {grade && <span>{grade.score}/10</span>}
                        </div>
                      ) : isAvailable ? (
                        <div className="flex items-center gap-1 text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold animate-pulse">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Начать</span>
                        </div>
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className={`text-xs font-semibold line-clamp-2 leading-snug mb-2 ${
                    isCompleted || isAvailable
                      ? 'text-[#111827] dark:text-[#F3F3EF]'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {topic.title}
                  </h4>

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#8E95A2] pt-2 border-t border-gray-100 dark:border-gray-800/60 mt-auto">
                    <div className="flex items-center gap-1">
                      {topic.practicalWorkRef ? (
                        <FlaskConical className="w-3 h-3 text-purple-500" />
                      ) : (
                        <BookOpen className="w-3 h-3 text-blue-500" />
                      )}
                      <span>{topic.practicalWorkRef ? 'Практикум' : 'Конспект'}</span>
                    </div>

                    <span>{topic.hours} ч.</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Canvas Controls (Zoom in, Zoom out, Reset) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1.5 rounded-xl bg-white/90 dark:bg-[#181B21]/90 backdrop-blur border border-[#E5E7EB] dark:border-[#262A32] shadow-md z-20">
        <button
          onClick={() => handleZoom(0.15)}
          title="Приблизить"
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          title="Отдалить"
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 my-auto"></div>
        <button
          onClick={handleReset}
          title="Сбросить масштаб"
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono font-semibold px-1 text-gray-500">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Floating Legend Bar */}
      <div className="absolute top-4 left-4 hidden sm:flex items-center gap-4 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#181B21]/90 backdrop-blur border border-[#E5E7EB] dark:border-[#262A32] text-[11px] shadow-sm z-20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-[#374151] dark:text-[#D1D5DB] font-medium">Пройдено</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] ring-2 ring-blue-300 dark:ring-blue-900"></span>
          <span className="text-[#374151] dark:text-[#D1D5DB] font-medium">Доступно к сдаче</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
          <span className="text-[#6B7280] dark:text-[#9CA3AF]">Заблокировано</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="text-rose-600 dark:text-rose-400 font-medium">ОКР №1</span>
        </div>
      </div>
    </div>
  );
};
