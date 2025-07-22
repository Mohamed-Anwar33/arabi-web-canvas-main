import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Trash2, Mail, Phone, User, Calendar, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ContactManager = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "خطأ في جلب الرسائل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );

      toast({
        title: "تم تحديد الرسالة كمقروءة",
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({
        title: "خطأ في تحديث الرسالة",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      toast({
        title: "تم حذف الرسالة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "خطأ في حذف الرسالة",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="card-elegant mb-4">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2 font-arabic">رسائل التواصل</h2>
          <p className="text-muted-foreground font-arabic">
            إجمالي الرسائل: {messages.length}
            {unreadCount > 0 && (
              <span className="text-primary"> • {unreadCount} رسالة غير مقروءة</span>
            )}
          </p>
        </div>
        <Button 
          onClick={fetchMessages}
          variant="outline" 
          className="font-arabic"
        >
          تحديث
        </Button>
      </div>

      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={`card-elegant transition-all duration-200 ${!message.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg font-arabic flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        {message.name}
                      </CardTitle>
                      {!message.is_read && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          جديد
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {message.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${message.email}`} className="hover:text-primary transition-colors">
                            {message.email}
                          </a>
                        </div>
                      )}
                      {message.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${message.phone}`} className="hover:text-primary transition-colors">
                            {message.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(message.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setSelectedMessage(message);
                            if (!message.is_read) {
                              markAsRead(message.id);
                            }
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl" dir="rtl">
                        <DialogHeader>
                          <DialogTitle className="font-arabic flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            رسالة من {message.name}
                          </DialogTitle>
                          <DialogDescription className="font-arabic">
                            تم الإرسال في {formatDate(message.created_at)}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {message.email && (
                              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                                <Mail className="w-5 h-5 text-primary" />
                                <div>
                                  <div className="text-xs text-muted-foreground font-arabic">البريد الإلكتروني</div>
                                  <a href={`mailto:${message.email}`} className="text-sm hover:text-primary transition-colors">
                                    {message.email}
                                  </a>
                                </div>
                              </div>
                            )}
                            
                            {message.phone && (
                              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                                <Phone className="w-5 h-5 text-primary" />
                                <div>
                                  <div className="text-xs text-muted-foreground font-arabic">رقم الهاتف</div>
                                  <a href={`tel:${message.phone}`} className="text-sm hover:text-primary transition-colors">
                                    {message.phone}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm font-semibold text-primary font-arabic">نص الرسالة:</Label>
                            <div className="mt-2 p-4 bg-muted/20 rounded-lg border-r-4 border-primary">
                              <p className="text-sm leading-relaxed font-arabic whitespace-pre-wrap">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => deleteMessage(message.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground font-arabic line-clamp-2">
                  {message.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-elegant text-center py-16">
          <CardContent>
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="font-arabic text-muted-foreground mb-2">
              لا توجد رسائل حالياً
            </CardTitle>
            <CardDescription className="font-arabic">
              ستظهر رسائل العملاء هنا عند وصولها
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export default ContactManager;