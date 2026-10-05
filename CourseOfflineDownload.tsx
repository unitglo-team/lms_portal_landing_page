import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Trash2, ShieldCheck, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { offlineStorageService, OfflineLessonRecord } from './offlineStorageService';

interface CourseOfflineDownloadProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  videoUrl?: string | null;
  onOfflinePlaybackReady?: (blobUrl: string) => void;
}

export const CourseOfflineDownload: React.FC<CourseOfflineDownloadProps> = ({
  courseId,
  lessonId,
  lessonTitle,
  videoUrl,
  onOfflinePlaybackReady,
}) => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [record, setRecord] = useState<OfflineLessonRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [downloadedBytes, setDownloadedBytes] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const available = await offlineStorageService.isAvailableOffline(courseId, lessonId);
      setIsAvailable(available);
      const rec = await offlineStorageService.getOfflineRecord(courseId, lessonId);
      setRecord(rec);
    } catch (err: any) {
      console.warn('Offline status check error:', err);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [courseId, lessonId]);

  const handleStartDownload = async () => {
    if (!videoUrl) {
      setError('No media stream available for this lesson.');
      return;
    }

    setIsDownloading(true);
    setProgressPct(0);
    setError(null);

    try {
      await offlineStorageService.downloadLessonVideo(
        courseId,
        lessonId,
        lessonTitle,
        videoUrl,
        (pct, received) => {
          setProgressPct(pct);
          setDownloadedBytes(received);
        }
      );
      await checkStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to download offline package.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveDownload = async () => {
    try {
      await offlineStorageService.removeDownload(courseId, lessonId);
      await checkStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to remove offline download.');
    }
  };

  const handlePlayOffline = async () => {
    try {
      const blobUrl = await offlineStorageService.getPlaybackBlobUrl(courseId, lessonId);
      if (blobUrl && onOfflinePlaybackReady) {
        onOfflinePlaybackReady(blobUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load offline media.');
    }
  };

  if (!videoUrl) return null;

  return (
    <div className="p-4 rounded-2xl bg-[var(--panel-bg,#131d33)] border border-[var(--border-color,#1e293b)] space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-teal-400" />
          <span className="text-xs font-bold text-[var(--text-main,#ffffff)]">
            Offline Learning Protection
          </span>
        </div>

        {isAvailable && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            <CheckCircle2 size={11} /> Available Offline
          </span>
        )}
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isDownloading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-[var(--text-muted,#94a3b8)]">
            <span>Encrypting & Caching at Rest (AES-GCM-256)...</span>
            <span className="font-mono font-bold text-teal-400">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-150"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono block text-right">
            {(downloadedBytes / (1024 * 1024)).toFixed(1)} MB downloaded
          </span>
        </div>
      )}

      {isAvailable && record ? (
        <div className="space-y-2">
          <div className="p-2.5 rounded-xl bg-[var(--bg-color,#090d16)]/60 border border-[var(--border-color,#1e293b)] text-[11px] space-y-1 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Downloaded Size:</span>
              <span className="text-slate-200">{(record.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Security Status:</span>
              <span className="text-emerald-400 font-sans font-semibold">Encrypted at Rest</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Last Entitlement Check:</span>
              <span className="text-slate-200">{new Date(record.lastAuthorizedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {onOfflinePlaybackReady && (
              <button
                onClick={handlePlayOffline}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
              >
                Play Decrypted Video
              </button>
            )}
            <button
              onClick={handleRemoveDownload}
              className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Remove Download</span>
            </button>
          </div>
        </div>
      ) : (
        !isDownloading && (
          <button
            onClick={handleStartDownload}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Download for Offline (~18.4 MB)</span>
          </button>
        )
      )}
    </div>
  );
};
