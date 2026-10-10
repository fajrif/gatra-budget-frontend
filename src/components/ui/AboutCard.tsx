import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  children: ReactNode;
}

const AboutCard = ({
  icon,
  title,
  tone = 'blue',
  defaultOpen = true,
  children,
}: AboutCardProps) => {
  const [open, setOpen] = useState(defaultOpen);
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
              onClick={() => setOpen((v) => !v)}
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