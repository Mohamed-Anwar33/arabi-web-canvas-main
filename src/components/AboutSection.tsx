import { useState, useEffect } from 'react';
import { CheckCircle, Users, Trophy, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AboutContent {
  title_ar: string;
  content_ar: string;
  image_url?: string;
}

const AboutSection = () => {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', 'about')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching about content:', error);
      } else {
        setAboutContent(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: Users, label: 'عميل سعيد', value: '500+', color: 'text-primary' },
    { icon: Trophy, label: 'مشروع ناجح', value: '1000+', color: 'text-secondary' },
    { icon: Star, label: 'سنوات خبرة', value: '10+', color: 'text-accent' },
    { icon: CheckCircle, label: 'نسبة نجاح', value: '98%', color: 'text-primary' }
  ];

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-20 bg-muted rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 bg-muted/30" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-section-title text-primary mb-6 animate-fade-in-up font-arabic">
              {aboutContent?.title_ar || 'من نحن'}
            </h2>
            
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>
            
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-4xl mx-auto animate-slide-in-right font-arabic">
              {aboutContent?.content_ar || 'شركة رائدة في مجال التسويق الرقمي مع خبرة تمتد لأكثر من 10 سنوات في السوق'}
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="card-elegant text-center group hover:bg-primary/5 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                
                <div className="text-3xl font-bold text-primary mb-2 font-arabic">
                  {stat.value}
                </div>
                
                <div className="text-foreground/70 font-arabic">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'فريق متخصص',
                description: 'فريق من الخبراء المتخصصين في جميع جوانب التسويق الرقمي',
                icon: Users
              },
              {
                title: 'استراتيجيات مبتكرة',
                description: 'نستخدم أحدث الاستراتيجيات والتقنيات في عالم التسويق',
                icon: Trophy
              },
              {
                title: 'نتائج مضمونة',
                description: 'نضمن تحقيق النتائج المطلوبة وزيادة عوائد الاستثمار',
                icon: Star
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="card-elegant group hover:shadow-glow-hover transition-all duration-300"
                style={{ animationDelay: `${(index + 4) * 0.1}s` }}
              >
                <div className="w-14 h-14 mb-6 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                
                <h3 className="text-card-title text-primary mb-4 font-arabic">
                  {feature.title}
                </h3>
                
                <p className="text-foreground/70 leading-relaxed font-arabic">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;