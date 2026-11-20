import { useState, FormEvent } from 'react';
import { X, Shield, UserCheck } from 'lucide-react';
import { Lang, User } from '../types';
import { copy } from '../i18n/translations';
import { apiRequest, setCsrfToken, setSessionToken } from '../utils/api';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  initialTab?: 'student' | 'admin';
  onAuthSuccess: (user: User) => void;
}

export function AuthModal({
  open,
  onClose,
  lang,
  initialTab = 'student',
  onAuthSuccess,
}: AuthModalProps) {
  const t = copy[lang].auth;
  const [roleTab, setRoleTab] = useState<'student' | 'admin'>(initialTab);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (roleTab === 'student' && mode === 'register') {
        const res = await apiRequest<{ user: User; csrfToken?: string; sessionToken?: string }>(
          '/api/auth/register',
          {
            method: 'POST',
            body: JSON.stringify({
              full_name: fullName,
              email: identifier,
              phone,
              password,
            }),
          }
        );
        if (res.csrfToken) setCsrfToken(res.csrfToken);
        if (res.sessionToken) setSessionToken(res.sessionToken);
        onAuthSuccess(res.user);
      } else {
        const res = await apiRequest<{ user: User; csrfToken?: string; sessionToken?: string }>(
          '/api/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({
              identifier: identifier.trim(),
              password,
            }),
          }
        );
        if (res.csrfToken) setCsrfToken(res.csrfToken);
        if (res.sessionToken) setSessionToken(res.sessionToken);
        onAuthSuccess(res.user);
      }
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || (lang === 'fa' ? 'ورود ناموفق بود. نام کاربری و رمز عبور را بررسی کنید.' : 'Authentication failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setRoleTab('student');
                setError('');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                roleTab === 'student' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {t.studentTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab('admin');
                setMode('login');
                setError('');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                roleTab === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {t.adminTab}
            </button>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {roleTab === 'student' ? (
            <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors cursor-pointer ${
                  mode === 'login' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
                }`}
              >
                {t.loginMode}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors cursor-pointer ${
                  mode === 'register' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'
                }`}
              >
                {t.registerMode}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50/70 border border-blue-100 p-3 rounded-xl">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{t.adminHint}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {roleTab === 'student' && mode === 'register' && (
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullName}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            )}

            <input
              required
              type={roleTab === 'student' ? 'email' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={roleTab === 'admin' ? t.emailOrUser : t.email}
              autoComplete={roleTab === 'admin' ? 'username' : 'email'}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />

            {roleTab === 'student' && mode === 'register' && (
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phoneOptional}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            )}

            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {loading
                  ? lang === 'fa'
                    ? 'در حال ورود...'
                    : 'Signing in...'
                  : roleTab === 'student' && mode === 'register'
                    ? t.submitRegister
                    : t.submitLogin}
              </span>
            </button>
          </form>

          {roleTab === 'student' && (
            <p className="text-xs text-slate-500 leading-relaxed">{t.otpNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}
