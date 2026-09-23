import { EcuMapDefinition, ProjectMetadata } from '../types/winols';

export interface VehicleProfile {
  id: string;
  category: '2wheeler' | '3wheeler' | 'passenger_car' | 'commercial_truck';
  categoryLabelMizo: string;
  categoryLabelEng: string;
  name: string;
  subTitle: string;
  engine: string;
  ecuType: string;
  ecuChip: string;
  stockPower: string;
  stage1Power: string;
  stockTorque: string;
  stage1Torque: string;
  defaultBoostIncrease: number; // mbar (0 if naturally aspirated)
  defaultTorqueIncrease: number; // %
  defaultRailIncrease: number; // bar (0 if port injection)
  recommendedRevLimit: number; // RPM
  specialFeaturesMizo: string[];
  specialFeaturesEng: string[];
  maps: EcuMapDefinition[];
  metadata: ProjectMetadata;
}

export const INDIAN_VEHICLES_DATABASE: VehicleProfile[] = [
  // 1. 2-WHEELER: Royal Enfield Classic 350 / Meteor 350 (J-Series BS6)
  {
    id: 're_classic350_j_series',
    category: '2wheeler',
    categoryLabelMizo: '2-Wheeler (Bikes)',
    categoryLabelEng: '2-Wheeler (Motorcycles)',
    name: 'Royal Enfield Classic / Meteor 350 (J-Series BS6)',
    subTitle: 'Bosch MSE 6.0 / MSE 8.0 (349cc Air-Oil Cooled SOHC)',
    engine: '349cc Single-Cylinder Fuel Injected J-Series',
    ecuType: 'Bosch MSE 6.0 / MSE 8.0 EFI',
    ecuChip: 'ST10F275 / SPC560P (512 KB Flash)',
    stockPower: '20.2 BHP @ 6100 RPM',
    stage1Power: '23.8 BHP (+3.6 BHP)',
    stockTorque: '27.0 Nm @ 4000 RPM',
    stage1Torque: '31.5 Nm (+4.5 Nm)',
    defaultBoostIncrease: 0, // NA
    defaultTorqueIncrease: 16,
    defaultRailIncrease: 0,
    recommendedRevLimit: 7200,
    specialFeaturesMizo: [
      'Rev-Limiter vawrh san: Stock 6,800 RPM atangin 7,200 RPM-ah safe-in a tlan theih',
      'Ignition Spark Timing: Low-to-Mid range (2000-4500 RPM)-ah 3° advance a ni a, tlanglawn leh chhohvah a phit zawk',
      'BS6 Lean Stumble Fix: Target Lambda 1.0 (14.7 AFR) atangin 0.90 (13.2 AFR)-ah tih-rich a ni a, engine sa lutuk a tireh',
      'Throttle response curve quickened'
    ],
    specialFeaturesEng: [
      'Rev-Limiter lifted: Stock 6,800 RPM extended safely to 7,200 RPM',
      'Ignition Timing Advance: +3.0° in mid-range band (2000-4500 RPM) for punchy incline pull',
      'BS6 Lean-Burn Surge Remediation: Target Lambda richened from 1.0 to 0.90 (13.2 AFR) under load',
      'Direct throttle cable simulation eliminating decel popping'
    ],
    metadata: {
      projectName: 'Royal Enfield 350 J-Series Stage 1 Remap',
      vehicleModel: 'Royal Enfield Classic/Hunter 350 (BS6)',
      ecuManufacturer: 'Bosch MSE 6.0 EFI',
      ecuHardwareId: 'MSE60_RE350_HW01',
      ecuSoftwareId: '1037521098',
      fileSizeBytes: 524288,
      fileName: 'RE_350_Classic_JSeries_MSE60_ORI.bin',
      isCustomFile: false,
    },
    maps: [
      {
        id: 're_spark_advance',
        name: 'Ignition Spark Advance (KFZW)',
        germanAcronym: 'KFZW (Zündwinkel)',
        category: 'Torque Management',
        descriptionMizo: 'Plug alh hma/tlai (degrees BTDC) bitukna. Advance hian horsepower leh throttle response a tichak.',
        descriptionEng: 'Spark ignition angle advance in degrees BTDC mapped across engine RPM and relative cylinder air charge.',
        addressHex: '0x028100',
        addressDec: 164096,
        rows: 8,
        cols: 8,
        xAxisName: 'Engine RPM',
        xAxisUnit: 'RPM',
        xAxisValues: [1500, 2200, 3000, 3800, 4500, 5200, 6000, 6800],
        yAxisName: 'Engine Load (TPS)',
        yAxisUnit: '%',
        yAxisValues: [15, 30, 45, 60, 75, 85, 95, 100],
        zUnit: 'deg BTDC',
        factor: 0.75,
        offset: 0,
        data: [
          [12, 14, 18, 22, 26, 29, 31, 32],
          [14, 17, 21, 25, 29, 32, 34, 35],
          [16, 20, 24, 28, 32, 35, 37, 38],
          [18, 22, 27, 31, 35, 38, 40, 41],
          [19, 24, 29, 33, 37, 40, 42, 43],
          [20, 25, 30, 34, 38, 41, 43, 44],
          [21, 26, 31, 35, 39, 42, 44, 45],
          [22, 27, 32, 36, 40, 43, 45, 46]
        ],
        originalData: [
          [10, 12, 15, 19, 23, 26, 28, 29],
          [12, 14, 18, 22, 26, 29, 31, 32],
          [14, 17, 21, 25, 29, 32, 34, 35],
          [16, 19, 24, 28, 32, 35, 37, 38],
          [17, 21, 26, 30, 34, 37, 39, 40],
          [18, 22, 27, 31, 35, 38, 40, 41],
          [19, 23, 28, 32, 36, 39, 41, 42],
          [20, 24, 29, 33, 37, 40, 42, 43]
        ]
      },
      {
        id: 're_lambda_target',
        name: 'Target Lambda Fuel Enrichment (KFLAMKR)',
        germanAcronym: 'KFLAMKR (Soll-Lambda)',
        category: 'Fuel & Injection',
        descriptionMizo: 'Petrol leh Boruak inpawlh zat (Lambda Target). 0.88 - 0.90 hian power peak a pe a, cylinder a tivawng bawk.',
        descriptionEng: 'Target equivalence ratio (Lambda). 0.88 - 0.90 provides rich peak torque fueling preventing cylinder detonation.',
        addressHex: '0x029400',
        addressDec: 168960,
        rows: 8,
        cols: 8,
        xAxisName: 'Engine RPM',
        xAxisUnit: 'RPM',
        xAxisValues: [1500, 2200, 3000, 3800, 4500, 5200, 6000, 6800],
        yAxisName: 'Throttle Opening',
        yAxisUnit: '%',
        yAxisValues: [20, 35, 50, 65, 80, 90, 95, 100],
        zUnit: 'Lambda x1000',
        factor: 0.001,
        offset: 0,
        data: [
          [995, 990, 985, 980, 975, 970, 960, 950],
          [990, 985, 975, 965, 955, 945, 935, 925],
          [980, 970, 955, 940, 930, 915, 905, 895],
          [970, 955, 935, 920, 905, 895, 885, 880],
          [960, 940, 920, 905, 895, 885, 880, 875],
          [950, 930, 910, 895, 885, 880, 875, 870],
          [945, 925, 905, 890, 880, 875, 870, 868],
          [940, 920, 900, 885, 875, 870, 865, 865]
        ],
        originalData: [
          [1000, 1000, 1000, 1000, 995, 990, 985, 980],
          [1000, 1000, 995, 990, 980, 970, 960, 950],
          [1000, 995, 985, 975, 960, 950, 940, 930],
          [995, 985, 970, 955, 940, 930, 920, 915],
          [990, 975, 955, 940, 930, 920, 910, 905],
          [985, 965, 945, 930, 920, 910, 905, 900],
          [980, 960, 940, 925, 915, 905, 900, 895],
          [975, 955, 935, 920, 910, 900, 895, 890]
        ]
      }
    ]
  },

  // 2. 2-WHEELER: KTM Duke 390 / RC 390 (Bosch ME17.9.71)
  {
    id: 'ktm_duke_390_bs6',
    category: '2wheeler',
    categoryLabelMizo: '2-Wheeler (Bikes)',
    categoryLabelEng: '2-Wheeler (Motorcycles)',
    name: 'KTM Duke / RC 390 (BS6 Ready)',
    subTitle: 'Bosch ME17.9.71 (373cc DOHC 4-Valve Liquid Cooled)',
    engine: '373.2cc Single-Cylinder 4V Liquid-Cooled',
    ecuType: 'Bosch ME17.9.71 / Keihin Ride-by-Wire',
    ecuChip: 'Infineon TriCore TC1724 (1.5 MB Flash)',
    stockPower: '43.5 BHP @ 9000 RPM',
    stage1Power: '48.2 BHP (+4.7 BHP)',
    stockTorque: '37.0 Nm @ 7000 RPM',
    stage1Torque: '41.2 Nm (+4.2 Nm)',
    defaultBoostIncrease: 0,
    defaultTorqueIncrease: 14,
    defaultRailIncrease: 0,
    recommendedRevLimit: 10400,
    specialFeaturesMizo: [
      'Ride-by-Wire 1:1 Direct Throttle Map: Stock electronic throttle lag vawm bo nghal vek',
      'Radiator Cooling Fan Trigger: Stock 96°C atangin 88°C-ah a in-on hma, tualchhung sa lutuk a veng',
      'Quickshifter Cut Duration: 65ms atangin 48ms-ah tihniam a ni a, gear thlak a rang zawk',
      'Top Speed Governor: 168 km/h speed limiter bypass'
    ],
    specialFeaturesEng: [
      'Linear 1:1 Electronic Throttle Mapping: Removes stock torque filtering and fly-by-wire lag',
      'Lower Radiator Fan Switch Point: Drops fan trigger from 96°C to 88°C preventing traffic overheating',
      'Bi-directional Quickshifter Ignition Cut Optimization: Trimmed from 65ms to 48ms for crisp shifts',
      'V-Max Speed Governor Release: 168 km/h electronic factory ceiling removed'
    ],
    metadata: {
      projectName: 'KTM Duke 390 Stage 1 Aggressive Track Remap',
      vehicleModel: 'KTM Duke 390 (2020-2024 BS6)',
      ecuManufacturer: 'Bosch ME17.9.71',
      ecuHardwareId: 'ME17971_TC1724',
      ecuSoftwareId: '1037539012',
      fileSizeBytes: 1572864,
      fileName: 'KTM_390_Duke_BS6_1037539012_ORI.bin',
      isCustomFile: false,
    },
    maps: [
      {
        id: 'ktm_throttle_rbw',
        name: 'Ride-by-Wire Electronic Throttle Request',
        germanAcronym: 'KFPED (Fahrpedal-Kennfeld)',
        category: 'Torque Management',
        descriptionMizo: 'Handle-a gas herh zat leh throttle butterfly inhawn zat in-thlunzawmna. 1:1-ah a kal nghal zut zut.',
        descriptionEng: 'Electronic throttle blade opening angle (%) indexed to physical twist grip angle and RPM.',
        addressHex: '0x048200',
        addressDec: 295424,
        rows: 8,
        cols: 8,
        xAxisName: 'Engine RPM',
        xAxisUnit: 'RPM',
        xAxisValues: [2000, 3500, 5000, 6500, 7500, 8500, 9500, 10200],
        yAxisName: 'Twist Grip (%)',
        yAxisUnit: '%',
        yAxisValues: [10, 25, 40, 55, 70, 85, 95, 100],
        zUnit: 'Throttle %',
        factor: 1.0,
        offset: 0,
        data: [
          [10, 10, 10, 10, 10, 10, 10, 10],
          [25, 25, 25, 25, 25, 25, 25, 25],
          [40, 40, 40, 40, 40, 40, 40, 40],
          [55, 55, 55, 55, 55, 55, 55, 55],
          [70, 70, 70, 70, 70, 70, 70, 70],
          [85, 85, 85, 85, 85, 85, 85, 85],
          [95, 95, 95, 95, 95, 95, 95, 95],
          [100, 100, 100, 100, 100, 100, 100, 100]
        ],
        originalData: [
          [6, 7, 8, 9, 10, 10, 10, 10],
          [16, 18, 20, 22, 23, 24, 25, 25],
          [28, 31, 33, 36, 37, 38, 39, 40],
          [42, 45, 48, 51, 52, 53, 54, 55],
          [56, 60, 63, 66, 67, 68, 69, 70],
          [71, 75, 78, 81, 82, 83, 84, 85],
          [84, 88, 90, 92, 93, 94, 94, 95],
          [92, 95, 97, 98, 99, 100, 100, 100]
        ]
      }
    ]
  },

  // 3. 3-WHEELER: Bajaj Compact RE / Maxima (CNG & Petrol 236cc)
  {
    id: 'bajaj_compact_re_cng',
    category: '3wheeler',
    categoryLabelMizo: '3-Wheeler (Auto Rickshaw)',
    categoryLabelEng: '3-Wheeler (Commercial Auto)',
    name: 'Bajaj Compact RE / Maxima CNG & Petrol',
    subTitle: 'Bosch MSE 3.0 / Delphi MT05 (236cc DTS-i Single Cylinder)',
    engine: '236cc Twin-Spark DTS-i CNG/Petrol Engine',
    ecuType: 'Bosch MSE 3.0 / Delphi MT05 ECU',
    ecuChip: 'ST10 / Renesas M16C (256 KB Flash)',
    stockPower: '9.6 BHP @ 4750 RPM (CNG)',
    stage1Power: '11.8 BHP (+2.2 BHP - Huge CNG Boost)',
    stockTorque: '16.2 Nm @ 3000 RPM',
    stage1Torque: '19.5 Nm (+3.3 Nm Low-End Hauling)',
    defaultBoostIncrease: 0,
    defaultTorqueIncrease: 18,
    defaultRailIncrease: 0,
    recommendedRevLimit: 5800,
    specialFeaturesMizo: [
      'CNG Octane 120 Spark Advance: CNG-in a mamawh spark timing 4° advance niin chhohvah a thi tawh lo',
      'Low-End Torque (Passenger/Luggage Pull): 2000-3200 RPM inkarah engine chakna vawrh san a ni',
      'Anti-Stall Idle Governor: Ding laia clutch thlah thuta engine thih mai mai thinna ti-reh',
      'Fuel Efficiency: CNG consumption 8-12% in a tlem zawk'
    ],
    specialFeaturesEng: [
      '120-Octane CNG High-Compression Spark Advance: +4.0° timing eliminates notorious CNG incline lag',
      'Low-RPM Cargo Torque Fill: Significant torque curve uplift at 2000-3200 RPM for heavy hill climbing',
      'Anti-Stall Engine Idle Governor: Elevated idle recovery torque stops stall upon quick clutch release',
      'Specific CNG Fuel Density Calibration: 8-12% lower kg/km gas consumption'
    ],
    metadata: {
      projectName: 'Bajaj Auto Rickshaw CNG High-Torque Tune',
      vehicleModel: 'Bajaj Compact RE 3-Wheeler (CNG BS6)',
      ecuManufacturer: 'Bosch MSE 3.0 Commercial',
      ecuHardwareId: 'MSE30_BAJAJ_RE',
      ecuSoftwareId: '1037498231',
      fileSizeBytes: 262144,
      fileName: 'Bajaj_RE_Compact_CNG_MSE30_ORI.bin',
      isCustomFile: false,
    },
    maps: [
      {
        id: 'bajaj_cng_spark',
        name: 'CNG Ignition Advance Table',
        germanAcronym: 'KFZW_CNG',
        category: 'Torque Management',
        descriptionMizo: 'CNG 120-Octane tan spark timing advance. Chhohvah pickup a vawrh thut.',
        descriptionEng: 'High-octane dedicated CNG ignition timing table optimized for slow-burning methane.',
        addressHex: '0x012400',
        addressDec: 74752,
        rows: 8,
        cols: 8,
        xAxisName: 'Engine RPM',
        xAxisUnit: 'RPM',
        xAxisValues: [1200, 1800, 2400, 3000, 3600, 4200, 4800, 5400],
        yAxisName: 'Manifold Pressure (MAP)',
        yAxisUnit: 'kPa',
        yAxisValues: [25, 40, 55, 70, 80, 90, 95, 100],
        zUnit: 'deg BTDC',
        factor: 0.75,
        offset: 0,
        data: [
          [16, 20, 25, 29, 33, 36, 38, 40],
          [18, 22, 27, 31, 35, 38, 40, 42],
          [20, 24, 29, 33, 37, 40, 42, 44],
          [22, 26, 31, 35, 39, 42, 44, 46],
          [24, 28, 33, 37, 41, 44, 46, 47],
          [25, 29, 34, 38, 42, 45, 47, 48],
          [26, 30, 35, 39, 43, 46, 48, 49],
          [27, 31, 36, 40, 44, 47, 49, 50]
        ],
        originalData: [
          [12, 16, 21, 25, 29, 32, 34, 36],
          [14, 18, 23, 27, 31, 34, 36, 38],
          [16, 20, 25, 29, 33, 36, 38, 40],
          [18, 22, 27, 31, 35, 38, 40, 42],
          [20, 24, 29, 33, 37, 40, 42, 43],
          [21, 25, 30, 34, 38, 41, 43, 44],
          [22, 26, 31, 35, 39, 42, 44, 45],
          [23, 27, 32, 36, 40, 43, 45, 46]
        ]
      }
    ]
  },

  // 4. PASSENGER SUV: Mahindra Scorpio / Thar 2.2 mHawk (Delphi DCM3.7)
  {
    id: 'mahindra_thar_scorpio_mhawk',
    category: 'passenger_car',
    categoryLabelMizo: 'Passenger Car / SUV (Diesel Turbo)',
    categoryLabelEng: 'Passenger Car / SUV (Diesel Turbo)',
    name: 'Mahindra Thar / Scorpio Classic 2.2 mHawk',
    subTitle: 'Delphi DCM3.7AP (2179cc CRDe Turbocharged)',
    engine: '2.2L 4-Cylinder mHawk Turbo Diesel (Common Rail)',
    ecuType: 'Delphi DCM3.7AP (Renesas SH72513)',
    ecuChip: 'Renesas SH72513 (2.0 MB Flash)',
    stockPower: '140 BHP @ 3750 RPM',
    stage1Power: '178 BHP (+38 BHP)',
    stockTorque: '320 Nm @ 1500-2800 RPM',
    stage1Torque: '405 Nm (+85 Nm Offroad Punch)',
    defaultBoostIncrease: 160,
    defaultTorqueIncrease: 22,
    defaultRailIncrease: 80,
    recommendedRevLimit: 4800,
    specialFeaturesMizo: [
      'Low-End Offroad Crawl Torque: 1200-2000 RPM inkarah +60 Nm torque a vawrh chhuak nghal',
      'Turbo Boost Peak: Stock 2.1 bar atangin 2.45 bar absolute pressure-ah optimize a ni',
      'Common Rail Pressure: 1600 bar atangin 1750 bar-ah a vawrh a, atomization a tha zawk',
      'EGR Deactivation: Carbon soot khawlna ti-tawp tura EGR valve closed (0%)'
    ],
    specialFeaturesEng: [
      'Low-RPM Offroad Crawl Torque: +60 Nm instant torque from 1200-2000 RPM for extreme crawling',
      'Turbo Boost Elevation: Target manifold pressure safely increased from 2.1 bar to 2.45 bar',
      'Common Rail Atomization: Rail ceiling lifted from 1600 bar to 1750 bar for ultra-fine diesel spray',
      'EGR Off Calibration: Valve held closed at 0% to prevent intake tract carbon sludge choking'
    ],
    metadata: {
      projectName: 'Mahindra Scorpio/Thar 2.2 mHawk Stage 1 Remap',
      vehicleModel: 'Mahindra Thar / Scorpio Classic 2.2 CRDe',
      ecuManufacturer: 'Delphi DCM3.7AP',
      ecuHardwareId: '28264952',
      ecuSoftwareId: '28264951_U8654',
      fileSizeBytes: 2097152,
      fileName: '28264951_Scorpio_mHawk_DCM37.bin',
      isCustomFile: false,
    },
    maps: [
      {
        id: 'delphi_rail_pressure',
        name: 'Delphi Target Rail Pressure',
        germanAcronym: 'DELPHI_PRAIL_TRG',
        category: 'Fuel & Injection',
        descriptionMizo: 'Delphi Common Rail pump-in fuel rail-a pressure (bar) a pek bitukna map a ni.',
        descriptionEng: 'Delphi Common Rail target rail pressure table in bar.',
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
          [380, 480, 650, 820, 980, 1140, 1240, 1280],
          [460, 630, 860, 1100, 1260, 1370, 1430, 1460],
          [550, 810, 1130, 1370, 1510, 1600, 1630, 1660],
          [660, 990, 1330, 1570, 1700, 1750, 1780, 1800],
          [760, 1180, 1510, 1730, 1800, 1840, 1860, 1870],
          [860, 1330, 1640, 1800, 1850, 1880, 1900, 1910],
          [910, 1400, 1710, 1840, 1880, 1910, 1920, 1930],
          [960, 1460, 1750, 1860, 1900, 1930, 1940, 1950]
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
      }
    ]
  },

  // 5. PASSENGER CAR: Maruti Suzuki Swift / Brezza 1.3 DDiS (Marelli 8F3 / 9DF)
  {
    id: 'maruti_swift_13_ddis',
    category: 'passenger_car',
    categoryLabelMizo: 'Passenger Car / SUV (Diesel Turbo)',
    categoryLabelEng: 'Passenger Car / SUV (Diesel Turbo)',
    name: 'Maruti Suzuki Swift / Brezza 1.3 DDiS',
    subTitle: 'Marelli Multijet 8F3 / 9DF (1248cc 16V DDiS 75HP / 90HP)',
    engine: '1.3L 4-Cylinder DDiS Multijet Turbo Diesel',
    ecuType: 'Marelli MJD 8F3 / 9DF',
    ecuChip: 'Motorola MPC5634 (2.0 MB Flash)',
    stockPower: '75 BHP @ 4000 RPM',
    stage1Power: '98 BHP (+23 BHP - Swift Pocket Rocket)',
    stockTorque: '190 Nm @ 2000 RPM',
    stage1Torque: '245 Nm (+55 Nm)',
    defaultBoostIncrease: 140,
    defaultTorqueIncrease: 20,
    defaultRailIncrease: 60,
    recommendedRevLimit: 5100,
    specialFeaturesMizo: [
      'Turbo Lag Eradication: 1500 RPM hnuai lama lethargic lutuk a tireh nghal',
      'Smoke Limiter (Lambda) Calibration: Meikhu dum chhuak lovin fuel a vawrh thut thei',
      'Highway Mileage Booster: Cruising speed (80-100 km/h)-ah 24-26 km/l a thleng thei'
    ],
    specialFeaturesEng: [
      'Sub-2000 RPM Turbo Lag Eradication: Sharpens wastegate and variable vane transition',
      'Smoke Limiter Airflow Recalibration: Allows high initial fuel shot without soot smoke puff',
      'Highway Cruising Efficiency: Delivers up to 24-26 km/l on steady-state throttle'
    ],
    metadata: {
      projectName: 'Maruti Swift 1.3 DDiS Marelli Stage 1',
      vehicleModel: 'Maruti Suzuki Swift 1.3 DDiS Multijet',
      ecuManufacturer: 'Marelli MJD 8F3.B1',
      ecuHardwareId: 'MJD8F3_HW04P',
      ecuSoftwareId: '1037399824',
      fileSizeBytes: 2097152,
      fileName: 'Maruti_Swift_13DDiS_MJD8F3_ORI.bin',
      isCustomFile: false,
    },
    maps: [
      {
        id: 'swift_turbo_boost',
        name: 'Marelli Boost Pressure Target',
        germanAcronym: 'MJD_BOOST_TARGET',
        category: 'Boost & Air',
        descriptionMizo: '1.3 DDiS Turbo boost target map (mbar).',
        descriptionEng: 'Marelli 1.3 Multijet target manifold absolute pressure map.',
        addressHex: '0x082100',
        addressDec: 532736,
        rows: 8,
        cols: 8,
        xAxisName: 'Engine RPM',
        xAxisUnit: 'RPM',
        xAxisValues: [1200, 1600, 2000, 2400, 2800, 3200, 3600, 4200],
        yAxisName: 'Fuel Injected (IQ)',
        yAxisUnit: 'mg/str',
        yAxisValues: [10, 20, 30, 40, 50, 60, 70, 80],
        zUnit: 'mbar',
        factor: 1.0,
        offset: 0,
        data: [
          [1080, 1150, 1260, 1380, 1460, 1480, 1450, 1380],
          [1160, 1320, 1550, 1720, 1800, 1820, 1780, 1680],
          [1240, 1520, 1850, 2040, 2140, 2150, 2080, 1940],
          [1350, 1760, 2170, 2370, 2450, 2450, 2370, 2220],
          [1440, 1920, 2370, 2520, 2580, 2560, 2480, 2320],
          [1480, 2000, 2450, 2600, 2640, 2600, 2520, 2350],
          [1500, 2040, 2480, 2620, 2650, 2610, 2530, 2360],
          [1520, 2060, 2500, 2630, 2650, 2610, 2530, 2360]
        ],
        originalData: [
          [1000, 1050, 1140, 1250, 1320, 1340, 1310, 1240],
          [1080, 1220, 1420, 1580, 1660, 1680, 1640, 1540],
          [1150, 1400, 1710, 1890, 1990, 2000, 1930, 1800],
          [1250, 1620, 2020, 2220, 2300, 2300, 2220, 2080],
          [1340, 1780, 2220, 2370, 2430, 2410, 2330, 2180],
          [1380, 1850, 2300, 2450, 2490, 2450, 2370, 2210],
          [1400, 1890, 2330, 2470, 2500, 2460, 2380, 2220],
          [1410, 1900, 2350, 2480, 2500, 2460, 2380, 2220]
        ]
      }
    ]
  },

  // 6. COMMERCIAL TRUCK / UTILITY: Tata 4SP CRDi (Sumo Gold vs Tata 407 / 709)
  {
    id: 'tata_4sp_crdi_sumo_407',
    category: 'commercial_truck',
    categoryLabelMizo: 'Commercial Truck / Pickup',
    categoryLabelEng: 'Commercial Truck / Pickup',
    name: 'Tata Sumo Gold & SK407 3.0L CRDi (4SP Engine)',
    subTitle: 'Delphi DCM 2.5 / Bosch EDC16C39 (2956cc 4SP CRDi Turbo)',
    engine: '2956cc (3.0L) 4-Cylinder 4SP CRDi Turbo Diesel',
    ecuType: 'Delphi DCM 2.5 / Bosch EDC16C39',
    ecuChip: 'MPC562 / MPC555 (1.0MB / 2.0MB Flash)',
    stockPower: 'Sumo: 84 BHP / 407: 70-75 BHP',
    stage1Power: '115 BHP (+30 to 45 BHP Unlock)',
    stockTorque: 'Sumo: 250 Nm / 407: 225 Nm @ 1400 RPM',
    stage1Torque: '320 Nm (+70 to 95 Nm Hauling Torque)',
    defaultBoostIncrease: 180,
    defaultTorqueIncrease: 24,
    defaultRailIncrease: 70,
    recommendedRevLimit: 4200,
    specialFeaturesMizo: [
      'Engine Hardware Thuhmun (2956cc 4SP CRDi): Sumo leh 407 te hi block, head, piston leh crank a inang chiah chiah',
      'ECU Software Detuning Paihna: Tata 407 hi commercial load rit phurh laia clutch/gearbox chhiat loh nan factory-in torque limiter-ah a hmet tihniam (detuned)',
      'Torque Limiter Unlock: 407 truck hi Sumo Gold output aia sang zawk (320 Nm)-ah awlsam takin remap theih',
      'Smoke Limiter & Injection Duration: Chho lian pui puiah gear thlak ngai miah lovin a lawn thei'
    ],
    specialFeaturesEng: [
      'Identical 4SP 3.0L Hardware: Sumo Gold and 407 truck share exact cylinder block, bore/stroke, and crank',
      'OEM De-tune Removal: Tata restricts the 407 truck to protect commercial driveline/clutch under 5+ ton loads',
      'Torque Limiter Calibration: Unlocks full 320 Nm potential transforming sluggish 407 uphill climbing',
      'Extended Smoke & Duration Maps: Eliminates lugging hesitation on steep gradients with cargo'
    ],
    metadata: {
      projectName: 'Tata 4SP CRDi Sumo vs 407 Power Unlock',
      vehicleModel: 'Tata Sumo Gold / SK407 3.0 CRDi BS4',
      ecuManufacturer: 'Delphi DCM2.5 / Bosch EDC16',
      ecuHardwareId: 'TATA_4SP_CRDI_HW02',
      ecuSoftwareId: '28194025_TATA407',
      fileSizeBytes: 2097152,
      fileName: 'Tata_4SP_3.0_CRDi_EDC16_ORI.bin',
      isCustomFile: false,
    },
    maps: [
      {
        id: 'tata_4sp_torque_limit',
        name: 'Tata 4SP Engine Torque Limiter',
        germanAcronym: 'TATA_4SP_TLIM',
        category: 'Torque Management',
        descriptionMizo: 'Tata 407 truck software limiter. Factory detune paihin Sumo Gold aia sang 320 Nm-ah a pawt chhuak.',
        descriptionEng: 'Main gross torque limiter across engine RPM and atmospheric pressure.',
        addressHex: '0x04C200',
        addressDec: 311808,
        rows: 8,
        cols: 8,
        xAxisName: 'Engine RPM',
        xAxisUnit: 'RPM',
        xAxisValues: [1000, 1400, 1800, 2200, 2600, 3000, 3400, 3800],
        yAxisName: 'Gear / Range',
        yAxisUnit: 'Gear 1-5',
        yAxisValues: [1, 2, 3, 4, 5, 5, 5, 5],
        zUnit: 'Nm Torque',
        factor: 1.0,
        offset: 0,
        data: [
          [210, 290, 320, 320, 310, 295, 270, 230],
          [220, 300, 325, 325, 315, 300, 275, 235],
          [230, 310, 330, 330, 320, 305, 280, 240],
          [235, 315, 330, 330, 320, 305, 280, 240],
          [240, 320, 330, 330, 320, 305, 280, 240],
          [240, 320, 330, 330, 320, 305, 280, 240],
          [240, 320, 330, 330, 320, 305, 280, 240],
          [240, 320, 330, 330, 320, 305, 280, 240]
        ],
        originalData: [
          [160, 210, 225, 225, 215, 200, 180, 150],
          [170, 220, 225, 225, 215, 200, 180, 150],
          [180, 225, 230, 230, 220, 205, 185, 155],
          [185, 225, 230, 230, 220, 205, 185, 155],
          [190, 225, 230, 230, 220, 205, 185, 155],
          [190, 225, 230, 230, 220, 205, 185, 155],
          [190, 225, 230, 230, 220, 205, 185, 155],
          [190, 225, 230, 230, 220, 205, 185, 155]
        ]
      }
    ]
  },

  // 7. COMMERCIAL PICKUP: Mahindra Bolero Camper / Maxi Truck 2.5L m2DiCR
  {
    id: 'mahindra_bolero_m2dicr',
    category: 'commercial_truck',
    categoryLabelMizo: 'Commercial Truck / Pickup',
    categoryLabelEng: 'Commercial Truck / Pickup',
    name: 'Mahindra Bolero Maxi Truck / Camper 2.5 m2DiCR',
    subTitle: 'Bosch EDC17C55 / Delphi DCM3.7 (2523cc m2DiCR Direct Injection)',
    engine: '2.5L 4-Cylinder m2DiCR Turbo Diesel (Direct Injection)',
    ecuType: 'Bosch EDC17C55 / Delphi DCM3.7',
    ecuChip: 'Infineon TriCore TC1767 (2.0 MB Flash)',
    stockPower: '65 BHP @ 3200 RPM',
    stage1Power: '88 BHP (+23 BHP)',
    stockTorque: '195 Nm @ 1400-2200 RPM',
    stage1Torque: '260 Nm (+65 Nm Low-RPM Crawl)',
    defaultBoostIncrease: 150,
    defaultTorqueIncrease: 26,
    defaultRailIncrease: 80,
    recommendedRevLimit: 3800,
    specialFeaturesMizo: [
      'Low-End Crawl Torque (1100-1800 RPM): Sand/gravel emaw buhfaipang rit tak phurh laia chho chhuahpui zung zung nan',
      'Smoke Limiter (E-Airflow) Calibration: Meikhu dum chhuak lovin fuel a vawrh chak',
      'Speed Governor Recalibration: Factory 80 km/h ceiling highway overtake tura optimize',
      'Common Rail Pressure: 1400 bar atangin 1550 bar-ah tiphung in diesel atomization a tha lehzual'
    ],
    specialFeaturesEng: [
      'Low-End Crawling Haul (+65 Nm): Massive torque surge at 1200-1800 RPM for heavy incline hill climbing',
      'Smoke Limiter Flow Optimization: Clean black-smoke-free initial transient fueling burst',
      'Electronic Speed Governor: 80 km/h factory fleet ceiling raised safely for passing maneuvers',
      'Rail Injection Pressure Uplift: 1400 bar to 1550 bar for cleaner combustion and mileage'
    ],
    metadata: {
      projectName: 'Mahindra Bolero 2.5 m2DiCR Commercial Hill Tune',
      vehicleModel: 'Mahindra Bolero Maxi Truck Plus (BS4/BS6)',
      ecuManufacturer: 'Bosch EDC17C55 Commercial',
      ecuHardwareId: 'EDC17C55_BOLERO_25',
      ecuSoftwareId: '1037508922',
      fileSizeBytes: 2097152,
      fileName: 'Bolero_m2DiCR_EDC17C55_ORI.bin',
      isCustomFile: false,
    },
    maps: [
      {
        id: 'bolero_torque_limiter',
        name: 'Bolero m2DiCR Hill Torque Limiter',
        germanAcronym: 'KFMIRL_BOLERO',
        category: 'Torque Management',
        descriptionMizo: 'Bolero load phurh laia chho lawn theihna tura torque vawrh sanna.',
        descriptionEng: 'Commercial utility torque limiter across RPM and gear.',
        addressHex: '0x054800',
        addressDec: 346112,
        rows: 8,
        cols: 8,
        xAxisName: 'Engine RPM',
        xAxisUnit: 'RPM',
        xAxisValues: [900, 1200, 1600, 2000, 2400, 2800, 3200, 3600],
        yAxisName: 'Gear Selection',
        yAxisUnit: 'Gear 1-5',
        yAxisValues: [1, 2, 3, 4, 5, 5, 5, 5],
        zUnit: 'Nm Torque',
        factor: 1.0,
        offset: 0,
        data: [
          [180, 245, 260, 260, 250, 235, 210, 180],
          [190, 250, 265, 265, 255, 240, 215, 185],
          [195, 255, 265, 265, 255, 240, 215, 185],
          [200, 260, 265, 265, 255, 240, 215, 185],
          [200, 260, 265, 265, 255, 240, 215, 185],
          [200, 260, 265, 265, 255, 240, 215, 185],
          [200, 260, 265, 265, 255, 240, 215, 185],
          [200, 260, 265, 265, 255, 240, 215, 185]
        ],
        originalData: [
          [130, 175, 195, 195, 185, 170, 150, 120],
          [140, 185, 195, 195, 185, 170, 150, 120],
          [150, 195, 195, 195, 185, 170, 150, 120],
          [150, 195, 195, 195, 185, 170, 150, 120],
          [150, 195, 195, 195, 185, 170, 150, 120],
          [150, 195, 195, 195, 185, 170, 150, 120],
          [150, 195, 195, 195, 185, 170, 150, 120],
          [150, 195, 195, 195, 185, 170, 150, 120]
        ]
      }
    ]
  },

  // 8. HEAVY COMMERCIAL TRUCK / TIPPER: Tata Signa / Prima 2823 (Cummins ISBe 5.6 / 6.7L)
  {
    id: 'tata_signa_cummins_isbe',
    category: 'commercial_truck',
    categoryLabelMizo: 'Commercial Truck / Pickup',
    categoryLabelEng: 'Commercial Truck / Pickup',
    name: 'Tata Signa / Prima Heavy Tipper 2823 (Cummins 6.7L)',
    subTitle: 'Cummins CM2150 / CM2250 (6.7L 6-Cylinder 24V Turbo Intercooled)',
    engine: '6.7L 6-Cylinder Cummins ISBe Common Rail Diesel',
    ecuType: 'Cummins CM2150 / CM2250 Heavy Commercial',
    ecuChip: 'Motorola MPC5554 (2.0 MB / 4.0 MB Flash)',
    stockPower: '230 BHP @ 2200 RPM',
    stage1Power: '285 BHP (+55 BHP Heavy Haul)',
    stockTorque: '850 Nm @ 1100-1700 RPM',
    stage1Torque: '1050 Nm (+200 Nm Quarry/Mining Hauling)',
    defaultBoostIncrease: 250,
    defaultTorqueIncrease: 22,
    defaultRailIncrease: 100,
    recommendedRevLimit: 2600,
    specialFeaturesMizo: [
      'Mining Quarry Crawl (+200 Nm Torque): 16-28 Ton lung leh thir phurh laia chho lawn hleih theih lohna ti-reh',
      'SCR AdBlue Derate Limiter Fix: Sensor buai laia kawng laia engine thi tawp mai thinna control',
      'Fleet Fuel Eco-Tune: Cruising laia diesel thla tin cheng sang tam tak save theihna calibration',
      'Engine Compression Exhaust Brake Boost: Chhuk laia brake rap ngai lova engine-in a dan ngheh nan'
    ],
    specialFeaturesEng: [
      '+200 Nm Heavy Quarry Pull: Unlocks massive low-end pulling power for 28-35 Ton gross loads',
      'SCR / DEF Protection Limiter Refinement: Prevents crippling limp-home power cuts during transient faults',
      'Long-Haul Highway Economy Profile: Up to 6-9% lower diesel consumption on sustained interstate routes',
      'Exhaust Compression Retarder Optimization: Strengthens engine braking down steep quarry descents'
    ],
    metadata: {
      projectName: 'Tata Signa 2823 Heavy Cummins ISBe Stage 1',
      vehicleModel: 'Tata Signa 2823.K / Prima 6.7L Tipper',
      ecuManufacturer: 'Cummins CM2150 Heavy Duty',
      ecuHardwareId: 'CM2150_CUMMINS_ISBE',
      ecuSoftwareId: 'CU_ISBE67_9084',
      fileSizeBytes: 2097152,
      fileName: 'Tata_Signa_Cummins_67_ORI.bin',
      isCustomFile: false,
    },
    maps: [
      {
        id: 'cummins_torque_demand',
        name: 'Cummins ISBe Full Load Torque Limit',
        germanAcronym: 'CUMMINS_TRQ_LIM',
        category: 'Torque Management',
        descriptionMizo: 'Cummins 6.7L Heavy Tipper Torque Map. 850 Nm atangin 1050 Nm-ah a pawt chhuak.',
        descriptionEng: 'Cummins engine brake and maximum delivered torque table in Nm.',
        addressHex: '0x08A400',
        addressDec: 566272,
        rows: 8,
        cols: 8,
        xAxisName: 'Engine RPM',
        xAxisUnit: 'RPM',
        xAxisValues: [800, 1100, 1300, 1500, 1700, 1900, 2100, 2300],
        yAxisName: 'Driver Demand (%)',
        yAxisUnit: '%',
        yAxisValues: [25, 45, 60, 75, 85, 90, 95, 100],
        zUnit: 'Nm Torque',
        factor: 1.0,
        offset: 0,
        data: [
          [350, 480, 540, 560, 560, 540, 510, 460],
          [520, 680, 750, 770, 770, 740, 700, 630],
          [650, 840, 920, 940, 940, 910, 850, 770],
          [740, 950, 1020, 1040, 1040, 990, 930, 840],
          [780, 980, 1050, 1050, 1050, 1000, 940, 850],
          [790, 990, 1050, 1050, 1050, 1000, 940, 850],
          [800, 1000, 1050, 1050, 1050, 1000, 940, 850],
          [800, 1000, 1050, 1050, 1050, 1000, 940, 850]
        ],
        originalData: [
          [280, 380, 430, 450, 450, 430, 400, 360],
          [420, 550, 610, 630, 630, 600, 560, 500],
          [520, 680, 750, 770, 770, 740, 690, 620],
          [600, 780, 840, 850, 850, 810, 750, 680],
          [630, 810, 850, 850, 850, 810, 760, 680],
          [640, 820, 850, 850, 850, 810, 760, 680],
          [650, 830, 850, 850, 850, 810, 760, 680],
          [650, 830, 850, 850, 850, 810, 760, 680]
        ]
      }
    ]
  },

  // 9. LCV COMMERCIAL: Ashok Leyland Bada Dost / Dost Plus (1.5L 3-Cylinder Turbo)
  {
    id: 'ashok_leyland_bada_dost',
    category: 'commercial_truck',
    categoryLabelMizo: 'Commercial Truck / Pickup',
    categoryLabelEng: 'Commercial Truck / Pickup',
    name: 'Ashok Leyland Bada Dost / Dost+ (1.5L Turbo)',
    subTitle: 'Bosch EDC17C53 / Denso (1478cc 3-Cyl P15 Diesel Engine)',
    engine: '1.5L 3-Cylinder P15 Turbocharged Intercooled Diesel',
    ecuType: 'Bosch EDC17C53 / Denso Common Rail',
    ecuChip: 'Infineon TriCore TC1767 (2.0 MB Flash)',
    stockPower: '80 BHP @ 3300 RPM',
    stage1Power: '102 BHP (+22 BHP)',
    stockTorque: '190 Nm @ 1600-2400 RPM',
    stage1Torque: '240 Nm (+50 Nm)',
    defaultBoostIncrease: 160,
    defaultTorqueIncrease: 22,
    defaultRailIncrease: 60,
    recommendedRevLimit: 4000,
    specialFeaturesMizo: [
      'AC on laia Engine Zawi (Bogg) Tireh: AC compressor a nun laia chho-a motor chau lutuk map thlak a ni',
      'Low-RPM Cargo Haul: 1300-2000 RPM inkarah +50 Nm chhuak nghal',
      'Electronic Throttle Damping Off: Pedal rah ruala motor phit chhuak nghal theih nan'
    ],
    specialFeaturesEng: [
      'AC Compressor Load Damping Compensated: Eliminates engine bogging on steep hills with AC running',
      'Low-End Cargo Pull: +50 Nm immediate grunt between 1300-2000 RPM',
      'Electronic Throttle Filter Removal: Crisp, immediate pedal response under load'
    ],
    metadata: {
      projectName: 'Ashok Leyland Bada Dost 1.5L Hill Remap',
      vehicleModel: 'Ashok Leyland Bada Dost i4 (BS6)',
      ecuManufacturer: 'Bosch EDC17C53 LCV',
      ecuHardwareId: 'EDC17C53_DOST_HW',
      ecuSoftwareId: '1037549830',
      fileSizeBytes: 2097152,
      fileName: 'Ashok_Leyland_BadaDost_EDC17_ORI.bin',
      isCustomFile: false,
    },
    maps: [
      {
        id: 'dost_torque_limiter',
        name: 'Ashok Leyland Dost Torque Map',
        germanAcronym: 'DOST_TLIM',
        category: 'Torque Management',
        descriptionMizo: 'Dost truck 1.5L torque limit map. 190 Nm atangin 240 Nm-ah pawt chhuak.',
        descriptionEng: 'LCV torque limiter table across engine RPM and coolant temperature.',
        addressHex: '0x061200',
        addressDec: 397824,
        rows: 8,
        cols: 8,
        xAxisName: 'Engine RPM',
        xAxisUnit: 'RPM',
        xAxisValues: [1000, 1400, 1800, 2200, 2600, 3000, 3400, 3800],
        yAxisName: 'Coolant Temp',
        yAxisUnit: '°C',
        yAxisValues: [20, 40, 60, 75, 85, 90, 95, 100],
        zUnit: 'Nm Torque',
        factor: 1.0,
        offset: 0,
        data: [
          [160, 215, 240, 240, 230, 215, 195, 165],
          [170, 225, 240, 240, 235, 220, 200, 170],
          [175, 230, 240, 240, 235, 220, 200, 170],
          [180, 235, 240, 240, 235, 220, 200, 170],
          [180, 240, 240, 240, 235, 220, 200, 170],
          [180, 240, 240, 240, 235, 220, 200, 170],
          [180, 240, 240, 240, 235, 220, 200, 170],
          [180, 240, 240, 240, 235, 220, 200, 170]
        ],
        originalData: [
          [120, 165, 190, 190, 180, 165, 145, 120],
          [130, 175, 190, 190, 185, 170, 150, 125],
          [140, 180, 190, 190, 185, 170, 150, 125],
          [145, 185, 190, 190, 185, 170, 150, 125],
          [150, 190, 190, 190, 185, 170, 150, 125],
          [150, 190, 190, 190, 185, 170, 150, 125],
          [150, 190, 190, 190, 185, 170, 150, 125],
          [150, 190, 190, 190, 185, 170, 150, 125]
        ]
      }
    ]
  }
];
