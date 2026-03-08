import { useUIStore } from '@/lib/stores/ui.store';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SettingsModal() {
  const { isModalOpen, modalType, closeModal } = useUIStore();
  const isOpen = isModalOpen && modalType === 'settings';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-bg-card border border-white/[0.07] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/[0.07]">
                <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
                <button
                  onClick={closeModal}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Account Section */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Account</h3>
                  <p className="text-xs text-text-muted">User account settings coming soon</p>
                </div>

                {/* Preferences Section */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Preferences</h3>
                  <p className="text-xs text-text-muted">Preference options coming soon</p>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.07]" />

                {/* Sign Out Button */}
                <button className="w-full px-4 py-2 rounded-lg bg-score-poor/10 text-score-poor hover:bg-score-poor/20 transition-colors text-sm font-medium">
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
