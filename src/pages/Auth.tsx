import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ArrowLeft, User, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.email || !form.password) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return false;
    }

    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        toast({
          title: "خطأ",
          description: "كلمات المرور غير متطابقة",
          variant: "destructive"
        });
        return false;
      }

      if (form.password.length < 6) {
        toast({
          title: "خطأ",
          description: "كلمة المرور يجب أن تكون على الأقل 6 أحرف",
          variant: "destructive"
        });
        return false;
      }

      if (!form.fullName.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال الاسم الكامل",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          }
          throw error;
        }

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة التحكم"
        });

        navigate('/dashboard');
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: form.fullName
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('المستخدم مسجل مسبقاً. يرجى تسجيل الدخول');
          }
          throw error;
        }

        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يرجى تأكيد بريدك الإلكتروني لإكمال التسجيل"
        });

        setIsLogin(true);
        setForm({ email: '', password: '', confirmPassword: '', fullName: '' });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: isLogin ? "خطأ في تسجيل الدخول" : "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6 text-primary hover:text-accent"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للرئيسية
        </Button>

        <Card className="card-elegant">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-primary font-arabic">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </CardTitle>
            
            <CardDescription className="font-arabic">
              {isLogin 
                ? 'مرحباً بعودتك! يرجى تسجيل الدخول لحسابك' 
                : 'أنشئ حساباً جديداً للوصول إلى لوحة التحكم'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-foreground font-medium mb-2 font-arabic">
                    الاسم الكامل *
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="اكتب اسمك الكامل"
                    className="input-arabic"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-foreground font-medium mb-2 font-arabic">
                  البريد الإلكتروني *
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="input-arabic pr-10"
                    required
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-foreground font-medium mb-2 font-arabic">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="كلمة المرور"
                    className="input-arabic pr-10 pl-10"
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-foreground font-medium mb-2 font-arabic">
                    تأكيد كلمة المرور *
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="أعد كتابة كلمة المرور"
                      className="input-arabic pr-10"
                      required={!isLogin}
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="btn-hero w-full"
              >
                {loading ? (
                  'جاري المعالجة...'
                ) : (
                  isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-foreground/70 font-arabic">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setForm({ email: '', password: '', confirmPassword: '', fullName: '' });
                  }}
                  className="mr-2 text-primary hover:text-accent font-medium transition-colors"
                >
                  {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;