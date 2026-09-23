export type Language = 'mizo' | 'english';

export type ViewMode = '3d' | '2d' | 'hex' | 'text' | 'quad';

export interface EcuMapDefinition {
  id: string;
  name: string;
  germanAcronym: string;
  category: 'Boost & Air' | 'Fuel & Injection' | 'Torque Management' | 'Emissions' | 'Custom';
  descriptionMizo: string;
  descriptionEng: string;
  addressHex: string;
  addressDec: number;
  rows: number;
  cols: number;
  xAxisName: string;
  xAxisUnit: string;
  xAxisValues: number[];
  yAxisName: string;
  yAxisUnit: string;
  yAxisValues: number[];
  zUnit: string;
  factor: number;
  offset: number;
  data: number[][]; // [row][col] values
  originalData: number[][];
  confidence?: number; // for heuristic detection
  isUserCreated?: boolean;
}

export interface ChecksumBlock {
  id: string;
  name: string;
  startAddressHex: string;
  endAddressHex: string;
  csAddressHex: string;
  method: '16-bit Complement' | '32-bit Additive' | 'CRC32 Polynomial' | 'RSA-2048 Hash Block';
  calculatedValue: number;
  storedValue: number;
  status: 'valid' | 'invalid' | 'correcting';
}

export interface ProjectMetadata {
  projectName: string;
  vehicleModel: string;
  ecuManufacturer: string;
  ecuHardwareId: string;
  ecuSoftwareId: string;
  fileSizeBytes: number;
  fileName: string;
  isCustomFile: boolean;
}

export interface ArchitectureLayer {
  id: string;
  titleMizo: string;
  titleEng: string;
  subtitleMizo: string;
  subtitleEng: string;
  badge: string;
  color: string;
  detailsMizo: string[];
  detailsEng: string[];
  technicalHighlights: string[];
  diagramNode: string;
}
