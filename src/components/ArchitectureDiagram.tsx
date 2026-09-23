import React, { useState } from 'react';
import { ArchitectureLayer, Language } from '../types/winols';
import { ARCHITECTURE_LAYERS } from '../data/ecuMaps';
import { Layers, ChevronRight, CheckCircle, Cpu, FileCode2, Eye, Shield, Terminal, Zap, ArrowDown } from 'lucide-react';

interface ArchitectureDiagramProps {
  lang: Language;
  onSelectLayerDemo?: (layerId: string) => void;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  lang,
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string>(ARCHITECTURE_LAYERS[0].id);

  const selectedLayer =
    ARCHITECTURE_LAYERS.find((l) => l.id === selectedLayerId) || ARCHITECTURE_LAYERS[0];

  const getLayerIcon = (id: string) => {
    switch (id) {
      case 'layer_ingestion':
        return <Cpu className="w-5 h-5" />;
      case 'layer_memory':
        return <Zap className="w-5 h-5" />;
      case 'layer_heuristics':
        return <Eye className="w-5 h-5" />;
      case 'layer_project':
        return <FileCode2 className="w-5 h-5" />;
      case 'layer_checksum':
        return <Shield className="w-5 h-5" />;
      case 'layer_visualization':
        return <Layers className="w-5 h-5" />;
      case 'layer_automation':
        return <Terminal className="w-5 h-5" />;
      default:
        return <Cpu className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Top Header */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white font-mono">
              {lang === 'mizo'
                ? 'WinOLS Software Architecture Chhungril (7 Core Layers)'
                : 'WinOLS Software Subsystem Architecture (7 Core Layers)'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'mizo'
                ? 'EVC electronic engineering architecture chipchiar: Memory management, Heuristics, CS DLLs & Emulation'
                : 'Complete engineering decomposition: Virtual memory, heuristic detection, A2L/DAMOS, and CS plugins'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-3 py-1 rounded-full">
          <span>Standard: ASAM MCD-2MC / EVC OLS</span>
        </div>
      </div>

      {/* Main Grid: Left Stack Flow, Right Deep-Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left: Architecture Stack Flow (Interactive Layers) */}
        <div className="lg:col-span-5 p-4 space-y-2 bg-slate-950/50">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>{lang === 'mizo' ? 'Architecture Layers (Hmet la en rawh)' : 'Architecture Stack (Click to inspect)'}</span>
            <span className="text-cyan-400">Top → Bottom</span>
          </div>

          {ARCHITECTURE_LAYERS.map((layer, idx) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <React.Fragment key={layer.id}>
                <button
                  onClick={() => setSelectedLayerId(layer.id)}
                  style={{
                    borderColor: isSelected ? layer.color : 'rgba(51, 65, 85, 0.4)',
                    boxShadow: isSelected ? `0 0 16px ${layer.color}25` : 'none',
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-800/90 text-white'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg transition"
                      style={{
                        backgroundColor: isSelected ? `${layer.color}25` : 'rgba(30, 41, 59, 0.6)',
                        color: layer.color,
                      }}
                    >
                      {getLayerIcon(layer.id)}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold flex items-center gap-1.5">
                        <span>{lang === 'mizo' ? layer.titleMizo : layer.titleEng}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {layer.badge}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </button>

                {/* Arrow connector between layers */}
                {idx < ARCHITECTURE_LAYERS.length - 1 && (
                  <div className="flex justify-center py-0.5 opacity-40">
                    <ArrowDown className="w-3 h-3 text-slate-500" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Detailed Layer Inspector & Breakdown */}
        <div className="lg:col-span-7 p-6 bg-slate-900/40 space-y-6">
          {/* Layer Header */}
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${selectedLayer.color}20`,
                  color: selectedLayer.color,
                  border: `1px solid ${selectedLayer.color}40`,
                }}
              >
                {selectedLayer.badge}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Subsystem Node: <span className="text-white">{selectedLayer.diagramNode}</span>
              </span>
            </div>

            <h3 className="text-lg font-bold text-white font-mono">
              {lang === 'mizo' ? selectedLayer.titleMizo : selectedLayer.titleEng}
            </h3>

            <p className="text-xs font-mono text-cyan-300/90">
              {lang === 'mizo' ? selectedLayer.subtitleMizo : selectedLayer.subtitleEng}
            </p>
          </div>

          {/* Core Functional Highlights / Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {lang === 'mizo' ? 'Hnathawh Dan & Architecture Chipchiar:' : 'Architecture & Functional Specifications:'}
            </h4>

            <div className="space-y-2.5">
              {(lang === 'mizo' ? selectedLayer.detailsMizo : selectedLayer.detailsEng).map(
                (item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 text-xs leading-relaxed text-slate-200"
                  >
                    <div className="mt-0.5 text-cyan-400 flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Technical Specs Tags */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {lang === 'mizo' ? 'Technical Highlights:' : 'Key Engineering Sub-modules:'}
            </h4>

            <div className="flex flex-wrap gap-2">
              {selectedLayer.technicalHighlights.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                >
                  ⚡ {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
