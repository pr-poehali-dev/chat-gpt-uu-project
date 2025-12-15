import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я дружелюбный помощник. Чем могу помочь?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/aa361d45-ee1f-4e06-a227-ebf3dd4c60e1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте позже.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Привет! Я дружелюбный помощник. Чем могу помочь?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
        <CardHeader className="border-b bg-gradient-to-r from-primary to-secondary text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon name="Bot" size={28} />
              </div>
              <div>
                <CardTitle className="text-2xl">ИИ Помощник</CardTitle>
                <CardDescription className="text-white/80">
                  Задавайте любые вопросы
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={clearChat}
              className="text-white hover:bg-white/20"
            >
              <Icon name="RotateCcw" size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea ref={scrollRef} className="h-full p-6">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 animate-fade-in ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className={`${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-primary to-secondary' 
                      : 'bg-gradient-to-br from-accent to-orange-400'
                  }`}>
                    <AvatarFallback className="text-white">
                      {message.role === 'assistant' ? (
                        <Icon name="Bot" size={20} />
                      ) : (
                        <Icon name="User" size={20} />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`flex-1 max-w-[75%] ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-secondary text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                      {message.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 animate-fade-in">
                  <Avatar className="bg-gradient-to-br from-primary to-secondary">
                    <AvatarFallback className="text-white">
                      <Icon name="Bot" size={20} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <div className="p-6 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              disabled={isLoading}
              className="flex-1 text-base"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              size="lg"
              className="px-6"
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <Icon name="Send" size={20} />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Нажмите Enter для отправки
          </p>
        </div>
      </Card>
    </div>
  );
}