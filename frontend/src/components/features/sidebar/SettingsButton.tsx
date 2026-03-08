import { Settings } from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui.store';

export function SettingsButton() {
  const { openModal } = useUIStore();

  return (
    <button
      onClick={() => openModal('settings')}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.05] transition-all border border-transparent text-text-muted hover:text-text-primary"
      aria-label="Open settings"
    >
      <Settings className="w-5 h-5" />
      <span className="text-sm font-medium">Settings</span>
    </button>
  );
}
