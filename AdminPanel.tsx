import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Youtube,
  FileText,
  Award,
  Briefcase,
  MessageSquare,
  Image as ImageIcon,
  SlidersHorizontal,
  Database,
  Search,
  Bell,
  LogOut,
  ExternalLink,
  Download,
  Copy,
  Check,
  Trash2,
  Edit3,
  Plus,
  CheckCircle2,
  XCircle,
  Upload,
  FileCode2,
  RotateCcw,
  Save,
  Users,
  Lock,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import {
  Achievement,
  BlogPost,
  Course,
  Lang,
  PhpBundleFile,
  ServiceItem,
  SiteSetting,
  Testimonial,
  User,
  VideoItem,
} from '../types';
import { copy } from '../i18n/translations';
import {
  apiRequest,
  convertImageFileToWebpDataUrl,
  getSessionToken,
  safeCopyToClipboard,
} from '../utils/api';
import { ResilientImage } from './ResilientImage';

interface AdminPanelProps {
  lang: Lang;
  user: User;
  onToggleLang: () => void;
  onBack: () => void;
  onLogout: () => void;
  onDataMutated: () => void;
}

interface AdminOverview {
  stats: {
    courses: number;
    blogPosts: number;
    videos: number;
    pendingTestimonials: number;
    orders: number;
    consultations: number;
    students: number;
  };
  courses: Course[];
  blogPosts: BlogPost[];
  videos: VideoItem[];
  services: ServiceItem[];
  achievements: Achievement[];
  testimonials: Testimonial[];
  orders: Array<{
    id: number;
    order_code: string;
    customer_name: string;
    customer_email: string;
    customer_telegram: string;
    items_json: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  consultations: Array<{
    id: number;
    full_name: string;
    email: string;
    phone_or_telegram: string;
    service_type: string;
    preferred_date: string;
    goals: string;
    status: string;
  }>;
  siteSettings: SiteSetting[];
  mediaLibrary: Array<{ folder: string; filename: string; url: string }>;
  phpBundle: PhpBundleFile[];
}

type AdminTab =
  | 'overview'
  | 'courses'
  | 'videos'
  | 'blog'
  | 'achievements'
  | 'services'
  | 'testimonials'
  | 'media'
  | 'siteSettings'
  | 'phpExport';

export function AdminPanel({
  lang,
  user,
  onToggleLang,
  onBack,
  onLogout,
  onDataMutated,
}: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<AdminOverview | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<SiteSetting[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedPhpPath, setSelectedPhpPath] = useState('database/schema.sql');
  const [copiedCode, setCopiedCode] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<'banners' | 'courses' | 'blog' | 'achievements'>('banners');

  // Password change state
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  // Course form state
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState({
    title_fa: '',
    title_en: '',
    type: 'online' as 'online' | 'in_person' | 'booklet',
    level: 'B1 - B2',
    price: 2500000,
    duration_label_fa: '۸ هفته · ۱۶ جلسه',
    duration_label_en: '8 Weeks · 16 Sessions',
    instructor: 'StarDust Faculty',
    description_fa: '',
    description_en: '',
    image_webp: '/src/assets/images/course_ielts_mastery_1795157697644.jpg',
    is_featured: true,
  });

  // Blog form state
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [blogForm, setBlogForm] = useState({
    title_fa: '',
    title_en: '',
    category_fa: 'استراتژی آزمون',
    category_en: 'Exam Strategy',
    read_time: '۵ دقیقه مطالعه',
    excerpt_fa: '',
    excerpt_en: '',
    content_fa: '',
    content_en: '',
    image_webp: '/src/assets/images/blog_study_strategy_1795157698426.jpg',
  });

  // Video form state
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [videoForm, setVideoForm] = useState({
    title_fa: '',
    title_en: '',
    category: 'IELTS & Grammar',
    youtube_input: '',
    duration_label: '12:00',
    description_fa: '',
    description_en: '',
  });

  // Service form state
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title_fa: '',
    title_en: '',
    category: 'special',
    summary_fa: '',
    summary_en: '',
    deliverable_fa: '',
    deliverable_en: '',
    price_label_fa: '',
    price_label_en: '',
  });

  // Achievement form state
  const [editingAchId, setEditingAchId] = useState<number | null>(null);
  const [achForm, setAchForm] = useState({
    student_name: '',
    exam_type: 'IELTS Academic',
    score_before: '5.5',
    score_after: '7.5',
    timeframe_fa: '۱۰ هفته',
    timeframe_en: '10 Weeks',
    story_fa: '',
    story_en: '',
    image_webp: '/src/assets/images/course_speaking_club_1795157697931.jpg',
  });

  const flash = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const loadOverview = async () => {
    try {
      const res = await apiRequest<AdminOverview>('/api/admin/overview');
      setData(res);
      setSettingsDraft(res.siteSettings || []);
    } catch (err: any) {
      flash(err.message || 'Failed to load admin overview.', 'error');
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    folder: 'courses' | 'blog' | 'achievements' | 'banners',
    onUrl: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await convertImageFileToWebpDataUrl(file, folder === 'banners' ? 1600 : 1280);
      const res = await apiRequest<{ url: string; mediaLibrary?: AdminOverview['mediaLibrary'] }>(
        '/api/admin/upload',
        {
          method: 'POST',
          body: JSON.stringify({ folder, dataUrl }),
        }
      );
      onUrl(res.url);
      if (res.mediaLibrary && data) {
        setData({ ...data, mediaLibrary: res.mediaLibrary });
      }
      flash(
        lang === 'fa'
          ? 'تصویر با موفقیت آپلود و با فرمت بهینه WebP ذخیره شد.'
          : 'Image uploaded and optimized to WebP.'
      );
    } catch (err: any) {
      flash(err.message || 'Image upload failed.', 'error');
    }
  };

  const assignBannerSetting = async (settingKey: 'hero_image_webp' | 'about_image_webp', url: string) => {
    const updated = settingsDraft.map((item) =>
      item.setting_key === settingKey ? { ...item, value_fa: url, value_en: url } : item
    );
    setSettingsDraft(updated);
    const target = updated.find((s) => s.setting_key === settingKey);
    if (!target) return;
    await apiRequest('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings: [target] }),
    });
    onDataMutated();
    flash(
      lang === 'fa'
        ? 'تصویر جدید بلافاصله روی وب‌سایت اصلی اعمال شد.'
        : 'Banner image updated on the live website.'
    );
  };

  // Courses CRUD
  const saveCourse = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourseId) {
        await apiRequest(`/api/admin/courses/${editingCourseId}`, {
          method: 'PUT',
          body: JSON.stringify(courseForm),
        });
        setEditingCourseId(null);
      } else {
        await apiRequest('/api/admin/courses', {
          method: 'POST',
          body: JSON.stringify(courseForm),
        });
      }
      setCourseForm({
        title_fa: '',
        title_en: '',
        type: 'online',
        level: 'B1 - B2',
        price: 2500000,
        duration_label_fa: '۸ هفته · ۱۶ جلسه',
        duration_label_en: '8 Weeks · 16 Sessions',
        instructor: 'StarDust Faculty',
        description_fa: '',
        description_en: '',
        image_webp: '/src/assets/images/course_ielts_mastery_1795157697644.jpg',
        is_featured: true,
      });
      await loadOverview();
      onDataMutated();
      flash(lang === 'fa' ? 'دوره یا جزوه با موفقیت ذخیره شد.' : 'Course saved successfully.');
    } catch (err: any) {
      flash(err.message, 'error');
    }
  };

  const deleteCourse = async (id: number) => {
    await apiRequest(`/api/admin/courses/${id}`, { method: 'DELETE' });
    await loadOverview();
    onDataMutated();
    flash(lang === 'fa' ? 'مورد انتخاب‌شده حذف شد.' : 'Course deleted.');
  };

  // Blog CRUD
  const saveBlog = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlogId) {
        await apiRequest(`/api/admin/blog/${editingBlogId}`, {
          method: 'PUT',
          body: JSON.stringify(blogForm),
        });
        setEditingBlogId(null);
      } else {
        await apiRequest('/api/admin/blog', {
          method: 'POST',
          body: JSON.stringify(blogForm),
        });
      }
      setBlogForm({
        title_fa: '',
        title_en: '',
        category_fa: 'استراتژی آزمون',
        category_en: 'Exam Strategy',
        read_time: '۵ دقیقه مطالعه',
        excerpt_fa: '',
        excerpt_en: '',
        content_fa: '',
        content_en: '',
        image_webp: '/src/assets/images/blog_study_strategy_1795157698426.jpg',
      });
      await loadOverview();
      onDataMutated();
      flash(lang === 'fa' ? 'مقاله با موفقیت منتشر/ویرایش شد.' : 'Blog article saved.');
    } catch (err: any) {
      flash(err.message, 'error');
    }
  };

  const deleteBlog = async (id: number) => {
    await apiRequest(`/api/admin/blog/${id}`, { method: 'DELETE' });
    await loadOverview();
    onDataMutated();
  };

  // Videos CRUD
  const saveVideo = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideoId) {
        await apiRequest(`/api/admin/videos/${editingVideoId}`, {
          method: 'PUT',
          body: JSON.stringify(videoForm),
        });
        setEditingVideoId(null);
      } else {
        await apiRequest('/api/admin/videos', {
          method: 'POST',
          body: JSON.stringify(videoForm),
        });
      }
      setVideoForm({
        title_fa: '',
        title_en: '',
        category: 'IELTS & Grammar',
        youtube_input: '',
        duration_label: '12:00',
        description_fa: '',
        description_en: '',
      });
      await loadOverview();
      onDataMutated();
      flash(lang === 'fa' ? 'ویدیوی رایگان با موفقیت ذخیره شد.' : 'Free video saved.');
    } catch (err: any) {
      flash(err.message, 'error');
    }
  };

  const deleteVideo = async (id: number) => {
    await apiRequest(`/api/admin/videos/${id}`, { method: 'DELETE' });
    await loadOverview();
    onDataMutated();
  };

  // Services CRUD
  const saveService = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingServiceId) {
        await apiRequest(`/api/admin/services/${editingServiceId}`, {
          method: 'PUT',
          body: JSON.stringify(serviceForm),
        });
        setEditingServiceId(null);
      } else {
        await apiRequest('/api/admin/services', {
          method: 'POST',
          body: JSON.stringify(serviceForm),
        });
      }
      setServiceForm({
        title_fa: '',
        title_en: '',
        category: 'special',
        summary_fa: '',
        summary_en: '',
        deliverable_fa: '',
        deliverable_en: '',
        price_label_fa: '',
        price_label_en: '',
      });
      await loadOverview();
      onDataMutated();
      flash(lang === 'fa' ? 'خدمت با موفقیت ذخیره شد.' : 'Service saved.');
    } catch (err: any) {
      flash(err.message, 'error');
    }
  };

  const deleteService = async (id: number) => {
    await apiRequest(`/api/admin/services/${id}`, { method: 'DELETE' });
    await loadOverview();
    onDataMutated();
  };

  // Achievements CRUD
  const saveAchievement = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingAchId) {
        await apiRequest(`/api/admin/achievements/${editingAchId}`, {
          method: 'PUT',
          body: JSON.stringify(achForm),
        });
        setEditingAchId(null);
      } else {
        await apiRequest('/api/admin/achievements', {
          method: 'POST',
          body: JSON.stringify(achForm),
        });
      }
      setAchForm({
        student_name: '',
        exam_type: 'IELTS Academic',
        score_before: '5.5',
        score_after: '7.5',
        timeframe_fa: '۱۰ هفته',
        timeframe_en: '10 Weeks',
        story_fa: '',
        story_en: '',
        image_webp: '/src/assets/images/course_speaking_club_1795157697931.jpg',
      });
      await loadOverview();
      onDataMutated();
      flash(lang === 'fa' ? 'دستاورد زبان‌آموز ذخیره شد.' : 'Student achievement saved.');
    } catch (err: any) {
      flash(err.message, 'error');
    }
  };

  const deleteAchievement = async (id: number) => {
    await apiRequest(`/api/admin/achievements/${id}`, { method: 'DELETE' });
    await loadOverview();
    onDataMutated();
  };

  // Testimonials & Orders & Consultations
  const moderateTestimonial = async (id: number, status: 'approved' | 'rejected') => {
    await apiRequest(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadOverview();
    onDataMutated();
    flash(status === 'approved' ? (lang === 'fa' ? 'نظر تایید و منتشر شد.' : 'Review approved.') : (lang === 'fa' ? 'نظر مخفی شد.' : 'Review hidden.'));
  };

  const deleteTestimonial = async (id: number) => {
    await apiRequest(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    await loadOverview();
    onDataMutated();
    flash(lang === 'fa' ? 'نظر حذف شد.' : 'Review deleted.');
  };

  const updateOrderStatus = async (id: number, status: string) => {
    await apiRequest(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadOverview();
  };

  const updateConsultationStatus = async (id: number, status: string) => {
    await apiRequest(`/api/admin/consultations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadOverview();
  };

  // Settings & Password
  const updateSettingField = (key: string, field: 'value_fa' | 'value_en', value: string) => {
    setSettingsDraft((prev) =>
      prev.map((item) => (item.setting_key === key ? { ...item, [field]: value } : item))
    );
  };

  const saveSiteSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await apiRequest<{ siteSettings: SiteSetting[] }>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: settingsDraft }),
      });
      setSettingsDraft(res.siteSettings);
      onDataMutated();
      flash(
        lang === 'fa'
          ? 'تمام تنظیمات و متون صفحه اصلی با موفقیت در سایت اعمال شد.'
          : 'All site copy and brand settings saved.'
      );
    } catch (err: any) {
      flash(err.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const resetSiteSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await apiRequest<{ siteSettings: SiteSetting[] }>('/api/admin/settings/reset', {
        method: 'POST',
      });
      setSettingsDraft(res.siteSettings);
      onDataMutated();
      flash(lang === 'fa' ? 'متن‌های پیش‌فرض بازگردانی شد.' : 'Default copy restored.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      flash(lang === 'fa' ? 'رمز عبور جدید و تکرار آن یکسان نیستند.' : 'New passwords do not match.', 'error');
      return;
    }
    try {
      await apiRequest('/api/admin/password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: pwForm.current_password,
          new_password: pwForm.new_password,
        }),
      });
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      flash(lang === 'fa' ? 'رمز عبور مدیر با موفقیت تغییر کرد.' : 'Admin password updated.');
    } catch (err: any) {
      flash(err.message, 'error');
    }
  };

  const selectedPhpFile =
    data?.phpBundle.find((f) => f.path === selectedPhpPath) || data?.phpBundle[0];

  const handleCopyPhp = async () => {
    if (!selectedPhpFile) return;
    await safeCopyToClipboard(selectedPhpFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const q = searchQuery.trim().toLowerCase();

  const navGroups: Array<{
    groupLabel: string;
    items: Array<{ id: AdminTab; label: string; icon: any; badge?: number }>;
  }> = [
    {
      groupLabel: lang === 'fa' ? 'مدیریت اصلی' : 'Dashboard',
      items: [
        { id: 'overview', label: lang === 'fa' ? 'پیشخوان و سفارش‌ها' : 'Overview & Orders', icon: LayoutDashboard },
        {
          id: 'testimonials',
          label: lang === 'fa' ? 'تایید نظرات' : 'Testimonials',
          icon: MessageSquare,
          badge: data?.stats.pendingTestimonials || 0,
        },
      ],
    },
    {
      groupLabel: lang === 'fa' ? 'محتوا و فروشگاه' : 'Content & Store',
      items: [
        { id: 'courses', label: lang === 'fa' ? 'دوره‌ها و جزوه‌ها' : 'Courses & Booklets', icon: BookOpen },
        { id: 'videos', label: lang === 'fa' ? 'آموزش‌های رایگان' : 'Free Videos', icon: Youtube },
        { id: 'blog', label: lang === 'fa' ? 'وبلاگ و مقالات' : 'Journal & Blog', icon: FileText },
        { id: 'achievements', label: lang === 'fa' ? 'نمونه‌کار و دستاوردها' : 'Achievements', icon: Award },
        { id: 'services', label: lang === 'fa' ? 'خدمات و مشاوره‌ها' : 'Services & Bookings', icon: Briefcase },
      ],
    },
    {
      groupLabel: lang === 'fa' ? 'رسانه، تنظیمات و هاست' : 'Media, Settings & Host',
      items: [
        { id: 'media', label: lang === 'fa' ? 'مدیریت تصاویر و بنرها' : 'Media & Banners', icon: ImageIcon },
        { id: 'siteSettings', label: lang === 'fa' ? 'ویرایشگر متون و امنیت' : 'Site Copy & Security', icon: SlidersHorizontal },
        { id: 'phpExport', label: lang === 'fa' ? 'خروجی PHP 8 و MySQL' : 'PHP 8 & MySQL Export', icon: Database },
      ],
    },
  ];

  const heroImageUrl =
    settingsDraft.find((s) => s.setting_key === 'hero_image_webp')?.value_fa ||
    '/src/assets/images/hero_stardust_academy_1795157697795.jpg';
  const aboutImageUrl =
    settingsDraft.find((s) => s.setting_key === 'about_image_webp')?.value_fa ||
    '/src/assets/images/course_speaking_club_1795157697931.jpg';

  const zipDownloadUrl = `/api/admin/php-bundle.zip?token=${encodeURIComponent(getSessionToken())}`;

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-5 bg-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <div className="font-display-en text-xl font-bold tracking-tight text-slate-900">StarDust</div>
            <div className="text-[11px] font-medium text-blue-700">
              {lang === 'fa' ? 'کنسول مدیریت آکادمی' : 'Academy Admin Studio'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.groupLabel} className="space-y-1.5">
              <div className="px-3 text-[11px] font-semibold text-slate-400">{group.groupLabel}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-md tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          <span>{copy[lang].admin.backToSite}</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-700 bg-red-50/60 border border-red-100 rounded-xl hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'خروج امن از حساب' : 'Secure Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col lg:flex-row">
      {/* Desktop Fixed Sidebar (Right in RTL Persian, Left in LTR English) */}
      <aside className="hidden lg:block lg:w-64 shrink-0 border-e border-slate-200 bg-white sticky top-0 h-screen overflow-y-auto">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex bg-slate-900/40 backdrop-blur-xs">
          <div className="w-72 max-w-[85vw] h-full bg-white border-e border-slate-200 shadow-2xl overflow-y-auto">
            {renderSidebarContent()}
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Dashboard Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'fa'
                    ? 'جستجوی سریع در دوره‌ها، مقالات، سفارش‌ها و نظرات...'
                    : 'Quick search courses, posts, orders, reviews...'
                }
                className="w-full ps-10 pe-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleLang}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'fa' ? 'EN' : 'فارسی'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('testimonials')}
              title={lang === 'fa' ? 'نظرات در انتظار تایید' : 'Pending reviews'}
              className="relative p-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {(data?.stats.pendingTestimonials || 0) > 0 && (
                <span className="absolute -top-1.5 -end-1.5 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full tabular-nums">
                  {data?.stats.pendingTestimonials}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2.5 ps-2 border-s border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center">
                {user.full_name.slice(0, 1).toUpperCase()}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-slate-900">{user.full_name}</div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  {lang === 'fa' ? 'مدیر کل سیستم' : 'Administrator'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-8 max-w-6xl w-full mx-auto">
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
                statusMsg.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span>{statusMsg.text}</span>
              <button type="button" onClick={() => setStatusMsg(null)} className="p-1 opacity-70 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!data ? (
            <div className="p-16 text-center text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl">
              {lang === 'fa' ? 'در حال دریافت اطلاعات پنل مدیریت...' : 'Loading admin workspace...'}
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {tab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {lang === 'fa' ? 'پیشخوان مدیریت StarDust' : 'StarDust Management Overview'}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'fa'
                        ? 'گزارش لحظه‌ای وضعیت آکادمی، سفارش‌های سبد خرید و درخواست‌های مشاوره'
                        : 'Live overview of students, courses, journal articles, pending reviews, and cart orders'}
                    </p>
                  </div>

                  {/* 4 KPI CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">
                          {lang === 'fa' ? 'تعداد کل زبان‌آموزان' : 'Total Students'}
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tabular-nums">{data.stats.students}</div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">
                          {lang === 'fa' ? 'دوره‌ها و جزوه‌ها' : 'Courses & Booklets'}
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tabular-nums">{data.stats.courses}</div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">
                          {lang === 'fa' ? 'مقالات وبلاگ' : 'Blog Articles'}
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tabular-nums">{data.stats.blogPosts}</div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTab('testimonials')}
                      className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between gap-4 text-start hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">
                          {lang === 'fa' ? 'نظرات در انتظار تایید' : 'Pending Testimonials'}
                        </div>
                        <div className="text-2xl font-bold text-amber-700 tabular-nums">
                          {data.stats.pendingTestimonials}
                        </div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </button>
                  </div>

                  {/* LATEST CART ORDERS TABLE */}
                  <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                      <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                        {lang === 'fa' ? 'آخرین درخواست‌های ثبت‌شده در سبد خرید' : 'Latest Shopping Cart Orders'}
                      </h2>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {data.orders.length} {lang === 'fa' ? 'سفارش' : 'orders'}
                      </span>
                    </div>

                    {data.orders.length === 0 ? (
                      <div className="p-10 text-center text-xs text-slate-500">
                        {lang === 'fa' ? 'هنوز درخواستی از سبد خرید ثبت نشده است.' : 'No cart orders placed yet.'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-start">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-4 text-start font-semibold">{lang === 'fa' ? 'کد سفارش' : 'Order Code'}</th>
                              <th className="py-3 px-4 text-start font-semibold">{lang === 'fa' ? 'متقاضی' : 'Customer'}</th>
                              <th className="py-3 px-4 text-start font-semibold">{lang === 'fa' ? 'اقلام' : 'Items'}</th>
                              <th className="py-3 px-4 text-start font-semibold">{lang === 'fa' ? 'مبلغ کل' : 'Total'}</th>
                              <th className="py-3 px-4 text-start font-semibold">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {data.orders
                              .filter(
                                (o) =>
                                  !q ||
                                  o.order_code.toLowerCase().includes(q) ||
                                  o.customer_name.toLowerCase().includes(q) ||
                                  o.customer_email.toLowerCase().includes(q)
                              )
                              .map((ord) => {
                                let itemNames = '';
                                try {
                                  const parsed = JSON.parse(ord.items_json || '[]');
                                  itemNames = parsed
                                    .map((i: any) => `${lang === 'fa' ? i.title_fa : i.title_en} ×${i.qty}`)
                                    .join(' · ');
                                } catch {
                                  itemNames = '—';
                                }
                                return (
                                  <tr key={ord.id} className="hover:bg-slate-50/80">
                                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                                      {ord.order_code}
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="font-semibold text-slate-900">{ord.customer_name}</div>
                                      <div className="text-slate-500">
                                        {ord.customer_email}
                                        {ord.customer_telegram ? ` · ${ord.customer_telegram}` : ''}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{itemNames}</td>
                                    <td className="py-3 px-4 font-bold text-blue-700 tabular-nums whitespace-nowrap">
                                      {ord.total_amount.toLocaleString()} {copy[lang].store.currency}
                                    </td>
                                    <td className="py-3 px-4">
                                      <select
                                        value={ord.status}
                                        onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-medium"
                                      >
                                        <option value="pending_telegram">
                                          {lang === 'fa' ? 'ارسال به تلگرام' : 'Pending Telegram'}
                                        </option>
                                        <option value="confirmed">
                                          {lang === 'fa' ? 'تایید نهایی' : 'Confirmed'}
                                        </option>
                                        <option value="cancelled">
                                          {lang === 'fa' ? 'لغو شده' : 'Cancelled'}
                                        </option>
                                      </select>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* TAB 2: COURSES & BOOKLETS */}
              {tab === 'courses' && (
                <div className="grid lg:grid-cols-12 gap-8">
                  <form
                    onSubmit={saveCourse}
                    className="lg:col-span-5 p-6 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3.5 h-fit"
                  >
                    <h2 className="font-bold text-slate-900">
                      {editingCourseId
                        ? lang === 'fa'
                          ? 'ویرایش دوره یا جزوه'
                          : 'Edit Course / Booklet'
                        : lang === 'fa'
                          ? 'افزودن دوره یا جزوه جدید'
                          : 'Add Course or Booklet'}
                    </h2>
                    <input
                      required
                      value={courseForm.title_fa}
                      onChange={(e) => setCourseForm({ ...courseForm, title_fa: e.target.value })}
                      placeholder="عنوان فارسی دوره یا جزوه"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <input
                      value={courseForm.title_en}
                      onChange={(e) => setCourseForm({ ...courseForm, title_en: e.target.value })}
                      placeholder="English Title"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={courseForm.type}
                        onChange={(e) => setCourseForm({ ...courseForm, type: e.target.value as any })}
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="online">{lang === 'fa' ? 'کلاس آنلاین' : 'Online Course'}</option>
                        <option value="in_person">{lang === 'fa' ? 'کلاس حضوری' : 'In-Person Class'}</option>
                        <option value="booklet">{lang === 'fa' ? 'جزوه اختصاصی' : 'Study Booklet'}</option>
                      </select>
                      <input
                        required
                        type="number"
                        value={courseForm.price}
                        onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                        placeholder="Price (IRR)"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl tabular-nums"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={courseForm.level}
                        onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                        placeholder="Level (B2 - C1)"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <input
                        value={courseForm.instructor}
                        onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                        placeholder="Instructor"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={courseForm.duration_label_fa}
                        onChange={(e) => setCourseForm({ ...courseForm, duration_label_fa: e.target.value })}
                        placeholder="مدت فارسی"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <input
                        value={courseForm.duration_label_en}
                        onChange={(e) => setCourseForm({ ...courseForm, duration_label_en: e.target.value })}
                        placeholder="Duration EN"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={courseForm.description_fa}
                      onChange={(e) => setCourseForm({ ...courseForm, description_fa: e.target.value })}
                      placeholder="توضیحات فارسی"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <textarea
                      rows={2}
                      value={courseForm.description_en}
                      onChange={(e) => setCourseForm({ ...courseForm, description_en: e.target.value })}
                      placeholder="English description"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>{lang === 'fa' ? 'آپلود تصویر کاور (WebP / JPG / PNG)' : 'Upload Cover (WebP / JPG / PNG)'}</span>
                        <input
                          type="file"
                          accept="image/webp,image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e, 'courses', (url) => setCourseForm({ ...courseForm, image_webp: url }))
                          }
                        />
                      </label>
                      <input
                        value={courseForm.image_webp}
                        onChange={(e) => setCourseForm({ ...courseForm, image_webp: e.target.value })}
                        placeholder="Image URL"
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingCourseId ? (lang === 'fa' ? 'ذخیره ویرایش' : 'Update') : (lang === 'fa' ? 'افزودن دوره' : 'Publish')}</span>
                      </button>
                      {editingCourseId && (
                        <button
                          type="button"
                          onClick={() => setEditingCourseId(null)}
                          className="px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl"
                        >
                          {lang === 'fa' ? 'انصراف' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="lg:col-span-7 space-y-3">
                    {data.courses
                      .filter(
                        (c) =>
                          !q ||
                          c.title_fa.toLowerCase().includes(q) ||
                          c.title_en.toLowerCase().includes(q)
                      )
                      .map((course) => (
                        <div
                          key={course.id}
                          className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <ResilientImage
                              src={course.image_webp}
                              alt={course.title_en}
                              className="w-16 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div className="space-y-0.5 min-w-0">
                              <div className="text-xs text-slate-500">
                                {course.type} · {course.level} ·{' '}
                                <span className="tabular-nums font-semibold text-blue-700">
                                  {course.price.toLocaleString()}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900 text-sm truncate">
                                {lang === 'fa' ? course.title_fa : course.title_en}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCourseId(course.id);
                                setCourseForm({
                                  title_fa: course.title_fa,
                                  title_en: course.title_en,
                                  type: course.type,
                                  level: course.level,
                                  price: course.price,
                                  duration_label_fa: course.duration_label_fa,
                                  duration_label_en: course.duration_label_en,
                                  instructor: course.instructor,
                                  description_fa: course.description_fa,
                                  description_en: course.description_en,
                                  image_webp: course.image_webp,
                                  is_featured: Boolean(course.is_featured),
                                });
                              }}
                              className="p-2 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCourse(course.id)}
                              className="p-2 text-slate-500 hover:text-red-600 rounded-lg border border-slate-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 3: FREE YOUTUBE VIDEOS (ADD, EDIT, DELETE) */}
              {tab === 'videos' && (
                <div className="grid lg:grid-cols-12 gap-8">
                  <form
                    onSubmit={saveVideo}
                    className="lg:col-span-5 p-6 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3.5 h-fit"
                  >
                    <h2 className="font-bold text-slate-900">
                      {editingVideoId
                        ? lang === 'fa'
                          ? 'ویرایش ویدیوی رایگان'
                          : 'Edit Free Video'
                        : lang === 'fa'
                          ? 'افزودن ویدیوی یوتیوب رایگان'
                          : 'Add Free YouTube Lesson'}
                    </h2>
                    <input
                      required
                      value={videoForm.title_fa}
                      onChange={(e) => setVideoForm({ ...videoForm, title_fa: e.target.value })}
                      placeholder="عنوان فارسی ویدیو"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <input
                      value={videoForm.title_en}
                      onChange={(e) => setVideoForm({ ...videoForm, title_en: e.target.value })}
                      placeholder="English Title"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <input
                      required
                      value={videoForm.youtube_input}
                      onChange={(e) => setVideoForm({ ...videoForm, youtube_input: e.target.value })}
                      placeholder="YouTube URL or Video ID (e.g. https://youtu.be/...)"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={videoForm.category}
                        onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                        placeholder="Category"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <input
                        value={videoForm.duration_label}
                        onChange={(e) => setVideoForm({ ...videoForm, duration_label: e.target.value })}
                        placeholder="Duration (12:30)"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={videoForm.description_fa}
                      onChange={(e) => setVideoForm({ ...videoForm, description_fa: e.target.value })}
                      placeholder="توضیح کوتاه فارسی"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <textarea
                      rows={2}
                      value={videoForm.description_en}
                      onChange={(e) => setVideoForm({ ...videoForm, description_en: e.target.value })}
                      placeholder="English short summary"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
                      >
                        {editingVideoId ? (lang === 'fa' ? 'ذخیره ویرایش' : 'Update Video') : (lang === 'fa' ? 'انتشار با برچسب رایگان' : 'Publish Free Video')}
                      </button>
                      {editingVideoId && (
                        <button
                          type="button"
                          onClick={() => setEditingVideoId(null)}
                          className="px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl"
                        >
                          {lang === 'fa' ? 'انصراف' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="lg:col-span-7 space-y-3">
                    {data.videos
                      .filter(
                        (v) =>
                          !q ||
                          v.title_fa.toLowerCase().includes(q) ||
                          v.title_en.toLowerCase().includes(q)
                      )
                      .map((v) => (
                        <div
                          key={v.id}
                          className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="text-xs text-emerald-700 font-semibold">
                              {lang === 'fa' ? 'رایگان' : 'Free'} · {v.category} · {v.duration_label} · ID: {v.youtube_id}
                            </div>
                            <div className="font-bold text-slate-900 text-sm truncate">
                              {lang === 'fa' ? v.title_fa : v.title_en}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVideoId(v.id);
                                setVideoForm({
                                  title_fa: v.title_fa,
                                  title_en: v.title_en,
                                  category: v.category,
                                  youtube_input: v.youtube_id,
                                  duration_label: v.duration_label,
                                  description_fa: v.description_fa,
                                  description_en: v.description_en,
                                });
                              }}
                              className="p-2 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteVideo(v.id)}
                              className="p-2 text-slate-500 hover:text-red-600 rounded-lg border border-slate-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 4: BLOG MAGAZINE */}
              {tab === 'blog' && (
                <div className="grid lg:grid-cols-12 gap-8">
                  <form
                    onSubmit={saveBlog}
                    className="lg:col-span-5 p-6 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3.5 h-fit"
                  >
                    <h2 className="font-bold text-slate-900">
                      {editingBlogId
                        ? lang === 'fa'
                          ? 'ویرایش مقاله وبلاگ'
                          : 'Edit Article'
                        : lang === 'fa'
                          ? 'انتشار مقاله جدید'
                          : 'Publish Blog Article'}
                    </h2>
                    <input
                      required
                      value={blogForm.title_fa}
                      onChange={(e) => setBlogForm({ ...blogForm, title_fa: e.target.value })}
                      placeholder="عنوان فارسی مقاله"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <input
                      value={blogForm.title_en}
                      onChange={(e) => setBlogForm({ ...blogForm, title_en: e.target.value })}
                      placeholder="English Article Title"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={blogForm.category_fa}
                        onChange={(e) => setBlogForm({ ...blogForm, category_fa: e.target.value })}
                        placeholder="دسته‌بندی فارسی"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <input
                        value={blogForm.category_en}
                        onChange={(e) => setBlogForm({ ...blogForm, category_en: e.target.value })}
                        placeholder="Category EN"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={blogForm.content_fa}
                      onChange={(e) => setBlogForm({ ...blogForm, content_fa: e.target.value })}
                      placeholder="متن کامل فارسی"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <textarea
                      rows={3}
                      value={blogForm.content_en}
                      onChange={(e) => setBlogForm({ ...blogForm, content_en: e.target.value })}
                      placeholder="English full content"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>{lang === 'fa' ? 'آپلود تصویر کاور (WebP / JPG / PNG)' : 'Upload Cover (WebP / JPG / PNG)'}</span>
                        <input
                          type="file"
                          accept="image/webp,image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e, 'blog', (url) => setBlogForm({ ...blogForm, image_webp: url }))
                          }
                        />
                      </label>
                      <input
                        value={blogForm.image_webp}
                        onChange={(e) => setBlogForm({ ...blogForm, image_webp: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
                      >
                        {editingBlogId ? (lang === 'fa' ? 'ذخیره ویرایش' : 'Update Article') : (lang === 'fa' ? 'انتشار مقاله' : 'Publish Article')}
                      </button>
                      {editingBlogId && (
                        <button
                          type="button"
                          onClick={() => setEditingBlogId(null)}
                          className="px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl"
                        >
                          {lang === 'fa' ? 'انصراف' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="lg:col-span-7 space-y-3">
                    {data.blogPosts
                      .filter(
                        (p) =>
                          !q ||
                          p.title_fa.toLowerCase().includes(q) ||
                          p.title_en.toLowerCase().includes(q)
                      )
                      .map((post) => (
                        <div
                          key={post.id}
                          className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <ResilientImage
                              src={post.image_webp}
                              alt={post.title_en}
                              className="w-16 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div className="space-y-0.5 min-w-0">
                              <div className="text-xs text-slate-500">
                                {lang === 'fa' ? post.category_fa : post.category_en} · {post.published_at}
                              </div>
                              <div className="font-bold text-slate-900 text-sm truncate">
                                {lang === 'fa' ? post.title_fa : post.title_en}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBlogId(post.id);
                                setBlogForm({
                                  title_fa: post.title_fa,
                                  title_en: post.title_en,
                                  category_fa: post.category_fa,
                                  category_en: post.category_en,
                                  read_time: post.read_time,
                                  excerpt_fa: post.excerpt_fa,
                                  excerpt_en: post.excerpt_en,
                                  content_fa: post.content_fa,
                                  content_en: post.content_en,
                                  image_webp: post.image_webp,
                                });
                              }}
                              className="p-2 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBlog(post.id)}
                              className="p-2 text-slate-500 hover:text-red-600 rounded-lg border border-slate-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 5: ACHIEVEMENTS (ADD, EDIT, DELETE + IMAGE UPLOAD) */}
              {tab === 'achievements' && (
                <div className="grid lg:grid-cols-12 gap-8">
                  <form
                    onSubmit={saveAchievement}
                    className="lg:col-span-5 p-6 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3.5 h-fit"
                  >
                    <h2 className="font-bold text-slate-900">
                      {editingAchId
                        ? lang === 'fa'
                          ? 'ویرایش دستاورد زبان‌آموز'
                          : 'Edit Student Achievement'
                        : lang === 'fa'
                          ? 'افزودن کارنامه و دستاورد جدید'
                          : 'Add Student Achievement'}
                    </h2>
                    <input
                      required
                      value={achForm.student_name}
                      onChange={(e) => setAchForm({ ...achForm, student_name: e.target.value })}
                      placeholder="نام زبان‌آموز / Student Name"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <input
                      value={achForm.exam_type}
                      onChange={(e) => setAchForm({ ...achForm, exam_type: e.target.value })}
                      placeholder="Exam (IELTS Academic / TOEFL)"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={achForm.score_before}
                        onChange={(e) => setAchForm({ ...achForm, score_before: e.target.value })}
                        placeholder="Score Before"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <input
                        value={achForm.score_after}
                        onChange={(e) => setAchForm({ ...achForm, score_after: e.target.value })}
                        placeholder="Score After"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={achForm.timeframe_fa}
                        onChange={(e) => setAchForm({ ...achForm, timeframe_fa: e.target.value })}
                        placeholder="مدت فارسی"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <input
                        value={achForm.timeframe_en}
                        onChange={(e) => setAchForm({ ...achForm, timeframe_en: e.target.value })}
                        placeholder="Timeframe EN"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={achForm.story_fa}
                      onChange={(e) => setAchForm({ ...achForm, story_fa: e.target.value })}
                      placeholder="داستان موفقیت فارسی"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <textarea
                      rows={2}
                      value={achForm.story_en}
                      onChange={(e) => setAchForm({ ...achForm, story_en: e.target.value })}
                      placeholder="English success story"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                    <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>{lang === 'fa' ? 'آپلود تصویر کارنامه (WebP / JPG / PNG)' : 'Upload Image (WebP / JPG / PNG)'}</span>
                        <input
                          type="file"
                          accept="image/webp,image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e, 'achievements', (url) => setAchForm({ ...achForm, image_webp: url }))
                          }
                        />
                      </label>
                      <input
                        value={achForm.image_webp}
                        onChange={(e) => setAchForm({ ...achForm, image_webp: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
                      >
                        {editingAchId ? (lang === 'fa' ? 'ذخیره ویرایش' : 'Update') : (lang === 'fa' ? 'افزودن دستاورد' : 'Save Achievement')}
                      </button>
                      {editingAchId && (
                        <button
                          type="button"
                          onClick={() => setEditingAchId(null)}
                          className="px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl"
                        >
                          {lang === 'fa' ? 'انصراف' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="lg:col-span-7 space-y-3">
                    {data.achievements.map((ach) => (
                      <div
                        key={ach.id}
                        className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <ResilientImage
                            src={ach.image_webp}
                            alt={ach.student_name}
                            className="w-16 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <div className="text-xs text-emerald-700 font-semibold tabular-nums">
                              {ach.exam_type}: {ach.score_before} → {ach.score_after}
                            </div>
                            <div className="font-bold text-slate-900 text-sm truncate">{ach.student_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAchId(ach.id);
                              setAchForm({
                                student_name: ach.student_name,
                                exam_type: ach.exam_type,
                                score_before: ach.score_before,
                                score_after: ach.score_after,
                                timeframe_fa: ach.timeframe_fa,
                                timeframe_en: ach.timeframe_en,
                                story_fa: ach.story_fa,
                                story_en: ach.story_en,
                                image_webp: ach.image_webp,
                              });
                            }}
                            className="p-2 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAchievement(ach.id)}
                            className="p-2 text-slate-500 hover:text-red-600 rounded-lg border border-slate-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: SERVICES & COUNSELING BOOKINGS */}
              {tab === 'services' && (
                <div className="space-y-8">
                  <div className="grid lg:grid-cols-12 gap-8">
                    <form
                      onSubmit={saveService}
                      className="lg:col-span-5 p-6 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3.5 h-fit"
                    >
                      <h2 className="font-bold text-slate-900">
                        {editingServiceId
                          ? lang === 'fa'
                            ? 'ویرایش خدمت ویژه'
                            : 'Edit Service'
                          : lang === 'fa'
                            ? 'افزودن خدمت ویژه'
                            : 'Add Special Service'}
                      </h2>
                      <input
                        required
                        value={serviceForm.title_fa}
                        onChange={(e) => setServiceForm({ ...serviceForm, title_fa: e.target.value })}
                        placeholder="عنوان فارسی خدمت"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <input
                        value={serviceForm.title_en}
                        onChange={(e) => setServiceForm({ ...serviceForm, title_en: e.target.value })}
                        placeholder="English Service Title"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <textarea
                        required
                        rows={3}
                        value={serviceForm.summary_fa}
                        onChange={(e) => setServiceForm({ ...serviceForm, summary_fa: e.target.value })}
                        placeholder="توضیحات فارسی"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <textarea
                        rows={2}
                        value={serviceForm.summary_en}
                        onChange={(e) => setServiceForm({ ...serviceForm, summary_en: e.target.value })}
                        placeholder="English summary"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={serviceForm.price_label_fa}
                          onChange={(e) => setServiceForm({ ...serviceForm, price_label_fa: e.target.value })}
                          placeholder="تعرفه فارسی"
                          className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                        />
                        <input
                          value={serviceForm.price_label_en}
                          onChange={(e) => setServiceForm({ ...serviceForm, price_label_en: e.target.value })}
                          placeholder="Price Label EN"
                          className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
                        >
                          {editingServiceId ? (lang === 'fa' ? 'ذخیره ویرایش' : 'Update Service') : (lang === 'fa' ? 'ثبت خدمت' : 'Save Service')}
                        </button>
                        {editingServiceId && (
                          <button
                            type="button"
                            onClick={() => setEditingServiceId(null)}
                            className="px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl"
                          >
                            {lang === 'fa' ? 'انصراف' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </form>

                    <div className="lg:col-span-7 space-y-3">
                      {data.services.map((srv) => (
                        <div
                          key={srv.id}
                          className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="text-xs text-blue-700 font-semibold">
                              {lang === 'fa' ? srv.price_label_fa : srv.price_label_en}
                            </div>
                            <div className="font-bold text-slate-900 text-sm">
                              {lang === 'fa' ? srv.title_fa : srv.title_en}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingServiceId(srv.id);
                                setServiceForm({
                                  title_fa: srv.title_fa,
                                  title_en: srv.title_en,
                                  category: srv.category,
                                  summary_fa: srv.summary_fa,
                                  summary_en: srv.summary_en,
                                  deliverable_fa: srv.deliverable_fa,
                                  deliverable_en: srv.deliverable_en,
                                  price_label_fa: srv.price_label_fa,
                                  price_label_en: srv.price_label_en,
                                });
                              }}
                              className="p-2 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteService(srv.id)}
                              className="p-2 text-slate-500 hover:text-red-600 rounded-lg border border-slate-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Counseling Requests List */}
                  <section className="p-6 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-900">
                      {lang === 'fa' ? 'درخواست‌های رزرو مشاوره و اپلای' : 'Counseling & Apply Bookings'}
                    </h3>
                    {data.consultations.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        {lang === 'fa' ? 'درخواست مشاوره‌ای ثبت نشده است.' : 'No counseling requests yet.'}
                      </p>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {data.consultations.map((c) => (
                          <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900">
                                {c.full_name} · {c.service_type}
                              </span>
                              <select
                                value={c.status}
                                onChange={(e) => updateConsultationStatus(c.id, e.target.value)}
                                className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-xs"
                              >
                                <option value="new">New</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                            <div className="text-slate-600">
                              {c.phone_or_telegram} · {c.preferred_date}
                            </div>
                            <p className="text-slate-500">{c.goals}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* TAB 7: TESTIMONIALS MODERATION */}
              {tab === 'testimonials' && (
                <div className="space-y-4">
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                    <h2 className="font-bold text-slate-900">
                      {lang === 'fa' ? 'صف تایید و مدیریت نظرات زبان‌آموزان' : 'Student Testimonials Moderation'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'fa'
                        ? 'نظرات جدید با وضعیت «در انتظار تایید» ثبت می‌شوند و پس از تایید شما در وب‌سایت منتشر می‌شوند.'
                        : 'New reviews enter pending status until you approve them for public display.'}
                    </p>
                  </div>

                  {data.testimonials
                    .filter(
                      (tItem) =>
                        !q ||
                        tItem.author_name.toLowerCase().includes(q) ||
                        tItem.content_fa.toLowerCase().includes(q) ||
                        tItem.content_en.toLowerCase().includes(q)
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-5 border border-slate-200 rounded-2xl bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="font-bold text-slate-900">{item.author_name}</span>
                            <span className="text-slate-500">
                              {lang === 'fa' ? item.author_role_fa : item.author_role_en}
                            </span>
                            <span
                              className={`font-semibold px-2 py-0.5 rounded-md ${
                                item.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.status === 'pending'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {item.status === 'pending'
                                ? lang === 'fa'
                                  ? 'در انتظار تایید'
                                  : 'Pending'
                                : item.status === 'approved'
                                  ? lang === 'fa'
                                    ? 'منتشر شده'
                                    : 'Approved'
                                  : lang === 'fa'
                                    ? 'رد شده'
                                    : 'Rejected'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">{lang === 'fa' ? item.content_fa : item.content_en}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => moderateTestimonial(item.id, 'approved')}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{lang === 'fa' ? 'تایید انتشار' : 'Approve'}</span>
                            </button>
                          )}
                          {item.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => moderateTestimonial(item.id, 'rejected')}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{lang === 'fa' ? 'عدم نمایش' : 'Hide'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteTestimonial(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{lang === 'fa' ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* TAB 8: MEDIA & IMAGE MANAGER (HERO, ABOUT & FULL GALLERY) */}
              {tab === 'media' && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Hero Banner Image Card */}
                    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">
                          {lang === 'fa' ? 'تصویر بنر اصلی (Hero)' : 'Main Hero Banner Image'}
                        </h3>
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{lang === 'fa' ? 'تغییر و آپلود بنر' : 'Upload Hero Banner'}</span>
                          <input
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(e, 'banners', (url) => assignBannerSetting('hero_image_webp', url))
                            }
                          />
                        </label>
                      </div>
                      <ResilientImage
                        src={heroImageUrl}
                        alt="Hero Banner Preview"
                        className="w-full aspect-video object-cover rounded-xl border border-slate-200"
                      />
                      <div className="text-[11px] font-mono text-slate-500 truncate">{heroImageUrl}</div>
                    </div>

                    {/* About Academy Image Card */}
                    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">
                          {lang === 'fa' ? 'تصویر بخش معرفی و فرهنگ آکادمی' : 'About & Culture Image'}
                        </h3>
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{lang === 'fa' ? 'تغییر و آپلود تصویر' : 'Upload About Image'}</span>
                          <input
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(e, 'banners', (url) => assignBannerSetting('about_image_webp', url))
                            }
                          />
                        </label>
                      </div>
                      <ResilientImage
                        src={aboutImageUrl}
                        alt="About Academy Preview"
                        className="w-full aspect-video object-cover rounded-xl border border-slate-200"
                      />
                      <div className="text-[11px] font-mono text-slate-500 truncate">{aboutImageUrl}</div>
                    </div>
                  </div>

                  {/* General Uploader + Media Gallery */}
                  <section className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {lang === 'fa' ? 'گالری تصاویر وب‌سایت (WebP / JPG / PNG)' : 'Site Media Library'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {lang === 'fa'
                            ? 'تصاویر آپلودشده به‌صورت خودکار به فرمت کم‌حجم WebP تبدیل و در پوشه دسته‌بندی‌شده ذخیره می‌شوند.'
                            : 'Uploaded images are converted to optimized WebP and organized into categorized folders.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={uploadFolder}
                          onChange={(e) => setUploadFolder(e.target.value as any)}
                          className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                        >
                          <option value="banners">banners/</option>
                          <option value="courses">courses/</option>
                          <option value="blog">blog/</option>
                          <option value="achievements">achievements/</option>
                        </select>
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{lang === 'fa' ? 'آپلود تصویر جدید' : 'Upload New Image'}</span>
                          <input
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, uploadFolder, () => {})}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {data.mediaLibrary.map((media) => (
                        <div
                          key={media.url}
                          className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between"
                        >
                          <ResilientImage
                            src={media.url}
                            alt={media.filename}
                            className="w-full aspect-[4/3] object-cover"
                          />
                          <div className="p-3 space-y-2">
                            <div className="text-[11px] font-mono text-slate-500 truncate">
                              {media.folder}/{media.filename}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => assignBannerSetting('hero_image_webp', media.url)}
                                className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 rounded-md hover:border-blue-400 cursor-pointer"
                              >
                                {lang === 'fa' ? 'تنظیم به عنوان Hero' : 'Set Hero'}
                              </button>
                              <button
                                type="button"
                                onClick={() => assignBannerSetting('about_image_webp', media.url)}
                                className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 rounded-md hover:border-emerald-400 cursor-pointer"
                              >
                                {lang === 'fa' ? 'تنظیم به عنوان معرفی' : 'Set About'}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await safeCopyToClipboard(media.url);
                                  flash(lang === 'fa' ? 'آدرس تصویر کپی شد.' : 'Image path copied.');
                                }}
                                className="px-2 py-1 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md cursor-pointer"
                              >
                                {lang === 'fa' ? 'کپی لینک' : 'Copy URL'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 9: SITE COPY, TELEGRAM & ADMIN PASSWORD */}
              {tab === 'siteSettings' && (
                <div className="space-y-8">
                  <form onSubmit={saveSiteSettings} className="space-y-6">
                    <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h2 className="text-lg font-bold text-slate-900">
                          {lang === 'fa' ? 'ویرایشگر جامع متون، ارزش‌ها و تلگرام سایت' : 'Site Content, Values & Telegram Editor'}
                        </h2>
                        <p className="text-xs text-slate-600">
                          {lang === 'fa'
                            ? 'سرتیترها، متون معرفی و فرهنگ سازمانی، ارزش‌های سه‌گانه و آیدی تلگرام (@SaniBK) را مستقیماً ویرایش کنید.'
                            : 'Update headlines, academy story, core values, culture, and contact Telegram handle with live DB sync.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          disabled={savingSettings}
                          onClick={resetSiteSettings}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{lang === 'fa' ? 'بازگردانی پیش‌فرض' : 'Restore Defaults'}</span>
                        </button>
                        <button
                          type="submit"
                          disabled={savingSettings}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{lang === 'fa' ? 'ذخیره و اعمال در سایت' : 'Save & Publish'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {settingsDraft
                        .filter(
                          (item) =>
                            !q ||
                            item.label_fa.toLowerCase().includes(q) ||
                            item.label_en.toLowerCase().includes(q) ||
                            item.value_fa.toLowerCase().includes(q)
                        )
                        .map((item) => (
                          <div
                            key={item.setting_key}
                            className="p-5 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <span className="text-sm font-bold text-slate-900">
                                {lang === 'fa' ? item.label_fa : item.label_en}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">{item.setting_key}</span>
                            </div>
                            <div className="grid lg:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-600">
                                  {lang === 'fa' ? 'مقدار فارسی (RTL)' : 'Persian Value (RTL)'}
                                </label>
                                {item.is_multiline ? (
                                  <textarea
                                    rows={3}
                                    dir="rtl"
                                    value={item.value_fa}
                                    onChange={(e) => updateSettingField(item.setting_key, 'value_fa', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                                  />
                                ) : (
                                  <input
                                    dir="rtl"
                                    value={item.value_fa}
                                    onChange={(e) => updateSettingField(item.setting_key, 'value_fa', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                                  />
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-600">
                                  {lang === 'fa' ? 'مقدار انگلیسی (LTR)' : 'English Value (LTR)'}
                                </label>
                                {item.is_multiline ? (
                                  <textarea
                                    rows={3}
                                    dir="ltr"
                                    value={item.value_en}
                                    onChange={(e) => updateSettingField(item.setting_key, 'value_en', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                                  />
                                ) : (
                                  <input
                                    dir="ltr"
                                    value={item.value_en}
                                    onChange={(e) => updateSettingField(item.setting_key, 'value_en', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </form>

                  {/* Change Admin Password Security Card */}
                  <form
                    onSubmit={handlePasswordChange}
                    className="p-6 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-4 max-w-2xl"
                  >
                    <div className="flex items-center gap-2 text-slate-900">
                      <Lock className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-base">
                        {lang === 'fa' ? 'تغییر رمز عبور ورود مدیر' : 'Change Administrator Password'}
                      </h3>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <input
                        required
                        type="password"
                        value={pwForm.current_password}
                        onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                        placeholder={lang === 'fa' ? 'رمز عبور فعلی' : 'Current Password'}
                        className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <input
                        required
                        type="password"
                        value={pwForm.new_password}
                        onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                        placeholder={lang === 'fa' ? 'رمز جدید (حداقل ۸ کاراکتر)' : 'New Password (8+ chars)'}
                        className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                      <input
                        required
                        type="password"
                        value={pwForm.confirm_password}
                        onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                        placeholder={lang === 'fa' ? 'تکرار رمز جدید' : 'Confirm New Password'}
                        className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 cursor-pointer"
                    >
                      {lang === 'fa' ? 'به‌روزرسانی رمز عبور مدیر' : 'Update Admin Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 10: PHP 8+ & MYSQL CPANEL EXPORT */}
              {tab === 'phpExport' && (
                <div className="space-y-6">
                  <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-slate-900">
                        {lang === 'fa'
                          ? 'بسته کامل PHP 8+ (PDO) و MySQL برای هاست اشتراکی (cPanel / DirectAdmin)'
                          : 'Modular PHP 8+ (PDO) & MySQL Package for Shared Hosting (cPanel / DirectAdmin)'}
                      </h2>
                      <p className="text-xs text-slate-600">
                        {lang === 'fa'
                          ? 'شامل تمام جداول جدید تنظیمات، تصاویر بنر، مسیرهای آپلود WebP، کدهای امن PDO و پنل مدیریت.'
                          : 'Synced with site_settings, hero/about banner images, WebP upload folders, PDO security, and admin CRUD.'}
                      </p>
                    </div>
                    <a
                      href={zipDownloadUrl}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === 'fa' ? 'دانلود فایل ZIP آماده آپلود' : 'Download Ready ZIP Bundle'}</span>
                    </a>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 border border-slate-200 rounded-2xl bg-white shadow-xs p-4 space-y-1.5">
                      <div className="text-xs font-bold text-slate-500 px-2 pb-2">stardust-cpanel-php/</div>
                      {data.phpBundle.map((file) => (
                        <button
                          key={file.path}
                          type="button"
                          onClick={() => setSelectedPhpPath(file.path)}
                          className={`w-full text-start px-3 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                            selectedPhpPath === file.path
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <FileCode2 className="w-4 h-4 shrink-0" />
                          <span className="truncate font-mono">{file.path}</span>
                        </button>
                      ))}
                    </div>

                    {selectedPhpFile && (
                      <div className="lg:col-span-8 border border-slate-200 rounded-2xl bg-slate-950 text-slate-100 overflow-hidden flex flex-col">
                        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
                          <div>
                            <div className="font-mono text-xs font-semibold text-blue-300">{selectedPhpFile.path}</div>
                            <div className="text-[11px] text-slate-400">{selectedPhpFile.description}</div>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyPhp}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                          >
                            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                          </button>
                        </div>
                        <pre className="p-5 text-xs font-mono overflow-x-auto max-h-[540px] leading-relaxed text-slate-200" dir="ltr">
                          {selectedPhpFile.content}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
