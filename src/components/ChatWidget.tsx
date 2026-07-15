import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, X, Send, Image as ImageIcon } from 'lucide-react';

interface ChatMessage {
  id: number;
  user_id: number;
  sender_id: number;
  message: string;
  image_url?: string;
  is_internal?: boolean;
  is_read: boolean;
  created_at: string;
}

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Lấy lịch sử chat
  const fetchMessages = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Tính số tin nhắn chưa đọc (do support gửi)
      const unreads = data?.filter(m => m.sender_id !== user.id && !m.is_read).length || 0;
      setUnreadCount(unreads);
    } catch (err) {
      console.error("Lỗi lấy tin nhắn:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMessages();

      // Subscribe Realtime
      const channel = supabase
        .channel(`public:chat_messages:user_${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            if (newMsg.sender_id !== user.id) {
               setUnreadCount(prev => prev + 1);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, user]);

  // Đánh dấu đã đọc khi mở box chat
  useEffect(() => {
    if (isOpen && unreadCount > 0 && user) {
      supabase.from('chat_messages').update({ is_read: true }).eq('user_id', user.id).eq('sender_id', user.id).then(); // Wait, support sender id is NOT user.id. Actually we just update all unread for this user where sender_id != user.id
      supabase.from('chat_messages').update({ is_read: true }).eq('user_id', user.id).neq('sender_id', user.id).then();
      setUnreadCount(0);
    }

    // Top 1 System Message
    if (isOpen && user?.isTop1 && !sessionStorage.getItem('top1_chat_joined')) {
      sessionStorage.setItem('top1_chat_joined', 'true');
      supabase.from('chat_messages').insert([{
        user_id: user.id,
        sender_id: user.id,
        message: `👑 Đại gia ${user.fullname} vừa giáng lâm hệ thống! 👑`,
        is_internal: false
      }]).then();
    }
  }, [isOpen, unreadCount, user]);

  const [isUploading, setIsUploading] = useState(false);

  // Xử lý upload ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `chat_${user.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat_images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat_images')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // Lưu tin nhắn chứa ảnh
      const { error } = await supabase.from('chat_messages').insert([{
        user_id: user.id,
        sender_id: user.id,
        message: 'Đã gửi một ảnh đính kèm',
        image_url: publicUrl,
        is_internal: false
      }]);

      if (error) throw error;
      
    } catch (err: any) {
      console.error("Lỗi upload ảnh:", err);
      alert("Không thể gửi ảnh: " + err.message);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase.from('chat_messages').insert([{
        user_id: user.id,
        sender_id: user.id,
        message: msgText,
        is_internal: false
      }]);

      if (error) {
        alert('Lỗi: ' + error.message);
        throw error;
      }
      // Realtime tự render
    } catch (err: any) {
      console.error("Lỗi gửi tin nhắn:", err);
      alert("Lỗi gửi tin nhắn: " + (err.message || JSON.stringify(err)));
    }
  };

  if (!isAuthenticated || user?.role === 'support') return null;

  return (
    <>
      {/* Nút Floating */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#0f172a]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Khung Chat */}
      <div className={`fixed bottom-6 right-6 w-80 md:w-96 bg-[#1e293b] rounded-2xl shadow-2xl flex flex-col border border-slate-700/50 overflow-hidden transition-all duration-300 z-50 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: 'calc(100vh - 40px)' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2 text-white">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-semibold">Chat Hỗ Trợ</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f172a]/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <MessageCircle className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm text-center">Gửi tin nhắn để được hỗ trợ!<br/>Chúng tôi sẽ phản hồi sớm nhất.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender_id === user!.id;
              const isTop1Msg = isMe && user?.isTop1;
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${isMe ? (isTop1Msg ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#0f172a] shadow-[0_0_15px_rgba(250,204,21,0.4)] border border-yellow-300 rounded-br-none' : 'bg-purple-600 text-white rounded-br-none') : 'bg-slate-700 text-slate-200 rounded-bl-none'} ${msg.message.startsWith('🎁 LÌ XÌ KHỦNG') ? 'animate-bounce !bg-gradient-to-r !from-red-600 !to-red-500 !text-yellow-300 !border-2 !border-yellow-400 shadow-[0_0_20px_rgba(220,38,38,0.6)]' : ''}`}>
                    {msg.image_url ? (
                      <div className="mb-2">
                        <img src={msg.image_url} alt="Chat attachment" className="rounded-lg max-w-full h-auto cursor-pointer" onClick={() => window.open(msg.image_url, '_blank')} />
                      </div>
                    ) : null}
                    <p className={`text-sm ${isTop1Msg ? 'font-medium' : ''} ${msg.message.startsWith('🎁') ? 'text-center font-black text-lg drop-shadow-md' : ''}`}>
                      {msg.message}
                    </p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? (isTop1Msg ? 'text-yellow-900/70' : 'text-purple-200') : 'text-slate-400'} ${msg.message.startsWith('🎁') ? '!text-yellow-200/80' : ''}`}>
                      {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700/50 bg-[#1e293b]/50">
          <div className="relative flex items-center">
            <div className="absolute left-2 flex items-center gap-1 z-10 bg-[#1e293b]/80 pr-2">
              <label className="text-slate-400 hover:text-purple-400 cursor-pointer transition-colors p-1" title="Gửi ảnh">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                {isUploading ? <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> : <ImageIcon className="w-4 h-4" />}
              </label>

            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className={`w-full bg-slate-900/50 text-white placeholder-slate-400 text-sm rounded-full py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500 border border-slate-700 pl-10 pr-10`}
              disabled={isUploading}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isUploading}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
            >
              <Send className="w-4 h-4 -ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
