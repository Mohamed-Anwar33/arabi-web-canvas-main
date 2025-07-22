import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { href: "#hero", label: "الرئيسية" },
    { href: "#about", label: "من نحن" },
    { href: "#services", label: "خدماتنا" },
    { href: "#gallery", label: "معرض أعمالنا" },
    { href: "#contact", label: "تواصل معنا" },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-card"
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl font-arabic">
                ت
              </span>
            </div>
            <span className="text-xl font-bold text-primary font-arabic">
              شركة التسويق
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-foreground hover:text-primary transition-colors font-medium font-arabic relative group"
              >
                {item.label}
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          {/* تم إخفاء أزرار تسجيل الدخول ولوحة التحكم لأسباب أمنية */}
          {/* <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {user ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary"
                >
                  <User className="w-4 h-4 ml-2" />
                  لوحة التحكم
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="btn-hero"
              >
                <User className="w-4 h-4 ml-2" />
                تسجيل الدخول
              </Button>
            )}
          </div> */}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 bg-background/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-right text-foreground hover:text-primary transition-colors font-medium font-arabic py-2"
                >
                  {item.label}
                </button>
              ))}
              {/* تم إخفاء أزرار تسجيل الدخول ولوحة التحكم من القائمة الجوالة */}
              {/* <div className="pt-4 border-t border-border/50">
                {user ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="w-full btn-secondary"
                    >
                      <User className="w-4 h-4 ml-2" />
                      لوحة التحكم
                    </Button>
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                    className="w-full btn-hero"
                  >
                    <User className="w-4 h-4 ml-2" />
                    تسجيل الدخول
                  </Button>
                )}
              </div> */}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
