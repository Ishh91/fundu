import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  Smartphone,
  Wrench,
  Package,
  X,
  ExternalLink,
  MapPin,
  Flame,
  Building2,
} from 'lucide-react';
import { soundNotifier } from '../../lib/soundAlert';
import { formatINR } from '../../lib/db';

export type LiveNotification = {
  id: string;
  type: 'sell' | 'repair' | 'order' | 'vendor_quote';
  title: string;
  subtitle: string;
  locality?: string;
  amount?: number | null;
  timestamp: Date;
  tabTarget: 'sells' | 'repairs' | 'orders' | 'wholesalers';
};

type Props = {
  onNavigateTab: (tab: 'sells' | 'repairs' | 'orders' | 'wholesalers', itemId?: string) => void;
  activeNotifications: LiveNotification[];
  onDismiss: (id: string) => void;
  onSimulateTestAlert: () => void;
};

export default function AdminLiveNotifier({
  onNavigateTab,
  activeNotifications,
  onDismiss,
  onSimulateTestAlert,
}: Props) {
  const [muted, setMuted] = useState(soundNotifier.isMuted);
  const [permission, setPermission] = useState<string>(() => soundNotifier.getPermissionStatus());

  useEffect(() => {
    // Check permission on mount
    setPermission(soundNotifier.getPermissionStatus());
  }, []);

  const toggleSound = () => {
    const isNowMuted = soundNotifier.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      soundNotifier.playChime('test');
    }
  };

  const handleToggleDesktopPermission = async () => {
    const res = await soundNotifier.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      soundNotifier.showSystemNotification('🔔 System Notifications Active!', {
        body: 'You will now receive sound & desktop alerts for all new Orders, Sell Queries, and Repair Bookings.',
      });
    } else if (res === 'denied') {
      alert('Desktop notifications were blocked in your browser. Please enable notifications for thefundu.com in your browser site settings.');
    }
  };

  return (
    <>
      {/* Top Header Sound & Live Alert Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleDesktopPermission}
          title={
            permission === 'granted'
              ? 'Desktop System Notifications are Active'
              : 'Click to enable native Windows / OS System Notifications'
          }
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
            permission === 'granted'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 animate-pulse'
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>{permission === 'granted' ? 'System Alerts ON' : 'Enable System Alerts'}</span>
        </button>

        <button
          type="button"
          onClick={toggleSound}
          title={muted ? 'Unmute Sound Chimes' : 'Mute Sound Chimes'}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
            muted
              ? 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-600" />}
          <span>{muted ? 'Sound Muted' : 'Sound ON'}</span>
        </button>

        <button
          type="button"
          onClick={onSimulateTestAlert}
          title="Trigger a test order audio chime & desktop alert popup"
          className="hidden sm:flex items-center gap-1 rounded-xl bg-[#F0F0F5] border border-[#C0C8D8] px-2.5 py-1.5 text-xs font-semibold text-[#344257] hover:bg-[#E2E8F0] transition active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#47576E]" />
          <span>Test Alert</span>
        </button>
      </div>

      {/* Floating Active Notifications Container — Rendered in Portal so it NEVER clips or hides under header/backdrop-filter */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed top-20 right-4 sm:right-6 z-[99999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none">
            {activeNotifications.map((notif) => (
              <NotificationToastItem
                key={notif.id}
                notif={notif}
                onDismiss={onDismiss}
                onNavigateTab={onNavigateTab}
              />
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

function NotificationToastItem({
  notif,
  onDismiss,
  onNavigateTab,
}: {
  notif: LiveNotification;
  onDismiss: (id: string) => void;
  onNavigateTab: (tab: 'sells' | 'repairs' | 'orders', itemId?: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const durationMs = 16000; // 16 seconds auto-dismiss
  const intervalMs = 100;

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - (intervalMs / durationMs) * 100;
        if (next <= 0) {
          clearInterval(timer);
          onDismiss(notif.id);
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isHovered, notif.id, onDismiss]);

  const isSell = notif.type === 'sell';
  const isRepair = notif.type === 'repair';
  const isVendorQuote = notif.type === 'vendor_quote';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto overflow-hidden rounded-2xl p-4 text-white shadow-2xl border backdrop-blur-2xl ring-1 ring-white/20 transition-all duration-300 transform animate-in fade-in slide-in-from-top-3 ${
        isVendorQuote
          ? 'bg-gradient-to-r from-[#7c2d12] via-[#c2410c] to-[#ea580c] border-amber-300/50 shadow-orange-950/50 ring-amber-400/40'
          : isSell
          ? 'bg-gradient-to-r from-[#202938] via-[#344257] to-[#47576E] border-[#6A859F]/60 shadow-slate-950/50'
          : isRepair
          ? 'bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#1d4ed8] border-blue-300/50 shadow-blue-950/50'
          : 'bg-gradient-to-r from-[#581c87] via-[#7c3aed] to-[#6d28d9] border-purple-300/50 shadow-purple-950/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="relative mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner">
            {isVendorQuote ? (
              <Building2 className="h-5 w-5 text-amber-200" />
            ) : isSell ? (
              <Smartphone className="h-5 w-5" />
            ) : isRepair ? (
              <Wrench className="h-5 w-5" />
            ) : (
              <Package className="h-5 w-5" />
            )}
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white ${
                isVendorQuote ? 'bg-amber-900/60 text-amber-200 border border-amber-400/40' : 'bg-white/25'
              }`}>
                {isVendorQuote ? '💼 Vendor Quoted Price' : isSell ? '⚡ New Sell Lead' : isRepair ? '🛠️ Doorstep Repair' : '📦 New Order'}
              </span>
              <span className="text-[10px] text-white/80">Just now</span>
              {isHovered && (
                <span className="text-[9px] bg-black/30 px-1.5 py-0.5 rounded text-white/70">Paused</span>
              )}
            </div>

            <h5 className="font-display font-black text-sm text-white mt-1 truncate">
              {notif.title}
            </h5>

            <p className="text-xs text-white/90 mt-0.5 line-clamp-2">
              {notif.subtitle}
            </p>

            <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-white/90 flex-wrap">
              {notif.locality && (
                <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-md border border-white/10 max-w-[200px] truncate">
                  <MapPin className="h-3 w-3 text-emerald-300 shrink-0" />
                  <span className="truncate">{notif.locality}</span>
                </span>
              )}
              {notif.amount && (
                <span className="bg-emerald-500/30 border border-emerald-400/40 px-2 py-0.5 rounded-md text-emerald-200 font-mono font-black">
                  {formatINR(notif.amount)}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(notif.id)}
          title="Dismiss Alert"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/30 text-white transition active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between gap-2">
        <span className="text-[10px] text-white/75 truncate">
          {isVendorQuote ? 'Requires Admin Review & Approval' : 'Auto-assigned to Service Agent'}
        </span>
        <button
          type="button"
          onClick={() => {
            onNavigateTab(notif.tabTarget, notif.id);
            onDismiss(notif.id);
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-black shadow-md transition active:scale-95 shrink-0 ${
            isVendorQuote
              ? 'bg-amber-300 text-amber-950 hover:bg-amber-200 font-extrabold'
              : 'bg-white text-gray-900 hover:bg-gray-100'
          }`}
        >
          <span>{isVendorQuote ? 'Verify Quote' : 'Open Lead'}</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Auto-Dismiss Progress Bar */}
      <div className="mt-2.5 h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400/80 transition-all duration-100 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
