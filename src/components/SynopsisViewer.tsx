import React, { useState } from 'react';
import { ZoomIn, X, Download, Image as ImageIcon } from 'lucide-react';

interface SynopsisViewerProps {
  content: string;
  className?: string;
}

export const SynopsisViewer: React.FC<SynopsisViewerProps> = ({ content, className = '' }) => {
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);

  if (!content) {
    return <p className="text-gray-400 italic text-xs">Конспект пока не заполнен.</p>;
  }

  // Parse markdown content into structured blocks
  const renderFormattedContent = () => {
    // Split into lines while preserving empty lines for paragraph separation
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let codeLanguage = '';

    const flushParagraph = (key: string) => {
      if (currentParagraph.length === 0) return;
      const text = currentParagraph.join('\n').trim();
      currentParagraph = [];
      if (!text) return;

      elements.push(
        <div key={key} className="text-sm leading-relaxed text-[#374151] dark:text-[#D1D5DB]">
          {renderInlineFormatting(text)}
        </div>
      );
    };

    lines.forEach((line, idx) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${idx}`} className="my-3 rounded-xl overflow-hidden bg-gray-900 text-gray-100 p-3.5 font-mono text-xs border border-gray-800 shadow-inner overflow-x-auto">
              {codeLanguage && (
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2 border-b border-gray-800 pb-1">
                  {codeLanguage}
                </div>
              )}
              <pre className="whitespace-pre">{codeBlockLines.join('\n')}</pre>
            </div>
          );
          inCodeBlock = false;
          codeBlockLines = [];
          codeLanguage = '';
        } else {
          flushParagraph(`p-before-code-${idx}`);
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Standalone Markdown Image: ![alt](url)
      const imageMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imageMatch) {
        flushParagraph(`p-before-img-${idx}`);
        const altText = imageMatch[1] || 'Иллюстрация к конспекту';
        const src = imageMatch[2];

        elements.push(
          <figure 
            key={`img-${idx}`} 
            className="my-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#181B21] p-2 sm:p-3 shadow-xs group transition-all"
          >
            <div 
              className="relative rounded-xl overflow-hidden bg-white dark:bg-[#111317] flex items-center justify-center cursor-pointer min-h-[140px] max-h-[500px]"
              onClick={() => setZoomImage({ src, alt: altText })}
              title="Нажмите для увеличения изображения"
            >
              <img 
                src={src} 
                alt={altText} 
                className="w-full h-auto max-h-[480px] object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Увеличить</span>
                </span>
              </div>
            </div>
            {altText && altText !== 'Иллюстрация' && (
              <figcaption className="text-center text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 px-2 italic font-sans flex items-center justify-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{altText}</span>
              </figcaption>
            )}
          </figure>
        );
        return;
      }

      // Headings
      if (line.startsWith('### ')) {
        flushParagraph(`p-before-h3-${idx}`);
        elements.push(
          <h3 key={`h3-${idx}`} className="text-base font-bold text-[#111827] dark:text-[#F3F3EF] mt-5 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block"></span>
            <span>{line.replace('### ', '')}</span>
          </h3>
        );
        return;
      }

      if (line.startsWith('## ')) {
        flushParagraph(`p-before-h2-${idx}`);
        elements.push(
          <h2 key={`h2-${idx}`} className="text-lg font-bold text-[#111827] dark:text-[#F3F3EF] mt-6 mb-3 pb-1 border-b border-gray-100 dark:border-gray-800">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }

      if (line.startsWith('# ')) {
        flushParagraph(`p-before-h1-${idx}`);
        elements.push(
          <h1 key={`h1-${idx}`} className="text-xl font-bold text-[#111827] dark:text-[#F3F3EF] mt-6 mb-4">
            {line.replace('# ', '')}
          </h1>
        );
        return;
      }

      // Blockquotes / Notes
      if (line.startsWith('> ')) {
        flushParagraph(`p-before-quote-${idx}`);
        elements.push(
          <blockquote key={`quote-${idx}`} className="my-3 pl-4 py-2 border-l-3 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-xs sm:text-sm text-blue-900 dark:text-blue-200 rounded-r-xl italic">
            {line.replace('> ', '')}
          </blockquote>
        );
        return;
      }

      // Bullet list items
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
        flushParagraph(`p-before-li-${idx}`);
        const itemText = line.trim().replace(/^[-•*]\s+/, '');
        elements.push(
          <div key={`li-${idx}`} className="flex items-start gap-2.5 my-1 text-sm text-[#374151] dark:text-[#D1D5DB]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
            <span>{renderInlineFormatting(itemText)}</span>
          </div>
        );
        return;
      }

      // Numbered list items (1. 2. etc.)
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        flushParagraph(`p-before-num-${idx}`);
        elements.push(
          <div key={`num-${idx}`} className="flex items-start gap-2 my-1 text-sm text-[#374151] dark:text-[#D1D5DB]">
            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs mt-0.5 shrink-0 w-4 text-right">
              {numMatch[1]}.
            </span>
            <span>{renderInlineFormatting(numMatch[2])}</span>
          </div>
        );
        return;
      }

      // Empty line signals paragraph separation
      if (!line.trim()) {
        flushParagraph(`p-empty-${idx}`);
        return;
      }

      // Otherwise, accumulate in current paragraph
      currentParagraph.push(line);
    });

    flushParagraph('p-final');
    return elements;
  };

  // Helper for bold, italic, inline code, and inline images
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // If the text contains inline images: ![alt](url)
    const parts = text.split(/(!\[.*?\]\(.*?\))/g);
    
    return parts.map((part, pIdx) => {
      const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1] || 'Иллюстрация';
        const src = imgMatch[2];
        return (
          <span 
            key={`inline-img-${pIdx}`} 
            className="inline-block my-2 cursor-pointer group"
            onClick={() => setZoomImage({ src, alt })}
          >
            <img 
              src={src} 
              alt={alt} 
              className="max-h-64 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs inline-block" 
            />
          </span>
        );
      }

      // Handle bold **text**
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={`text-frag-${pIdx}`}>
          {boldParts.map((bPart, bIdx) => {
            if (bPart.startsWith('**') && bPart.endsWith('**')) {
              return (
                <strong key={`b-${bIdx}`} className="font-semibold text-[#111827] dark:text-[#F3F3EF]">
                  {bPart.slice(2, -2)}
                </strong>
              );
            }
            
            // Handle inline code `code`
            const codeParts = bPart.split(/(`.*?`)/g);
            return codeParts.map((cPart, cIdx) => {
              if (cPart.startsWith('`') && cPart.endsWith('`')) {
                return (
                  <code key={`code-${cIdx}`} className="px-1.5 py-0.5 text-xs font-mono rounded bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400">
                    {cPart.slice(1, -1)}
                  </code>
                );
              }
              return cPart;
            });
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={`synopsis-content-container space-y-3 font-sans ${className}`}>
      {renderFormattedContent()}

      {/* Lightbox Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setZoomImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <a
                href={zoomImage.src}
                download={`${zoomImage.alt || 'illustration'}.png`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                title="Скачать изображение"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setZoomImage(null)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                title="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <img 
              src={zoomImage.src} 
              alt={zoomImage.alt} 
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10" 
            />

            {zoomImage.alt && (
              <div className="mt-3 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs text-center max-w-lg">
                {zoomImage.alt}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
