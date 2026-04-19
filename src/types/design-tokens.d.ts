/** Generated from design-tokens.json */
export type DesignTokens = {
  "$schema": "./design-tokens.schema.json",
  "designSystem": {
    "name": "CMS Unified UI System",
    "version": "1.1.0"
  },
  "brand": {
    "fleetRed": "#BF1F2F",
    "pureWhite": "#FFFFFF",
    "charcoal": "#1B1B1D",
    "coolGray": "#95979A",
    "signalTeal": "#00B2A9"
  },
  "color": {
    "surface": {
      "base": "#0b1326",
      "panel": "#131b2e",
      "high": "#1b2438",
      "highest": "#2d3449",
      "inverse": "#FFFFFF"
    },
    "primary": {
      "base": "#BF1F2F",
      "soft": "#D64555",
      "dark": "#8F1622",
      "contrastText": "#FFFFFF"
    },
    "secondary": {
      "base": "#00B2A9",
      "soft": "#33C6BE",
      "contrastText": "#FFFFFF"
    },
    "state": {
      "success": "#3ddc97",
      "warning": "#ffb020",
      "error": "#ff4d4d",
      "info": "#4da3ff"
    },
    "text": {
      "primary": "#FFFFFF",
      "secondary": "#95979A",
      "muted": "#6b748a",
      "disabled": "#3b445a"
    },
    "border": {
      "soft": "rgba(255,255,255,0.06)",
      "medium": "rgba(255,255,255,0.12)",
      "strong": "rgba(255,255,255,0.18)"
    }
  },
  "typography": {
    "fontFamily": {
      "primary": "Inter, system-ui, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "scale": {
      "display": "3.2rem",
      "titleLg": "2rem",
      "titleMd": "1.5rem",
      "titleSm": "1.125rem",
      "body": "1rem",
      "bodySm": "0.875rem",
      "label": "0.75rem",
      "micro": "0.65rem"
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.2,
      "normal": 1.5,
      "relaxed": 1.7
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "2xl": "32px",
    "3xl": "48px",
    "4xl": "64px"
  },
  "radius": {
    "none": "0px",
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "999px"
  },
  "elevation": {
    "none": "none",
    "low": "0 2px 8px rgba(0,0,0,0.2)",
    "medium": "0 8px 20px rgba(0,0,0,0.3)",
    "high": "0 16px 40px rgba(0,0,0,0.4)",
    "floating": "0 20px 60px rgba(0,0,0,0.5)"
  },
  "layout": {
    "grid": {
      "columns": 12,
      "gap": "16px"
    },
    "panel": {
      "sidebarWidth": "280px",
      "inspectorWidth": "340px",
      "topbarHeight": "56px"
    }
  },
  "component": {
    "button": {
      "height": "36px",
      "paddingX": "12px",
      "radius": "8px",
      "fontSize": "0.875rem"
    },
    "card": {
      "padding": "16px",
      "radius": "12px",
      "background": "surface.panel"
    },
    "input": {
      "height": "36px",
      "radius": "8px",
      "paddingX": "12px"
    },
    "panel": {
      "background": "surface.panel",
      "border": "border.soft"
    }
  },
  "interaction": {
    "transition": {
      "fast": "120ms ease-out",
      "normal": "180ms ease-out",
      "slow": "260ms ease-out"
    },
    "hoverScale": 1.02,
    "activeScale": 0.98
  },
  "viewport": {
    "behavior": {
      "singleInstance": true,
      "noDuplicateRender": true,
      "autoFitLayout": true,
      "preventFlicker": true
    }
  },
  "rules": {
    "consistency": {
      "strictComponentReuse": true,
      "noInlineStylingOverrides": true,
      "noModuleSpecificDesignSystem": true
    },
    "rendering": {
      "noViewportDuplication": true,
      "stableMounting": true,
      "preventLayoutShift": true
    }
  }
};
