import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { soundNotifier } from '../../lib/soundAlert';
import { formatINR } from '../../lib/db';

export type LiveNotification = {
  id: string;
  type: 'sell' | 'repair' | 'order';
  title: string;
  subtitle: string;
  locality?: string;
  amount?: number | null;
  timestamp: Date;
  tabTarget: 'sells' | 'repairs' | 'orders';
};

type Props = {
  onNavigateTab: (tab: 'sells' | 'repairs' | 'orders', itemId?: string) => void;
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

  const toggleSound = () => {
    const isNowMuted = soundNotifier.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      soundNotifier.playChime('test');
    }
  };

  return (
    <>
      {/* Top Header Sound & Live Alert Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSound}
          title={muted ? 'Unmute Sound Chimes' : 'Mute Sound Chimes'}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
            muted
              ? 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 animate-pulse'
          }`}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-600" />}
          <span>{muted ? 'Sound Muted' : 'Sound Active'}</span>
        </button>

        <button
          type="button"
          onClick={onSimulateTestAlert}
          title="Trigger a test order audio chime & alert popup"
          className="hidden sm:flex items-center gap-1 rounded-xl bg-teal-50 border border-teal-200 px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-teal-600" />
          <span>Test Alert</span>
        </button>
      </div>

      {/* Floating Active Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {activeNotifications.map((notif) => {
          const isSell = notif.type === 'sell';
          const isRepair = notif.type === 'repair';

          return (
            <div
              key={notif.id}
              className={`pointer-events-auto rounded-2xl p-4 text-white shadow-2xl border backdrop-blur-xl animate-slide-up transition-all ${
                isSell
                  ? 'bg-gradient-to-r from-[#0d9488] to-[#047857] border-teal-300/40 shadow-teal-900/30'
                  : isRepair
                  ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] border-blue-300/40 shadow-blue-900/30'
                  : 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-purple-300/40 shadow-purple-900/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner">
                    {isSell ? (
                      <Smartphone className="h-5 w-5" />
                    ) : isRepair ? (
                      <Wrench className="h-5 w-5" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-white/25 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                        {isSell ? '⚡ New Sell Lead' : isRepair ? '🛠️ Doorstep Repair' : '📦 New Order'}
                      </span>
                      <span className="text-[10px] text-white/80">Just now</span>
                    </div>

                    <h5 className="font-display font-black text-sm text-white mt-1">
                      {notif.title}
                    </h5>

                    <p className="text-xs text-white/90 mt-0.5">
                      {notif.subtitle}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-white/90">
                      {notif.locality && (
                        <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md">
                          <MapPin className="h-3 w-3 text-emerald-300" />
                          {notif.locality}
                        </span>
                      )}
                      {notif.amount && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-md text-emerald-200 font-mono">
                          {formatINR(notif.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(notif.id)}
                  className="grid h-6 w-6 place-items-center rounded-full bg-white/10 hover:bg-white/30 text-white transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between">
                <span className="text-[10px] text-white/70">
                  Auto-assigned to Lucknow Agent
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab(notif.tabTarget, notif.id);
                    onDismiss(notif.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white text-gray-900 px-3 py-1 text-xs font-black shadow hover:bg-gray-100 transition active:scale-95"
                >
                  <span>Open Lead</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
