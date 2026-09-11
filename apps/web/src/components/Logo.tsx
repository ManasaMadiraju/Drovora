interface LogoProps {
  /** 'dark' text for light backgrounds, 'light' text for dark/blue backgrounds. The mark itself stays coral either way. */
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  markOnly?: boolean;
  className?: string;
}

const SIZES: Record<string, { mark: number; text: string; gap: string }> = {
  sm: { mark: 24, text: 'text-lg', gap: 'gap-2' },
  md: { mark: 30, text: 'text-xl', gap: 'gap-2.5' },
  lg: { mark: 42, text: 'text-3xl', gap: 'gap-3' },
};

export default function Logo({ variant = 'dark', size = 'md', markOnly = false, className = '' }: LogoProps) {
  const { mark, text, gap } = SIZES[size];
  const textCls = variant === 'light' ? 'text-white' : 'text-ink-900';

  return (
    <span className={`inline-flex items-center ${gap} ${className}`}>
      <svg width={mark} height={mark} viewBox="0 0 100 100" fill="none" className="flex-shrink-0">
        <circle cx="24" cy="72" r="9" fill="#ff5a36" />
        <path d="M24,72 C50,96 78,90 88,64 C94,48 90,28 72,20" fill="none" stroke="#ff5a36" strokeWidth="10" strokeLinecap="round" />
        <polygon points="56,12 78,7 67,33" fill="#ff5a36" />
      </svg>
      {!markOnly && (
        <span className={`font-display font-extrabold ${text} tracking-tight leading-none ${textCls}`}>
          Drov<span className="text-coral-600">o</span>ra
        </span>
      )}
    </span>
  );
}
