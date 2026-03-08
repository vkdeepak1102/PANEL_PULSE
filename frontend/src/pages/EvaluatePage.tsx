import { AppShell } from '@/components/layout/AppShell';
import { SettingsModal } from '@/components/features/modals/SettingsModal';
import { UploadForm } from '@/components/features/upload/UploadForm';
import { UploadStatus } from '@/components/features/upload/UploadStatus';

export default function EvaluatePage() {
  return (
    <AppShell>
      <SettingsModal />
      <div className="flex-1 overflow-y-auto bg-bg-base p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Evaluate Panel</h1>
            <p className="text-text-muted">Upload job details and interview data to get a panel efficiency score</p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <UploadForm />
            <UploadStatus />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
