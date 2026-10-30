import React from 'react';
import logoApp from '@/assets/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  UserCog,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  TrendingUp,
  Wallet,
  FileText,
  Receipt,
  Briefcase,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Tooltip, SidebarDropdown } from '@/components/ui/tooltip';
import { getAssetUrl } from '@/helpers/AssetHelper';
import { useSidebarMenuState } from '@/hooks/useSidebarMenuState';
import type { UserRole } from '@/types';

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
}

interface NavGroup {
  title: string;
  icon: LucideIcon;
  key: string;
  roles: UserRole[];
  children: NavItem[];
}

const navigationItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { title: 'Users', url: '/users', icon: UserCog, roles: ['admin'] },
  { title: 'Klien', url: '/clients', icon: Building2, roles: ['admin'] },
  { title: 'Jenis Kontrak', url: '/contract-types', icon: FileText, roles: ['admin'] },
  { title: 'Jenis Biaya', url: '/cost-types', icon: Receipt, roles: ['admin'] },
];

const navigationBudgetGroup: NavGroup = {
  title: 'Manajemen Anggaran',
  icon: Wallet,
  key: 'budgetManagement',
  roles: ['admin', 'user'],
  children: [
    { title: 'Proyek', url: '/projects', icon: Briefcase, roles: ['admin', 'user'] },
    { title: 'Transaksi', url: '/transactions', icon: CreditCard, roles: ['admin', 'user'] },
    { title: 'Invoice', url: '/invoices', icon: FileText, roles: ['admin', 'user'] },
  ],
};

const navigationReportsGroup: NavGroup = {
  title: 'Laporan',
  icon: FileBarChart,
  key: 'reports',
  roles: ['admin', 'user'],
  children: [
    { title: 'Laporan Bulanan', url: '/reports/monthly', icon: Wallet, roles: ['admin'] },
  ],
};

export interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });
  const { isMenuOpen, toggleMenu } = useSidebarMenuState({
    addressReference: true,
    reports: true,
    budgetManagement: true,
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed]);

  const filteredNavItems = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role as UserRole),
  );

  const filteredBudgetChildren = navigationBudgetGroup.children.filter(
    (item) => !item.roles || item.roles.includes(user?.role as UserRole),
  );

  const canSeeBudgetGroup =
    navigationBudgetGroup.roles.includes(user?.role as UserRole) && filteredBudgetChildren.length > 0;

  const filteredReportChildren = navigationReportsGroup.children.filter(
    (item) => !item.roles || item.roles.includes(user?.role as UserRole),
  );

  const canSeeReportsGroup =
    navigationReportsGroup.roles.includes(user?.role as UserRole) && filteredReportChildren.length > 0;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transform transition-all duration-200 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-slate-200 p-4">
            <div
              className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'justify-between'}`}
            >
              {!sidebarCollapsed && (
                <img src={logoApp} className="w-[50%] mx-auto" alt="Aplikasi Gatra Budget" />
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-600"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            {/* Dashboard Link */}
            {filteredNavItems
              .filter((item) => item.url === '/dashboard')
              .map((item) => {
                const isActive = location.pathname === item.url;
                const linkContent = (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                    flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'gap-3 px-3'} py-2.5 text-sm rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-medium shadow-sm'
                        : 'hover:bg-blue-50 hover:text-blue-700'
                    }
                  `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className={`${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.title}</span>
                  </Link>
                );
                return sidebarCollapsed ? (
                  <Tooltip key={item.title} content={item.title}>
                    {linkContent}
                  </Tooltip>
                ) : (
                  linkContent
                );
              })}

            {/* Collapsible Reports Group - Right below Dashboard */}
            {canSeeReportsGroup && (
              <Collapsible open={isMenuOpen('reports')} onOpenChange={() => toggleMenu('reports')}>
                <CollapsibleTrigger asChild>
                  {sidebarCollapsed ? (
                    <SidebarDropdown
                      trigger={
                        <button
                          className={`
                            flex items-center lg:justify-center lg:px-0 py-2.5 text-sm rounded-lg
                            transition-all duration-200 hover:bg-slate-100
                            ${
                              filteredReportChildren.some(
                                (item) => location.pathname === item.url,
                              )
                                ? 'text-blue-900 font-medium'
                                : 'text-slate-700'
                            }
                          `}
                        >
                          <FileBarChart className="w-5 h-5" />
                        </button>
                      }
                      title={navigationReportsGroup.title}
                    >
                      {filteredReportChildren.map((item) => {
                        const isActive = location.pathname === item.url;
                        return (
                          <Link
                            key={item.title}
                            to={item.url}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                              flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200
                              ${
                                isActive
                                  ? 'bg-blue-50 text-blue-900 font-medium'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }
                            `}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                    </SidebarDropdown>
                  ) : (
                    <button
                      className={`
                        flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-lg
                        transition-all duration-200 hover:bg-slate-100
                        ${
                          filteredReportChildren.some((item) => location.pathname === item.url)
                            ? 'text-blue-900 font-medium'
                            : 'text-slate-700'
                        }
                      `}
                    >
                      <FileBarChart className="w-5 h-5" />
                      <span className="flex-1 text-left">{navigationReportsGroup.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen('reports') ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="ml-4 pl-4 border-l border-slate-200 space-y-1 mt-1">
                    {filteredReportChildren.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <Link
                          key={item.title}
                          to={item.url}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200
                            ${
                              isActive
                                ? 'bg-blue-50 text-blue-900 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
                          `}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Collapsible Budget Management Group */}
            {canSeeBudgetGroup && (
              <Collapsible
                open={isMenuOpen('budgetManagement')}
                onOpenChange={() => toggleMenu('budgetManagement')}
              >
                <CollapsibleTrigger asChild>
                  {sidebarCollapsed ? (
                    <SidebarDropdown
                      trigger={
                        <button
                          className={`
                            flex items-center lg:justify-center lg:px-0 py-2.5 text-sm rounded-lg
                            transition-all duration-200 hover:bg-slate-100
                            ${
                              filteredBudgetChildren.some(
                                (item) => location.pathname === item.url,
                              )
                                ? 'text-blue-900 font-medium'
                                : 'text-slate-700'
                            }
                          `}
                        >
                          <Wallet className="w-5 h-5" />
                        </button>
                      }
                      title={navigationBudgetGroup.title}
                    >
                      {filteredBudgetChildren.map((item) => {
                        const isActive = location.pathname === item.url;
                        return (
                          <Link
                            key={item.title}
                            to={item.url}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                              flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200
                              ${
                                isActive
                                  ? 'bg-blue-50 text-blue-900 font-medium'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }
                            `}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                    </SidebarDropdown>
                  ) : (
                    <button
                      className={`
                        flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-lg
                        transition-all duration-200 hover:bg-slate-100
                        ${
                          filteredBudgetChildren.some((item) => location.pathname === item.url)
                            ? 'text-blue-900 font-medium'
                            : 'text-slate-700'
                        }
                      `}
                    >
                      <Wallet className="w-5 h-5" />
                      <span className="flex-1 text-left">{navigationBudgetGroup.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen('budgetManagement') ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="ml-4 pl-4 border-l border-slate-200 space-y-1 mt-1">
                    {filteredBudgetChildren.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <Link
                          key={item.title}
                          to={item.url}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200
                            ${
                              isActive
                                ? 'bg-blue-50 text-blue-900 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
                          `}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="h-px bg-slate-200 my-2"></div>

            {/* Other Navigation Items (excluding Dashboard) */}
            <div className="space-y-1">
              {filteredNavItems
                .filter((item) => item.url !== '/dashboard')
                .map((item) => {
                  const isActive = location.pathname === item.url;
                  const linkContent = (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                      flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'gap-3 px-3'} py-2.5 text-sm rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 font-medium shadow-sm'
                          : 'hover:bg-blue-50 hover:text-blue-700'
                      }
                    `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className={`${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.title}</span>
                    </Link>
                  );
                  return sidebarCollapsed ? (
                    <Tooltip key={item.title} content={item.title}>
                      {linkContent}
                    </Tooltip>
                  ) : (
                    linkContent
                  );
                })
              }
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4">
            <div
              className={`space-y-3 ${sidebarCollapsed ? 'lg:flex lg:flex-col lg:items-center lg:gap-2' : ''}`}
            >
              <Tooltip
                content={`${user?.full_name || 'Pengguna'} (${user?.role === 'admin' ? 'Administrator' : 'Pengguna'})`}
              >
                <Button
                  variant={sidebarCollapsed ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={() => {
                    navigate('/profile');
                  }}
                  className={`${sidebarCollapsed ? 'lg:w-10 lg:h-10 lg:p-0 lg:justify-center' : 'w-full justify-start items-center gap-3 px-2 py-6'} text-slate-600 hover:text-blue-600 hover:border-blue-200`}
                >
                  {user?.photo_url ? (
                    <img
                      src={getAssetUrl(user.photo_url)}
                      alt="Foto Profil"
                      className={`w-10 h-10 rounded-full object-cover ${sidebarCollapsed ? '' : 'border-2 border-slate-200'}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        (target.nextSibling as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                    style={{ display: user?.photo_url ? 'none' : 'flex' }}
                  >
                    <span className="text-white font-semibold text-sm">
                      {user?.full_name?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div
                    className={`flex-1 text-left min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}
                  >
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {user?.full_name || 'Pengguna'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
                    </p>
                  </div>
                </Button>
              </Tooltip>
              <Tooltip content="Keluar">
                <Button
                  variant={sidebarCollapsed ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={logout}
                  className={`${sidebarCollapsed ? 'lg:w-10 lg:h-10 lg:p-0 lg:justify-center' : 'w-full justify-start gap-2'} text-slate-600 hover:text-red-600 hover:border-red-200`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className={`${sidebarCollapsed ? 'lg:hidden' : ''}`}>Keluar</span>
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 lg:hidden sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Gatra Budget</h1>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
