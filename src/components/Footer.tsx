import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'فيسبوك' },
    { icon: Twitter, href: '#', label: 'تويتر' },
    { icon: Instagram, href: '#', label: 'إنستغرام' },
    { icon: Linkedin, href: '#', label: 'لينكدإن' }
  ];

  const quickLinks = [
    { label: 'الرئيسية', href: '#hero' },
    { label: 'من نحن', href: '#about' },
    { label: 'خدماتنا', href: '#services' },
    { label: 'معرض أعمالنا', href: '#gallery' },
    { label: 'تواصل معنا', href: '#contact' }
  ];

  const services = [
    'إدارة وسائل التواصل الاجتماعي',
    'التسويق الرقمي',
    'تصميم الهوية البصرية',
    'إنتاج المحتوى المرئي',
    'التصوير الفوتوغرافي',
    'الاستشارات التسويقية'
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground" dir="rtl">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-2xl font-arabic">ت</span>
              </div>
              <span className="text-2xl font-bold font-arabic">شركة التسويق</span>
            </div>
            
            <p className="text-primary-foreground/80 leading-relaxed font-arabic">
              شركة رائدة في مجال التسويق الرقمي نساعد الشركات على النمو والتطور من خلال استراتيجيات مبتكرة وفعالة.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 space-x-reverse">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-primary-foreground/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-arabic">روابط سريعة</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors font-arabic block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-arabic">خدماتنا</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-primary-foreground/80 font-arabic text-sm leading-relaxed">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-arabic">معلومات التواصل</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-primary-foreground/80 font-arabic">+966 50 123 4567</span>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-primary-foreground/80 font-arabic">info@marketingco.com</span>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center mt-1">
                  <MapPin className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-primary-foreground/80 font-arabic leading-relaxed">
                  الرياض، حي العليا<br />
                  طريق الملك فهد
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-foreground/60 text-center md:text-right font-arabic">
              © {currentYear} شركة التسويق. جميع الحقوق محفوظة.
            </p>
            
            <div className="flex space-x-6 space-x-reverse">
              <a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors font-arabic">
                سياسة الخصوصية
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-secondary transition-colors font-arabic">
                شروط الاستخدام
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;