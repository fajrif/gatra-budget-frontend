import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8
      });
    }
  }, [show]);

  const tooltip = show && (
    <div
      className="fixed bg-gray-800 text-white text-xs rounded py-1 px-3 shadow-lg whitespace-nowrap pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-50%)',
        zIndex: 99999
      }}
    >
      {content}
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className="relative group flex items-center justify-center w-full"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
};

export { Tooltip };

export const SidebarDropdown = ({ trigger, children, title }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShow(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 100);
  };

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8
      });
    }
  }, [show]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const dropdown = show && (
    <div
      className="fixed bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-[99999] min-w-[200px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-50%)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-100">
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className="relative group flex items-center justify-center w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {trigger}
      </div>
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </>
  );
};
