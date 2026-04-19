import rawTokens from '../../design-tokens.json';

const designTokens = rawTokens;

const stripQuotes = (value: string) => value.trim().replace(/^['"]|['"]$/g, '');

const hexToRgbTuple = (hex: string) => {
  const sanitized = hex.replace('#', '');
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((chunk) => `${chunk}${chunk}`)
          .join('')
      : sanitized;

  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r} ${g} ${b}`;
};

export const tokenColors = {
  brand: designTokens.color.primary.base,
  brandSoft: designTokens.color.primary.soft,
  brandDark: designTokens.color.primary.dark,
  teal: designTokens.color.secondary.base,
  tealSoft: designTokens.color.secondary.soft,
  success: designTokens.color.state.success,
  warning: designTokens.color.state.warning,
  danger: designTokens.color.state.error,
  info: designTokens.color.state.info,
  surfaceBase: designTokens.color.surface.base,
  surfacePanel: designTokens.color.surface.panel,
  surfaceHigh: designTokens.color.surface.high,
  surfaceHighest: designTokens.color.surface.highest,
  surfaceInverse: designTokens.color.surface.inverse,
  textPrimary: designTokens.color.text.primary,
  textSecondary: designTokens.color.text.secondary,
  textMuted: designTokens.color.text.muted,
  textDisabled: designTokens.color.text.disabled,
  borderSoft: designTokens.color.border.soft,
  borderMedium: designTokens.color.border.medium,
  borderStrong: designTokens.color.border.strong,
  charcoal: designTokens.brand.charcoal,
} as const;

export const rgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((chunk) => `${chunk}${chunk}`)
          .join('')
      : sanitized;

  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const applyDesignTokens = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  root.style.setProperty('--font-sans', stripQuotes(designTokens.typography.fontFamily.primary.split(',')[0] ?? 'Inter'));
  root.style.setProperty('--font-mono', stripQuotes(designTokens.typography.fontFamily.mono.split(',')[0] ?? 'JetBrains Mono'));
  root.style.setProperty('--color-brand', hexToRgbTuple(designTokens.color.primary.base));
  root.style.setProperty('--color-brand-soft', hexToRgbTuple(designTokens.color.primary.soft));
  root.style.setProperty('--color-brand-dark', hexToRgbTuple(designTokens.color.primary.dark));
  root.style.setProperty('--color-brand-teal', hexToRgbTuple(designTokens.color.secondary.base));
  root.style.setProperty('--color-brand-teal-soft', hexToRgbTuple(designTokens.color.secondary.soft));
  root.style.setProperty('--color-surface-0', hexToRgbTuple(designTokens.color.surface.base));
  root.style.setProperty('--color-surface-1', hexToRgbTuple(designTokens.color.surface.panel));
  root.style.setProperty('--color-surface-2', hexToRgbTuple(designTokens.color.surface.high));
  root.style.setProperty('--color-surface-3', hexToRgbTuple(designTokens.color.surface.highest));
  root.style.setProperty('--color-border-base', hexToRgbTuple(designTokens.color.surface.inverse));
  root.style.setProperty('--color-text-primary', hexToRgbTuple(designTokens.color.text.primary));
  root.style.setProperty('--color-text-secondary', hexToRgbTuple(designTokens.color.text.secondary));
  root.style.setProperty('--color-text-muted', hexToRgbTuple(designTokens.color.text.muted));
  root.style.setProperty('--color-text-disabled', hexToRgbTuple(designTokens.color.text.disabled));
  root.style.setProperty('--color-success', hexToRgbTuple(designTokens.color.state.success));
  root.style.setProperty('--color-warning', hexToRgbTuple(designTokens.color.state.warning));
  root.style.setProperty('--color-danger', hexToRgbTuple(designTokens.color.state.error));
  root.style.setProperty('--color-info', hexToRgbTuple(designTokens.color.state.info));
  root.style.setProperty('--spacing-xs', designTokens.spacing.xs);
  root.style.setProperty('--spacing-sm', designTokens.spacing.sm);
  root.style.setProperty('--spacing-md', designTokens.spacing.md);
  root.style.setProperty('--spacing-lg', designTokens.spacing.lg);
  root.style.setProperty('--spacing-xl', designTokens.spacing.xl);
  root.style.setProperty('--spacing-2xl', designTokens.spacing['2xl']);
  root.style.setProperty('--radius-sm', designTokens.radius.sm);
  root.style.setProperty('--radius-md', designTokens.radius.md);
  root.style.setProperty('--radius-lg', designTokens.radius.lg);
  root.style.setProperty('--radius-xl', designTokens.radius.xl);
  root.style.setProperty('--panel-sidebar-width', designTokens.layout.panel.sidebarWidth);
  root.style.setProperty('--panel-inspector-width', designTokens.layout.panel.inspectorWidth);
  root.style.setProperty('--panel-topbar-height', designTokens.layout.panel.topbarHeight);
  root.style.setProperty('--button-height', designTokens.component.button.height);
  root.style.setProperty('--input-height', designTokens.component.input.height);
  root.style.setProperty('--transition-fast', designTokens.interaction.transition.fast);
  root.style.setProperty('--transition-normal', designTokens.interaction.transition.normal);
  root.style.setProperty('--transition-slow', designTokens.interaction.transition.slow);
};

export default designTokens;
