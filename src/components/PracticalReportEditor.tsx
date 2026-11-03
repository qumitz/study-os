import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Send, 
  FileText, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Code, 
  Printer, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { PracticalWork, PracticalSubmission, User } from '../types';
import { 
  getStudentPracticalSubmission, 
  savePracticalSubmission,
  mergeRemoteSubmissions
} from '../lib/practicalSubmissionRegistry';
import { syncPracticalSubmissionToDb, fetchStudentPracticalSubmissionsFromDb, isSupabaseConfigured } from '../lib/supabase';
import { compressImage, extractImageFromClipboard } from '../lib/imageUtils';
import { TableInsertModal } from './TableInsertModal';
import { TableContextMenu, ActiveTableInfo } from './TableContextMenu';

interface PracticalReportEditorProps {
  work: PracticalWork;
  subjectId: string;
  subjectTitle: string;
  currentUser: User;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const PracticalReportEditor: React.FC<PracticalReportEditorProps> = ({
  work,
  subjectId,
  subjectTitle,
  currentUser,
  onClose,
  onSubmitted
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing submission or draft
  const submissionId = `sub-${currentUser.id}-${subjectId}-${work.number}`;
  const [submission, setSubmission] = useState<PracticalSubmission | null>(() => {
    return getStudentPracticalSubmission(currentUser.id, subjectId, work.number);
  });

  const [status, setStatus] = useState<'draft' | 'submitted' | 'graded' | 'needs_revision'>(
    submission?.status || 'draft'
  );
  const [lastSaved, setLastSaved] = useState<string | null>(
    submission ? new Date(submission.updatedAt).toLocaleTimeString() : null
  );
  const [showTasksDrawer, setShowTasksDrawer] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<string>('Times New Roman, serif');
  const [fontSize, setFontSize] = useState<string>('14pt');
  const [wordCount, setWordCount] = useState<number>(0);
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [activeTableInfo, setActiveTableInfo] = useState<ActiveTableInfo | null>(null);

  // Generate standard College Title Block HTML
  const generateTitleBlockHtml = () => {
    return `
      <div style="text-align: center; margin-bottom: 2rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 1.5rem; font-family: 'Times New Roman', serif;">
        <p style="margin: 0; font-size: 11pt; text-transform: uppercase; font-weight: bold; color: #475569;">Министерство образования Республики Беларусь</p>
        <p style="margin: 0.25rem 0 0; font-size: 10pt; color: #64748b;">Учреждение образования «Гродненский государственный университет имени Янки Купалы»</p>
        <p style="margin: 0.25rem 0 0; font-size: 11pt; font-weight: bold;">Лидский колледж</p>
        <div style="margin: 2rem 0 1.5rem;">
          <h2 style="margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase;">ОТЧЁТ</h2>
          <p style="margin: 0.5rem 0 0; font-size: 12pt; font-weight: bold;">по практической работе № ${work.number}</p>
          <p style="margin: 0.25rem 0 0; font-size: 12pt; font-style: italic;">«${work.title}»</p>
          <p style="margin: 0.25rem 0 0; font-size: 11pt; color: #334155;">Дисциплина: ${subjectTitle}</p>
        </div>
        <div style="text-align: right; margin-top: 1.5rem; font-size: 11pt; line-height: 1.6;">
          <p style="margin: 0;"><strong>Выполнил:</strong> учащийся группы ${currentUser.group || '37В'}</p>
          <p style="margin: 0;">${currentUser.name || 'Студент'}</p>
          <p style="margin: 0.5rem 0 0;"><strong>Проверил:</strong> преподаватель</p>
          <p style="margin: 0;">Селедцов А.И.</p>
        </div>
      </div>
      <h3>1. Цель работы</h3>
      <p>${work.goals || 'Изучить принципы и приобрести практические навыки выполнения работы.'}</p>
      <h3>2. Задачи и ход выполнения</h3>
      <p>Опишите ход выполнения каждого пункта задания, прикрепите подтверждающие скриншоты и листинги конфигурации:</p>
      <ol>
        ${work.tasks.map(t => `<li><strong>${t}</strong><br><p>[Опишите решение и прикрепите скриншот здесь]</p></li>`).join('')}
      </ol>
      <h3>3. Выводы</h3>
      <p>В ходе выполнения практической работы были освоены...</p>
    `;
  };

  // Initialize editor content and sync from cloud
  useEffect(() => {
    if (editorRef.current) {
      if (submission && submission.contentHtml) {
        editorRef.current.innerHTML = submission.contentHtml;
      } else {
        editorRef.current.innerHTML = generateTitleBlockHtml();
      }
      updateWordCount();
    }

    // Check cloud for existing submission on other devices
    if (isSupabaseConfigured() && currentUser?.id) {
      fetchStudentPracticalSubmissionsFromDb(currentUser.id, subjectId).then((remote) => {
        const remoteSub = remote.find(s => s.workNumber === work.number);
        if (remoteSub && remoteSub.contentHtml) {
          mergeRemoteSubmissions([remoteSub]);
          setSubmission(remoteSub);
          setStatus(remoteSub.status);
          if (editorRef.current && (!submission || !submission.contentHtml || remoteSub.status === 'graded')) {
            editorRef.current.innerHTML = remoteSub.contentHtml;
            updateWordCount();
          }
        }
      });
    }
  }, []);

  const updateWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
  };

  // Execute formatting command on contentEditable
  const executeCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      updateWordCount();
    }
  };

  // Insert image as base64 into document
  const insertImageToDoc = (base64Url: string, caption = 'Скриншот выполнения работы') => {
    const figureHtml = `
      <div style="margin: 1.5rem auto; text-align: center; max-width: 90%;">
        <img src="${base64Url}" alt="${caption}" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />
        <p style="margin: 0.5rem 0 0; font-size: 10pt; font-style: italic; color: #64748b;">Рисунок — ${caption}</p>
      </div>
      <p><br></p>
    `;
    executeCmd('insertHTML', figureHtml);
  };

  // Handle file input for image
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1600, 1200, 0.85);
      insertImageToDoc(compressed, file.name.replace(/\.[^/.]+$/, ''));
    } catch (err) {
      console.error('Failed to compress image', err);
      alert('Не удалось обработать изображение. Попробуйте другой файл.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Ctrl+V paste (with clipboard images)
  const handlePaste = async (e: React.ClipboardEvent) => {
    const dataUrl = await extractImageFromClipboard(e);
    if (dataUrl) {
      e.preventDefault();
      insertImageToDoc(dataUrl, `Скриншот экрана (${new Date().toLocaleTimeString()})`);
    } else {
      setTimeout(updateWordCount, 50);
    }
  };

  // Handle Drag & Drop of image files
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImage(file, 1600, 1200, 0.85);
          insertImageToDoc(compressed, file.name.replace(/\.[^/.]+$/, ''));
        } catch (err) {
          console.error('Failed to drop image', err);
        }
      }
    }
  };

  // Detect active table & cell whenever user clicks, types, or moves cursor
  const updateActiveTable = (targetElement?: EventTarget | null) => {
    let cell: HTMLTableCellElement | null = null;
    if (targetElement && targetElement instanceof HTMLElement) {
      cell = targetElement.closest('td, th');
    }
    if (!cell) {
      const sel = window.getSelection();
      if (sel && sel.anchorNode && editorRef.current) {
        const node = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode as HTMLElement;
        cell = node?.closest('td, th') as HTMLTableCellElement | null;
      }
    }
    if (!cell && document.activeElement instanceof HTMLElement) {
      cell = document.activeElement.closest('td, th');
    }

    if (cell && editorRef.current?.contains(cell)) {
      const tr = cell.closest('tr') as HTMLTableRowElement | null;
      const table = cell.closest('table') as HTMLTableElement | null;
      if (tr && table) {
        setActiveTableInfo({
          table,
          cell,
          tr,
          rowIndex: tr.rowIndex,
          colIndex: cell.cellIndex,
          totalRows: table.rows.length,
          totalCols: tr.cells.length,
          isHeader: cell.tagName.toLowerCase() === 'th' || tr.rowIndex === 0
        });
        return;
      }
    }
    setActiveTableInfo(null);
  };

  // Insert Table from Modal
  const handleInsertCustomTable = (tableHtml: string) => {
    setShowTableModal(false);
    if (!editorRef.current) return;
    editorRef.current.focus();

    // Try standard execCommand first
    const success = document.execCommand('insertHTML', false, tableHtml);
    if (!success) {
      // Fallback: append to editor
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = tableHtml;
      while (tempDiv.firstChild) {
        editorRef.current.appendChild(tempDiv.firstChild);
      }
    }

    updateWordCount();
    setTimeout(() => {
      const tables = editorRef.current?.querySelectorAll('table');
      if (tables && tables.length > 0) {
        const lastTable = tables[tables.length - 1];
        const firstCell = lastTable.querySelector('tbody td') || lastTable.querySelector('td, th');
        if (firstCell instanceof HTMLElement) {
          firstCell.focus();
          updateActiveTable(firstCell);
        }
      }
    }, 60);
  };

  // Add row below
  const handleAddRowBelow = () => {
    if (!activeTableInfo) return;
    const { table, tr } = activeTableInfo;
    const newRow = table.insertRow(tr.rowIndex + 1);
    const colCount = tr.cells.length;
    for (let i = 0; i < colCount; i++) {
      const cell = newRow.insertCell(i);
      cell.style.border = '1px solid #cbd5e1';
      cell.style.padding = '8px 12px';
      cell.style.minWidth = '60px';
      cell.style.minHeight = '36px';
      // Auto-number first column if previous row had number
      const prevFirstCellText = tr.cells[0]?.innerText.trim() || '';
      const prevNum = parseInt(prevFirstCellText, 10);
      if (i === 0 && !isNaN(prevNum)) {
        cell.innerText = `${prevNum + 1}`;
      } else {
        cell.innerHTML = '<br>';
      }
    }
    const targetCell = newRow.cells[0];
    targetCell?.focus();
    updateActiveTable(targetCell);
    updateWordCount();
  };

  // Add row above
  const handleAddRowAbove = () => {
    if (!activeTableInfo) return;
    const { table, tr } = activeTableInfo;
    const newRow = table.insertRow(tr.rowIndex);
    const colCount = tr.cells.length;
    for (let i = 0; i < colCount; i++) {
      const cell = newRow.insertCell(i);
      cell.style.border = '1px solid #cbd5e1';
      cell.style.padding = '8px 12px';
      cell.style.minWidth = '60px';
      cell.style.minHeight = '36px';
      cell.innerHTML = '<br>';
    }
    const targetCell = newRow.cells[0];
    targetCell?.focus();
    updateActiveTable(targetCell);
    updateWordCount();
  };

  // Delete row
  const handleDeleteRow = () => {
    if (!activeTableInfo) return;
    const { table, tr } = activeTableInfo;
    if (table.rows.length <= 1) {
      const wrapper = table.closest('.table-responsive-wrapper') || table;
      wrapper.remove();
      setActiveTableInfo(null);
    } else {
      const nextIndex = Math.min(tr.rowIndex, table.rows.length - 2);
      table.deleteRow(tr.rowIndex);
      const focusRow = table.rows[nextIndex];
      const targetCell = focusRow?.cells[0];
      targetCell?.focus();
      updateActiveTable(targetCell);
    }
    updateWordCount();
  };

  // Add column right
  const handleAddColRight = () => {
    if (!activeTableInfo) return;
    const { table, colIndex, tr } = activeTableInfo;
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      const targetCell = row.cells[colIndex];
      const isHeader = targetCell?.tagName.toLowerCase() === 'th';
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px 12px';
      newCell.style.minWidth = '60px';
      newCell.style.minHeight = '36px';
      if (isHeader) {
        newCell.style.fontWeight = 'bold';
        newCell.style.textAlign = 'left';
        newCell.innerText = `Колонка ${row.cells.length + 1}`;
      } else {
        newCell.innerHTML = '<br>';
      }
      if (targetCell && targetCell.nextSibling) {
        row.insertBefore(newCell, targetCell.nextSibling);
      } else {
        row.appendChild(newCell);
      }
    }
    const focusCell = table.rows[tr.rowIndex]?.cells[colIndex + 1];
    focusCell?.focus();
    updateActiveTable(focusCell);
    updateWordCount();
  };

  // Add column left
  const handleAddColLeft = () => {
    if (!activeTableInfo) return;
    const { table, colIndex, tr } = activeTableInfo;
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      const targetCell = row.cells[colIndex];
      const isHeader = targetCell?.tagName.toLowerCase() === 'th';
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px 12px';
      newCell.style.minWidth = '60px';
      newCell.style.minHeight = '36px';
      if (isHeader) {
        newCell.style.fontWeight = 'bold';
        newCell.style.textAlign = 'left';
        newCell.innerText = `Колонка ${colIndex + 1}`;
      } else {
        newCell.innerHTML = '<br>';
      }
      if (targetCell) {
        row.insertBefore(newCell, targetCell);
      } else {
        row.appendChild(newCell);
      }
    }
    const focusCell = table.rows[tr.rowIndex]?.cells[colIndex];
    focusCell?.focus();
    updateActiveTable(focusCell);
    updateWordCount();
  };

  // Delete column
  const handleDeleteCol = () => {
    if (!activeTableInfo) return;
    const { table, colIndex, tr } = activeTableInfo;
    if (tr.cells.length <= 1) {
      const wrapper = table.closest('.table-responsive-wrapper') || table;
      wrapper.remove();
      setActiveTableInfo(null);
    } else {
      for (let r = 0; r < table.rows.length; r++) {
        if (table.rows[r].cells[colIndex]) {
          table.rows[r].deleteCell(colIndex);
        }
      }
      const nextCol = Math.min(colIndex, (table.rows[tr.rowIndex]?.cells.length || 1) - 1);
      const focusCell = table.rows[tr.rowIndex]?.cells[nextCol];
      focusCell?.focus();
      updateActiveTable(focusCell);
    }
    updateWordCount();
  };

  // Toggle header
  const handleToggleHeader = () => {
    if (!activeTableInfo) return;
    const { tr } = activeTableInfo;
    const isCurrentlyTh = tr.cells[0]?.tagName.toLowerCase() === 'th';
    const newTagName = isCurrentlyTh ? 'td' : 'th';
    const cellsArray = Array.from(tr.cells);
    cellsArray.forEach(cell => {
      const newCell = document.createElement(newTagName);
      newCell.innerHTML = cell.innerHTML;
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px 12px';
      newCell.style.minWidth = '60px';
      newCell.style.minHeight = '36px';
      if (!isCurrentlyTh) {
        newCell.style.fontWeight = 'bold';
      } else {
        newCell.style.fontWeight = 'normal';
      }
      tr.replaceChild(newCell, cell);
    });
    updateActiveTable();
  };

  // Align column
  const handleAlignCol = (align: 'left' | 'center' | 'right') => {
    if (!activeTableInfo) return;
    const { table, colIndex } = activeTableInfo;
    for (let r = 0; r < table.rows.length; r++) {
      const cell = table.rows[r].cells[colIndex];
      if (cell) {
        cell.style.textAlign = align;
      }
    }
  };

  // Delete table
  const handleDeleteTable = () => {
    if (!activeTableInfo) return;
    if (window.confirm('Удалить эту таблицу целиком?')) {
      const wrapper = activeTableInfo.table.closest('.table-responsive-wrapper') || activeTableInfo.table;
      wrapper.remove();
      setActiveTableInfo(null);
      updateWordCount();
    }
  };

  // Handle Tab key inside table for Word-like auto-addition
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      const sel = window.getSelection();
      const node = sel?.anchorNode?.nodeType === 3 
        ? sel.anchorNode.parentElement 
        : sel?.anchorNode as HTMLElement | null;
      const cell = node?.closest('td, th') as HTMLTableCellElement | null;
      
      if (cell && editorRef.current?.contains(cell)) {
        e.preventDefault();
        const tr = cell.closest('tr');
        const table = cell.closest('table');
        if (tr && table) {
          if (!e.shiftKey) {
            // Tab forward
            const isLastCellInRow = cell.cellIndex === tr.cells.length - 1;
            const isLastRow = tr.rowIndex === table.rows.length - 1;
            if (isLastCellInRow && isLastRow) {
              // Word-like auto-addition of new row at table end!
              const newRow = table.insertRow(tr.rowIndex + 1);
              const colCount = tr.cells.length;
              for (let i = 0; i < colCount; i++) {
                const c = newRow.insertCell(i);
                c.style.border = '1px solid #cbd5e1';
                c.style.padding = '8px 12px';
                c.style.minWidth = '60px';
                c.style.minHeight = '36px';
                const prevFirst = tr.cells[0]?.innerText.trim() || '';
                const num = parseInt(prevFirst, 10);
                if (i === 0 && !isNaN(num)) {
                  c.innerText = `${num + 1}`;
                } else {
                  c.innerHTML = '<br>';
                }
              }
              updateActiveTable();
              updateWordCount();
              newRow.cells[0]?.focus();
            } else if (isLastCellInRow) {
              const nextRow = table.rows[tr.rowIndex + 1];
              nextRow?.cells[0]?.focus();
              updateActiveTable();
            } else {
              tr.cells[cell.cellIndex + 1]?.focus();
              updateActiveTable();
            }
          } else {
            // Shift+Tab backward
            if (cell.cellIndex > 0) {
              tr.cells[cell.cellIndex - 1]?.focus();
              updateActiveTable();
            } else if (tr.rowIndex > 0) {
              const prevRow = table.rows[tr.rowIndex - 1];
              prevRow?.cells[prevRow.cells.length - 1]?.focus();
              updateActiveTable();
            }
          }
        }
      }
    }
  };

  // Insert Code Snippet Block
  const insertCodeBlock = () => {
    const codeHtml = `
      <pre style="background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 10.5pt; overflow-x: auto; margin: 1.5rem 0;"><code>// Вставьте программный код или конфигурацию сюда
console.log("Практическая работа выполнена");</code></pre>
      <p><br></p>
    `;
    executeCmd('insertHTML', codeHtml);
  };

  // Save as Draft
  const handleSaveDraft = (silent = false) => {
    if (!editorRef.current) return;
    setIsSaving(true);
    const content = editorRef.current.innerHTML;

    const payload: PracticalSubmission = {
      id: submissionId,
      studentId: currentUser.id,
      studentName: currentUser.name || 'Студент',
      group: currentUser.group || '37В',
      subjectId,
      subjectTitle,
      workNumber: work.number,
      workTitle: work.title,
      contentHtml: content,
      submittedAt: submission?.submittedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: submission?.status === 'graded' ? 'graded' : 'draft',
      grade: submission?.grade,
      gradedAt: submission?.gradedAt,
      gradedBy: submission?.gradedBy,
      teacherFeedback: submission?.teacherFeedback
    };

    const saved = savePracticalSubmission(payload);
    setSubmission(saved);
    setStatus(saved.status);
    setLastSaved(new Date().toLocaleTimeString());
    setIsSaving(false);

    if (!silent) {
      // Toast notification feedback
    }
  };

  // Submit to Teacher for grading
  const handleSubmitToTeacher = async () => {
    if (!editorRef.current) return;
    const confirmed = window.confirm(
      'Отправить готовую работу преподавателю Селедцову А.И. на проверку?'
    );
    if (!confirmed) return;

    setIsSaving(true);
    const content = editorRef.current.innerHTML;

    const payload: PracticalSubmission = {
      id: submissionId,
      studentId: currentUser.id,
      studentName: currentUser.name || 'Студент',
      group: currentUser.group || '37В',
      subjectId,
      subjectTitle,
      workNumber: work.number,
      workTitle: work.title,
      contentHtml: content,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'submitted',
      grade: null,
      teacherFeedback: undefined
    };

    const saved = savePracticalSubmission(payload);
    setSubmission(saved);
    setStatus('submitted');
    setLastSaved(new Date().toLocaleTimeString());

    let alertMessage = 'Работа успешно отправлена преподавателю на проверку!';
    if (isSupabaseConfigured()) {
      try {
        const ok = await syncPracticalSubmissionToDb(payload);
        if (ok) {
          alertMessage = 'Работа успешно отправлена в облако! Преподаватель сразу увидит её со своего телефона или компьютера.';
        }
      } catch (err) {
        console.warn('Supabase submission sync error:', err);
      }
    }

    setIsSaving(false);
    alert(alertMessage);
    if (onSubmitted) onSubmitted();
  };

  // Print Document
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F1F3F5] dark:bg-[#0B0D11] text-[#111827] dark:text-[#F3F3EF] animate-in fade-in duration-200 overflow-hidden">
      {/* Top Header / Ribbon Navigation */}
      <header className="px-3 sm:px-4 py-2.5 bg-white dark:bg-[#15181E] border-b border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <FileText className="w-4 h-4 sm:w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-[#111827] dark:text-[#F3F3EF] truncate max-w-[140px] sm:max-w-none">
                № {work.number}: {work.title}
              </h2>
              {status === 'draft' && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 shrink-0">
                  Черновик
                </span>
              )}
              {status === 'submitted' && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span className="hidden sm:inline">Отправлено</span>
                </span>
              )}
              {status === 'graded' && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{submission?.grade}/10</span>
                </span>
              )}
              {status === 'needs_revision' && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1 shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="hidden sm:inline">Доработка</span>
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {subjectTitle} • {currentUser.name || 'Студент'}
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {lastSaved && (
            <span className="text-[11px] text-gray-400 hidden lg:inline">
              Сохранено в {lastSaved}
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowTasksDrawer(!showTasksDrawer)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer ${
              showTasksDrawer
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            title="Задания работы"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="hidden sm:inline">Задания</span>
            {showTasksDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            title="Печать или экспорт в PDF"
            className="p-1.5 sm:p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleSaveDraft(false)}
            disabled={isSaving}
            title="Сохранить черновик"
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1E24] hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сохранить</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitToTeacher}
            disabled={isSaving || status === 'submitted'}
            title="Отправить на проверку преподавателю"
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{status === 'submitted' ? 'Сдано' : 'Сдать'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Word Toolbar */}
      <div className="px-4 py-2 bg-white dark:bg-[#12151B] border-b border-[#E5E7EB] dark:border-[#262A32] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 shadow-xs">
        {/* Font Family */}
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            executeCmd('fontName', e.target.value);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1E24] text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="'Times New Roman', serif">Times New Roman (ГОСТ)</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Segoe UI', sans-serif">Segoe UI</option>
          <option value="'Courier New', monospace">Courier New (Код)</option>
        </select>

        {/* Font Size */}
        <select
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value);
            executeCmd('fontSize', e.target.value === '18pt' ? '5' : e.target.value === '16pt' ? '4' : '3');
          }}
          className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1E24] text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="12pt">12 pt</option>
          <option value="14pt">14 pt (ГОСТ)</option>
          <option value="16pt">16 pt</option>
          <option value="18pt">18 pt</option>
        </select>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

        {/* Text Styles */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => executeCmd('bold')}
            title="Жирный (Ctrl+B)"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('italic')}
            title="Курсив (Ctrl+I)"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('underline')}
            title="Подчёркнутый (Ctrl+U)"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('strikeThrough')}
            title="Зачёркнутый"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => executeCmd('formatBlock', '<h2>')}
            title="Заголовок 2"
            className="px-2 py-1 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => executeCmd('formatBlock', '<h3>')}
            title="Заголовок 3"
            className="px-2 py-1 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => executeCmd('formatBlock', '<p>')}
            title="Обычный текст"
            className="px-2 py-1 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Текст
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => executeCmd('justifyLeft')}
            title="По левому краю"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('justifyCenter')}
            title="По центру"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('justifyRight')}
            title="По правому краю"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('justifyFull')}
            title="По ширине (ГОСТ)"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => executeCmd('insertUnorderedList')}
            title="Маркированный список"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('insertOrderedList')}
            title="Нумерованный список"
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

        {/* Insert Options */}
        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold border border-blue-200 dark:border-blue-900 transition-colors"
            title="Вставить скриншот или рисунок (также работает Ctrl+V прямо в текст)"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Вставить скриншот</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] transition-colors cursor-pointer"
            title="Вставить таблицу (настраиваемая сетка или готовые шаблоны для отчёта)"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Таблица</span>
          </button>

          <button
            type="button"
            onClick={insertCodeBlock}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300"
            title="Вставить блок программного кода"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Код</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Вставить стандартный титульный блок Лидского колледжа?')) {
                executeCmd('insertHTML', generateTitleBlockHtml());
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-medium"
            title="Вставить титульный лист отчёта"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Титульный лист</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Collapsible Tasks Panel + Document Sheet */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Tasks & Guidelines Drawer */}
        {showTasksDrawer && (
          <aside className="absolute inset-y-0 left-0 z-20 w-full sm:w-96 sm:relative border-r border-[#E5E7EB] dark:border-[#262A32] bg-white dark:bg-[#15181E] p-4 sm:p-5 overflow-y-auto shrink-0 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                Методические указания
              </h3>
              <button
                onClick={() => setShowTasksDrawer(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <strong className="text-gray-900 dark:text-white block mb-1">Цель работы:</strong>
                <p className="text-gray-600 dark:text-gray-300 bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                  {work.goals}
                </p>
              </div>

              <div>
                <strong className="text-gray-900 dark:text-white block mb-1.5">Задачи к выполнению:</strong>
                <ol className="list-decimal pl-4 space-y-1.5 text-gray-700 dark:text-gray-300">
                  {work.tasks.map((task, idx) => (
                    <li key={idx} className="pl-1">{task}</li>
                  ))}
                </ol>
              </div>

              {work.sampleReport && (
                <div>
                  <strong className="text-gray-900 dark:text-white block mb-1">Пример оформления:</strong>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[11px] font-mono whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                    {work.sampleReport}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Center: A4 Paper Sheet Canvas */}
        <main 
          className="flex-1 overflow-y-auto p-2 sm:p-6 md:p-8 flex flex-col items-center bg-[#EAECEF] dark:bg-[#0D0F14] relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Active Table Context Menu Bar (Floating on Desktop + Sticky Bottom on Mobile) */}
          {activeTableInfo && (
            <TableContextMenu
              info={activeTableInfo}
              onAddRowBelow={handleAddRowBelow}
              onAddRowAbove={handleAddRowAbove}
              onDeleteRow={handleDeleteRow}
              onAddColRight={handleAddColRight}
              onAddColLeft={handleAddColLeft}
              onDeleteCol={handleDeleteCol}
              onToggleHeader={handleToggleHeader}
              onAlignCol={handleAlignCol}
              onDeleteTable={handleDeleteTable}
              onClose={() => setActiveTableInfo(null)}
            />
          )}

          <div className="w-full max-w-[850px] space-y-4">
            {/* Teacher Feedback Alert Banner if already reviewed */}
            {submission && submission.status === 'graded' && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Работа проверена преподавателем: Оценка {submission.grade} из 10
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    {submission.gradedAt ? new Date(submission.gradedAt).toLocaleDateString() : ''}
                  </span>
                </div>
                {submission.teacherFeedback && (
                  <p className="pt-1 text-emerald-800 dark:text-emerald-300 italic">
                    Замечания преподавателя ({submission.gradedBy || 'Селедцов А.И.'}): «{submission.teacherFeedback}»
                  </p>
                )}
              </div>
            )}

            {submission && submission.status === 'needs_revision' && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Преподаватель вернул работу на доработку
                  </span>
                </div>
                {submission.teacherFeedback && (
                  <p className="pt-1 text-rose-800 dark:text-rose-300">
                    Причина: «{submission.teacherFeedback}». Внесите исправления и отправьте работу повторно.
                  </p>
                )}
              </div>
            )}

            {/* A4 Sheet Container */}
            <div 
              className="bg-white dark:bg-[#161920] border border-[#D1D5DB] dark:border-[#2C313C] rounded-lg shadow-xl p-4 sm:p-8 md:p-14 min-h-[500px] sm:min-h-[1100px] transition-colors"
              style={{
                fontFamily: fontFamily,
                fontSize: fontSize
              }}
            >
              {/* The contentEditable Word Canvas */}
              <div
                ref={editorRef}
                contentEditable={status !== 'graded'}
                onPaste={handlePaste}
                onInput={() => {
                  updateWordCount();
                  updateActiveTable();
                }}
                onKeyDown={handleKeyDown}
                onClick={(e) => updateActiveTable(e.target)}
                onTouchEnd={(e) => updateActiveTable(e.target)}
                onKeyUp={(e) => updateActiveTable(e.target)}
                onFocus={(e) => updateActiveTable(e.target)}
                onBlur={() => {
                  handleSaveDraft(true);
                }}
                className="outline-none min-h-[420px] sm:min-h-[900px] text-gray-900 dark:text-gray-100 leading-relaxed word-document-body"
                style={{
                  lineHeight: '1.65'
                }}
              />
            </div>

            {/* Document Bottom Footer Status */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2 pb-6">
              <span>Слов в документе: <strong>{wordCount}</strong></span>
              <span className="italic">Совет: скриншоты можно вставлять напрямую комбинацией клавиш Ctrl+V</span>
            </div>
          </div>
        </main>
      </div>

      {/* Table Insert Modal */}
      <TableInsertModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onInsertTable={handleInsertCustomTable}
      />
    </div>
  );
};
