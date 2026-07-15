import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { createForumPost } from '../lib/supabaseService';
import { MessageSquare, Gift, Plus, Search, Star, Clock, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { FullScreenLoader } from '../components/LoadingSpinner';
import { checkToxicity } from '../lib/aiModeration';

export default function ForumPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isGiveaway, setIsGiveaway] = useState(false);
  const [giveawayType, setGiveawayType] = useState<'fixed' | 'random'>('fixed');
  const [giveawayTotal, setGiveawayTotal] = useState('');
  const [giveawayFixedAmount, setGiveawayFixedAmount] = useState('');
  const [giveawayRandomMin, setGiveawayRandomMin] = useState('');
  const [giveawayRandomMax, setGiveawayRandomMax] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          users!author_id(username, full_name, avatar_url, role)
        `)
        .is('parent_id', null)
        .order('is_giveaway', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = data?.map(d => {
        // Handle array or object from users join
        const uArray = d.users;
        const u = Array.isArray(uArray) ? uArray[0] : uArray;
        return {
          ...d,
          author: {
            fullname: u?.full_name || u?.fullname || 'Ẩn danh',
            avatar_url: u?.avatar_url || u?.avatarUrl,
            isTop1: u?.role === 'admin' // Or whatever logic decides Top 1, in our system isTop1 is mapped in user context usually. We'll use a placeholder or assume we have it. Let's not use it in Forum.tsx list yet if not needed.
          }
        }
      });
      
      setPosts(formatted || []);
    } catch (err: any) {
      toast.error('Lỗi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Vui lòng đăng nhập!');
    if (!title.trim() || !content.trim()) return toast.error('Nhập đầy đủ tiêu đề và nội dung!');
    
    setIsSubmitting(true);
    
    // AI Moderation
    const isTitleToxic = await checkToxicity(title);
    const isContentToxic = await checkToxicity(content);
    
    if (isTitleToxic || isContentToxic) {
      setIsSubmitting(false);
      return toast.error('AI phát hiện ngôn từ thô tục hoặc xúc phạm trong bài viết. Vui lòng sửa lại!');
    }
    
    try {
      await createForumPost(
        user!.id,
        title,
        content,
        isGiveaway,
        isGiveaway ? giveawayType : null,
        isGiveaway ? Number(giveawayTotal) : 0,
        isGiveaway ? Number(giveawayFixedAmount) : 0,
        isGiveaway ? Number(giveawayRandomMin) : 0,
        isGiveaway ? Number(giveawayRandomMax) : 0
      );
      toast.success('Đăng bài thành công!');
      setIsModalOpen(false);
      resetForm();
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setContent(''); setIsGiveaway(false);
    setGiveawayTotal(''); setGiveawayFixedAmount(''); setGiveawayRandomMin(''); setGiveawayRandomMax('');
  };

  if (loading) return <FullScreenLoader message="Đang tải Diễn Đàn..." />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-4 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 mb-2">
              Diễn Đàn Thảo Luận
            </h1>
            <p className="text-slate-400">Nơi giao lưu, chia sẻ kiến thức và nhận quà khủng!</p>
          </div>
          {isAuthenticated && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" /> Tạo bài viết
            </button>
          )}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-white/5 rounded-2xl border border-white/10">
              Chưa có bài viết nào. Hãy là người đầu tiên!
            </div>
          ) : (
            posts.map(post => (
              <Link to={`/forum/${post.id}`} key={post.id} className={`block p-6 rounded-2xl border backdrop-blur-md transition-all hover:scale-[1.01] shadow-lg ${post.is_giveaway ? 'bg-gradient-to-r from-yellow-900/30 to-red-900/30 border-yellow-500/50 hover:border-yellow-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <div className="flex items-start gap-4">
                  <img src={post.author?.avatar_url || 'https://via.placeholder.com/50'} className={`w-12 h-12 rounded-full object-cover border-2 ${post.is_giveaway ? 'border-yellow-400' : 'border-slate-500'}`} alt="avatar"/>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 flex items-center gap-2 ${post.is_giveaway ? 'text-yellow-400' : 'text-white'}`}>
                      {post.is_giveaway && <Gift className="w-5 h-5 animate-pulse" />}
                      {post.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3"/> {post.author?.fullname || 'Ẩn danh'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center gap-1 ml-2 text-rose-400"><Heart className="w-3 h-3"/> {post.likes_count || 0}</span>
                      <span className="flex items-center gap-1 text-sky-400"><MessageSquare className="w-3 h-3"/> {post.reply_count || 0}</span>
                      {post.is_giveaway && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-[10px] font-bold">
                          LÌ XÌ: {new Intl.NumberFormat('vi-VN').format(post.giveaway_total)} VNĐ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Modal Tạo bài */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-2xl border border-slate-700 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-4">Tạo bài viết mới</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-300">Tiêu đề</label>
                  <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-300">Nội dung</label>
                  <textarea value={content} onChange={e=>setContent(e.target.value)} required rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                </div>
                
                {user?.isTop1 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input type="checkbox" checked={isGiveaway} onChange={e=>setIsGiveaway(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                      <span className="text-yellow-400 font-bold flex items-center gap-1"><Gift className="w-4 h-4"/> Đính kèm Lì xì (Chỉ dành cho Top 1)</span>
                    </label>

                    {isGiveaway && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <label className="block text-sm text-yellow-200/70 mb-1">Tổng tiền phát (VNĐ)</label>
                          <input type="number" value={giveawayTotal} onChange={e=>setGiveawayTotal(e.target.value)} required min={1000} className="w-full bg-slate-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-yellow-400 focus:border-yellow-400 outline-none" />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-yellow-200/70 mb-2">Loại Lì xì</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="type" checked={giveawayType==='fixed'} onChange={()=>setGiveawayType('fixed')} className="accent-yellow-500"/> Chia đều (Cố định)</label>
                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="type" checked={giveawayType==='random'} onChange={()=>setGiveawayType('random')} className="accent-yellow-500"/> Ngẫu nhiên</label>
                          </div>
                        </div>

                        {giveawayType === 'fixed' ? (
                          <div>
                            <label className="block text-sm text-yellow-200/70 mb-1">Mỗi người nhận (VNĐ)</label>
                            <input type="number" value={giveawayFixedAmount} onChange={e=>setGiveawayFixedAmount(e.target.value)} required min={1000} className="w-full bg-slate-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none" />
                          </div>
                        ) : (
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm text-yellow-200/70 mb-1">Min (VNĐ)</label>
                              <input type="number" value={giveawayRandomMin} onChange={e=>setGiveawayRandomMin(e.target.value)} required min={1000} className="w-full bg-slate-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm text-yellow-200/70 mb-1">Max (VNĐ)</label>
                              <input type="number" value={giveawayRandomMax} onChange={e=>setGiveawayRandomMax(e.target.value)} required min={1000} className="w-full bg-slate-900 border border-yellow-500/30 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={()=>setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white">Hủy</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold shadow-lg disabled:opacity-50">
                    {isSubmitting ? 'Đang xử lý...' : 'Đăng bài'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
