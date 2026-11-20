export type Lang = 'fa' | 'en';

export interface User {
  id: number;
  full_name: string;
  username: string | null;
  email: string;
  role: 'student' | 'admin';
  phone: string | null;
  preferred_lang: Lang;
}

export interface Course {
  id: number;
  title_fa: string;
  title_en: string;
  type: 'online' | 'in_person' | 'booklet';
  level: string;
  price: number;
  duration_label_fa: string;
  duration_label_en: string;
  instructor: string;
  description_fa: string;
  description_en: string;
  image_webp: string;
  is_featured: number;
}

export interface ServiceItem {
  id: number;
  title_fa: string;
  title_en: string;
  category: string;
  summary_fa: string;
  summary_en: string;
  deliverable_fa: string;
  deliverable_en: string;
  price_label_fa: string;
  price_label_en: string;
}

export interface VideoItem {
  id: number;
  title_fa: string;
  title_en: string;
  category: string;
  youtube_id: string;
  duration_label: string;
  description_fa: string;
  description_en: string;
}

export interface BlogPost {
  id: number;
  title_fa: string;
  title_en: string;
  category_fa: string;
  category_en: string;
  read_time: string;
  excerpt_fa: string;
  excerpt_en: string;
  content_fa: string;
  content_en: string;
  image_webp: string;
  published_at: string;
}

export interface Achievement {
  id: number;
  student_name: string;
  exam_type: string;
  score_before: string;
  score_after: string;
  timeframe_fa: string;
  timeframe_en: string;
  story_fa: string;
  story_en: string;
  image_webp: string;
}

export interface Testimonial {
  id: number;
  author_name: string;
  author_role_fa: string;
  author_role_en: string;
  rating: number;
  content_fa: string;
  content_en: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CartItem {
  course: Course;
  qty: number;
}

export interface PhpBundleFile {
  path: string;
  description: string;
  language: 'sql' | 'php' | 'css' | 'js' | 'apache';
  content: string;
}

export interface SiteSetting {
  setting_key: string;
  section_group: string;
  label_fa: string;
  label_en: string;
  value_fa: string;
  value_en: string;
  is_multiline: number;
}

