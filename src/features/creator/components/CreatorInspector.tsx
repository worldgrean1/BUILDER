import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, ChevronDown, Code2, Layers3, Palette, Settings2, Sparkles, Zap } from 'lucide-react';
import { CREATOR_FRAME_PRESETS } from '@/features/creator/mockDocument';
import { componentActions, creatorActions, interactionActions, tokenActions, useCreatorStore } from '@/features/creator/store';
import type { CreatorEasingCurve, CreatorInteractionAction, CreatorInteractionTrigger, CreatorVariant } from '@/features/creator/types';

/* ── Primitive inputs ───────────────────────────── */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const Section = ({ title, children, defaultOpen = true, badge }: { title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <button className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left transition-colors hover:bg-surface-2/40" onClick={() => setOpen((c) => !c)}>
        <ChevronDown size={10} className={`text-text-disabled transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">{title}</span>
        {badge && <span className="rounded bg-brand/15 px-1.5 py-px text-[9px] font-semibold text-brand">{badge}</span>}
      </button>
      {open && <div className="px-3 pb-2.5">{children}</div>}
    </div>
  );
};

const Num = ({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) => (
  <label className="flex items-center justify-between gap-1.5 rounded-sm border border-transparent px-1 py-0.5 transition-colors hover:bg-surface-2/20">
    <span className="text-[10px] font-medium text-text-muted">{label}</span>
    <input 
      type="number" 
      step={step} 
      value={Math.round(value * 100) / 100} 
      onChange={(e) => onChange(Number(e.target.value))} 
      className="ui-input ui-input-number h-5 w-16" 
    />
  </label>
);

const Txt = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="flex flex-col gap-0.5">
    <span className="text-[10px] font-medium text-text-muted">{label}</span>
    <input value={value} onChange={(e) => onChange(e.target.value)} className="ui-input h-6 text-[11px]" />
  </label>
);

const Sel = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) => (
  <label className="flex flex-col gap-0.5">
    <span className="text-[10px] font-medium text-text-muted">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="ui-input h-6 text-[11px]">
      {options.map((o) => <option key={o.value} value={o.value} className="bg-surface-1 text-text-primary">{o.label}</option>)}
    </select>
  </label>
);

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) => (
  <label className="flex items-center justify-between gap-2">
    <span className="text-[10px] font-medium text-text-muted">{label}</span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 accent-brand" />
  </label>
);

const Btn = ({ children, onClick, variant = 'secondary', className = '' }: { children: React.ReactNode; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger'; className?: string }) => {
  const base = variant === 'primary' ? 'ui-button-primary' : variant === 'danger' ? 'ui-button-secondary text-danger' : 'ui-button-secondary';
  return <button onClick={onClick} className={`${base} h-6 w-full justify-center text-[10px] ${className}`}>{children}</button>;
};

/* ── Color helpers ──────────────────────────────── */

const expandHex = (v: string) => v.length === 4 || v.length === 5 ? `#${v.slice(1).split('').map((c) => `${c}${c}`).join('')}` : v;
const rgbToHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`;
const hexToRgb = (hex: string) => { const n = expandHex(hex.trim().toLowerCase()); return { r: parseInt(n.slice(1, 3), 16), g: parseInt(n.slice(3, 5), 16), b: parseInt(n.slice(5, 7), 16) }; };

const rgbToHsv = (r: number, g: number, b: number) => {
  const rn = clamp(r, 0, 255) / 255, gn = clamp(g, 0, 255) / 255, bn = clamp(b, 0, 255) / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), delta = max - min;
  let h = 0;
  if (delta !== 0) { if (max === rn) h = 60 * (((gn - bn) / delta) % 6); else if (max === gn) h = 60 * ((bn - rn) / delta + 2); else h = 60 * ((rn - gn) / delta + 4); }
  return { h: (h + 360) % 360, s: max === 0 ? 0 : (delta / max) * 100, v: max * 100 };
};

const hsvToRgb = (h: number, s: number, v: number) => {
  const nh = ((h % 360) + 360) % 360, ns = clamp(s / 100, 0, 1), nv = clamp(v / 100, 0, 1);
  const c = nv * ns, x = c * (1 - Math.abs(((nh / 60) % 2) - 1)), m = nv - c;
  let rp = 0, gp = 0, bp = 0;
  if (nh < 60) { rp = c; gp = x; } else if (nh < 120) { rp = x; gp = c; } else if (nh < 180) { gp = c; bp = x; }
  else if (nh < 240) { gp = x; bp = c; } else if (nh < 300) { rp = x; bp = c; } else { rp = c; bp = x; }
  return { r: (rp + m) * 255, g: (gp + m) * 255, b: (bp + m) * 255 };
};

const parseColorValue = (value: string): { hex: string; alpha: number } => {
  const n = value.trim().toLowerCase();
  if (n === 'transparent') return { hex: '#000000', alpha: 0 };
  const hexMatch = /^#([0-9a-f]{3,8})$/.test(n);
  if (hexMatch) { const full = expandHex(n); return full.length === 9 ? { hex: full.slice(0, 7), alpha: parseInt(full.slice(7, 9), 16) / 255 } : { hex: full.slice(0, 7), alpha: 1 }; }
  const rgbMatch = n.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (rgbMatch) return { hex: rgbToHex(+rgbMatch[1], +rgbMatch[2], +rgbMatch[3]), alpha: rgbMatch[4] ? clamp(+rgbMatch[4], 0, 1) : 1 };
  return { hex: '#ffffff', alpha: 1 };
};

const rgbaString = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  if (alpha <= 0) return 'transparent';
  if (Math.abs(alpha - 1) < 0.001) return `rgb(${r}, ${g}, ${b})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
};

const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const parsed = parseColorValue(value);
  const svRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [hsvDraft, setHsvDraft] = useState(() => { const rgb = hexToRgb(parsed.hex); return rgbToHsv(rgb.r, rgb.g, rgb.b); });

  useEffect(() => { const rgb = hexToRgb(parsed.hex); setHsvDraft(rgbToHsv(rgb.r, rgb.g, rgb.b)); }, [parsed.hex]);

  const applyHsv = (next: { h: number; s: number; v: number }, alpha = parsed.alpha) => {
    const rgb = hsvToRgb(next.h, next.s, next.v);
    onChange(rgbaString(rgbToHex(rgb.r, rgb.g, rgb.b), alpha));
  };

  const updateSvFromPointer = (cx: number, cy: number) => {
    if (!svRef.current) return;
    const rect = svRef.current.getBoundingClientRect();
    const next = { ...hsvDraft, s: (clamp(cx - rect.left, 0, rect.width) / rect.width) * 100, v: 100 - (clamp(cy - rect.top, 0, rect.height) / rect.height) * 100 };
    setHsvDraft(next);
    applyHsv(next);
  };

  const { r, g, b } = hsvToRgb(hsvDraft.h, hsvDraft.s, hsvDraft.v);

  return (
    <div className="space-y-2 rounded-md border border-border-default bg-surface-1/40 p-2 shadow-inner">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setExpanded((c) => !c)} 
          className="h-6 w-6 rounded-sm border border-white/20 shadow-elevation-low transition-transform active:scale-95" 
          style={{ background: parsed.alpha <= 0 ? 'transparent' : parsed.hex }} 
        />
        <div className="flex-1 flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
          <input 
            value={value.startsWith('var') ? value : parsed.hex} 
            onChange={(e) => onChange(e.target.value)} 
            className="ui-input h-5 w-full bg-transparent border-none p-0 font-mono text-[10px]" 
          />
        </div>
        <div className="flex items-center gap-1.5 rounded bg-surface-2/40 px-1.5 py-0.5">
          <span className="text-[9px] font-mono text-text-disabled">A</span>
          <input 
            type="number" 
            min={0} max={100} 
            value={Math.round(parsed.alpha * 100)} 
            onChange={(e) => onChange(rgbaString(parsed.hex, +e.target.value / 100))}
            className="w-8 bg-transparent text-right font-mono text-[10px] outline-none"
          />
          <span className="text-[9px] text-text-disabled">%</span>
        </div>
      </div>

      <input 
        type="range" 
        min={0} 
        max={100} 
        value={Math.round(parsed.alpha * 100)} 
        onChange={(e) => onChange(rgbaString(parsed.hex, +e.target.value / 100))} 
        className="ui-pro-slider h-1 w-full" 
      />

      {expanded && (
        <div className="mt-2 space-y-3 rounded-md border border-border-strong bg-surface-2/60 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div 
            ref={svRef} 
            className="relative h-28 w-full cursor-crosshair rounded-sm border border-white/10"
            style={{ background: `hsl(${Math.round(hsvDraft.h)} 100% 50%)` }}
            onMouseDown={(e) => updateSvFromPointer(e.clientX, e.clientY)}
            onMouseMove={(e) => { if ((e.buttons & 1) === 1) updateSvFromPointer(e.clientX, e.clientY); }}>
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div 
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-elevation-md" 
              style={{ left: `${hsvDraft.s}%`, top: `${100 - hsvDraft.v}%`, background: parsed.hex }} 
            />
          </div>

          <div className="space-y-2">
            <div className="relative h-3 w-full rounded-full overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#f00_0%,#ff0_17%,#0f0_33%,#0ff_50%,#00f_67%,#f0f_83%,#f00_100%)]" />
              <input 
                type="range" min={0} max={360} 
                value={Math.round(hsvDraft.h)} 
                onChange={(e) => { const n = { ...hsvDraft, h: +e.target.value }; setHsvDraft(n); applyHsv(n); }} 
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0" 
              />
              <div className="pointer-events-none absolute h-full w-1 border-x border-white shadow-sm" style={{ left: `${(hsvDraft.h / 360) * 100}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-1">
              {['R', 'G', 'B'].map((l, i) => (
                <div key={l} className="flex flex-col items-center rounded bg-surface-3/40 p-1">
                  <span className="text-[8px] font-bold text-text-disabled">{l}</span>
                  <span className="text-[10px] font-mono">[ {Math.round([r, g, b][i])} ]</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {['#BF1F2F', '#00B2A9', '#FFFFFF', '#1B1B1D', '#000000', 'transparent'].map((s) => (
          <button 
            key={s} 
            onClick={() => onChange(s)} 
            className="h-4 w-4 rounded-full border border-white/10 shadow-sm transition-all hover:scale-125 hover:shadow-elevation-md" 
            style={{ background: s === 'transparent' ? 'repeating-conic-gradient(#555 0% 25%, #222 0% 50%) 50% / 4px 4px' : s }} 
            title={s} 
          />
        ))}
      </div>
    </div>
  );
};

/* ── Option data ────────────────────────────────── */

const shadowOptions = [
  { label: 'None', value: 'none' },
  { label: 'Low', value: 'var(--elevation-low)' },
  { label: 'Medium', value: 'var(--elevation-md)' },
  { label: 'Float', value: 'var(--elevation-float)' },
];

const variantOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Hover', value: 'hover' },
  { label: 'Pressed', value: 'pressed' },
];

const actionOptions: { label: string; value: string }[] = [
  { label: 'None', value: 'none' }, { label: 'Duplicate', value: 'duplicate' }, { label: 'Delete', value: 'delete' },
  { label: 'Toggle Visibility', value: 'toggleVisibility' }, { label: 'Toggle Lock', value: 'toggleLock' },
  { label: 'Focus', value: 'focus' }, { label: 'Navigate', value: 'navigate' }, { label: 'Set Variant', value: 'setVariant' },
];

const easingOptions: { label: string; value: string }[] = [
  { label: 'Linear', value: 'linear' }, { label: 'Ease', value: 'ease' }, { label: 'Ease In', value: 'ease-in' },
  { label: 'Ease Out', value: 'ease-out' }, { label: 'Ease In Out', value: 'ease-in-out' }, { label: 'Spring', value: 'spring' },
];

const triggerOptions: { label: string; value: string }[] = [
  { label: 'Click', value: 'click' }, { label: 'Hover', value: 'hover' }, { label: 'Double Click', value: 'doubleClick' },
  { label: 'Mouse Enter', value: 'mouseEnter' }, { label: 'Mouse Leave', value: 'mouseLeave' },
];

const resolveShadow = (s: string) => shadowOptions.find((o) => o.value === s)?.value ?? 'var(--elevation-low)';

/* ── Inspector Tabs ─────────────────────────────── */

type InspectorTab = 'props' | 'style' | 'interact' | 'component';

const tabDefs: { id: InspectorTab; label: string; icon: typeof Box }[] = [
  { id: 'props', label: 'Properties', icon: Settings2 },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'interact', label: 'Interact', icon: Zap },
  { id: 'component', label: 'Component', icon: Layers3 },
];

/* ── Main Inspector ─────────────────────────────── */

const CreatorInspector = () => {
  const document = useCreatorStore((state) => state.document);
  const selectionIds = useCreatorStore((state) => state.selectionIds);
  const viewport = useCreatorStore((state) => state.viewport);
  const colorTokens = useCreatorStore((state) => state.colorTokens);
  const spacingTokens = useCreatorStore((state) => state.spacingTokens);
  const stylePresets = useCreatorStore((state) => state.stylePresets);

  const selectedNodes = selectionIds.map((id) => document.nodes[id]).filter(Boolean);
  const node = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const isText = node?.type === 'text' || node?.type === 'button';
  const isMedia = node?.type === 'image' || node?.type === 'embed' || node?.type === 'threeD';

  const [tab, setTab] = useState<InspectorTab>('props');
  const [presetDraft, setPresetDraft] = useState('');

  const allNodes = useMemo(
    () => Object.values(document.nodes).filter((n) => n.id !== document.rootId && n.id !== node?.id),
    [document.nodes, document.rootId, node?.id],
  );

  /* ── No selection: Canvas Settings ── */
  if (!node && selectionIds.length <= 1) {
    return (
      <div className="ui-panel-shell">
        <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
          <Box size={12} className="text-text-muted" />
          <span className="text-[11px] font-semibold text-text-primary">Canvas Settings</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Section title="Frame">
            <div className="space-y-2">
              <Sel label="Frame Preset" value={viewport.framePreset} onChange={(v) => creatorActions.setFramePreset(v)}
                options={CREATOR_FRAME_PRESETS.map((p) => ({ label: p.label, value: p.id }))} />
              <div className="grid grid-cols-2 gap-1.5">
                <Num label="Zoom" value={viewport.zoom * 100} onChange={(v) => creatorActions.setZoom(v / 100)} />
              </div>
              <Btn onClick={() => creatorActions.focusSelection()}>Fit Frame</Btn>
            </div>
          </Section>
          <Section title="Design Tokens" defaultOpen={false}>
            <TokenPanel nodeId={null} />
          </Section>
        </div>
      </div>
    );
  }

  /* ── Multi-select ── */
  if (selectionIds.length > 1) {
    return (
      <div className="ui-panel-shell">
        <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
          <Sparkles size={12} className="text-brand" />
          <span className="text-[11px] font-semibold text-text-primary">Multi-select</span>
          <span className="ml-auto text-[10px] text-text-muted">{selectionIds.length} elements</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Section title="Shared Layout">
            <div className="grid grid-cols-2 gap-1.5">
              <Num label="X" value={selectedNodes[0]?.layout.x ?? 0} onChange={(v) => selectionIds.forEach((id) => creatorActions.updateNodeLayout(id, { x: v }))} />
              <Num label="Y" value={selectedNodes[0]?.layout.y ?? 0} onChange={(v) => selectionIds.forEach((id) => creatorActions.updateNodeLayout(id, { y: v }))} />
              <Num label="W" value={selectedNodes[0]?.layout.width ?? 0} onChange={(v) => selectionIds.forEach((id) => creatorActions.resizeNode(id, { width: v }))} />
              <Num label="H" value={selectedNodes[0]?.layout.height ?? 0} onChange={(v) => selectionIds.forEach((id) => creatorActions.resizeNode(id, { height: v }))} />
            </div>
          </Section>
          <Section title="Shared Appearance">
            <div className="space-y-1.5">
              <Num label="Opacity" value={(selectedNodes[0]?.style.opacity ?? 1) * 100} onChange={(v) => selectionIds.forEach((id) => creatorActions.updateNodeStyle(id, { opacity: Math.min(1, Math.max(0, v / 100)) }))} />
              <Sel label="Shadow" value={resolveShadow(selectedNodes[0]?.style.shadow ?? 'none')} onChange={(v) => selectionIds.forEach((id) => creatorActions.updateNodeStyle(id, { shadow: v }))} options={shadowOptions} />
            </div>
          </Section>
          <Section title="Actions">
            <div className="grid grid-cols-2 gap-1.5">
              <Btn onClick={() => selectionIds.forEach((id) => creatorActions.toggleNodeVisibility(id))}>Toggle Visibility</Btn>
              <Btn onClick={() => selectionIds.forEach((id) => creatorActions.toggleNodeLock(id))}>Toggle Lock</Btn>
            </div>
          </Section>
        </div>
      </div>
    );
  }

  /* ── Single selection: Tabbed Inspector ── */
  return (
    <div className="ui-panel-shell">
      {/* Header */}
      <div className="border-b border-border-subtle px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          <span className="flex-1 truncate text-[11px] font-semibold text-text-primary">{node.name}</span>
          <span className="rounded bg-surface-2 px-1.5 py-px text-[9px] font-medium text-text-muted">{node.type}</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border-subtle bg-surface-0/40">
        {tabDefs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1 py-1.5 text-[10px] font-medium transition-colors ${
              tab === id ? 'border-b border-brand bg-brand/5 text-brand' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon size={11} />
            <span className="hidden xl:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ═══════ PROPERTIES TAB ═══════ */}
        {tab === 'props' && (
          <>
            <Section title="Layout">
              <div className="grid grid-cols-2 gap-1.5">
                <Num label="X" value={node.layout.x} onChange={(v) => creatorActions.updateNodeLayout(node.id, { x: v })} />
                <Num label="Y" value={node.layout.y} onChange={(v) => creatorActions.updateNodeLayout(node.id, { y: v })} />
                <Num label="W" value={node.layout.width} onChange={(v) => creatorActions.resizeNode(node.id, { width: v })} />
                <Num label="H" value={node.layout.height} onChange={(v) => creatorActions.resizeNode(node.id, { height: v })} />
                <Num label="Rot" value={node.style.rotation} onChange={(v) => creatorActions.updateNodeStyle(node.id, { rotation: v })} />
              </div>
            </Section>

            <Section title="Spacing">
              <div className="grid grid-cols-2 gap-1.5">
                <Num label="Top" value={node.style.paddingTop} onChange={(v) => creatorActions.updateNodeStyle(node.id, { paddingTop: v })} />
                <Num label="Right" value={node.style.paddingRight} onChange={(v) => creatorActions.updateNodeStyle(node.id, { paddingRight: v })} />
                <Num label="Bot" value={node.style.paddingBottom} onChange={(v) => creatorActions.updateNodeStyle(node.id, { paddingBottom: v })} />
                <Num label="Left" value={node.style.paddingLeft} onChange={(v) => creatorActions.updateNodeStyle(node.id, { paddingLeft: v })} />
              </div>
              <Sel label="Spacing Token" value={spacingTokens[0]?.id ?? ''} onChange={(id) => { creatorActions.applySpacingToken(node.id, 'paddingTop', id); creatorActions.applySpacingToken(node.id, 'paddingRight', id); creatorActions.applySpacingToken(node.id, 'paddingBottom', id); creatorActions.applySpacingToken(node.id, 'paddingLeft', id); }} options={spacingTokens.map((t) => ({ label: `${t.label} (${t.value}px)`, value: t.id }))} />
            </Section>

            {isText && (
              <Section title="Content">
                <Txt label="Text" value={node.content.text ?? ''} onChange={(v) => creatorActions.updateNodeContent(node.id, { text: v })} />
              </Section>
            )}

            {isMedia && (
              <Section title="Source">
                <div className="space-y-1.5">
                  {(node.type === 'embed' || node.type === 'threeD') && (
                    <Sel label="Runtime" value={node.content.runtime ?? (node.type === 'threeD' ? 'spline' : 'iframe')}
                      onChange={(v) => creatorActions.updateNodeContent(node.id, { runtime: v as 'iframe' | 'spline' | 'threejs' })}
                      options={node.type === 'threeD' ? [{ label: 'Spline', value: 'spline' }, { label: 'Three.js', value: 'threejs' }] : [{ label: 'IFrame', value: 'iframe' }, { label: 'Spline', value: 'spline' }, { label: 'Three.js', value: 'threejs' }]} />
                  )}
                  <Txt label={node.type === 'image' ? 'Image URL' : 'Embed URL'} value={node.content.src ?? ''} onChange={(v) => creatorActions.updateNodeContent(node.id, { src: v })} />
                  {node.type === 'image' && <Txt label="Alt" value={node.content.alt ?? ''} onChange={(v) => creatorActions.updateNodeContent(node.id, { alt: v })} />}
                </div>
              </Section>
            )}

            <Section title="Responsive">
              <div className="space-y-1.5">
                <Sel label="Width Mode" value={node.responsive.widthMode} onChange={(v) => creatorActions.updateNodeResponsive(node.id, { widthMode: v as 'fixed' | 'fluid' })} options={[{ label: 'Fixed', value: 'fixed' }, { label: 'Fluid', value: 'fluid' }]} />
                <Num label="Max W" value={node.responsive.maxWidth ?? 0} onChange={(v) => creatorActions.updateNodeResponsive(node.id, { maxWidth: v <= 0 ? null : v })} />
                <Toggle label="Hide Desktop" checked={node.responsive.hideOnDesktop} onChange={(c) => creatorActions.updateNodeResponsive(node.id, { hideOnDesktop: c })} />
                <Toggle label="Hide Tablet" checked={node.responsive.hideOnTablet} onChange={(c) => creatorActions.updateNodeResponsive(node.id, { hideOnTablet: c })} />
                <Toggle label="Hide Mobile" checked={node.responsive.hideOnMobile} onChange={(c) => creatorActions.updateNodeResponsive(node.id, { hideOnMobile: c })} />
              </div>
            </Section>

            <Section title="Node Actions">
              <div className="grid grid-cols-3 gap-1.5">
                <Btn onClick={() => creatorActions.duplicateNode(node.id)}>Duplicate</Btn>
                <Btn onClick={() => creatorActions.toggleNodeLock(node.id)}>{node.locked ? 'Unlock' : 'Lock'}</Btn>
                <Btn onClick={() => creatorActions.deleteNode(node.id)} variant="danger">Delete</Btn>
              </div>
            </Section>
          </>
        )}

        {/* ═══════ STYLE TAB ═══════ */}
        {tab === 'style' && (
          <>
            <Section title="Fill & Stroke">
              <div className="space-y-2">
                <ColorInput label="Fill" value={node.style.fill} onChange={(v) => creatorActions.updateNodeStyle(node.id, { fill: v })} />
                <Sel label="Fill Token" value={colorTokens.find((t) => t.value === node.style.fill)?.id ?? ''} onChange={(id) => creatorActions.applyColorToken(node.id, 'fill', id)} options={colorTokens.map((t) => ({ label: t.label, value: t.id }))} />
                <ColorInput label="Stroke" value={node.style.stroke} onChange={(v) => creatorActions.updateNodeStyle(node.id, { stroke: v })} />
                <Sel label="Stroke Token" value={colorTokens.find((t) => t.value === node.style.stroke)?.id ?? ''} onChange={(id) => creatorActions.applyColorToken(node.id, 'stroke', id)} options={colorTokens.map((t) => ({ label: t.label, value: t.id }))} />
                <div className="grid grid-cols-3 gap-1.5">
                  <Num label="Wt" value={node.style.strokeWidth} onChange={(v) => creatorActions.updateNodeStyle(node.id, { strokeWidth: Math.max(0, v) })} />
                  <Num label="Rad" value={node.style.radius} onChange={(v) => creatorActions.updateNodeStyle(node.id, { radius: v })} />
                  <Num label="Opa" value={node.style.opacity * 100} onChange={(v) => creatorActions.updateNodeStyle(node.id, { opacity: v / 100 })} />
                </div>
              </div>
            </Section>

            {isText && (
              <Section title="Typography">
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Num label="Size" value={node.style.fontSize} onChange={(v) => creatorActions.updateNodeStyle(node.id, { fontSize: v })} />
                    <Num label="Wgt" value={node.style.fontWeight} onChange={(v) => creatorActions.updateNodeStyle(node.id, { fontWeight: v })} />
                    <Num label="Line" value={node.style.lineHeight * 100} onChange={(v) => creatorActions.updateNodeStyle(node.id, { lineHeight: v / 100 })} />
                    <Num label="Track" value={node.style.letterSpacing * 100} onChange={(v) => creatorActions.updateNodeStyle(node.id, { letterSpacing: v / 100 })} />
                  </div>
                  <ColorInput label="Text Color" value={node.style.color} onChange={(v) => creatorActions.updateNodeStyle(node.id, { color: v })} />
                  <Sel label="Text Token" value={colorTokens.find((t) => t.value === node.style.color)?.id ?? ''} onChange={(id) => creatorActions.applyColorToken(node.id, 'color', id)} options={colorTokens.map((t) => ({ label: t.label, value: t.id }))} />
                  <Sel label="Align" value={node.style.textAlign} onChange={(v) => creatorActions.updateNodeStyle(node.id, { textAlign: v as 'left' | 'center' | 'right' })} options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]} />
                </div>
              </Section>
            )}

            <Section title="Effects">
              <Sel label="Shadow" value={resolveShadow(node.style.shadow)} onChange={(v) => creatorActions.updateNodeStyle(node.id, { shadow: v })} options={shadowOptions} />
            </Section>

            <Section title="Presets" defaultOpen={false}>
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <input value={presetDraft} onChange={(e) => setPresetDraft(e.target.value)} className="ui-input h-6 flex-1 text-[10px]" placeholder="Preset name" />
                  <Btn onClick={() => { creatorActions.saveStylePresetFromNode(node.id, presetDraft || `${node.name} preset`); setPresetDraft(''); }} className="w-auto flex-shrink-0 px-2">Save</Btn>
                </div>
                {stylePresets.map((p) => (
                  <div key={p.id} className="flex items-center gap-1 rounded border border-border-default bg-surface-0/40 px-2 py-0.5">
                    <span className="flex-1 truncate text-[10px] text-text-primary">{p.name}</span>
                    <button className="text-[10px] text-brand" onClick={() => creatorActions.applyStylePreset(node.id, p.id)} title="Apply">✓</button>
                    <button className="text-[10px] text-text-muted" onClick={() => tokenActions.duplicateStylePreset(p.id)} title="Duplicate">⧉</button>
                    <button className="text-[10px] text-text-muted hover:text-danger" onClick={() => creatorActions.deleteStylePreset(p.id)} title="Delete">✕</button>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Design Tokens" defaultOpen={false}>
              <TokenPanel nodeId={node.id} />
            </Section>
          </>
        )}

        {/* ═══════ INTERACTIONS TAB ═══════ */}
        {tab === 'interact' && (
          <>
            <Section title="Primary Interaction">
              <div className="space-y-1.5">
                <Sel label="Trigger" value={node.interaction.trigger} onChange={(v) => creatorActions.updateNodeInteraction(node.id, { trigger: v as CreatorInteractionTrigger })} options={triggerOptions} />
                <Sel label="Action" value={node.interaction.action} onChange={(v) => creatorActions.updateNodeInteraction(node.id, { action: v as CreatorInteractionAction })} options={actionOptions} />
                <Sel label="Easing" value={node.interaction.easing} onChange={(v) => creatorActions.updateNodeInteraction(node.id, { easing: v as CreatorEasingCurve })} options={easingOptions} />
                <Sel label="Target" value={node.interaction.targetId ?? node.id} onChange={(v) => creatorActions.updateNodeInteraction(node.id, { targetId: v === node.id ? null : v })} options={[{ label: 'Self', value: node.id }, ...allNodes.map((n) => ({ label: n.name, value: n.id }))]} />
                <Num label="Ms" value={node.interaction.transitionMs} onChange={(v) => creatorActions.updateNodeInteraction(node.id, { transitionMs: Math.max(0, v) })} />
                {node.interaction.action === 'navigate' && <Txt label="URL" value={node.interaction.navigateUrl} onChange={(v) => creatorActions.updateNodeInteraction(node.id, { navigateUrl: v })} />}
                {node.interaction.action === 'setVariant' && <Sel label="Set Variant" value={node.interaction.setVariantValue} onChange={(v) => creatorActions.updateNodeInteraction(node.id, { setVariantValue: v as CreatorVariant })} options={variantOptions} />}
                <Btn onClick={() => creatorActions.runNodeInteraction(node.id)}>Run Interaction</Btn>
              </div>
            </Section>

            <Section title="Chained Actions" defaultOpen={false} badge={node.interactionChain ? `${node.interactionChain.actions.length}` : undefined}>
              <div className="space-y-1.5">
                <Btn onClick={() => interactionActions.addChainedAction(node.id)}>+ Add Step</Btn>
                {node.interactionChain && (
                  <>
                    <Sel label="Chain Trigger" value={node.interactionChain.trigger} onChange={(v) => interactionActions.setInteractionChain(node.id, v as CreatorInteractionTrigger)} options={triggerOptions} />
                    {node.interactionChain.actions.map((ca, i) => (
                      <div key={ca.id} className="space-y-1 rounded border border-border-default bg-surface-1/40 p-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-semibold text-text-muted">Step {i + 1}</span>
                          <button className="text-[9px] text-text-muted hover:text-danger" onClick={() => interactionActions.removeChainedAction(node.id, ca.id)}>✕</button>
                        </div>
                        <Sel label="Action" value={ca.action} onChange={(v) => interactionActions.updateChainedAction(node.id, ca.id, { action: v as CreatorInteractionAction })} options={actionOptions} />
                        <Sel label="Easing" value={ca.easing} onChange={(v) => interactionActions.updateChainedAction(node.id, ca.id, { easing: v as CreatorEasingCurve })} options={easingOptions} />
                        <div className="grid grid-cols-2 gap-1">
                          <Num label="Ms" value={ca.transitionMs} onChange={(v) => interactionActions.updateChainedAction(node.id, ca.id, { transitionMs: Math.max(0, v) })} />
                          <Num label="Delay" value={ca.delayMs} onChange={(v) => interactionActions.updateChainedAction(node.id, ca.id, { delayMs: Math.max(0, v) })} />
                        </div>
                        <Sel label="Target" value={ca.targetId ?? node.id} onChange={(v) => interactionActions.updateChainedAction(node.id, ca.id, { targetId: v === node.id ? null : v })} options={[{ label: 'Self', value: node.id }, ...allNodes.map((n) => ({ label: n.name, value: n.id }))]} />
                        {ca.action === 'setVariant' && <Sel label="Variant" value={ca.setVariantValue} onChange={(v) => interactionActions.updateChainedAction(node.id, ca.id, { setVariantValue: v as CreatorVariant })} options={variantOptions} />}
                      </div>
                    ))}
                    {node.interactionChain.actions.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <Btn onClick={() => interactionActions.runInteractionChain(node.id)}>Run Chain</Btn>
                        <Btn onClick={() => interactionActions.clearInteractionChain(node.id)} variant="danger">Clear</Btn>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Section>
          </>
        )}

        {/* ═══════ COMPONENT TAB ═══════ */}
        {tab === 'component' && (
          <>
            <Section title="Component Identity">
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <Btn onClick={() => creatorActions.markAsComponent(node.id)}>{node.componentKey ? 'Update' : 'Make Component'}</Btn>
                  <Btn onClick={() => creatorActions.createInstanceFromNode(node.id)}>New Instance</Btn>
                </div>
                <p className="text-[9px] text-text-muted">
                  {node.componentKey ? `Key: ${node.componentKey}` : node.instanceOf ? `Instance of ${node.instanceOf}` : 'Independent node'}
                </p>
              </div>
            </Section>

            {node.instanceOf && (
              <Section title="Instance Controls">
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Btn onClick={() => componentActions.detachInstance(node.id)} variant="danger">Detach</Btn>
                    <Btn onClick={() => { const k = prompt('Component key:'); if (k) componentActions.relinkInstance(node.id, k); }}>Relink</Btn>
                  </div>
                  {node.instanceOverrides.length > 0 && (
                    <>
                      <p className="text-[9px] font-semibold text-text-muted">Overrides ({node.instanceOverrides.length})</p>
                      {node.instanceOverrides.map((o, i) => (
                        <div key={`${o.field}-${o.path}-${i}`} className="flex items-center gap-1 text-[9px]">
                          <span className="flex-1 truncate text-text-secondary">{o.field}.{o.path}</span>
                          <button className="text-text-muted hover:text-danger" onClick={() => componentActions.resetInstanceOverride(node.id, o.field, o.path)}>Reset</button>
                        </div>
                      ))}
                      <Btn onClick={() => componentActions.resetInstanceOverrides(node.id)} variant="danger">Reset All</Btn>
                    </>
                  )}
                </div>
              </Section>
            )}

            <Section title="Variant">
              <Sel label="Active Variant" value={node.variant} onChange={(v) => creatorActions.setNodeVariant(node.id, v as CreatorVariant)} options={variantOptions} />
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Token Management Sub-Panel ─────────────────── */

const TokenPanel = ({ nodeId }: { nodeId: string | null }) => {
  const colorTokens = useCreatorStore((state) => state.colorTokens);
  const spacingTokens = useCreatorStore((state) => state.spacingTokens);

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-text-muted">Color Tokens</p>
      {colorTokens.map((t) => (
        <div key={t.id} className="flex items-center gap-1.5 rounded border border-border-default bg-surface-0/40 px-2 py-0.5">
          <span className="h-3 w-3 rounded border border-white/15" style={{ background: t.value }} />
          <span className="flex-1 truncate text-[10px] text-text-primary">{t.label}</span>
          {nodeId && <button className="text-[9px] text-brand" onClick={() => creatorActions.applyColorToken(nodeId, 'fill', t.id)}>Fill</button>}
          <button className="text-[9px] text-text-muted hover:text-danger" onClick={() => tokenActions.deleteColorToken(t.id)}>✕</button>
        </div>
      ))}
      <div className="flex gap-1">
        <input id="new-color-label" className="ui-input h-5 flex-1 text-[9px]" placeholder="Label" />
        <input id="new-color-value" className="ui-input h-5 w-14 text-[9px]" placeholder="#hex" defaultValue="#ffffff" />
        <button className="ui-button-secondary h-5 px-1.5 text-[9px]" onClick={() => {
          const l = window.document.getElementById('new-color-label') as HTMLInputElement;
          const v = window.document.getElementById('new-color-value') as HTMLInputElement;
          if (!l.value.trim()) return;
          tokenActions.addColorToken(l.value, v.value || '#ffffff');
          l.value = ''; v.value = '#ffffff';
        }}>+</button>
      </div>

      <p className="text-[10px] font-semibold text-text-muted">Spacing Tokens</p>
      {spacingTokens.map((t) => (
        <div key={t.id} className="flex items-center gap-1.5 rounded border border-border-default bg-surface-0/40 px-2 py-0.5">
          <span className="flex-1 truncate text-[10px] text-text-primary">{t.label}: {t.value}px</span>
          {nodeId && <button className="text-[9px] text-brand" onClick={() => { creatorActions.applySpacingToken(nodeId, 'paddingTop', t.id); creatorActions.applySpacingToken(nodeId, 'paddingRight', t.id); creatorActions.applySpacingToken(nodeId, 'paddingBottom', t.id); creatorActions.applySpacingToken(nodeId, 'paddingLeft', t.id); }}>Apply</button>}
          <button className="text-[9px] text-text-muted hover:text-danger" onClick={() => tokenActions.deleteSpacingToken(t.id)}>✕</button>
        </div>
      ))}
      <div className="flex gap-1">
        <input id="new-spacing-label" className="ui-input h-5 flex-1 text-[9px]" placeholder="Label" />
        <input id="new-spacing-value" type="number" className="ui-input h-5 w-12 text-[9px]" placeholder="px" defaultValue="16" />
        <button className="ui-button-secondary h-5 px-1.5 text-[9px]" onClick={() => {
          const l = window.document.getElementById('new-spacing-label') as HTMLInputElement;
          const v = window.document.getElementById('new-spacing-value') as HTMLInputElement;
          if (!l.value.trim()) return;
          tokenActions.addSpacingToken(l.value, Number(v.value) || 16);
          l.value = ''; v.value = '16';
        }}>+</button>
      </div>
    </div>
  );
};

export default CreatorInspector;
