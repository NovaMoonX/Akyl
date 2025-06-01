import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

interface TooltipProps {
  title: ReactNode;
  children: ReactNode;
  position?: 'center' | 'top' | 'left' | 'right' | 'bottom';
  disabled?: boolean;
  display?: 'inline' | 'block' | 'inline-block';
}

const getPositionStyles = (
  position: 'center' | 'top' | 'left' | 'right' | 'bottom' = 'top',
) => {
  switch (position) {
    case 'center':
      return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };
    case 'top':
      return {
        left: '50%',
        bottom: '100%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
      };
    case 'bottom':
      return {
        left: '50%',
        top: '100%',
        transform: 'translateX(-50%)',
        marginTop: '8px',
      };
    case 'left':
      return {
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginRight: '8px',
      };
    case 'right':
      return {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: '8px',
      };
    default:
      return {};
  }
};

export default function Tooltip({
  title,
  children,
  position = 'top',
  disabled = false,
  display = 'block',
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = window.setTimeout(() => setVisible(true), 100);
  };
  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <span
      style={{ position: 'relative', display }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={0}
    >
      {children}
      {visible && !disabled && (
        <span
          className='bg-surface-light dark:bg-surface-dark pointer-events-none absolute z-[1000] max-w-80 min-w-60 rounded px-3 py-1.5 text-sm shadow-lg'
          style={{
            ...getPositionStyles(position),
          }}
          role='tooltip'
        >
          {title}
        </span>
      )}
    </span>
  );
}
