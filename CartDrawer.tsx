import { useState, FormEvent } from 'react';
import { X, Trash2, Plus, Minus, Send, Copy, Check, ExternalLink } from 'lucide-react';
import { CartItem, Lang, User } from '../types';
import { copy } from '../i18n/translations';
import { apiRequest, safeCopyToClipboard } from '../utils/api';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  items: CartItem[];
  user: User | null;
  telegramHandle: string;
  onUpdateQty: (courseId: number, delta: number) => void;
  onRemoveItem: (courseId: number) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  open,
  onClose,
  lang,
  items,
  user,
  telegramHandle,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const t = copy[lang].cart;
  const currency = copy[lang].store.currency;
  const cleanHandle = (telegramHandle || '@SaniBK').replace(/^@+/, '').trim() || 'SaniBK';

  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telegram, setTelegram] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    orderCode: string;
    summaryText: string;
    telegramUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.course.price * item.qty, 0);

  const buildDraftTelegramUrl = () => {
    const lines = items.map((i, idx) => {
      const title = lang === 'fa' ? i.course.title_fa : i.course.title_en;
      return `${idx + 1}. ${title} (x${i.qty}) — ${(i.course.price * i.qty).toLocaleString()} ${currency}`;
    });
    const draftSummary =
      lang === 'fa'
        ? `سلام آکادمی StarDust\nسفارش سبد خرید:\n${lines.join('\n')}\nجمع کل: ${totalAmount.toLocaleString()} ${currency}`
        : `Hello StarDust Academy\nCart Order Summary:\n${lines.join('\n')}\nTotal: ${totalAmount.toLocaleString()} ${currency}`;
    return {
      draftSummary,
      url: `https://t.me/${cleanHandle}?text=${encodeURIComponent(draftSummary)}`,
    };
  };

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const resolvedName = (name || user?.full_name || '').trim();
      const resolvedEmail = (email || user?.email || '').trim();

      const res = await apiRequest<{ orderCode: string; totalAmount: number }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: resolvedName,
          customer_email: resolvedEmail,
          customer_telegram: telegram,
          notes,
          items: items.map((i) => ({ course_id: i.course.id, qty: i.qty })),
        }),
      });

      const lines = items.map((i, idx) => {
        const title = lang === 'fa' ? i.course.title_fa : i.course.title_en;
        return `${idx + 1}. ${title} (x${i.qty}) — ${(i.course.price * i.qty).toLocaleString()} ${currency}`;
      });

      const summaryText =
        lang === 'fa'
          ? `سلام آکادمی StarDust\nکد سفارش: ${res.orderCode}\nنام: ${resolvedName}\nایمیل: ${resolvedEmail}\n${telegram ? `تلگرام: ${telegram}\n` : ''}اقلام سفارش:\n${lines.join('\n')}\nجمع کل: ${res.totalAmount.toLocaleString()} ${currency}${notes ? `\nتوضیحات: ${notes}` : ''}`
          : `Hello StarDust Academy\nOrder Code: ${res.orderCode}\nName: ${resolvedName}\nEmail: ${resolvedEmail}\n${telegram ? `Telegram: ${telegram}\n` : ''}Order Items:\n${lines.join('\n')}\nTotal: ${res.totalAmount.toLocaleString()} ${currency}${notes ? `\nNotes: ${notes}` : ''}`;

      const telegramUrl = `https://t.me/${cleanHandle}?text=${encodeURIComponent(summaryText)}`;
      setCompletedOrder({
        orderCode: res.orderCode,
        summaryText,
        telegramUrl,
      });
      await safeCopyToClipboard(summaryText);
      onClearCart();
    } catch (err: any) {
      setError(err.message || (lang === 'fa' ? 'ثبت سفارش با خطا مواجه شد.' : 'Order submission failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyOnly = async () => {
    if (!completedOrder) return;
    await safeCopyToClipboard(completedOrder.summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleCopyAndOpenTelegram = async (summary: string, url: string) => {
    await safeCopyToClipboard(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const draft = buildDraftTelegramUrl();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full flex flex-col border-s border-slate-200 shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{t.title}</h2>
          <button
            type="button"
            onClick={() => {
              setCompletedOrder(null);
              onClose();
            }}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {completedOrder ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="text-sm font-bold">{t.orderRecorded}</div>
                <div className="text-xs tabular-nums font-medium">{completedOrder.orderCode}</div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                {completedOrder.summaryText}
              </pre>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyAndOpenTelegram(completedOrder.summaryText, completedOrder.telegramUrl)}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {lang === 'fa'
                      ? `کپی متن سفارش و باز کردن تلگرام @${cleanHandle}`
                      : `Copy Summary & Open Telegram @${cleanHandle}`}
                  </span>
                </button>

                <a
                  href={completedOrder.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'fa'
                      ? `لینک مستقیم تلگرام @${cleanHandle}`
                      : `Direct Telegram Link @${cleanHandle}`}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyOnly}
                  className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t.copied : t.copySummary}</span>
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">{t.empty}</div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.course.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">
                        {lang === 'fa' ? item.course.title_fa : item.course.title_en}
                      </div>
                      <div className="text-xs text-blue-700 font-semibold tabular-nums">
                        {(item.course.price * item.qty).toLocaleString()} {currency}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.course.id, -1)}
                        className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold tabular-nums">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.course.id, 1)}
                        className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.course.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-3 border-y border-slate-200 flex items-center justify-between text-sm font-bold text-slate-900">
                <span>{t.total}</span>
                <span className="text-blue-700 tabular-nums">
                  {totalAmount.toLocaleString()} {currency}
                </span>
              </div>

              <form onSubmit={handleCheckout} className="space-y-3">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
                )}
                <input
                  required
                  value={name || user?.full_name || ''}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.customerName}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <input
                  required
                  type="email"
                  value={email || user?.email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.customerEmail}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <input
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder={t.customerTelegram}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notes}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.checkoutBtn}</span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href={draft.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => safeCopyToClipboard(draft.draftSummary)}
                  className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {lang === 'fa'
                      ? `کپی سبد و ارسال سریع به @${cleanHandle}`
                      : `Copy Cart & Open @${cleanHandle} Directly`}
                  </span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
