import React, { useState } from 'react';
import { Language } from '../types/winols';
import { HardDrive, MemoryStick, Cpu, Database, Shield, Zap } from 'lucide-react';

interface EcuMemoryLayoutProps {
  lang: Language;
}

export const EcuMemoryLayout: React.FC<EcuMemoryLayoutProps> = ({ lang }) => {
  const [selectedSegment, setSelectedSegment] = useState<string>('calrom');

  const segments = [
    {
      id: 'bootrom',
      name: 'BootROM / Hardware Init',
      range: '0x80000000 - 0x8001FFFF',
      size: '128 KB',
      color: '#ef4444',
      type: 'Protected Read-Only OTP',
      descMizo: 'Microcontroller Boot code leh initialisation. TPROT (Tuning Protection) RSA signature check tu a ni a, heta mi khawih chet hi chuan ECU a thi nghal hmak.',
      descEng: 'Core hardware bootloader and cryptographic watchdog. Executes initial self-test and checks RSA signature validity. Overwriting here permanently bricks the ECU.',
    },
    {
      id: 'asw',
      name: 'ASW (Application Software / OS)',
      range: '0x80020000 - 0x801BFFFF',
      size: '1.6 MB',
      color: '#3b82f6',
      type: 'Executable Code Area',
      descMizo: 'AUTOSAR / OSEK real-time operating system leh engine control logic (fuel injection timing, throttle actuator code, sensor interrupt routines) zawng zawng awmna a ni.',
      descEng: 'Compiled machine instructions (Tricore / PowerPC opcodes), task schedulers, interrupt routines, sensor signal conditioning, and closed-loop control algorithms.',
    },
    {
      id: 'calrom',
      name: 'CalROM / Calibration Maps (WinOLS Target)',
      range: '0x801C0000 - 0x802BFFFF',
      size: '1.0 MB',
      color: '#10b981',
      type: 'Calibration Data Area',
      descMizo: 'Hei hi WinOLS-in a khawih ber a ni! Map zawng zawng (Turbo Boost, Fuel Rail, Drivers Wish, Torque Limiter) leh Single Value Constants (SVBL) te awmna a ni.',
      descEng: 'Primary WinOLS modification domain! Contains all lookup tables (Kennfelder), characteristic curves (Kennlinien), axis breakpoint tables, and Single Value Limiters (SVBL).',
    },
    {
      id: 'cs_block',
      name: 'Checksum Boundary & Complement Vectors',
      range: '0x802BFFF0 - 0x802BFFFF',
      size: '16 Bytes',
      color: '#f59e0b',
      type: 'Integrity Checksum Vector',
      descMizo: 'CalROM block tawpa Checksum Complementary word awmna. WinOLS Checksum plugin (OLS222)-in calibration a thlak veleh heta word hi a modify zung zung thin.',
      descEng: 'Complementary balancing vector and CRC-32 register. WinOLS checksum plugins update this precise location to neutralize any modifications made in the CalROM block.',
    },
    {
      id: 'dflash',
      name: 'Data Flash / EEPROM Emulation',
      range: '0x802C0000 - 0x802FFFFF',
      size: '256 KB',
      color: '#8b5cf6',
      type: 'Persistent Adaptations',
      descMizo: 'Immobilizer keys (chabi synchronize-na), Injector IMA calibration codes, DPF soot mass, leh fault codes (DTC history) in-khawlna.',
      descEng: 'Non-volatile runtime storage: Immobilizer crypto tokens, injector calibration IMA codes, learned adaptations, soot loading counters, and fault logs.',
    },
    {
      id: 'ols300_ram',
      name: 'OLS300 Real-Time Dual-Port RAM Overlay',
      range: '0x801C0000 - 0x802BFFFF',
      size: 'Hardware Emulation',
      color: '#06b6d4',
      type: 'EVC Hardware In-Circuit Emulation',
      descMizo: 'EVC OLS300 hardware emulator-in CalROM Flash kha a chhuhsak (intercept) a, dyno chungah car tlan lai rengin map millisecond chhungin a thlak theih.',
      descEng: 'Hardware interception by EVC OLS300 emulator module: replaces Flash with ultra-fast dual-port RAM for on-dyno real-time live map tuning.',
    },
  ];

  const current = segments.find((s) => s.id === selectedSegment) || segments[2];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-sm font-bold text-slate-100">
            {lang === 'mizo'
              ? 'ECU Flash Memory Architecture & WinOLS Mapping'
              : 'ECU Flash Architecture & WinOLS Memory Segmentation'}
          </span>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
          Target: Infineon Tricore TC1797 / Bosch EDC17
        </span>
      </div>

      {/* Memory Bar Segment Graphic */}
      <div className="p-4 space-y-4">
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-slate-400 flex justify-between">
            <span>Physical Flash Address Space (4MB Virtual Mapping)</span>
            <span className="text-cyan-400">Click segments to inspect</span>
          </div>

          {/* Segmented Memory Bar */}
          <div className="w-full h-12 bg-slate-950 rounded-lg border border-slate-800 flex overflow-hidden p-1 gap-1">
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => setSelectedSegment(seg.id)}
                style={{
                  backgroundColor: seg.id === selectedSegment ? seg.color : `${seg.color}35`,
                  borderColor: seg.id === selectedSegment ? '#ffffff' : `${seg.color}70`,
                }}
                className={`h-full flex-1 rounded border transition-all duration-150 flex flex-col justify-center items-center relative group px-1 ${
                  seg.id === selectedSegment ? 'scale-y-105 shadow-lg' : 'hover:opacity-100 opacity-80'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-white truncate max-w-full">
                  {seg.name.split('/')[0]}
                </span>
                <span className="text-[9px] font-mono text-slate-200/90 hidden sm:inline">
                  {seg.size}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Segment Details Card */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: current.color }}
              />
              <span className="text-sm font-bold text-white">{current.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {current.type}
              </span>
            </div>
            <div className="text-cyan-400 text-xs">
              Address: <span className="font-bold text-white">{current.range}</span> ({current.size})
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed text-xs">
            {lang === 'mizo' ? current.descMizo : current.descEng}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-400">
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>CPU: TC1797 / MPC5566</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
              <MemoryStick className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>Flash Type: Internal NOR</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Watchdog: Hardware Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
