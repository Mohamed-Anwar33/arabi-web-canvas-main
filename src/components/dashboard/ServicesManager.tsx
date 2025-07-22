import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Save, Trash2, Edit, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Service {
  id: string;
  title_ar: string;
  title_en?: string;
  description_ar: string;
  description_en?: string;
  icon_name?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

const ServicesManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "خطأ في جلب الخدمات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (service: Service) => {
    setSaving(service.id);
    try {
      if (service.id === 'new') {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert({
            title_ar: service.title_ar,
            title_en: service.title_en,
            description_ar: service.description_ar,
            description_en: service.description_en,
            icon_name: service.icon_name,
            image_url: service.image_url,
            sort_order: services.length + 1,
            is_active: true
          });

        if (error) throw error;
        await fetchServices();
      } else {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update({
            title_ar: service.title_ar,
            title_en: service.title_en,
            description_ar: service.description_ar,
            description_en: service.description_en,
            icon_name: service.icon_name,
            image_url: service.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', service.id);

        if (error) throw error;
      }

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث الخدمة بنجاح"
      });
      
      setIsDialogOpen(false);
      setEditingService(null);
      await fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "خطأ في الحفظ",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الخدمة بنجاح"
      });

      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "خطأ في الحذف",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `service-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ في رفع الصورة",
        variant: "destructive"
      });
      return null;
    }
  };

  const openEditDialog = (service?: Service) => {
    setEditingService(service || {
      id: 'new',
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      icon_name: '',
      image_url: '',
      sort_order: services.length + 1,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="card-elegant">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2 font-arabic">إدارة الخدمات</h2>
          <p className="text-muted-foreground font-arabic">أضف وعدّل خدماتك</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEditDialog()} className="btn-hero font-arabic">
              <Plus className="w-4 h-4 ml-2" />
              إضافة خدمة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-arabic">
                {editingService?.id === 'new' ? 'إضافة خدمة جديدة' : 'تعديل الخدمة'}
              </DialogTitle>
              <DialogDescription className="font-arabic">
                املأ البيانات أدناه لإضافة أو تعديل الخدمة
              </DialogDescription>
            </DialogHeader>

            {editingService && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-arabic">عنوان الخدمة بالعربية *</Label>
                    <Input
                      value={editingService.title_ar}
                      onChange={(e) => setEditingService({...editingService, title_ar: e.target.value})}
                      placeholder="اكتب عنوان الخدمة"
                      className="input-arabic"
                    />
                  </div>
                  <div>
                    <Label className="font-arabic">عنوان الخدمة بالإنجليزية</Label>
                    <Input
                      value={editingService.title_en || ''}
                      onChange={(e) => setEditingService({...editingService, title_en: e.target.value})}
                      placeholder="Enter service title"
                      className="input-arabic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-arabic">وصف الخدمة بالعربية *</Label>
                    <Textarea
                      value={editingService.description_ar}
                      onChange={(e) => setEditingService({...editingService, description_ar: e.target.value})}
                      placeholder="اكتب وصف الخدمة"
                      className="input-arabic min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label className="font-arabic">وصف الخدمة بالإنجليزية</Label>
                    <Textarea
                      value={editingService.description_en || ''}
                      onChange={(e) => setEditingService({...editingService, description_en: e.target.value})}
                      placeholder="Enter service description"
                      className="input-arabic min-h-[100px]"
                    />
                  </div>
                </div>

                <div>
                  <Label className="font-arabic">اسم الأيقونة (Lucide)</Label>
                  <Input
                    value={editingService.icon_name || ''}
                    onChange={(e) => setEditingService({...editingService, icon_name: e.target.value})}
                    placeholder="مثال: Settings, Users, Star"
                    className="input-arabic"
                  />
                </div>

                <div>
                  <Label className="font-arabic">صورة الخدمة</Label>
                  <div className="mt-2 space-y-4">
                    {editingService.image_url && (
                      <img
                        src={editingService.image_url}
                        alt="صورة الخدمة"
                        className="w-full max-w-sm h-32 object-cover rounded-lg"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const imageUrl = await handleImageUpload(file);
                          if (imageUrl) {
                            setEditingService({...editingService, image_url: imageUrl});
                          }
                        }
                      }}
                      className="block w-full text-sm text-muted-foreground file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="font-arabic"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={() => handleSave(editingService)}
                    disabled={saving === editingService.id || !editingService.title_ar || !editingService.description_ar}
                    className="btn-hero font-arabic"
                  >
                    {saving === editingService.id ? (
                      'جاري الحفظ...'
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ الخدمة
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="card-elegant group hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-arabic text-primary">
                    {service.title_ar}
                  </CardTitle>
                  {service.title_en && (
                    <CardDescription className="text-sm text-muted-foreground">
                      {service.title_en}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => openEditDialog(service)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(service.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {service.image_url && (
                <img
                  src={service.image_url}
                  alt={service.title_ar}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              <p className="text-sm text-muted-foreground font-arabic line-clamp-3">
                {service.description_ar}
              </p>
              {service.icon_name && (
                <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                  <Settings className="w-4 h-4" />
                  <span>{service.icon_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="card-elegant text-center py-12">
          <CardContent>
            <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="font-arabic text-muted-foreground mb-2">
              لا توجد خدمات حالياً
            </CardTitle>
            <CardDescription className="font-arabic mb-4">
              ابدأ بإضافة خدماتك الأولى
            </CardDescription>
            <Button onClick={() => openEditDialog()} className="btn-hero font-arabic">
              <Plus className="w-4 h-4 ml-2" />
              إضافة خدمة جديدة
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServicesManager;