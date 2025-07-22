import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Trash2, Image, Plus, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GalleryImage {
  id: string;
  title_ar?: string;
  title_en?: string;
  image_url: string;
  thumbnail_url?: string;
  alt_text_ar?: string;
  sort_order: number;
  is_active: boolean;
}

const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "خطأ في جلب الصور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const uploadedImages = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "خطأ في نوع الملف",
            description: `الملف ${file.name} ليس صورة صالحة`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "حجم الملف كبير",
            description: `الصورة ${file.name} حجمها أكبر من 5 ميجابايت`,
            variant: "destructive"
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `gallery-${Date.now()}-${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('site-images')
          .getPublicUrl(fileName);

        // Add to database
        const { data: insertData, error: insertError } = await supabase
          .from('gallery_images')
          .insert({
            title_ar: file.name.split('.')[0],
            image_url: data.publicUrl,
            thumbnail_url: data.publicUrl,
            sort_order: images.length + uploadedImages.length + 1,
            is_active: true
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          continue;
        }

        uploadedImages.push(insertData);
      }

      if (uploadedImages.length > 0) {
        toast({
          title: "تم رفع الصور بنجاح",
          description: `تم رفع ${uploadedImages.length} صورة بنجاح`
        });
        await fetchImages();
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "خطأ في رفع الصور",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Delete from storage
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('site-images')
          .remove([fileName]);
      }

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الصورة بنجاح"
      });

      await fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "خطأ في الحذف",
        variant: "destructive"
      });
    }
  };

  const updateImageTitle = async (imageId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ title_ar: title, updated_at: new Date().toISOString() })
        .eq('id', imageId);

      if (error) throw error;

      setImages(prev => 
        prev.map(img => 
          img.id === imageId ? { ...img, title_ar: title } : img
        )
      );

      toast({
        title: "تم التحديث",
        description: "تم تحديث عنوان الصورة"
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "خطأ في التحديث",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg"></div>
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
          <h2 className="text-3xl font-bold text-primary mb-2 font-arabic">معرض الصور</h2>
          <p className="text-muted-foreground font-arabic">ارفع وأدر صور المعرض</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleImageUpload(e.target.files);
              }
            }}
            className="hidden"
            id="image-upload"
          />
          <Button
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading}
            className="btn-hero font-arabic"
          >
            {uploading ? (
              'جاري الرفع...'
            ) : (
              <>
                <Upload className="w-4 h-4 ml-2" />
                رفع صور جديدة
              </>
            )}
          </Button>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="card-elegant group overflow-hidden hover:shadow-glow transition-all duration-300">
              <div className="relative aspect-square">
                <img
                  src={image.image_url}
                  alt={image.title_ar || 'صورة المعرض'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPreviewImage(image)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="font-arabic">
                          {image.title_ar || 'صورة المعرض'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <img
                          src={image.image_url}
                          alt={image.title_ar || 'صورة المعرض'}
                          className="w-full max-h-[70vh] object-contain rounded-lg"
                        />
                        <div>
                          <Label className="font-arabic">عنوان الصورة</Label>
                          <Input
                            value={image.title_ar || ''}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setImages(prev => 
                                prev.map(img => 
                                  img.id === image.id ? { ...img, title_ar: newTitle } : img
                                )
                              );
                            }}
                            onBlur={(e) => updateImageTitle(image.id, e.target.value)}
                            placeholder="أدخل عنوان الصورة"
                            className="input-arabic"
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id, image.image_url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                <Input
                  value={image.title_ar || ''}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setImages(prev => 
                      prev.map(img => 
                        img.id === image.id ? { ...img, title_ar: newTitle } : img
                      )
                    );
                  }}
                  onBlur={(e) => updateImageTitle(image.id, e.target.value)}
                  placeholder="عنوان الصورة"
                  className="input-arabic text-sm h-8"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-elegant text-center py-16">
          <CardContent>
            <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="font-arabic text-muted-foreground mb-2">
              لا توجد صور في المعرض
            </CardTitle>
            <CardDescription className="font-arabic mb-6">
              ابدأ برفع صورك الأولى للمعرض
            </CardDescription>
            <Button
              onClick={() => document.getElementById('image-upload')?.click()}
              className="btn-hero font-arabic"
            >
              <Upload className="w-4 h-4 ml-2" />
              رفع صور جديدة
            </Button>
          </CardContent>
        </Card>
      )}

      {uploading && (
        <Card className="card-elegant">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground font-arabic">جاري رفع الصور...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GalleryManager;