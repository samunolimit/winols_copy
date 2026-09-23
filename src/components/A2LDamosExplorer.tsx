import React, { useState } from 'react';
import { Language } from '../types/winols';
import { GERMAN_ACRONYMS } from '../data/ecuMaps';
import { FileCode, BookOpen, Layers, Check, Search, FileText } from 'lucide-react';

interface A2LDamosExplorerProps {
  lang: Language;
}

export const A2LDamosExplorer: React.FC<A2LDamosExplorerProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'a2l' | 'damos' | 'acronyms' | 'ols_spec'>('a2l');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const sampleA2L = `/*************************************************************************
 * ASAM MCD-2MC (A2L / ASAP2 Specification v1.61)
 * ECU Map Definition Sample: Turbo Target Boost Map (KFLDRL)
 *************************************************************************/
ASAP2_VERSION 1 61
/begin PROJECT Bosch_EDC17CP14_VAG "2.0 TDI CR 170HP Engine Management"
  /begin MODULE Engine_Control_Unit "Tricore TC1797 Flash Rom"
    
    /begin CHARACTERISTIC
      /* Name */              KFLDRL
      /* LongIdentifier */    "Kennfeld fuer Ladedruck-Sollwert (Target Boost)"
      /* Type */              MAP
      /* Address */           0x1E4280
      /* Deposit */           RL_MAP_UWORD_S
      /* MaxDiff */           0.0
      /* Conversion */        CM_MBAR
      /* LowerLimit */        500.0
      /* UpperLimit */        3200.0
      
      /begin AXIS_DESCR
        /* AxisType */        COM_AXIS
        /* InputQuantity */   nmot_w /* Engine Speed RPM */
        /* Conversion */      CM_RPM
        /* MaxPoints */       8
        /* LowerLimit */      0.0
        /* UpperLimit */      6000.0
        AXIS_PTS_REF          AP_NMOT_8
      /end AXIS_DESCR

      /begin AXIS_DESCR
        /* AxisType */        COM_AXIS
        /* InputQuantity */   mefin_w /* Injected Fuel mg/str */
        /* Conversion */      CM_MG_HUB
        /* MaxPoints */       8
        /* LowerLimit */      0.0
        /* UpperLimit */      100.0
        AXIS_PTS_REF          AP_MEFIN_8
      /end AXIS_DESCR
    /end CHARACTERISTIC

    /begin COMPU_METHOD CM_MBAR
      "Linear Conversion for Turbo Boost Pressure"
      LINEAR
      "%6.1f"
      "mbar"
      COEFFS_LINEAR 1.0 0.0 /* Factor: 1.0, Offset: 0.0 */
    /end COMPU_METHOD

  /end MODULE
/end PROJECT`;

  const sampleDAMOS = `[DAMOS_PROJECT_V3]
ECU_NAME = BOSCH_EDC16U34_TDI
SOFTWARE_ID = 1037386782
EPK = 42/1/EDC16U34/000/1037386782

[MAPS_CATALOG]
ID=001 | ADDR=0x1E4280 | NAME=KFLDRL | DESC="Kennfeld Ladedruck-Sollwert" | ROWS=8 | COLS=8 | X_AXIS=nmot_w | Y_AXIS=mefin_w
ID=002 | ADDR=0x1C1100 | NAME=KFMD | DESC="Fahrpedal-Wunsch (Drivers Wish)" | ROWS=8 | COLS=8 | X_AXIS=nmot_w | Y_AXIS=mrw_b
ID=003 | ADDR=0x1F2A00 | NAME=KFRSD | DESC="Raildruck-Sollwert (Rail Pressure)" | ROWS=8 | COLS=8 | X_AXIS=nmot_w | Y_AXIS=mefin_w
ID=004 | ADDR=0x1C3800 | NAME=KLMM | DESC="Drehmomentbegrenzung (Torque Limit)" | ROWS=4 | COLS=8 | X_AXIS=nmot_w | Y_AXIS=pamb_w
ID=005 | ADDR=0x1D8500 | NAME=KFAGR | DESC="Abgasrueckfuehrung (EGR Duty Cycle)" | ROWS=8 | COLS=8 | X_AXIS=nmot_w | Y_AXIS=mefin_w`;

  const filteredAcronyms = GERMAN_ACRONYMS.filter(
    (a) =>
      a.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.example.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-pink-400" />
          <span className="font-mono text-sm font-bold text-slate-100">
            {lang === 'mizo'
              ? 'A2L, DAMOS & OLS Container Architecture'
              : 'ASAM MCD-2MC (A2L), DAMOS & OLS Structure'}
          </span>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveTab('a2l')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'a2l' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            A2L (ASAM MCD-2MC)
          </button>
          <button
            onClick={() => setActiveTab('damos')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'damos' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            DAMOS (ASAP1)
          </button>
          <button
            onClick={() => setActiveTab('acronyms')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'acronyms' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            German Acronyms
          </button>
          <button
            onClick={() => setActiveTab('ols_spec')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'ols_spec' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            .OLS vs .KP
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-4">
        {activeTab === 'a2l' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-pink-950/20 border border-pink-800/40 rounded-lg text-slate-300">
              <span className="font-bold text-pink-400">
                {lang === 'mizo' ? 'ASAM MCD-2MC (A2L) Awmzia:' : 'What is ASAM MCD-2MC (A2L)?'}
              </span>{' '}
              {lang === 'mizo'
                ? 'Automotive industry-a ECU map zawng zawng hrilhfiahna file standard a ni. Binary flat ROM chhungah address khawi lai nge KFLDRL (Turbo Boost), khawi nge RPM axis, khawi nge scaling factor (f(x) = ax + b) tih hi A2L hmangin WinOLS-in a decode thin.'
                : 'The international automotive engineering standard defining calibration datasets. Decouples raw memory offsets from physical units by assigning CHARACTERISTIC blocks, conversion formulas (COMPU_METHOD), and axis references (AXIS_PTS).'}
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
              <code>{sampleA2L}</code>
            </pre>
          </div>
        )}

        {activeTab === 'damos' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300">
              <span className="font-bold text-cyan-400">
                {lang === 'mizo' ? 'DAMOS / ASAP1 Factory Map File:' : 'Bosch & OEM DAMOS File Hierarchy:'}
              </span>{' '}
              {lang === 'mizo'
                ? 'Bosch leh car siamtu company (VAG, BMW, Mercedes) engineer-te chauh hman thin a ni a. ECU software chhungah map sang chuang (10,000+ variables) awmte hming leh thil tih theihna chipchiar a keng tel vek a ni.'
                : 'Proprietary Bosch/OEM engineering specification files containing thousands of raw variable descriptions, German functional abbreviations, and complete software build identifiers (EPK).'}
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
              <code>{sampleDAMOS}</code>
            </pre>
          </div>
        )}

        {activeTab === 'acronyms' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={lang === 'mizo' ? 'Bosch German Acronym zawng rawh (e.g. KF, ZW, LD)...' : 'Search Bosch acronym (e.g. KF, ZW, LD)...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>
              <span className="text-slate-400 text-[11px]">
                {filteredAcronyms.length} terms
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredAcronyms.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-pink-400 font-bold">{item.term}</span>
                    <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      Funktionsrahmen
                    </span>
                  </div>
                  <div className="text-slate-200">{item.meaning}</div>
                  <div className="text-[11px] text-cyan-400">Ex: {item.example}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ols_spec' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>.OLS Project File Architecture</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {lang === 'mizo'
                  ? 'WinOLS project container bik a ni. A chhungah Base/Original binary dump, version dang zawng (Stage 1, Stage 2), map list, axis formula, customer details, leh checksum configuration zawng zawng file khatah a vawng tel vek.'
                  : 'Self-contained binary container encapsulating original flash ROM, active modified version branches, full map definitions with unit scaling factors, customer notes, and hardware configuration.'}
              </p>
              <div className="pt-2 text-[10px] text-slate-400 space-y-1">
                <div>• Header signature: OLS / EVC tag</div>
                <div>• Shadow buffer diff trees</div>
                <div>• Linked Checksum DLL instances</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>.KP (Map Pack) File Architecture</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {lang === 'mizo'
                  ? 'Map Pack file a ni a, binary file a keng tel lo. Map awmna address (e.g. 0x1E4280), rows, columns, axis pointers leh unit chauh a vawng a, chuvangin a file size a te em em (kb tlemte) a, tuner-te inkarah in-share zung zung a awlsam.'
                  : 'Lightweight definition export format containing solely map offsets, dimensions, factor coefficients, and axis linkage without bundling vehicle ROM data. Enables safe sharing between tuners.'}
              </p>
              <div className="pt-2 text-[10px] text-slate-400 space-y-1">
                <div>• Relative & absolute address tables</div>
                <div>• Zero copyrighted OEM code embedded</div>
                <div>• Instant import across matching software IDs</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
