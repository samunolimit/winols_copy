import React, { useState } from 'react';
import { Language, ProjectMetadata } from '../types/winols';
import { INDIAN_VEHICLES_DATABASE, VehicleProfile } from '../data/indianVehicles';
import {
  Sparkles,
  X,
  Gauge,
  Zap,
  Bike,
  Car,
  Truck,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Flame,
  Wind,
  FolderOpen,
} from 'lucide-react';

interface AutoTuningRemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentMetadata: ProjectMetadata;
  onApplyProfileTune: (
    profile: VehicleProfile,
    tuneSettings: {
      torquePercent: number;
      boostMbar: number;
      railBar: number;
      disableEgr: boolean;
      advanceIgnitionDeg: number;
      liftRevLimitRpm: number;
    }
  ) => void;
  onLoadVehiclePreset: (profile: VehicleProfile) => void;
}

export const AutoTuningRemapModal: React.FC<AutoTuningRemapModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentMetadata,
  onApplyProfileTune,
  onLoadVehiclePreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | '2wheeler' | '3wheeler' | 'passenger_car' | 'commercial_truck'
  >('all');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    INDIAN_VEHICLES_DATABASE[0].id
  );
  const [loadedSuccessId, setLoadedSuccessId] = useState<string | null>(null);

  const activeProfile =
    INDIAN_VEHICLES_DATABASE.find((p) => p.id === selectedProfileId) ||
    INDIAN_VEHICLES_DATABASE[0];

  // Custom Tuning Sliders initialized from profile
  const [torquePercent, setTorquePercent] = useState<number>(
    activeProfile.defaultTorqueIncrease
  );
  const [boostMbar, setBoostMbar] = useState<number>(
    activeProfile.defaultBoostIncrease
  );
  const [railBar, setRailBar] = useState<number>(
    activeProfile.defaultRailIncrease
  );
  const [disableEgr, setDisableEgr] = useState<boolean>(true);
  const [advanceIgnitionDeg, setAdvanceIgnitionDeg] = useState<number>(3.0);
  const [liftRevLimitRpm, setLiftRevLimitRpm] = useState<number>(
    activeProfile.recommendedRevLimit
  );

  if (!isOpen) return null;

  const handleSelectProfile = (p: VehicleProfile) => {
    setSelectedProfileId(p.id);
    setTorquePercent(p.defaultTorqueIncrease);
    setBoostMbar(p.defaultBoostIncrease);
    setRailBar(p.defaultRailIncrease);
    setLiftRevLimitRpm(p.recommendedRevLimit);
  };

  const handleLoadDumpClick = (p: VehicleProfile) => {
    // 1. Load ECU binary and maps directly into WinOLS workspace
    onLoadVehiclePreset(p);
    // 2. Mark this profile as actively loaded
    setLoadedSuccessId(p.id);
    // 3. Close the modal after brief visual confirmation so user immediately sees loaded hex & 3D maps!
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleApply = () => {
    onApplyProfileTune(activeProfile, {
      torquePercent,
      boostMbar,
      railBar,
      disableEgr,
      advanceIgnitionDeg,
      liftRevLimitRpm,
    });
    onClose();
  };

  const filteredVehicles =
    selectedCategory === 'all'
      ? INDIAN_VEHICLES_DATABASE
      : INDIAN_VEHICLES_DATABASE.filter((v) => v.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none font-sans overflow-y-auto">
      <div className="bg-[#0b101d] border border-cyan-500/40 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0c162d] to-[#121c36] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">
                  {lang === 'mizo'
                    ? 'India Vehicles & Commercial Trucks Auto-Tune Studio'
                    : 'India Vehicles & Commercial Trucks Auto-Tune Studio'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono font-bold">
                  Stage 1 + Live Calibration
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'mizo'
                  ? 'Tata 407/Signa, Bolero Maxi Truck, Dost, Swift DDiS, Royal Enfield, KTM tan auto remap & ECU dump'
                  : 'Commercial trucks, pick-ups, passenger CRDi and bikes parametric auto remap profiles'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {lang === 'mizo'
              ? `All Vehicles (${INDIAN_VEHICLES_DATABASE.length})`
              : `All Vehicles (${INDIAN_VEHICLES_DATABASE.length})`}
          </button>
          <button
            onClick={() => setSelectedCategory('commercial_truck')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-semibold ${
              selectedCategory === 'commercial_truck'
                ? 'bg-amber-600 text-black shadow-lg shadow-amber-600/30'
                : 'text-amber-300/80 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Commercial Trucks & Pickups (4)</span>
          </button>
          <button
            onClick={() => setSelectedCategory('passenger_car')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-semibold ${
              selectedCategory === 'passenger_car'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Cars & SUVs</span>
          </button>
          <button
            onClick={() => setSelectedCategory('2wheeler')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-semibold ${
              selectedCategory === '2wheeler'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>2-Wheelers (Bikes)</span>
          </button>
          <button
            onClick={() => setSelectedCategory('3wheeler')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-semibold ${
              selectedCategory === '3wheeler'
                ? 'bg-amber-600 text-black shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>3-Wheeler (Auto)</span>
          </button>
        </div>

        {/* Content Body: Left Column Vehicle List / Right Column Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Vehicle List */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-[#080d19]/80 max-h-[62vh]">
            <div className="text-[11px] font-mono text-slate-400 px-1 py-0.5 flex justify-between items-center">
              <span>{lang === 'mizo' ? 'Vehicle Thlang Rawh:' : 'Select Vehicle:'}</span>
              <span className="text-cyan-400 font-semibold">{filteredVehicles.length} Models</span>
            </div>

            {filteredVehicles.map((v) => {
              const isSelected = v.id === selectedProfileId;
              const isCurrentlyActive = currentMetadata.vehicleModel?.includes(v.name.split(' ')[0]);

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectProfile(v)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left relative ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {v.category === '2wheeler' && <Bike className="w-3.5 h-3.5 text-purple-400" />}
                        {v.category === '3wheeler' && <Truck className="w-3.5 h-3.5 text-amber-400" />}
                        {v.category === 'passenger_car' && <Car className="w-3.5 h-3.5 text-cyan-400" />}
                        {v.category === 'commercial_truck' && <Truck className="w-3.5 h-3.5 text-emerald-400" />}
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {lang === 'mizo' ? v.categoryLabelMizo : v.categoryLabelEng}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white mt-1">{v.name}</h4>
                      <p className="text-[11px] font-mono text-cyan-300/80 mt-0.5">{v.subTitle}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">ECU: {v.ecuType.split('/')[0]}</span>
                    <span className="text-emerald-400 font-bold">{v.stage1Power}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Vehicle Tuning Canvas & Parameters */}
          <div className="md:col-span-7 overflow-y-auto p-4 space-y-4 bg-[#0a0f1d] max-h-[62vh]">
            {/* Active Vehicle Hero Card with Load Dump Action */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 border border-slate-700 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {activeProfile.ecuType}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{activeProfile.name}</h3>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    Engine: <span className="text-slate-200">{activeProfile.engine}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Processor/Chip: <span className="text-purple-300 font-semibold">{activeProfile.ecuChip}</span>
                  </div>
                </div>

                {/* Big Prominent Load ECU Dump Button */}
                <button
                  onClick={() => handleLoadDumpClick(activeProfile)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg flex-shrink-0 ${
                    loadedSuccessId === activeProfile.id
                      ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/25 border border-cyan-400/40'
                  }`}
                  title="Load real ECU binary memory and maps into WinOLS workspace"
                >
                  {loadedSuccessId === activeProfile.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-bounce" />
                      <span>{lang === 'mizo' ? 'ECU Dump Loaded!' : 'ECU Dump Loaded!'}</span>
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-4 h-4 text-cyan-200" />
                      <span>{lang === 'mizo' ? 'Load ECU Dump' : 'Load ECU Dump'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Power / Torque Comparison */}
              <div className="mt-3.5 grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400">STOCK OUTPUT</div>
                  <div className="text-white font-bold">{activeProfile.stockPower}</div>
                  <div className="text-slate-400 text-[11px]">{activeProfile.stockTorque}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border border-emerald-600/40">
                  <div className="text-[10px] text-amber-400 font-bold">STAGE 1 RE-CALIBRATED</div>
                  <div className="text-emerald-300 font-bold">{activeProfile.stage1Power}</div>
                  <div className="text-cyan-300 text-[11px] font-bold">{activeProfile.stage1Torque}</div>
                </div>
              </div>
            </div>

            {/* Special Tuning Highlights */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>{lang === 'mizo' ? 'Auto-Tune Specific Calibration Logic:' : 'Vehicle Specific Tuning Features:'}</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {(lang === 'mizo' ? activeProfile.specialFeaturesMizo : activeProfile.specialFeaturesEng).map(
                  (feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{feat}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Live Sliders for Custom Fine-Tuning */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'mizo' ? 'Remap Parameters Siamremna:' : 'Interactive Remap Parameters:'}</span>
              </div>

              {/* Torque Nudge Slider */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-300 font-bold flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    <span>Torque Limiter / Fuel Enrichment</span>
                  </span>
                  <span className="text-white font-bold">+{torquePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={torquePercent}
                  onChange={(e) => setTorquePercent(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Boost Slider (for Turbo Vehicles) */}
              {activeProfile.defaultBoostIncrease > 0 && (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                      <Wind className="w-3 h-3" />
                      <span>Turbo Boost Pressure Target</span>
                    </span>
                    <span className="text-white font-bold">+{boostMbar} mbar</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    step="10"
                    value={boostMbar}
                    onChange={(e) => setBoostMbar(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Spark Timing Advance (for 2W / Petrol) */}
              {activeProfile.category === '2wheeler' || activeProfile.category === '3wheeler' ? (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>Ignition Spark Advance (BTDC)</span>
                    </span>
                    <span className="text-white font-bold">+{advanceIgnitionDeg.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    value={advanceIgnitionDeg}
                    onChange={(e) => setAdvanceIgnitionDeg(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              ) : null}

              {/* Rev Limit Lifter */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>RPM Soft Rev-Limiter Ceiling</span>
                  </span>
                  <span className="text-white font-bold">{liftRevLimitRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="2400"
                  max="11000"
                  step="100"
                  value={liftRevLimitRpm}
                  onChange={(e) => setLiftRevLimitRpm(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* EGR Deactivation Toggle */}
              {activeProfile.category !== '2wheeler' && (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200 text-xs">
                      {lang === 'mizo' ? 'EGR Valve Deactivation (Closed 0%)' : 'EGR Valve Disable'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {lang === 'mizo' ? 'Carbon soot khawlna leh sluggishness tireh nan' : 'Prevents carbon buildup in intake'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={disableEgr}
                    onChange={(e) => setDisableEgr(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0f1c] border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {lang === 'mizo'
                ? 'Target: In-memory live binary buffer remap'
                : 'Target: In-memory live binary buffer remap'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-semibold transition"
            >
              {lang === 'mizo' ? 'Bansan' : 'Cancel'}
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-mono font-bold rounded-lg text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'mizo' ? 'Apply Auto-Tune to Memory' : 'Apply Auto-Tune to Memory'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
