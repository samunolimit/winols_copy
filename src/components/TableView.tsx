import React, { useState } from 'react';
import { EcuMapDefinition, Language } from '../types/winols';
import { Table as TableIcon, Plus, Minus, Percent, RotateCcw, Check, Sparkles } from 'lucide-react';

interface TableViewProps {
  currentMap: EcuMapDefinition;
  onUpdateMapCell: (row: number, col: number, newValue: number) => void;
  onBatchModify: (multiplier: number) => void;
  onResetMap: () => void;
  lang: Language;
}

export const TableView: React.FC<TableViewProps> = ({
  currentMap,
  onUpdateMapCell,
  onBatchModify,
  onResetMap,
  lang,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 0, col: 0 });
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [tempVal, setTempVal] = useState<string>('');

  // Find min and max for heatmap cell shading
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let r = 0; r < currentMap.rows; r++) {
    for (let c = 0; c < currentMap.cols; c++) {
      if (currentMap.data[r][c] < minZ) minZ = currentMap.data[r][c];
      if (currentMap.data[r][c] > maxZ) maxZ = currentMap.data[r][c];
    }
  }

  const getHeatmapBg = (val: number) => {
    const range = maxZ - minZ || 1;
    const ratio = Math.max(0, Math.min(1, (val - minZ) / range));
    // Soft tint from deep blue/cyan to subtle amber/rose
    if (ratio < 0.3) {
      return `rgba(6, 182, 212, ${0.08 + ratio * 0.2})`;
    } else if (ratio < 0.7) {
      return `rgba(16, 185, 129, ${0.1 + (ratio - 0.3) * 0.25})`;
    } else {
      return `rgba(245, 158, 11, ${0.15 + (ratio - 0.7) * 0.4})`;
    }
  };

  const handleStartEdit = (r: number, c: number, currentVal: number) => {
    setSelectedCell({ row: r, col: c });
    setEditingCell({ row: r, col: c });
    setTempVal(currentVal.toString());
  };

  const handleSaveEdit = (r: number, c: number) => {
    const num = Number(tempVal);
    if (!isNaN(num)) {
      onUpdateMapCell(r, c, Math.round(num));
    }
    setEditingCell(null);
  };

  const activeR = selectedCell?.row ?? 0;
  const activeC = selectedCell?.col ?? 0;
  const activeVal = currentMap.data[activeR]?.[activeC] ?? 0;
  const activeOrigVal = currentMap.originalData[activeR]?.[activeC] ?? 0;
  const activeDelta = activeVal - activeOrigVal;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-sm font-bold text-cyan-300">
            {lang === 'mizo' ? 'WinOLS Text Spreadsheet Table' : 'WinOLS Physical Matrix Table'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            Hotkey: &apos;T&apos;
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">
            {currentMap.addressHex}
          </span>
        </div>

        {/* Quick adjustments */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => onUpdateMapCell(activeR, activeC, activeVal + 20)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3 text-cyan-400" />
            +20
          </button>
          <button
            onClick={() => onUpdateMapCell(activeR, activeC, Math.max(0, activeVal - 20))}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition"
          >
            <Minus className="w-3 h-3 text-cyan-400" />
            -20
          </button>
          <button
            onClick={() => onBatchModify(1.05)}
            className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded border border-emerald-700 font-semibold transition"
          >
            Map +5%
          </button>
          <button
            onClick={() => onBatchModify(1.1)}
            className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-700 font-semibold transition"
          >
            Map +10%
          </button>
          <button
            onClick={onResetMap}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
            title="Reset Map"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="p-4 overflow-x-auto font-mono text-xs select-none">
        <table className="w-full border-collapse">
          <thead>
            {/* Top axis name header */}
            <tr>
              <th className="p-2 border border-slate-800 bg-[#080c14] text-slate-500 font-semibold text-left">
                {currentMap.yAxisName} ({currentMap.yAxisUnit}) ↓ \ {currentMap.xAxisName} ({currentMap.xAxisUnit}) →
              </th>
              {currentMap.xAxisValues.map((xVal, c) => (
                <th
                  key={c}
                  className="p-2 border border-slate-800 bg-[#090e1a] text-cyan-400 font-bold text-center"
                >
                  {xVal}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentMap.data.map((row, r) => {
              const yVal = currentMap.yAxisValues[r];

              return (
                <tr key={r}>
                  {/* Left Y-Axis Header */}
                  <th className="p-2 border border-slate-800 bg-[#090e1a] text-slate-300 font-bold text-left whitespace-nowrap">
                    {yVal} <span className="text-slate-500 text-[10px]">{currentMap.yAxisUnit}</span>
                  </th>

                  {/* Cell Matrix */}
                  {row.map((val, c) => {
                    const origVal = currentMap.originalData[r][c];
                    const isMod = val !== origVal;
                    const delta = val - origVal;
                    const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                    const isEditing = editingCell?.row === r && editingCell?.col === c;
                    const heatBg = getHeatmapBg(val);

                    return (
                      <td
                        key={c}
                        style={{ backgroundColor: heatBg }}
                        onClick={() => setSelectedCell({ row: r, col: c })}
                        onDoubleClick={() => handleStartEdit(r, c, val)}
                        className={`p-2 border border-slate-800/80 text-center cursor-pointer transition relative group ${
                          isSelected
                            ? 'ring-2 ring-cyan-400 z-10 font-bold'
                            : 'hover:border-slate-600'
                        } ${isMod ? 'text-amber-300 font-bold' : 'text-slate-200'}`}
                      >
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={tempVal}
                              onChange={(e) => setTempVal(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(r, c);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              autoFocus
                              className="w-16 px-1 py-0.5 bg-slate-950 border border-cyan-400 text-center font-bold text-white rounded focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveEdit(r, c)}
                              className="text-emerald-400 p-0.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span>{val}</span>
                            {isMod && (
                              <div className="text-[9px] text-amber-400 font-normal">
                                {delta > 0 ? `+${delta}` : delta}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Detail Bar */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Selected Vertex:</span>
          <span className="text-cyan-300 font-bold">
            {currentMap.xAxisValues[activeC]} {currentMap.xAxisUnit} × {currentMap.yAxisValues[activeR]} {currentMap.yAxisUnit}
          </span>
          <span className="text-white font-bold text-sm">
            = {activeVal} {currentMap.zUnit}
          </span>
          {activeDelta !== 0 && (
            <span className="text-amber-400 font-semibold">
              (Delta: {activeDelta > 0 ? `+${activeDelta}` : activeDelta} {currentMap.zUnit})
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500">
          {lang === 'mizo'
            ? 'Double-click la, value thlak rawh • Click cell to nudge'
            : 'Double-click to type exact value • Press Enter to save'}
        </div>
      </div>
    </div>
  );
};
