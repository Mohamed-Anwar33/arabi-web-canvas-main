import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Upload, FileText } from 'lucide-react';

interface SiteContent {
  id: string;
  section: string;
  title_ar?: string;
  title_en?: string;
  content_ar?: string;
  content_en?: string;
  image_url?: string;
}

const SiteContentManager = () => {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section');

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "خطأ في جلب المحتوى",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: SiteContent) => {
    setSaving(content.id);
    try {
      const { error } = await supabase
        .from('site_content')
        .update({
          title_ar: content.title_ar,
          title_en: content.title_en,
          content_ar: content.content_ar,
          content_en: content.content_en,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث المحتوى بنجاح"
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "خطأ في الحفظ",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const handleImageUpload = async (contentId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${contentId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('site_content')
        .update({ image_url: data.publicUrl })
        .eq('id', contentId);

      if (updateError) throw updateError;

      setContents(prev => 
        prev.map(c => 
          c.id === contentId 
            ? { ...c, image_url: data.publicUrl }
            : c
        )
      );

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم تحديث صورة القسم"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ في رفع الصورة",
        variant: "destructive"
      });
    }
  };

  const updateContent = (id: string, field: keyof SiteContent, value: string) => {
    setContents(prev => 
      prev.map(content => 
        content.id === id 
          ? { ...content, [field]: value }
          : content
      )
    );
  };

  const getSectionName = (section: string) => {
    const names: { [key: string]: string } = {
      hero: 'القسم الرئيسي (Hero)',
      about: 'قسم من نحن',
      contact: 'قسم التواصل',
      footer: 'تذييل الموقع'
    };
    return names[section] || section;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="card-elegant mb-4">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2 font-arabic">إدارة محتوى الموقع</h2>
        <p className="text-muted-foreground font-arabic">قم بتحرير وتحديث نصوص وصور الموقع</p>
      </div>

      <div className="grid gap-6">
        {contents.map((content) => (
          <Card key={content.id} className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-arabic">
                <FileText className="w-5 h-5" />
                {getSectionName(content.section)}
              </CardTitle>
              <CardDescription className="font-arabic">
                تحرير محتوى قسم {getSectionName(content.section)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`title-${content.id}`} className="font-arabic">العنوان بالعربية</Label>
                  <Input
                    id={`title-${content.id}`}
                    value={content.title_ar || ''}
                    onChange={(e) => updateContent(content.id, 'title_ar', e.target.value)}
                    placeholder="اكتب العنوان بالعربية"
                    className="input-arabic"
                  />
                </div>

                <div>
                  <Label htmlFor={`title-en-${content.id}`} className="font-arabic">العنوان بالإنجليزية</Label>
                  <Input
                    id={`title-en-${content.id}`}
                    value={content.title_en || ''}
                    onChange={(e) => updateContent(content.id, 'title_en', e.target.value)}
                    placeholder="Enter English title"
                    className="input-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`content-${content.id}`} className="font-arabic">المحتوى بالعربية</Label>
                  <Textarea
                    id={`content-${content.id}`}
                    value={content.content_ar || ''}
                    onChange={(e) => updateContent(content.id, 'content_ar', e.target.value)}
                    placeholder="اكتب المحتوى بالعربية"
                    className="input-arabic min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor={`content-en-${content.id}`} className="font-arabic">المحتوى بالإنجليزية</Label>
                  <Textarea
                    id={`content-en-${content.id}`}
                    value={content.content_en || ''}
                    onChange={(e) => updateContent(content.id, 'content_en', e.target.value)}
                    placeholder="Enter English content"
                    className="input-arabic min-h-[120px]"
                  />
                </div>
              </div>

              <div>
                <Label className="font-arabic">صورة القسم</Label>
                <div className="mt-2 space-y-4">
                  {content.image_url && (
                    <div className="relative">
                      <img
                        src={content.image_url}
                        alt="صورة القسم"
                        className="w-full max-w-md h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(content.id, file);
                      }
                    }}
                    className="hidden"
                    id={`image-upload-${content.id}`}
                  />
                  <Button
                    onClick={() => document.getElementById(`image-upload-${content.id}`)?.click()}
                    variant="outline"
                    className="font-arabic"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    {content.image_url ? 'تغيير الصورة' : 'رفع صورة'}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave(content)}
                  disabled={saving === content.id}
                  className="btn-hero font-arabic"
                >
                  {saving === content.id ? (
                    'جاري الحفظ...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SiteContentManager;