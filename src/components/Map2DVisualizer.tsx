import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { EcuMapDefinition, Language } from '../types/winols';
import { Activity, Search, MapPin, ZoomIn, ZoomOut } from 'lucide-react';

interface Map2DVisualizerProps {
  currentMap: EcuMapDefinition;
  lang: Language;
  rawBinaryBuffer: Uint8Array;
  endianness?: 'HiLo' | 'LoHi';
}

export const Map2DVisualizer: React.FC<Map2DVisualizerProps> = ({
  currentMap,
  lang,
  rawBinaryBuffer,
  endianness = 'HiLo',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cursorIndex, setCursorIndex] = useState<number>(32);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Read literal 16-bit words directly from the real rawBinaryBuffer around currentMap.addressDec
  const streamData = useMemo(() => {
    const mapByteSize = currentMap.rows * currentMap.cols * 2;
    const paddingWords = 32; // 64 bytes before and after
    const startByte = Math.max(0, currentMap.addressDec - paddingWords * 2);
    const endByte = Math.min(rawBinaryBuffer.length, currentMap.addressDec + mapByteSize + paddingWords * 2);

    const words: { offset: number; val: number; isInsideMap: boolean }[] = [];

    for (let addr = startByte; addr + 1 < endByte; addr += 2) {
      const b0 = rawBinaryBuffer[addr] ?? 0;
      const b1 = rawBinaryBuffer[addr + 1] ?? 0;
      const val = endianness === 'HiLo' ? ((b0 << 8) | b1) : ((b1 << 8) | b0);
      const isInsideMap = addr >= currentMap.addressDec && addr < currentMap.addressDec + mapByteSize;

      words.push({
        offset: addr,
        val,
        isInsideMap,
      });
    }

    const mapStartIndex = words.findIndex((w) => w.isInsideMap);
    let mapEndIndex = words.length - 1;
    for (let i = words.length - 1; i >= 0; i--) {
      if (words[i].isInsideMap) {
        mapEndIndex = i;
        break;
      }
    }

    return {
      words,
      mapStartIndex: mapStartIndex >= 0 ? mapStartIndex : 0,
      mapEndIndex: mapEndIndex >= 0 ? mapEndIndex : words.length - 1,
    };
  }, [currentMap, rawBinaryBuffer, endianness]);

  const draw2D = useCallback(() => {
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

    // Background
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Grid lines (WinOLS oscilloscope raster)
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const { words, mapStartIndex, mapEndIndex } = streamData;
    if (words.length < 2) return;

    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const w of words) {
      if (w.val < minVal) minVal = w.val;
      if (w.val > maxVal) maxVal = w.val;
    }
    const range = maxVal - minVal || 1;

    const totalPoints = words.length;
    const stepX = (width / (totalPoints - 1)) * zoomLevel;
    const paddingY = 40;
    const usableHeight = height - paddingY * 2;

    const getY = (val: number) => {
      const norm = (val - minVal) / range;
      return height - paddingY - norm * usableHeight;
    };

    // Draw Map Selection Region Shading (Authentic WinOLS Blue Bar)
    const mapStartX = mapStartIndex * stepX;
    const mapEndX = mapEndIndex * stepX;
    const mapWidth = Math.max(10, mapEndX - mapStartX);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(mapStartX, 0, mapWidth, height);

    // Bounding vertical markers for Map start and end
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(mapStartX, 0);
    ctx.lineTo(mapStartX, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(mapEndX, 0);
    ctx.lineTo(mapEndX, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label Map Boundaries
    ctx.fillStyle = '#06b6d4';
    ctx.font = '10px monospace';
    ctx.fillText(`START: ${currentMap.addressHex}`, mapStartX + 4, 20);
    ctx.fillText(`END: 0x${(currentMap.addressDec + currentMap.rows * currentMap.cols * 2).toString(16).toUpperCase()}`, mapEndX - 100, 20);

    // Draw Continuous Waveform Line
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';

    for (let i = 0; i < totalPoints; i++) {
      const x = i * stepX;
      const y = getY(words[i].val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill underneath the waveform with subtle glow
    ctx.lineTo((totalPoints - 1) * stepX, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
    fillGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    fillGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Draw each point on the waveform
    for (let i = 0; i < totalPoints; i++) {
      const x = i * stepX;
      const y = getY(words[i].val);
      const isInside = words[i].isInsideMap;

      ctx.beginPath();
      ctx.arc(x, y, isInside ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = isInside ? '#f59e0b' : '#64748b';
      ctx.fill();
    }

    // Draw User Cursor Line
    const safeCursorIdx = Math.max(0, Math.min(totalPoints - 1, cursorIndex));
    const cursorX = safeCursorIdx * stepX;
    const cursorY = getY(words[safeCursorIdx].val);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, height);
    ctx.stroke();

    // Crosshair dot
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [streamData, zoomLevel, cursorIndex, currentMap]);

  useEffect(() => {
    draw2D();
  }, [draw2D]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const totalPoints = streamData.words.length;
    const stepX = (canvas.clientWidth / (totalPoints - 1)) * zoomLevel;
    const clickedIdx = Math.round(clickX / stepX);
    if (clickedIdx >= 0 && clickedIdx < totalPoints) {
      setCursorIndex(clickedIdx);
    }
  };

  const activePoint = streamData.words[cursorIndex] || streamData.words[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* 2D Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-sm font-bold text-cyan-300">
            {lang === 'mizo' ? '2D Waveform Stream (Real ROM Memory)' : '2D Continuous Waveform (Real ROM Memory)'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            Hotkey: &apos;2&apos;
          </span>
        </div>

        {/* Zoom & Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-400">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="p-4 bg-[#060a12] relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-80 rounded-lg cursor-crosshair block"
        />
      </div>

      {/* 2D Footer Status Details */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
        {activePoint && (
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Cursor Offset:</span>
            <span className="text-cyan-400 font-bold">
              0x{activePoint.offset.toString(16).toUpperCase()}
            </span>
            <span className="text-slate-500">Value:</span>
            <span className="text-white font-bold">
              {activePoint.val} (0x{activePoint.val.toString(16).toUpperCase().padStart(4, '0')})
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activePoint.isInsideMap
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {activePoint.isInsideMap ? 'Inside Selected Map' : 'ROM Machine Code / Lead-in'}
            </span>
          </div>
        )}

        <div className="text-[11px] text-slate-500">
          {lang === 'mizo'
            ? 'Canvas-ah khian click la cursor sawn rawh • Waveform hi ROM raw bytes atanga ziah chhuah a ni'
            : 'Click on canvas to place cursor • Continuous 16-bit words rendered from literal ROM buffer'}
        </div>
      </div>
    </div>
  );
};
