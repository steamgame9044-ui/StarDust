import { Lang } from '../types';

export const copy: Record<Lang, {
  nav: {
    courses: string;
    services: string;
    videos: string;
    blog: string;
    about: string;
    cart: string;
    portal: string;
    admin: string;
    signIn: string;
    signOut: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    metrics: Array<{ value: string; label: string }>;
  };
  about: {
    heading: string;
    lead: string;
    aboutTitle: string;
    aboutText: string;
    valuesTitle: string;
    values: Array<{ num: string; title: string; desc: string }>;
    cultureTitle: string;
    cultureText: string;
  };
  store: {
    heading: string;
    subheading: string;
    filters: {
      all: string;
      online: string;
      in_person: string;
      booklet: string;
    };
    typeLabels: {
      online: string;
      in_person: string;
      booklet: string;
    };
    currency: string;
    addToCart: string;
    added: string;
    details: string;
    instructor: string;
  };
  services: {
    heading: string;
    subheading: string;
    bookBtn: string;
    formTitle: string;
    name: string;
    email: string;
    contact: string;
    serviceType: string;
    preferredDate: string;
    goals: string;
    submitBooking: string;
    bookingSuccess: string;
  };
  videos: {
    heading: string;
    subheading: string;
    freeLabel: string;
  };
  blog: {
    heading: string;
    subheading: string;
    allCategories: string;
    readMore: string;
    closeArticle: string;
  };
  achievements: {
    heading: string;
    subheading: string;
    before: string;
    after: string;
  };
  testimonials: {
    heading: string;
    subheading: string;
    formHeading: string;
    formNote: string;
    namePlaceholder: string;
    rolePlaceholder: string;
    contentPlaceholder: string;
    ratingLabel: string;
    submitBtn: string;
    pendingNotice: string;
  };
  cart: {
    title: string;
    empty: string;
    total: string;
    customerName: string;
    customerEmail: string;
    customerTelegram: string;
    notes: string;
    checkoutBtn: string;
    orderRecorded: string;
    copySummary: string;
    copied: string;
    openTelegram: string;
  };
  auth: {
    studentTab: string;
    adminTab: string;
    loginMode: string;
    registerMode: string;
    fullName: string;
    emailOrUser: string;
    email: string;
    phoneOptional: string;
    password: string;
    submitLogin: string;
    submitRegister: string;
    otpNote: string;
    adminHint: string;
  };
  dashboard: {
    title: string;
    backToSite: string;
    enrolledCourses: string;
    noCourses: string;
    ordersTitle: string;
    noOrders: string;
    bookingsTitle: string;
    noBookings: string;
    profileTitle: string;
    saveProfile: string;
    profileSaved: string;
    progress: string;
  };
  admin: {
    title: string;
    backToSite: string;
    tabs: {
      overview: string;
      siteSettings: string;
      courses: string;
      blog: string;
      videos: string;
      services: string;
      achievements: string;
      testimonials: string;
      phpExport: string;
    };
  };
  footer: {
    tagline: string;
    telegramLabel: string;
    rights: string;
  };
}> = {
  fa: {
    nav: {
      courses: 'دوره‌ها و جزوه‌ها',
      services: 'خدمات ویژه',
      videos: 'آموزش رایگان',
      blog: 'وبلاگ',
      about: 'چرا StarDust؟',
      cart: 'سبد خرید',
      portal: 'داشبورد من',
      admin: 'پنل مدیریت',
      signIn: 'ورود / ثبت‌نام',
      signOut: 'خروج',
    },
    hero: {
      kicker: 'آکادمی زبان انگلیسی StarDust · آنلاین و حضوری',
      title: 'انگلیسی را زندگی کن، نه فقط حفظ!',
      subtitle:
        'در آکادمی StarDust، زبان جدید را برای ساختن آینده‌ات یاد می‌گیری؛ از مکالمه روان در سفر و کار تا قبولی تضمینی در آزمون‌های بین‌المللی و اپلای.',
      primaryCta: 'شروع مسیر با دوره‌ها و جزوه‌ها',
      secondaryCta: 'گفت‌وگو و مشاوره در تلگرام @SaniBK',
      metrics: [
        { value: '7.5+', label: 'میانگین نمره آیلتس زبان‌آموزان ما' },
        { value: '1,400+', label: 'همراه فعال در کلاس‌های آنلاین و حضوری' },
        { value: '120+', label: 'پذیرش موفق دانشگاهی و اپلای' },
        { value: '100%', label: 'همراهی و فیدبک واقعی تا روز آزمون' },
      ],
    },
    about: {
      heading: 'چرا زبان‌آموزان، StarDust را انتخاب می‌کنند؟',
      lead:
        'ما باور داریم که یادگیری زبان نباید یک پروسه فرسایشی و خسته‌کننده باشد. در StarDust، روش‌های سنتی و حفظ کردن طوطی‌وار کتاب‌ها را کنار گذاشته‌ایم. محیطی آرام، صمیمی و بدون قضاوت که در آن اشتباه کردن، بخشی طبیعی از مسیر حرفه‌ای شدن توست.',
      aboutTitle: 'داستان و فلسفه ما در StarDust',
      aboutText:
        'ما آکادمی StarDust را ساختیم تا فاصله بین «کتاب خواندن» و «راحت صحبت کردن» را از بین ببریم. کلاس‌های کم‌جمعیت، جزوه‌های خلاصه و کاربردی و تمرکز روی نیاز واقعی هر زبان‌آموز باعث می‌شود به‌جای خسته شدن در ترم‌های طولانی، پیشرفت ملموس خودت را از هفته‌های اول ببینی.',
      valuesTitle: 'چیزهایی که روی آن‌ها معامله نمی‌کنیم',
      values: [
        {
          num: '01.',
          title: 'مسیر شفاف و برنامه متناسب با زندگی تو',
          desc: 'قرار نیست همه‌چیز را یک‌شبه حفظ کنی. پیش از شروع، سطح واقعی‌ات را با دقت می‌سنجیم و برنامه‌ای می‌چینیم که با ساعت کار یا دانشگاهت هماهنگ باشد.',
        },
        {
          num: '02.',
          title: 'بازخورد انسانی، نه جملات تکراری',
          desc: 'رایتینگ‌ها و فایل‌های صوتی اسپیکینگ تو توسط مدرس واقعی بررسی می‌شود تا دقیقاً بدانی کجا قوی هستی و چه نکته‌ای نمره‌ات را بالا می‌برد.',
        },
        {
          num: '03.',
          title: 'دانش پایه برای همه آزاد است',
          desc: 'بخش مهمی از ویدیوهای آموزشی، نکات تلفظ و مقالات کاربردی ما همیشه رایگان می‌ماند تا هر کسی بتواند بدون مانع شروع کند.',
        },
      ],
      cultureTitle: 'فرهنگ کلاس‌ها و فضای یادگیری ما',
      cultureText:
        'در StarDust هیچ‌کس به خاطر مکث کردن یا اشتباه تلفظی قضاوت نمی‌شود. اینجا یاد می‌گیری با اعتمادبه‌نفس حرف بزنی، سؤال بپرسی و زبان انگلیسی را به بخشی زنده و لذت‌بخش از روزمره‌ات تبدیل کنی.',
    },
    store: {
      heading: 'میانبُرهای هوشمندانه برای تسلط به زبان',
      subheading:
        'دوره‌های جامع و جزوه‌های عصاره‌گیری‌شده‌ای که حاصل سال‌ها تجربه آموزشی ماست؛ بدون حاشیه، کاملاً کاربردی و آماده برای جهش در سطح زبان تو.',
      filters: {
        all: 'همه موارد',
        online: 'کلاس آنلاین',
        in_person: 'کلاس حضوری',
        booklet: 'جزوه‌های اختصاصی',
      },
      typeLabels: {
        online: 'دوره آنلاین',
        in_person: 'کارگاه حضوری',
        booklet: 'جزوه تالیفی',
      },
      currency: 'تومان',
      addToCart: 'افزودن به سبد خرید',
      added: 'به سبد اضافه شد',
      details: 'مشاهده سرفصل',
      instructor: 'مدرس همراه',
    },
    services: {
      heading: 'فراتر از یک کلاس زبان؛ همراه تو تا رسیدن به هدف',
      subheading:
        'از کلاس‌های لایو و آنلاین تا برنامه‌ریزی دقیق درسی و آمادگی کامل برای مصاحبه‌های اپلای و مهاجرت.',
      bookBtn: 'رزرو این خدمت',
      formTitle: 'رزرو جلسه مشاوره یا کلاس اختصاصی',
      name: 'نام و نام خانوادگی شما',
      email: 'ایمیل (Gmail)',
      contact: 'آیدی تلگرام یا شماره تماس',
      serviceType: 'کدام خدمت برایتان مناسب‌تر است؟',
      preferredDate: 'زمان پیشنهادی برای گفت‌وگو',
      goals: 'کمی از هدفتان بنویسید (مثلاً آیلتس ۷.۵، مهاجرت، مصاحبه کاری...)',
      submitBooking: 'ثبت درخواست مشاوره',
      bookingSuccess:
        'درخواست شما با اشتیاق ثبت شد! همکاران ما خیلی زود از طریق تلگرام یا ایمیل برای هماهنگی دقیق با شما تماس می‌گیرند.',
    },
    videos: {
      heading: 'یادگیری بدون مرز، کاملاً رایگان!',
      subheading:
        'لازم نیست برای شروع منتظر بمانی. همین حالا به کلکسیونی از ویدیوهای کاربردی، نکات طلایی گرامر و اصطلاحات روزمره دسترسی داری.',
      freeLabel: 'رایگان',
    },
    blog: {
      heading: 'مجله تخصصی StarDust؛ هر روز یک قدم جلوتر',
      subheading:
        'جدیدترین تکنیک‌های تقویت حافظه، ترفندهای آزمون و نکات ظریفی که در هیچ کتاب درسی پیدا نمی‌کنی.',
      allCategories: 'همه موضوعات',
      readMore: 'خواندن کامل مقاله',
      closeArticle: 'بستن مقاله',
    },
    achievements: {
      heading: 'نتایج واقعی، نه فقط وعده!',
      subheading:
        'داستان موفقیت زبان‌آموزانی که روزی دقیقاً از نقطه صفر تو شروع کردند و امروز به اهداف تحصیلی، شغلی و مهاجرتی خود رسیده‌اند.',
      before: 'نقطه شروع',
      after: 'دستاورد نهایی',
    },
    testimonials: {
      heading: 'تجربه کسانی که مسیر را با ما طی کرده‌اند',
      subheading:
        'بازخورد صادقانه زبان‌آموزانی که در دوره‌ها، کارگاه‌ها و جلسات مشاوره StarDust همراه ما بوده‌اند.',
      formHeading: 'تجربه خودت را با بقیه به اشتراک بگذار',
      formNote:
        'نظر شما پس از ثبت، برای بررسی در صف تایید مدیر قرار می‌گیرد و پس از تایید در همین بخش منتشر می‌شود.',
      namePlaceholder: 'نام شما',
      rolePlaceholder: 'دوره یا نتیجه شما (مثلاً آیلتس ۸)',
      contentPlaceholder: 'چند خط درباره تجربه‌ات از کلاس‌ها، جزوه‌ها یا مشاوره‌های StarDust بنویس...',
      ratingLabel: 'امتیاز شما',
      submitBtn: 'ارسال نظر برای تایید',
      pendingNotice:
        'ممنون از همراهی و اعتمادت! نظرت با موفقیت ثبت شد و پس از تایید مدیر روی سایت نمایش داده می‌شود.',
    },
    cart: {
      title: 'سبد خرید و تکمیل ثبت‌نام',
      empty: 'سبد خریدت هنوز خالیه؛ می‌تونی از بخش دوره‌ها و جزوه‌ها انتخاب کنی.',
      total: 'مبلغ قابل پرداخت',
      customerName: 'نام و نام خانوادگی',
      customerEmail: 'ایمیل (Gmail)',
      customerTelegram: 'آیدی تلگرام شما (برای ارسال سریع‌تر)',
      notes: 'ساعت مناسب کلاس یا هر نکته دیگری که باید بدانیم',
      checkoutBtn: 'ثبت سفارش و ارسال به تلگرام @SaniBK',
      orderRecorded: 'سفارشت با موفقیت ثبت شد',
      copySummary: 'کپی متن خلاصه سفارش',
      copied: 'متن سفارش کپی شد',
      openTelegram: 'ارسال مستقیم در تلگرام @SaniBK',
    },
    auth: {
      studentTab: 'ورود زبان‌آموز',
      adminTab: 'پنل مدیریت',
      loginMode: 'ورود به حساب',
      registerMode: 'ساخت حساب جدید',
      fullName: 'نام و نام خانوادگی',
      emailOrUser: 'ایمیل یا نام کاربری مدیر',
      email: 'ایمیل (Gmail)',
      phoneOptional: 'شماره موبایل (آماده ورود پیامکی در آینده)',
      password: 'رمز عبور (حداقل ۸ کاراکتر)',
      submitLogin: 'ورود به حساب',
      submitRegister: 'ساخت حساب و ورود به داشبورد',
      otpNote: 'اطلاعات حساب شما طوری طراحی شده که به‌راحتی با سیستم ورود پیامکی (OTP) نیز هماهنگ شود.',
      adminHint: 'ورود اختصاصی مدیر آکادمی با محافظت نشست و توکن امنیتی CSRF',
    },
    dashboard: {
      title: 'فضای شخصی و داشبورد یادگیری من',
      backToSite: 'بازگشت به صفحه اصلی',
      enrolledCourses: 'دوره‌ها و جزوه‌های فعال من',
      noCourses: 'هنوز دوره‌ای در حسابت نداری؛ از فروشگاه اولین قدم را انتخاب کن.',
      ordersTitle: 'تاریخچه سفارش‌های من',
      noOrders: 'هنوز سفارشی ثبت نشده است.',
      bookingsTitle: 'جلسات مشاوره و درخواست‌ها',
      noBookings: 'هنوز درخواست مشاوره‌ای ثبت نکرده‌ای.',
      profileTitle: 'تنظیمات پروفایل',
      saveProfile: 'ذخیره تغییرات',
      profileSaved: 'مشخصات شما با موفقیت به‌روزرسانی شد.',
      progress: 'میزان پیشرفت',
    },
    admin: {
      title: 'پنل مدیریت جامع آکادمی StarDust',
      backToSite: 'مشاهده وب‌سایت',
      tabs: {
        overview: 'نمای کلی و سفارش‌ها',
        siteSettings: 'تنظیمات متون صفحه اصلی',
        courses: 'دوره‌ها و جزوه‌ها',
        blog: 'مقالات وبلاگ',
        videos: 'ویدیوهای رایگان',
        services: 'خدمات آکادمی',
        achievements: 'دستاوردها',
        testimonials: 'تایید نظرات',
        phpExport: 'خروجی PHP 8 و MySQL',
      },
    },
    footer: {
      tagline: 'آکادمی زبان انگلیسی StarDust — جایی که انگلیسی را با آرامش و اعتمادبه‌نفس زندگی می‌کنی.',
      telegramLabel: 'پاسخ‌گویی سریع و ثبت‌نام مستقیم در تلگرام:',
      rights: '© ۲۰۲۶ آکادمی زبان انگلیسی StarDust. تمامی حقوق محفوظ است.',
    },
  },
  en: {
    nav: {
      courses: 'Courses',
      services: 'Services',
      videos: 'Free Videos',
      blog: 'Journal',
      about: 'Why StarDust',
      cart: 'Cart',
      portal: 'My Dashboard',
      admin: 'Admin Panel',
      signIn: 'Sign In',
      signOut: 'Sign Out',
    },
    hero: {
      kicker: 'StarDust English Academy · Online & In-Person',
      title: "Live English, Don't Just Memorize It!",
      subtitle:
        'At StarDust Academy, you build a language for your real future—from effortless speaking in travel and work to confident success in international exams and university admissions.',
      primaryCta: 'Explore Courses & Booklets',
      secondaryCta: 'Chat & Consult on Telegram @SaniBK',
      metrics: [
        { value: '7.5+', label: 'Average IELTS Band Across Graduates' },
        { value: '1,400+', label: 'Active Online & Campus Learners' },
        { value: '120+', label: 'International University Admissions' },
        { value: '100%', label: 'Personal Mentor Feedback to Exam Day' },
      ],
    },
    about: {
      heading: 'Why Learners Choose StarDust',
      lead:
        'We believe learning a language should never feel exhausting or mechanical. At StarDust, we leave rigid textbook drills behind in favor of a calm, welcoming, judgment-free space where making mistakes is a natural step toward real mastery.',
      aboutTitle: 'Our Story & Teaching Philosophy',
      aboutText:
        'We built StarDust to close the gap between passing grammar tests and actually thinking in English. Small cohorts, distilled study booklets, and practical coaching mean you feel real momentum from your very first week.',
      valuesTitle: 'What We Stand By',
      values: [
        {
          num: '01.',
          title: 'A Clear Roadmap Built Around Your Life',
          desc: 'You do not need marathon cramming sessions. We diagnose your starting point honestly and map a study rhythm that fits your job or university schedule.',
        },
        {
          num: '02.',
          title: 'Real Human Feedback, Never Generic Scripts',
          desc: 'Your essays and speaking mock recordings are reviewed personally by senior mentors so you know exactly what moves your score forward.',
        },
        {
          num: '03.',
          title: 'Core Knowledge Should Stay Open',
          desc: 'Our library of foundational video lessons, pronunciation drills, and daily study articles remains free so anyone can start right away.',
        },
      ],
      cultureTitle: 'Our Classroom & Studio Culture',
      cultureText:
        'Nobody at StarDust gets judged for pausing to find a word or mispronouncing a phrase. Here, you build the calm confidence to speak up, ask questions, and make English a living part of your everyday life.',
    },
    store: {
      heading: 'Smart Shortcuts to Real Fluency',
      subheading:
        'Comprehensive courses and distilled study booklets forged from years of real classroom experience—zero fluff, completely practical, and built to elevate your level fast.',
      filters: {
        all: 'All Offerings',
        online: 'Online Classes',
        in_person: 'In-Person',
        booklet: 'Study Booklets',
      },
      typeLabels: {
        online: 'Online Course',
        in_person: 'In-Person Workshop',
        booklet: 'Exclusive Booklet',
      },
      currency: 'IRR',
      addToCart: 'Add to Cart',
      added: 'Added to Cart',
      details: 'View Details',
      instructor: 'Mentor',
    },
    services: {
      heading: 'Beyond a Language Class—With You Until You Arrive',
      subheading:
        'From live interactive sessions to tailored study roadmaps and full coaching for university admissions and visa interviews.',
      bookBtn: 'Select This Service',
      formTitle: 'Book a Personal Consultation or Class',
      name: 'Your Full Name',
      email: 'Email (Gmail)',
      contact: 'Telegram @handle or Phone',
      serviceType: 'Which service fits your goal best?',
      preferredDate: 'Preferred Date',
      goals: 'Tell us briefly about your target (IELTS 7.5, speaking fluency, university apply...)',
      submitBooking: 'Send Booking Request',
      bookingSuccess:
        'Your request is in! Our academic coordinator will reach out on Telegram or email shortly to lock in your time.',
    },
    videos: {
      heading: 'Learn Without Borders—Completely Free!',
      subheading:
        "You don't have to wait to begin. Dive right into our curated library of practical video lessons, essential grammar breakdowns, and everyday expressions.",
      freeLabel: 'Free',
    },
    blog: {
      heading: 'The StarDust Journal—One Step Ahead Every Day',
      subheading:
        "Fresh memory retention techniques, exam insights, and subtle fluency habits you won't find inside standard textbooks.",
      allCategories: 'All Topics',
      readMore: 'Read Full Article',
      closeArticle: 'Close Article',
    },
    achievements: {
      heading: 'Real Results, Not Just Promises!',
      subheading:
        'Stories of learners who once started right where you are today—and went on to achieve their academic, career, and international relocation goals.',
      before: 'Starting Point',
      after: 'Final Result',
    },
    testimonials: {
      heading: 'Voices of Learners Who Walked This Path With Us',
      subheading:
        'Honest reflections from students who trained, practiced, and reached their goals with StarDust.',
      formHeading: 'Share Your Story With Future Learners',
      formNote:
        'Every submitted review goes through quick admin moderation before appearing publicly on this page.',
      namePlaceholder: 'Your Name',
      rolePlaceholder: 'Course or Outcome (e.g., IELTS Band 8.0)',
      contentPlaceholder: 'Tell others how StarDust classes, booklets, or mentoring helped you...',
      ratingLabel: 'Rating',
      submitBtn: 'Submit for Moderation',
      pendingNotice:
        'Thank you for sharing! Your review has been received and is now awaiting admin approval.',
    },
    cart: {
      title: 'Your Cart & Quick Checkout',
      empty: 'Your cart is empty—explore our courses and booklets to begin.',
      total: 'Total',
      customerName: 'Full Name',
      customerEmail: 'Email (Gmail)',
      customerTelegram: 'Your Telegram Handle (Optional)',
      notes: 'Preferred schedule or any note for your mentor',
      checkoutBtn: 'Confirm & Send to Telegram @SaniBK',
      orderRecorded: 'Order Saved Successfully',
      copySummary: 'Copy Order Summary',
      copied: 'Summary Copied',
      openTelegram: 'Continue in Telegram @SaniBK',
    },
    auth: {
      studentTab: 'Learner Sign In',
      adminTab: 'Admin Portal',
      loginMode: 'Sign In',
      registerMode: 'Create Account',
      fullName: 'Full Name',
      emailOrUser: 'Admin Email or Username',
      email: 'Email (Gmail)',
      phoneOptional: 'Phone Number (Ready for future OTP)',
      password: 'Password (min 8 characters)',
      submitLogin: 'Sign In Securely',
      submitRegister: 'Create Account & Enter Dashboard',
      otpNote: 'Your account structure is ready for seamless SMS/OTP verification.',
      adminHint: 'Protected admin session with encrypted password & CSRF validation',
    },
    dashboard: {
      title: 'Your Personal Learning Space',
      backToSite: 'Back to Academy',
      enrolledCourses: 'Your Active Courses & Booklets',
      noCourses: 'No active enrollments yet—browse the store to pick your first track.',
      ordersTitle: 'Your Order History',
      noOrders: 'No orders placed yet.',
      bookingsTitle: 'Consultation Requests',
      noBookings: 'No consultation requests submitted yet.',
      profileTitle: 'Profile Preferences',
      saveProfile: 'Save Changes',
      profileSaved: 'Your profile has been updated.',
      progress: 'Progress',
    },
    admin: {
      title: 'StarDust Admin Control Center',
      backToSite: 'View Live Site',
      tabs: {
        overview: 'Overview & Orders',
        siteSettings: 'Homepage Copy Settings',
        courses: 'Courses & Booklets',
        blog: 'Journal Articles',
        videos: 'Free Videos',
        services: 'Services',
        achievements: 'Achievements',
        testimonials: 'Review Queue',
        phpExport: 'PHP 8 & MySQL Bundle',
      },
    },
    footer: {
      tagline: 'StarDust English Academy — Where you live English with calm, clarity, and confidence.',
      telegramLabel: 'Direct registration & mentoring on Telegram:',
      rights: '© 2026 StarDust English Academy. All rights reserved.',
    },
  },
};
