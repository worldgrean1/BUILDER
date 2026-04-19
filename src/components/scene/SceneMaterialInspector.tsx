import { useState } from 'react';
import { Layers, Sun, Globe, Cloud, Image as ImageIcon, Eye, Trash2 } from 'lucide-react';
import MaterialConfigurePanel from './MaterialConfigurePanel';
import { formatUiLabel } from '../../utils/formatUiLabel';

interface SceneMaterial {
  id: string;
  name: string;
  meshId: string;
  active?: boolean;
  bg: string;
}

const materials: SceneMaterial[] = [
  {
    id: 'HEAD',
    name: 'Head',
    meshId: 'FUEL_HEAD',
    active: true,
    bg: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.8) 60%), #181818',
  },
  {
    id: 'COVER',
    name: 'Cover',
    meshId: 'FUEL_HEAD_COVER',
    bg: 'radial-gradient(circle at 30% 30%, #4ade80 0%, #064e3b 60%), #064e3b',
  },
  {
    id: 'HARNESS',
    name: 'Harness',
    meshId: 'HARNESS',
    bg: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, rgba(15,23,42,0.9) 60%), #0f172a',
  },
  {
    id: 'PROBE',
    name: 'Probe',
    meshId: 'PROBE',
    bg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #6b7280 50%, #111827 100%)',
  },
  {
    id: 'TANK',
    name: 'Tank',
    meshId: 'FUEL_TANK',
    bg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #6b7280 50%, #111827 100%)',
  },
  {
    id: 'BELT',
    name: 'Belt',
    meshId: 'BELT',
    bg: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #6b7280 50%, #111827 100%)',
  },
];

const tabs = ['Sensor Core', 'Mounting', 'Truck Body', 'Wheels'];

const SceneMaterialInspector = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeMaterial, setActiveMaterial] = useState(0);
  const [configureMode, setConfigureMode] = useState(false);

  const mat = materials[activeMaterial];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="ui-panel-header flex-shrink-0">
        <span className="ui-panel-title">Material Inspector</span>
        <div className="ui-card-muted px-2.5 py-1">
          <span className="ui-meta">ID: S1</span>
        </div>
      </div>

      {configureMode ? (
        <MaterialConfigurePanel
          materialName={mat.id}
          onBackToLibrary={() => setConfigureMode(false)}
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-3">
            <div className="ui-card p-2 flex items-center gap-4 mb-5">
              <button className="ui-button-primary">
                <Layers size={13} /> Materials
              </button>
              <div className="flex items-center gap-3 text-text-muted">
                <Sun size={14} className="hover:text-text-secondary cursor-pointer transition-colors" />
                <Globe size={14} className="hover:text-text-secondary cursor-pointer transition-colors" />
                <Cloud size={14} className="hover:text-text-secondary cursor-pointer transition-colors" />
                <ImageIcon size={14} className="hover:text-text-secondary cursor-pointer transition-colors" />
                <Eye size={14} className="hover:text-text-secondary cursor-pointer transition-colors" />
                <Trash2 size={14} className="hover:text-danger cursor-pointer transition-colors" />
              </div>
            </div>

            <div className="flex gap-4 border-b border-border-subtle mb-5">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`ui-tab pb-2.5 ${i === activeTab ? 'ui-tab-active text-text-primary' : ''}`}
                >
                  {formatUiLabel(tab)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {materials.map((m, i) => (
                <div
                  key={m.id}
                  className={`ui-card p-3 flex flex-col items-center cursor-pointer transition-all ${
                    i === activeMaterial ? 'border-brand' : 'border-border-subtle hover:border-border-default'
                  }`}
                  onClick={() => setActiveMaterial(i)}
                >
                  <div
                    className="w-full aspect-square rounded-md mb-2"
                    style={{ background: m.bg }}
                  ></div>
                  <h4 className={`text-ui-sm font-medium ${i === activeMaterial ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {m.name}
                  </h4>
                  <p className="ui-meta mt-0.5">{m.meshId}</p>
                </div>
              ))}
            </div>

            <div className="ui-card p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg border border-border-default"
                  style={{ background: mat.bg }}
                ></div>
                <div>
                  <h4 className="text-ui-base font-semibold text-text-primary">{mat.name}</h4>
                  <p className="ui-meta mt-0.5">ID: {mat.meshId}</p>
                </div>
              </div>
              <button
                className="ui-button-primary"
                onClick={() => setConfigureMode(true)}
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneMaterialInspector;
