import { EcuMapDefinition, ChecksumBlock, ArchitectureLayer } from '../types/winols';

export const INITIAL_MAPS: EcuMapDefinition[] = [
  {
    id: 'turbo_boost',
    name: 'Turbo Boost Target Pressure',
    germanAcronym: 'pvd_w / LDRL (Ladedruck-Sollwert)',
    category: 'Boost & Air',
    descriptionMizo: 'Turbocharger-in cylinder chhung a nawrna pressure (mbar) pek tur bitukna map a ni. Engine load (IQ) leh RPM a zirin wastegate / VNT actuator a control.',
    descriptionEng: 'Target boost pressure table in mbar. Controls VGT/VNT vanes or wastegate duty cycle based on requested injection quantity and engine RPM.',
    addressHex: '0x1E4280',
    addressDec: 1983104,
    rows: 8,
    cols: 8,
    xAxisName: 'Engine Speed',
    xAxisUnit: 'RPM',
    xAxisValues: [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
    yAxisName: 'Fuel Injected (IQ)',
    yAxisUnit: 'mg/str',
    yAxisValues: [10, 20, 30, 40, 50, 60, 70, 80],
    zUnit: 'mbar',
    factor: 1.0,
    offset: 0,
    data: [
      [1020, 1050, 1100, 1150, 1200, 1220, 1200, 1180],
      [1040, 1120, 1250, 1380, 1450, 1420, 1380, 1320],
      [1060, 1200, 1480, 1680, 1750, 1720, 1660, 1580],
      [1080, 1310, 1720, 1980, 2100, 2080, 2010, 1920],
      [1100, 1420, 1950, 2250, 2380, 2350, 2290, 2180],
      [1120, 1530, 2120, 2450, 2580, 2550, 2490, 2380],
      [1130, 1600, 2220, 2580, 2690, 2660, 2600, 2490],
      [1140, 1650, 2280, 2640, 2750, 2720, 2650, 2550]
    ],
    originalData: [
      [1020, 1050, 1100, 1150, 1200, 1220, 1200, 1180],
      [1040, 1120, 1250, 1380, 1450, 1420, 1380, 1320],
      [1060, 1200, 1480, 1680, 1750, 1720, 1660, 1580],
      [1080, 1310, 1720, 1980, 2100, 2080, 2010, 1920],
      [1100, 1420, 1950, 2250, 2380, 2350, 2290, 2180],
      [1120, 1530, 2120, 2450, 2580, 2550, 2490, 2380],
      [1130, 1600, 2220, 2580, 2690, 2660, 2600, 2490],
      [1140, 1650, 2280, 2640, 2750, 2720, 2650, 2550]
    ]
  },
  {
    id: 'drivers_wish',
    name: 'Drivers Wish (Accelerator Pedal Request)',
    germanAcronym: 'mrw_b / KFMD (Fahrpedal-Wunsch)',
    category: 'Torque Management',
    descriptionMizo: 'Chhuk-chhoh leh tlanchak duhna (gas pedal rah zat %) a zira driver-in engine chakna (Torque Nm) a ngen chhuahna map a ni.',
    descriptionEng: 'Accelerator pedal position vs RPM translating throttle angle request into internal engine target torque in Nm.',
    addressHex: '0x1C1100',
    addressDec: 1839360,
    rows: 8,
    cols: 8,
    xAxisName: 'Engine Speed',
    xAxisUnit: 'RPM',
    xAxisValues: [800, 1200, 1800, 2400, 3000, 3600, 4200, 4800],
    yAxisName: 'Pedal Travel',
    yAxisUnit: '%',
    yAxisValues: [0, 15, 30, 45, 60, 75, 90, 100],
    zUnit: 'Nm',
    factor: 0.1,
    offset: 0,
    data: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [25, 35, 45, 55, 60, 58, 50, 40],
      [60, 85, 110, 125, 130, 125, 115, 95],
      [110, 150, 190, 215, 220, 210, 190, 160],
      [165, 220, 275, 305, 310, 295, 265, 225],
      [220, 290, 355, 385, 390, 375, 335, 285],
      [270, 350, 420, 450, 455, 435, 395, 335],
      [300, 380, 460, 490, 495, 475, 430, 365]
    ],
    originalData: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [25, 35, 45, 55, 60, 58, 50, 40],
      [60, 85, 110, 125, 130, 125, 115, 95],
      [110, 150, 190, 215, 220, 210, 190, 160],
      [165, 220, 275, 305, 310, 295, 265, 225],
      [220, 290, 355, 385, 390, 375, 335, 285],
      [270, 350, 420, 450, 455, 435, 395, 335],
      [300, 380, 460, 490, 495, 475, 430, 365]
    ]
  },
  {
    id: 'rail_pressure',
    name: 'Common Rail High Pressure Target',
    germanAcronym: 'pr_w / KFRSD (Raildruck-Sollwert)',
    category: 'Fuel & Injection',
    descriptionMizo: 'Common Rail diesel fuel line chhunga oil nawrna (fuel pressure bar) chawm zat tur a ni. Atomization tha tak nei tura 1600 bar thleng a thlen tir.',
    descriptionEng: 'High-pressure diesel common rail fuel delivery setpoint in bar. Ensures fine fuel droplet atomization under elevated engine load.',
    addressHex: '0x1F2A00',
    addressDec: 2042368,
    rows: 8,
    cols: 8,
    xAxisName: 'Engine Speed',
    xAxisUnit: 'RPM',
    xAxisValues: [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
    yAxisName: 'Injected Fuel',
    yAxisUnit: 'mg/str',
    yAxisValues: [5, 15, 25, 35, 45, 55, 65, 75],
    zUnit: 'bar',
    factor: 0.1,
    offset: 0,
    data: [
      [320, 360, 420, 480, 550, 600, 620, 650],
      [450, 520, 630, 750, 850, 920, 960, 1000],
      [600, 720, 880, 1020, 1140, 1220, 1270, 1310],
      [750, 910, 1100, 1260, 1380, 1450, 1500, 1530],
      [880, 1080, 1290, 1450, 1560, 1620, 1660, 1680],
      [980, 1210, 1420, 1580, 1680, 1740, 1780, 1800],
      [1050, 1300, 1520, 1680, 1770, 1820, 1850, 1870],
      [1100, 1360, 1580, 1740, 1820, 1870, 1900, 1920]
    ],
    originalData: [
      [320, 360, 420, 480, 550, 600, 620, 650],
      [450, 520, 630, 750, 850, 920, 960, 1000],
      [600, 720, 880, 1020, 1140, 1220, 1270, 1310],
      [750, 910, 1100, 1260, 1380, 1450, 1500, 1530],
      [880, 1080, 1290, 1450, 1560, 1620, 1660, 1680],
      [980, 1210, 1420, 1580, 1680, 1740, 1780, 1800],
      [1050, 1300, 1520, 1680, 1770, 1820, 1850, 1870],
      [1100, 1360, 1580, 1740, 1820, 1870, 1900, 1920]
    ]
  },
  {
    id: 'torque_limiter',
    name: 'Main Torque Limiter by Ambient Pressure',
    germanAcronym: 'md_max / KLMM (Drehmomentbegrenzung)',
    category: 'Torque Management',
    descriptionMizo: 'Chak leh lutuk vanga gearbox leh engine chhiat ven nana maximum torque limit tu a ni. Tlangsang (high altitude) leh boruak pressure a zirin a danglam.',
    descriptionEng: 'Engine structural torque safety ceiling in Nm across RPM, scaled according to atmospheric barometric pressure to prevent turbo overspeed.',
    addressHex: '0x1C3800',
    addressDec: 1849344,
    rows: 4,
    cols: 8,
    xAxisName: 'Engine Speed',
    xAxisUnit: 'RPM',
    xAxisValues: [1200, 1750, 2250, 2750, 3250, 3750, 4250, 4750],
    yAxisName: 'Barometric Press.',
    yAxisUnit: 'mbar',
    yAxisValues: [800, 900, 1000, 1050],
    zUnit: 'Nm',
    factor: 0.1,
    offset: 0,
    data: [
      [220, 290, 330, 340, 330, 305, 260, 210],
      [250, 330, 380, 390, 380, 350, 300, 240],
      [280, 370, 430, 440, 430, 395, 340, 270],
      [290, 385, 450, 460, 450, 410, 355, 280]
    ],
    originalData: [
      [220, 290, 330, 340, 330, 305, 260, 210],
      [250, 330, 380, 390, 380, 350, 300, 240],
      [280, 370, 430, 440, 430, 395, 340, 270],
      [290, 385, 450, 460, 450, 410, 355, 280]
    ]
  }
];

export const INITIAL_CHECKSUM_BLOCKS: ChecksumBlock[] = [
  {
    id: 'cs_calrom',
    name: 'Block 0: Calibration Area (CalROM Maps)',
    startAddressHex: '0x1C0000',
    endAddressHex: '0x1FFFFF',
    csAddressHex: '0x1FFFE0',
    method: '16-bit Complement',
    calculatedValue: 0xA78F,
    storedValue: 0xA78F,
    status: 'valid'
  },
  {
    id: 'cs_asw',
    name: 'Block 1: ASW Firmware & Operating Code',
    startAddressHex: '0x000000',
    endAddressHex: '0x1BFFFF',
    csAddressHex: '0x1BFFF0',
    method: 'CRC32 Polynomial',
    calculatedValue: 0x94B2E10F,
    storedValue: 0x94B2E10F,
    status: 'valid'
  },
  {
    id: 'cs_tprot',
    name: 'Block 2: Tricore OTP / RSA Signature (TPROT)',
    startAddressHex: '0x800000',
    endAddressHex: '0x8003FF',
    csAddressHex: '0x8003F0',
    method: 'RSA-2048 Hash Block',
    calculatedValue: 0xC40289FE,
    storedValue: 0xC40289FE,
    status: 'valid'
  }
];

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    id: 'layer_ingestion',
    titleMizo: '1. Firmware Ingestion & Hardware Interface Layer',
    titleEng: '1. Firmware Ingestion & Hardware Interface Layer',
    subtitleMizo: 'Raw Binary Dumps, BDM, Bootloader & OLS300 In-Circuit RAM Emulator',
    subtitleEng: 'Raw Binary Dumps, BDM, Bootloader & OLS300 In-Circuit RAM Emulator',
    badge: 'Hardware & I/O',
    color: '#06b6d4',
    diagramNode: 'IO_SUBSYSTEM',
    detailsMizo: [
      'Raw Binary Files (.bin, .ori, .mod) chhiar luh leh format dang (Motorola S-Record S19, Intel HEX hex) convert theihna.',
      'EVC OLS300 Hardware Integration: Engine control unit-ah RAM chip ang chiahin an thlunzawm a, motor tlan lai mekin dyno chungah millisecond chhungin map thlak nghal zung zung theih (live real-time emulation).',
      'BDM (Background Debug Mode) leh JTAG / Infineon DAP support: MPC5xx leh Tricore processor chhung memory bit-by-bit dump leh flash theihna.',
      'Boot ROM leh Tricore password bypass readback.'
    ],
    detailsEng: [
      'Binary format ingestion supporting flat binary (.bin), Motorola S-Record (.s19), Intel Hex (.hex), and encrypted OLS backups.',
      'Direct integration with EVC OLS300 real-time in-circuit emulator: Replaces vehicle ROM with ultra-fast dual-port RAM for on-the-fly live dyno tuning without re-flashing.',
      'BDM / JTAG / Infineon DAP / Nexus debugging hooks for bare-metal flash reading on Motorola MPC555/565 and Infineon Tricore TC1766/TC1797/TC297.',
      'Flash memory alignment and processor endianness detection at ingest.'
    ],
    technicalHighlights: ['OLS300 Real-Time Dual-Port RAM', 'Motorola S19 / Intel HEX Parser', 'JTAG / BDM Interface Protocol', 'Infineon DAP / TC1797 Support']
  },
  {
    id: 'layer_memory',
    titleMizo: '2. Virtual Memory Management & Shadow Buffer Engine',
    titleEng: '2. Virtual Memory Management & Shadow Buffer Engine',
    subtitleMizo: 'Dual-Buffer Shadowing, HiLo/LoHi Endianness & Address Remapping',
    subtitleEng: 'Dual-Buffer Shadowing, HiLo/LoHi Endianness & Address Remapping',
    badge: 'Core Engine',
    color: '#3b82f6',
    diagramNode: 'VIRTUAL_MEM',
    detailsMizo: [
      'Original Buffer leh Modified Buffer (Dual-buffer architecture): Original binary file kha a him reng a, thlak danglam (modified) zawng zawng chu shadow buffer-ah a kal thung. Hei vang hian engtik lai pawhin Original leh Tuned chu byte khat chhung pawhin an in-compare nghal zung zung thei.',
      'Endianness Transformation (HiLo vs LoHi): Processor chi hrang hrang (PowerPC chu Big Endian / Motorola HiLo; ARM leh Infineon Aurix chu Little Endian / Intel LoHi) te awlsam takin 8-bit, 16-bit, 32-bit leh 64-bit float-ah a letling nghal thei.',
      'Unlimited Multi-Branch Undo History: Map siam remna (increments, percentage, smooth, interpolate) zawng zawng tree structure-in a vawng tha.',
      'Virtual Segment Paging: 64MB thleng memory space a scan a, bootloader, ASW code, CalROM, leh DFLASH segment hrang hrang virtual mapping a pe.'
    ],
    detailsEng: [
      'Non-destructive Dual-Buffer Architecture: Maintains an immutable Original Reference Buffer alongside one or more active Working/Modified Version Buffers. Enables instant delta subtraction (Mod - Ori).',
      'Universal Endianness & Data-Width Engine: On-the-fly byte swapping between Big Endian (Motorola HiLo) and Little Endian (Intel LoHi) across 8-bit, 16-bit, 32-bit integers, and IEEE 754 float representations.',
      'Hierarchical Branching Undo/Redo Engine: Tracks all cell edits, block copy-pastes, and parametric changes with zero memory corruption risk.',
      'Address Space Virtualization: Supports paging up to 64MB addressable Flash/ROM space with dynamic base offset relocation (e.g. 0x80000000 base offset remapping).'
    ],
    technicalHighlights: ['Dual-Buffer Shadowing Architecture', 'Dynamic Endianness Swapping (HiLo/LoHi)', 'Zero-Destruction Branching History', '64MB Flat Virtual Address Space']
  },
  {
    id: 'layer_heuristics',
    titleMizo: '3. Heuristic Map Detection & Statistical Pattern Engine',
    titleEng: '3. Heuristic Map Detection & Statistical Pattern Engine',
    subtitleMizo: 'Entropy Scanning, Bosch/Siemens Map Headers & Signature Recognition',
    subtitleEng: 'Entropy Scanning, Bosch/Siemens Map Headers & Signature Recognition',
    badge: 'Pattern AI',
    color: '#8b5cf6',
    diagramNode: 'MAP_FINDER',
    detailsMizo: [
      'Map Finder Algorithm: Binary chhungah statistical gradient leh entropy analysis hmangin map awmna a zawng chhuak. Lookup table te hi graph pangngai a nih avangin linear byte pangngai lakah a danglam bik em em a ni.',
      'Bosch Header Recognition: Bosch EDC15/16/17 te hian map hmaah signature an nei fo (e.g. 0x00 0x10 = 16 words, row/col length, leh axis identification tags). WinOLS hian heng signature hi a chhiar thiam nghal vek.',
      'Axis Pointer Resolution: Map X-axis leh Y-axis (RPM leh Fuel Quantity) awmna address a zawn chhuah bakah EPK (EPROM Kennung / ECU software ID) thlengin a decode thei.',
      'Statistical False-Positive Filtering: Code executable instructions leh lookup tables an in-mix loh nan threshold a hmang.'
    ],
    detailsEng: [
      'Heuristic Gradient & Entropy Scanner: Distinguishes between compiled machine code (high random entropy), string tables, and 2D/3D monotonic lookup tables (smooth mathematical gradients).',
      'Automotive OEM Signature Parsers: Recognizes structured map descriptors used by Bosch (EDC15/16/17, ME7, MED17, MD1/MG1), Siemens/Continental (SIMOS, MSD80, PCR2.1), Delphi, and Denso.',
      'Automatic Axis Cross-Referencing: Identifies standalone and shared break-point tables (Axis-PTS) referenced by memory offsets or Bosch header ID tags.',
      'Machine-Code Instruction Disqualifier: Prevents ARM/Tricore opcode sequences from triggering false map alerts.'
    ],
    technicalHighlights: ['Entropy Gradient Scanning', 'Bosch / Siemens Map Descriptor Parsers', 'Shared Axis Breakpoint Auto-Linker', 'EPK Software String Identifier']
  },
  {
    id: 'layer_project',
    titleMizo: '4. Project Container & Calibration Definitions (OLS, A2L, DAMOS)',
    titleEng: '4. Project Container & Calibration Definitions (OLS, A2L, DAMOS)',
    subtitleMizo: 'ASAM MCD-2MC (A2L), DAMOS ASAP1 & WinOLS .KP Map Pack Pipeline',
    subtitleEng: 'ASAM MCD-2MC (A2L), DAMOS ASAP1 & WinOLS .KP Map Pack Pipeline',
    badge: 'Database & Standards',
    color: '#ec4899',
    diagramNode: 'PROJECT_OLS',
    detailsMizo: [
      '.OLS File Structure: WinOLS project file (.ols) hi container changtlung tak a ni a. Binary original, version hrang hrang (Stage 1, Stage 2, DPF Off), map definitions, axis formulas, comments, leh hardware info zawng zawng file khatah a vawng vek.',
      'ASAM MCD-2MC (A2L / ASAP2) Integration: Auto industry international standard format a chhiar thei a. CHARACTERISTIC, AXIS_PTS, COMPU_METHOD (scaling factor leh offset e.g. x * 0.1) a apply nghal thei.',
      'DAMOS & ASAP1 File Support: Bosch leh OEM factory calibration engineers te hman thin dam file a hawng thei a, German acronyms (e.g., KFLDRL, KFZW, MDNORM) zawng zawng variable name dik takin a rawn phawrh chhuak.',
      'Map Pack (.KP) Export/Import: Tuner te inkarah map address leh scaling factor chauh share-na format awlsam leh te fel tak.'
    ],
    detailsEng: [
      'Proprietary .OLS Project Container: Encapsulates the immutable base ROM, parallel modified branches, map trees, axis conversion polynomials, customer metadata, and linked checksum modules.',
      'ASAM MCD-2MC (A2L / ASAP2) Standard Parser: Translates automotive calibration meta-descriptions into typed CHARACTERISTIC instances (VALUE, CURVE, MAP, CUBOID) with COMPU_METHOD linear equations ($f(x) = ax + b$).',
      'DAMOS (ASAP1) Ingestion: Ingests Bosch/Continental development files with complete internal engineering labels (Funktionsrahmen acronyms: KF=Kennfeld, KL=Kennlinie, MD=Motordrehmoment).',
      'WinOLS Map Pack (.kp) Format: Lightweight schema for exporting and importing relative or absolute map packages between different software versions.'
    ],
    technicalHighlights: ['.OLS Multi-Version Container', 'ASAM MCD-2MC A2L Compliance', 'DAMOS / ASAP1 Factory Map Decoding', 'Exportable .KP Map Packs']
  },
  {
    id: 'layer_checksum',
    titleMizo: '5. Modular Checksum (CS) & Cryptography Subsystem',
    titleEng: '5. Modular Checksum (CS) & Cryptography Subsystem',
    subtitleMizo: 'Dynamic DLLs, 16/32-Bit Complements, CRC32 & RSA TPROT Bypass',
    subtitleEng: 'Dynamic DLLs, 16/32-Bit Complements, CRC32 & RSA TPROT Bypass',
    badge: 'Security & Integrity',
    color: '#f59e0b',
    diagramNode: 'CHECKSUM_DLL',
    detailsMizo: [
      'Modular DLL Architecture: EVC hian ECU family tina tan Checksum Module hrang hrang (OLS221 Bosch EDC16, OLS222 Bosch EDC17, OLS800 Siemens SIMOS, etc.) an siam a. WinOLS-in byte thlak a hmuh veleh he DLL hian background-ah checksum a chhut nawn nghal char char.',
      'Algorithm Chi Hrang Hrang: 16-bit complement sum, 32-bit additive sum, CRC16, CRC32, leh proprietary polynomial hash te a chhut chhuak.',
      'Complementary Word Patching: Memory block chhungah byte kan tihpun chuan, checksum word address-ah khan a letling chiah (inverse delta) a thlak nghal avangin ECU boot laiin error a tawk lo.',
      'RSA Signature & TPROT (Tuning Protection): Modern Tricore ECU (EDC17/MED17) ah RSA-1024/2048 digital signature a awm a, checksum module hian OTP area leh BootROM patch a hria a, ECU a thi lo (brick loh nan).'
    ],
    detailsEng: [
      'Modular Plugin Architecture: Uses dedicated external calculation DLLs (e.g. OLS221 for EDC16, OLS222 for EDC17, OLS800 for SIMOS) queried dynamically upon any buffer write.',
      'Multi-Tier Integrity Algorithms: Computes 16-bit inverse complements ($Sum + CS = 0xFFFF$), 32-bit additive sums, CRC-32 polynomial divisions, and cryptographic SHA digests.',
      'Automatic Complementary Word Patching: When map values are modified, the engine adjusts a target complementary word at the end of the block so total segment parity remains unchanged.',
      'TPROT (Tuning Protection) & RSA Signature Handling: Identifies Infineon Tricore OTP blocks and RSA signature boundaries, preventing ECU boot bricking from watchdog intervention.'
    ],
    technicalHighlights: ['OLS_CS_*.DLL Modular Architecture', 'Inverse 16/32-Bit Complement Balancing', 'Multi-Block CRC32 Algorithms', 'TPROT RSA Watchdog Signature Engine']
  },
  {
    id: 'layer_visualization',
    titleMizo: '6. Multi-View Rendering & Graphic Calibration Engine',
    titleEng: '6. Multi-View Rendering & Graphic Calibration Engine',
    subtitleMizo: 'Hex View, 2D Oscilloscope Waveform, 3D Surface & Delta Matrix',
    subtitleEng: 'Hex View, 2D Oscilloscope Waveform, 3D Surface & Delta Matrix',
    badge: 'Visualization UI',
    color: '#10b981',
    diagramNode: 'RENDER_ENGINE',
    detailsMizo: [
      'Quad-View Synchronization: WinOLS hian view 4 a kawp: Hexadecimal View (H), 2D Curve View (2), 3D Wireframe/Surface View (3), leh Text Matrix View (T). Khawi view-ah pawh byte thlak la, a dangah a in-update rual vek.',
      '2D Oscilloscope Waveform: Binary memory kha hrui zam ang maiin a tlang a, a sang leh hniam (amplitudes) a zirin map awmna a lang tlang nghal vek.',
      '3D Wireframe & Elevation Shading: Map te kha 3D tlang mawi tak angin a din a, rawng (blue=hniam, green=laici, red=sang) hmangin heat distribution leh gradient a hmuh theih.',
      'Delta Mode (Mod vs Ori Difference): Kan thlak danglam zat chiah kha rawng hranin a lo lang a, percentage (% thlak zat) emaw absolute value-in a en theih.'
    ],
    detailsEng: [
      'Synchronized Quad-Mode Rendering: Seamless real-time state synchronization across Hex View (H), 2D Oscilloscope Curve (2), 3D Surface Wireframe (3), and Text Spreadsheet Table (T).',
      '2D Waveform Oscilloscope: Treats raw linear binary memory as a continuous waveform where byte amplitude reveals map boundaries, axis ramps, and unformatted filler zones.',
      'Interactive 3D Polygonal Mesh: Computes real-time isometric and perspective surface projections with dynamic elevation color ramps (blue valley -> green slope -> red peak).',
      'Live Differential Delta Shading: Highlights changed bytes with color-coded positive/negative deltas, supporting percentage alterations and smooth Gaussian bell interpolations.'
    ],
    technicalHighlights: ['Instant Quad-View Synchronization', '2D Linear Memory Waveform Rendering', 'Interactive 3D Isometric Mesh Shading', 'Delta Difference Percentage Highlighting']
  },
  {
    id: 'layer_automation',
    titleMizo: '7. Scripting, Automation & Firmware Patch Engine',
    titleEng: '7. Scripting, Automation & Firmware Patch Engine',
    subtitleMizo: 'WinOLS Scripts, Map Transfer Between Software Versions & Stage 1 Packs',
    subtitleEng: 'WinOLS Scripts, Map Transfer Between Software Versions & Stage 1 Packs',
    badge: 'Automation',
    color: '#0ea5e9',
    diagramNode: 'SCRIPT_ENGINE',
    detailsMizo: [
      'WinOLS Scripting Language: Map thlak zung zung nan leh repeat ngai thil atan script a chhiar thei (e.g. Stage 1 Torque +15%, Rail Pressure +5%, EGR deactivation switch 0x01 to 0x00).',
      'Map Transfer Between Versions: ECU software version hlui atangin version thar (e.g., SW 1037386782 to SW 1037395421) ah map address a in-shift pawhin heuristic hmangin map dik a zawng a, automatic-in a copy thei.',
      'Firmware Patch Modules: DTC (Diagnostic Trouble Code) removal switch finder, Speed Limiter (Vmax) unlock, leh Launch Control / Antilag patch.',
      'Batch Project Processing: File tam tak rualin a process zung zung thei.'
    ],
    detailsEng: [
      'Custom WinOLS Scripting Engine: Executes structured procedural macros for automated map calibration (e.g. Stage 1 parametric boost increases, EGR hysteresis zeroing, DTC table deactivation).',
      'Cross-Software Map Transfer Engine: Intelligently migrates calibration maps across differing ECU software revisions (e.g. Bosch SW 1037386782 to SW 1037395421) using pattern-matching even when memory offsets shift.',
      'Specialized Patch Function Modules: Automates single-byte switch toggles for speed limiter (Vmax) bypass, pops and bangs overrun crackle logic, and fault code (DTC) masking.',
      'Automated Batch Build Pipeline: Supports headless processing of multiple project containers.'
    ],
    technicalHighlights: ['Procedural WinOLS Macro Scripting', 'Heuristic Cross-Version Map Transfer', 'DTC Switch & Vmax Patching Engines', 'Batch Calibration Compilers']
  }
];

export const WINOLS_SHORTCUTS = [
  { key: '2', title: '2D Mode', descMizo: 'Binary kha 2D waveform curve-in a en', descEng: 'Switch to 2D continuous waveform graph' },
  { key: '3', title: '3D Mode', descMizo: 'Map kha 3D wireframe surface-in a en', descEng: 'Switch to 3D surface elevation mesh' },
  { key: 'H', title: 'Hex View', descMizo: 'Raw hexadecimal bytes enna', descEng: 'Switch to raw hexadecimal byte view' },
  { key: 'T', title: 'Text Mode', descMizo: 'Spreadsheet matrix table anga enna', descEng: 'Switch to spreadsheet matrix numbers' },
  { key: 'W', title: 'Word Width', descMizo: '8-bit -> 16-bit -> 32-bit thlak kualna', descEng: 'Toggle byte width (8-bit / 16-bit / 32-bit)' },
  { key: 'M', title: 'Endian Swap', descMizo: 'HiLo (Big) leh LoHi (Little) endian thlak', descEng: 'Swap byte order (HiLo Motorola / LoHi Intel)' },
  { key: 'K', title: 'Create Map', descMizo: 'Selected bytes atanga Map thar siam', descEng: 'Generate new calibration map from selection' },
  { key: 'F', title: 'Find Map', descMizo: 'Binary chhungah map zawng chhuak rawh', descEng: 'Trigger heuristic map search engine' },
  { key: 'D', title: 'Delta Toggle', descMizo: 'Original leh Mod in-thlauhna (diff) en', descEng: 'Toggle absolute/percentage difference view' },
  { key: '%', title: 'Percent Edit', descMizo: 'Selection zatin %-a thlak danglam', descEng: 'Modify selected cell values by percentage' }
];

export const GERMAN_ACRONYMS = [
  { term: 'KF (Kennfeld)', meaning: '3D Lookup Map (X vs Y -> Z)', example: 'KFLDRL (Boost control map)' },
  { term: 'KL (Kennlinie)', meaning: '2D Characteristic Curve (X -> Y)', example: 'KLMM (Max Torque curve)' },
  { term: 'LD (Ladedruck)', meaning: 'Turbo Boost Pressure', example: 'LDRL (Ladedruckregelung)' },
  { term: 'MD (Motordrehmoment)', meaning: 'Engine Torque (Nm)', example: 'MDNORM (Normalized engine torque)' },
  { term: 'ZW (Zündwinkel)', meaning: 'Ignition Spark Angle (deg BTDC)', example: 'KFZW (Ignition map)' },
  { term: 'BG (Begrenzung)', meaning: 'Limiter / Ceiling Boundary', example: 'KFMDBEG (Torque limiter)' },
  { term: 'EDC', meaning: 'Electronic Diesel Control', example: 'EDC15 / EDC16 / EDC17 / MD1' },
  { term: 'MED / ME', meaning: 'Motronic Electronic Petrol (Gasoline)', example: 'ME7.5 / MED9 / MED17 / MG1' },
  { term: 'DCM (Delphi)', meaning: 'Delphi Common Rail Management', example: 'DCM3.7 / DCM6.2 / DCM7.1AP' }
];

export const DELPHI_DCM_MAPS: EcuMapDefinition[] = [
  {
    id: 'delphi_rail_pressure',
    name: 'Delphi Target Rail Pressure',
    germanAcronym: 'DELPHI_PRAIL_TRG',
    category: 'Fuel & Injection',
    descriptionMizo: 'Delphi Common Rail pump-in fuel rail-a pressure (bar) a pek bitukna map a ni. Mahindra Scorpio/Thar mHawk leh Hyundai CRDi-ah 1600-1800 bar inkar a ni.',
    descriptionEng: 'Delphi Common Rail target rail pressure table in bar. Controls SCV (Suction Control Valve) duty cycle on high-pressure pump based on engine speed and fuel demand.',
    addressHex: '0x064120',
    addressDec: 409888,
    rows: 8,
    cols: 8,
    xAxisName: 'Engine RPM',
    xAxisUnit: 'RPM',
    xAxisValues: [800, 1400, 2000, 2500, 3000, 3500, 4000, 4400],
    yAxisName: 'Fuel Request',
    yAxisUnit: 'mg/str',
    yAxisValues: [10, 20, 30, 40, 50, 60, 70, 80],
    zUnit: 'bar',
    factor: 0.1,
    offset: 0,
    data: [
      [350, 450, 600, 750, 900, 1050, 1150, 1200],
      [420, 580, 800, 1020, 1180, 1280, 1340, 1380],
      [500, 750, 1050, 1280, 1420, 1500, 1540, 1580],
      [600, 920, 1250, 1480, 1600, 1660, 1700, 1720],
      [700, 1100, 1420, 1640, 1720, 1760, 1790, 1800],
      [800, 1250, 1550, 1720, 1780, 1820, 1840, 1850],
      [850, 1320, 1620, 1760, 1820, 1850, 1870, 1880],
      [900, 1380, 1660, 1790, 1840, 1870, 1890, 1900]
    ],
    originalData: [
      [350, 450, 600, 750, 900, 1050, 1150, 1200],
      [420, 580, 800, 1020, 1180, 1280, 1340, 1380],
      [500, 750, 1050, 1280, 1420, 1500, 1540, 1580],
      [600, 920, 1250, 1480, 1600, 1660, 1700, 1720],
      [700, 1100, 1420, 1640, 1720, 1760, 1790, 1800],
      [800, 1250, 1550, 1720, 1780, 1820, 1840, 1850],
      [850, 1320, 1620, 1760, 1820, 1850, 1870, 1880],
      [900, 1380, 1660, 1790, 1840, 1870, 1890, 1900]
    ]
  },
  {
    id: 'delphi_torque_to_iq',
    name: 'Delphi Torque to Fuel Conversion (Nm -> IQ)',
    germanAcronym: 'DELPHI_TRQ_TO_IQ',
    category: 'Torque Management',
    descriptionMizo: 'Nm (Torque) kha engine-in a pek chhuah theih nan fuel injection quantity (mg/str)-ah a chantirna map a ni.',
    descriptionEng: 'Delphi engine torque (Nm) to indicated injected fuel quantity (mg/stroke) calibration surface.',
    addressHex: '0x068400',
    addressDec: 427008,
    rows: 8,
    cols: 8,
    xAxisName: 'Engine RPM',
    xAxisUnit: 'RPM',
    xAxisValues: [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
    yAxisName: 'Requested Torque',
    yAxisUnit: 'Nm',
    yAxisValues: [50, 100, 150, 200, 250, 300, 350, 400],
    zUnit: 'mg/str',
    factor: 0.1,
    offset: 0,
    data: [
      [12, 12, 13, 14, 15, 16, 18, 20],
      [22, 23, 24, 25, 27, 29, 32, 35],
      [32, 33, 34, 36, 38, 41, 45, 49],
      [42, 43, 45, 47, 50, 54, 58, 62],
      [52, 53, 56, 59, 62, 66, 70, 74],
      [61, 63, 66, 69, 73, 77, 81, 85],
      [70, 72, 75, 79, 83, 87, 91, 95],
      [78, 80, 84, 88, 92, 96, 100, 105]
    ],
    originalData: [
      [12, 12, 13, 14, 15, 16, 18, 20],
      [22, 23, 24, 25, 27, 29, 32, 35],
      [32, 33, 34, 36, 38, 41, 45, 49],
      [42, 43, 45, 47, 50, 54, 58, 62],
      [52, 53, 56, 59, 62, 66, 70, 74],
      [61, 63, 66, 69, 73, 77, 81, 85],
      [70, 72, 75, 79, 83, 87, 91, 95],
      [78, 80, 84, 88, 92, 96, 100, 105]
    ]
  },
  {
    id: 'delphi_turbo_boost',
    name: 'Delphi VGT Boost Target Pressure',
    germanAcronym: 'DELPHI_BOOST_MAP',
    category: 'Boost & Air',
    descriptionMizo: 'Delphi VGT turbo boost target pressure (mbar). Mahindra Scorpio/Thar leh Hyundai CRDi-ah boost peak hi 2300-2500 mbar a ni.',
    descriptionEng: 'Delphi Variable Geometry Turbocharger target manifold absolute pressure (mbar) table.',
    addressHex: '0x071200',
    addressDec: 463360,
    rows: 8,
    cols: 8,
    xAxisName: 'Engine RPM',
    xAxisUnit: 'RPM',
    xAxisValues: [1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000],
    yAxisName: 'Fuel Injected (IQ)',
    yAxisUnit: 'mg/str',
    yAxisValues: [15, 25, 35, 45, 55, 65, 75, 85],
    zUnit: 'mbar',
    factor: 1.0,
    offset: 0,
    data: [
      [1050, 1100, 1180, 1250, 1300, 1320, 1300, 1260],
      [1120, 1250, 1420, 1550, 1620, 1650, 1600, 1520],
      [1200, 1450, 1720, 1890, 1980, 1990, 1920, 1810],
      [1300, 1680, 2050, 2220, 2300, 2300, 2220, 2080],
      [1400, 1850, 2280, 2420, 2480, 2460, 2380, 2220],
      [1450, 1950, 2380, 2520, 2560, 2520, 2440, 2280],
      [1480, 2000, 2420, 2560, 2590, 2550, 2470, 2300],
      [1500, 2020, 2450, 2580, 2600, 2560, 2480, 2310]
    ],
    originalData: [
      [1050, 1100, 1180, 1250, 1300, 1320, 1300, 1260],
      [1120, 1250, 1420, 1550, 1620, 1650, 1600, 1520],
      [1200, 1450, 1720, 1890, 1980, 1990, 1920, 1810],
      [1300, 1680, 2050, 2220, 2300, 2300, 2220, 2080],
      [1400, 1850, 2280, 2420, 2480, 2460, 2380, 2220],
      [1450, 1950, 2380, 2520, 2560, 2520, 2440, 2280],
      [1480, 2000, 2420, 2560, 2590, 2550, 2470, 2300],
      [1500, 2020, 2450, 2580, 2600, 2560, 2480, 2310]
    ]
  },
  {
    id: 'delphi_smoke_limiter',
    name: 'Delphi Lambda Smoke Limiter',
    germanAcronym: 'DELPHI_LAMBDA_SMOKE',
    category: 'Emissions',
    descriptionMizo: 'Chhuanlam leh meikhu (smoke/soot) laka engine venhim nan air mass (mg/hub) leh RPM a zira fuel injection zat control-na a ni.',
    descriptionEng: 'Delphi airflow (MAF) vs engine RPM smoke limiter defining maximum allowable fueling to prevent soot formation.',
    addressHex: '0x078900',
    addressDec: 493824,
    rows: 8,
    cols: 8,
    xAxisName: 'Engine RPM',
    xAxisUnit: 'RPM',
    xAxisValues: [1000, 1400, 1800, 2200, 2600, 3000, 3500, 4000],
    yAxisName: 'Air Mass (MAF)',
    yAxisUnit: 'mg/hub',
    yAxisValues: [400, 500, 600, 700, 800, 900, 1000, 1100],
    zUnit: 'mg/str',
    factor: 0.1,
    offset: 0,
    data: [
      [22, 24, 26, 28, 29, 30, 29, 28],
      [28, 31, 33, 36, 37, 38, 37, 35],
      [34, 38, 42, 45, 46, 47, 46, 43],
      [41, 46, 51, 54, 56, 57, 55, 52],
      [47, 53, 60, 64, 66, 67, 65, 61],
      [53, 61, 68, 73, 76, 77, 74, 70],
      [59, 67, 76, 82, 85, 86, 83, 78],
      [64, 73, 82, 89, 92, 93, 90, 85]
    ],
    originalData: [
      [22, 24, 26, 28, 29, 30, 29, 28],
      [28, 31, 33, 36, 37, 38, 37, 35],
      [34, 38, 42, 45, 46, 47, 46, 43],
      [41, 46, 51, 54, 56, 57, 55, 52],
      [47, 53, 60, 64, 66, 67, 65, 61],
      [53, 61, 68, 73, 76, 77, 74, 70],
      [59, 67, 76, 82, 85, 86, 83, 78],
      [64, 73, 82, 89, 92, 93, 90, 85]
    ]
  }
];
