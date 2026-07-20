import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { createForumPost, getTopDepositors, deleteForumPost, pinForumPost } from '../lib/supabaseService';
import { MessageSquare, Gift, Plus, Search, Star, Clock, Heart, Crown, Trash2, Pin, PinOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { FullScreenLoader } from '../components/LoadingSpinner';
import { checkToxicity, loadAIModel } from '../lib/aiModeration';

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
          users!author_id(id, username, full_name, avatar_url, role)
        `)
        .is('parent_id', null)
        .order('is_pinned', { ascending: false })
        .order('is_giveaway', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Lấy ID Top 1
      let top1Id: number | null = null;
      try {
        const topDeps = await getTopDepositors(1);
        if (topDeps.length > 0) top1Id = Number(topDeps[0].userId);
      } catch (err) {
        console.error(err);
      }

      const formatted = data?.map(d => {
        const uArray = d.users;
        const u = Array.isArray(uArray) ? uArray[0] : uArray;
        return {
          ...d,
          author: {
            fullname: u?.full_name || u?.username || 'Ẩn danh',
            avatar_url: u?.avatar_url || u?.avatarUrl,
            isTop1: u?.id === top1Id
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
    // Preload AI model in background so it doesn't block later submissions
    loadAIModel();
  }, []);

  const handleDeletePost = async (e: React.MouseEvent, postId: number) => {
    e.preventDefault(); // Ngăn Link trigger
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?')) return;
    try {
      await deleteForumPost(postId);
      toast.success('Đã xóa bài viết!');
      fetchPosts();
    } catch (err) {
      toast.error('Lỗi khi xóa bài viết');
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, postId: number, currentPin: boolean) => {
    e.preventDefault();
    try {
      await pinForumPost(postId, !currentPin);
      toast.success(currentPin ? 'Đã bỏ ghim' : 'Đã ghim bài viết');
      fetchPosts();
    } catch (err) {
      toast.error('Lỗi khi ghim bài viết');
    }
  };

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
              <Link to={`/forum/${post.id}`} key={post.id} className={`block p-6 rounded-2xl border backdrop-blur-md transition-all hover:scale-[1.01] shadow-lg relative overflow-hidden ${post.is_giveaway ? 'bg-gradient-to-r from-yellow-900/30 to-red-900/30 border-yellow-500/50 hover:border-yellow-400' : post.author?.isTop1 ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/50 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                {post.author?.isTop1 && !post.is_giveaway && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse"></div>}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {post.author?.isTop1 && (
                      <>
                        <div className="absolute -top-2 -right-2 z-10 w-5 h-5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg">
                          <Crown className="w-3 h-3 text-[#0f172a]" />
                        </div>
                        <div className="avatar-top1-frame"></div>
                      </>
                    )}
                    <img src={post.author?.avatar_url || 'https://via.placeholder.com/50'} className={`w-12 h-12 rounded-full object-cover border-2 ${post.is_giveaway || post.author?.isTop1 ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'border-slate-500'}`} alt="avatar"/>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 flex items-center gap-2 ${post.is_giveaway || post.author?.isTop1 ? 'text-yellow-400' : 'text-white'}`}>
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
                  
                  {/* Admin Controls */}
                  {user?.role === 'admin' && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button 
                        onClick={(e) => handleTogglePin(e, post.id, post.is_pinned)}
                        className={`p-2 rounded-lg transition-colors ${post.is_pinned ? 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/40' : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600'}`}
                        title={post.is_pinned ? "Bỏ ghim" : "Ghim bài"}
                      >
                        {post.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={(e) => handleDeletePost(e, post.id)}
                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
