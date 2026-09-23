import React, { useState, useRef, useEffect } from 'react';
import { Language, ViewMode, ProjectMetadata } from '../types/winols';
import {
  FolderOpen,
  Save,
  Download,
  Search,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  Globe,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

interface WinolsMenuBarProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  metadata: ProjectMetadata;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onOpenFileClick: () => void;
  onLoadPreset: (presetId: string) => void;
  onExportModifiedBin: () => void;
  onExportMapPackKp: () => void;
  onTriggerFindMaps: () => void;
  onOpenStage1Wizard: () => void;
  onOpenAutoTuningModal: () => void;
  onRecalculateChecksums: () => void;
  onResetAllToOri: () => void;
  onTestFlash: () => void;
  onOpenNewMapModal: () => void;
}

export const WinolsMenuBar: React.FC<WinolsMenuBarProps> = ({
  lang,
  onSetLang,
  metadata,
  viewMode,
  onSetViewMode,
  onOpenFileClick,
  onLoadPreset,
  onExportModifiedBin,
  onExportMapPackKp,
  onTriggerFindMaps,
  onOpenStage1Wizard,
  onOpenAutoTuningModal,
  onRecalculateChecksums,
  onResetAllToOri,
  onTestFlash,
  onOpenNewMapModal,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div
      ref={menuRef}
      className="bg-[#0b101a] border-b border-slate-800 text-xs font-mono select-none relative z-50 flex items-center justify-between px-2"
    >
      {/* Left Menu Items */}
      <div className="flex items-center space-x-1">
        {/* Project Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('project')}
            className={`px-2.5 py-1.5 rounded transition ${
              openMenu === 'project'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            {lang === 'mizo' ? 'Project' : 'Project'}
          </button>

          {openMenu === 'project' && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-[#0d1322] border border-slate-700/80 rounded-lg shadow-2xl py-1 text-slate-200 z-50">
              <button
                onClick={() => {
                  onOpenFileClick();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-cyan-900/40 hover:text-cyan-200 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  {lang === 'mizo' ? 'ECU Binary (.bin) Hawng Rawh...' : 'Open Binary (.bin, .ori)...'}
                </span>
                <span className="text-[10px] text-slate-500">Ctrl+O</span>
              </button>

              <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-bold border-t border-slate-800 mt-1">
                {lang === 'mizo' ? 'Factory ECU Presets' : 'Sample ECU Dumps'}
              </div>

              <button
                onClick={() => {
                  onLoadPreset('edc16_tdi');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-slate-800 flex items-center justify-between text-xs"
              >
                <span>Bosch EDC16 VAG 2.0 TDI (140HP)</span>
                <span className="text-[10px] text-emerald-400">1 MB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('edc17_tdi');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-slate-800 flex items-center justify-between text-xs"
              >
                <span>Bosch EDC17 Tricore 2.0 TDI (170HP)</span>
                <span className="text-[10px] text-purple-400">2 MB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('delphi_dcm37');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-cyan-950/40 hover:text-cyan-200 flex items-center justify-between text-xs text-amber-300 font-semibold"
              >
                <span>Delphi DCM3.7 (Mahindra / Hyundai CRDi)</span>
                <span className="text-[10px] text-amber-400">Renesas</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('delphi_crd');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-cyan-950/40 hover:text-cyan-200 flex items-center justify-between text-xs text-amber-300 font-semibold"
              >
                <span>Delphi CRD2/CRD3 (Mercedes OM651)</span>
                <span className="text-[10px] text-amber-400">2 MB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('re_classic350_j_series');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-purple-950/40 hover:text-purple-200 flex items-center justify-between text-xs text-purple-300 font-semibold"
              >
                <span>Royal Enfield 350 J-Series (Bosch MSE 6.0)</span>
                <span className="text-[10px] text-purple-400 font-mono">2W / 512KB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('bajaj_compact_re_cng');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-amber-950/40 hover:text-amber-200 flex items-center justify-between text-xs text-amber-300 font-semibold"
              >
                <span>Bajaj Auto Rickshaw RE (CNG & Petrol)</span>
                <span className="text-[10px] text-amber-400 font-mono">3W / 256KB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('ktm_duke_390_bs6');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-orange-950/40 hover:text-orange-200 flex items-center justify-between text-xs text-orange-300 font-semibold"
              >
                <span>KTM Duke / RC 390 (Bosch ME17.9.71)</span>
                <span className="text-[10px] text-orange-400 font-mono">2W / 1.5MB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('tata_4sp_crdi_sumo_407');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-emerald-950/40 hover:text-emerald-200 flex items-center justify-between text-xs text-emerald-300 font-semibold"
              >
                <span>Tata Sumo Gold vs 407 (4SP 3.0L CRDi)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Truck/2MB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('mahindra_bolero_m2dicr');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-emerald-950/40 hover:text-emerald-200 flex items-center justify-between text-xs text-emerald-300 font-semibold"
              >
                <span>Mahindra Bolero Maxi Truck 2.5 m2DiCR</span>
                <span className="text-[10px] text-emerald-400 font-mono">Pickup/2MB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('tata_signa_cummins_isbe');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-amber-950/40 hover:text-amber-200 flex items-center justify-between text-xs text-amber-300 font-semibold"
              >
                <span>Tata Signa Heavy Tipper (Cummins 6.7L)</span>
                <span className="text-[10px] text-amber-400 font-mono">Heavy/2MB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('ashok_leyland_bada_dost');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-emerald-950/40 hover:text-emerald-200 flex items-center justify-between text-xs text-emerald-300 font-semibold"
              >
                <span>Ashok Leyland Bada Dost 1.5L (EDC17)</span>
                <span className="text-[10px] text-emerald-400 font-mono">LCV/2MB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('maruti_swift_13_ddis');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-cyan-950/40 hover:text-cyan-200 flex items-center justify-between text-xs text-cyan-300 font-semibold"
              >
                <span>Maruti Swift / Brezza 1.3 DDiS (Marelli 8F3)</span>
                <span className="text-[10px] text-cyan-400 font-mono">Car / 2MB</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset('eeprom_95320');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-purple-950/50 hover:text-purple-200 flex items-center justify-between text-xs text-purple-300 font-semibold"
              >
                <span>EEPROM 95320 / 95640 (Immo & VIN Dump)</span>
                <span className="text-[10px] text-purple-400 font-mono">4 KB .EEP</span>
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  onExportModifiedBin();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-emerald-950/60 hover:text-emerald-200 flex items-center justify-between text-emerald-300 font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5" />
                  {lang === 'mizo' ? 'Modified Binary (.mod) Save Rawh' : 'Export Tuned File (.mod.bin)'}
                </span>
                <span className="text-[10px] text-slate-500">Ctrl+S</span>
              </button>

              <button
                onClick={() => {
                  onExportMapPackKp();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  {lang === 'mizo' ? 'Map Pack (.kp) Export Rawh' : 'Export Map Pack (.kp)'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('edit')}
            className={`px-2.5 py-1.5 rounded transition ${
              openMenu === 'edit'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            {lang === 'mizo' ? 'Siamrem (Edit)' : 'Edit'}
          </button>

          {openMenu === 'edit' && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#0d1322] border border-slate-700/80 rounded-lg shadow-2xl py-1 text-slate-200 z-50">
              <button
                onClick={() => {
                  onOpenNewMapModal();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between"
              >
                <span>{lang === 'mizo' ? 'Map Thar Siam (Create Map)' : 'Create New Map...'}</span>
                <kbd className="text-[10px] px-1 bg-slate-800 rounded">K</kbd>
              </button>

              <button
                onClick={() => {
                  onResetAllToOri();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-800 text-amber-300 flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'mizo' ? 'Original-ah kir leh vek' : 'Reset All to Original'}</span>
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('view')}
            className={`px-2.5 py-1.5 rounded transition ${
              openMenu === 'view'
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            {lang === 'mizo' ? 'Enna (View)' : 'View'}
          </button>

          {openMenu === 'view' && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#0d1322] border border-slate-700/80 rounded-lg shadow-2xl py-1 text-slate-200 z-50">
              <button
                onClick={() => {
                  onSetViewMode('3d');
                  setOpenMenu(null);
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between ${
                  viewMode === '3d' ? 'text-cyan-300 font-bold' : ''
                }`}
              >
                <span>3D Surface View</span>
                <kbd className="text-[10px] px-1 bg-slate-800 rounded">3</kbd>
              </button>

              <button
                onClick={() => {
                  onSetViewMode('2d');
                  setOpenMenu(null);
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between ${
                  viewMode === '2d' ? 'text-cyan-300 font-bold' : ''
                }`}
              >
                <span>2D Continuous Waveform</span>
                <kbd className="text-[10px] px-1 bg-slate-800 rounded">2</kbd>
              </button>

              <button
                onClick={() => {
                  onSetViewMode('hex');
                  setOpenMenu(null);
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between ${
                  viewMode === 'hex' ? 'text-cyan-300 font-bold' : ''
                }`}
              >
                <span>Hexadecimal View</span>
                <kbd className="text-[10px] px-1 bg-slate-800 rounded">H</kbd>
              </button>

              <button
                onClick={() => {
                  onSetViewMode('text');
                  setOpenMenu(null);
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between ${
                  viewMode === 'text' ? 'text-cyan-300 font-bold' : ''
                }`}
              >
                <span>Text Table Spreadsheet</span>
                <kbd className="text-[10px] px-1 bg-slate-800 rounded">T</kbd>
              </button>

              <button
                onClick={() => {
                  onSetViewMode('quad');
                  setOpenMenu(null);
                }}
                className={`w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between border-t border-slate-800 ${
                  viewMode === 'quad' ? 'text-cyan-300 font-bold' : ''
                }`}
              >
                <span>Quad Split View (All)</span>
                <kbd className="text-[10px] px-1 bg-slate-800 rounded">Q</kbd>
              </button>
            </div>
          )}
        </div>

        {/* Tuning Wizard Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('tuning')}
            className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 ${
              openMenu === 'tuning'
                ? 'bg-slate-800 text-amber-300'
                : 'text-amber-300 hover:bg-slate-800/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'mizo' ? 'Tuning Wizard' : 'Remap Wizard'}</span>
          </button>

          {openMenu === 'tuning' && (
            <div className="absolute left-0 top-full mt-1 w-72 bg-[#0d1322] border border-slate-700/80 rounded-lg shadow-2xl py-1 text-slate-200 z-50">
              <button
                onClick={() => {
                  onOpenAutoTuningModal();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-amber-950/60 hover:text-amber-200 flex items-center gap-2.5 border-b border-slate-800"
              >
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-amber-300">
                    {lang === 'mizo' ? 'Auto-Tune Studio (India 2W, 3W & Cars)' : 'Auto-Tune Studio (India 2W, 3W & Cars)'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Royal Enfield, KTM, Bajaj Auto Rickshaw, Thar mHawk, Swift
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenStage1Wizard();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">
                    {lang === 'mizo' ? 'Quick Stage 1 Sliders' : 'Quick Stage 1 Sliders'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Torque +15%, Boost +120 mbar, Rail +50 bar
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Search / Heuristics */}
        <div className="relative">
          <button
            onClick={() => {
              onTriggerFindMaps();
              setOpenMenu(null);
            }}
            className="px-2.5 py-1.5 rounded transition text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-1.5"
            title="Scan binary for lookup tables (Hotkey: F)"
          >
            <Search className="w-3 h-3 text-cyan-400" />
            <span>{lang === 'mizo' ? 'Map Zawng Rawh (Find)' : 'Find Maps'}</span>
            <kbd className="text-[10px] px-1 bg-slate-800 text-slate-400 rounded">F</kbd>
          </button>
        </div>

        {/* Checksum & Flashing */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('hardware')}
            className={`px-2.5 py-1.5 rounded transition flex items-center gap-1.5 ${
              openMenu === 'hardware'
                ? 'bg-slate-800 text-emerald-300'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Checksum</span>
          </button>

          {openMenu === 'hardware' && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-[#0d1322] border border-slate-700/80 rounded-lg shadow-2xl py-1 text-slate-200 z-50">
              <button
                onClick={() => {
                  onRecalculateChecksums();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-emerald-950/60 hover:text-emerald-200 flex items-center gap-2 text-emerald-300"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'mizo' ? 'Recalculate CS (OLS222.DLL)' : 'Auto-Recalculate Checksum'}</span>
              </button>
              <button
                onClick={() => {
                  onTestFlash();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2 text-cyan-300"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'mizo' ? 'OBD Flash Fiah Rawh (Test)' : 'Simulate ECU Flash'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Project Quick Info & Language */}
      <div className="flex items-center space-x-3 py-1">
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="text-slate-500">ECU:</span>
          <span className="text-slate-200 font-bold">{metadata.ecuManufacturer}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">SW:</span>
          <span className="text-cyan-400 font-bold">{metadata.ecuSoftwareId}</span>
        </div>

        {/* Language switch */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
          <Globe className="w-3 h-3 text-cyan-400" />
          <button
            onClick={() => onSetLang('mizo')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
              lang === 'mizo' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mizo
          </button>
          <button
            onClick={() => onSetLang('english')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
              lang === 'english' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
};
