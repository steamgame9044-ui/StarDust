import JSZip from 'jszip';

export interface PhpBundleFile {
  path: string;
  description: string;
  language: 'sql' | 'php' | 'css' | 'js' | 'apache';
  content: string;
}

export function getPhpBundleFiles(): PhpBundleFile[] {
  const schemaSql = `-- StarDust English Academy - MySQL 8+ / MariaDB Schema (cPanel / DirectAdmin Ready)
CREATE DATABASE IF NOT EXISTS stardust_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stardust_academy;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(80) DEFAULT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  phone VARCHAR(30) DEFAULT NULL,
  auth_provider VARCHAR(30) NOT NULL DEFAULT 'email',
  otp_code_hash VARCHAR(255) DEFAULT NULL,
  otp_expires_at DATETIME DEFAULT NULL,
  preferred_lang ENUM('fa', 'en') NOT NULL DEFAULT 'fa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_fa VARCHAR(220) NOT NULL,
  title_en VARCHAR(220) NOT NULL,
  type ENUM('online', 'in_person', 'booklet') NOT NULL DEFAULT 'online',
  level VARCHAR(40) NOT NULL,
  price BIGINT UNSIGNED NOT NULL DEFAULT 0,
  duration_label_fa VARCHAR(120) NOT NULL,
  duration_label_en VARCHAR(120) NOT NULL,
  instructor VARCHAR(120) NOT NULL,
  description_fa TEXT NOT NULL,
  description_en TEXT NOT NULL,
  image_webp VARCHAR(255) NOT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE enrollments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
  progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_course (user_id, course_id),
  CONSTRAINT fk_enroll_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_enroll_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(40) NOT NULL UNIQUE,
  user_id INT UNSIGNED DEFAULT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(160) NOT NULL,
  customer_telegram VARCHAR(80) DEFAULT '',
  items_json JSON NOT NULL,
  total_amount BIGINT UNSIGNED NOT NULL,
  notes TEXT,
  status ENUM('pending_telegram', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending_telegram',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_fa VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  category VARCHAR(60) NOT NULL,
  summary_fa TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  deliverable_fa VARCHAR(180) NOT NULL,
  deliverable_en VARCHAR(180) NOT NULL,
  price_label_fa VARCHAR(100) NOT NULL,
  price_label_en VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE consultations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED DEFAULT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone_or_telegram VARCHAR(120) NOT NULL,
  service_type VARCHAR(80) NOT NULL,
  preferred_date VARCHAR(40) NOT NULL,
  goals TEXT NOT NULL,
  status ENUM('new', 'scheduled', 'completed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consult_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE videos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_fa VARCHAR(220) NOT NULL,
  title_en VARCHAR(220) NOT NULL,
  category VARCHAR(80) NOT NULL,
  youtube_id VARCHAR(32) NOT NULL,
  duration_label VARCHAR(20) NOT NULL,
  description_fa TEXT NOT NULL,
  description_en TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blog_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_fa VARCHAR(220) NOT NULL,
  title_en VARCHAR(220) NOT NULL,
  category_fa VARCHAR(80) NOT NULL,
  category_en VARCHAR(80) NOT NULL,
  read_time VARCHAR(40) NOT NULL,
  excerpt_fa TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  content_fa LONGTEXT NOT NULL,
  content_en LONGTEXT NOT NULL,
  image_webp VARCHAR(255) NOT NULL,
  published_at DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE achievements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(120) NOT NULL,
  exam_type VARCHAR(80) NOT NULL,
  score_before VARCHAR(20) NOT NULL,
  score_after VARCHAR(20) NOT NULL,
  timeframe_fa VARCHAR(100) NOT NULL,
  timeframe_en VARCHAR(100) NOT NULL,
  story_fa TEXT NOT NULL,
  story_en TEXT NOT NULL,
  image_webp VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED DEFAULT NULL,
  author_name VARCHAR(120) NOT NULL,
  author_role_fa VARCHAR(140) NOT NULL,
  author_role_en VARCHAR(140) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  content_fa TEXT NOT NULL,
  content_en TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_testi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_settings (
  setting_key VARCHAR(80) PRIMARY KEY,
  section_group VARCHAR(40) NOT NULL,
  label_fa VARCHAR(140) NOT NULL,
  label_en VARCHAR(140) NOT NULL,
  value_fa TEXT NOT NULL,
  value_en TEXT NOT NULL,
  is_multiline TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_settings (setting_key, section_group, label_fa, label_en, value_fa, value_en, is_multiline) VALUES
('hero_title', 'hero', 'تیتر اصلی صفحه', 'Hero Headline', 'انگلیسی را زندگی کن، نه فقط حفظ!', 'Live English, Don\\'t Just Memorize It!', 0),
('hero_subtitle', 'hero', 'زیرتیتر اصلی صفحه', 'Hero Subtitle', 'در آکادمی StarDust، زبان جدید را برای ساختن آینده‌ات یاد می‌گیری؛ از مکالمه روان در سفر و کار تا قبولی تضمینی در آزمون‌های بین‌المللی و اپلای.', 'At StarDust Academy, you build a language for your real future—from effortless speaking in travel and work to confident success in international exams and university admissions.', 1),
('hero_image_webp', 'media', 'تصویر بنر اصلی (Hero)', 'Hero Banner Image', '/assets/images/banners/hero_stardust.webp', '/assets/images/banners/hero_stardust.webp', 0),
('about_image_webp', 'media', 'تصویر بخش معرفی آکادمی', 'About Academy Image', '/assets/images/banners/about_stardust.webp', '/assets/images/banners/about_stardust.webp', 0),
('telegram_handle', 'contact', 'آیدی تلگرام ارتباطی و ثبت‌نام', 'Contact & Checkout Telegram ID', '@SaniBK', '@SaniBK', 0),
('about_heading', 'about', 'تیتر بخش درباره ما', 'About Heading', 'چرا زبان‌آموزان، StarDust را انتخاب می‌کنند؟', 'Why Learners Choose StarDust', 0),
('about_lead', 'about', 'توضیح بخش درباره ما', 'About Description', 'ما باور داریم که یادگیری زبان نباید یک پروسه فرسایشی و خسته‌کننده باشد. در StarDust، روش‌های سنتی و حفظ کردن طوطی‌وار کتاب‌ها را کنار گذاشته‌ایم. محیطی آرام، صمیمی و بدون قضاوت که در آن اشتباه کردن، بخشی طبیعی از مسیر حرفه‌ای شدن توست.', 'We believe learning a language should never feel exhausting or mechanical. At StarDust, we leave rigid textbook drills behind in favor of a calm, welcoming, judgment-free space where making mistakes is a natural step toward real mastery.', 1),
('about_story_title', 'about', 'عنوان داستان و فلسفه آکادمی', 'About Philosophy Title', 'داستان و فلسفه ما در StarDust', 'Our Story & Teaching Philosophy', 0),
('about_story_text', 'about', 'متن داستان و فلسفه آکادمی', 'About Philosophy Body', 'ما آکادمی StarDust را ساختیم تا فاصله بین «کتاب خواندن» و «راحت صحبت کردن» را از بین ببریم. کلاس‌های کم‌جمعیت، جزوه‌های خلاصه و کاربردی و تمرکز روی نیاز واقعی هر زبان‌آموز باعث می‌شود به‌جای خسته شدن در ترم‌های طولانی، پیشرفت ملموس خودت را از هفته‌های اول ببینی.', 'We built StarDust to close the gap between passing grammar tests and actually thinking in English. Small cohorts, distilled study booklets, and practical coaching mean you feel real momentum from your very first week.', 1),
('about_culture_title', 'about', 'عنوان فرهنگ سازمانی', 'Organizational Culture Title', 'فرهنگ کلاس‌ها و فضای یادگیری ما', 'Our Classroom & Studio Culture', 0),
('about_culture_text', 'about', 'متن فرهنگ سازمانی', 'Organizational Culture Body', 'در StarDust هیچ‌کس به خاطر مکث کردن یا اشتباه تلفظی قضاوت نمی‌شود. اینجا یاد می‌گیری با اعتمادبه‌نفس حرف بزنی، سؤال بپرسی و زبان انگلیسی را به بخشی زنده و لذت‌بخش از روزمره‌ات تبدیل کنی.', 'Nobody at StarDust gets judged for pausing to find a word or mispronouncing a phrase. Here, you build the calm confidence to speak up, ask questions, and make English a living part of your everyday life.', 1),
('about_value_1_title', 'about', 'عنوان ارزش اول (01)', 'Core Value 01 Title', 'مسیر شفاف و برنامه متناسب با زندگی تو', 'A Clear Roadmap Built Around Your Life', 0),
('about_value_1_desc', 'about', 'توضیح ارزش اول (01)', 'Core Value 01 Description', 'قرار نیست همه‌چیز را یک‌شبه حفظ کنی. پیش از شروع، سطح واقعی‌ات را با دقت می‌سنجیم و برنامه‌ای می‌چینیم که با ساعت کار یا دانشگاهت هماهنگ باشد.', 'You do not need marathon cramming sessions. We diagnose your starting point honestly and map a study rhythm that fits your job or university schedule.', 1),
('about_value_2_title', 'about', 'عنوان ارزش دوم (02)', 'Core Value 02 Title', 'بازخورد انسانی، نه جملات تکراری', 'Real Human Feedback, Never Generic Scripts', 0),
('about_value_2_desc', 'about', 'توضیح ارزش دوم (02)', 'Core Value 02 Description', 'رایتینگ‌ها و فایل‌های صوتی اسپیکینگ تو توسط مدرس واقعی بررسی می‌شود تا دقیقاً بدانی کجا قوی هستی و چه نکته‌ای نمره‌ات را بالا می‌برد.', 'Your essays and speaking mock recordings are reviewed personally by senior mentors so you know exactly what moves your score forward.', 1),
('about_value_3_title', 'about', 'عنوان ارزش سوم (03)', 'Core Value 03 Title', 'دانش پایه برای همه آزاد است', 'Core Knowledge Should Stay Open', 0),
('about_value_3_desc', 'about', 'توضیح ارزش سوم (03)', 'Core Value 03 Description', 'بخش مهمی از ویدیوهای آموزشی، نکات تلفظ و مقالات کاربردی ما همیشه رایگان می‌ماند تا هر کسی بتواند بدون مانع شروع کند.', 'Our library of foundational video lessons, pronunciation drills, and daily study articles remains free so anyone can start right away.', 1),
('store_heading', 'store', 'تیتر دوره‌ها و جزوه‌ها', 'Courses Heading', 'میانبُرهای هوشمندانه برای تسلط به زبان', 'Smart Shortcuts to Real Fluency', 0),
('services_heading', 'services', 'تیتر خدمات ویژه', 'Services Heading', 'فراتر از یک کلاس زبان؛ همراه تو تا رسیدن به هدف', 'Beyond a Language Class—With You Until You Arrive', 0),
('videos_heading', 'videos', 'تیتر آموزش رایگان', 'Free Videos Heading', 'یادگیری بدون مرز، کاملاً رایگان!', 'Learn Without Borders—Completely Free!', 0),
('achievements_heading', 'achievements', 'تیتر دستاوردها', 'Achievements Heading', 'نتایج واقعی، نه فقط وعده!', 'Real Results, Not Just Promises!', 0),
('blog_heading', 'blog', 'تیتر وبلاگ', 'Blog Heading', 'مجله تخصصی StarDust؛ هر روز یک قدم جلوتر', 'The StarDust Journal—One Step Ahead Every Day', 0),
('testimonials_heading', 'testimonials', 'تیتر نظرات', 'Testimonials Heading', 'تجربه کسانی که مسیر را با ما طی کرده‌اند', 'Voices of Learners Who Walked This Path With Us', 0);
`;

  const configDbPhp = `<?php
declare(strict_types=1);

// Update with your cPanel / DirectAdmin MySQL database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'stardust_academy');
define('DB_USER', 'your_cpanel_db_user');
define('DB_PASS', 'your_cpanel_db_password');

function getPDO(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    return $pdo;
}
`;

  const securityPhp = `<?php
declare(strict_types=1);

function startSecureSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_set_cookie_params([
        'lifetime' => 86400 * 7,
        'path'     => '/',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
}

function e(?string $value): string {
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrfToken(): string {
    startSecureSession();
    return $_SESSION['csrf_token'];
}

function verifyCsrf(?string $token): void {
    startSecureSession();
    if (!$token || !hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(403);
        exit('Invalid CSRF token.');
    }
}

function requireAuth(): array {
    startSecureSession();
    if (empty($_SESSION['user'])) {
        header('Location: /auth/login.php');
        exit;
    }
    return $_SESSION['user'];
}

function requireAdmin(): array {
    $user = requireAuth();
    if (($user['role'] ?? '') !== 'admin') {
        http_response_code(403);
        exit('Access denied.');
    }
    return $user;
}

function uploadWebpImage(array $file, string $folder): ?string {
    $allowedFolders = ['courses', 'blog', 'achievements', 'banners'];
    if (!in_array($folder, $allowedFolders, true) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return null;
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    $allowedMimes = ['image/webp' => 'webp', 'image/jpeg' => 'jpg', 'image/png' => 'png'];
    if (!isset($allowedMimes[$mime])) {
        throw new RuntimeException('Only WebP, JPG, or PNG images are permitted.');
    }
    if (($file['size'] ?? 0) > 4 * 1024 * 1024) {
        throw new RuntimeException('Max image size is 4MB.');
    }
    $targetDir = __DIR__ . '/../assets/images/' . $folder;
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    // Auto-convert JPG/PNG to WebP via GD when available on shared hosting
    $baseName = bin2hex(random_bytes(8));
    if ($mime !== 'image/webp' && function_exists('imagewebp')) {
        $src = $mime === 'image/png' ? @imagecreatefrompng($file['tmp_name']) : @imagecreatefromjpeg($file['tmp_name']);
        if ($src) {
            imagepalettetotruecolor($src);
            imagealphablending($src, true);
            imagesavealpha($src, true);
            $dest = $targetDir . '/' . $baseName . '.webp';
            $ok = imagewebp($src, $dest, 84);
            imagedestroy($src);
            if ($ok) {
                return '/assets/images/' . $folder . '/' . $baseName . '.webp';
            }
        }
    }

    $ext = $allowedMimes[$mime];
    $dest = $targetDir . '/' . $baseName . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new RuntimeException('Failed to store uploaded file.');
    }
    return '/assets/images/' . $folder . '/' . $baseName . '.' . $ext;
}
`;

  const indexPhp = `<?php
declare(strict_types=1);
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/security.php';

startSecureSession();
$pdo = getPDO();

$lang = ($_GET['lang'] ?? $_SESSION['lang'] ?? 'fa') === 'en' ? 'en' : 'fa';
$_SESSION['lang'] = $lang;
$dir = $lang === 'fa' ? 'rtl' : 'ltr';

// Handle pending testimonial submission safely
$reviewMessage = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'submit_testimonial') {
    verifyCsrf($_POST['csrf_token'] ?? null);
    $authorName = trim((string)($_POST['author_name'] ?? ''));
    $authorRole = trim((string)($_POST['author_role'] ?? ''));
    $content    = trim((string)($_POST['content'] ?? ''));
    $rating     = max(1, min(5, (int)($_POST['rating'] ?? 5)));

    if ($authorName !== '' && $content !== '') {
        $stmt = $pdo->prepare('
            INSERT INTO testimonials (user_id, author_name, author_role_fa, author_role_en, rating, content_fa, content_en, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, "pending")
        ');
        $stmt->execute([
            $_SESSION['user']['id'] ?? null,
            $authorName,
            $authorRole ?: 'زبان‌آموز StarDust',
            $authorRole ?: 'StarDust Learner',
            $rating,
            $content,
            $content,
        ]);
        $reviewMessage = $lang === 'fa'
            ? 'نظر شما ثبت شد و پس از تایید مدیر منتشر می‌شود.'
            : 'Thank you! Your review is pending admin approval.';
    }
}

$courses      = $pdo->query('SELECT * FROM courses ORDER BY is_featured DESC, id DESC')->fetchAll();
$services     = $pdo->query('SELECT * FROM services ORDER BY id ASC')->fetchAll();
$videos       = $pdo->query('SELECT * FROM videos ORDER BY id DESC')->fetchAll();
$posts        = $pdo->query('SELECT * FROM blog_posts ORDER BY published_at DESC')->fetchAll();
$achievements = $pdo->query('SELECT * FROM achievements ORDER BY id DESC')->fetchAll();
$testimonials = $pdo->query("SELECT * FROM testimonials WHERE status = 'approved' ORDER BY id DESC")->fetchAll();
$settingsRows = $pdo->query('SELECT setting_key, value_fa, value_en FROM site_settings')->fetchAll();
$siteSettings = [];
foreach ($settingsRows as $row) {
    $siteSettings[$row['setting_key']] = $row;
}

function sdText(array $settings, string $key, string $lang, string $fallback): string {
    if (!empty($settings[$key]['value_' . $lang])) {
        return (string)$settings[$key]['value_' . $lang];
    }
    return $fallback;
}

$rawTelegram = trim(sdText($siteSettings, 'telegram_handle', $lang, '@SaniBK'));
$telegramHandle = ltrim($rawTelegram, '@') ?: 'SaniBK';
$telegramDisplay = '@' . $telegramHandle;
$heroImage = sdText($siteSettings, 'hero_image_webp', $lang, '/assets/images/banners/hero_stardust.webp');
$aboutImage = sdText($siteSettings, 'about_image_webp', $lang, '/assets/images/banners/about_stardust.webp');
?>
<!doctype html>
<html lang="<?= e($lang) ?>" dir="<?= e($dir) ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StarDust English Academy</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Poppins:wght@600;700&family=Vazirmatn:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-white text-slate-900" data-telegram="<?= e($telegramHandle) ?>">
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
      <a href="/index.php" class="font-display-en text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">StarDust</a>
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a href="#courses" class="hover:text-blue-600 whitespace-nowrap"><?= $lang === 'fa' ? 'دوره‌ها و جزوه‌ها' : 'Courses' ?></a>
        <a href="#services" class="hover:text-blue-600 whitespace-nowrap"><?= $lang === 'fa' ? 'خدمات ویژه' : 'Services' ?></a>
        <a href="#videos" class="hover:text-blue-600 whitespace-nowrap"><?= $lang === 'fa' ? 'آموزش رایگان' : 'Free Videos' ?></a>
        <a href="#blog" class="hover:text-blue-600 whitespace-nowrap"><?= $lang === 'fa' ? 'مجله آموزشی' : 'Blog' ?></a>
        <a href="#about" class="hover:text-blue-600 whitespace-nowrap"><?= $lang === 'fa' ? 'درباره ما' : 'About' ?></a>
      </nav>
      <div class="flex items-center gap-3">
        <a href="?lang=<?= $lang === 'fa' ? 'en' : 'fa' ?>" class="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">
          <?= $lang === 'fa' ? 'EN' : 'فا' ?>
        </a>
        <button id="open-cart-btn" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 whitespace-nowrap">
          <?= $lang === 'fa' ? 'سبد خرید' : 'Cart' ?> (<span id="cart-count">0</span>)
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-12 space-y-24">
    <section class="grid lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <h1 class="text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
          <?= e(sdText($siteSettings, 'hero_title', $lang, $lang === 'fa' ? 'انگلیسی را زندگی کن، نه فقط حفظ!' : "Live English, Don't Just Memorize It!")) ?>
        </h1>
        <p class="text-slate-600 text-lg leading-relaxed">
          <?= e(sdText($siteSettings, 'hero_subtitle', $lang, $lang === 'fa'
            ? 'در آکادمی StarDust، زبان جدید را برای ساختن آینده‌ات یاد می‌گیری؛ از مکالمه روان در سفر و کار تا قبولی تضمینی در آزمون‌های بین‌المللی و اپلای.'
            : 'At StarDust Academy, you build a language for your real future—from effortless speaking in travel and work to confident success in international exams and university admissions.')) ?>
        </p>
        <div class="flex flex-wrap gap-4">
          <a href="#courses" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">
            <?= $lang === 'fa' ? 'مشاهده دوره‌ها و جزوه‌ها' : 'Explore Courses & Booklets' ?>
          </a>
          <a href="https://t.me/<?= e($telegramHandle) ?>" target="_blank" rel="noopener noreferrer" class="px-6 py-3 bg-emerald-50 text-emerald-700 font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-100">
            <?= $lang === 'fa' ? 'مشاوره مستقیم در تلگرام ' . e($telegramDisplay) : 'Telegram Counseling ' . e($telegramDisplay) ?>
          </a>
        </div>
      </div>
      <div class="lg:col-span-6">
        <img src="<?= e($heroImage) ?>" alt="StarDust English Academy" class="w-full aspect-video object-cover rounded-2xl border border-slate-200">
      </div>
    </section>

    <section id="about" class="grid lg:grid-cols-12 gap-10 items-center bg-slate-50 border border-slate-200 rounded-3xl p-8">
      <div class="lg:col-span-5">
        <img src="<?= e($aboutImage) ?>" alt="About StarDust Academy" class="w-full aspect-[4/3] object-cover rounded-2xl border border-slate-200">
      </div>
      <div class="lg:col-span-7 space-y-4">
        <h2 class="text-3xl font-bold text-slate-900"><?= e(sdText($siteSettings, 'about_heading', $lang, '')) ?></h2>
        <p class="text-slate-600 leading-relaxed"><?= e(sdText($siteSettings, 'about_lead', $lang, '')) ?></p>
        <div class="grid sm:grid-cols-2 gap-4 pt-2">
          <div class="p-4 rounded-xl bg-white border border-slate-200">
            <h3 class="font-bold text-slate-900 mb-1"><?= e(sdText($siteSettings, 'about_story_title', $lang, '')) ?></h3>
            <p class="text-sm text-slate-600 leading-relaxed"><?= e(sdText($siteSettings, 'about_story_text', $lang, '')) ?></p>
          </div>
          <div class="p-4 rounded-xl bg-white border border-slate-200">
            <h3 class="font-bold text-slate-900 mb-1"><?= e(sdText($siteSettings, 'about_culture_title', $lang, '')) ?></h3>
            <p class="text-sm text-slate-600 leading-relaxed"><?= e(sdText($siteSettings, 'about_culture_text', $lang, '')) ?></p>
          </div>
        </div>
      </div>
    </section>

    <section id="courses" class="space-y-8">
      <h2 class="text-3xl font-bold text-slate-900"><?= e(sdText($siteSettings, 'store_heading', $lang, $lang === 'fa' ? 'میانبُرهای هوشمندانه برای تسلط به زبان' : 'Smart Shortcuts to Real Fluency')) ?></h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ($courses as $course): ?>
          <article class="border border-slate-200 rounded-2xl overflow-hidden bg-white flex flex-col">
            <img src="<?= e($course['image_webp']) ?>" alt="<?= e($course['title_' . $lang]) ?>" class="w-full aspect-[4/3] object-cover">
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <div class="text-xs text-slate-500">
                  <?= e($course['level']) ?> · <?= e($course['duration_label_' . $lang]) ?>
                </div>
                <h3 class="text-lg font-bold text-slate-900"><?= e($course['title_' . $lang]) ?></h3>
                <p class="text-sm text-slate-600 leading-relaxed"><?= e($course['description_' . $lang]) ?></p>
              </div>
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span class="font-bold text-blue-700 tabular-nums"><?= number_format((int)$course['price']) ?> <?= $lang === 'fa' ? 'تومان' : 'IRR' ?></span>
                <button
                  type="button"
                  class="add-to-cart px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  data-id="<?= (int)$course['id'] ?>"
                  data-title="<?= e($course['title_' . $lang]) ?>"
                  data-price="<?= (int)$course['price'] ?>">
                  <?= $lang === 'fa' ? 'افزودن به سبد' : 'Add to Cart' ?>
                </button>
              </div>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section id="videos" class="space-y-8">
      <h2 class="text-3xl font-bold text-slate-900"><?= e(sdText($siteSettings, 'videos_heading', $lang, $lang === 'fa' ? 'یادگیری بدون مرز، کاملاً رایگان!' : 'Learn Without Borders—Completely Free!')) ?></h2>
      <div class="grid md:grid-cols-3 gap-6">
        <?php foreach ($videos as $video): ?>
          <article class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
            <div class="aspect-video bg-slate-900">
              <iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/<?= e($video['youtube_id']) ?>" title="<?= e($video['title_' . $lang]) ?>" allowfullscreen loading="lazy"></iframe>
            </div>
            <div class="p-5 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500"><?= e($video['category']) ?> · <?= e($video['duration_label']) ?></span>
                <span class="font-semibold text-emerald-700"><?= $lang === 'fa' ? 'رایگان' : 'Free' ?></span>
              </div>
              <h3 class="font-bold text-slate-900"><?= e($video['title_' . $lang]) ?></h3>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section id="testimonials" class="space-y-8">
      <h2 class="text-3xl font-bold text-slate-900"><?= e(sdText($siteSettings, 'testimonials_heading', $lang, $lang === 'fa' ? 'تجربه کسانی که مسیر را با ما طی کرده‌اند' : 'Voices of Learners Who Walked This Path With Us')) ?></h2>
      <?php if ($reviewMessage): ?>
        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"><?= e($reviewMessage) ?></div>
      <?php endif; ?>
      <div class="grid md:grid-cols-2 gap-6">
        <?php foreach ($testimonials as $item): ?>
          <blockquote class="p-6 border border-slate-200 rounded-2xl bg-white space-y-3">
            <p class="text-slate-700 leading-relaxed"><?= e($item['content_' . $lang]) ?></p>
            <footer class="text-sm font-semibold text-slate-900">
              <?= e($item['author_name']) ?> · <span class="text-slate-500 font-normal"><?= e($item['author_role_' . $lang]) ?></span>
            </footer>
          </blockquote>
        <?php endforeach; ?>
      </div>
      <form method="post" class="p-6 border border-slate-200 rounded-2xl bg-slate-50 space-y-4 max-w-2xl">
        <input type="hidden" name="action" value="submit_testimonial">
        <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
        <h3 class="font-bold text-lg"><?= $lang === 'fa' ? 'ثبت دیدگاه جدید (انتشار پس از تایید مدیر)' : 'Submit a Review (Published After Approval)' ?></h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <input name="author_name" required placeholder="<?= $lang === 'fa' ? 'نام و نام خانوادگی' : 'Full Name' ?>" class="px-4 py-2.5 rounded-lg border border-slate-300 bg-white">
          <input name="author_role" placeholder="<?= $lang === 'fa' ? 'دوره یا دستاورد شما' : 'Course or Achievement' ?>" class="px-4 py-2.5 rounded-lg border border-slate-300 bg-white">
        </div>
        <textarea name="content" required rows="3" placeholder="<?= $lang === 'fa' ? 'تجربه خود از آکادمی StarDust را بنویسید...' : 'Share your learning experience...' ?>" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white"></textarea>
        <button type="submit" class="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
          <?= $lang === 'fa' ? 'ارسال برای تایید' : 'Submit for Moderation' ?>
        </button>
      </form>
    </section>
  </main>

  <a href="https://t.me/<?= e($telegramHandle) ?>" target="_blank" rel="noopener noreferrer" class="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-lg hover:bg-blue-700">
    Telegram <?= e($telegramDisplay) ?>
  </a>
  <script src="/assets/js/app.js"></script>
</body>
</html>
`;

  const styleCss = `/* StarDust English Academy - Shared Hosting Stylesheet */
:root {
  --sd-bg: #ffffff;
  --sd-surface: #f8fafc;
  --sd-blue: #2563eb;
  --sd-green: #059669;
  --sd-ink: #0f172a;
}

html[dir="rtl"] body {
  font-family: "Vazirmatn", "Plus Jakarta Sans", system-ui, sans-serif;
}

html[dir="ltr"] body {
  font-family: "Plus Jakarta Sans", "Vazirmatn", system-ui, sans-serif;
}

.font-display-en {
  font-family: "Poppins", "Plus Jakarta Sans", sans-serif;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
`;

  const appJs = `// StarDust Cart & Telegram @SaniBK Checkout Bridge
(function () {
  const CART_KEY = 'stardust_cart_v1';
  const countEl = document.getElementById('cart-count');
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

  function updateCount() {
    if (countEl) {
      countEl.textContent = String(cart.reduce((sum, item) => sum + item.qty, 0));
    }
  }

  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const price = Number(btn.getAttribute('data-price') || '0');
      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, title, price, qty: 1 });
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateCount();
    });
  });

  const openCartBtn = document.getElementById('open-cart-btn');
  if (openCartBtn) {
    openCartBtn.addEventListener('click', () => {
      if (!cart.length) return;
      const rawHandle = document.body.getAttribute('data-telegram') || 'SaniBK';
      const handle = rawHandle.replace(/^@+/, '') || 'SaniBK';
      const lines = cart.map((item, idx) => \`\${idx + 1}. \${item.title} x\${item.qty} - \${item.price.toLocaleString()} IRR\`);
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const plainSummary = \`StarDust Order Summary:\\n\${lines.join('\\n')}\\nTotal: \${total.toLocaleString()} IRR\`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(plainSummary).catch(() => {});
      }
      const message = encodeURIComponent(plainSummary);
      window.open(\`https://t.me/\${handle}?text=\${message}\`, '_blank', 'noopener,noreferrer');
    });
  }

  updateCount();
})();
`;

  const authRegisterPhp = `<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/security.php';

startSecureSession();
$pdo = getPDO();
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf($_POST['csrf_token'] ?? null);
    $name  = trim((string)($_POST['full_name'] ?? ''));
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $pass  = (string)($_POST['password'] ?? '');
    $phone = trim((string)($_POST['phone'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Invalid email address.';
    } elseif (strlen($pass) < 8) {
        $error = 'Password must be at least 8 characters.';
    } else {
        $hash = password_hash($pass, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, "student")');
        try {
            $stmt->execute([$name, $email, $hash, $phone ?: null]);
            header('Location: /auth/login.php?registered=1');
            exit;
        } catch (PDOException $ex) {
            $error = 'This email is already registered.';
        }
    }
}
`;

  const authLoginPhp = `<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/security.php';

startSecureSession();
$pdo = getPDO();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf($_POST['csrf_token'] ?? null);
    $identifier = strtolower(trim((string)($_POST['identifier'] ?? '')));
    $password   = (string)($_POST['password'] ?? '');

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1');
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id'        => (int)$user['id'],
            'full_name' => $user['full_name'],
            'email'     => $user['email'],
            'role'      => $user['role'],
        ];
        header('Location: ' . ($user['role'] === 'admin' ? '/admin/index.php' : '/dashboard.php'));
        exit;
    }
}
`;

  const dashboardPhp = `<?php
declare(strict_types=1);
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/security.php';

$user = requireAuth();
$pdo = getPDO();

$stmt = $pdo->prepare('
    SELECT c.title_fa, c.title_en, c.type, c.instructor, e.status, e.progress_percent
    FROM enrollments e
    INNER JOIN courses c ON c.id = e.course_id
    WHERE e.user_id = ?
');
$stmt->execute([$user['id']]);
$enrollments = $stmt->fetchAll();
`;

  const adminIndexPhp = `<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/security.php';

$admin = requireAdmin();
$pdo = getPDO();
$flashMsg = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf($_POST['csrf_token'] ?? null);
    $action = $_POST['action'] ?? '';

    if ($action === 'add_course') {
        $imagePath = uploadWebpImage($_FILES['image'] ?? [], 'courses') ?? '/assets/images/courses/default.webp';
        $stmt = $pdo->prepare('
            INSERT INTO courses (title_fa, title_en, type, level, price, duration_label_fa, duration_label_en, instructor, description_fa, description_en, image_webp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $_POST['title_fa'], $_POST['title_en'], $_POST['type'], $_POST['level'],
            (int)$_POST['price'], $_POST['duration_label_fa'], $_POST['duration_label_en'],
            $_POST['instructor'], $_POST['description_fa'], $_POST['description_en'], $imagePath
        ]);
        $flashMsg = 'دوره با موفقیت اضافه شد.';
    } elseif ($action === 'delete_course') {
        $pdo->prepare('DELETE FROM courses WHERE id = ?')->execute([(int)$_POST['id']]);
        $flashMsg = 'دوره حذف شد.';
    } elseif ($action === 'add_video') {
        $pdo->prepare('INSERT INTO videos (title_fa, title_en, category, youtube_id, duration_label, description_fa, description_en) VALUES (?, ?, ?, ?, ?, ?, ?)')
            ->execute([$_POST['title_fa'], $_POST['title_en'], $_POST['category'], $_POST['youtube_id'], $_POST['duration_label'], $_POST['description_fa'], $_POST['description_en']]);
        $flashMsg = 'ویدیو رایگان اضافه شد.';
    } elseif ($action === 'delete_video') {
        $pdo->prepare('DELETE FROM videos WHERE id = ?')->execute([(int)$_POST['id']]);
        $flashMsg = 'ویدیو حذف شد.';
    } elseif ($action === 'upload_banner') {
        $targetKey = ($_POST['setting_key'] ?? '') === 'about_image_webp' ? 'about_image_webp' : 'hero_image_webp';
        $bannerPath = uploadWebpImage($_FILES['banner_image'] ?? [], 'banners');
        if ($bannerPath) {
            $pdo->prepare('UPDATE site_settings SET value_fa = ?, value_en = ? WHERE setting_key = ?')
                ->execute([$bannerPath, $bannerPath, $targetKey]);
            $flashMsg = 'تصویر بنر با فرمت WebP ذخیره شد.';
        }
    } elseif ($action === 'moderate_testimonial') {
        $status = $_POST['decision'] === 'approved' ? 'approved' : 'rejected';
        $stmt = $pdo->prepare('UPDATE testimonials SET status = ? WHERE id = ?');
        $stmt->execute([$status, (int)$_POST['id']]);
        $flashMsg = 'وضعیت نظر به‌روزرسانی شد.';
    } elseif ($action === 'update_order_status') {
        $allowed = ['pending_telegram', 'confirmed', 'cancelled'];
        $status = in_array($_POST['status'] ?? '', $allowed, true) ? $_POST['status'] : 'pending_telegram';
        $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$status, (int)$_POST['id']]);
        $flashMsg = 'وضعیت سفارش تغییر کرد.';
    } elseif ($action === 'update_site_settings') {
        $stmt = $pdo->prepare('UPDATE site_settings SET value_fa = ?, value_en = ? WHERE setting_key = ?');
        foreach ($_POST['settings'] ?? [] as $key => $pair) {
            $stmt->execute([
                trim((string)($pair['fa'] ?? '')),
                trim((string)($pair['en'] ?? '')),
                (string)$key,
            ]);
        }
        $flashMsg = 'تمام تنظیمات سایت ذخیره شد.';
    } elseif ($action === 'change_admin_password') {
        $current = (string)($_POST['current_password'] ?? '');
        $next    = (string)($_POST['new_password'] ?? '');
        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
        $stmt->execute([$admin['id']]);
        $row = $stmt->fetch();
        if ($row && password_verify($current, $row['password_hash']) && strlen($next) >= 8) {
            $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
                ->execute([password_hash($next, PASSWORD_BCRYPT), $admin['id']]);
            $flashMsg = 'رمز عبور مدیر با موفقیت تغییر یافت.';
        } else {
            $flashMsg = 'خطا: رمز فعلی نادرست است یا رمز جدید کمتر از ۸ کاراکتر دارد.';
        }
    }
}

$siteSettingsList = $pdo->query('SELECT * FROM site_settings ORDER BY section_group ASC, setting_key ASC')->fetchAll();
$ordersList = $pdo->query('SELECT * FROM orders ORDER BY id DESC LIMIT 20')->fetchAll();
$pendingTestimonials = $pdo->query("SELECT * FROM testimonials ORDER BY FIELD(status,'pending','approved','rejected'), id DESC")->fetchAll();
?>
<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>StarDust Admin Panel</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 p-8">
  <div class="max-w-6xl mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">پنل مدیریت StarDust · کنترل کامل محتوا، تصاویر و سفارش‌ها</h1>
      <a href="/index.php" class="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-100">مشاهده سایت</a>
    </div>
    <?php if ($flashMsg): ?>
      <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium"><?= e($flashMsg) ?></div>
    <?php endif; ?>

    <section class="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
      <h2 class="font-bold text-lg">آپلود تصویر بنر صفحه اصلی و درباره ما (تبدیل خودکار به WebP)</h2>
      <form method="post" enctype="multipart/form-data" class="flex flex-wrap items-center gap-4">
        <input type="hidden" name="action" value="upload_banner">
        <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
        <select name="setting_key" class="px-3 py-2 border border-slate-200 rounded-xl text-sm">
          <option value="hero_image_webp">تصویر بنر اصلی (Hero)</option>
          <option value="about_image_webp">تصویر بخش درباره ما</option>
        </select>
        <input type="file" name="banner_image" accept="image/webp,image/png,image/jpeg" required class="text-sm">
        <button type="submit" class="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl">آپلود و جایگزینی</button>
      </form>
    </section>

    <form method="post" class="space-y-4">
      <input type="hidden" name="action" value="update_site_settings">
      <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
      <h2 class="font-bold text-lg">ویرایش کامل متون، ارزش‌ها و آیدی تلگرام</h2>
      <?php foreach ($siteSettingsList as $setting): ?>
        <div class="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
          <div class="font-bold text-sm"><?= e($setting['label_fa']) ?></div>
          <div class="grid md:grid-cols-2 gap-4">
            <input name="settings[<?= e($setting['setting_key']) ?>][fa]" value="<?= e($setting['value_fa']) ?>" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" dir="rtl">
            <input name="settings[<?= e($setting['setting_key']) ?>][en]" value="<?= e($setting['value_en']) ?>" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" dir="ltr">
          </div>
        </div>
      <?php endforeach; ?>
      <button type="submit" class="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">ذخیره تغییرات</button>
    </form>

    <section class="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
      <h2 class="font-bold text-lg">تغییر رمز عبور مدیر</h2>
      <form method="post" class="grid sm:grid-cols-3 gap-4">
        <input type="hidden" name="action" value="change_admin_password">
        <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
        <input type="password" name="current_password" required placeholder="رمز عبور فعلی" class="px-3 py-2 border border-slate-200 rounded-xl text-sm">
        <input type="password" name="new_password" required minlength="8" placeholder="رمز عبور جدید (حداقل ۸ کاراکتر)" class="px-3 py-2 border border-slate-200 rounded-xl text-sm">
        <button type="submit" class="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl">به‌روزرسانی رمز عبور</button>
      </form>
    </section>
  </div>
</body>
</html>
`;

  const htaccess = `# StarDust Shared Hosting Security Rules
Options -Indexes
<FilesMatch "\\.(sql|log|ini)$">
  Require all denied
</FilesMatch>
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`;

  return [
    { path: 'database/schema.sql', language: 'sql', description: 'MySQL 8 / MariaDB relational tables (UTF8MB4, InnoDB, OTP-ready users)', content: schemaSql },
    { path: 'config/db.php', language: 'php', description: 'PDO MySQL connection with prepared statements and strict error mode', content: configDbPhp },
    { path: 'includes/security.php', language: 'php', description: 'Secure sessions, CSRF protection, XSS escaping, and WebP upload validator', content: securityPhp },
    { path: 'index.php', language: 'php', description: 'Modular bilingual storefront, free YouTube hub, and pending-review testimonials', content: indexPhp },
    { path: 'assets/css/style.css', language: 'css', description: 'RTL/LTR Vazirmatn + Poppins typography and pure white / soft blue / green palette', content: styleCss },
    { path: 'assets/js/app.js', language: 'js', description: 'Vanilla JS shopping cart and @SaniBK Telegram checkout formatter', content: appJs },
    { path: 'auth/register.php', language: 'php', description: 'Gmail & password registration with password_hash (BCRYPT) and optional phone', content: authRegisterPhp },
    { path: 'auth/login.php', language: 'php', description: 'Email/username login with session_regenerate_id hardening', content: authLoginPhp },
    { path: 'dashboard.php', language: 'php', description: 'Authenticated Student Dashboard displaying enrolled courses and progress', content: dashboardPhp },
    { path: 'admin/index.php', language: 'php', description: 'Admin Control Panel for courses, WebP uploads, and testimonial moderation', content: adminIndexPhp },
    { path: '.htaccess', language: 'apache', description: 'Apache cPanel directory protection and HTTP security headers', content: htaccess },
  ];
}

export async function buildPhpBundleZip(): Promise<Buffer> {
  const zip = new JSZip();
  const files = getPhpBundleFiles();
  for (const file of files) {
    zip.file(`stardust-cpanel-php/${file.path}`, file.content);
  }
  // Create empty categorized WebP folders so cPanel structure is pre-organized
  zip.folder('stardust-cpanel-php/assets/images/courses');
  zip.folder('stardust-cpanel-php/assets/images/blog');
  zip.folder('stardust-cpanel-php/assets/images/achievements');
  zip.folder('stardust-cpanel-php/assets/images/banners');
  return zip.generateAsync({ type: 'nodebuffer' });
}
