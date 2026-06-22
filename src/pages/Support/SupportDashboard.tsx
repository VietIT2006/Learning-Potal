import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Send, User as UserIcon, MessageCircle, Trash2, Image as ImageIcon, Mail, Phone, Calendar, Wallet, BookOpen } from 'lucide-react';

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

interface ChatUser {
  id: number;
  full_name: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

function SupportDashboard() {
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [chatMode, setChatMode] = useState<'student' | 'admin'>('student');
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lấy danh sách những người đã nhắn tin
  const fetchChatUsers = async () => {
    try {
      // 1. Lấy tất cả tin nhắn
      const { data: msgs, error: msgsError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('is_internal', false)
        .order('created_at', { ascending: false });

      if (msgsError) throw msgsError;

      // 2. Gom nhóm theo user_id
      const usersMap = new Map<number, ChatUser>();
      
      msgs.forEach((msg) => {
        if (!usersMap.has(msg.user_id)) {
          usersMap.set(msg.user_id, {
            id: msg.user_id,
            full_name: 'Học viên #' + msg.user_id,
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: 0
          });
        }
        
        // Đếm tin nhắn chưa đọc (nếu gửi từ user, và chưa đọc)
        if (msg.sender_id === msg.user_id && !msg.is_read) {
          const u = usersMap.get(msg.user_id)!;
          u.unread_count += 1;
        }
      });

      // 3. Lấy thông tin user (tên, avatar) từ bảng users
      const userIds = Array.from(usersMap.keys());
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        if (!usersError && usersData) {
          usersData.forEach(u => {
            const mapUser = usersMap.get(u.id);
            if (mapUser) {
              mapUser.full_name = u.full_name;
              mapUser.avatar_url = u.avatar_url;
            }
          });
        }
      }

      setChatUsers(Array.from(usersMap.values()));
    } catch (err) {
      console.error("Lỗi lấy danh sách chat users:", err);
    }
  };

  // Lấy lịch sử tin nhắn của 1 user
  const fetchMessages = async (userId: number, isInternal: boolean) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('is_internal', isInternal)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Đánh dấu đã đọc
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('sender_id', userId)
        .eq('is_internal', isInternal);
        
      fetchChatUsers(); // Cập nhật lại số lượng chưa đọc bên list
    } catch (err) {
      console.error("Lỗi lấy tin nhắn:", err);
    }
  };

  const selectedUserIdRef = useRef(selectedUserId);
  const chatModeRef = useRef(chatMode);
  const userRef = useRef(user);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
    chatModeRef.current = chatMode;
    userRef.current = user;
  }, [selectedUserId, chatMode, user]);

  useEffect(() => {
    fetchChatUsers();

    // Subscribe Realtime
    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          const currentSelected = selectedUserIdRef.current;
          const currentMode = chatModeRef.current;
          const currentUser = userRef.current;

          if (currentMode === 'admin') {
            if (newMsg.is_internal && currentUser && newMsg.user_id === currentUser.id) {
               setMessages(prev => {
                 if (prev.some(m => m.id === newMsg.id)) return prev;
                 return [...prev, newMsg];
               });
               // Nếu admin gửi (sender_id khác user_id)
               if (newMsg.sender_id !== currentUser.id) {
                 supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id).then();
               }
            }
          } else {
            if (!newMsg.is_internal && currentSelected === newMsg.user_id) {
               setMessages(prev => {
                 if (prev.some(m => m.id === newMsg.id)) return prev;
                 return [...prev, newMsg];
               });
               // Nếu học viên gửi
               if (newMsg.sender_id === newMsg.user_id) {
                 supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id).then();
               }
            }
          }

          // Cập nhật lại list users
          fetchChatUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (chatMode === 'admin' && user) {
      fetchMessages(user.id, true);
    } else if (selectedUserId && chatMode === 'student') {
      fetchMessages(selectedUserId, false);
    } else {
      setMessages([]);
    }
  }, [selectedUserId, chatMode, user]);

  // Lấy thông tin học viên
  useEffect(() => {
    if (chatMode === 'student' && selectedUserId) {
      const fetchUserDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, full_name, email, phone, join_date, status, balance')
            .eq('id', selectedUserId)
            .single();
          if (error) throw error;
          
          const { count } = await supabase
            .from('user_courses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', selectedUserId);
            
          setSelectedUserDetails({ ...data, coursesEnrolled: count || 0 });
        } catch (err) {
          console.error("Lỗi lấy thông tin học viên:", err);
        }
      };
      fetchUserDetails();
    } else {
      setSelectedUserDetails(null);
    }
  }, [selectedUserId, chatMode]);

  const [isUploading, setIsUploading] = useState(false);

  // Xử lý upload ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (chatMode === 'student' && !selectedUserId) return;
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `chat_${chatMode === 'admin' ? 'admin' : selectedUserId}_${Date.now()}.${fileExt}`;
      
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
        user_id: chatMode === 'admin' ? user.id : selectedUserId,
        sender_id: user.id,
        message: 'Đã gửi một ảnh đính kèm',
        image_url: publicUrl,
        is_internal: chatMode === 'admin'
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
    if (!newMessage.trim() || !user || (chatMode === 'student' && !selectedUserId)) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase.from('chat_messages').insert([{
        user_id: chatMode === 'admin' ? user.id : selectedUserId,
        sender_id: user.id,
        message: msgText,
        is_internal: chatMode === 'admin'
      }]);

      if (error) {
        alert('Lỗi: ' + error.message);
        throw error;
      }
      // Realtime sẽ tự bắt sự kiện INSERT và cập nhật state
    } catch (err: any) {
      console.error("Lỗi gửi tin nhắn:", err);
      alert("Lỗi gửi tin nhắn: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleEndConversation = async () => {
    if (!selectedUserId) return;
    const confirm = window.confirm('Bạn có chắc muốn kết thúc cuộc trò chuyện này? Toàn bộ tin nhắn sẽ bị xóa vĩnh viễn khỏi hệ thống cho nhẹ Database.');
    if (!confirm) return;

    try {
      const { error } = await supabase.from('chat_messages').delete().eq('user_id', selectedUserId);
      if (error) throw error;
      
      setMessages([]);
      setSelectedUserId(null);
      alert('Đã xóa dữ liệu cuộc trò chuyện thành công!');
    } catch (err: any) {
      console.error("Lỗi kết thúc trò chuyện:", err);
      alert("Không thể kết thúc: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="flex h-full bg-[#0f172a] text-slate-200">
      {/* Sidebar danh sách user */}
      <div className="w-80 border-r border-slate-700/50 flex flex-col bg-[#1e293b]/50">
        <div className="p-4 border-b border-slate-800 bg-[#0f172a] flex flex-col gap-3">
          <div className="flex gap-2 bg-[#1e293b] p-1 rounded-lg">
            <button
              onClick={() => { setChatMode('student'); setSelectedUserId(null); }}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${chatMode === 'student' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Học viên
            </button>
            <button
              onClick={() => { setChatMode('admin'); setSelectedUserId(null); }}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${chatMode === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Trợ giúp Admin
            </button>
          </div>
          {chatMode === 'student' && (
            <p className="text-xs text-slate-400">Tin nhắn từ học viên cần hỗ trợ</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatMode === 'admin' ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Bạn đang ở kênh chat trực tiếp với Ban Quản Trị.
            </div>
          ) : (
            chatUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">Chưa có cuộc hội thoại nào.</div>
            ) : (
              chatUsers.map((u) => (
              <div 
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`flex items-center p-4 border-b border-slate-700/30 cursor-pointer transition-colors ${selectedUserId === u.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
              >
                <div className="relative">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                  {u.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#1e293b]">
                      {u.unread_count}
                    </span>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-white truncate">{u.full_name}</p>
                    <span className="text-[10px] text-slate-500">{new Date(u.last_message_time || '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className={`text-xs truncate ${u.unread_count > 0 ? 'text-white font-medium' : 'text-slate-400'}`}>
                    {u.last_message}
                  </p>
                </div>
              </div>
            ))
          ))}
        </div>
      </div>

      {/* Box Chat Content */}
      <div className="flex-1 flex bg-[#0f172a]">
        <div className={`flex-1 flex flex-col ${chatMode === 'student' && selectedUserDetails ? 'border-r border-slate-700/50' : ''}`}>
          {chatMode === 'admin' || selectedUserId ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-700/50 bg-[#1e293b]/50 flex justify-between items-center">
                <h3 className="font-semibold text-white">
                  {chatMode === 'admin' ? 'Ban Quản Trị (Admin)' : (chatUsers.find(u => u.id === selectedUserId)?.full_name || 'Học viên')}
                </h3>
                {chatMode === 'student' && (
                  <button 
                    onClick={handleEndConversation}
                    className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-red-500/20"
                    title="Kết thúc và xóa toàn bộ tin nhắn với người này"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Kết thúc
                  </button>
                )}
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                  const isSupport = msg.sender_id === user?.id; // Support là người gửi
                  return (
                    <div key={idx} className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isSupport ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                        {msg.image_url ? (
                          <div className="mb-2">
                            <img src={msg.image_url} alt="Chat attachment" className="rounded-lg max-w-full h-auto cursor-pointer" onClick={() => window.open(msg.image_url, '_blank')} />
                          </div>
                        ) : null}
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-[10px] mt-1 text-right ${isSupport ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                <div className="relative flex items-center">
                  <label className="absolute left-3 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors" title="Gửi ảnh">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    {isUploading ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <ImageIcon className="w-5 h-5" />}
                  </label>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn hỗ trợ..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-full pl-12 pr-12 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    disabled={isUploading}
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || isUploading}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Send className="w-4 h-4 -ml-0.5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Chọn một cuộc hội thoại để bắt đầu hỗ trợ</p>
              </div>
            </div>
          )}
        </div>

        {/* Thông tin học viên Sidebar */}
        {chatMode === 'student' && selectedUserDetails && (
          <div className="w-[320px] bg-[#0b1120] flex flex-col shrink-0 overflow-y-auto">
             <div className="p-6 border-b border-slate-800 flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
                  <UserIcon className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-lg text-white text-center">{selectedUserDetails.full_name || 'Học viên'}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full mt-2 font-medium ${selectedUserDetails.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {selectedUserDetails.status === 'active' ? 'Đang hoạt động' : 'Bị khóa'}
                </span>
             </div>
             <div className="p-6 space-y-5">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Thông tin liên hệ</h4>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Email</p>
                    <p className="text-sm text-slate-300 truncate w-48">{selectedUserDetails.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Số điện thoại</p>
                    <p className="text-sm text-slate-300">{selectedUserDetails.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="my-6 border-t border-slate-800"></div>
                
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tài khoản</h4>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Ngày tham gia</p>
                    <p className="text-sm text-slate-300">{selectedUserDetails.join_date ? new Date(selectedUserDetails.join_date).toLocaleDateString('vi-VN') : 'Không rõ'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Số dư ví</p>
                    <p className="text-sm font-semibold text-emerald-400">{selectedUserDetails.balance?.toLocaleString() || 0} đ</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Khóa học đã đăng ký</p>
                    <p className="text-sm text-slate-300">{selectedUserDetails.coursesEnrolled} khóa học</p>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupportDashboard;
