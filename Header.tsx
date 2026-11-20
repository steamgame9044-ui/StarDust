import { useState } from 'react';
import { Menu, ShoppingBag, User as UserIcon, X, Globe, Shield } from 'lucide-react';
import { Lang, User } from '../types';
import { copy } from '../i18n/translations';

interface HeaderProps {
  lang: Lang;
  onToggleLang: () => void;
  user: User | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onNavigateView: (view: 'public' | 'dashboard' | 'admin') => void;
  activeView: 'public' | 'dashboard' | 'admin';
  onLogout: () => void;
}

export function Header({
  lang,
  onToggleLang,
  user,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onNavigateView,
  activeView,
  onLogout,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = copy[lang].nav;

  const navItems = [
    { href: '#courses', label: t.courses },
    { href: '#services', label: t.services },
    { href: '#videos', label: t.videos },
    { href: '#blog', label: t.blog },
    { href: '#about', label: t.about },
  ];

  const handleAnchorClick = (href: string) => {
    setMobileOpen(false);
    if (activeView !== 'public') {
      onNavigateView('public');
      setTimeout(() => {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigateView('public')}
          className="font-display-en text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-600 transition-colors cursor-pointer"
        >
          StarDust
        </button>

        {/* Zone 2: Concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleAnchorClick(item.href)}
              className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-blue-600 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleLang}
            aria-label="Switch language"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'fa' ? 'EN' : 'فارسی'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{t.cart}</span>
            <span className="tabular-nums text-blue-700">({cartCount})</span>
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateView(user.role === 'admin' ? 'admin' : 'dashboard')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {user.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5" />
                )}
                <span>{user.role === 'admin' ? t.admin : t.portal}</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.signOut}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="lg:hidden p-2 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleAnchorClick(item.href)}
              className="block w-full text-start px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onNavigateView(user.role === 'admin' ? 'admin' : 'dashboard');
                  }}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg"
                >
                  {user.role === 'admin' ? t.admin : t.portal}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="px-4 py-2.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg"
                >
                  {t.signOut}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg"
              >
                {t.signIn}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
