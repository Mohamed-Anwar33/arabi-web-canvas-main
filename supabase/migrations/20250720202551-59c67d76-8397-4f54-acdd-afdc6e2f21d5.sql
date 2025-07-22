-- Create database tables for Arabic marketing website

-- Site content management table
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section VARCHAR(100) NOT NULL UNIQUE,
  title_ar TEXT,
  title_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT NOT NULL,
  description_en TEXT,
  icon_name VARCHAR(100),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gallery images table
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT,
  title_en TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text_ar TEXT,
  alt_text_en TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table for admin management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to content
CREATE POLICY "Public can view active site content" 
ON public.site_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Public can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Public can view active gallery images" 
ON public.gallery_images 
FOR SELECT 
USING (is_active = true);

-- Authenticated users (admins) can manage all content
CREATE POLICY "Authenticated users can manage site content" 
ON public.site_content 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage services" 
ON public.services 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage gallery" 
ON public.gallery_images 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can view contact messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage contact messages" 
ON public.contact_messages 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contact messages" 
ON public.contact_messages 
FOR DELETE 
TO authenticated 
USING (true);

-- Anyone can insert contact messages
CREATE POLICY "Anyone can submit contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

-- Profile policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = user_id::text) 
WITH CHECK (auth.uid()::text = user_id::text);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true);

-- Create storage policies
CREATE POLICY "Public can view site images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can upload site images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can update site images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'site-images')
WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can delete site images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'site-images');

-- Insert default content
INSERT INTO public.site_content (section, title_ar, content_ar) VALUES
('hero', 'مرحباً بكم في شركتنا للتسويق', 'نحن نقدم أفضل خدمات التسويق الرقمي والإبداعي لتنمية أعمالكم وتحقيق أهدافكم التجارية'),
('about', 'من نحن', 'شركة رائدة في مجال التسويق الرقمي مع خبرة تمتد لأكثر من 10 سنوات في السوق. نحن نساعد الشركات على النمو والتطور من خلال استراتيجيات تسويقية مبتكرة وفعالة');

-- Insert default services
INSERT INTO public.services (title_ar, description_ar, icon_name, sort_order) VALUES
('إدارة وسائل التواصل الاجتماعي', 'إدارة احترافية لحساباتكم على جميع منصات التواصل الاجتماعي مع محتوى إبداعي وخطط تفاعلية', 'Share2', 1),
('التسويق الرقمي', 'حملات تسويقية رقمية متكاملة تشمل الإعلانات المدفوعة وتحسين محركات البحث', 'Target', 2),
('تصميم الهوية البصرية', 'تصميم هوية بصرية متميزة ومتكاملة تعكس قيم علامتكم التجارية', 'Palette', 3),
('إنتاج المحتوى المرئي', 'إنتاج فيديوهات ومحتوى مرئي احترافي يجذب العملاء ويزيد من التفاعل', 'Video', 4),
('التصوير الفوتوغرافي', 'خدمات التصوير الاحترافي للمنتجات والفعاليات والبورتريه', 'Camera', 5),
('الاستشارات التسويقية', 'استشارات تسويقية متخصصة لوضع الخطط الاستراتيجية وتحليل السوق', 'TrendingUp', 6);