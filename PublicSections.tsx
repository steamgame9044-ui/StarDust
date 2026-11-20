import { useState, FormEvent } from 'react';
import {
  Play,
  ShoppingBag,
  Send,
  Calendar,
  Star,
  ArrowUpRight,
  X,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import {
  Achievement,
  BlogPost,
  Course,
  Lang,
  ServiceItem,
  SiteSetting,
  Testimonial,
  User,
  VideoItem,
} from '../types';
import { copy } from '../i18n/translations';
import { apiRequest } from '../utils/api';
import { ResilientImage } from './ResilientImage';

interface PublicSectionsProps {
  lang: Lang;
  user: User | null;
  courses: Course[];
  services: ServiceItem[];
  videos: VideoItem[];
  blogPosts: BlogPost[];
  achievements: Achievement[];
  testimonials: Testimonial[];
  siteSettings: SiteSetting[];
  onAddToCart: (course: Course) => void;
}

export function PublicSections({
  lang,
  user,
  courses,
  services,
  videos,
  blogPosts,
  achievements,
  testimonials,
  siteSettings,
  onAddToCart,
}: PublicSectionsProps) {
  const t = copy[lang];
  const settingMap = new Map(siteSettings.map((s) => [s.setting_key, s]));
  const txt = (key: string, fallback: string) => {
    const found = settingMap.get(key);
    if (!found) return fallback;
    const val = lang === 'fa' ? found.value_fa : found.value_en;
    return val && val.trim().length > 0 ? val : fallback;
  };
  const rawTelegram = txt('telegram_handle', '@SaniBK').trim();
  const telegramDisplay = rawTelegram.startsWith('@') ? rawTelegram : `@${rawTelegram}`;
  const telegramSlug = rawTelegram.replace(/^@+/, '') || 'SaniBK';
  const telegramHref = `https://t.me/${telegramSlug}`;
  const heroImage = txt('hero_image_webp', '/src/assets/images/hero_stardust_academy_1795157697795.jpg');
  const aboutImage = txt('about_image_webp', '/src/assets/images/course_speaking_club_1795157697931.jpg');
  const [courseFilter, setCourseFilter] = useState<'all' | 'online' | 'in_person' | 'booklet'>('all');
  const [addedId, setAddedId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [blogFilter, setBlogFilter] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Consultation form state
  const [consultForm, setConsultForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_or_telegram: '',
    service_type: services[0]?.title_en || 'Academic Study Planning',
    preferred_date: '',
    goals: '',
  });
  const [consultSubmitted, setConsultSubmitted] = useState(false);

  // Testimonial form state
  const [reviewForm, setReviewForm] = useState({
    author_name: user?.full_name || '',
    author_role: '',
    rating: 5,
    content: '',
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const filteredCourses =
    courseFilter === 'all' ? courses : courses.filter((c) => c.type === courseFilter);

  const blogCategories = Array.from(
    new Set(blogPosts.map((p) => (lang === 'fa' ? p.category_fa : p.category_en)))
  );

  const filteredPosts =
    blogFilter === 'all'
      ? blogPosts
      : blogPosts.filter((p) => (lang === 'fa' ? p.category_fa : p.category_en) === blogFilter);

  const handleAdd = (course: Course) => {
    onAddToCart(course);
    setAddedId(course.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleConsultSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await apiRequest('/api/consultations', {
      method: 'POST',
      body: JSON.stringify(consultForm),
    });
    setConsultSubmitted(true);
    setConsultForm({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone_or_telegram: '',
      service_type: services[0]?.title_en || 'Academic Study Planning',
      preferred_date: '',
      goals: '',
    });
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await apiRequest('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: reviewForm.author_name,
        author_role_fa: reviewForm.author_role,
        author_role_en: reviewForm.author_role,
        rating: reviewForm.rating,
        content_fa: reviewForm.content,
        content_en: reviewForm.content,
      }),
    });
    setReviewSubmitted(true);
    setReviewForm({ author_name: '', author_role: '', rating: 5, content: '' });
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 1. HERO SECTION */}
        <section className="py-12 lg:py-20 space-y-12 border-b border-slate-200">
          <div className="grid lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs sm:text-sm font-medium text-blue-700">
                {txt('hero_kicker', t.hero.kicker)}
              </p>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.2] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                {txt('hero_title', t.hero.title)}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {txt('hero_subtitle', t.hero.subtitle)}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#courses"
                  className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  {txt('hero_primary_cta', t.hero.primaryCta)}
                </a>
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors whitespace-nowrap inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{txt('hero_secondary_cta', t.hero.secondaryCta)}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <ResilientImage
                src={heroImage}
                alt="StarDust English Academy Study Lounge"
                className="w-full h-72 sm:h-96 lg:h-full object-cover rounded-2xl border border-slate-200"
              />
            </div>
          </div>

          {/* 4-Column Full-Width KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
            {t.hero.metrics.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums font-display-en">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. STORE: COURSES & EXCLUSIVE BOOKLETS */}
        <section id="courses" className="py-16 lg:py-24 space-y-8 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {txt('store_heading', t.store.heading)}
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                {txt('store_subheading', t.store.subheading)}
              </p>
            </div>

            {/* Interactive Segmented Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
              {(['all', 'online', 'in_person', 'booklet'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCourseFilter(key)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    courseFilter === key
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.store.filters[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const title = lang === 'fa' ? course.title_fa : course.title_en;
              const desc = lang === 'fa' ? course.description_fa : course.description_en;
              const duration = lang === 'fa' ? course.duration_label_fa : course.duration_label_en;
              return (
                <article
                  key={course.id}
                  className="border border-slate-200 rounded-2xl overflow-hidden bg-white flex flex-col hover:border-blue-300 transition-colors"
                >
                  <ResilientImage
                    src={course.image_webp}
                    alt={title}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2.5">
                      {/* Unboxed Metadata with typographic separators */}
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-blue-700">{t.store.typeLabels[course.type]}</span>
                        <span aria-hidden="true">·</span>
                        <span>{course.level}</span>
                        <span aria-hidden="true">·</span>
                        <span>{duration}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {t.store.instructor}: {course.instructor}
                        </span>
                        <span className="text-base font-bold text-slate-900 tabular-nums">
                          {course.price.toLocaleString()} {t.store.currency}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAdd(course)}
                          className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            addedId === course.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{addedId === course.id ? t.store.added : t.store.addToCart}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCourse(course)}
                          className="py-2.5 px-3.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 whitespace-nowrap cursor-pointer"
                        >
                          {t.store.details}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 3. SPECIAL SERVICES & COUNSELING RESERVATION */}
        <section id="services" className="py-16 lg:py-24 space-y-12 border-b border-slate-200">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {txt('services_heading', t.services.heading)}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {txt('services_subheading', t.services.subheading)}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
              {services.map((srv, idx) => (
                <div
                  key={srv.id}
                  className="p-6 border border-slate-200 rounded-2xl bg-slate-50/70 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold text-blue-700 tabular-nums">
                      0{idx + 1}. {lang === 'fa' ? srv.price_label_fa : srv.price_label_en}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {lang === 'fa' ? srv.title_fa : srv.title_en}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {lang === 'fa' ? srv.summary_fa : srv.summary_en}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                    <span className="text-emerald-700 font-medium">
                      {lang === 'fa' ? srv.deliverable_fa : srv.deliverable_en}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setConsultForm({
                          ...consultForm,
                          service_type: lang === 'fa' ? srv.title_fa : srv.title_en,
                        })
                      }
                      className="text-blue-700 font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      {t.services.bookBtn}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleConsultSubmit}
              className="lg:col-span-5 p-6 sm:p-8 border border-slate-200 rounded-2xl bg-white space-y-4"
            >
              <div className="flex items-center gap-2 text-slate-900">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">{t.services.formTitle}</h3>
              </div>

              {consultSubmitted && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t.services.bookingSuccess}</span>
                </div>
              )}

              <input
                required
                value={consultForm.full_name}
                onChange={(e) => setConsultForm({ ...consultForm, full_name: e.target.value })}
                placeholder={t.services.name}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  required
                  type="email"
                  value={consultForm.email}
                  onChange={(e) => setConsultForm({ ...consultForm, email: e.target.value })}
                  placeholder={t.services.email}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <input
                  required
                  value={consultForm.phone_or_telegram}
                  onChange={(e) => setConsultForm({ ...consultForm, phone_or_telegram: e.target.value })}
                  placeholder={t.services.contact}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <select
                  value={consultForm.service_type}
                  onChange={(e) => setConsultForm({ ...consultForm, service_type: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={lang === 'fa' ? s.title_fa : s.title_en}>
                      {lang === 'fa' ? s.title_fa : s.title_en}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={consultForm.preferred_date}
                  onChange={(e) => setConsultForm({ ...consultForm, preferred_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                />
              </div>
              <textarea
                rows={3}
                value={consultForm.goals}
                onChange={(e) => setConsultForm({ ...consultForm, goals: e.target.value })}
                placeholder={t.services.goals}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {t.services.submitBooking}
              </button>
            </form>
          </div>
        </section>

        {/* 4. FREE VIDEO TUTORIALS (EMBEDDED YOUTUBE WITH "FREE" LABEL) */}
        <section id="videos" className="py-16 lg:py-24 space-y-8 border-b border-slate-200">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {txt('videos_heading', t.videos.heading)}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {txt('videos_subheading', t.videos.subheading)}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <article
                key={video.id}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white flex flex-col"
              >
                <div className="relative aspect-video bg-slate-900">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}`}
                    title={lang === 'fa' ? video.title_fa : video.title_en}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {video.category} · {video.duration_label}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                      <Play className="w-3 h-3" />
                      <span>{t.videos.freeLabel}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {lang === 'fa' ? video.title_fa : video.title_en}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === 'fa' ? video.description_fa : video.description_en}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 5. EDUCATIONAL BLOG MAGAZINE */}
        <section id="blog" className="py-16 lg:py-24 space-y-8 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {txt('blog_heading', t.blog.heading)}
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                {txt('blog_subheading', t.blog.subheading)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setBlogFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  blogFilter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t.blog.allCategories}
              </button>
              {blogCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBlogFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    blogFilter === cat ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white flex flex-col justify-between"
              >
                <div>
                  <ResilientImage
                    src={post.image_webp}
                    alt={lang === 'fa' ? post.title_fa : post.title_en}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="p-6 space-y-3">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="font-semibold text-blue-700">
                        {lang === 'fa' ? post.category_fa : post.category_en}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{post.read_time}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{post.published_at}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {lang === 'fa' ? post.title_fa : post.title_en}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {lang === 'fa' ? post.excerpt_fa : post.excerpt_en}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <button
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                  >
                    <span>{t.blog.readMore}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 6. STUDENT ACHIEVEMENTS & PORTFOLIOS */}
        <section id="achievements" className="py-16 lg:py-24 space-y-8 border-b border-slate-200">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {txt('achievements_heading', t.achievements.heading)}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {txt('achievements_subheading', t.achievements.subheading)}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((ach) => (
              <article key={ach.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                <ResilientImage
                  src={ach.image_webp}
                  alt={ach.student_name}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-900">{ach.exam_type}</span>
                    <span>{lang === 'fa' ? ach.timeframe_fa : ach.timeframe_en}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{ach.student_name}</h3>
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white border border-slate-200 text-center">
                    <div>
                      <div className="text-[11px] text-slate-500">{t.achievements.before}</div>
                      <div className="text-lg font-bold text-slate-700 tabular-nums">{ach.score_before}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-emerald-700">{t.achievements.after}</div>
                      <div className="text-lg font-bold text-emerald-700 tabular-nums">{ach.score_after}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang === 'fa' ? ach.story_fa : ach.story_en}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 7. ABOUT STARDUST, VALUES & ORGANIZATIONAL CULTURE */}
        <section id="about" className="py-16 lg:py-24 space-y-12 border-b border-slate-200">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {txt('about_heading', t.about.heading)}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                {txt('about_lead', t.about.lead)}
              </p>
              <ResilientImage
                src={aboutImage}
                alt={txt('about_heading', t.about.heading)}
                className="w-full aspect-[4/3] object-cover rounded-2xl border border-slate-200"
              />
              <div className="pt-4 space-y-2 border-t border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  {txt('about_story_title', t.about.aboutTitle)}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {txt('about_story_text', t.about.aboutText)}
                </p>
              </div>
              <div className="pt-4 space-y-2 border-t border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  {txt('about_culture_title', t.about.cultureTitle)}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {txt('about_culture_text', t.about.cultureText)}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <h3 className="text-lg font-bold text-slate-900">{t.about.valuesTitle}</h3>
              <div className="space-y-4">
                {[
                  {
                    num: '01.',
                    title: txt('about_value_1_title', t.about.values[0].title),
                    desc: txt('about_value_1_desc', t.about.values[0].desc),
                  },
                  {
                    num: '02.',
                    title: txt('about_value_2_title', t.about.values[1].title),
                    desc: txt('about_value_2_desc', t.about.values[1].desc),
                  },
                  {
                    num: '03.',
                    title: txt('about_value_3_title', t.about.values[2].title),
                    desc: txt('about_value_3_desc', t.about.values[2].desc),
                  },
                ].map((val) => (
                  <div
                    key={val.num}
                    className="p-6 border border-slate-200 rounded-2xl bg-slate-50/60 space-y-2"
                  >
                    <div className="text-sm font-bold text-blue-700 font-display-en">{val.num} {val.title}</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. TESTIMONIALS & PENDING MODERATION SUBMISSION */}
        <section id="testimonials" className="py-16 lg:py-24 space-y-10">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {txt('testimonials_heading', t.testimonials.heading)}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {txt('testimonials_subheading', t.testimonials.subheading)}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
              {testimonials.map((item) => (
                <blockquote
                  key={item.id}
                  className="p-6 border border-slate-200 rounded-2xl bg-white flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: item.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {lang === 'fa' ? item.content_fa : item.content_en}
                    </p>
                  </div>
                  <footer className="pt-3 border-t border-slate-100 text-xs">
                    <div className="font-bold text-slate-900">{item.author_name}</div>
                    <div className="text-slate-500">
                      {lang === 'fa' ? item.author_role_fa : item.author_role_en}
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>

            <form
              onSubmit={handleReviewSubmit}
              className="lg:col-span-5 p-6 sm:p-8 border border-slate-200 rounded-2xl bg-slate-50 space-y-4"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{t.testimonials.formHeading}</h3>
                <p className="text-xs text-slate-500">{t.testimonials.formNote}</p>
              </div>

              {reviewSubmitted && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {t.testimonials.pendingNotice}
                </div>
              )}

              <input
                required
                value={reviewForm.author_name}
                onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                placeholder={t.testimonials.namePlaceholder}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={reviewForm.author_role}
                  onChange={(e) => setReviewForm({ ...reviewForm, author_role: e.target.value })}
                  placeholder={t.testimonials.rolePlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl"
                />
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl"
                >
                  {[5, 4, 3].map((r) => (
                    <option key={r} value={r}>
                      {t.testimonials.ratingLabel}: {r}/5
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                required
                rows={3}
                value={reviewForm.content}
                onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                placeholder={t.testimonials.contentPlaceholder}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
              >
                {t.testimonials.submitBtn}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="font-display-en text-lg font-bold text-slate-900">StarDust</div>
            <p className="text-xs text-slate-600">{t.footer.tagline}</p>
            <p className="text-xs text-slate-500">{t.footer.rights}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-600">{t.footer.telegramLabel}</span>
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:underline"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{telegramDisplay}</span>
            </a>
          </div>
        </div>
      </footer>

      {/* FLOATING TELEGRAM BUTTON - compact to stay well below 15% mobile height */}
      <a
        href={telegramHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Telegram ${telegramDisplay}`}
        className="fixed bottom-4 end-4 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg hover:bg-blue-700 transition-transform hover:-translate-y-0.5"
      >
        <Send className="w-4 h-4" />
        <span>{telegramDisplay}</span>
      </a>

      {/* COURSE DETAILS MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
            <ResilientImage
              src={selectedCourse.image_webp}
              alt={lang === 'fa' ? selectedCourse.title_fa : selectedCourse.title_en}
              className="w-full h-56 object-cover"
            />
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">
                    {t.store.typeLabels[selectedCourse.type]} · {selectedCourse.level} ·{' '}
                    {lang === 'fa' ? selectedCourse.duration_label_fa : selectedCourse.duration_label_en}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {lang === 'fa' ? selectedCourse.title_fa : selectedCourse.title_en}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {lang === 'fa' ? selectedCourse.description_fa : selectedCourse.description_en}
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-lg font-bold text-blue-700 tabular-nums">
                  {selectedCourse.price.toLocaleString()} {t.store.currency}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleAdd(selectedCourse);
                    setSelectedCourse(null);
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
                >
                  {t.store.addToCart}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOG READER MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl">
            <ResilientImage
              src={selectedPost.image_webp}
              alt={lang === 'fa' ? selectedPost.title_fa : selectedPost.title_en}
              className="w-full h-60 object-cover"
            />
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">
                    {lang === 'fa' ? selectedPost.category_fa : selectedPost.category_en} · {selectedPost.read_time} ·{' '}
                    {selectedPost.published_at}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {lang === 'fa' ? selectedPost.title_fa : selectedPost.title_en}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm sm:text-base text-slate-700 leading-loose whitespace-pre-line">
                {lang === 'fa' ? selectedPost.content_fa : selectedPost.content_en}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.blog.closeArticle}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
