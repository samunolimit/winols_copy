import React, { useState } from 'react';
import { EcuMapDefinition, Language } from '../types/winols';
import { Plus, X, Layers, Binary } from 'lucide-react';

interface NewMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMap: (map: EcuMapDefinition) => void;
  lang: Language;
  rawBinaryBuffer?: Uint8Array;
  endianness?: 'HiLo' | 'LoHi';
}

export const NewMapModal: React.FC<NewMapModalProps> = ({
  isOpen,
  onClose,
  onCreateMap,
  lang,
  rawBinaryBuffer,
  endianness = 'HiLo',
}) => {
  const [name, setName] = useState<string>('Custom Calibration Map');
  const [acronym, setAcronym] = useState<string>('KF_CUSTOM');
  const [category, setCategory] = useState<
    'Boost & Air' | 'Fuel & Injection' | 'Torque Management' | 'Emissions' | 'Custom'
  >('Custom');
  const [addressHex, setAddressHex] = useState<string>('0x1E6000');
  const [rows, setRows] = useState<number>(8);
  const [cols, setCols] = useState<number>(8);
  const [xAxisName, setXAxisName] = useState<string>('Engine Speed');
  const [xAxisUnit, setXAxisUnit] = useState<string>('RPM');
  const [yAxisName, setYAxisName] = useState<string>('Engine Load');
  const [yAxisUnit, setYAxisUnit] = useState<string>('%');
  const [zUnit, setZUnit] = useState<string>('val');
  const [readFromRom, setReadFromRom] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHex = addressHex.trim();
    const addrDec = cleanHex.startsWith('0x') || cleanHex.startsWith('0X')
      ? parseInt(cleanHex, 16)
      : parseInt(cleanHex, 10) || 0;

    // Generate or populate matrix directly from raw binary memory buffer
    const matrix: number[][] = [];
    const bufLen = rawBinaryBuffer?.length || 0;

    for (let r = 0; r < rows; r++) {
      const rowArr: number[] = [];
      for (let c = 0; c < cols; c++) {
        const byteOffset = addrDec + (r * cols + c) * 2;
        if (readFromRom && rawBinaryBuffer && byteOffset + 1 < bufLen) {
          const b0 = rawBinaryBuffer[byteOffset];
          const b1 = rawBinaryBuffer[byteOffset + 1];
          const val = endianness === 'HiLo' ? ((b0 << 8) | b1) : ((b1 << 8) | b0);
          rowArr.push(val);
        } else {
          // Fallback smooth starter shape
          rowArr.push(Math.round(500 + r * 150 + c * 80 + Math.sin((r + c) * 0.5) * 50));
        }
      }
      matrix.push(rowArr);
    }

    const newMap: EcuMapDefinition = {
      id: `custom_${Date.now()}`,
      name,
      germanAcronym: acronym,
      category,
      descriptionMizo: `Address ${addressHex}-a raw binary buffer atanga chhiar chhuah map a ni.`,
      descriptionEng: `Custom map populated directly from ROM address ${addressHex}.`,
      addressHex: '0x' + addrDec.toString(16).toUpperCase(),
      addressDec: addrDec,
      rows,
      cols,
      xAxisName,
      xAxisUnit,
      xAxisValues: Array.from({ length: cols }, (_, i) => (i + 1) * 500),
      yAxisName,
      yAxisUnit,
      yAxisValues: Array.from({ length: rows }, (_, i) => (i + 1) * 10),
      zUnit,
      factor: 1,
      offset: 0,
      data: matrix,
      originalData: matrix.map((row) => [...row]),
      isUserCreated: true,
    };

    onCreateMap(newMap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#0c1220] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="p-4 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm text-white">
              {lang === 'mizo' ? 'Map Thar Define Rawh (Hotkey K)' : 'Create New Map (Hotkey K)'}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Map Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Acronym / German Code:</label>
              <input
                type="text"
                value={acronym}
                onChange={(e) => setAcronym(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Boost & Air">Boost & Air</option>
                <option value="Fuel & Injection">Fuel & Injection</option>
                <option value="Torque Management">Torque Management</option>
                <option value="Emissions">Emissions</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Address Hex:</label>
              <input
                type="text"
                value={addressHex}
                onChange={(e) => setAddressHex(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Rows (Y):</label>
              <input
                type="number"
                min={2}
                max={16}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Cols (X):</label>
              <input
                type="number"
                min={2}
                max={16}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Option: Read literal bytes from loaded ROM buffer */}
          {rawBinaryBuffer && (
            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-cyan-200 font-bold text-[11px]">
                    {lang === 'mizo' ? 'ROM Memory Atangin Direct-in Chhiar Rawh' : 'Read Live Bytes From Loaded ROM'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {endianness} 16-bit word format
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={readFromRom}
                onChange={(e) => setReadFromRom(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">X-Axis (Name / Unit):</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={xAxisName}
                  onChange={(e) => setXAxisName(e.target.value)}
                  className="w-2/3 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                />
                <input
                  type="text"
                  value={xAxisUnit}
                  onChange={(e) => setXAxisUnit(e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs text-center"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Z-Data Unit:</label>
              <input
                type="text"
                value={zUnit}
                onChange={(e) => setZUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              {lang === 'mizo' ? 'Bansan' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition shadow-lg shadow-cyan-600/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'mizo' ? 'Map Siam Rawh' : 'Create Map'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
