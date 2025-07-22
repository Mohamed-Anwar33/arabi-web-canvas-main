import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  title_ar?: string;
  image_url: string;
  thumbnail_url?: string;
  alt_text_ar?: string;
  sort_order: number;
}

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [visibleImages, setVisibleImages] = useState(8);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching gallery images:", error);
      } else {
        setImages(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % displayImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(
        (selectedImage - 1 + displayImages.length) % displayImages.length
      );
    }
  };

  // Placeholder images for demonstration
  const placeholderImages = [
    {
      id: "1",
      title_ar: "مشروع التسويق الرقمي",
      image_url:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      alt_text_ar: "مشروع تسويق رقمي",
      sort_order: 1,
    },
    {
      id: "2",
      title_ar: "تصميم الهوية البصرية",
      image_url:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
      alt_text_ar: "تصميم هوية بصرية",
      sort_order: 2,
    },
    {
      id: "3",
      title_ar: "حملة إعلانية",
      image_url:
        "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop",
      alt_text_ar: "حملة إعلانية ناجحة",
      sort_order: 3,
    },
    {
      id: "4",
      title_ar: "إنتاج المحتوى",
      image_url:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
      alt_text_ar: "إنتاج محتوى إبداعي",
      sort_order: 4,
    },
    {
      id: "5",
      title_ar: "التصوير الاحترافي",
      image_url:
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop",
      alt_text_ar: "تصوير احترافي",
      sort_order: 5,
    },
    {
      id: "6",
      title_ar: "وسائل التواصل الاجتماعي",
      image_url:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
      alt_text_ar: "إدارة وسائل التواصل",
      sort_order: 6,
    },
  ];

  const displayImages = images.length > 0 ? images : placeholderImages;
  const imagesToShow = displayImages.slice(0, visibleImages);

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="aspect-square bg-muted rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-muted/30" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-section-title text-primary mb-6 animate-fade-in-up font-arabic">
              معرض أعمالنا
            </h2>

            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>

            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto animate-slide-in-right font-arabic">
              اطلع على مجموعة من أفضل مشاريعنا وأعمالنا المتميزة في مختلف
              المجالات
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {imagesToShow.map((image, index) => (
              <div
                key={image.id}
                className="group cursor-pointer overflow-hidden rounded-xl aspect-square bg-gradient-to-br from-primary/10 to-accent/10 relative animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image.thumbnail_url || image.image_url}
                  alt={image.alt_text_ar || image.title_ar || "صورة من المعرض"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 right-4 left-4">
                    <h3 className="text-primary-foreground font-semibold font-arabic text-sm">
                      {image.title_ar}
                    </h3>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 ring-2 ring-primary/0 group-hover:ring-primary/30 transition-all duration-300 rounded-xl"></div>
              </div>
            ))}
          </div>

          {/* Lightbox Dialog */}
          <Dialog
            open={selectedImage !== null}
            onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}
          >
            <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0">
              {selectedImage !== null && (
                <div className="relative">
                  <img
                    src={displayImages[selectedImage].image_url}
                    alt={
                      displayImages[selectedImage].alt_text_ar ||
                      displayImages[selectedImage].title_ar ||
                      "صورة من المعرض"
                    }
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  />

                  {/* Navigation Buttons */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Image Info */}
                  {displayImages[selectedImage].title_ar && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-6 rounded-b-lg">
                      <h3 className="text-primary-foreground text-xl font-semibold font-arabic">
                        {displayImages[selectedImage].title_ar}
                      </h3>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* View More Button */}
          {visibleImages < displayImages.length && (
            <div className="text-center mt-12">
              <button
                className="btn-secondary"
                onClick={() => setVisibleImages(displayImages.length)}
              >
                عرض المزيد من الأعمال
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
