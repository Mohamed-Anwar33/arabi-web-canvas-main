import { useState, useEffect } from "react";
import {
  Share2,
  Target,
  Palette,
  Video,
  Camera,
  TrendingUp,
  Monitor,
  Globe,
  Smartphone,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  title_ar: string;
  description_ar: string;
  icon_name: string;
  image_url?: string;
  sort_order: number;
}

const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching services:", error);
      } else {
        setServices(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping
  const iconMap: Record<string, any> = {
    Share2,
    Target,
    Palette,
    Video,
    Camera,
    TrendingUp,
    Monitor,
    Globe,
    Smartphone,
    BarChart3,
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Target;
    return IconComponent;
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card-elegant animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-lg mb-6"></div>
                <div className="h-6 bg-muted rounded mb-4"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-background" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-section-title text-primary mb-6 animate-fade-in-up font-arabic">
              خدماتنا
            </h2>

            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>

            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto animate-slide-in-right font-arabic">
              نقدم مجموعة شاملة من الخدمات التسويقية المتطورة لتلبية جميع
              احتياجات عملائنا
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = getIcon(service.icon_name);

              return (
                <div
                  key={service.id}
                  className="card-service group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Service Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-card">
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>

                  {/* Service Content */}
                  <h3 className="text-card-title text-primary mb-4 font-arabic group-hover:text-accent transition-colors">
                    {service.title_ar}
                  </h3>

                  <p className="text-foreground/70 leading-relaxed font-arabic mb-6">
                    {service.description_ar}
                  </p>

                  {/* Learn More Link */}
                  <div className="mt-auto">
                    <button className="text-primary hover:text-accent transition-colors font-medium font-arabic group-hover:translate-x-1 transform transition-transform duration-300">
                      اعرف المزيد ←
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="card-elegant max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <h3 className="text-2xl font-bold text-primary mb-4 font-arabic">
                مستعد لبدء مشروعك؟
              </h3>

              <p className="text-foreground/80 mb-6 font-arabic">
                تواصل معنا الآن للحصول على استشارة مجانية وخطة تسويقية مخصصة
                لعملك
              </p>

              <button
                className="btn-hero"
                onClick={() => scrollToSection("contact")}
              >
                احصل على استشارة مجانية
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
