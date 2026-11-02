import React, { useState } from 'react';
import { X, Table as TableIcon, Plus, Minus, Check, Sparkles, Layers } from 'lucide-react';

interface TableInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (tableHtml: string) => void;
}

interface TablePreset {
  id: string;
  name: string;
  description: string;
  rows: number;
  cols: number;
  headers: string[];
  defaultRows: string[][];
}

const PRESETS: TablePreset[] = [
  {
    id: 'measurements',
    name: 'Таблица измерений и параметров',
    description: 'Для лабораторных работ по схемотехнике, ТО, ТСИ и физике',
    rows: 4,
    cols: 5,
    headers: ['№ п/п', 'Контрольный узел / Параметр', 'Номинал', 'Измеренное значение', 'Погрешность (%)'],
    defaultRows: [
      ['1', 'Напряжение питания Vcc', '+5.0 В', '+4.98 В', '0.4%'],
      ['2', 'Тактовая частота f_clk', '16.0 МГц', '15.99 МГц', '0.06%'],
      ['3', 'Ток потребления I_пот', '120 мА', '118 мА', '1.6%']
    ]
  },
  {
    id: 'equipment',
    name: 'Аппаратное и программное обеспечение',
    description: 'Для описания лабораторного стенда, ПК и рабочих утилит',
    rows: 4,
    cols: 4,
    headers: ['№', 'Наименование компонента / ПО', 'Модель / Версия', 'Назначение в работе'],
    defaultRows: [
      ['1', 'Отладочная плата STM32', 'STM32F401 BlackPill', 'Основной микроконтроллер'],
      ['2', 'Логический анализатор', 'Saleae 8-ch 24MHz', 'Снятие временных диаграмм'],
      ['3', 'Среда разработки', 'Keil µVision / VS Code', 'Написание и компиляция прошивки']
    ]
  },
  {
    id: 'testcases',
    name: 'Тестирование и проверка работоспособности',
    description: 'Для фиксации результатов тестов, входных данных и проверок',
    rows: 4,
    cols: 5,
    headers: ['№', 'Тестовый сценарий', 'Входные данные', 'Фактический результат', 'Вердикт'],
    defaultRows: [
      ['1', 'Инициализация интерфейса', 'Команда RESET', 'Ответ READY (0x01)', 'Пройден (OK)'],
      ['2', 'Передача пакета данных', 'Буфер 64 байта', 'CRC совпадает, 64 байта', 'Пройден (OK)'],
      ['3', 'Обработка ошибки тайм-аута', 'Обрыв линии на 5 сек', 'Код ошибки TIMEOUT_ERR', 'Пройден (OK)']
    ]
  },
  {
    id: 'network',
    name: 'Сетевая адресация и порты (IP / VLAN)',
    description: 'Для работ по сетевым технологиям (СТОИ, ПСПИ, Cisco)',
    rows: 4,
    cols: 5,
    headers: ['Узел сети', 'Интерфейс', 'IP-адрес', 'Маска / Префикс', 'Шлюз по умолчанию'],
    defaultRows: [
      ['Маршрутизатор R1', 'GigabitEthernet 0/0', '192.168.10.1', '255.255.255.0 (/24)', '—'],
      ['Коммутатор SW1', 'VLAN 10 Management', '192.168.10.2', '255.255.255.0 (/24)', '192.168.10.1'],
      ['Рабочая станция PC-01', 'Ethernet (DHCP)', '192.168.10.50', '255.255.255.0 (/24)', '192.168.10.1']
    ]
  },
  {
    id: 'comparison',
    name: 'Сравнительный анализ решений',
    description: 'Для выводов и сопоставления алгоритмов/инструментов',
    rows: 4,
    cols: 3,
    headers: ['Критерий сравнения', 'Вариант А (Базовый)', 'Вариант Б (Оптимизированный)'],
    defaultRows: [
      ['Быстродействие (время выполнения)', '45 мс', '12 мс'],
      ['Объём используемой памяти RAM', '2.4 КБ', '1.1 КБ'],
      ['Сложность реализации', 'Простая', 'Средняя']
    ]
  }
];

export const TableInsertModal: React.FC<TableInsertModalProps> = ({
  isOpen,
  onClose,
  onInsertTable
}) => {
  const [tab, setTab] = useState<'custom' | 'preset'>('custom');
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [hoverGrid, setHoverGrid] = useState<{ r: number; c: number } | null>(null);
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [selectedPreset, setSelectedPreset] = useState<string>('measurements');

  if (!isOpen) return null;

  const buildHtml = (
    rowCount: number, 
    colCount: number, 
    useHeader: boolean, 
    headerList?: string[], 
    rowList?: string[][]
  ) => {
    let html = `<div class="table-responsive-wrapper" style="overflow-x: auto; max-width: 100%; margin: 1.25rem 0; -webkit-overflow-scrolling: touch;">`;
    html += `<table style="width: 100%; min-width: 100%; border-collapse: collapse; font-size: 11pt; border: 1px solid #cbd5e1;">`;
    
    if (useHeader) {
      html += `<thead><tr>`;
      for (let c = 0; c < colCount; c++) {
        const headerText = headerList && headerList[c] ? headerList[c] : (c === 0 ? '№ п/п' : `Колонка ${c + 1}`);
        html += `<th style="border: 1px solid #cbd5e1; padding: 8px 12px; font-weight: bold; text-align: left;">${headerText}</th>`;
      }
      html += `</tr></thead>`;
    }

    html += `<tbody>`;
    const bodyRows = useHeader ? Math.max(1, rowCount - 1) : rowCount;
    for (let r = 0; r < bodyRows; r++) {
      html += `<tr>`;
      for (let c = 0; c < colCount; c++) {
        let cellVal = '';
        if (rowList && rowList[r] && rowList[r][c] !== undefined) {
          cellVal = rowList[r][c];
        } else if (c === 0) {
          cellVal = `${r + 1}`;
        }
        html += `<td style="border: 1px solid #cbd5e1; padding: 8px 12px; min-width: 60px; min-height: 36px;">${cellVal || '<br>'}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table></div><p><br></p>`;
    return html;
  };

  const handleApply = () => {
    if (tab === 'custom') {
      const html = buildHtml(rows, cols, hasHeader);
      onInsertTable(html);
    } else {
      const preset = PRESETS.find(p => p.id === selectedPreset);
      if (preset) {
        const html = buildHtml(preset.rows, preset.cols, true, preset.headers, preset.defaultRows);
        onInsertTable(html);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#161920] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                Вставка таблицы
              </h3>
              <p className="text-[11px] text-gray-500">
                Создание настраиваемой таблицы или готового шаблона для лабы
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === 'custom'
                ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Свой размер
          </button>
          <button
            type="button"
            onClick={() => setTab('preset')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              tab === 'preset'
                ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Шаблоны для отчёта</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {tab === 'custom' ? (
            <div className="space-y-4">
              {/* Interactive Grid Selector (Desktop & Tablet) */}
              <div className="hidden xs:block text-center">
                <span className="text-[11px] font-semibold text-gray-500 block mb-2">
                  Быстрый выбор сеткой: <strong className="text-gray-900 dark:text-white font-mono">{hoverGrid ? `${hoverGrid.c} × ${hoverGrid.r}` : `${cols} × ${rows}`}</strong>
                </span>
                <div 
                  className="inline-grid grid-cols-6 gap-1 p-2 rounded-xl bg-gray-50 dark:bg-[#1C2028] border border-gray-200 dark:border-gray-700/60"
                  onMouseLeave={() => setHoverGrid(null)}
                >
                  {[1, 2, 3, 4, 5, 6].map(r => (
                    <React.Fragment key={r}>
                      {[1, 2, 3, 4, 5, 6].map(c => {
                        const isHovered = hoverGrid ? c <= hoverGrid.c && r <= hoverGrid.r : c <= cols && r <= rows;
                        return (
                          <div
                            key={`${r}-${c}`}
                            onMouseEnter={() => setHoverGrid({ r, c })}
                            onClick={() => {
                              setRows(r);
                              setCols(c);
                            }}
                            className={`w-6 h-6 rounded-md transition-colors cursor-pointer border ${
                              isHovered
                                ? 'bg-blue-500 border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-[#14161C] border-gray-200 dark:border-gray-700 hover:border-blue-400'
                            }`}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Rows & Cols Inputs */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Columns */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#181B22] border border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                    Столбцы (колонки)
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCols(Math.max(1, cols - 1))}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-[#222630] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 active:scale-95 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-bold font-mono text-gray-900 dark:text-white px-2">
                      {cols}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCols(Math.min(10, cols + 1))}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-[#222630] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rows */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#181B22] border border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                    Строки (ряды)
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setRows(Math.max(1, rows - 1))}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-[#222630] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 active:scale-95 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-bold font-mono text-gray-900 dark:text-white px-2">
                      {rows}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRows(Math.min(25, rows + 1))}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-[#222630] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Header Toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#181B22] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                />
                <div className="text-xs">
                  <strong className="text-gray-900 dark:text-white block">
                    Выделить первую строку как шапку таблицы
                  </strong>
                  <span className="text-gray-500">
                    Заголовки будут с полужирным шрифтом и контрастным фоном
                  </span>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-2.5">
              <span className="text-xs text-gray-500 block mb-1">
                Выберите готовый структурированный шаблон для вашего отчёта:
              </span>
              {PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPreset(p.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedPreset === p.id
                      ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-[#2563EB]'
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#181B22]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      {selectedPreset === p.id && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {p.cols} колонок × {p.rows} строк
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-2">
                    {p.description}
                  </p>
                  <div className="flex items-center gap-1 flex-wrap text-[10px] text-gray-600 dark:text-gray-300">
                    {p.headers.map((h, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/60 truncate max-w-[120px]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 sm:px-6 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#14161C] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Вставить в отчёт</span>
          </button>
        </div>
      </div>
    </div>
  );
};
