import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const TONES = {
  blue: { card: 'from-blue-50 to-indigo-50', icon: 'bg-blue-500' },
  purple: { card: 'from-purple-50 to-violet-50', icon: 'bg-purple-500' },
  red: { card: 'from-red-50 to-rose-50', icon: 'bg-red-500' },
} as const;

type Tone = keyof typeof TONES;

interface AboutCardProps {
  icon?: LucideIcon;
  title: string;
  tone?: Tone;
  defaultOpen?: boolean;
  /**
   * When set (e.g. "project_card"), the open/closed state is remembered per user
   * in localStorage under `<storageKey>:<userId>`, so a card the user hid stays hidden.
   */
  storageKey?: string;
  children: ReactNode;
}

const readStoredOpen = (key: string | null, fallback: boolean): boolean => {
  if (!key) return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : stored === 'open';
  } catch {
    return fallback;
  }
};

const AboutCard = ({
  icon,
  title,
  tone = 'blue',
  defaultOpen = true,
  storageKey,
  children,
}: AboutCardProps) => {
  const { user } = useAuth();
  const persistKey = storageKey && user?.id ? `${storageKey}:${user.id}` : null;
  const [open, setOpen] = useState(() => readStoredOpen(persistKey, defaultOpen));

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!persistKey) return;
    try {
      window.localStorage.setItem(persistKey, next ? 'open' : 'closed');
    } catch {
      // Storage unavailable (private mode / quota): the card still toggles, just not remembered.
    }
  };
  const Icon = icon;
  const t = TONES[tone] ?? TONES.blue;

  return (
    <Card className={`border-none shadow-lg bg-gradient-to-br ${t.card}`}>
      <CardContent className="pt-6">
        <div className={Icon ? 'flex items-start gap-4' : ''}>
          {Icon && (
            <div
              className={`w-10 h-10 ${t.icon} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div className={Icon ? 'flex-1 min-w-0' : ''}>
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              title={open ? 'Tutup' : 'Buka'}
              className="w-full flex items-center justify-between gap-2 text-left"
            >
              <h3
                className={`font-semibold text-slate-900 ${open ? 'mb-2' : ''}`}
              >
                {title}
              </h3>
              {open ? (
                <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
              )}
            </button>
            {open && children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutCard;