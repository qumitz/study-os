import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  BookOpen, 
  FlaskConical, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Target,
  Trophy
} from 'lucide-react';
import { Topic, TopicStatus } from '../types';

interface SkillTreeProps {
  topics: Topic[];
  topicStatuses: Record<string, TopicStatus>;
  grades: Record<string, { score: number; completedAt: string }>;
  onSelectTopic: (topic: Topic) => void;
  isTeacher?: boolean;
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  topics,
  topicStatuses,
  grades,
  onSelectTopic,
  isTeacher = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Responsive default scale: 0.65 on narrow mobile screens, 1.0 on desktop
  const isMobileInitial = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const [scale, setScale] = useState<number>(isMobileInitial ? 0.65 : 1);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: isMobileInitial ? 12 : 0,
    y: isMobileInitial ? 15 : 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Mutable refs to prevent stale closures and track active pointers
  const positionRef = useRef(position);
  positionRef.current = position;

  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const isDraggingRef = useRef(false);
  const clickStartRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Pointer tracking for multi-touch (pinch-zoom and pan)
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);

  // Zoom and Pan Controls
  const handleZoom = (delta: number) => {
    setScale(prev => {
      const next = Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.35), 1.8);
      scaleRef.current = next;
      return next;
    });
  };

  const handleReset = useCallback(() => {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
    const nextScale = isMobile ? 0.65 : 1;
    const nextPos = { x: isMobile ? 12 : 0, y: isMobile ? 15 : 0 };
    scaleRef.current = nextScale;
    positionRef.current = nextPos;
    setScale(nextScale);
    setPosition(nextPos);
  }, []);

  const handlePan = (dx: number, dy: number) => {
    setPosition(prev => {
      const next = { x: prev.x + dx, y: prev.y + dy };
      positionRef.current = next;
      return next;
    });
  };

  // Jump smoothly to a specific topic
  const handleJumpToTopic = (targetTopic: Topic | undefined) => {
    if (!targetTopic || !containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth || 375;
    const containerHeight = container.clientHeight || 450;
    const currentScale = scaleRef.current;

    // Center target topic on the screen
    const targetX = Math.round(containerWidth / 2 - (targetTopic.position.x + 128) * currentScale);
    const targetY = Math.round(containerHeight / 2 - (targetTopic.position.y + 60) * currentScale);

    positionRef.current = { x: targetX, y: targetY };
    setPosition({ x: targetX, y: targetY });
  };

  // Modern Unified Pointer Events (works for both touch & mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary mouse click or any touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {
      // ignore
    }

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      isDraggingRef.current = true;
      hasMovedRef.current = false;
      clickStartRef.current = { x: e.clientX, y: e.clientY };
      dragStartRef.current = {
        x: e.clientX - positionRef.current.x,
        y: e.clientY - positionRef.current.y
      };
      setIsDragging(true);
    } else if (activePointersRef.current.size === 2) {
      // 2 fingers -> Pinch zoom
      const pts = Array.from(activePointersRef.current.values());
      pinchStartDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartScaleRef.current = scaleRef.current;
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;

    // Update stored coordinates for this pointer
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1 && isDraggingRef.current) {
      const dist = Math.hypot(e.clientX - clickStartRef.current.x, e.clientY - clickStartRef.current.y);
      if (dist > 6) {
        hasMovedRef.current = true;
      }
      const nextX = e.clientX - dragStartRef.current.x;
      const nextY = e.clientY - dragStartRef.current.y;
      positionRef.current = { x: nextX, y: nextY };
      setPosition({ x: nextX, y: nextY });
    } else if (activePointersRef.current.size === 2 && pinchStartDistRef.current) {
      hasMovedRef.current = true;
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const factor = currentDist / pinchStartDistRef.current;
      const nextScale = Math.min(Math.max(Number((pinchStartScaleRef.current * factor).toFixed(2)), 0.35), 1.8);
      scaleRef.current = nextScale;
      setScale(nextScale);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size === 0) {
      isDraggingRef.current = false;
      setIsDragging(false);
      pinchStartDistRef.current = null;
      // Retain hasMovedRef briefly so any trailing synthetic click is ignored
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 160);
    } else if (activePointersRef.current.size === 1) {
      // Revert from pinch back to 1-finger drag smoothly
      const remainingPt = Array.from(activePointersRef.current.values())[0];
      dragStartRef.current = {
        x: remainingPt.x - positionRef.current.x,
        y: remainingPt.y - positionRef.current.y
      };
      isDraggingRef.current = true;
      setIsDragging(true);
      pinchStartDistRef.current = null;
    }
  };

  // Strictly prevent browser page scrolling when interacting with tree
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefaultScroll = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', preventDefaultScroll, { passive: false });
    return () => {
      container.removeEventListener('touchmove', preventDefaultScroll);
    };
  }, []);

  // Compute dynamic bounds for SVG canvas
  const maxX = Math.max(...topics.map(t => t.position?.x || 0), 2400);
  const maxY = Math.max(...topics.map(t => t.position?.y || 0), 600);
  const canvasWidth = `${maxX + 500}px`;
  const canvasHeight = `${Math.max(850, maxY + 350)}px`;

  // First in-progress or exam topic for quick jumps
  const firstActiveTopic = topics.find(t => isTeacher || topicStatuses[t.id] === 'in_progress') || topics[0];
  const examTopic = topics.find(t => t.isExam);

  return (
    <div 
      className={`skill-tree-container transition-all duration-200 ${
        isExpanded
          ? 'fixed inset-0 z-50 p-2 sm:p-4 bg-[#0F1115]/95 backdrop-blur-xl flex flex-col'
          : 'relative w-full max-w-full h-[450px] sm:h-[620px] rounded-2xl border border-[#E5E7EB] dark:border-[#262A32] bg-[#FBFBFA] dark:bg-[#0F1115] overflow-hidden select-none shadow-inner'
      }`}
      style={{
        contain: 'paint',
        isolation: 'isolate',
        touchAction: 'none'
      }}
    >
      {/* Expanded Mode Top Toolbar */}
      {isExpanded && (
        <div className="flex items-center justify-between pb-2 px-1 text-white shrink-0">
          <span className="text-xs sm:text-sm font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            Интерактивная карта (Полноэкранный режим)
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Свернуть</span>
          </button>
        </div>
      )}

      {/* Canvas Grid Background Container */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing skill-tree-grid overflow-hidden relative select-none rounded-xl"
        style={{
          touchAction: 'none',
          overscrollBehavior: 'contain',
          contain: 'strict'
        }}
      >
        {/* Transformable Canvas Group */}
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            width: canvasWidth,
            height: canvasHeight,
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {/* SVG Connections Layer */}
          <svg 
            width={canvasWidth} 
            height={canvasHeight} 
            className="absolute inset-0 pointer-events-none z-0"
          >
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
                const isCurrentActive = isTeacher || topicStatuses[topic.id] !== 'locked';
                const strokeColor = isPrereqDone && isCurrentActive
                  ? '#10B981'
                  : isTeacher
                  ? '#6366F1'
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
            const isAvailable = isTeacher || status === 'in_progress';
            const isLocked = !isTeacher && status === 'locked';

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
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasMovedRef.current) {
                      // Was a drag gesture, do not open topic!
                      return;
                    }
                    if (!isLocked) {
                      onSelectTopic(topic);
                    }
                  }}
                  className={`skill-tree-node-card group relative flex flex-col w-64 p-3.5 rounded-2xl border transition-all duration-200 select-none ${
                    isCompleted
                      ? 'bg-white dark:bg-[#181B21] border-emerald-500/50 shadow-md shadow-emerald-500/10 hover:border-emerald-500 hover:shadow-lg cursor-pointer'
                      : isTeacher
                      ? 'bg-white dark:bg-[#181B21] border-indigo-500/50 shadow-md shadow-indigo-500/10 hover:border-indigo-500 hover:scale-[1.02] cursor-pointer'
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
                        : isTeacher
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
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
                      ) : isTeacher ? (
                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Просмотр</span>
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
                    isCompleted || isAvailable || isTeacher
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

      {/* Floating Canvas Controls (Quick-Jump pills + Pan Buttons + Zoom + Fullscreen) */}
      <div className="absolute bottom-2.5 right-2.5 left-2.5 sm:left-auto flex flex-wrap items-center justify-between sm:justify-end gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-[#181B21]/95 backdrop-blur-md border border-[#E5E7EB] dark:border-[#262A32] shadow-xl z-20">
        
        {/* Quick-Jump Navigation Pills for Fast Exploration */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={handleReset}
            title="Перейти к началу карты"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Compass className="w-3 h-3 text-blue-500" />
            <span>Старт</span>
          </button>

          {firstActiveTopic && (
            <button
              type="button"
              onClick={() => handleJumpToTopic(firstActiveTopic)}
              title={`Перейти к текущей теме: ${firstActiveTopic.title}`}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Target className="w-3 h-3 text-[#2563EB]" />
              <span className="truncate max-w-[90px] xs:max-w-[120px]">{firstActiveTopic.code}</span>
            </button>
          )}

          {examTopic && (
            <button
              type="button"
              onClick={() => handleJumpToTopic(examTopic)}
              title="Перейти к обязательной контрольной работе (ОКР)"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Trophy className="w-3 h-3 text-rose-500" />
              <span>ОКР</span>
            </button>
          )}
        </div>

        {/* Directional D-Pad & Zoom Controls */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Directional D-Pad Buttons for discrete 1-tap panning */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => handlePan(120, 0)}
              title="Сдвиг влево"
              className="p-1 sm:p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handlePan(0, 100)}
                title="Сдвиг вверх"
                className="p-0.5 sm:p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
              <button
                type="button"
                onClick={() => handlePan(0, -100)}
                title="Сдвиг вниз"
                className="p-0.5 sm:p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => handlePan(-120, 0)}
              title="Сдвиг вправо"
              className="p-1 sm:p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Zoom Buttons */}
          <button
            type="button"
            onClick={() => handleZoom(0.15)}
            title="Приблизить"
            className="p-1 sm:p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.15)}
            title="Отдалить"
            className="p-1 sm:p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Сбросить масштаб и положение"
            className="p-1 sm:p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <span className="text-[10px] font-mono font-semibold px-1 text-gray-500">
            {Math.round(scale * 100)}%
          </span>

          {/* Fullscreen / Expand Button */}
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 my-auto"></div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Свернуть' : 'Развернуть на весь экран'}
            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 active:scale-95 transition-all cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Gesture Hint Bar */}
      {!isExpanded && (
        <div className="absolute top-2.5 left-2.5 right-2.5 sm:right-auto sm:left-4 flex items-center justify-between gap-2 pointer-events-none z-20">
          <div className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1.5 shadow-sm">
            <span>👆 Листайте карту пальцем или кнопками</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="pointer-events-auto sm:hidden px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>На весь экран</span>
          </button>
        </div>
      )}

      {/* Floating Legend Bar (Desktop) */}
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