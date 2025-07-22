import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Image, Settings, FileText } from 'lucide-react';

interface Stats {
  contactMessages: number;
  galleryImages: number;
  services: number;
  siteContent: number;
}

const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    contactMessages: 0,
    galleryImages: 0,
    services: 0,
    siteContent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [messagesResult, imagesResult, servicesResult, contentResult] = await Promise.all([
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('site_content').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        contactMessages: messagesResult.count || 0,
        galleryImages: imagesResult.count || 0,
        services: servicesResult.count || 0,
        siteContent: contentResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'رسائل التواصل',
      value: stats.contactMessages,
      description: 'إجمالي الرسائل المستلمة',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'صور المعرض',
      value: stats.galleryImages,
      description: 'إجمالي الصور في المعرض',
      icon: Image,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'الخدمات',
      value: stats.services,
      description: 'إجمالي الخدمات المتاحة',
      icon: Settings,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'محتوى الموقع',
      value: stats.siteContent,
      description: 'أقسام المحتوى',
      icon: FileText,
      color: 'from-orange-500 to-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-elegant">
            <CardHeader className="animate-pulse">
              <div className="w-8 h-8 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2 font-arabic">إحصائيات لوحة التحكم</h2>
        <p className="text-muted-foreground font-arabic">نظرة عامة على بيانات موقعك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="card-elegant group hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground font-arabic">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                </div>
                <CardDescription className="text-xs font-arabic">
                  {stat.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-primary">
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="font-arabic text-primary">مرحباً بك في لوحة التحكم</CardTitle>
          <CardDescription className="font-arabic">
            من هنا يمكنك إدارة جميع محتويات موقعك بسهولة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-arabic">
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">إدارة المحتوى</h4>
              <p className="text-muted-foreground">قم بتحديث نصوص وصور الموقع</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">إدارة الخدمات</h4>
              <p className="text-muted-foreground">أضف وعدّل خدماتك</p>
            </div>
            <div className="p-4 bg-green-500/5 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">معرض الصور</h4>
              <p className="text-muted-foreground">ارفع وأدر صور المعرض</p>
            </div>
            <div className="p-4 bg-blue-500/5 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">الرسائل</h4>
              <p className="text-muted-foreground">راجع رسائل العملاء</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;