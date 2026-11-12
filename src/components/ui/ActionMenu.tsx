import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  /** Red text, for destructive entries. */
  danger?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  /** Accessible name and tooltip of the trigger button. */
  label?: string;
  /** Icon of the trigger button; defaults to the kebab (three dots). */
  icon?: ReactNode;
}

const MENU_WIDTH = 176;

/** Kebab button that opens a small menu of actions (outside the grid; the grid's own is `ActionMenuCellRenderer`). */
const ActionMenu = ({ items, label = 'Aksi', icon }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && !menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    // The menu is positioned with `fixed`, so it must not outlive a scroll or resize.
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [isOpen]);

  const toggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: Math.max(8, rect.right - MENU_WIDTH) });
    }
    setIsOpen((open) => !open);
  };

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        className="h-10 px-3"
        title={label}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        {icon ?? <MoreVertical className="w-4 h-4" />}
      </Button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[9999] bg-white rounded-md shadow-lg border border-slate-200 py-1"
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ActionMenu;
