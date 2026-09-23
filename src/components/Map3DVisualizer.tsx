import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EcuMapDefinition, Language } from '../types/winols';
import { Rotate3D, ZoomIn, ZoomOut, RefreshCw, Plus, Minus, Percent, Eye, Sparkles } from 'lucide-react';

interface Map3DVisualizerProps {
  currentMap: EcuMapDefinition;
  onUpdateMapCell: (row: number, col: number, newValue: number) => void;
  onBatchModify: (multiplier: number) => void;
  onResetMap: () => void;
  lang: Language;
}

export const Map3DVisualizer: React.FC<Map3DVisualizerProps> = ({
  currentMap,
  onUpdateMapCell,
  onBatchModify,
  onResetMap,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // 3D camera angles
  const [pitch, setPitch] = useState<number>(38); // degrees
  const [yaw, setYaw] = useState<number>(-45); // degrees
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected cell [row, col]
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 3, col: 4 });
  const [showWireframeOnly, setShowWireframeOnly] = useState<boolean>(false);
  const [showOriginalGhost, setShowOriginalGhost] = useState<boolean>(true);

  // Normalize color based on Z
  const getColorForHeight = (val: number, min: number, max: number): string => {
    const range = max - min || 1;
    const ratio = Math.max(0, Math.min(1, (val - min) / range));
    // 0 = blue (220), 0.3 = cyan (180), 0.6 = green (120), 0.8 = yellow (50), 1 = red/orange (0)
    let hue = (1 - ratio) * 230; // 230 -> 0
    let lightness = 45 + ratio * 15;
    return `hsl(${hue}, 85%, ${lightness}%)`;
  };

  // Find min and max
  const rows = currentMap.rows;
  const cols = currentMap.cols;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (currentMap.data[r][c] < minZ) minZ = currentMap.data[r][c];
      if (currentMap.data[r][c] > maxZ) maxZ = currentMap.data[r][c];
      if (currentMap.originalData[r][c] < minZ) minZ = currentMap.originalData[r][c];
      if (currentMap.originalData[r][c] > maxZ) maxZ = currentMap.originalData[r][c];
    }
  }

  // Draw 3D map on canvas
  const render3D = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate grid background
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3D projection transformations
    const radPitch = (pitch * Math.PI) / 180;
    const radYaw = (yaw * Math.PI) / 180;
    const cosP = Math.cos(radPitch);
    const sinP = Math.sin(radPitch);
    const cosY = Math.cos(radYaw);
    const sinY = Math.sin(radYaw);

    const centerX = width / 2;
    const centerY = height / 2 + 30;

    const mapScaleX = (Math.min(width, height) * 0.45 * zoom) / Math.max(cols, 1);
    const mapScaleY = (Math.min(width, height) * 0.45 * zoom) / Math.max(rows, 1);
    const heightRange = maxZ - minZ || 1;
    const zHeightScale = (Math.min(width, height) * 0.35 * zoom);

    // Project (x, y, z) 3D coordinate to 2D screen
    const project = (r: number, c: number, zVal: number) => {
      // Center coordinates around (0,0)
      const x3d = (c - (cols - 1) / 2) * mapScaleX;
      const y3d = (r - (rows - 1) / 2) * mapScaleY;
      const zNorm = (zVal - minZ) / heightRange;
      const z3d = -zNorm * zHeightScale; // negative is upwards

      // Rotate Yaw around Z
      const rx = x3d * cosY - y3d * sinY;
      const ry = x3d * sinY + y3d * cosY;

      // Rotate Pitch around X
      const py = ry * cosP - z3d * sinP;
      const pz = ry * sinP + z3d * cosP;

      const screenX = centerX + rx;
      const screenY = centerY + py;

      return { x: screenX, y: screenY, depth: pz };
    };

    // Prepare quad polygons sorted from back to front (Painter's algorithm)
    interface Quad {
      r: number;
      c: number;
      depth: number;
      p0: { x: number; y: number };
      p1: { x: number; y: number };
      p2: { x: number; y: number };
      p3: { x: number; y: number };
      avgZ: number;
      isSelected: boolean;
      isModified: boolean;
      // original quad points
      origP0?: { x: number; y: number };
      origP1?: { x: number; y: number };
      origP2?: { x: number; y: number };
      origP3?: { x: number; y: number };
    }

    const quads: Quad[] = [];

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const v00 = currentMap.data[r][c];
        const v01 = currentMap.data[r][c + 1];
        const v11 = currentMap.data[r + 1][c + 1];
        const v10 = currentMap.data[r + 1][c];

        const p0 = project(r, c, v00);
        const p1 = project(r, c + 1, v01);
        const p2 = project(r + 1, c + 1, v11);
        const p3 = project(r + 1, c, v10);

        const avgDepth = (p0.depth + p1.depth + p2.depth + p3.depth) / 4;
        const avgZ = (v00 + v01 + v11 + v10) / 4;

        const isSelected =
          (selectedCell.row === r || selectedCell.row === r + 1) &&
          (selectedCell.col === c || selectedCell.col === c + 1);

        const isModified =
          v00 !== currentMap.originalData[r][c] ||
          v01 !== currentMap.originalData[r][c + 1] ||
          v11 !== currentMap.originalData[r + 1][c + 1] ||
          v10 !== currentMap.originalData[r + 1][c];

        let origP0, origP1, origP2, origP3;
        if (showOriginalGhost) {
          origP0 = project(r, c, currentMap.originalData[r][c]);
          origP1 = project(r, c + 1, currentMap.originalData[r][c + 1]);
          origP2 = project(r + 1, c + 1, currentMap.originalData[r + 1][c + 1]);
          origP3 = project(r + 1, c, currentMap.originalData[r + 1][c]);
        }

        quads.push({
          r,
          c,
          depth: avgDepth,
          p0,
          p1,
          p2,
          p3,
          avgZ,
          isSelected,
          isModified,
          origP0,
          origP1,
          origP2,
          origP3,
        });
      }
    }

    // Sort by depth back-to-front
    quads.sort((a, b) => a.depth - b.depth);

    // 1. Draw base floor bounding box & axes
    const b0 = project(0, 0, minZ);
    const b1 = project(0, cols - 1, minZ);
    const b2 = project(rows - 1, cols - 1, minZ);
    const b3 = project(rows - 1, 0, minZ);

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(b0.x, b0.y);
    ctx.lineTo(b1.x, b1.y);
    ctx.lineTo(b2.x, b2.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw original ghost wireframe if modified
    if (showOriginalGhost) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      for (const q of quads) {
        if (q.origP0 && q.origP1 && q.origP2 && q.origP3 && q.isModified) {
          ctx.beginPath();
          ctx.moveTo(q.origP0.x, q.origP0.y);
          ctx.lineTo(q.origP1.x, q.origP1.y);
          ctx.lineTo(q.origP2.x, q.origP2.y);
          ctx.lineTo(q.origP3.x, q.origP3.y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    // 3. Draw quads
    for (const q of quads) {
      ctx.beginPath();
      ctx.moveTo(q.p0.x, q.p0.y);
      ctx.lineTo(q.p1.x, q.p1.y);
      ctx.lineTo(q.p2.x, q.p2.y);
      ctx.lineTo(q.p3.x, q.p3.y);
      ctx.closePath();

      if (!showWireframeOnly) {
        const fillColor = getColorForHeight(q.avgZ, minZ, maxZ);
        ctx.fillStyle = q.isModified
          ? fillColor.replace('hsl', 'hsla').replace(')', ', 0.92)')
          : fillColor.replace('hsl', 'hsla').replace(')', ', 0.75)');
        ctx.fill();
      }

      // Wireframe borders
      if (q.isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
      } else if (q.isModified) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.6;
      } else {
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }

    // 4. Highlight the selected cell node
    const curVal = currentMap.data[selectedCell.row][selectedCell.col];
    const selPoint = project(selectedCell.row, selectedCell.col, curVal);

    // Glowing ring on selected vertex
    ctx.beginPath();
    ctx.arc(selPoint.x, selPoint.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vertical indicator line down to floor
    const floorPoint = project(selectedCell.row, selectedCell.col, minZ);
    ctx.beginPath();
    ctx.moveTo(selPoint.x, selPoint.y);
    ctx.lineTo(floorPoint.x, floorPoint.y);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.setLineDash([2, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Draw Axes labels
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    
    // X-Axis (Columns - RPM)
    const xLabelPos = project(rows - 1, Math.floor(cols / 2), minZ);
    ctx.fillText(`${currentMap.xAxisName} (${currentMap.xAxisUnit}) →`, xLabelPos.x - 40, xLabelPos.y + 24);

    // Y-Axis (Rows - Load/IQ)
    const yLabelPos = project(Math.floor(rows / 2), 0, minZ);
    ctx.fillText(`← ${currentMap.yAxisName} (${currentMap.yAxisUnit})`, yLabelPos.x - 70, yLabelPos.y + 15);

    // Z-Axis peak indicator
    const zPeakPos = project(0, 0, maxZ);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`Max: ${Math.round(maxZ)} ${currentMap.zUnit}`, zPeakPos.x - 30, zPeakPos.y - 12);
  }, [currentMap, pitch, yaw, zoom, selectedCell, showWireframeOnly, showOriginalGhost, minZ, maxZ, rows, cols]);

  useEffect(() => {
    render3D();
  }, [render3D]);

  // Mouse handlers for orbit rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setYaw((prev) => (prev + deltaX * 0.7) % 360);
    setPitch((prev) => Math.max(5, Math.min(85, prev - deltaY * 0.5)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.6, Math.min(2.5, prev - e.deltaY * 0.001)));
  };

  const selRow = selectedCell.row;
  const selCol = selectedCell.col;
  const currentVal = currentMap.data[selRow][selCol];
  const origVal = currentMap.originalData[selRow][selCol];
  const delta = currentVal - origVal;
  const deltaPercent = origVal !== 0 ? ((delta / origVal) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* 3D Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-sm font-bold text-cyan-300">
            {lang === 'mizo' ? 'WinOLS 3D Surface View' : 'WinOLS 3D Surface Elevation Engine'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {currentMap.rows}x{currentMap.cols} Matrix
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">
            {currentMap.addressHex}
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPitch(38);
              setYaw(-45);
              setZoom(1.0);
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Reset Perspective"
          >
            <Rotate3D className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button
            onClick={() => setShowWireframeOnly(!showWireframeOnly)}
            className={`px-2 py-1 text-xs font-mono rounded transition flex items-center gap-1 ${
              showWireframeOnly ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wireframe
          </button>
          <button
            onClick={() => setShowOriginalGhost(!showOriginalGhost)}
            className={`px-2 py-1 text-xs font-mono rounded transition flex items-center gap-1 ${
              showOriginalGhost ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            Ori Ghost
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-[380px] bg-slate-950 cursor-grab active:cursor-grabbing select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Orbit hint overlay */}
        <div className="absolute top-3 left-3 pointer-events-none text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800/60 backdrop-blur-sm">
          {lang === 'mizo'
            ? 'Mouse-in pawh vir la (Drag to rotate) • Scroll to zoom'
            : 'Click & drag to rotate 3D mesh • Scroll to zoom'}
        </div>

        {/* Color Gradient Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-xs font-mono backdrop-blur-sm">
          <div className="text-[10px] text-slate-400 mb-1">
            {currentMap.zUnit} {lang === 'mizo' ? 'Elevation' : 'Ramp'}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-cyan-400">{Math.round(minZ)}</span>
            <div className="w-24 h-2 rounded bg-gradient-to-r from-blue-600 via-cyan-400 via-green-400 via-yellow-400 to-red-500" />
            <span className="text-[10px] text-red-400">{Math.round(maxZ)}</span>
          </div>
        </div>

        {/* Live Delta Indicator Badge */}
        {delta !== 0 && (
          <div className="absolute top-3 right-3 bg-amber-950/80 border border-amber-600/60 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-lg animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              MODIFIED DELTA: {delta > 0 ? `+${delta}` : delta} ({delta > 0 ? `+${deltaPercent}` : deltaPercent}%)
            </span>
          </div>
        )}
      </div>

      {/* Interactive Calibration Editor Bottom Panel */}
      <div className="p-4 bg-slate-950/95 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Selected Cell Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-500">
              {lang === 'mizo' ? 'Selected Cell' : 'Target Vertex'}
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {currentVal}{' '}
              <span className="text-xs font-normal text-cyan-300">{currentMap.zUnit}</span>
            </div>
          </div>

          <div className="text-xs font-mono space-y-0.5">
            <div className="text-slate-400">
              X ({currentMap.xAxisName}):{' '}
              <span className="text-white font-semibold">{currentMap.xAxisValues[selCol]} {currentMap.xAxisUnit}</span>
            </div>
            <div className="text-slate-400">
              Y ({currentMap.yAxisName}):{' '}
              <span className="text-white font-semibold">{currentMap.yAxisValues[selRow]} {currentMap.yAxisUnit}</span>
            </div>
            <div className="text-slate-400">
              Original Ori:{' '}
              <span className="text-slate-300">{origVal} {currentMap.zUnit}</span>
              {delta !== 0 && (
                <span className={`ml-1 font-bold ${delta > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ({delta > 0 ? `+${delta}` : delta})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cell Selector & Nudge Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{lang === 'mizo' ? 'Cell Thlak Remna' : 'Tweak Active Cell'}:</span>
            <div className="flex items-center gap-1">
              <label className="text-[10px]">Row:</label>
              <select
                value={selRow}
                onChange={(e) => setSelectedCell({ ...selectedCell, row: Number(e.target.value) })}
                className="bg-slate-900 border border-slate-700 text-white rounded px-1.5 py-0.5 text-xs font-mono"
              >
                {currentMap.yAxisValues.map((v, i) => (
                  <option key={i} value={i}>
                    {v} {currentMap.yAxisUnit}
                  </option>
                ))}
              </select>
              <label className="text-[10px] ml-1">Col:</label>
              <select
                value={selCol}
                onChange={(e) => setSelectedCell({ ...selectedCell, col: Number(e.target.value) })}
                className="bg-slate-900 border border-slate-700 text-white rounded px-1.5 py-0.5 text-xs font-mono"
              >
                {currentMap.xAxisValues.map((v, i) => (
                  <option key={i} value={i}>
                    {v} {currentMap.xAxisUnit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateMapCell(selRow, selCol, currentVal + 20)}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
              title="Add 20"
            >
              <Plus className="w-3 h-3 text-cyan-400" /> +20
            </button>
            <button
              onClick={() => onUpdateMapCell(selRow, selCol, Math.max(0, currentVal - 20))}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
              title="Minus 20"
            >
              <Minus className="w-3 h-3 text-cyan-400" /> -20
            </button>
            <button
              onClick={() => onUpdateMapCell(selRow, selCol, origVal)}
              className="py-1.5 px-2.5 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white rounded font-mono text-xs transition"
              title="Reset Cell to Original"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Global Batch Percentage Tuning (Iconic WinOLS % Feature) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-cyan-400">
              <Percent className="w-3 h-3" />
              {lang === 'mizo' ? 'Map Pum Pui Thlakna (%)' : 'Whole Map Scale (%)'}
            </span>
            <button
              onClick={onResetMap}
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              {lang === 'mizo' ? 'Siam That Vek' : 'Reset All'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
            <button
              onClick={() => onBatchModify(1.05)}
              className="py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded text-center transition font-semibold"
            >
              +5%
            </button>
            <button
              onClick={() => onBatchModify(1.1)}
              className="py-1.5 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 rounded text-center transition font-semibold"
            >
              +10%
            </button>
            <button
              onClick={() => onBatchModify(0.95)}
              className="py-1.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-300 rounded text-center transition font-semibold"
            >
              -5%
            </button>
            <button
              onClick={() => onBatchModify(1.02)}
              className="py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-center transition font-semibold"
            >
              +2%
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
