import { useEffect, useState, useCallback } from 'react';
import {
  Achievement,
  BlogPost,
  CartItem,
  Course,
  Lang,
  ServiceItem,
  SiteSetting,
  Testimonial,
  User,
  VideoItem,
} from './types';
import { apiRequest, setCsrfToken, setSessionToken } from './utils/api';
import { Header } from './components/Header';
import { PublicSections } from './components/PublicSections';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminPanel } from './components/AdminPanel';

interface BootstrapPayload {
  csrfToken: string;
  user: User | null;
  courses: Course[];
  services: ServiceItem[];
  videos: VideoItem[];
  blogPosts: BlogPost[];
  achievements: Achievement[];
  testimonials: Testimonial[];
  siteSettings: SiteSetting[];
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('stardust_lang');
    return saved === 'en' ? 'en' : 'fa';
  });
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'public' | 'dashboard' | 'admin'>('public');

  const [courses, setCourses] = useState<Course[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('stardust_cart_v1') || '[]');
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const fetchBootstrap = useCallback(async () => {
    try {
      const data = await apiRequest<BootstrapPayload>('/api/bootstrap');
      if (data.csrfToken) setCsrfToken(data.csrfToken);
      setUser(data.user);
      setCourses(data.courses);
      setServices(data.services);
      setVideos(data.videos);
      setBlogPosts(data.blogPosts);
      setAchievements(data.achievements);
      setTestimonials(data.testimonials);
      setSiteSettings(data.siteSettings || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('stardust_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('stardust_cart_v1', JSON.stringify(cart));
  }, [cart]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'fa' ? 'en' : 'fa'));
  };

  const handleAddToCart = (course: Course) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.course.id === course.id);
      if (existing) {
        return prev.map((item) =>
          item.course.id === course.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { course, qty: 1 }];
    });
  };

  const handleUpdateQty = (courseId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.course.id === courseId ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const handleRemoveItem = (courseId: number) => {
    setCart((prev) => prev.filter((item) => item.course.id !== courseId));
  };

  const handleLogout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setSessionToken('');
    setUser(null);
    setActiveView('public');
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const telegramSetting = siteSettings.find((s) => s.setting_key === 'telegram_handle');
  const telegramHandle =
    (lang === 'fa' ? telegramSetting?.value_fa : telegramSetting?.value_en) || '@SaniBK';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {activeView !== 'admin' && (
        <Header
          lang={lang}
          onToggleLang={handleToggleLang}
          user={user}
          cartCount={totalCartItems}
          onOpenCart={() => setCartOpen(true)}
          onOpenAuth={() => setAuthOpen(true)}
          onNavigateView={(view) => {
            if (view === 'admin' && user?.role !== 'admin') {
              setAuthOpen(true);
              return;
            }
            if (view === 'dashboard' && !user) {
              setAuthOpen(true);
              return;
            }
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeView={activeView}
          onLogout={handleLogout}
        />
      )}

      {loading ? (
        <div className="max-w-7xl mx-auto px-6 py-24 text-center text-sm text-slate-500">
          {lang === 'fa' ? 'در حال بارگذاری آکادمی StarDust...' : 'Loading StarDust Academy...'}
        </div>
      ) : activeView === 'admin' && user?.role === 'admin' ? (
        <AdminPanel
          lang={lang}
          user={user}
          onToggleLang={handleToggleLang}
          onBack={() => setActiveView('public')}
          onLogout={handleLogout}
          onDataMutated={fetchBootstrap}
        />
      ) : activeView === 'dashboard' && user ? (
        <StudentDashboard
          lang={lang}
          user={user}
          onBack={() => setActiveView('public')}
          onUserUpdated={(updated) => setUser(updated)}
        />
      ) : (
        <PublicSections
          lang={lang}
          user={user}
          courses={courses}
          services={services}
          videos={videos}
          blogPosts={blogPosts}
          achievements={achievements}
          testimonials={testimonials}
          siteSettings={siteSettings}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lang={lang}
        items={cart}
        user={user}
        telegramHandle={telegramHandle}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        lang={lang}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
          setActiveView(authedUser.role === 'admin' ? 'admin' : 'dashboard');
        }}
      />
    </div>
  );
}
