import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions { title: string; description?: string; confirmLabel?: string; danger?: boolean; }
interface ConfirmContextType { confirm: (opts: ConfirmOptions) => Promise<boolean>; }

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => setState({ ...opts, resolve }));
  }, []);

  const close = (result: boolean) => { state?.resolve(result); setState(null); };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => close(false)} />
          <div className="relative bg-white rounded-3xl shadow-lift p-6 w-full max-w-sm animate-scale-in">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${state.danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
              <AlertTriangle size={22} strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-ink-900 mb-1.5">{state.title}</h3>
            {state.description && <p className="text-sm text-ink-500 leading-relaxed">{state.description}</p>}
            <div className="flex gap-2.5 mt-6">
              <button className="btn-secondary flex-1" onClick={() => close(false)}>Never mind</button>
              <button className={state.danger ? 'btn-danger flex-1' : 'btn-primary flex-1'} onClick={() => close(true)}>{state.confirmLabel || 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
