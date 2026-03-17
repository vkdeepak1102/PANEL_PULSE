import { BrandSection } from './BrandSection';
import { NavigationMenu } from './NavigationMenu';
import { SettingsButton } from './SettingsButton';
import { IndiumLogo } from './IndiumLogo';

export function Sidebar() {
  return (
    <aside className="w-[260px] shrink-0 bg-bg-surface border-r border-white/[0.07] flex flex-col h-full overflow-y-auto p-5">
      {/* Brand */}
      <BrandSection />

      {/* Navigation */}
      <NavigationMenu />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Indium branding — above Settings */}
      <div className="pb-3 flex justify-center">
        <IndiumLogo className="w-40 opacity-70 hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Settings */}
      <div className="pt-3 border-t border-white/[0.07]">
        <SettingsButton />
      </div>
    </aside>
  );
}
