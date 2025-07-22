import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, Image, FileText, MessageSquare, Home } from 'lucide-react';
import SiteContentManager from '@/components/dashboard/SiteContentManager';
import ServicesManager from '@/components/dashboard/ServicesManager';
import GalleryManager from '@/components/dashboard/GalleryManager';
import ContactManager from '@/components/dashboard/ContactManager';
import DashboardStats from '@/components/dashboard/DashboardStats';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً!"
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-arabic">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary font-arabic">لوحة التحكم</h1>
                <p className="text-sm text-muted-foreground font-arabic">
                  مرحباً، {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="font-arabic"
              >
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="font-arabic"
              >
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="stats" className="font-arabic">
              <Settings className="w-4 h-4 ml-2" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="content" className="font-arabic">
              <FileText className="w-4 h-4 ml-2" />
              المحتوى
            </TabsTrigger>
            <TabsTrigger value="services" className="font-arabic">
              <Settings className="w-4 h-4 ml-2" />
              الخدمات
            </TabsTrigger>
            <TabsTrigger value="gallery" className="font-arabic">
              <Image className="w-4 h-4 ml-2" />
              المعرض
            </TabsTrigger>
            <TabsTrigger value="messages" className="font-arabic">
              <MessageSquare className="w-4 h-4 ml-2" />
              الرسائل
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <DashboardStats />
          </TabsContent>

          <TabsContent value="content">
            <SiteContentManager />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>

          <TabsContent value="messages">
            <ContactManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;