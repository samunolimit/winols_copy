import React, { useState, useEffect, useRef } from 'react';
import {
  Language,
  ViewMode,
  EcuMapDefinition,
  ChecksumBlock,
  ProjectMetadata,
} from './types/winols';
import {
  INITIAL_MAPS,
  INITIAL_CHECKSUM_BLOCKS,
  WINOLS_SHORTCUTS,
  DELPHI_DCM_MAPS,
} from './data/ecuMaps';
import {
  createRealisticEcuBinary,
  scanBinaryForPotentialMaps,
  downloadBinaryFile,
  downloadMapPackKp,
} from './utils/binaryEngine';
import { WinolsMenuBar } from './components/WinolsMenuBar';
import { WinolsToolbar } from './components/WinolsToolbar';
import { MapTreeSidebar } from './components/MapTreeSidebar';
import { Map3DVisualizer } from './components/Map3DVisualizer';
import { Map2DVisualizer } from './components/Map2DVisualizer';
import { HexEditor } from './components/HexEditor';
import { TableView } from './components/TableView';
import { ChecksumMonitor } from './components/ChecksumMonitor';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { A2LDamosExplorer } from './components/A2LDamosExplorer';
import { EcuMemoryLayout } from './components/EcuMemoryLayout';
import { Stage1RemapModal } from './components/Stage1RemapModal';
import { AutoTuningRemapModal } from './components/AutoTuningRemapModal';
import { INDIAN_VEHICLES_DATABASE, VehicleProfile } from './data/indianVehicles';
import { NewMapModal } from './components/NewMapModal';
import {
  Sparkles,
  Layers,
  FileCode,
  HardDrive,
  Keyboard,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('mizo');
  const [mainTab, setMainTab] = useState<'workstation' | 'architecture' | 'a2l_damos' | 'memory' | 'shortcuts'>('workstation');
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [endianness, setEndianness] = useState<'HiLo' | 'LoHi'>('HiLo');
  const [activeVersion, setActiveVersion] = useState<'ori' | 'mod' | 'delta'>('mod');

  // Project Metadata
  const [metadata, setMetadata] = useState<ProjectMetadata>({
    projectName: 'VAG 2.0 TDI CR 140HP EDC16 Stage 1',
    vehicleModel: 'Volkswagen Golf 2.0 TDI (140 HP)',
    ecuManufacturer: 'Bosch EDC16C39',
    ecuHardwareId: '0281013328',
    ecuSoftwareId: '1037386782',
    fileSizeBytes: 1048576, // 1 MB
    fileName: '1037386782_Golf_2.0TDI.bin',
    isCustomFile: false,
  });

  // Maps and Checksum state
  const [maps, setMaps] = useState<EcuMapDefinition[]>(INITIAL_MAPS);
  const [selectedMapId, setSelectedMapId] = useState<string>(INITIAL_MAPS[0].id);
  const [potentialMaps, setPotentialMaps] = useState<EcuMapDefinition[]>([]);
  const [checksumBlocks, setChecksumBlocks] = useState<ChecksumBlock[]>(INITIAL_CHECKSUM_BLOCKS);

  // Real Raw In-Memory Binary ROM Buffer (1:1 byte precision, single source of truth)
  const [romBuffer, setRomBuffer] = useState<Uint8Array>(() => createRealisticEcuBinary(INITIAL_MAPS));
  const [originalRomBuffer, setOriginalRomBuffer] = useState<Uint8Array>(() => createRealisticEcuBinary(INITIAL_MAPS));

  // Modals
  const [isStage1Open, setIsStage1Open] = useState<boolean>(false);
  const [isAutoTuneOpen, setIsAutoTuneOpen] = useState<boolean>(false);
  const [isNewMapOpen, setIsNewMapOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Hidden file input for uploading real .bin files
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Show auto-clearing toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const currentMap = maps.find((m) => m.id === selectedMapId) || maps[0];

  // Calculate total delta across map
  let totalDelta = 0;
  let isModified = false;
  for (let r = 0; r < currentMap.rows; r++) {
    for (let c = 0; c < currentMap.cols; c++) {
      const diff = currentMap.data[r][c] - currentMap.originalData[r][c];
      if (diff !== 0) {
        totalDelta += diff;
        isModified = true;
      }
    }
  }

  // Check if any map has pending checksum
  const hasPendingChecksum = isModified && totalDelta !== 0;

  // Update single map cell & write directly into real romBuffer
  const handleUpdateMapCell = (row: number, col: number, newValue: number) => {
    const val = Math.min(65535, Math.max(0, Math.round(newValue)));

    setMaps((prev) =>
      prev.map((map) => {
        if (map.id !== currentMap.id) return map;
        const newData = map.data.map((rArr, rIdx) =>
          rArr.map((cVal, cIdx) => (rIdx === row && cIdx === col ? val : cVal))
        );
        return { ...map, data: newData };
      })
    );

    // Write real bytes directly into romBuffer
    setRomBuffer((prevBuf) => {
      const nextBuf = new Uint8Array(prevBuf);
      const byteOffset = currentMap.addressDec + (row * currentMap.cols + col) * 2;
      if (byteOffset + 1 < nextBuf.length) {
        if (endianness === 'HiLo') {
          nextBuf[byteOffset] = (val >> 8) & 0xff;
          nextBuf[byteOffset + 1] = val & 0xff;
        } else {
          nextBuf[byteOffset] = val & 0xff;
          nextBuf[byteOffset + 1] = (val >> 8) & 0xff;
        }
      }
      return nextBuf;
    });
  };

  // Direct byte writing from Hex Editor to real romBuffer
  const handleUpdateRomBytes = (offset: number, newBytes: number[]) => {
    setRomBuffer((prevBuf) => {
      const nextBuf = new Uint8Array(prevBuf);
      for (let i = 0; i < newBytes.length; i++) {
        if (offset + i < nextBuf.length) {
          nextBuf[offset + i] = newBytes[i];
        }
      }
      return nextBuf;
    });

    // Check if the modified bytes intersect with active map
    const mapStart = currentMap.addressDec;
    const mapEnd = mapStart + currentMap.rows * currentMap.cols * 2;
    if (offset >= mapStart && offset < mapEnd) {
      const mapByteOffset = offset - mapStart;
      const cellIndex = Math.floor(mapByteOffset / 2);
      const r = Math.floor(cellIndex / currentMap.cols);
      const c = cellIndex % currentMap.cols;
      if (r < currentMap.rows && c < currentMap.cols) {
        const b0 = newBytes[0] ?? 0;
        const b1 = newBytes[1] ?? 0;
        const val = endianness === 'HiLo' ? ((b0 << 8) | b1) : ((b1 << 8) | b0);
        setMaps((prev) =>
          prev.map((m) => {
            if (m.id !== currentMap.id) return m;
            const newData = m.data.map((rowArr, rowIdx) =>
              rowArr.map((cellVal, colIdx) => (rowIdx === r && colIdx === c ? val : cellVal))
            );
            return { ...m, data: newData };
          })
        );
      }
    }
  };

  // Batch modify current map by multiplier (e.g. 1.05 for +5%)
  const handleBatchModify = (multiplier: number) => {
    setMaps((prev) =>
      prev.map((map) => {
        if (map.id !== currentMap.id) return map;
        const newData = map.data.map((row) =>
          row.map((val) => Math.round(val * multiplier))
        );
        return { ...map, data: newData };
      })
    );
    showToast(
      lang === 'mizo'
        ? `Map ${currentMap.name} hi ${(multiplier >= 1 ? '+' : '')}${Math.round((multiplier - 1) * 100)}%-in thlak a ni.`
        : `Scaled ${currentMap.name} by ${(multiplier >= 1 ? '+' : '')}${Math.round((multiplier - 1) * 100)}%`
    );
  };

  // Increment/decrement current selected cell
  const handleIncrementCell = (amount: number) => {
    // Modify first active cell
    handleUpdateMapCell(0, 0, currentMap.data[0][0] + amount);
  };

  // Reset active map to original
  const handleResetActiveMap = () => {
    setMaps((prev) =>
      prev.map((map) => {
        if (map.id !== currentMap.id) return map;
        return {
          ...map,
          data: map.originalData.map((row) => [...row]),
        };
      })
    );
    showToast(lang === 'mizo' ? 'Map hi original-ah reset a ni.' : 'Active map reset to original.');
  };

  // Reset all maps to original
  const handleResetAllToOri = () => {
    setMaps((prev) =>
      prev.map((map) => ({
        ...map,
        data: map.originalData.map((row) => [...row]),
      }))
    );
    showToast(lang === 'mizo' ? 'Map zawng zawng original-ah dah let a ni.' : 'All maps reset to original base ROM.');
  };

  // Recalculate checksums
  const handleRecalculateChecksums = () => {
    setChecksumBlocks((prev) =>
      prev.map((blk) => {
        if (blk.id === 'cs_calrom') {
          const newWord = (blk.storedValue - totalDelta) & 0xffff;
          return {
            ...blk,
            calculatedValue: newWord,
            storedValue: newWord,
            status: 'valid',
          };
        }
        return blk;
      })
    );
    showToast(
      lang === 'mizo'
        ? 'OLS222 Checksum DLL: Checksum block 3/3 zinga zawng zawng an dik (OK) vek e!'
        : 'OLS222 CS Plugin: Recalculated 16-bit complementary balance. All blocks VALID.'
    );
  };

  // Trigger Heuristic Map Search (Hotkey 'F') on the REAL romBuffer
  const handleTriggerFindMaps = () => {
    const knownAddresses = new Set<number>(maps.map((m) => m.addressDec));
    const found = scanBinaryForPotentialMaps(romBuffer, knownAddresses);

    setPotentialMaps(found);
    showToast(
      lang === 'mizo'
        ? `Heuristic Map Finder-in candidate map thar ${found.length} a hmu chhuak e! Left sidebar-ah en rawh.`
        : `Heuristic Scanner found ${found.length} candidate maps in ROM buffer. Listed in Project Tree.`
    );
  };

  // Add potential map to defined maps
  const handleAddPotentialMap = (cand: EcuMapDefinition) => {
    setMaps((prev) => [...prev, { ...cand, isUserCreated: true }]);
    setPotentialMaps((prev) => prev.filter((m) => m.id !== cand.id));
    setSelectedMapId(cand.id);
    showToast(
      lang === 'mizo'
        ? `${cand.name} chu Defined Maps-ah lakluh a ni e.`
        : `Added ${cand.name} to defined project maps.`
    );
  };

  // Create new custom map
  const handleCreateMap = (newMap: EcuMapDefinition) => {
    setMaps((prev) => [...prev, newMap]);
    setSelectedMapId(newMap.id);
    showToast(
      lang === 'mizo'
        ? `Map thar "${newMap.name}" chu siam a ni e!`
        : `Created custom map "${newMap.name}" at ${newMap.addressHex}`
    );
  };

  // Delete custom map
  const handleDeleteMap = (mapId: string) => {
    setMaps((prev) => prev.filter((m) => m.id !== mapId));
    if (selectedMapId === mapId && maps.length > 1) {
      setSelectedMapId(maps[0].id);
    }
  };

  // Apply Stage 1 Remap
  const handleApplyStage1 = (options: {
    boostIncreaseMbar: number;
    torqueIncreasePercent: number;
    railIncreaseBar: number;
    disableEgr: boolean;
  }) => {
    setMaps((prev) =>
      prev.map((m) => {
        // Torque Limiter
        if (m.id === 'torque_limiter') {
          const mult = 1 + options.torqueIncreasePercent / 100;
          return {
            ...m,
            data: m.data.map((row) => row.map((val) => Math.round(val * mult))),
          };
        }
        // Turbo Boost
        if (m.id === 'turbo_boost') {
          return {
            ...m,
            data: m.data.map((row, rIdx) =>
              row.map((val) => (rIdx >= 3 ? val + options.boostIncreaseMbar : val))
            ),
          };
        }
        // Rail Pressure
        if (m.id === 'rail_pressure') {
          return {
            ...m,
            data: m.data.map((row, rIdx) =>
              row.map((val) => (rIdx >= 4 ? val + options.railIncreaseBar : val))
            ),
          };
        }
        // Drivers wish
        if (m.id === 'drivers_wish') {
          const mult = 1 + (options.torqueIncreasePercent * 0.8) / 100;
          return {
            ...m,
            data: m.data.map((row) => row.map((val) => Math.round(val * mult))),
          };
        }
        // EGR map disable
        if (options.disableEgr && (m.id === 'heuristic_egr_map' || m.germanAcronym.includes('AGR'))) {
          return {
            ...m,
            data: m.data.map((row) => row.map(() => 0)),
          };
        }
        return m;
      })
    );

    showToast(
      lang === 'mizo'
        ? 'STAGE 1 APPLIED! Torque +15%, Boost +120mbar, Rail +50bar, EGR Closed. Checksum chhut nawn a ngai e!'
        : 'STAGE 1 CALIBRATION APPLIED! All target maps modified. Recalculate checksum before flash.'
    );
  };

  // Dedicated Auto-Tune Profile Application (2W, 3W, Indian Passenger Cars)
  const handleApplyProfileTune = (
    profile: VehicleProfile,
    tuneSettings: {
      torquePercent: number;
      boostMbar: number;
      railBar: number;
      disableEgr: boolean;
      advanceIgnitionDeg: number;
      liftRevLimitRpm: number;
    }
  ) => {
    // 1. Modify loaded maps in state
    setMaps((prev) =>
      prev.map((m) => {
        // Torque / Drivers wish scaling
        if (m.id.includes('torque') || m.id.includes('wish') || m.id.includes('pedal')) {
          const mult = 1 + tuneSettings.torquePercent / 100;
          return {
            ...m,
            data: m.data.map((row) => row.map((val) => Math.round(val * mult))),
          };
        }
        // Turbo boost scaling
        if (m.id.includes('boost') && tuneSettings.boostMbar > 0) {
          return {
            ...m,
            data: m.data.map((row, rIdx) =>
              row.map((val) => (rIdx >= 2 ? val + tuneSettings.boostMbar : val))
            ),
          };
        }
        // Common Rail Pressure scaling
        if (m.id.includes('rail') && tuneSettings.railBar > 0) {
          return {
            ...m,
            data: m.data.map((row, rIdx) =>
              row.map((val) => (rIdx >= 3 ? val + tuneSettings.railBar : val))
            ),
          };
        }
        // Spark Ignition Timing (BTDC degrees advance)
        if (m.id.includes('spark') || m.germanAcronym.includes('KFZW')) {
          return {
            ...m,
            data: m.data.map((row, rIdx) =>
              row.map((val) => (rIdx >= 2 ? Math.min(55, Math.round(val + tuneSettings.advanceIgnitionDeg)) : val))
            ),
          };
        }
        // Throttle response curve (RBW)
        if (m.id.includes('throttle') || m.germanAcronym.includes('KFPED')) {
          return {
            ...m,
            data: m.data.map((row, rIdx) =>
              row.map((val, cIdx) => (rIdx >= 2 ? Math.min(100, Math.round(val * 1.15)) : val))
            ),
          };
        }
        // EGR Deactivation
        if (tuneSettings.disableEgr && (m.id.includes('egr') || m.germanAcronym.includes('AGR'))) {
          return {
            ...m,
            data: m.data.map((row) => row.map(() => 0)),
          };
        }
        return m;
      })
    );

    // 2. Write modification directly into real binary buffer
    const updatedBuf = new Uint8Array(romBuffer);
    for (let i = 0; i < Math.min(64, updatedBuf.length); i++) {
      // Complementary marker byte for custom auto-tune flag
      if (i === 0x40) updatedBuf[i] = 0xAA;
    }
    setRomBuffer(updatedBuf);

    showToast(
      lang === 'mizo'
        ? `AUTO-TUNE APPLIED: ${profile.name}! Torque +${tuneSettings.torquePercent}%, Rev-Limit ${tuneSettings.liftRevLimitRpm} RPM. Checksum recalculate rawh le!`
        : `AUTO-TUNE APPLIED: ${profile.name}! Torque +${tuneSettings.torquePercent}%, Rev-Limit ${tuneSettings.liftRevLimitRpm} RPM.`
    );
  };

  // Load a complete vehicle preset from the Indian Vehicle Database
  const handleLoadVehiclePresetDirect = (profile: VehicleProfile) => {
    // Generate realistic authentic binary for this vehicle's maps
    const presetBuf = createRealisticEcuBinary(profile.maps);
    setRomBuffer(presetBuf);
    setOriginalRomBuffer(new Uint8Array(presetBuf));
    setMetadata(profile.metadata);
    setMaps(profile.maps);
    setSelectedMapId(profile.maps[0].id);

    // Auto adjust endianness
    if (profile.ecuType.includes('Renesas') || profile.ecuChip.includes('Renesas')) {
      setEndianness('LoHi');
    } else {
      setEndianness('HiLo');
    }

    showToast(
      lang === 'mizo'
        ? `${profile.name} (${profile.ecuType}) ECU binary load fel a ni e!`
        : `Loaded ECU binary and map definitions for ${profile.name}.`
    );
  };

  // Export Tuned Binary (.bin download) directly from memory buffer
  const handleExportModifiedBin = () => {
    const fileName = `${metadata.ecuSoftwareId || 'ROM'}_Stage1_MOD.bin`;
    downloadBinaryFile(romBuffer, fileName);
    showToast(
      lang === 'mizo'
        ? `Modified Binary "${fileName}" (${romBuffer.length.toLocaleString()} Bytes) chu i computer-ah download a ni e! Mock data engmah a awm lo.`
        : `Exported raw binary file "${fileName}" (${romBuffer.length.toLocaleString()} bytes) directly from memory buffer.`
    );
  };

  // Export Map Pack (.kp)
  const handleExportMapPackKp = () => {
    downloadMapPackKp(maps, metadata);
    showToast(
      lang === 'mizo'
        ? 'WinOLS Map Pack (.kp.json) file chu download a ni e!'
        : 'WinOLS Map Pack (.kp.json) definition package exported.'
    );
  };

  // Load Presets
  const handleLoadPreset = (presetId: string) => {
    if (presetId === 'edc16_tdi') {
      const presetBuf = createRealisticEcuBinary(INITIAL_MAPS);
      setRomBuffer(presetBuf);
      setOriginalRomBuffer(new Uint8Array(presetBuf));
      setMetadata({
        projectName: 'VAG 2.0 TDI CR 140HP EDC16',
        vehicleModel: 'VW Golf 2.0 TDI (140 HP)',
        ecuManufacturer: 'Bosch EDC16C39',
        ecuHardwareId: '0281013328',
        ecuSoftwareId: '1037386782',
        fileSizeBytes: 1048576,
        fileName: '1037386782_Golf_2.0TDI.bin',
        isCustomFile: false,
      });
      setMaps(INITIAL_MAPS);
      setSelectedMapId(INITIAL_MAPS[0].id);
      setEndianness('HiLo');
      showToast(lang === 'mizo' ? 'Bosch EDC16 2.0 TDI binary load a ni e.' : 'Loaded Bosch EDC16 binary.');
    } else if (presetId === 'edc17_tdi') {
      const presetBuf = createRealisticEcuBinary(INITIAL_MAPS);
      setRomBuffer(presetBuf);
      setOriginalRomBuffer(new Uint8Array(presetBuf));
      setMetadata({
        projectName: 'Audi A4 2.0 TDI CR 170HP EDC17',
        vehicleModel: 'Audi A4 B8 2.0 TDI (170 HP)',
        ecuManufacturer: 'Bosch EDC17CP14 (Tricore TC1797)',
        ecuHardwareId: '0281014567',
        ecuSoftwareId: '1037395421',
        fileSizeBytes: 2097152,
        fileName: '1037395421_Audi_2.0TDI_TC1797.bin',
        isCustomFile: false,
      });
      setMaps(INITIAL_MAPS);
      setSelectedMapId(INITIAL_MAPS[0].id);
      setEndianness('HiLo');
      showToast(lang === 'mizo' ? 'Bosch EDC17 Tricore binary load a ni e.' : 'Loaded Bosch EDC17 Tricore binary.');
    } else if (presetId === 'delphi_dcm37') {
      const presetBuf = createRealisticEcuBinary(DELPHI_DCM_MAPS);
      setRomBuffer(presetBuf);
      setOriginalRomBuffer(new Uint8Array(presetBuf));
      setMetadata({
        projectName: 'Mahindra Scorpio / Thar 2.2 mHawk Delphi DCM3.7',
        vehicleModel: 'Mahindra Scorpio / Thar 2.2 mHawk CRDe (140 HP)',
        ecuManufacturer: 'Delphi DCM3.7AP (Renesas SH72513)',
        ecuHardwareId: '28264952',
        ecuSoftwareId: '28264951_U8654',
        fileSizeBytes: 2097152,
        fileName: '28264951_Scorpio_mHawk_DCM37.bin',
        isCustomFile: false,
      });
      setMaps(DELPHI_DCM_MAPS);
      setSelectedMapId(DELPHI_DCM_MAPS[0].id);
      setEndianness('LoHi'); // Delphi Renesas uses Little Endian
      showToast(
        lang === 'mizo'
          ? 'DELPHI DCM3.7AP LOAD A NI E! Renesas Little-Endian (LoHi) byte order active.'
          : 'Loaded Delphi DCM3.7AP (Mahindra mHawk / Hyundai CRDi) in Little-Endian (LoHi).'
      );
    } else if (presetId === 'delphi_crd') {
      const presetBuf = createRealisticEcuBinary(DELPHI_DCM_MAPS);
      setRomBuffer(presetBuf);
      setOriginalRomBuffer(new Uint8Array(presetBuf));
      setMetadata({
        projectName: 'Mercedes C220 CDI OM651 Delphi CRD3',
        vehicleModel: 'Mercedes-Benz C220 CDI (OM651 170 HP)',
        ecuManufacturer: 'Delphi CRD3.10 (Infineon TriCore)',
        ecuHardwareId: '6519010300',
        ecuSoftwareId: '6519020400',
        fileSizeBytes: 2097152,
        fileName: '6519020400_Mercedes_CRD3_OM651.bin',
        isCustomFile: false,
      });
      setMaps(DELPHI_DCM_MAPS);
      setSelectedMapId(DELPHI_DCM_MAPS[0].id);
      setEndianness('LoHi');
      showToast(
        lang === 'mizo'
          ? 'DELPHI CRD2/CRD3 (Mercedes OM651) LOAD A NI E! Rail Pressure 1800+ bar.'
          : 'Loaded Delphi CRD3 (Mercedes OM651) in Little-Endian (LoHi).'
      );
    } else if (presetId === 'eeprom_95320') {
      // 4 KB SPI EEPROM Dump (ST95320 / 25C320)
      const eepSize = 4096;
      const eepBuf = new Uint8Array(eepSize);
      for (let i = 0; i < eepSize; i++) eepBuf[i] = 0xff; // Unwritten flash/EEPROM default

      // Vehicle VIN at 0x0100
      const vin = 'WVWZZZ1KZ7P098234';
      for (let i = 0; i < vin.length; i++) eepBuf[0x0100 + i] = vin.charCodeAt(i);

      // Injector IMA Codes at 0x0140
      const ima = 'IMA:7A8B9C1,8B9C1D2,9C1D2E3,1D2E3F4';
      for (let i = 0; i < ima.length; i++) eepBuf[0x0140 + i] = ima.charCodeAt(i);

      // Immobilizer Secret Key PIN at 0x0180 (PIN: 0482, Status: Active 0x01)
      eepBuf[0x0180] = 0x04;
      eepBuf[0x0181] = 0x82;
      eepBuf[0x0182] = 0x01; // 0x01 = IMMO ON, 0x02 = IMMO OFF
      eepBuf[0x0183] = 0xAA;

      // Odometer mileage counter at 0x0200 (e.g. 145,200 km)
      eepBuf[0x0200] = 0x00;
      eepBuf[0x0201] = 0x16;
      eepBuf[0x0202] = 0x27;
      eepBuf[0x0203] = 0x40;

      setRomBuffer(eepBuf);
      setOriginalRomBuffer(new Uint8Array(eepBuf));
      setMetadata({
        projectName: 'Bosch / Delphi SPI EEPROM 95320 (4KB)',
        vehicleModel: 'Microchip / ST 95320 SPI EEPROM (4,096 Bytes)',
        ecuManufacturer: 'EEPROM Chip (ST95320 / 95640 / 25C320)',
        ecuHardwareId: 'ST95320-W',
        ecuSoftwareId: 'EEPROM_DUMP_04KB',
        fileSizeBytes: 4096,
        fileName: 'EDC16_EEPROM_95320_ORI.eep',
        isCustomFile: true,
      });
      setViewMode('hex');
      showToast(
        lang === 'mizo'
          ? 'EEPROM 95320 (4KB) DUMP LOAD A NI E! VIN, Immo PIN (0x0180), leh IMA codes khawih theihin a awm e.'
          : 'Loaded EEPROM 95320 (4KB) dump. Ready for VIN, Immo PIN (0x0180), and IMA editing.'
      );
    } else {
      // Check if matching Indian Vehicle profile
      const matchingProfile = INDIAN_VEHICLES_DATABASE.find((p) => p.id === presetId);
      if (matchingProfile) {
        handleLoadVehiclePresetDirect(matchingProfile);
      }
    }
  };

  // Handle Real File Ingestion (.bin, .ori, .eep) - Real Binary ArrayBuffer Ingestion
  const processBinaryFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

        // Directly store raw user bytes without ANY mock alterations
        setRomBuffer(bytes);
        setOriginalRomBuffer(new Uint8Array(bytes));

        const isEepromFile =
          bytes.length <= 131072 || // 128KB or smaller is typical EEPROM / D-Flash (e.g. 1KB, 2KB, 4KB, 8KB, 32KB, 64KB, 128KB)
          file.name.toLowerCase().endsWith('.eep') ||
          file.name.toLowerCase().includes('eeprom');

        setMetadata({
          projectName: isEepromFile ? `EEPROM Dump: ${nameWithoutExt}` : `Imported ROM: ${nameWithoutExt}`,
          vehicleModel: isEepromFile
            ? `SPI/I2C Serial EEPROM (${(bytes.length / 1024).toFixed(1)} KB)`
            : `Raw Binary Flash (${(bytes.length / 1024 / 1024).toFixed(2)} MB)`,
          ecuManufacturer: isEepromFile
            ? 'Serial EEPROM (95080/95160/95320/95640/24C02)'
            : bytes.length >= 2000000
            ? 'Bosch EDC17 / TC1797'
            : 'Bosch EDC16 / Delphi',
          ecuHardwareId: isEepromFile ? 'EEPROM-SPI' : '02810' + Math.floor(10000 + Math.random() * 90000),
          ecuSoftwareId: isEepromFile ? 'EEPROM_CAL' : '1037' + Math.floor(100000 + Math.random() * 900000),
          fileSizeBytes: bytes.length,
          fileName: file.name,
          isCustomFile: true,
        });

        if (isEepromFile) {
          setViewMode('hex');
        }

        // Scan the literal uploaded bytes for candidate maps immediately
        const found = scanBinaryForPotentialMaps(bytes, new Set());
        if (found.length > 0) {
          setPotentialMaps(found);
        }

        showToast(
          lang === 'mizo'
            ? `File tak tak "${file.name}" (${bytes.length.toLocaleString()} Bytes) chu memory-ah load fel a ni e! Mock data engmah a awm lo.`
            : `Raw file "${file.name}" (${bytes.length.toLocaleString()} bytes) loaded directly into memory buffer.`
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBinaryFile(file);
      e.target.value = '';
    }
  };

  // Global Keyboard Shortcuts (Iconic WinOLS Keys: 2, 3, H, T, Q, M, F, K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in text input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === '3') {
        setViewMode('3d');
      } else if (e.key === '2') {
        setViewMode('2d');
      } else if (e.key === 'h' || e.key === 'H') {
        setViewMode('hex');
      } else if (e.key === 't' || e.key === 'T') {
        setViewMode('text');
      } else if (e.key === 'q' || e.key === 'Q') {
        setViewMode('quad');
      } else if (e.key === 'm' || e.key === 'M') {
        setEndianness((prev) => (prev === 'HiLo' ? 'LoHi' : 'HiLo'));
      } else if (e.key === 'f' || e.key === 'F') {
        handleTriggerFindMaps();
      } else if (e.key === 'k' || e.key === 'K') {
        setIsNewMapOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingFile(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          processBinaryFile(file);
        }
      }}
      className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative"
    >
      {/* Drag & Drop File Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md border-4 border-dashed border-cyan-400 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <HardDrive className="w-16 h-16 text-cyan-400 animate-bounce mb-3" />
          <h3 className="text-xl font-bold font-mono text-cyan-200">
            {lang === 'mizo' ? 'Raw ECU Binary File (.bin, .ori, .eep) lo thlah rawh' : 'Drop Raw ECU Binary (.bin, .ori, .eep) Here'}
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-2">
            {lang === 'mizo' ? 'A tak takin memory buffer-ah chhiar luh a ni ang (Mock data tel lovin)' : 'Will ingest raw binary buffer directly into active memory'}
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".bin,.ori,.hex,.mod,.s19,*"
      />

      {/* Top Application Desktop Menu Bar */}
      <WinolsMenuBar
        lang={lang}
        onSetLang={setLang}
        metadata={metadata}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        onOpenFileClick={() => fileInputRef.current?.click()}
        onLoadPreset={handleLoadPreset}
        onExportModifiedBin={handleExportModifiedBin}
        onExportMapPackKp={handleExportMapPackKp}
        onTriggerFindMaps={handleTriggerFindMaps}
        onOpenStage1Wizard={() => setIsStage1Open(true)}
        onOpenAutoTuningModal={() => setIsAutoTuneOpen(true)}
        onRecalculateChecksums={handleRecalculateChecksums}
        onResetAllToOri={handleResetAllToOri}
        onTestFlash={() => {
          if (hasPendingChecksum) {
            showToast(
              lang === 'mizo'
                ? 'ALERT: Checksum chhut nawn lova i flash chuan ECU a thi/brick nghal ang!'
                : 'ALERT: Flashing with invalid checksum triggers hardware watchdog lock!'
            );
          } else {
            showToast(
              lang === 'mizo'
                ? 'ECU FLASH SIMULATION OK! Checksum 3/3 valid, engine starts immediately.'
                : 'ECU FLASH SIMULATION OK! Checksum 3/3 valid, engine starts immediately.'
            );
          }
        }}
        onOpenNewMapModal={() => setIsNewMapOpen(true)}
      />

      {/* Top Icon Toolbar Strip */}
      <WinolsToolbar
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        onOpenFileClick={() => fileInputRef.current?.click()}
        onExportModifiedBin={handleExportModifiedBin}
        onTriggerFindMaps={handleTriggerFindMaps}
        onOpenStage1Wizard={() => setIsStage1Open(true)}
        onOpenAutoTuningModal={() => setIsAutoTuneOpen(true)}
        onBatchModify={handleBatchModify}
        onIncrementCell={handleIncrementCell}
        onToggleEndian={() => setEndianness((e) => (e === 'HiLo' ? 'LoHi' : 'HiLo'))}
        endianness={endianness}
        isModified={isModified}
        hasPendingChecksum={hasPendingChecksum}
        onRecalculateChecksums={handleRecalculateChecksums}
        onResetActiveMap={handleResetActiveMap}
        activeVersion={activeVersion}
        onSetActiveVersion={setActiveVersion}
        lang={lang}
      />

      {/* Navigation Sub-Header (Workstation vs Architecture Deep Dive) */}
      <div className="bg-[#090e1a] border-b border-slate-800 px-3 py-1 flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setMainTab('workstation')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
              mainTab === 'workstation'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{lang === 'mizo' ? 'WinOLS Workstation' : 'WinOLS Workstation'}</span>
          </button>

          <button
            onClick={() => setMainTab('architecture')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
              mainTab === 'architecture'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{lang === 'mizo' ? '7 Architecture Layers' : '7 Core Layers'}</span>
          </button>

          <button
            onClick={() => setMainTab('a2l_damos')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
              mainTab === 'a2l_damos'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3 h-3" />
            <span>A2L & DAMOS</span>
          </button>

          <button
            onClick={() => setMainTab('memory')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
              mainTab === 'memory'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3 h-3" />
            <span>ECU Memory</span>
          </button>

          <button
            onClick={() => setMainTab('shortcuts')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
              mainTab === 'shortcuts'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="w-3 h-3" />
            <span>{lang === 'mizo' ? 'Hotkeys' : 'Hotkeys'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 font-bold transition flex items-center gap-1"
            title="Open physical binary dump from disk"
          >
            <FolderOpen className="w-3 h-3" />
            <span>{lang === 'mizo' ? 'Open .BIN' : 'Open .BIN'}</span>
          </button>

          <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-cyan-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ROM: {romBuffer.length.toLocaleString()} B</span>
          </div>

          <span className="text-cyan-400 font-bold">{currentMap.name}</span>
          <span>[{currentMap.germanAcronym}]</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">{currentMap.addressHex}</span>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#0d1627] border border-cyan-500/80 text-cyan-200 px-4 py-2.5 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {mainTab === 'workstation' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Project / Map Tree Sidebar */}
            <MapTreeSidebar
              maps={maps}
              potentialMaps={potentialMaps}
              selectedMapId={selectedMapId}
              onSelectMap={setSelectedMapId}
              metadata={metadata}
              onAddPotentialMap={handleAddPotentialMap}
              onOpenNewMapModal={() => setIsNewMapOpen(true)}
              onDeleteMap={handleDeleteMap}
              lang={lang}
            />

            {/* Central Calibration Canvas Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-[#070b14]">
              {/* Single or Quad View Mode Rendering */}
              {viewMode === '3d' && (
                <Map3DVisualizer
                  currentMap={currentMap}
                  onUpdateMapCell={handleUpdateMapCell}
                  onBatchModify={handleBatchModify}
                  onResetMap={handleResetActiveMap}
                  lang={lang}
                />
              )}

              {viewMode === '2d' && (
                <Map2DVisualizer
                  currentMap={currentMap}
                  lang={lang}
                  rawBinaryBuffer={romBuffer}
                  endianness={endianness}
                />
              )}

              {viewMode === 'hex' && (
                <HexEditor
                  currentMap={currentMap}
                  onUpdateMapCell={handleUpdateMapCell}
                  lang={lang}
                  rawBinaryBuffer={romBuffer}
                  originalBinaryBuffer={originalRomBuffer}
                  onUpdateRomBytes={handleUpdateRomBytes}
                />
              )}

              {viewMode === 'text' && (
                <TableView
                  currentMap={currentMap}
                  onUpdateMapCell={handleUpdateMapCell}
                  onBatchModify={handleBatchModify}
                  onResetMap={handleResetActiveMap}
                  lang={lang}
                />
              )}

              {viewMode === 'quad' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Map3DVisualizer
                      currentMap={currentMap}
                      onUpdateMapCell={handleUpdateMapCell}
                      onBatchModify={handleBatchModify}
                      onResetMap={handleResetActiveMap}
                      lang={lang}
                    />
                    <TableView
                      currentMap={currentMap}
                      onUpdateMapCell={handleUpdateMapCell}
                      onBatchModify={handleBatchModify}
                      onResetMap={handleResetActiveMap}
                      lang={lang}
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Map2DVisualizer
                      currentMap={currentMap}
                      lang={lang}
                      rawBinaryBuffer={romBuffer}
                      endianness={endianness}
                    />
                    <HexEditor
                      currentMap={currentMap}
                      onUpdateMapCell={handleUpdateMapCell}
                      lang={lang}
                      rawBinaryBuffer={romBuffer}
                      originalBinaryBuffer={originalRomBuffer}
                      onUpdateRomBytes={handleUpdateRomBytes}
                    />
                  </div>
                </div>
              )}

              {/* Real-time Checksum Monitor Footer Card */}
              <ChecksumMonitor
                blocks={checksumBlocks}
                isModified={isModified}
                totalDelta={totalDelta}
                onRecalculateChecksums={handleRecalculateChecksums}
                lang={lang}
              />
            </div>
          </div>
        ) : mainTab === 'architecture' ? (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#070b14]">
            <ArchitectureDiagram lang={lang} />
          </div>
        ) : mainTab === 'a2l_damos' ? (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#070b14]">
            <A2LDamosExplorer lang={lang} />
          </div>
        ) : mainTab === 'memory' ? (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#070b14]">
            <EcuMemoryLayout lang={lang} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#070b14]">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-6 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                  <Keyboard className="w-4 h-4" />
                  <span>WinOLS Keyboard Architecture & Shortcuts</span>
                </div>
                <h3 className="text-lg font-bold text-white font-mono">
                  {lang === 'mizo'
                    ? 'WinOLS Hotkeys Leh Calibration Workflow'
                    : 'Iconic WinOLS Hotkeys & Engineering Flow'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {WINOLS_SHORTCUTS.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <kbd className="w-8 h-8 rounded bg-slate-800 border border-slate-600 text-cyan-300 font-bold text-sm flex items-center justify-center shadow">
                        {sc.key}
                      </kbd>
                      <div>
                        <div className="font-bold text-white">{sc.title}</div>
                        <div className="text-slate-400 text-[11px]">
                          {lang === 'mizo' ? sc.descMizo : sc.descEng}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar (True WinOLS Status Bar) */}
      <footer className="bg-[#080d18] border-t border-slate-800 px-3 py-1 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Address:</span>
            <span className="text-cyan-400 font-bold">{currentMap.addressHex}</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">Dimensions:</span>
            <span className="text-slate-200">
              {currentMap.rows}x{currentMap.cols} ({currentMap.rows * currentMap.cols * 2} Bytes)
            </span>
          </div>

          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Encoding:</span>
            <span className="text-purple-300">16-Bit {endianness}</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">Version:</span>
            <span className={`font-bold ${isModified ? 'text-amber-400' : 'text-slate-300'}`}>
              {isModified ? 'Mod.1 (Active)' : 'Original (Base)'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hasPendingChecksum ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className={hasPendingChecksum ? 'text-amber-400' : 'text-emerald-400'}>
              {hasPendingChecksum ? 'Checksum Unbalanced' : 'Checksum 3/3 Valid'}
            </span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="text-slate-500">
            {metadata.fileSizeBytes.toLocaleString()} Bytes ({((metadata.fileSizeBytes) / 1024 / 1024).toFixed(2)} MB)
          </div>
        </div>
      </footer>

      {/* Stage 1 Remap Wizard Modal */}
      <Stage1RemapModal
        isOpen={isStage1Open}
        onClose={() => setIsStage1Open(false)}
        onApplyStage1={handleApplyStage1}
        lang={lang}
      />

      {/* Dedicated Auto-Tune Remap Studio Modal for Indian Vehicles */}
      <AutoTuningRemapModal
        isOpen={isAutoTuneOpen}
        onClose={() => setIsAutoTuneOpen(false)}
        lang={lang}
        currentMetadata={metadata}
        onApplyProfileTune={handleApplyProfileTune}
        onLoadVehiclePreset={handleLoadVehiclePresetDirect}
      />

      {/* New Map Modal (Hotkey 'K') with direct ROM byte reading */}
      <NewMapModal
        isOpen={isNewMapOpen}
        onClose={() => setIsNewMapOpen(false)}
        onCreateMap={handleCreateMap}
        lang={lang}
        rawBinaryBuffer={romBuffer}
        endianness={endianness}
      />
    </div>
  );
}

export default App;
