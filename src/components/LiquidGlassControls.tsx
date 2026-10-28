import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

/* =========================================================================
   1. Physical Glass Theme Switcher (Light / Dark)
   Based on user-supplied reference code with 10-layer specular reflections,
   SVG normal-map refraction (#switcher), and scaleToggle squish animations.
   ========================================================================= */

interface LiquidThemeSwitcherProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const LiquidThemeSwitcher: React.FC<LiquidThemeSwitcherProps> = ({
  isDarkMode,
  setIsDarkMode,
}) => {
  const [previousOption, setPreviousOption] = useState<'1' | '2'>('1');
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);

  const currentOption = isDarkMode ? '2' : '1';

  const handleSelect = (option: '1' | '2') => {
    if (option === currentOption) return;
    setPreviousOption(currentOption);
    setIsDarkMode(option === '2');
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-2">
      <fieldset
        ref={fieldsetRef}
        className="switcher"
        data-option={currentOption}
        data-previous={previousOption}
        aria-label="Выбор базовой темы"
      >
        <legend className="switcher__legend">Выбор темы</legend>

        {/* Option 1: Light Theme */}
        <label
          className={`switcher__option ${!isDarkMode ? 'is-active' : ''}`}
          onClick={() => handleSelect('1')}
          title="Светлая тема"
        >
          <input
            className="switcher__input"
            type="radio"
            name="study_os_theme_radio"
            value="light"
            checked={!isDarkMode}
            onChange={() => handleSelect('1')}
          />
          <svg
            className="switcher__icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 36 36"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M18 12a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
              clipRule="evenodd"
            />
            <path
              fill="currentColor"
              d="M17 6.038a1 1 0 1 1 2 0v3a1 1 0 0 1-2 0v-3ZM24.244 7.742a1 1 0 1 1 1.618 1.176L24.1 11.345a1 1 0 1 1-1.618-1.176l1.763-2.427ZM29.104 13.379a1 1 0 0 1 .618 1.902l-2.854.927a1 1 0 1 1-.618-1.902l2.854-.927ZM29.722 20.795a1 1 0 0 1-.619 1.902l-2.853-.927a1 1 0 1 1 .618-1.902l2.854.927ZM25.862 27.159a1 1 0 0 1-1.618 1.175l-1.763-2.427a1 1 0 1 1 1.618-1.175l1.763 2.427ZM19 30.038a1 1 0 0 1-2 0v-3a1 1 0 1 1 2 0v3ZM11.755 28.334a1 1 0 0 1-1.618-1.175l1.764-2.427a1 1 0 1 1 1.618 1.175l-1.764 2.427ZM6.896 22.697a1 1 0 1 1-.618-1.902l2.853-.927a1 1 0 1 1 .618 1.902l-2.853.927ZM6.278 15.28a1 1 0 1 1 .618-1.901l2.853.927a1 1 0 1 1-.618 1.902l-2.853-.927ZM10.137 8.918a1 1 0 0 1 1.618-1.176l1.764 2.427a1 1 0 0 1-1.618 1.176l-1.764-2.427Z"
            />
          </svg>
        </label>

        {/* Option 2: Dark Theme */}
        <label
          className={`switcher__option ${isDarkMode ? 'is-active' : ''}`}
          onClick={() => handleSelect('2')}
          title="Тёмная тема"
        >
          <input
            className="switcher__input"
            type="radio"
            name="study_os_theme_radio"
            value="dark"
            checked={isDarkMode}
            onChange={() => handleSelect('2')}
          />
          <svg
            className="switcher__icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 36 36"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12.5 8.473a10.968 10.968 0 0 1 8.785-.97 7.435 7.435 0 0 0-3.737 4.672l-.09.373A7.454 7.454 0 0 0 28.732 20.4a10.97 10.97 0 0 1-5.232 7.125l-.497.27c-5.014 2.566-11.175.916-14.234-3.813l-.295-.483C5.53 18.403 7.13 11.93 12.017 8.77l.483-.297Zm4.234.616a8.946 8.946 0 0 0-2.805.883l-.429.234A9 9 0 0 0 10.206 22.5l.241.395A9 9 0 0 0 22.5 25.794l.416-.255a8.94 8.94 0 0 0 2.167-1.99 9.433 9.433 0 0 1-2.782-.313c-5.043-1.352-8.036-6.535-6.686-11.578l.147-.491c.242-.745.573-1.44.972-2.078Z"
            />
          </svg>
        </label>
      </fieldset>
    </div>
  );
};

/* =========================================================================
   2. Liquid Gooey Toggle (Apple Liquid Glass Mode)
   Based on user-supplied reference code with #goo filter, feGaussianBlur,
   feColorMatrix merging drop physics, and spring-elastic animation.
   ========================================================================= */

interface LiquidGooeyToggleProps {
  isLiquidGlass: boolean;
  onToggle: () => void;
}

export const LiquidGooeyToggle: React.FC<LiquidGooeyToggleProps> = ({
  isLiquidGlass,
  onToggle,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLiquidGlass}
      onClick={onToggle}
      className={`liquid-toggle-btn group relative inline-flex items-center cursor-pointer select-none transition-all duration-300 ${
        isLiquidGlass ? 'is-active' : ''
      }`}
      title={isLiquidGlass ? 'Выключить Apple Liquid Glass' : 'Включить Apple Liquid Glass'}
    >
      {/* Outer track with glass borders & specular depth */}
      <span className="liquid-toggle-track">
        {/* Gooey filter layer wrapping the morphing fluid bubble */}
        <span className="liquid-toggle-goo-container">
          <span className="liquid-toggle-anchor left" />
          <span className="liquid-toggle-thumb" />
          <span className="liquid-toggle-anchor right" />
        </span>
      </span>

      {/* Internal spark icon badge on thumb */}
      <span className="liquid-toggle-indicator-icon">
        <Sparkles className="w-3.5 h-3.5" />
      </span>
    </button>
  );
};

/* =========================================================================
   3. Glass Distortion Ribbon Wrapper (Refraction Lens Panels)
   Based on user-supplied reference code (.glass-container > .glass-effect)
   Applies perimeter displacement maps to card borders without blocking clicks.
   ========================================================================= */

interface GlassLensContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export const GlassLensContainer: React.FC<GlassLensContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {/* Perimeter optical distortion lens ribbons */}
      <div className="glass-lens-layer pointer-events-none" aria-hidden="true">
        <div className="glass-effect top" />
        <div className="glass-effect bottom" />
        <div className="glass-effect left" />
        <div className="glass-effect right" />
      </div>
    </div>
  );
};
