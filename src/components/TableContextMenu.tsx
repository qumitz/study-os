import React from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Table as TableIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sparkles,
  X
} from 'lucide-react';

export interface ActiveTableInfo {
  table: HTMLTableElement;
  cell: HTMLTableCellElement;
  tr: HTMLTableRowElement;
  rowIndex: number;
  colIndex: number;
  totalRows: number;
  totalCols: number;
  isHeader: boolean;
}

interface TableContextMenuProps {
  info: ActiveTableInfo;
  onAddRowBelow: () => void;
  onAddRowAbove: () => void;
  onDeleteRow: () => void;
  onAddColRight: () => void;
  onAddColLeft: () => void;
  onDeleteCol: () => void;
  onToggleHeader: () => void;
  onAlignCol: (align: 'left' | 'center' | 'right') => void;
  onDeleteTable: () => void;
  onClose: () => void;
}

export const TableContextMenu: React.FC<TableContextMenuProps> = ({
  info,
  onAddRowBelow,
  onAddRowAbove,
  onDeleteRow,
  onAddColRight,
  onAddColLeft,
  onDeleteCol,
  onToggleHeader,
  onAlignCol,
  onDeleteTable,
  onClose
}) => {
  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE BAR (< 640px): Fixed bottom touch-friendly dock   */}
      {/* ======================================================== */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#161922]/95 backdrop-blur-md border-t border-[#E5E7EB] dark:border-[#262A32] shadow-2xl p-2.5 flex flex-col gap-2 animate-in slide-in-from-bottom duration-200">
        {/* Info header */}
        <div className="flex items-center justify-between text-xs px-1 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1.5 font-semibold">
            <TableIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>
              Таблица: стр. <strong className="text-blue-600 dark:text-blue-400 font-mono">{info.rowIndex + 1}</strong>/{info.totalRows}, стлб. <strong className="text-blue-600 dark:text-blue-400 font-mono">{info.colIndex + 1}</strong>/{info.totalCols}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDeleteTable}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Удалить табл.</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons Row (Touch targets >= 40px) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* Rows actions */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAddRowBelow}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900 text-xs font-semibold shrink-0 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Стр. снизу</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAddRowAbove}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-medium shrink-0 active:scale-95 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Сверху</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onDeleteRow}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-rose-600 dark:text-rose-400 text-xs font-medium shrink-0 active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>- Стр.</span>
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 shrink-0 mx-0.5"></div>

          {/* Columns actions */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAddColRight}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 text-xs font-semibold shrink-0 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Стлб. справа</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAddColLeft}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-medium shrink-0 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Слева</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onDeleteCol}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-rose-600 dark:text-rose-400 text-xs font-medium shrink-0 active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>- Стлб.</span>
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 shrink-0 mx-0.5"></div>

          {/* Style & Alignment */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onToggleHeader}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-medium shrink-0 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Шапка</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onAlignCol('center')}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs shrink-0 active:scale-95 cursor-pointer"
            title="По центру в столбце"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP BAR (>= 640px): Floating top action pill         */}
      {/* ======================================================== */}
      <div className="hidden sm:flex sticky top-2 z-30 mx-auto w-fit bg-white/95 dark:bg-[#181B21]/95 backdrop-blur-md border border-[#E5E7EB] dark:border-[#262A32] rounded-2xl shadow-xl px-3 py-1.5 items-center gap-2 text-xs animate-in slide-in-from-top-2 duration-150">
        <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-200 pr-2 border-r border-gray-200 dark:border-gray-800">
          <TableIcon className="w-3.5 h-3.5 text-blue-500" />
          <span>Таблица: стр. <strong className="font-mono text-blue-600 dark:text-blue-400">{info.rowIndex + 1}</strong>/{info.totalRows}, стлб. <strong className="font-mono text-blue-600 dark:text-blue-400">{info.colIndex + 1}</strong>/{info.totalCols}</span>
        </div>

        {/* Rows controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAddRowBelow}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-semibold transition-colors cursor-pointer"
            title="Добавить строку снизу (также работает клавиша Tab в последней ячейке)"
          >
            <Plus className="w-3 h-3" />
            <span>+ Стр. снизу</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAddRowAbove}
            className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Добавить строку сверху"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onDeleteRow}
            className="p-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Удалить текущую строку"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800"></div>

        {/* Columns controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAddColRight}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-semibold transition-colors cursor-pointer"
            title="Добавить столбец справа"
          >
            <Plus className="w-3 h-3" />
            <span>+ Стлб. справа</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onAddColLeft}
            className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Добавить столбец слева"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onDeleteCol}
            className="p-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Удалить текущий столбец"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800"></div>

        {/* Column alignment & header toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onAlignCol('left')}
            className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            title="По левому краю"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onAlignCol('center')}
            className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            title="По центру"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onAlignCol('right')}
            className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            title="По правому краю"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onToggleHeader}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Сделать текущую строку шапкой"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Шапка</span>
          </button>
        </div>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800"></div>

        {/* Delete table & close */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onDeleteTable}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer font-medium"
            title="Удалить таблицу целиком"
          >
            <Trash2 className="w-3 h-3" />
            <span>Удалить</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            title="Закрыть панель управления таблицей"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};
