import React, { useState } from 'react';
import { Language } from '../types/winols';
import { Sparkles, X, Zap, ShieldAlert, Check, Gauge, Wind, Fuel } from 'lucide-react';

interface Stage1RemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStage1: (options: {
    boostIncreaseMbar: number;
    torqueIncreasePercent: number;
    railIncreaseBar: number;
    disableEgr: boolean;
  }) => void;
  lang: Language;
}

export const Stage1RemapModal: React.FC<Stage1RemapModalProps> = ({
  isOpen,
  onClose,
  onApplyStage1,
  lang,
}) => {
  const [torquePercent, setTorquePercent] = useState<number>(15);
  const [boostMbar, setBoostMbar] = useState<number>(120);
  const [railBar, setRailBar] = useState<number>(50);
  const [disableEgr, setDisableEgr] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyStage1({
      torqueIncreasePercent: torquePercent,
      boostIncreaseMbar: boostMbar,
      railIncreaseBar: railBar,
      disableEgr,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#0c1220] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="p-4 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm text-white">
              {lang === 'mizo' ? 'WinOLS Stage 1 Remap Wizard' : 'WinOLS Stage 1 Calibration Wizard'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs text-slate-300">
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {lang === 'mizo'
              ? 'He wizard hian ECU calibration maps pawimawh (Torque Limiter, Turbo Boost, Rail Pressure, Drivers Wish) te a rualin a thlak danglam ang a, Stage 1 tuning dik tak a pe nghal ang.'
              : 'Applies parametric multi-map calibrations across Torque Request, Boost Target, and Common Rail Pressure to achieve reliable Stage 1 performance gains.'}
          </p>

          {/* Torque Limiter Slider */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 font-bold text-purple-400">
                <Gauge className="w-3.5 h-3.5" />
                {lang === 'mizo' ? 'Torque Limiter Pun Zat:' : 'Engine Torque Limit Increase:'}
              </span>
              <span className="text-white font-bold text-sm">+{torquePercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              step={1}
              value={torquePercent}
              onChange={(e) => setTorquePercent(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>+5% (Eco)</span>
              <span>+15% (Safe Daily)</span>
              <span>+25% (Aggressive)</span>
            </div>
          </div>

          {/* Turbo Boost Slider */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                <Wind className="w-3.5 h-3.5" />
                {lang === 'mizo' ? 'Turbo Target Boost Punna:' : 'Target Boost Pressure Nudge:'}
              </span>
              <span className="text-white font-bold text-sm">+{boostMbar} mbar</span>
            </div>
            <input
              type="range"
              min={50}
              max={250}
              step={10}
              value={boostMbar}
              onChange={(e) => setBoostMbar(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>+50 mbar</span>
              <span>+120 mbar (OEM Limit)</span>
              <span>+250 mbar</span>
            </div>
          </div>

          {/* Common Rail Pressure Slider */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Fuel className="w-3.5 h-3.5" />
                {lang === 'mizo' ? 'Common Rail Fuel Pressure:' : 'Common Rail Pressure Delta:'}
              </span>
              <span className="text-white font-bold text-sm">+{railBar} bar</span>
            </div>
            <input
              type="range"
              min={20}
              max={120}
              step={5}
              value={railBar}
              onChange={(e) => setRailBar(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>+20 bar</span>
              <span>+50 bar</span>
              <span>+120 bar</span>
            </div>
          </div>

          {/* EGR Delete Checkbox */}
          <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer">
            <div>
              <div className="font-bold text-emerald-400">
                {lang === 'mizo' ? 'EGR Valve Disable (Zero Hysteresis)' : 'EGR Valve Deactivation'}
              </div>
              <div className="text-[10px] text-slate-500">
                {lang === 'mizo' ? 'Airflow sensor soot khawlna ti-tawp turin EGR duty cycle 0%-ah dah' : 'Sets EGR duty cycle to 0% to prevent intake soot'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={disableEgr}
              onChange={(e) => setDisableEgr(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Estimated Power Output Card */}
          <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-amber-950/40 border border-slate-700 rounded-xl flex items-center justify-around text-center">
            <div>
              <div className="text-[10px] text-slate-400">STOCK POWER</div>
              <div className="text-base font-bold text-slate-300">140 HP / 320 Nm</div>
            </div>
            <div className="text-cyan-400 font-bold text-lg">→</div>
            <div>
              <div className="text-[10px] text-amber-400 font-bold">ESTIMATED STAGE 1</div>
              <div className="text-base font-bold text-emerald-300">
                {140 + Math.round(torquePercent * 2.2)} HP / {320 + Math.round(torquePercent * 4.8)} Nm
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0a0f1c] border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/50 transition"
          >
            <Zap className="w-4 h-4 fill-current" />
            {lang === 'mizo' ? 'Stage 1 Map Remap Apply Rawh' : 'Apply Stage 1 Tuning'}
          </button>
        </div>
      </div>
    </div>
  );
};
