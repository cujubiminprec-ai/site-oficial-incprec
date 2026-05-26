import { useState } from "react";
import { MenuItem, SubMenuItem } from "@/pages/admin/tabs/MenuNavegacaoTab";

interface MenuPreviewProps {
  menus: MenuItem[];
  primaryColor: string;
}

export default function MenuPreview({ menus, primaryColor }: MenuPreviewProps) {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const activeMenus = menus.filter(m => m.ativo);

  const renderDropdown = (children: SubMenuItem[]) => {
    const active = children.filter(c => c.ativo);
    if (!active.length) return null;
    return (
      <div
        className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-gray-100 py-1.5 z-10 min-w-[200px]"
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      >
        <div className="px-3 py-1.5 border-b border-gray-50 mb-1">
          <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
            {active.length} itens
          </p>
        </div>
        {active.map((child) => (
          <div
            key={child.id}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            {child.icon && (
              <div
                className="w-5 h-5 flex items-center justify-center rounded flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <i className={`${child.icon} text-[9px]`} style={{ color: primaryColor }}></i>
              </div>
            )}
            <span className="text-[10px] text-gray-600 truncate">{child.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header da prévia */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
            <i className="ri-eye-line text-[10px]" style={{ color: primaryColor }}></i>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Prévia ao Vivo</p>
            <p className="text-[9px] text-gray-400">Como o menu aparece no site</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[9px] text-green-600 font-medium">Live</span>
          </div>
        </div>

        {/* Simulação Desktop */}
        <div className="p-3">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <i className="ri-computer-line text-[9px]"></i> Desktop
          </p>
          {/* Topbar simulada */}
          <div
            className="w-full h-5 rounded-t-lg flex items-center px-3 gap-4"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          >
            <div className="flex items-center gap-1">
              <i className="ri-mail-line text-white/60 text-[7px]"></i>
              <div className="h-1.5 w-16 bg-white/25 rounded-full"></div>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-1.5 w-12 bg-white/25 rounded-full"></div>
            </div>
          </div>
          {/* Navbar simulada */}
          <div
            className="w-full rounded-b-lg px-3 py-2 flex items-center gap-1.5 overflow-x-auto"
            style={{ backgroundColor: primaryColor }}
          >
            {/* Logo */}
            <div className="flex items-center gap-1 mr-2 flex-shrink-0">
              <div className="w-5 h-5 rounded bg-white/20 flex-shrink-0"></div>
              <div className="h-2 w-10 bg-white/60 rounded-full"></div>
            </div>
            {/* Menu items */}
            <div className="flex items-center gap-0.5 flex-1 overflow-hidden">
              {activeMenus.slice(0, 6).map((menu) => (
                <div key={menu.id} className="relative">
                  <button
                    className="flex items-center gap-0.5 px-1.5 py-1 rounded text-[8px] font-medium text-white/90 hover:bg-white/15 whitespace-nowrap transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredMenu(menu.id)}
                    onMouseLeave={() => setHoveredMenu(null)}
                  >
                    {menu.label}
                    {menu.children && menu.children.some(c => c.ativo) && (
                      <i className={`ri-arrow-down-s-line text-[7px] transition-transform ${hoveredMenu === menu.id ? "rotate-180" : ""}`}></i>
                    )}
                  </button>
                  {hoveredMenu === menu.id && menu.children && renderDropdown(menu.children)}
                </div>
              ))}
              {activeMenus.length > 6 && (
                <button className="flex items-center gap-0.5 px-1.5 py-1 rounded text-[8px] font-medium text-white/70 whitespace-nowrap">
                  <i className="ri-apps-2-line text-[7px]"></i>
                  +{activeMenus.length - 6}
                </button>
              )}
            </div>
            {/* Admin btn */}
            <div className="flex-shrink-0 px-2 py-0.5 rounded-full border border-white/40 text-[7px] text-white/80 whitespace-nowrap">
              Admin
            </div>
          </div>

          {/* Conteúdo placeholder */}
          <div className="mt-2 rounded-lg overflow-hidden" style={{ backgroundColor: `${primaryColor}08` }}>
            <div className="h-12 flex items-center justify-center">
              <p className="text-[9px] text-gray-300">Conteúdo da página</p>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="mx-3 border-t border-gray-100"></div>

        {/* Simulação Mobile */}
        <div className="p-3">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <i className="ri-smartphone-line text-[9px]"></i> Mobile
          </p>
          <div className="w-32 mx-auto">
            {/* Navbar mobile */}
            <div className="rounded-lg px-2 py-1.5 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-white/20 flex-shrink-0"></div>
                <div className="h-1.5 w-8 bg-white/60 rounded-full"></div>
              </div>
              <i className="ri-menu-line text-white text-[10px]"></i>
            </div>
            {/* Menu aberto */}
            <div className="bg-white rounded-b-lg border border-gray-100 border-t-0 px-2 py-1">
              {activeMenus.slice(0, 4).map((menu) => (
                <div key={menu.id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <span className="text-[8px] text-gray-600 font-medium">{menu.label}</span>
                  {menu.children && <i className="ri-arrow-down-s-line text-[8px] text-gray-300"></i>}
                </div>
              ))}
              {activeMenus.length > 4 && (
                <p className="text-[7px] text-gray-300 text-center py-0.5">
                  +{activeMenus.length - 4} menus
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="mx-3 border-t border-gray-100"></div>

        {/* Stats ao vivo */}
        <div className="p-3 grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {activeMenus.length}
            </p>
            <p className="text-[9px] text-gray-400">Menus visíveis</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {menus.reduce((acc, m) => acc + (m.children?.filter(s => s.ativo).length || 0), 0)}
            </p>
            <p className="text-[9px] text-gray-400">Sub-itens ativos</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center col-span-2">
            <p className="text-[9px] text-gray-500 leading-relaxed">
              Passe o mouse sobre os menus acima para ver o dropdown
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
