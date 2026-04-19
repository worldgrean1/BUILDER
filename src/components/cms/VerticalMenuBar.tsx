import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Monitor, Camera, Box, Layers3, Wrench, Settings, Sun, Moon, type LucideIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: '/creator',   label: 'CREATOR',   icon: LayoutGrid },
  { path: '/editer',    label: 'EDITER',    icon: Monitor },
  { path: '/camera',    label: 'CAMERA',    icon: Camera },
  { path: '/scene',     label: 'SCENE',     icon: Box },
  { path: '/audio',     label: 'AUDIO',     icon: Layers3 },
  { path: '/3d-studio', label: '3D STUDIO', icon: Wrench },
];

const VerticalMenuBar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="w-full lg:w-12 lg:min-w-12 lg:max-w-12 h-12 lg:h-auto bg-surface-0 border-b lg:border-b-0 lg:border-r border-border-subtle flex flex-row lg:flex-col items-center px-xs lg:px-0 py-xs lg:py-md gap-0 lg:gap-0 flex-shrink-0 overflow-x-auto lg:overflow-visible">
      {/* Logo mark */}
      <div className="hidden lg:flex items-center justify-center w-full py-3 mb-2">
        <div className="h-7 w-7 rounded-ui-sm bg-brand flex items-center justify-center shadow-elevation-low">
          <span className="text-[9px] font-bold text-white tracking-wider">B</span>
        </div>
      </div>

      {/* Navigation items */}
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              `group relative w-10 lg:w-full flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 lg:min-h-[3.5rem] lg:py-2 transition-all duration-150 ${
                isActive ? 'text-brand' : 'text-text-disabled hover:text-text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute -left-0 top-2 bottom-2 hidden lg:block w-[2px] rounded-r-full bg-brand" />
                )}

                <div className={`flex items-center justify-center rounded-ui-sm w-7 h-7 transition-all duration-150 ${
                  isActive ? 'bg-brand/12' : 'group-hover:bg-surface-2/60'
                }`}>
                  <Icon
                    size={14}
                    strokeWidth={isActive ? 2 : 1.6}
                    className={isActive ? 'text-brand' : 'text-text-muted transition-colors duration-150 group-hover:text-text-secondary'}
                  />
                </div>

                <span
                  className={`hidden lg:block text-[7px] font-semibold leading-none tracking-[0.08em] ${
                    isActive ? 'text-brand' : 'text-text-disabled group-hover:text-text-muted'
                  }`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}

      {/* Bottom actions */}
      <div className="lg:mt-auto flex flex-row lg:flex-col items-center gap-0 lg:gap-1 lg:pb-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          className="flex h-7 w-7 items-center justify-center rounded-ui-sm text-text-disabled transition-colors duration-150 hover:text-text-secondary hover:bg-surface-2/60"
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          onClick={() => navigate('/settings')}
          className="flex h-7 w-7 items-center justify-center rounded-ui-sm text-text-disabled transition-colors duration-150 hover:text-text-secondary hover:bg-surface-2/60"
        >
          <Settings size={13} />
        </button>
      </div>
    </div>
  );
};

export default VerticalMenuBar;
