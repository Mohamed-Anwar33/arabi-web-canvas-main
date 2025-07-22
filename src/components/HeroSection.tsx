import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroContent {
  title_ar: string;
  content_ar: string;
  image_url?: string;
}

const HeroSection = () => {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("section", "hero")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching hero content:", error);
      } else {
        setHeroContent(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const backgroundImage = heroContent?.image_url || heroBg;

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-primary to-accent">
        <div className="animate-pulse text-primary-foreground text-xl">
          جاري التحميل...
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: "var(--gradient-hero)" }}
      />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-hero text-primary-foreground mb-6 animate-fade-in-up font-arabic">
          {heroContent?.title_ar || "مرحباً بكم في شركتنا للتسويق"}
        </h1>

        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 leading-relaxed animate-slide-in-right font-arabic max-w-3xl mx-auto">
          {heroContent?.content_ar ||
            "نحن نقدم أفضل خدمات التسويق الرقمي والإبداعي لتنمية أعمالكم وتحقيق أهدافكم التجارية"}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-scale-in">
          <Button
            className="btn-hero group"
            onClick={() => scrollToSection("contact")}
          >
            ابدأ مشروعك معنا
            <ChevronLeft className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            className="btn-secondary border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            onClick={() => scrollToSection("services")}
          >
            تعرف على خدماتنا
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
