import React from 'react';
import { ViewMode, Language } from '../types/winols';
import {
  FolderOpen,
  Save,
  Rotate3D,
  Activity,
  Binary,
  Table as TableIcon,
  LayoutGrid,
  Plus,
  Minus,
  Percent,
  Search,
  Sparkles,
  ArrowLeftRight,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

interface WinolsToolbarProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onOpenFileClick: () => void;
  onExportModifiedBin: () => void;
  onTriggerFindMaps: () => void;
  onOpenStage1Wizard: () => void;
  onOpenAutoTuningModal: () => void;
  onBatchModify: (multiplier: number) => void;
  onIncrementCell: (amount: number) => void;
  onToggleEndian: () => void;
  endianness: 'HiLo' | 'LoHi';
  isModified: boolean;
  hasPendingChecksum: boolean;
  onRecalculateChecksums: () => void;
  onResetActiveMap: () => void;
  activeVersion: 'ori' | 'mod' | 'delta';
  onSetActiveVersion: (ver: 'ori' | 'mod' | 'delta') => void;
  lang: Language;
}

export const WinolsToolbar: React.FC<WinolsToolbarProps> = ({
  viewMode,
  onSetViewMode,
  onOpenFileClick,
  onExportModifiedBin,
  onTriggerFindMaps,
  onOpenStage1Wizard,
  onOpenAutoTuningModal,
  onBatchModify,
  onIncrementCell,
  onToggleEndian,
  endianness,
  isModified,
  hasPendingChecksum,
  onRecalculateChecksums,
  onResetActiveMap,
  activeVersion,
  onSetActiveVersion,
  lang,
}) => {
  return (
    <div className="bg-[#0e1424] border-b border-slate-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono select-none">
      {/* Group 1: File Actions */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onOpenFileClick}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title={lang === 'mizo' ? 'ECU File (.bin) thlang rawh' : 'Open Binary ROM (Ctrl+O)'}
        >
          <FolderOpen className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={onExportModifiedBin}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title={lang === 'mizo' ? 'Modified Binary (.bin) download rawh' : 'Export Tuned File (Ctrl+S)'}
        >
          <Save className="w-4 h-4 text-emerald-400" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Group 2: View Switchers (Iconic WinOLS 2, 3, H, T) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
          <button
            onClick={() => onSetViewMode('3d')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              viewMode === '3d' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="3D Surface View (Hotkey: 3)"
          >
            <Rotate3D className="w-3.5 h-3.5" />
            <span className="text-[10px]">3D</span>
          </button>

          <button
            onClick={() => onSetViewMode('2d')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              viewMode === '2d' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="2D Oscilloscope Continuous Waveform (Hotkey: 2)"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px]">2D</span>
          </button>

          <button
            onClick={() => onSetViewMode('hex')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              viewMode === 'hex' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Hexadecimal View (Hotkey: H)"
          >
            <Binary className="w-3.5 h-3.5" />
            <span className="text-[10px]">Hex</span>
          </button>

          <button
            onClick={() => onSetViewMode('text')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              viewMode === 'text' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Text Spreadsheet Table (Hotkey: T)"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="text-[10px]">Table</span>
          </button>

          <button
            onClick={() => onSetViewMode('quad')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              viewMode === 'quad' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Quad Multi-View Split"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[10px]">All</span>
          </button>
        </div>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Group 3: Quick Calibration Nudge (+/-, %) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onIncrementCell(20)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded text-[11px] flex items-center gap-0.5"
            title="Add value (+20)"
          >
            <Plus className="w-3 h-3 text-cyan-400" />
            <span>20</span>
          </button>
          <button
            onClick={() => onIncrementCell(-20)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded text-[11px] flex items-center gap-0.5"
            title="Minus value (-20)"
          >
            <Minus className="w-3 h-3 text-cyan-400" />
            <span>20</span>
          </button>
          <button
            onClick={() => onBatchModify(1.05)}
            className="px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 rounded text-[11px] font-semibold"
            title="Increase map by 5%"
          >
            +5%
          </button>
          <button
            onClick={() => onBatchModify(1.1)}
            className="px-2 py-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 rounded text-[11px] font-semibold"
            title="Increase map by 10%"
          >
            +10%
          </button>
          <button
            onClick={() => onBatchModify(0.95)}
            className="px-2 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded text-[11px] font-semibold"
            title="Decrease map by 5%"
          >
            -5%
          </button>
          <button
            onClick={onResetActiveMap}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title={lang === 'mizo' ? 'Map hi original-ah kir leh rawh' : 'Reset active map to original values'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Group 4: Endianness Toggle (M) */}
        <button
          onClick={onToggleEndian}
          className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[11px]"
          title="Toggle Endianness (Motorola HiLo vs Intel LoHi) (Hotkey: M)"
        >
          <ArrowLeftRight className="w-3 h-3 text-purple-400" />
          <span>{endianness}</span>
        </button>

        {/* Group 5: Map Finder (F) */}
        <button
          onClick={onTriggerFindMaps}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 rounded text-[11px]"
          title="Scan binary for lookup tables (Hotkey: F)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'mizo' ? 'Find Maps' : 'Find Maps'}</span>
        </button>

        {/* Group 6: Stage 1 Remap Wizard & Auto-Tune Studio */}
        <button
          onClick={onOpenAutoTuningModal}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-600/90 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black rounded text-[11px] font-bold shadow-md shadow-amber-600/30"
          title="Auto-Tune Remap Studio for India 2W, 3W, & Passenger Cars"
        >
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>{lang === 'mizo' ? 'Auto-Tune Studio' : 'Auto-Tune Studio'}</span>
        </button>

        <button
          onClick={onOpenStage1Wizard}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/90 border border-amber-600/80 text-amber-300 rounded text-[11px] font-semibold shadow"
          title="Auto Stage 1 Remap Preset"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'mizo' ? 'Stage 1 Wizard' : 'Stage 1'}</span>
        </button>
      </div>

      {/* Right Side: Version Buffer Toggle (Ori vs Mod vs Delta) & Checksum LED */}
      <div className="flex items-center space-x-2">
        {/* Version Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-[10px]">
          <button
            onClick={() => onSetActiveVersion('ori')}
            className={`px-2 py-0.5 rounded transition ${
              activeVersion === 'ori' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => onSetActiveVersion('mod')}
            className={`px-2 py-0.5 rounded transition ${
              activeVersion === 'mod' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Mod.1
          </button>
          <button
            onClick={() => onSetActiveVersion('delta')}
            className={`px-2 py-0.5 rounded transition ${
              activeVersion === 'delta' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Delta Diff
          </button>
        </div>

        {/* Checksum Status Icon */}
        <button
          onClick={onRecalculateChecksums}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold border transition ${
            hasPendingChecksum
              ? 'bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
          }`}
          title={
            hasPendingChecksum
              ? 'Checksum Mismatch! Click to recalculate.'
              : 'All Checksums Valid (3/3 OK)'
          }
        >
          {hasPendingChecksum ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>CS: PENDING</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CS: OK</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
