import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Send, User as UserIcon, MessageCircle, Image as ImageIcon, X } from 'lucide-react';

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

interface SupportUser {
  id: number;
  full_name: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

function AdminChatDashboard() {
  const { user } = useAuth();
  const [supportUsers, setSupportUsers] = useState<SupportUser[]>([]);
  const [selectedSupportId, setSelectedSupportId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSupport, setNewSupport] = useState({ full_name: '', email: '', password: '' });
  const [isCreating, setIsCreating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSupportUsers = async () => {
    try {
      const { data: msgs, error: msgsError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('is_internal', true)
        .order('created_at', { ascending: false });

      if (msgsError) throw msgsError;

      const usersMap = new Map<number, SupportUser>();
      
      msgs.forEach((msg) => {
        if (!usersMap.has(msg.user_id)) {
          usersMap.set(msg.user_id, {
            id: msg.user_id,
            full_name: 'Nhân viên #' + msg.user_id,
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: 0
          });
        }
        if (!msg.is_read && msg.sender_id !== user?.id) {
          usersMap.get(msg.user_id)!.unread_count += 1;
        }
      });

      const userIds = Array.from(usersMap.keys());
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', userIds);

        if (!usersError && usersData) {
          usersData.forEach(u => {
            if (usersMap.has(u.id)) {
              usersMap.get(u.id)!.full_name = u.full_name;
            }
          });
        }
      }

      const sortedUsers = Array.from(usersMap.values()).sort((a, b) => {
        return new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime();
      });

      setSupportUsers(sortedUsers);
    } catch (err) {
      console.error("Lỗi fetch Support Users:", err);
    }
  };

  const fetchMessages = async (supportId: number) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', supportId)
        .eq('is_internal', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('user_id', supportId)
        .eq('sender_id', supportId)
        .eq('is_internal', true);
        
      fetchSupportUsers();
    } catch (err) {
      console.error("Lỗi lấy tin nhắn:", err);
    }
  };

  const selectedSupportIdRef = useRef(selectedSupportId);
  const userRef = useRef(user);

  useEffect(() => {
    selectedSupportIdRef.current = selectedSupportId;
    userRef.current = user;
  }, [selectedSupportId, user]);

  useEffect(() => {
    fetchSupportUsers();

    const channel = supabase
      .channel('admin:chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: 'is_internal=eq.true' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          const currentSelected = selectedSupportIdRef.current;
          
          if (currentSelected === newMsg.user_id) {
             setMessages(prev => {
               if (prev.some(m => m.id === newMsg.id)) return prev;
               return [...prev, newMsg];
             });
             
             if (newMsg.sender_id === newMsg.user_id) {
               supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id).then();
             }
          }

          fetchSupportUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedSupportId) {
      fetchMessages(selectedSupportId);
    } else {
      setMessages([]);
    }
  }, [selectedSupportId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSupportId) return;
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `chat_internal_${selectedSupportId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('chat_images').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('chat_images').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const { error } = await supabase.from('chat_messages').insert([{
        user_id: selectedSupportId,
        sender_id: user.id,
        message: 'Đã gửi một ảnh đính kèm',
        image_url: publicUrl,
        is_internal: true
      }]);

      if (error) throw error;
    } catch (err: any) {
      alert("Không thể gửi ảnh: " + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedSupportId) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase.from('chat_messages').insert([{
        user_id: selectedSupportId,
        sender_id: user.id,
        message: msgText,
        is_internal: true
      }]);

      if (error) {
        alert('Lỗi: ' + error.message);
        throw error;
      }
    } catch (err: any) {
      alert("Lỗi gửi tin nhắn: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleCreateSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupport.full_name || !newSupport.email || !newSupport.password) return;
    
    try {
      setIsCreating(true);
      
      // Kiểm tra trùng email
      const { data: existing } = await supabase.from('users').select('id').eq('email', newSupport.email).maybeSingle();
      if (existing) {
        alert('Email này đã được sử dụng!');
        return;
      }

      // Lấy max id
      const { data: maxIdData } = await supabase.from('users').select('id').order('id', { ascending: false }).limit(1);
      const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;

      const newUser = {
        id: nextId,
        username: newSupport.email.split('@')[0],
        email: newSupport.email,
        password: newSupport.password,
        full_name: newSupport.full_name,
        role: 'support',
        status: 'active',
        join_date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase.from('users').insert([newUser]);
      if (error) throw error;
      
      alert('Tạo tài khoản Support thành công!');
      setShowCreateModal(false);
      setNewSupport({ full_name: '', email: '', password: '' });
      fetchSupportUsers(); // Refresh list
    } catch (err: any) {
      alert("Lỗi tạo tài khoản: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0f172a] text-slate-200 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm m-6">
      <div className="w-80 border-r border-slate-700/50 bg-[#1e293b]/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700/50 bg-[#1e293b]/50 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-white">Nội Bộ Hỗ Trợ</h2>
            <p className="text-xs text-slate-400 mt-1">Tin nhắn từ nhân viên</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center hover:bg-purple-500/30 transition-colors border border-purple-500/30"
            title="Tạo tài khoản Support"
          >
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {supportUsers.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">Chưa có liên hệ nội bộ nào.</div>
          ) : (
            supportUsers.map((u) => (
              <div 
                key={u.id}
                onClick={() => setSelectedSupportId(u.id)}
                className={`flex items-start p-4 cursor-pointer transition-colors border-b border-slate-700/30 ${selectedSupportId === u.id ? 'bg-slate-800 border-l-4 border-l-purple-500' : 'border-l-4 border-l-transparent hover:bg-slate-800/50'}`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                    <UserIcon className="w-5 h-5" />
                  </div>
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
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0f172a]">
        {selectedSupportId ? (
          <>
            <div className="p-4 border-b border-slate-700/50 bg-[#1e293b]/50 flex justify-between items-center">
              <h3 className="font-semibold text-white">
                {supportUsers.find(u => u.id === selectedSupportId)?.full_name || 'Nhân viên'}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isAdmin = msg.sender_id === user?.id;
                return (
                  <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isAdmin ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                      {msg.image_url ? (
                        <div className="mb-2">
                          <img src={msg.image_url} alt="Chat attachment" className="rounded-lg max-w-full h-auto cursor-pointer" onClick={() => window.open(msg.image_url, '_blank')} />
                        </div>
                      ) : null}
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-purple-200' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
              <div className="relative flex items-center">
                <label className="absolute left-3 text-slate-400 hover:text-purple-400 cursor-pointer transition-colors" title="Gửi ảnh">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  {isUploading ? <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> : <ImageIcon className="w-5 h-5" />}
                </label>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhắn tin với nhân viên hỗ trợ..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-full pl-12 pr-12 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={isUploading}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || isUploading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors"
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
              <p>Chọn một nhân viên để trao đổi nội bộ</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tạo Tài Khoản Support */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-[#0f172a]">
              <h3 className="font-semibold text-white">Tạo tài khoản Support</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSupport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Họ tên Nhân viên</label>
                <input required type="text" value={newSupport.full_name} onChange={e => setNewSupport({...newSupport, full_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Nguyễn Văn Support" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input required type="email" value={newSupport.email} onChange={e => setNewSupport({...newSupport, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="support1@edu.vn" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu</label>
                <input required type="password" value={newSupport.password} onChange={e => setNewSupport({...newSupport, password: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="••••••••" />
              </div>
              <button disabled={isCreating} type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-4 shadow-lg shadow-purple-500/20">
                {isCreating ? 'Đang tạo...' : 'Tạo tài khoản ngay'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminChatDashboard;
