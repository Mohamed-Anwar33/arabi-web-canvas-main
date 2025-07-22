import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  message: string;
}

const ContactSection = () => {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.message) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "تم الإرسال بنجاح",
        description: "شكراً لتواصلكم معنا. سنقوم بالرد عليكم في أقرب وقت ممكن"
      });

      // Reset form
      setForm({
        name: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'الهاتف',
      details: ['+966 50 123 4567', '+966 11 234 5678'],
      color: 'text-primary'
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      details: ['info@marketingco.com', 'sales@marketingco.com'],
      color: 'text-secondary'
    },
    {
      icon: MapPin,
      title: 'العنوان',
      details: ['الرياض، حي العليا', 'طريق الملك فهد'],
      color: 'text-accent'
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      details: ['الأحد - الخميس: 9 صباحاً - 6 مساءً', 'الجمعة - السبت: مغلق'],
      color: 'text-primary'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-section-title text-primary mb-6 animate-fade-in-up font-arabic">
              تواصل معنا
            </h2>
            
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>
            
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto animate-slide-in-right font-arabic">
              نحن هنا لمساعدتك في تحقيق أهدافك التسويقية. تواصل معنا الآن للحصول على استشارة مجانية
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card-elegant">
              <h3 className="text-2xl font-bold text-primary mb-6 font-arabic">
                أرسل لنا رسالة
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-foreground font-medium mb-2 font-arabic">
                    الاسم *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="اكتب اسمك الكامل"
                    className="input-arabic"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-foreground font-medium mb-2 font-arabic">
                      رقم الهاتف
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="+966 50 123 4567"
                      className="input-arabic"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-foreground font-medium mb-2 font-arabic">
                      البريد الإلكتروني
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      className="input-arabic"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-foreground font-medium mb-2 font-arabic">
                    الرسالة *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleInputChange}
                    placeholder="اكتب رسالتك هنا..."
                    className="input-arabic min-h-32 resize-none"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-hero w-full group"
                >
                  {isSubmitting ? (
                    'جاري الإرسال...'
                  ) : (
                    <>
                      إرسال الرسالة
                      <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary mb-8 font-arabic">
                معلومات التواصل
              </h3>

              {contactInfo.map((info, index) => (
                <div 
                  key={index}
                  className="card-elegant group hover:shadow-card-hover transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <info.icon className={`w-6 h-6 ${info.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-primary mb-3 font-arabic">
                        {info.title}
                      </h4>
                      
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-foreground/70 font-arabic leading-relaxed">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Contact CTA */}
              <div className="card-elegant bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <h4 className="text-xl font-bold text-primary mb-4 font-arabic">
                  تحتاج مساعدة فورية؟
                </h4>
                
                <p className="text-foreground/80 mb-6 font-arabic">
                  اتصل بنا مباشرة أو أرسل رسالة واتساب للحصول على رد سريع
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="btn-secondary flex-1">
                    اتصل الآن
                  </Button>
                  <Button variant="outline" className="flex-1">
                    واتساب
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;