import React, { useState } from 'react';
import { EcuMapDefinition, ProjectMetadata, Language } from '../types/winols';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Sparkles,
  Layers,
  FileCode,
  Gauge,
  Wind,
  Fuel,
  Shield,
  Activity,
  Trash2,
} from 'lucide-react';

interface MapTreeSidebarProps {
  maps: EcuMapDefinition[];
  potentialMaps: EcuMapDefinition[];
  selectedMapId: string;
  onSelectMap: (mapId: string) => void;
  metadata: ProjectMetadata;
  onAddPotentialMap: (map: EcuMapDefinition) => void;
  onOpenNewMapModal: () => void;
  onDeleteMap?: (mapId: string) => void;
  lang: Language;
}

export const MapTreeSidebar: React.FC<MapTreeSidebarProps> = ({
  maps,
  potentialMaps,
  selectedMapId,
  onSelectMap,
  metadata,
  onAddPotentialMap,
  onOpenNewMapModal,
  onDeleteMap,
  lang,
}) => {
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({
    'my_maps': true,
    'potential_maps': true,
    'Boost & Air': true,
    'Fuel & Injection': true,
    'Torque Management': true,
    'Emissions': true,
    'Custom': true,
  });

  const toggleFolder = (key: string) => {
    setOpenFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Boost & Air':
        return <Wind className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Fuel & Injection':
        return <Fuel className="w-3.5 h-3.5 text-amber-400" />;
      case 'Torque Management':
        return <Gauge className="w-3.5 h-3.5 text-purple-400" />;
      case 'Emissions':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  // Group maps by category
  const categories = ['Boost & Air', 'Fuel & Injection', 'Torque Management', 'Emissions', 'Custom'] as const;

  const filteredMaps = maps.filter(
    (m) =>
      m.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.germanAcronym.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.addressHex.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-[#090d16] border-r border-slate-800 flex flex-col h-full font-mono text-xs select-none">
      {/* Project Header Info */}
      <div className="p-3 bg-[#0d1322] border-b border-slate-800/90">
        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
          <span className="font-bold text-slate-300">Project Tree</span>
          <span className="text-cyan-400">{maps.length} Maps</span>
        </div>
        <div className="font-bold text-white text-xs truncate" title={metadata.vehicleModel}>
          {metadata.vehicleModel}
        </div>
        <div className="text-[10px] text-slate-400 truncate">
          {metadata.ecuManufacturer} • SW: {metadata.ecuSoftwareId}
        </div>
      </div>

      {/* Filter / Search input */}
      <div className="p-2 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder={lang === 'mizo' ? 'Map zawng rawh...' : 'Filter maps / address...'}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-[#060a12] border border-slate-800 rounded px-2 py-1 pl-7 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Map Tree Hierarchy */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Defined Maps Folder */}
        <div>
          <button
            onClick={() => toggleFolder('my_maps')}
            className="w-full flex items-center justify-between px-1.5 py-1 text-slate-300 hover:text-white font-bold text-[11px] group"
          >
            <div className="flex items-center gap-1.5">
              {openFolders['my_maps'] ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
              {openFolders['my_maps'] ? (
                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{lang === 'mizo' ? 'Defined Maps (Ka Map Te)' : 'Defined Maps (My Maps)'}</span>
            </div>
            <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">
              {filteredMaps.length}
            </span>
          </button>

          {openFolders['my_maps'] && (
            <div className="pl-3 mt-1 space-y-2">
              {categories.map((cat) => {
                const catMaps = filteredMaps.filter((m) => m.category === cat);
                if (catMaps.length === 0) return null;

                return (
                  <div key={cat} className="space-y-0.5">
                    {/* Category Folder Header */}
                    <button
                      onClick={() => toggleFolder(cat)}
                      className="w-full flex items-center justify-between px-1.5 py-0.5 text-slate-400 hover:text-slate-200 text-[10px]"
                    >
                      <div className="flex items-center gap-1">
                        {openFolders[cat] ? (
                          <ChevronDown className="w-3 h-3 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                        )}
                        {getCategoryIcon(cat)}
                        <span>{cat}</span>
                      </div>
                      <span className="text-[9px] text-slate-600">{catMaps.length}</span>
                    </button>

                    {/* Maps under category */}
                    {openFolders[cat] && (
                      <div className="pl-4 space-y-0.5">
                        {catMaps.map((map) => {
                          const isSelected = map.id === selectedMapId;
                          // Check if map is modified
                          let isMod = false;
                          for (let r = 0; r < map.rows; r++) {
                            for (let c = 0; c < map.cols; c++) {
                              if (map.data[r][c] !== map.originalData[r][c]) {
                                isMod = true;
                                break;
                              }
                            }
                            if (isMod) break;
                          }

                          return (
                            <div
                              key={map.id}
                              onClick={() => onSelectMap(map.id)}
                              className={`w-full px-2 py-1 rounded cursor-pointer transition flex items-center justify-between group ${
                                isSelected
                                  ? 'bg-cyan-950/80 text-cyan-200 font-bold border border-cyan-700/60 shadow-sm'
                                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isMod ? 'bg-amber-400' : 'bg-slate-600'
                                  }`}
                                />
                                <span className="truncate text-[11px]">{map.name}</span>
                              </div>

                              <div className="flex items-center gap-1 text-[9px] opacity-75 font-mono">
                                <span>{map.rows}x{map.cols}</span>
                                {map.isUserCreated && onDeleteMap && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteMap(map.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-200 p-0.5"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Potential Maps (Heuristic Auto-Detected) */}
        {potentialMaps.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => toggleFolder('potential_maps')}
              className="w-full flex items-center justify-between px-1.5 py-1 text-amber-300 hover:text-amber-200 font-bold text-[11px] group"
            >
              <div className="flex items-center gap-1.5">
                {openFolders['potential_maps'] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {lang === 'mizo' ? 'Potential Maps (Hmuh Chhuah)' : 'Potential Maps (Found)'}
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">
                {potentialMaps.length}
              </span>
            </button>

            {openFolders['potential_maps'] && (
              <div className="pl-3 mt-1 space-y-1">
                {potentialMaps.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-1.5 bg-amber-950/20 border border-amber-900/40 rounded flex items-center justify-between text-[10px]"
                  >
                    <div className="truncate">
                      <div className="text-amber-300 font-semibold truncate">{cand.name}</div>
                      <div className="text-slate-400 text-[9px] font-mono">
                        {cand.addressHex} ({cand.rows}x{cand.cols}) • {cand.confidence}% Match
                      </div>
                    </div>

                    <button
                      onClick={() => onAddPotentialMap(cand)}
                      className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-[10px] transition flex items-center gap-0.5 flex-shrink-0 ml-1"
                      title="Add to defined project maps"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Footer Action */}
      <div className="p-2 bg-[#0c1220] border-t border-slate-800">
        <button
          onClick={onOpenNewMapModal}
          className="w-full py-1.5 bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-200 border border-slate-700 text-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'mizo' ? 'Map Thar Siam (Hotkey K)' : 'Create New Map (K)'}</span>
        </button>
      </div>
    </div>
  );
};
