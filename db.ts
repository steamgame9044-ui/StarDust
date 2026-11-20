import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'stardust.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }
  const [, salt, originalHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (derived.length !== original.length) {
    return false;
  }
  return crypto.timingSafeEqual(derived, original);
}

export function initDatabase(): void {
  // Ensure categorized upload directories exist for WebP media
  const uploadDirs = ['courses', 'blog', 'achievements', 'banners'];
  for (const dir of uploadDirs) {
    fs.mkdirSync(path.resolve(process.cwd(), 'uploads', dir), { recursive: true });
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS server_secrets (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const existingSecret = db.prepare("SELECT value FROM server_secrets WHERE key = 'csrf_hmac'").get() as
    | { value: string }
    | undefined;
  if (!existingSecret) {
    db.prepare("INSERT INTO server_secrets (key, value) VALUES ('csrf_hmac', ?)").run(
      crypto.randomBytes(32).toString('hex')
    );
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      username TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      phone TEXT DEFAULT NULL,
      auth_provider TEXT NOT NULL DEFAULT 'email',
      otp_code_hash TEXT DEFAULT NULL,
      otp_expires_at TEXT DEFAULT NULL,
      preferred_lang TEXT NOT NULL DEFAULT 'fa',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      csrf_token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fa TEXT NOT NULL,
      title_en TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('online', 'in_person', 'booklet')),
      level TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 0,
      duration_label_fa TEXT NOT NULL,
      duration_label_en TEXT NOT NULL,
      instructor TEXT NOT NULL,
      description_fa TEXT NOT NULL,
      description_en TEXT NOT NULL,
      image_webp TEXT NOT NULL,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      progress_percent INTEGER NOT NULL DEFAULT 0,
      enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL UNIQUE,
      user_id INTEGER DEFAULT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_telegram TEXT DEFAULT '',
      items_json TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending_telegram',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fa TEXT NOT NULL,
      title_en TEXT NOT NULL,
      category TEXT NOT NULL,
      summary_fa TEXT NOT NULL,
      summary_en TEXT NOT NULL,
      deliverable_fa TEXT NOT NULL,
      deliverable_en TEXT NOT NULL,
      price_label_fa TEXT NOT NULL,
      price_label_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone_or_telegram TEXT NOT NULL,
      service_type TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      goals TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fa TEXT NOT NULL,
      title_en TEXT NOT NULL,
      category TEXT NOT NULL,
      youtube_id TEXT NOT NULL,
      duration_label TEXT NOT NULL,
      description_fa TEXT NOT NULL,
      description_en TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fa TEXT NOT NULL,
      title_en TEXT NOT NULL,
      category_fa TEXT NOT NULL,
      category_en TEXT NOT NULL,
      read_time TEXT NOT NULL,
      excerpt_fa TEXT NOT NULL,
      excerpt_en TEXT NOT NULL,
      content_fa TEXT NOT NULL,
      content_en TEXT NOT NULL,
      image_webp TEXT NOT NULL,
      published_at TEXT NOT NULL DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      exam_type TEXT NOT NULL,
      score_before TEXT NOT NULL,
      score_after TEXT NOT NULL,
      timeframe_fa TEXT NOT NULL,
      timeframe_en TEXT NOT NULL,
      story_fa TEXT NOT NULL,
      story_en TEXT NOT NULL,
      image_webp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      author_name TEXT NOT NULL,
      author_role_fa TEXT NOT NULL,
      author_role_en TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      content_fa TEXT NOT NULL,
      content_en TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key TEXT PRIMARY KEY,
      section_group TEXT NOT NULL,
      label_fa TEXT NOT NULL,
      label_en TEXT NOT NULL,
      value_fa TEXT NOT NULL,
      value_en TEXT NOT NULL,
      is_multiline INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedSiteSettings(false);
  seedInitialData();
}

export function getHmacSecret(): string {
  const row = db.prepare("SELECT value FROM server_secrets WHERE key = 'csrf_hmac'").get() as
    | { value: string }
    | undefined;
  if (row?.value) return row.value;
  const created = crypto.randomBytes(32).toString('hex');
  db.prepare("INSERT OR REPLACE INTO server_secrets (key, value) VALUES ('csrf_hmac', ?)").run(created);
  return created;
}

export interface SiteSettingSeed {
  setting_key: string;
  section_group: string;
  label_fa: string;
  label_en: string;
  value_fa: string;
  value_en: string;
  is_multiline: number;
}

export function getDefaultSiteSettings(): SiteSettingSeed[] {
  return [
    {
      setting_key: 'hero_kicker',
      section_group: 'hero',
      label_fa: 'برچسب بالای تیتر اصلی',
      label_en: 'Hero Kicker',
      value_fa: 'آکادمی زبان انگلیسی StarDust · آنلاین و حضوری',
      value_en: 'StarDust English Academy · Online & In-Person',
      is_multiline: 0,
    },
    {
      setting_key: 'hero_title',
      section_group: 'hero',
      label_fa: 'تیتر اصلی صفحه (Hero)',
      label_en: 'Hero Headline',
      value_fa: 'انگلیسی را زندگی کن، نه فقط حفظ!',
      value_en: "Live English, Don't Just Memorize It!",
      is_multiline: 0,
    },
    {
      setting_key: 'hero_subtitle',
      section_group: 'hero',
      label_fa: 'توضیح زیر تیتر اصلی',
      label_en: 'Hero Subtitle',
      value_fa:
        'در آکادمی StarDust، زبان جدید را برای ساختن آینده‌ات یاد می‌گیری؛ از مکالمه روان در سفر و کار تا قبولی تضمینی در آزمون‌های بین‌المللی و اپلای.',
      value_en:
        'At StarDust Academy, you build a language for your real future—from effortless speaking in travel and work to confident success in international exams and university admissions.',
      is_multiline: 1,
    },
    {
      setting_key: 'hero_primary_cta',
      section_group: 'hero',
      label_fa: 'متن دکمه اصلی Hero',
      label_en: 'Hero Primary Button',
      value_fa: 'شروع مسیر با دوره‌ها و جزوه‌ها',
      value_en: 'Explore Courses & Booklets',
      is_multiline: 0,
    },
    {
      setting_key: 'hero_secondary_cta',
      section_group: 'hero',
      label_fa: 'متن دکمه مشاوره تلگرام',
      label_en: 'Hero Telegram Button',
      value_fa: 'گفت‌وگو و مشاوره در تلگرام @SaniBK',
      value_en: 'Chat & Consult on Telegram @SaniBK',
      is_multiline: 0,
    },
    {
      setting_key: 'about_heading',
      section_group: 'about',
      label_fa: 'تیتر بخش درباره ما و ارزش‌ها',
      label_en: 'About & Culture Heading',
      value_fa: 'چرا زبان‌آموزان، StarDust را انتخاب می‌کنند؟',
      value_en: 'Why Learners Choose StarDust',
      is_multiline: 0,
    },
    {
      setting_key: 'about_lead',
      section_group: 'about',
      label_fa: 'متن معرفی و فرهنگ سازمانی',
      label_en: 'About & Culture Description',
      value_fa:
        'ما باور داریم که یادگیری زبان نباید یک پروسه فرسایشی و خسته‌کننده باشد. در StarDust، روش‌های سنتی و حفظ کردن طوطی‌وار کتاب‌ها را کنار گذاشته‌ایم. محیطی آرام، صمیمی و بدون قضاوت که در آن اشتباه کردن، بخشی طبیعی از مسیر حرفه‌ای شدن توست.',
      value_en:
        'We believe learning a language should never feel exhausting or mechanical. At StarDust, we leave rigid textbook drills behind in favor of a calm, welcoming, judgment-free space where making mistakes is a natural step toward real mastery.',
      is_multiline: 1,
    },
    {
      setting_key: 'store_heading',
      section_group: 'store',
      label_fa: 'تیتر بخش دوره‌ها و جزوه‌ها',
      label_en: 'Courses & Booklets Heading',
      value_fa: 'میانبُرهای هوشمندانه برای تسلط به زبان',
      value_en: 'Smart Shortcuts to Real Fluency',
      is_multiline: 0,
    },
    {
      setting_key: 'store_subheading',
      section_group: 'store',
      label_fa: 'زیرتیتر بخش دوره‌ها و جزوه‌ها',
      label_en: 'Courses & Booklets Subtitle',
      value_fa:
        'دوره‌های جامع و جزوه‌های عصاره‌گیری‌شده‌ای که حاصل سال‌ها تجربه آموزشی ماست؛ بدون حاشیه، کاملاً کاربردی و آماده برای جهش در سطح زبان تو.',
      value_en:
        'Comprehensive courses and distilled study booklets forged from years of real classroom experience—zero fluff, completely practical, and built to elevate your level fast.',
      is_multiline: 1,
    },
    {
      setting_key: 'services_heading',
      section_group: 'services',
      label_fa: 'تیتر بخش خدمات ویژه',
      label_en: 'Special Services Heading',
      value_fa: 'فراتر از یک کلاس زبان؛ همراه تو تا رسیدن به هدف',
      value_en: 'Beyond a Language Class—With You Until You Arrive',
      is_multiline: 0,
    },
    {
      setting_key: 'services_subheading',
      section_group: 'services',
      label_fa: 'زیرتیتر بخش خدمات ویژه',
      label_en: 'Special Services Subtitle',
      value_fa:
        'از کلاس‌های لایو و آنلاین تا برنامه‌ریزی دقیق درسی و آمادگی کامل برای مصاحبه‌های اپلای و مهاجرت.',
      value_en:
        'From live interactive sessions to tailored study roadmaps and full coaching for university admissions and visa interviews.',
      is_multiline: 1,
    },
    {
      setting_key: 'videos_heading',
      section_group: 'videos',
      label_fa: 'تیتر بخش آموزش‌های رایگان',
      label_en: 'Free Videos Heading',
      value_fa: 'یادگیری بدون مرز، کاملاً رایگان!',
      value_en: 'Learn Without Borders—Completely Free!',
      is_multiline: 0,
    },
    {
      setting_key: 'videos_subheading',
      section_group: 'videos',
      label_fa: 'زیرتیتر بخش آموزش‌های رایگان',
      label_en: 'Free Videos Subtitle',
      value_fa:
        'لازم نیست برای شروع منتظر بمانی. همین حالا به کلکسیونی از ویدیوهای کاربردی، نکات طلایی گرامر و اصطلاحات روزمره دسترسی داری.',
      value_en:
        "You don't have to wait to begin. Dive right into our curated library of practical video lessons, essential grammar breakdowns, and everyday expressions.",
      is_multiline: 1,
    },
    {
      setting_key: 'achievements_heading',
      section_group: 'achievements',
      label_fa: 'تیتر بخش دستاوردها و نمونه‌کارها',
      label_en: 'Achievements Heading',
      value_fa: 'نتایج واقعی، نه فقط وعده!',
      value_en: 'Real Results, Not Just Promises!',
      is_multiline: 0,
    },
    {
      setting_key: 'achievements_subheading',
      section_group: 'achievements',
      label_fa: 'زیرتیتر بخش دستاوردها',
      label_en: 'Achievements Subtitle',
      value_fa:
        'داستان موفقیت زبان‌آموزانی که روزی دقیقاً از نقطه صفر تو شروع کردند و امروز به اهداف تحصیلی، شغلی و مهاجرتی خود رسیده‌اند.',
      value_en:
        'Stories of learners who once started right where you are today—and went on to achieve their academic, career, and international relocation goals.',
      is_multiline: 1,
    },
    {
      setting_key: 'blog_heading',
      section_group: 'blog',
      label_fa: 'تیتر بخش وبلاگ',
      label_en: 'Blog Heading',
      value_fa: 'مجله تخصصی StarDust؛ هر روز یک قدم جلوتر',
      value_en: 'The StarDust Journal—One Step Ahead Every Day',
      is_multiline: 0,
    },
    {
      setting_key: 'blog_subheading',
      section_group: 'blog',
      label_fa: 'زیرتیتر بخش وبلاگ',
      label_en: 'Blog Subtitle',
      value_fa:
        'جدیدترین تکنیک‌های تقویت حافظه، ترفندهای آزمون و نکات ظریفی که در هیچ کتاب درسی پیدا نمی‌کنی.',
      value_en:
        "Fresh memory retention techniques, exam insights, and subtle fluency habits you won't find inside standard textbooks.",
      is_multiline: 1,
    },
    {
      setting_key: 'testimonials_heading',
      section_group: 'testimonials',
      label_fa: 'تیتر بخش نظرات زبان‌آموزان',
      label_en: 'Testimonials Heading',
      value_fa: 'تجربه کسانی که مسیر را با ما طی کرده‌اند',
      value_en: 'Voices of Learners Who Walked This Path With Us',
      is_multiline: 0,
    },
    {
      setting_key: 'testimonials_subheading',
      section_group: 'testimonials',
      label_fa: 'زیرتیتر بخش نظرات زبان‌آموزان',
      label_en: 'Testimonials Subtitle',
      value_fa: 'بازخورد صادقانه زبان‌آموزانی که در دوره‌ها، کارگاه‌ها و جلسات مشاوره StarDust همراه ما بوده‌اند.',
      value_en: 'Honest reflections from students who trained, practiced, and reached their goals with StarDust.',
      is_multiline: 1,
    },
    {
      setting_key: 'hero_image_webp',
      section_group: 'media',
      label_fa: 'تصویر بنر اصلی (Hero)',
      label_en: 'Hero Banner Image',
      value_fa: '/src/assets/images/hero_stardust_academy_1795157697795.jpg',
      value_en: '/src/assets/images/hero_stardust_academy_1795157697795.jpg',
      is_multiline: 0,
    },
    {
      setting_key: 'about_image_webp',
      section_group: 'media',
      label_fa: 'تصویر بخش معرفی آکادمی',
      label_en: 'About Academy Image',
      value_fa: '/src/assets/images/course_speaking_club_1795157697931.jpg',
      value_en: '/src/assets/images/course_speaking_club_1795157697931.jpg',
      is_multiline: 0,
    },
    {
      setting_key: 'telegram_handle',
      section_group: 'contact',
      label_fa: 'آیدی تلگرام ارتباطی و ثبت‌نام',
      label_en: 'Contact & Checkout Telegram ID',
      value_fa: '@SaniBK',
      value_en: '@SaniBK',
      is_multiline: 0,
    },
    {
      setting_key: 'about_story_title',
      section_group: 'about',
      label_fa: 'عنوان داستان و فلسفه آکادمی',
      label_en: 'About Philosophy Title',
      value_fa: 'داستان و فلسفه ما در StarDust',
      value_en: 'Our Story & Teaching Philosophy',
      is_multiline: 0,
    },
    {
      setting_key: 'about_story_text',
      section_group: 'about',
      label_fa: 'متن داستان و فلسفه آکادمی',
      label_en: 'About Philosophy Body',
      value_fa:
        'ما آکادمی StarDust را ساختیم تا فاصله بین «کتاب خواندن» و «راحت صحبت کردن» را از بین ببریم. کلاس‌های کم‌جمعیت، جزوه‌های خلاصه و کاربردی و تمرکز روی نیاز واقعی هر زبان‌آموز باعث می‌شود به‌جای خسته شدن در ترم‌های طولانی، پیشرفت ملموس خودت را از هفته‌های اول ببینی.',
      value_en:
        'We built StarDust to close the gap between passing grammar tests and actually thinking in English. Small cohorts, distilled study booklets, and practical coaching mean you feel real momentum from your very first week.',
      is_multiline: 1,
    },
    {
      setting_key: 'about_culture_title',
      section_group: 'about',
      label_fa: 'عنوان فرهنگ سازمانی',
      label_en: 'Organizational Culture Title',
      value_fa: 'فرهنگ کلاس‌ها و فضای یادگیری ما',
      value_en: 'Our Classroom & Studio Culture',
      is_multiline: 0,
    },
    {
      setting_key: 'about_culture_text',
      section_group: 'about',
      label_fa: 'متن فرهنگ سازمانی',
      label_en: 'Organizational Culture Body',
      value_fa:
        'در StarDust هیچ‌کس به خاطر مکث کردن یا اشتباه تلفظی قضاوت نمی‌شود. اینجا یاد می‌گیری با اعتمادبه‌نفس حرف بزنی، سؤال بپرسی و زبان انگلیسی را به بخشی زنده و لذت‌بخش از روزمره‌ات تبدیل کنی.',
      value_en:
        'Nobody at StarDust gets judged for pausing to find a word or mispronouncing a phrase. Here, you build the calm confidence to speak up, ask questions, and make English a living part of your everyday life.',
      is_multiline: 1,
    },
    {
      setting_key: 'about_value_1_title',
      section_group: 'about',
      label_fa: 'عنوان ارزش اول (01)',
      label_en: 'Core Value 01 Title',
      value_fa: 'مسیر شفاف و برنامه متناسب با زندگی تو',
      value_en: 'A Clear Roadmap Built Around Your Life',
      is_multiline: 0,
    },
    {
      setting_key: 'about_value_1_desc',
      section_group: 'about',
      label_fa: 'توضیح ارزش اول (01)',
      label_en: 'Core Value 01 Description',
      value_fa:
        'قرار نیست همه‌چیز را یک‌شبه حفظ کنی. پیش از شروع، سطح واقعی‌ات را با دقت می‌سنجیم و برنامه‌ای می‌چینیم که با ساعت کار یا دانشگاهت هماهنگ باشد.',
      value_en:
        'You do not need marathon cramming sessions. We diagnose your starting point honestly and map a study rhythm that fits your job or university schedule.',
      is_multiline: 1,
    },
    {
      setting_key: 'about_value_2_title',
      section_group: 'about',
      label_fa: 'عنوان ارزش دوم (02)',
      label_en: 'Core Value 02 Title',
      value_fa: 'بازخورد انسانی، نه جملات تکراری',
      value_en: 'Real Human Feedback, Never Generic Scripts',
      is_multiline: 0,
    },
    {
      setting_key: 'about_value_2_desc',
      section_group: 'about',
      label_fa: 'توضیح ارزش دوم (02)',
      label_en: 'Core Value 02 Description',
      value_fa:
        'رایتینگ‌ها و فایل‌های صوتی اسپیکینگ تو توسط مدرس واقعی بررسی می‌شود تا دقیقاً بدانی کجا قوی هستی و چه نکته‌ای نمره‌ات را بالا می‌برد.',
      value_en:
        'Your essays and speaking mock recordings are reviewed personally by senior mentors so you know exactly what moves your score forward.',
      is_multiline: 1,
    },
    {
      setting_key: 'about_value_3_title',
      section_group: 'about',
      label_fa: 'عنوان ارزش سوم (03)',
      label_en: 'Core Value 03 Title',
      value_fa: 'دانش پایه برای همه آزاد است',
      value_en: 'Core Knowledge Should Stay Open',
      is_multiline: 0,
    },
    {
      setting_key: 'about_value_3_desc',
      section_group: 'about',
      label_fa: 'توضیح ارزش سوم (03)',
      label_en: 'Core Value 03 Description',
      value_fa:
        'بخش مهمی از ویدیوهای آموزشی، نکات تلفظ و مقالات کاربردی ما همیشه رایگان می‌ماند تا هر کسی بتواند بدون مانع شروع کند.',
      value_en:
        'Our library of foundational video lessons, pronunciation drills, and daily study articles remains free so anyone can start right away.',
      is_multiline: 1,
    },
  ];
}

export function seedSiteSettings(forceReset: boolean): void {
  const defaults = getDefaultSiteSettings();
  const stmt = forceReset
    ? db.prepare(`
        INSERT INTO site_settings (setting_key, section_group, label_fa, label_en, value_fa, value_en, is_multiline, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(setting_key) DO UPDATE SET
          section_group = excluded.section_group,
          label_fa = excluded.label_fa,
          label_en = excluded.label_en,
          value_fa = excluded.value_fa,
          value_en = excluded.value_en,
          is_multiline = excluded.is_multiline,
          updated_at = datetime('now')
      `)
    : db.prepare(`
        INSERT OR IGNORE INTO site_settings (setting_key, section_group, label_fa, label_en, value_fa, value_en, is_multiline)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

  const tx = db.transaction(() => {
    for (const item of defaults) {
      stmt.run(
        item.setting_key,
        item.section_group,
        item.label_fa,
        item.label_en,
        item.value_fa,
        item.value_en,
        item.is_multiline
      );
    }
  });
  tx();
}

function seedInitialData(): void {
  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  if (userCount === 0) {
    const adminPassword = process.env.STARDUST_ADMIN_PASSWORD || 'Admin@StarDust2026';
    const studentPassword = process.env.STARDUST_STUDENT_PASSWORD || 'Student@2026';

    const insertUser = db.prepare(`
      INSERT INTO users (full_name, username, email, password_hash, role, phone, preferred_lang)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'StarDust Administrator',
      'admin',
      'admin@stardust.academy',
      hashPassword(adminPassword),
      'admin',
      '+989120000000',
      'fa'
    );

    insertUser.run(
      'سارا رضایی',
      'sara_r',
      'sara@gmail.com',
      hashPassword(studentPassword),
      'student',
      '+989123456789',
      'fa'
    );
  }

  const courseCount = (db.prepare('SELECT COUNT(*) as c FROM courses').get() as { c: number }).c;
  if (courseCount === 0) {
    const insertCourse = db.prepare(`
      INSERT INTO courses (
        title_fa, title_en, type, level, price,
        duration_label_fa, duration_label_en, instructor,
        description_fa, description_en, image_webp, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCourse.run(
      'دوره جامع آیلتس آکادمیک (تضمین نمره ۷.۵+)',
      'IELTS Academic Mastery (Band 7.5+ Track)',
      'online',
      'B2 - C1',
      4850000,
      '۱۰ هفته · ۳۰ جلسه زنده',
      '10 Weeks · 30 Live Sessions',
      'Dr. Parsa Naderi',
      'آموزش ساختاریافته هر چهار مهارت آیلتس با تصحیح هفتگی رایتینگ، شبیه‌سازی مصاحبه اسپیکینگ و تحلیل خطاهای فردی.',
      'Structured training across all four IELTS modules with weekly Writing Task 1 & 2 feedback, mock speaking interviews, and individualized diagnostics.',
      '/src/assets/images/course_ielts_mastery_1795157697644.jpg',
      1
    );

    insertCourse.run(
      'کلاب مکالمه پیشرفته و لهجه طبیعی (حضوری و آنلاین)',
      'Natural Fluency & Academic Speaking Club',
      'in_person',
      'B1 - B2',
      3200000,
      '۸ هفته · ۱۶ کارگاه تعاملی',
      '8 Weeks · 16 Interactive Workshops',
      'Elena Rostami',
      'کارگاه‌های کوچک‌مقیاس ۶ نفره برای شکستن سد روانی گفتار، تقویت دایره واژگان کاربردی و تسلط بر لحن طبیعی انگلیسی.',
      'Intimate 6-seat seminar workshops focused on spontaneous fluency, natural collocations, pronunciation clarity, and seminar debate confidence.',
      '/src/assets/images/course_speaking_club_1795157697931.jpg',
      1
    );

    insertCourse.run(
      'پکیج جزوه‌های طلایی گرامر کاربردی و واژگان آکادمیک',
      'StarDust Lexicon & Applied Grammar Booklet Pack',
      'booklet',
      'A2 - C1',
      890000,
      '۲۴۰ صفحه PDF + فلش‌کارت چاپی',
      '240-Page Print/PDF + Flashcards',
      'StarDust Curriculum Lab',
      'مجموعه جزوه‌های تالیفی استارداست شامل الگوهای نوشتار آکادمیک، ۶۰۰ کالوکیشن پرتکرار آزمون‌ها و تمرین‌های خودسنجی.',
      'Authored in-house by StarDust mentors: academic sentence patterns, 600 high-frequency exam collocations, and guided self-assessment drills.',
      '/src/assets/images/booklet_grammar_pack_1795157697071.jpg',
      1
    );

    insertCourse.run(
      'دوره فشرده تافل iBT و نگارش پژوهشی',
      'TOEFL iBT Intensive & Research Writing',
      'online',
      'B2 - C1',
      4500000,
      '۸ هفته · ۲۴ جلسه زنده',
      '8 Weeks · 24 Live Sessions',
      'Dr. Parsa Naderi',
      'آماده‌سازی تخصصی آزمون TOEFL iBT با تمرکز بر یادداشت‌برداری هوشمند، پاسخ‌های یکپارچه و استراتژی زمان‌بندی بخش ریدینگ.',
      'Targeted TOEFL iBT preparation emphasizing smart note-taking, integrated speaking/writing synthesis, and high-speed academic reading strategies.',
      '/src/assets/images/blog_study_strategy_1795157698426.jpg',
      0
    );

    // Pre-enroll sample student Sara in 2 courses
    const student = db.prepare("SELECT id FROM users WHERE email = 'sara@gmail.com'").get() as { id: number } | undefined;
    if (student) {
      db.prepare('INSERT OR IGNORE INTO enrollments (user_id, course_id, status, progress_percent) VALUES (?, 1, ?, ?)').run(student.id, 'active', 65);
      db.prepare('INSERT OR IGNORE INTO enrollments (user_id, course_id, status, progress_percent) VALUES (?, 3, ?, ?)').run(student.id, 'completed', 100);
    }
  }

  const serviceCount = (db.prepare('SELECT COUNT(*) as c FROM services').get() as { c: number }).c;
  if (serviceCount === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (
        title_fa, title_en, category, summary_fa, summary_en,
        deliverable_fa, deliverable_en, price_label_fa, price_label_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertService.run(
      'کلاس‌های لایو و آنلاین اختصاصی',
      '1-on-1 & Small-Group Live Classes',
      'live_classes',
      'برگزاری کلاس‌های تعاملی با زمان‌بندی انعطاف‌پذیر، ضبط کامل جلسات و پشتیبانی تلگرامی در طول هفته.',
      'Flexible live classes with full HD session recordings, interactive screen annotation, and weekly mentor check-ins.',
      'تعیین سطح رایگان + برنامه شخصی‌سازی‌شده',
      'Free placement audit + tailored syllabus',
      'شروع از ۱,۸۰۰,۰۰۰ تومان',
      'From 1.8M IRR / Term'
    );

    insertService.run(
      'مشاوره برنامه‌ریزی درسی و منتورینگ آزمون',
      'Academic Study Planning & Exam Roadmap',
      'study_planning',
      'طراحی نقشه راه هفته به هفته بر اساس سطح فعلی، زمان آزاد روزانه و ددلاین دقیق آزمون آیلتس یا تافل شما.',
      'Week-by-week study calendar calibrated to your baseline diagnostic, daily bandwidth, and official exam deadline.',
      'تقویم مطالعاتی ۱۲ هفته‌ای + ارزیابی دوهفته‌یک‌بار',
      '12-week study blueprint + bi-weekly reviews',
      '۷۵۰,۰۰۰ تومان (جلسه ۶۰ دقیقه‌ای)',
      '750K IRR (60-min session)'
    );

    insertService.run(
      'خدمات اپلای، نگارش SOP و مشاوره مهاجرت تحصیلی',
      'University Apply, SOP Editing & Visa Readiness',
      'apply_immigration',
      'همراهی کامل از انتخاب دانشگاه و ویرایش انگیزه‌نامه (SOP/CV) به انگلیسی آکادمیک تا آمادگی مصاحبه سفارت.',
      'End-to-end academic admission mentoring: university shortlisting, native-level SOP/CV editing, and embassy interview simulation.',
      'ویرایش تخصصی SOP و CV + شبیه‌سازی مصاحبه',
      'Full SOP/CV edit + mock interview',
      'توافقی بر اساس پرونده',
      'Custom per admission track'
    );

    insertService.run(
      'آموزش‌های ویدیویی رایگان و کارگاه‌های آزاد',
      'Free Video Library & Open Workshops',
      'free_tutorials',
      'دسترسی رایگان و همیشگی به ده‌ها آموزش کاربردی گرامر، تلفظ و نکات طلایی آزمون در وب‌سایت آکادمی.',
      'Open-access video library covering grammar mechanics, pronunciation clarity, and IELTS/TOEFL strategy breakdowns.',
      'دسترسی نامحدود در بخش آموزش رایگان',
      'Unlimited access in Free Videos hub',
      'کاملاً رایگان',
      '100% Free'
    );
  }

  const videoCount = (db.prepare('SELECT COUNT(*) as c FROM videos').get() as { c: number }).c;
  if (videoCount === 0) {
    const insertVideo = db.prepare(`
      INSERT INTO videos (title_fa, title_en, category, youtube_id, duration_label, description_fa, description_en)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertVideo.run(
      'ساختار طلایی پاراگراف‌بندی در رایتینگ آیلتس (Task 2)',
      'IELTS Writing Task 2: Cohesive Paragraph Architecture',
      'IELTS Writing',
      'M7lc1UVf-VE',
      '14:20',
      'چگونه بدون حفظ کردن جملات کلیشه‌ای، استدلال‌های منسجم و نمره ۸ بنویسیم.',
      'How to construct coherent, Band 8 argument paragraphs without relying on memorized templates.'
    );

    insertVideo.run(
      'تکنیک سایه‌زنی (Shadowing) برای لهجه طبیعی و روانی اسپیکینگ',
      'The Shadowing Method for Natural English Rhythm',
      'Speaking & Fluency',
      'aqz-KE-bpKQ',
      '11:45',
      'تمرین عملی ۱۵ دقیقه‌ای روزانه برای هماهنگی ریتم گفتار، استرس کلمات و اتصال صداها.',
      'A 15-minute daily drill to master connected speech, word stress, and natural intonation.'
    );

    insertVideo.run(
      '۵ خطای رایج زمان‌های انگلیسی در مکالمات روزمره و آکادمیک',
      '5 Common Tense Mistakes in Academic & Everyday English',
      'Grammar',
      'ysz5S6PUM-U',
      '09:50',
      'تحلیل دقیق تفاوت حال کامل و گذشته ساده با مثال‌های واقعی آزمون.',
      'Clear breakdown of Present Perfect vs. Simple Past with real exam and workplace examples.'
    );
  }

  const blogCount = (db.prepare('SELECT COUNT(*) as c FROM blog_posts').get() as { c: number }).c;
  if (blogCount === 0) {
    const insertPost = db.prepare(`
      INSERT INTO blog_posts (
        title_fa, title_en, category_fa, category_en, read_time,
        excerpt_fa, excerpt_en, content_fa, content_en, image_webp, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPost.run(
      'چگونه در ۱۲ هفته نمره اسپیکینگ خود را از ۵.۵ به ۷.۵ برسانیم؟',
      'How to Bridge IELTS Speaking from Band 5.5 to 7.5 in 12 Weeks',
      'استراتژی آزمون',
      'Exam Strategy',
      '۵ دقیقه مطالعه',
      'برنامه گام‌به‌گام برای حذف مکث‌های طولانی، استفاده طبیعی از کالوکیشن‌ها و مدیریت استرس در پارت ۲ و ۳.',
      'A week-by-week breakdown for eliminating hesitation, building natural collocations, and handling Part 2 & 3 abstract prompts.',
      'بسیاری از زبان‌آموزان تصور می‌کنند برای گرفتن نمره ۷.۵ در اسپیکینگ باید واژگان بسیار پیچیده و ادبی به کار ببرند؛ در حالی که معیار اصلی ممتحن، روانی بیان، طبیعی بودن ترکیب واژگان (Collocations) و شفافیت گرامری است.\n\nدر آکادمی StarDust برنامه ۱۲ هفته‌ای را به سه فاز ۴ هفته‌ای تقسیم می‌کنیم: فاز اول تثبیت ساختار جملات پایه و حذف خطاهای زمان؛ فاز دوم گسترش موضوعی واژگان روزمره و آکادمیک؛ و فاز سوم شبیه‌سازی هفتگی آزمون با بازخورد دقیق بر روی تلفظ و پیوستگی کلام.',
      'Many candidates assume Band 7.5 Speaking requires obscure vocabulary. In practice, examiners reward effortless fluency, natural collocations, and grammatical range.\n\nAt StarDust Academy, we structure a 12-week bridge into three 4-week cycles: stabilizing tense accuracy first, expanding topic-specific lexical chunks second, and running timed mock interviews with diagnostic audio feedback in the final four weeks.',
      '/src/assets/images/course_speaking_club_1795157697931.jpg',
      '2026-11-15'
    );

    insertPost.run(
      'راهنمای نگارش انگیزه‌نامه (SOP) متقاعدکننده برای اپلای دانشگاه‌های اروپا و کانادا',
      'Writing a Persuasive Statement of Purpose for European & Canadian Admissions',
      'اپلای و مهاجرت',
      'Study Abroad',
      '۶ دقیقه مطالعه',
      'ساختار استاندارد یک SOP حرفه‌ای بدون اغراق، با تمرکز بر پیوند منطقی سوابق پژوهشی و اهداف آینده.',
      'How admissions committees read your SOP, and how to connect academic background with clear research goals.',
      'کمیته‌های پذیرش دانشگاه‌های بین‌المللی روزانه صدها انگیزه‌نامه را بررسی می‌کنند. تفاوت یک SOP موفق با متون تکراری، در وضوح مسیر فکری و بیان دقیق انگیزه پژوهشی است.\n\nبه جای جملات کلی و کلیشه‌ای، پروژه یا چالش واقعی که در دوره کارشناسی تجربه کرده‌اید را شرح دهید و نشان دهید چرا دپارتمان مقصد بهترین بستر برای ادامه پژوهش شماست.',
      'Admissions committees review hundreds of statements each cycle. What sets a compelling SOP apart is intellectual clarity and an authentic narrative linking past projects to future inquiry.\n\nReplace broad clichés with concrete evidence: detail one research problem you tackled, explain why that specific faculty matches your focus, and keep your academic English crisp and understated.',
      '/src/assets/images/blog_study_strategy_1795157698426.jpg',
      '2026-11-12'
    );

    insertPost.run(
      'روش مطالعه فعال واژگان: چرا حفظ کردن لیست لغات نتیجه‌بخش نیست؟',
      'Active Lexical Acquisition: Why Memorizing Word Lists Fails',
      'یادگیری عمیق',
      'Language Science',
      '۴ دقیقه مطالعه',
      'آشنایی با تکنیک بازیابی فاصله‌دار (Spaced Repetition) و یادگیری کلمات در بافت واقعی جمله.',
      'Why isolated word lists fade quickly and how contextual spaced repetition locks vocabulary into active speech.',
      'حفظ کردن فهرست‌های صدتایی کلمات بدون دیدن کاربرد آن‌ها در جمله، باعث می‌شود در لحظه مکالمه یا نوشتن نتوانید از آن‌ها استفاده کنید.\n\nدر جزوه‌های StarDust هر واژه جدید همراه با دو کالوکیشن طبیعی، تلفظ استاندارد و یک تمرین بازنویسی فوری ارائه می‌شود تا از حافظه غیرفعال به دایره واژگان فعال شما منتقل شود.',
      'Memorizing isolated bilingual word lists creates passive recognition without active recall during real conversation.\n\nIn StarDust booklets, every target word is introduced inside two natural collocations, paired with audio stress patterns and an immediate sentence-production prompt.',
      '/src/assets/images/booklet_grammar_pack_1795157697071.jpg',
      '2026-11-09'
    );
  }

  const achievementCount = (db.prepare('SELECT COUNT(*) as c FROM achievements').get() as { c: number }).c;
  if (achievementCount === 0) {
    const insertAchievement = db.prepare(`
      INSERT INTO achievements (
        student_name, exam_type, score_before, score_after,
        timeframe_fa, timeframe_en, story_fa, story_en, image_webp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAchievement.run(
      'امیرحسین مرادی',
      'IELTS Academic',
      '5.5',
      '8.0',
      '۱۴ هفته · دوره جامع + منتورینگ',
      '14 Weeks · Mastery + Mentoring',
      'با اصلاح ساختار پاراگراف‌بندی رایتینگ و ۶ جلسه شبیه‌سازی اسپیکینگ، به نمره ۸ آیلتس و پذیرش کارشناسی ارشد در آلمان دست یافت.',
      'Through weekly writing diagnostics and six mock interviews, Amirhossein moved from Band 5.5 to 8.0 and secured MSc admission in Germany.',
      '/src/assets/images/course_ielts_mastery_1795157697644.jpg'
    );

    insertAchievement.run(
      'نیلوفر شریفی',
      'TOEFL iBT',
      '78',
      '111',
      '۱۰ هفته · کلاس لایو و اپلای',
      '10 Weeks · Live Track + Apply',
      'علاوه بر کسب نمره ۱۱۱ در تافل، با ویرایش تخصصی SOP و تمرین مصاحبه اسکالرشیپ، موفق به اخذ فاند کامل از دانشگاه تورنتو شد.',
      'Achieved 111 on TOEFL iBT alongside full scholarship admission to the University of Toronto after SOP refinement and interview coaching.',
      '/src/assets/images/hero_stardust_academy_1795157697795.jpg'
    );

    insertAchievement.run(
      'کیانوش بهرامی',
      'Business & Fluency',
      'B1',
      'C1',
      '۴ ماه · کلاب مکالمه پیشرفته',
      '4 Months · Speaking Club',
      'پس از سال‌ها مکث در مکالمه، با شرکت در کارگاه‌های ۶ نفره استارداست، مصاحبه فنی خود با یک شرکت بین‌المللی را با موفقیت گذراند.',
      'Overcame years of speaking hesitation in small-group seminars and passed his international technical engineering interviews.',
      '/src/assets/images/course_speaking_club_1795157697931.jpg'
    );
  }

  const testimonialCount = (db.prepare('SELECT COUNT(*) as c FROM testimonials').get() as { c: number }).c;
  if (testimonialCount === 0) {
    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (
        author_name, author_role_fa, author_role_en, rating, content_fa, content_en, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertTestimonial.run(
      'مهسا کریمی',
      'دانشجوی دکتری · نمره آیلتس ۸.۰',
      'PhD Candidate · IELTS 8.0',
      5,
      'جزوه‌های اختصاصی و بازخوردهای دقیق رایتینگ در آکادمی StarDust مسیر مطالعه من را کاملاً شفاف کرد. بدون استرس و سردرگمی در کمتر از سه ماه به نمره هدفم رسیدم.',
      'StarDust booklets and precise writing feedback gave my preparation real structure. I reached my target Band 8.0 in under three months without guesswork.',
      'approved'
    );

    insertTestimonial.run(
      'رضا تهرانی',
      'پذیرش‌گرفته دانشگاه میلان',
      'MSc Admit · Politecnico di Milano',
      5,
      'بخش مشاوره اپلای و ویرایش SOP بی‌نظیر بود. نکاتی که درباره لحن آکادمیک و ساختار انگیزه‌نامه گفتند تاثیر مستقیمی در پذیرش من داشت.',
      'The university apply consultation and SOP editing were exceptional. Their guidance on academic tone directly strengthened my admission portfolio.',
      'approved'
    );

    insertTestimonial.run(
      'پویا فرهادی',
      'زبان‌آموز دوره مکالمه B2',
      'B2 Speaking Club Learner',
      5,
      'محیط کلاس‌ها بسیار آرام و حرفه‌ای است و تمام نکات کاربردی خارج از کتاب‌های تکراری آموزش داده می‌شود. ثبت‌نام برای ترم جدید را قطعا ادامه می‌دهم.',
      'Calm, focused classes with practical real-world coaching far beyond standard textbooks. Looking forward to continuing next term.',
      'pending'
    );
  }
}
