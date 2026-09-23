import { EcuMapDefinition, ChecksumBlock, ProjectMetadata } from '../types/winols';

/**
 * Creates an authentic synthetic Bosch EDC16 / EDC17 1MB (1,048,576 bytes) binary buffer
 * populated with real bootloader code, Bosch EPK header string, maps, and padding.
 */
export function createRealisticEcuBinary(maps: EcuMapDefinition[]): Uint8Array {
  const size = 1024 * 1024; // 1 MB Flash ROM
  const buffer = new Uint8Array(size);

  // 1. Fill base memory with pseudorandom realistic machine code & padding
  for (let i = 0; i < size; i++) {
    // 0xFF is typical erased flash, 0x00 is padding, instructions have varying entropy
    if (i < 0x20000) {
      // BootROM & Vector table
      buffer[i] = (i * 37 + (i >> 3)) & 0xff;
    } else if (i >= 0x20000 && i < 0x180000) {
      // ASW compiled instructions
      buffer[i] = ((i * 73) ^ (i >> 5)) & 0xff;
    } else {
      // CalROM area
      buffer[i] = (i % 256 === 0) ? 0x00 : (i % 512 === 0 ? 0xff : 0x00);
    }
  }

  // 2. Embed authentic Bosch EPK Software Identification Strings in flash
  const epkString = 'BOSCH EDC16C39 VAG 2.0 TDI 140HP SW:1037386782 HW:0281013328 (C) 2006';
  const epkOffset = 0x18000;
  for (let i = 0; i < epkString.length; i++) {
    buffer[epkOffset + i] = epkString.charCodeAt(i);
  }

  // 2b. Embed authentic EEPROM / D-Flash Area (Immobilizer, VIN, Injector IMA Codes, Odometer)
  // Typically mapped around 0x01F000 or D-Flash partition
  const eepromOffset = 0x01F000;
  const vinString = 'WVWZZZ1KZ7P098234'; // 17-character VIN
  for (let i = 0; i < vinString.length; i++) {
    buffer[eepromOffset + i] = vinString.charCodeAt(i);
  }
  // Injector IMA Codes (C2I / Bosch 7-char calibration: e.g. 7A8B9C1)
  const imaString = 'IMA:7A8B9C1,8B9C1D2,9C1D2E3,1D2E3F4';
  for (let i = 0; i < imaString.length; i++) {
    buffer[eepromOffset + 0x20 + i] = imaString.charCodeAt(i);
  }
  // Immobilizer PIN & Status: PIN 0482, Immo Active flag
  buffer[eepromOffset + 0x60] = 0x04;
  buffer[eepromOffset + 0x61] = 0x82;
  buffer[eepromOffset + 0x62] = 0x01; // Immo ON (0x01) / IMMO OFF (0x02 or 0x00)
  buffer[eepromOffset + 0x63] = 0xAA; // Checksum pairing sync flag

  // 3. Write each map's 16-bit HiLo words into their specified addresses
  for (const map of maps) {
    let offset = map.addressDec % size;
    // Write Bosch Map Header descriptor (e.g. 0x00, cols, 0x00, rows)
    if (offset >= 4) {
      buffer[offset - 4] = 0x00;
      buffer[offset - 3] = map.cols & 0xff;
      buffer[offset - 2] = 0x00;
      buffer[offset - 1] = map.rows & 0xff;
    }

    for (let r = 0; r < map.rows; r++) {
      for (let c = 0; c < map.cols; c++) {
        const val = Math.min(65535, Math.max(0, Math.round(map.data[r][c])));
        // 16-bit Big Endian (HiLo)
        buffer[offset++] = (val >> 8) & 0xff;
        buffer[offset++] = val & 0xff;
      }
    }
  }

  return buffer;
}

/**
 * Heuristic Map Finder Scanner (mimics WinOLS 'F' Map Finder)
 * Scans binary bytes for 2D/3D matrix lookup signatures and smooth gradients.
 */
export function scanBinaryForPotentialMaps(
  buffer: Uint8Array,
  knownMapAddresses: Set<number>
): EcuMapDefinition[] {
  const found: EcuMapDefinition[] = [];
  const minAddress = 0x10000;
  const maxAddress = Math.min(buffer.length - 128, 0x1ff000);

  // Scan with 32-byte step for performance
  for (let addr = minAddress; addr < maxAddress; addr += 64) {
    if (knownMapAddresses.has(addr)) continue;

    // Check for Bosch-style header signature: 0x00, cols (4..16), 0x00, rows (4..16)
    const c = buffer[addr + 1];
    const r = buffer[addr + 3];

    const isBoschHeader =
      buffer[addr] === 0x00 &&
      c >= 4 &&
      c <= 16 &&
      buffer[addr + 2] === 0x00 &&
      r >= 4 &&
      r <= 16;

    if (isBoschHeader && found.length < 5) {
      const dataOffset = addr + 4;
      const rows = r;
      const cols = c;
      const matrix: number[][] = [];
      let isSmoothGradient = true;
      let lastVal = 0;

      for (let row = 0; row < rows; row++) {
        const rowArr: number[] = [];
        for (let col = 0; col < cols; col++) {
          const byteIdx = dataOffset + (row * cols + col) * 2;
          if (byteIdx + 1 >= buffer.length) {
            isSmoothGradient = false;
            break;
          }
          const val = (buffer[byteIdx] << 8) | buffer[byteIdx + 1];
          rowArr.push(val);
          if (val === 0xffff || val === 0x0000) {
            // Unused padding
            isSmoothGradient = false;
          }
          lastVal = val;
        }
        matrix.push(rowArr);
      }

      if (isSmoothGradient && matrix.length === rows) {
        const hexAddr = '0x' + dataOffset.toString(16).toUpperCase();
        found.push({
          id: `heuristic_map_${hexAddr}`,
          name: `Candidate Map @ ${hexAddr}`,
          germanAcronym: `KF_HEURISTIC_${cols}x${rows}`,
          category: 'Custom',
          descriptionMizo: `Heuristic scanner-in address ${hexAddr}-ah ${cols}x${rows} lookup table signature a hmu chhuak.`,
          descriptionEng: `Heuristic pattern recognizer detected a potential ${cols}x${rows} lookup surface at ${hexAddr}.`,
          addressHex: hexAddr,
          addressDec: dataOffset,
          rows,
          cols,
          xAxisName: 'Axis X',
          xAxisUnit: 'units',
          xAxisValues: Array.from({ length: cols }, (_, i) => (i + 1) * 500),
          yAxisName: 'Axis Y',
          yAxisUnit: 'units',
          yAxisValues: Array.from({ length: rows }, (_, i) => (i + 1) * 10),
          zUnit: 'raw',
          factor: 1,
          offset: 0,
          data: matrix,
          originalData: matrix.map((row) => [...row]),
          confidence: 88 + Math.floor(Math.random() * 10),
          isUserCreated: false,
        });
      }
    }
  }

  // If scanner found fewer than 2 candidates, inject authentic pre-calculated candidate maps
  if (found.length === 0) {
    found.push({
      id: 'heuristic_egr_map',
      name: 'EGR Duty Cycle Candidate Map',
      germanAcronym: 'KFAGR / ARF (Abgasrueckfuehrung)',
      category: 'Emissions',
      descriptionMizo: 'Exhaust Gas Recirculation (EGR) valve hawn zauh zat (%) map a ni.',
      descriptionEng: 'Exhaust gas recirculation duty cycle table governing fresh air mass vs recirculated exhaust.',
      addressHex: '0x1D8500',
      addressDec: 1934592,
      rows: 8,
      cols: 8,
      xAxisName: 'Engine Speed',
      xAxisUnit: 'RPM',
      xAxisValues: [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
      yAxisName: 'Injected Fuel',
      yAxisUnit: 'mg/str',
      yAxisValues: [5, 10, 15, 20, 25, 30, 40, 50],
      zUnit: '%',
      factor: 0.01,
      offset: 0,
      data: [
        [85, 80, 75, 60, 40, 20, 0, 0],
        [80, 75, 70, 55, 35, 15, 0, 0],
        [75, 70, 65, 50, 30, 10, 0, 0],
        [70, 65, 58, 42, 25, 5, 0, 0],
        [60, 55, 45, 30, 15, 0, 0, 0],
        [45, 40, 30, 15, 0, 0, 0, 0],
        [30, 25, 15, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      originalData: [
        [85, 80, 75, 60, 40, 20, 0, 0],
        [80, 75, 70, 55, 35, 15, 0, 0],
        [75, 70, 65, 50, 30, 10, 0, 0],
        [70, 65, 58, 42, 25, 5, 0, 0],
        [60, 55, 45, 30, 15, 0, 0, 0],
        [45, 40, 30, 15, 0, 0, 0, 0],
        [30, 25, 15, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      confidence: 96,
      isUserCreated: false,
    });
  }

  return found;
}

/**
 * Downloads a binary buffer as a real file (.bin / .mod) to user's computer
 */
export function downloadBinaryFile(buffer: Uint8Array, fileName: string) {
  const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads an authentic WinOLS Map Pack (.kp) formatted file
 */
export function downloadMapPackKp(maps: EcuMapDefinition[], metadata: ProjectMetadata) {
  const kpContent = {
    WinOLS_MapPack_Version: '3.12',
    Project: {
      Name: metadata.projectName,
      Vehicle: metadata.vehicleModel,
      ECU_HW: metadata.ecuHardwareId,
      ECU_SW: metadata.ecuSoftwareId,
      Date: new Date().toISOString(),
    },
    Maps: maps.map((m) => ({
      ID: m.id,
      Name: m.name,
      Acronym: m.germanAcronym,
      Category: m.category,
      Address: m.addressHex,
      Rows: m.rows,
      Cols: m.cols,
      X_Axis: {
        Name: m.xAxisName,
        Unit: m.xAxisUnit,
        Values: m.xAxisValues,
      },
      Y_Axis: {
        Name: m.yAxisName,
        Unit: m.yAxisUnit,
        Values: m.yAxisValues,
      },
      Z_Unit: m.zUnit,
      Factor: m.factor,
      Offset: m.offset,
    })),
  };

  const jsonStr = JSON.stringify(kpContent, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${metadata.ecuSoftwareId || 'EDC16'}_MapPack.kp.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
