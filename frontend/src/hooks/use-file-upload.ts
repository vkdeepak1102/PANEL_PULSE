import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadStore } from '@/lib/stores/upload.store';
import { useEvaluationStore } from '@/lib/stores/evaluation.store';
import { panelApi } from '@/lib/api/panel.api';
import type { UploadRequest } from '@/types/upload.types';
import toast from 'react-hot-toast';

export function useFileUpload() {
  const { addFile, removeFile, setProgress, setStatus, setMessage, clear, files, setL1Transcript: setUploadL1Transcript } = useUploadStore();
  const { setEvaluation, setLoading, setL1Transcript, setL2RejectionReason } = useEvaluationStore();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  async function readFileAsText(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  async function handleFilesSelected(newFiles: File[]) {
    // Map incoming files to jd/l1/l2 by filename heuristics if possible
    const jdFiles = newFiles.filter((f) => f.name.toLowerCase().includes('jd'));
    const l1Files = newFiles.filter((f) => f.name.toLowerCase().includes('l1'));
    const l2Files = newFiles.filter((f) => f.name.toLowerCase().includes('l2'));

    const toProcess: Array<{ type: 'jd' | 'l1' | 'l2'; file: File }> = [];

    if (jdFiles.length > 0) toProcess.push({ type: 'jd', file: jdFiles[0] });
    if (l1Files.length > 0) toProcess.push({ type: 'l1', file: l1Files[0] });
    if (l2Files.length > 0) toProcess.push({ type: 'l2', file: l2Files[0] });

    // As a fallback, if user selected exactly 3 files without naming, assign by order
    if (toProcess.length === 0 && newFiles.length === 3) {
      toProcess.push({ type: 'jd', file: newFiles[0] });
      toProcess.push({ type: 'l1', file: newFiles[1] });
      toProcess.push({ type: 'l2', file: newFiles[2] });
    }

    if (toProcess.length === 0 && newFiles.length > 0) {
      // If only one file provided, try to infer by content or name; otherwise add first as JD
      toProcess.push({ type: 'jd', file: newFiles[0] });
    }

    setProgress(5);
    setMessage('Reading selected files...');

    for (const item of toProcess) {
      try {
        const content = await readFileAsText(item.file);
        addFile(item.type, {
          name: item.file.name,
          type: item.type,
          content: content,
          size: item.file.size,
        });
        const curr = useUploadStore.getState().uploadProgress || 0;
        setProgress(Math.min(95, curr + 20));
      } catch (err) {
        toast.error(`Failed to read ${item.file.name}`);
      }
    }

    setMessage('Files ready');
    setProgress(100);
  }

  function removeFileByType(type: 'jd' | 'l1' | 'l2') {
    removeFile(type);
  }

  async function submitEvaluation(jobId: string, panelName: string, candidateName: string) {
    if (!files.get('jd') || !files.get('l1') || !files.get('l2')) {
      toast.error('Please select all three files (JD, L1, L2)');
      return;
    }

    if (!jobId.trim() || !panelName.trim() || !candidateName.trim()) {
      toast.error('Please enter Job ID, Panel Name, and Candidate Name');
      return;
    }

    setIsUploading(true);
    setStatus('uploading');
    setMessage('Preparing payload...');
    setProgress(10);

    try {
      const jd = files.get('jd')?.content ?? '';
      const l1 = files.get('l1')?.content ?? '';
      const l2 = files.get('l2')?.content ?? '';

      const request: UploadRequest = {
        jobId: jobId.trim(),
        panelName: panelName.trim(),
        candidateName: candidateName.trim(),
        jd,
        l1Transcript: l1,
        l2RejectionReason: l2,
      };

      setProgress(30);
      setMessage('Sending to evaluation API...');

      setLoading(true);
      const response = await panelApi.scorePanel(request);

      setProgress(90);
      setMessage('Finalizing results...');

      // Store L1 transcript and L2 rejection reason for L2 validation on results page
      setL1Transcript(l1);
      setL2RejectionReason(l2);
      
      setEvaluation(response);
      
      setProgress(100);
      setStatus('success');
      setMessage('Evaluation complete!');

      toast.success('Evaluation completed successfully');

      // Navigate to results page after a short delay
      setTimeout(() => {
        try {
          const id = (response as any).jobId || (response as any).job_id;
          if (id) navigate(`/results/${id}`);
        } catch (e) {
          // ignore navigation errors
        }
        // Reset upload form but keep evaluation data
        setProgress(0);
        setStatus('idle');
        setMessage('');
      }, 500);
    } catch (error) {
      const msg = (error as any)?.message ?? 'Evaluation failed.';
      setStatus('error');
      setMessage(msg.includes('rate limit') ? 'Service temporarily unavailable. Please try again later.' : 'Upload failed. Please try again.');
      setProgress(0);
      setIsUploading(false);
      setLoading(false);
      toast.error(msg.includes('rate limit') ? 'Scoring service rate-limited. Try again shortly.' : 'Evaluation failed.');
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  }

  return {
    handleFilesSelected,
    removeFileByType,
    submitEvaluation,
    isUploading,
    files,
  };
}
