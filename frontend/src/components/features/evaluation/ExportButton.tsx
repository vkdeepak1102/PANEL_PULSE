import React from 'react';
import { Download } from 'lucide-react';
import { useEvaluationStore } from '@/lib/stores/evaluation.store';

interface Props {
  jobId: string;
  evaluationId?: string | undefined;
}

export function ExportButton({ jobId, evaluationId }: Props) {
  const { panelScore, dimensions, evidence } = useEvaluationStore();

  function downloadJSON() {
    const payload = { jobId, panelScore, dimensions, evidence };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = evaluationId || jobId || 'evaluation';
    a.download = `${name}-panel.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPDF() {
    // Lightweight export: render minimal HTML and open print dialog.
    const html = `
      <html>
        <head><title>Evaluation ${jobId}</title></head>
        <body>
          <h1>Evaluation ${jobId}</h1>
          <pre>${JSON.stringify({ panelScore, dimensions }, null, 2)}</pre>
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={downloadJSON}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded hover:bg-white/[0.05] text-sm"
      >
        <Download className="w-4 h-4" />
        Export JSON
      </button>

      <button
        type="button"
        onClick={downloadPDF}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded hover:bg-white/[0.05] text-sm"
      >
        <Download className="w-4 h-4" />
        Export PDF
      </button>
    </div>
  );
}
