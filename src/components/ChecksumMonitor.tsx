import React, { useState } from 'react';
import { ChecksumBlock, Language } from '../types/winols';
import { ShieldCheck, ShieldAlert, Cpu, Lock, CheckCircle2, AlertTriangle, Play, HelpCircle } from 'lucide-react';

interface ChecksumMonitorProps {
  blocks: ChecksumBlock[];
  isModified: boolean;
  totalDelta: number;
  onRecalculateChecksums: () => void;
  lang: Language;
}

export const ChecksumMonitor: React.FC<ChecksumMonitorProps> = ({
  blocks,
  isModified,
  totalDelta,
  onRecalculateChecksums,
  lang,
}) => {
  const [testFlashResult, setTestFlashResult] = useState<'idle' | 'success' | 'bricked'>('idle');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // If map is modified and user hasn't recalculated, block 0 is invalid
  const hasPendingChecksum = isModified && totalDelta !== 0;

  const handleTestFlash = () => {
    if (hasPendingChecksum) {
      setTestFlashResult('bricked');
    } else {
      setTestFlashResult('success');
    }
    setTimeout(() => {
      // Auto clear after 4s
      setTimeout(() => setTestFlashResult('idle'), 4000);
    }, 100);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          {hasPendingChecksum ? (
            <ShieldAlert className="w-5 h-5 text-amber-400 animate-bounce" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <div>
            <span className="font-mono text-sm font-bold text-slate-100">
              {lang === 'mizo' ? 'WinOLS Checksum (CS) Subsystem' : 'WinOLS Checksum (CS) Cryptographic Engine'}
            </span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              OLS222_EDC17.DLL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormulaModal(!showFormulaModal)}
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-cyan-950/60 border border-cyan-800"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {lang === 'mizo' ? 'CS Math & Algorithm' : 'Algorithm Architecture'}
          </button>

          <button
            onClick={onRecalculateChecksums}
            disabled={!hasPendingChecksum}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              hasPendingChecksum
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {lang === 'mizo' ? 'Checksum Chhut Nawn Rawh' : 'Auto-Recalculate CS'}
          </button>
        </div>
      </div>

      {/* Checksum Blocks Table */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {blocks.map((block) => {
          const isInvalid = block.id === 'cs_calrom' && hasPendingChecksum;
          const displayStatus = isInvalid ? 'invalid' : block.status;

          return (
            <div
              key={block.id}
              className={`p-3.5 rounded-xl border transition ${
                isInvalid
                  ? 'bg-amber-950/30 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-200">{block.name}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    displayStatus === 'valid'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  }`}
                >
                  {displayStatus === 'valid' ? (
                    <>
                      <CheckCircle2 className="w-2.5 h-2.5" /> OK
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-2.5 h-2.5" /> CS MISMATCH
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span className="text-slate-300">
                    {block.startAddressHex} - {block.endAddressHex}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CS Storage:</span>
                  <span className="text-cyan-400">{block.csAddressHex}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="text-purple-300">{block.method}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span>Word Value:</span>
                  <span
                    className={`font-bold ${
                      isInvalid ? 'text-rose-400 line-through' : 'text-emerald-400'
                    }`}
                  >
                    0x{block.storedValue.toString(16).toUpperCase()}
                  </span>
                </div>
                {isInvalid && (
                  <div className="flex justify-between text-amber-400">
                    <span>New Target CS:</span>
                    <span className="font-bold">
                      0x{((block.storedValue - totalDelta) & 0xffff).toString(16).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator Test Flash Button */}
      <div className="p-4 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">
            {lang === 'mizo'
              ? 'ECU Bootloader Flash Test:'
              : 'ECU Bootloader Verification Benchmark:'}
          </span>
          <span className="text-slate-500 text-[11px]">
            {lang === 'mizo'
              ? '(Checksum dik loh chuan ECU a thi/brick nghal ang)'
              : '(Flashing with invalid CS causes hardware watchdog brick)'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestFlash}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {lang === 'mizo' ? 'OBD Flash Fiah Rawh (Test Flash)' : 'Simulate ECU Flash'}
          </button>
        </div>
      </div>

      {/* Test Flash Result Notification */}
      {testFlashResult !== 'idle' && (
        <div
          className={`p-3 text-xs font-mono border-t flex items-center justify-between ${
            testFlashResult === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/90 border-rose-700 text-rose-200 animate-pulse'
          }`}
        >
          <div className="flex items-center gap-2">
            {testFlashResult === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>
              {testFlashResult === 'success'
                ? lang === 'mizo'
                  ? 'ECU BOOT SUCCESSFUL! Checksum zawng zawng a dik thlap a, engine a nung tha e.'
                  : 'ECU BOOT OK! Checksum validated by Infineon Tricore BootROM. Engine runs smoothly.'
                : lang === 'mizo'
                  ? 'ECU BRICKED / NO START! Checksum a dik loh avangin ECU Watchdog-in injection a off a, motor a nung thei lo!'
                  : 'ECU BRICKED / ENGINE NO START! Internal ROM checksum mismatch halted processor watchdog!'}
            </span>
          </div>
          {testFlashResult === 'bricked' && (
            <button
              onClick={onRecalculateChecksums}
              className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded text-xs hover:bg-amber-400"
            >
              {lang === 'mizo' ? 'Fix Checksum Now' : 'Auto Repair CS'}
            </button>
          )}
        </div>
      )}

      {/* Formula Modal / Explainer Accordion */}
      {showFormulaModal && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs font-mono space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Lock className="w-4 h-4" />
            <span>
              {lang === 'mizo'
                ? 'WinOLS Checksum Engine Hnathawh Dan (Architecture)'
                : 'WinOLS Checksum Plugin Subsystem Architecture'}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {lang === 'mizo'
              ? 'WinOLS chhungah hian Checksum calculation hi core software-ah a in-build vek lo va, EVC OLS221, OLS222 etc. ang DLL module hmanga modular-a dah a ni. Map-a byte pakhat kan tihpunin (+delta), chu block tawpa Complementary Word atang chuan chiah khan a paih (-delta) nghal thin. Chuvangin Memory block pum pui 16-bit sum chu 0xFFFF a nih ngai reng avangin ECU Bootloader internal check a pass ziah thin a ni.'
              : 'In WinOLS architecture, checksum recalculation is delegated to external modular DLL plugins (OLS_CS_*.DLL). When calibration bytes are modified, the plugin either re-runs a polynomial CRC-32 division or calculates an inverse 16-bit complementary balance word ($Word_{cs} = 0xFFFF - \\sum Bytes$). This ensures the overall hardware parity check remains zero, preventing watchdog intervention.'}
          </p>
        </div>
      )}
    </div>
  );
};
