import React, { useState, useMemo } from 'react';
import { EcuMapDefinition, Language } from '../types/winols';
import { Binary, ArrowLeftRight, Check, Search, MapPin, Database, ChevronLeft, ChevronRight } from 'lucide-react';

interface HexEditorProps {
  currentMap: EcuMapDefinition;
  onUpdateMapCell: (row: number, col: number, newValue: number) => void;
  lang: Language;
  rawBinaryBuffer: Uint8Array;
  originalBinaryBuffer?: Uint8Array;
  onUpdateRomBytes?: (offset: number, newBytes: number[]) => void;
}

export const HexEditor: React.FC<HexEditorProps> = ({
  currentMap,
  onUpdateMapCell,
  lang,
  rawBinaryBuffer,
  originalBinaryBuffer,
  onUpdateRomBytes,
}) => {
  const [editorScope, setEditorScope] = useState<'map' | 'full_rom'>('map');
  const [endianness, setEndianness] = useState<'HiLo' | 'LoHi'>('HiLo'); // HiLo (Motorola) vs LoHi (Intel)
  const [editingPos, setEditingPos] = useState<{ row: number; col: number } | null>(null);
  const [editingRomOffset, setEditingRomOffset] = useState<number | null>(null);
  const [tempHexInput, setTempHexInput] = useState<string>('');

  // Full ROM navigation state
  const [romOffset, setRomOffset] = useState<number>(() => {
    return Math.max(0, currentMap.addressDec - (currentMap.addressDec % 16));
  });
  const [jumpAddressInput, setJumpAddressInput] = useState<string>(currentMap.addressHex);

  const baseAddress = currentMap.addressDec;

  const handleStartMapEdit = (r: number, c: number, currentVal: number) => {
    setEditingPos({ row: r, col: c });
    setEditingRomOffset(null);
    setTempHexInput(currentVal.toString(16).toUpperCase().padStart(4, '0'));
  };

  const handleSaveMapEdit = (r: number, c: number) => {
    const parsed = parseInt(tempHexInput, 16);
    if (!isNaN(parsed)) {
      onUpdateMapCell(r, c, parsed);
    }
    setEditingPos(null);
  };

  const handleStartRomEdit = (offset: number, currentVal: number) => {
    setEditingRomOffset(offset);
    setEditingPos(null);
    setTempHexInput(currentVal.toString(16).toUpperCase().padStart(4, '0'));
  };

  const handleSaveRomEdit = (offset: number) => {
    const parsed = parseInt(tempHexInput, 16);
    if (!isNaN(parsed) && onUpdateRomBytes) {
      const highByte = (parsed >> 8) & 0xff;
      const lowByte = parsed & 0xff;
      if (endianness === 'HiLo') {
        onUpdateRomBytes(offset, [highByte, lowByte]);
      } else {
        onUpdateRomBytes(offset, [lowByte, highByte]);
      }
    }
    setEditingRomOffset(null);
  };

  // Format number based on endianness
  const formatWord = (val: number) => {
    let hex = Math.min(65535, Math.max(0, Math.round(val))).toString(16).toUpperCase().padStart(4, '0');
    if (endianness === 'LoHi') {
      hex = hex.slice(2, 4) + hex.slice(0, 2);
    }
    return hex;
  };

  // Jump to address in full ROM mode
  const handleJumpAddress = () => {
    const clean = jumpAddressInput.trim();
    const parsed = clean.startsWith('0x') || clean.startsWith('0X')
      ? parseInt(clean, 16)
      : parseInt(clean, 10);
    if (!isNaN(parsed) && parsed < rawBinaryBuffer.length) {
      const aligned = Math.max(0, parsed - (parsed % 16));
      setRomOffset(aligned);
    }
  };

  // Read authentic bytes from rawBinaryBuffer for the 16 lines (256 bytes)
  const romLines = useMemo(() => {
    const lines = [];
    const numLines = 16;
    const maxOffset = rawBinaryBuffer.length;

    for (let i = 0; i < numLines; i++) {
      const lineAddr = romOffset + i * 16;
      if (lineAddr >= maxOffset) break;

      const words = [];
      for (let w = 0; w < 8; w++) {
        const wordAddr = lineAddr + w * 2;
        if (wordAddr + 1 >= maxOffset) break;

        // Read literal bytes from rawBinaryBuffer
        const b0 = rawBinaryBuffer[wordAddr] ?? 0;
        const b1 = rawBinaryBuffer[wordAddr + 1] ?? 0;
        const val = endianness === 'HiLo' ? ((b0 << 8) | b1) : ((b1 << 8) | b0);

        // Check if modified compared to original binary buffer
        let isModified = false;
        let origVal = val;
        if (originalBinaryBuffer && wordAddr + 1 < originalBinaryBuffer.length) {
          const ob0 = originalBinaryBuffer[wordAddr];
          const ob1 = originalBinaryBuffer[wordAddr + 1];
          origVal = endianness === 'HiLo' ? ((ob0 << 8) | ob1) : ((ob1 << 8) | ob0);
          isModified = b0 !== ob0 || b1 !== ob1;
        }

        // Check if inside current map boundaries
        const isInsideMap =
          wordAddr >= currentMap.addressDec &&
          wordAddr < currentMap.addressDec + currentMap.rows * currentMap.cols * 2;

        words.push({
          addr: wordAddr,
          val,
          origVal,
          b0,
          b1,
          isModified,
          isInsideMap,
        });
      }
      lines.push({ lineAddr, words });
    }
    return lines;
  }, [romOffset, rawBinaryBuffer, originalBinaryBuffer, endianness, currentMap]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Hex Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-sm font-bold text-cyan-300">
            {lang === 'mizo' ? 'Raw Binary Hex Editor (Real ROM Buffer)' : 'Raw Binary Hex Editor (Real ROM Buffer)'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            Hotkey: &apos;H&apos;
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
            {rawBinaryBuffer.length.toLocaleString()} Bytes Loaded
          </span>
        </div>

        {/* Scope Selector: Map vs Full ROM */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => setEditorScope('map')}
              className={`px-2.5 py-1 rounded transition ${
                editorScope === 'map' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'mizo' ? 'Active Map Scope' : 'Active Map'}
            </button>
            <button
              onClick={() => setEditorScope('full_rom')}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                editorScope === 'full_rom' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3 h-3" />
              {lang === 'mizo' ? 'Full Flash ROM Stream' : 'Full ROM Stream'}
            </button>
          </div>

          {/* Endianness switch */}
          <button
            onClick={() => setEndianness((e) => (e === 'HiLo' ? 'LoHi' : 'HiLo'))}
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono rounded text-slate-200 transition"
            title="Toggle Motorola (HiLo) vs Intel (LoHi) byte order (Hotkey: M)"
          >
            <ArrowLeftRight className="w-3 h-3 text-cyan-400" />
            <span>{endianness}</span>
          </button>
        </div>
      </div>

      {/* Full ROM Navigation Bar (When full_rom scope is selected) */}
      {editorScope === 'full_rom' && (
        <div className="p-3 bg-[#0a0f1c] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">{lang === 'mizo' ? 'Offset Address-ah zuang rawh:' : 'Jump to Offset:'}</span>
            <input
              type="text"
              value={jumpAddressInput}
              onChange={(e) => setJumpAddressInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpAddress()}
              placeholder="e.g. 0x1E4280"
              className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-white font-bold"
            />
            <button
              onClick={handleJumpAddress}
              className="px-2.5 py-0.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded font-semibold"
            >
              Go
            </button>
          </div>

          {/* Quick jump bookmarks */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Bookmarks:</span>
            <button
              onClick={() => {
                setRomOffset(0x000000);
                setJumpAddressInput('0x000000');
              }}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Start (0x0000)
            </button>
            {rawBinaryBuffer.length >= 0x018000 && (
              <button
                onClick={() => {
                  setRomOffset(0x018000);
                  setJumpAddressInput('0x018000');
                }}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                EPK String (0x018000)
              </button>
            )}
            {rawBinaryBuffer.length >= 0x01F000 && (
              <button
                onClick={() => {
                  setRomOffset(0x01F000);
                  setJumpAddressInput('0x01F000');
                }}
                className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-600/50 text-purple-300 hover:bg-purple-900 font-bold"
                title="Jump to EEPROM area (VIN, Immo, Injector IMA codes)"
              >
                EEPROM / VIN (0x01F000)
              </button>
            )}
            {rawBinaryBuffer.length <= 65536 && (
              <>
                <button
                  onClick={() => {
                    setRomOffset(0x0100);
                    setJumpAddressInput('0x0100');
                  }}
                  className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-600/50 text-purple-300 hover:bg-purple-900 font-bold"
                  title="Jump to VIN location in EEPROM"
                >
                  VIN (0x0100)
                </button>
                <button
                  onClick={() => {
                    setRomOffset(0x0180);
                    setJumpAddressInput('0x0180');
                  }}
                  className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/50 text-amber-300 hover:bg-amber-900 font-bold"
                  title="Jump to Immobilizer PIN / Status"
                >
                  IMMO / PIN (0x0180)
                </button>
              </>
            )}
            <button
              onClick={() => {
                const aligned = Math.max(0, currentMap.addressDec - (currentMap.addressDec % 16));
                setRomOffset(Math.min(aligned, Math.max(0, rawBinaryBuffer.length - 16)));
                setJumpAddressInput(currentMap.addressHex);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 font-bold"
            >
              Active Map ({currentMap.addressHex})
            </button>
          </div>

          {/* Page step controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRomOffset((o) => Math.max(0, o - 256))}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              title="Previous 256 bytes"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-400 text-[10px]">
              0x{romOffset.toString(16).toUpperCase()} - 0x{Math.min(rawBinaryBuffer.length - 1, romOffset + 255).toString(16).toUpperCase()}
            </span>
            <button
              onClick={() => setRomOffset((o) => Math.min(Math.max(0, rawBinaryBuffer.length - 256), o + 256))}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              title="Next 256 bytes"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hex Table Grid */}
      <div className="p-4 overflow-x-auto font-mono text-xs">
        {editorScope === 'map' ? (
          /* Active Map Hex View */
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-left">
                <th className="py-1.5 px-3 font-semibold text-cyan-400">Offset</th>
                {Array.from({ length: currentMap.cols }).map((_, c) => (
                  <th key={c} className="py-1.5 px-2 text-center text-slate-400 font-semibold">
                    +{c.toString(16).toUpperCase().padStart(2, '0')}
                  </th>
                ))}
                <th className="py-1.5 px-3 text-slate-500 text-center">ASCII Dec</th>
              </tr>
            </thead>
            <tbody>
              {currentMap.data.map((row, r) => {
                const rowOffset = baseAddress + r * (currentMap.cols * 2);
                const rowHexOffset = '0x' + rowOffset.toString(16).toUpperCase().padStart(6, '0');

                return (
                  <tr key={r} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition">
                    <td className="py-2 px-3 text-cyan-500 font-semibold select-none">
                      {rowHexOffset}
                    </td>

                    {row.map((val, c) => {
                      const origVal = currentMap.originalData[r][c];
                      const isModified = val !== origVal;
                      const isEditing = editingPos?.row === r && editingPos?.col === c;

                      return (
                        <td key={c} className="py-1 px-1.5 text-center">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                maxLength={4}
                                value={tempHexInput}
                                onChange={(e) => setTempHexInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveMapEdit(r, c);
                                  if (e.key === 'Escape') setEditingPos(null);
                                }}
                                autoFocus
                                className="w-16 px-1 py-0.5 bg-cyan-950 border border-cyan-400 text-cyan-200 text-center font-bold rounded focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveMapEdit(r, c)}
                                className="p-0.5 text-emerald-400 hover:text-white"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartMapEdit(r, c, val)}
                              title={`Original: 0x${origVal.toString(16).toUpperCase()} (${origVal}) | Current: 0x${val.toString(16).toUpperCase()} (${val})`}
                              className={`w-full px-2 py-1 rounded transition group relative ${
                                isModified
                                  ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-600/60 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                                  : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-300'
                              }`}
                            >
                              <span>{formatWord(val)}</span>
                              {isModified && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                              )}
                            </button>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2 px-3 text-slate-500 text-center tracking-widest select-none">
                      {row
                        .map((val) => {
                          const lowByte = val & 0xff;
                          return lowByte >= 32 && lowByte <= 126 ? String.fromCharCode(lowByte) : '·';
                        })
                        .join('')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Full ROM Flash Stream View (Reads literal rawBinaryBuffer) */
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-left">
                <th className="py-1.5 px-3 font-semibold text-cyan-400">Address</th>
                {Array.from({ length: 8 }).map((_, w) => (
                  <th key={w} className="py-1.5 px-2 text-center text-slate-400 font-semibold">
                    +{(w * 2).toString(16).toUpperCase().padStart(2, '0')}
                  </th>
                ))}
                <th className="py-1.5 px-3 text-slate-500 text-center">ASCII String Decode</th>
              </tr>
            </thead>
            <tbody>
              {romLines.map((line, idx) => {
                const hexAddr = '0x' + line.lineAddr.toString(16).toUpperCase().padStart(6, '0');

                return (
                  <tr key={idx} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition">
                    <td className="py-1 px-3 text-cyan-500 font-semibold select-none">
                      {hexAddr}
                    </td>

                    {line.words.map((wObj, wIdx) => {
                      const isMod = wObj.isModified;
                      const isInside = wObj.isInsideMap;
                      const isEditing = editingRomOffset === wObj.addr;

                      return (
                        <td
                          key={wIdx}
                          className="py-1 px-1.5 text-center transition"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                maxLength={4}
                                value={tempHexInput}
                                onChange={(e) => setTempHexInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRomEdit(wObj.addr);
                                  if (e.key === 'Escape') setEditingRomOffset(null);
                                }}
                                autoFocus
                                className="w-16 px-1 py-0.5 bg-cyan-950 border border-cyan-400 text-cyan-200 text-center font-bold rounded focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveRomEdit(wObj.addr)}
                                className="p-0.5 text-emerald-400 hover:text-white"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartRomEdit(wObj.addr, wObj.val)}
                              className={`w-full px-1.5 py-0.5 rounded transition ${
                                isMod
                                  ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-600/60'
                                  : isInside
                                  ? 'bg-cyan-950/40 text-cyan-300 font-semibold border border-cyan-800/40'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                              title={`Offset: 0x${wObj.addr.toString(16).toUpperCase()} | Value: 0x${wObj.val.toString(16).toUpperCase()} (${wObj.val})`}
                            >
                              {formatWord(wObj.val)}
                            </button>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-1 px-3 text-slate-300 text-center tracking-wider select-none text-[11px]">
                      {line.words
                        .map((wObj) => {
                          const c1 = wObj.b0 >= 32 && wObj.b0 <= 126 ? String.fromCharCode(wObj.b0) : '.';
                          const c2 = wObj.b1 >= 32 && wObj.b1 <= 126 ? String.fromCharCode(wObj.b1) : '.';
                          return c1 + c2;
                        })
                        .join('')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Hex Status Footer */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>
            {lang === 'mizo'
              ? 'Rawng eng/amber hi raw binary buffer-a modified bytes a ni. Hmet la, direct-in hex thlak rawh.'
              : 'Amber highlight marks modified memory cells in raw binary buffer. Click any word to edit direct byte values.'}
          </span>
        </div>
        <div className="text-cyan-400 text-[11px]">
          {editorScope === 'full_rom'
            ? (lang === 'mizo' ? `Raw ROM Buffer: ${rawBinaryBuffer.length.toLocaleString()} Bytes` : `Raw ROM Buffer: ${rawBinaryBuffer.length.toLocaleString()} Bytes`)
            : (lang === 'mizo' ? 'Active Map Scope: ' + currentMap.addressHex : 'Active Map Scope: ' + currentMap.addressHex)}
        </div>
      </div>
    </div>
  );
};
