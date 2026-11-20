import { useEffect, useState, FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Lang, User } from '../types';
import { copy } from '../i18n/translations';
import { apiRequest } from '../utils/api';
import { ResilientImage } from './ResilientImage';

interface StudentDashboardProps {
  lang: Lang;
  user: User;
  onBack: () => void;
  onUserUpdated: (user: User) => void;
}

interface DashboardPayload {
  enrollments: Array<{
    id: number;
    course_id: number;
    status: string;
    progress_percent: number;
    title_fa: string;
    title_en: string;
    type: string;
    level: string;
    instructor: string;
    duration_label_fa: string;
    duration_label_en: string;
    image_webp: string;
  }>;
  orders: Array<{
    id: number;
    order_code: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  consultations: Array<{
    id: number;
    service_type: string;
    preferred_date: string;
    status: string;
    goals: string;
  }>;
}

export function StudentDashboard({ lang, user, onBack, onUserUpdated }: StudentDashboardProps) {
  const t = copy[lang].dashboard;
  const currency = copy[lang].store.currency;
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone || '');
  const [preferredLang, setPreferredLang] = useState<Lang>(user.preferred_lang);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    apiRequest<DashboardPayload>('/api/student/dashboard').then(setData).catch(() => {});
  }, []);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    const res = await apiRequest<{ user: User }>('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify({
        full_name: fullName,
        phone,
        preferred_lang: preferredLang,
      }),
    });
    onUserUpdated(res.user);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-sm text-slate-600">
            {user.full_name} · {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
        >
          {lang === 'fa' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t.backToSite}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Enrolled Courses & Orders */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>{t.enrolledCourses}</span>
            </h2>
            {!data ? (
              <div className="p-8 border border-slate-200 rounded-2xl text-sm text-slate-500">Loading...</div>
            ) : data.enrollments.length === 0 ? (
              <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50 text-sm text-slate-600">
                {t.noCourses}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {data.enrollments.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white flex flex-col"
                  >
                    <ResilientImage
                      src={item.image_webp}
                      alt={lang === 'fa' ? item.title_fa : item.title_en}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="p-5 space-y-3">
                      <div className="text-xs text-slate-500">
                        {item.level} · {lang === 'fa' ? item.duration_label_fa : item.duration_label_en}
                      </div>
                      <h3 className="font-bold text-slate-900">
                        {lang === 'fa' ? item.title_fa : item.title_en}
                      </h3>
                      <div className="text-xs text-slate-600">{item.instructor}</div>
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                          <span>{t.progress}</span>
                          <span className="tabular-nums text-emerald-700">{item.progress_percent}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${item.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid sm:grid-cols-2 gap-6">
            <section className="p-6 border border-slate-200 rounded-2xl bg-white space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>{t.ordersTitle}</span>
              </h3>
              {!data || data.orders.length === 0 ? (
                <p className="text-xs text-slate-500">{t.noOrders}</p>
              ) : (
                <div className="space-y-3">
                  {data.orders.map((order) => (
                    <div key={order.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-900 tabular-nums">
                        <span>{order.order_code}</span>
                        <span>
                          {order.total_amount.toLocaleString()} {currency}
                        </span>
                      </div>
                      <div className="text-slate-500">{order.created_at}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="p-6 border border-slate-200 rounded-2xl bg-white space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{t.bookingsTitle}</span>
              </h3>
              {!data || data.consultations.length === 0 ? (
                <p className="text-xs text-slate-500">{t.noBookings}</p>
              ) : (
                <div className="space-y-3">
                  {data.consultations.map((booking) => (
                    <div key={booking.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-semibold text-slate-900">{booking.service_type}</div>
                      <div className="text-slate-500">
                        {booking.preferred_date} · {booking.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Right: Student Profile */}
        <div className="lg:col-span-4">
          <form onSubmit={handleProfileSave} className="p-6 border border-slate-200 rounded-2xl bg-slate-50 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{t.profileTitle}</h2>
            {savedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.profileSaved}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">{copy[lang].auth.fullName}</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">{copy[lang].auth.phoneOptional}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Language</label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value === 'en' ? 'en' : 'fa')}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl"
              >
                <option value="fa">فارسی (RTL)</option>
                <option value="en">English (LTR)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
            >
              {t.saveProfile}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
