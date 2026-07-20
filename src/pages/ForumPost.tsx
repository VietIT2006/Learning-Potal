import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { claimGiveaway, createForumReply, toggleLikePost, hasUserLiked, getTopDepositors, deleteForumPost, getGiveawayClaims } from '../lib/supabaseService';
import { ArrowLeft, Gift, MessageCircle, Send, Star, Clock, Crown, Heart, Smile, Image as ImageIcon, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { FullScreenLoader } from '../components/LoadingSpinner';
import { checkToxicity, loadAIModel } from '../lib/aiModeration';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';

// Public beta key for Giphy API
const gf = new GiphyFetch('sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh');

export default function ForumPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null);
  const [claimsList, setClaimsList] = useState<any[]>([]);
  
  // Likes
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Sticker & GIF
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [gifSearch, setGifSearch] = useState('');

  const fetchPost = async () => {
    try {
      // Get post
      const { data: pData, error: pError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          users!author_id(id, username, full_name, avatar_url, role)
        `)
        .eq('id', id)
        .single();
      
      if (pError) throw pError;

      const uArray = pData.users;
      const u = Array.isArray(uArray) ? uArray[0] : uArray;
      // Get Top 1 ID
      let top1Id: number | null = null;
      try {
        const topDeps = await getTopDepositors(1);
        if (topDeps.length > 0) top1Id = Number(topDeps[0].userId);
      } catch (err) {
        console.error(err);
      }

      const formattedPost = {
        ...pData,
        author: {
          fullname: u?.full_name || u?.fullname || 'Ẩn danh',
          avatar_url: u?.avatar_url || u?.avatarUrl,
          isTop1: u?.id === top1Id
        }
      };
      setPost(formattedPost);

      // Check if user already claimed
      if (formattedPost.is_giveaway && user) {
        const { data: claimData } = await supabase
          .from('forum_claims')
          .select('amount')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (claimData) {
          setClaimedAmount(claimData.amount);
        } else {
          setClaimedAmount(null);
        }
      }
      
      // Get likes
      if (user) {
        const liked = await hasUserLiked(Number(id), user.id);
        setIsLiked(liked);
      }
      
      // Get claims if giveaway
      if (formattedPost.is_giveaway) {
        try {
          const claims = await getGiveawayClaims(Number(id));
          setClaimsList(claims);
        } catch (err) {
          console.error(err);
        }
      }

      // Get replies
      const { data: rData, error: rError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          users!author_id(id, username, full_name, avatar_url, role)
        `)
        .eq('parent_id', id)
        .order('created_at', { ascending: true });

      if (rError) throw rError;

      const formattedReplies = rData?.map(d => {
        const ruArray = d.users;
        const ru = Array.isArray(ruArray) ? ruArray[0] : ruArray;
        return {
          ...d,
          author: {
            fullname: ru?.full_name || ru?.fullname || 'Ẩn danh',
            avatar_url: ru?.avatar_url || ru?.avatarUrl,
            isTop1: ru?.id === top1Id
          }
        }
      });

      // Sắp xếp lại để Top 1 luôn ở trên cùng
      const sortedReplies = formattedReplies?.sort((a, b) => {
        if (a.author.isTop1 && !b.author.isTop1) return -1;
        if (!a.author.isTop1 && b.author.isTop1) return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }) || [];

      setReplies(sortedReplies);
    } catch (err) {
      toast.error('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPost();
    loadAIModel();
  }, [id, user]);

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error('Vui lòng đăng nhập!');
    setIsLikeLoading(true);
    try {
      const newStatus = await toggleLikePost(Number(id), user!.id);
      setIsLiked(newStatus);
      fetchPost(); // Refresh post to get new like count
    } catch (err) {
      toast.error('Lỗi thao tác');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?')) return;
    try {
      await deleteForumPost(Number(id));
      toast.success('Đã xóa bài viết!');
      navigate('/forum');
    } catch (err) {
      toast.error('Lỗi khi xóa bài viết');
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      await deleteForumPost(replyId);
      toast.success('Đã xóa bình luận!');
      fetchPost(); // Reload replies
    } catch (err) {
      toast.error('Lỗi khi xóa bình luận');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Vui lòng đăng nhập để bình luận!');
    if (!replyContent.trim() && !selectedMediaUrl) return;

    setIsReplying(true);
    
    // AI Moderation
    if (replyContent.trim()) {
      const isToxic = await checkToxicity(replyContent);
      if (isToxic) {
        setIsReplying(false);
        return toast.error('AI phát hiện bình luận của bạn chứa ngôn từ thô tục/xúc phạm. Hãy sửa lại!');
      }
    }
    
    try {
      await createForumReply(user!.id, Number(id), replyContent, selectedMediaUrl || undefined);
      setReplyContent('');
      setSelectedMediaUrl(null);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
      toast.success('Đã gửi bình luận');
      fetchPost();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi gửi bình luận');
    } finally {
      setIsReplying(false);
    }
  };

  const handleClaim = async () => {
    if (!isAuthenticated) return toast.error('Vui lòng đăng nhập!');
    setIsClaiming(true);
    try {
      const amount = await claimGiveaway(Number(id), user!.id);
      setClaimedAmount(amount);
      toast.success(`Chúc mừng bạn đã giật được ${new Intl.NumberFormat('vi-VN').format(amount)} VNĐ!`);
      fetchPost(); // Cập nhật số tiền còn lại
    } catch (err: any) {
      toast.error(err.message || 'Không thể giật lì xì');
    } finally {
      setIsClaiming(false);
    }
  };

  if (loading) return <FullScreenLoader message="Đang tải..." />;
  if (!post) return <div className="text-white text-center mt-32">Không tìm thấy bài viết</div>;

  const isGiveaway = post.is_giveaway;
  const remaining = post.giveaway_total - post.giveaway_claimed;
  const isGiveawayEmpty = isGiveaway && remaining <= 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <Link to="/forum" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4"/> Quay lại diễn đàn
        </Link>

        {/* Main Post */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-hidden mb-8 ${isGiveaway ? 'bg-gradient-to-br from-red-900/40 via-orange-900/40 to-yellow-900/40 border-yellow-500/50' : post.author?.isTop1 ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-[#1e293b]/50 border-slate-700/50'}`}>
          {isGiveaway && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>}
          {post.author?.isTop1 && !isGiveaway && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse"></div>}
          
          <div className="flex items-start gap-4 md:gap-6">
            <div className="relative">
              {post.author?.isTop1 && (
                <>
                  <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg">
                    <Crown className="w-3.5 h-3.5 text-[#0f172a]" />
                  </div>
                  <div className="avatar-top1-frame"></div>
                </>
              )}
              <img src={post.author?.avatar_url || 'https://via.placeholder.com/60'} className={`w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 flex-shrink-0 ${isGiveaway || post.author?.isTop1 ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'border-slate-500'}`} alt="avatar"/>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 ${isGiveaway || post.author?.isTop1 ? 'text-yellow-400' : 'text-white'}`}>
                {isGiveaway && <Gift className="w-8 h-8 animate-bounce shrink-0" />}
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                <span className="flex items-center gap-1 font-medium"><Star className="w-4 h-4 text-yellow-500"/> {post.author?.fullname}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(post.created_at).toLocaleString('vi-VN')}</span>
                <button 
                  onClick={handleLike} 
                  disabled={isLikeLoading}
                  className={`flex items-center gap-1 transition-all hover:scale-110 ${isLiked ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-rose-400'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {post.likes_count || 0}
                </button>
                {user?.role === 'admin' && (
                  <button 
                    onClick={handleDeletePost}
                    className="flex items-center gap-1 ml-auto text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1.5 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa bài
                  </button>
                )}
              </div>
              <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Lì xì Widget */}
              {isGiveaway && (
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-red-950 to-orange-950 border border-yellow-500/30 flex flex-col items-center justify-center text-center">
                  <Gift className={`w-16 h-16 text-yellow-400 mb-4 ${isGiveawayEmpty ? 'opacity-50' : 'animate-pulse'}`} />
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Lì Xì Từ Đại Gia {post.author?.fullname}</h3>
                  <div className="text-sm text-red-200/80 mb-6 space-y-1">
                    <p>Tổng quỹ: <span className="font-bold text-white">{new Intl.NumberFormat('vi-VN').format(post.giveaway_total)} VNĐ</span></p>
                    <p>Còn lại: <span className="font-bold text-yellow-300">{new Intl.NumberFormat('vi-VN').format(remaining)} VNĐ</span></p>
                    <p>Loại: {post.giveaway_type === 'fixed' ? `Chia đều (${new Intl.NumberFormat('vi-VN').format(post.giveaway_fixed_amount)}đ/người)` : `Ngẫu nhiên (${new Intl.NumberFormat('vi-VN').format(post.giveaway_random_min)}đ - ${new Intl.NumberFormat('vi-VN').format(post.giveaway_random_max)}đ)`}</p>
                  </div>

                  {claimedAmount !== null ? (
                    <div className="bg-green-500/20 text-green-400 px-6 py-4 rounded-xl border border-green-500/30 text-lg font-bold animate-in zoom-in mb-6">
                      🎉 Bạn đã nhận {new Intl.NumberFormat('vi-VN').format(claimedAmount)} VNĐ!
                    </div>
                  ) : (
                    <button 
                      onClick={handleClaim}
                      disabled={isGiveawayEmpty || isClaiming}
                      className={`px-10 py-4 mb-6 rounded-xl font-black text-xl shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all transform hover:scale-105 active:scale-95 ${isGiveawayEmpty ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-red-900 hover:from-yellow-300 hover:to-yellow-400'}`}
                    >
                      {isClaiming ? 'Đang mở...' : (isGiveawayEmpty ? 'ĐÃ HẾT LÌ XÌ' : 'GIẬT LÌ XÌ')}
                    </button>
                  )}
                  
                  {/* Danh sách người đã nhận lì xì */}
                  {claimsList.length > 0 && (
                    <div className="w-full mt-4 bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                      <div className="bg-white/5 py-3 px-4 border-b border-white/5 flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <h4 className="font-bold text-sm text-slate-300">Danh sách đã nhận ({claimsList.length})</h4>
                      </div>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {claimsList.map((claim, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500 text-xs w-4 font-bold">{idx + 1}</span>
                              <img src={claim.user.avatar_url || 'https://via.placeholder.com/30'} alt="avatar" className="w-8 h-8 rounded-full border border-slate-600 object-cover" />
                              <div className="text-left">
                                <p className="text-sm font-bold text-slate-200">{claim.user.fullname}</p>
                                <p className="text-[10px] text-slate-500">{new Date(claim.created_at).toLocaleTimeString('vi-VN')}</p>
                              </div>
                            </div>
                            <span className="font-black text-yellow-400 text-sm">{new Intl.NumberFormat('vi-VN').format(claim.amount)} VNĐ</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageCircle className="w-6 h-6"/> Bình luận ({replies.length})</h3>
          
          <div className="space-y-6">
            {replies.map(reply => (
              <div key={reply.id} className={`flex gap-4 ${reply.author?.isTop1 ? 'p-1 bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 rounded-2xl' : ''}`}>
                <div className={`flex-1 flex gap-4 ${reply.author?.isTop1 ? 'bg-[#0f172a] p-4 rounded-xl' : 'bg-[#1e293b]/30 p-4 rounded-2xl border border-slate-700/50'}`}>
                  <div className="relative">
                    {reply.author?.isTop1 && (
                      <div className="absolute -top-3 -right-2 z-10 w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                        <Crown className="w-3.5 h-3.5 text-[#0f172a]" />
                      </div>
                    )}
                    <img src={reply.author?.avatar_url || 'https://via.placeholder.com/40'} className={`w-10 h-10 rounded-full object-cover ${reply.author?.isTop1 ? 'border-2 border-yellow-400' : ''}`} alt="avatar"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-bold ${reply.author?.isTop1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500' : 'text-white'}`}>
                        {reply.author?.fullname}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(reply.created_at).toLocaleString('vi-VN')}</span>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handleDeleteReply(reply.id)}
                          className="ml-auto text-red-400/50 hover:text-red-400 transition-colors p-1"
                          title="Xóa bình luận"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap">{reply.content}</p>
                    {reply.media_url && (
                      <img src={reply.media_url} alt="media" className="mt-3 rounded-lg max-h-64 object-contain bg-black/20" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Input */}
        {isAuthenticated ? (
          <form onSubmit={handleReply} className="flex gap-4 relative">
            <img src={user?.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" alt="my-avatar"/>
            <div className="flex-1 relative">
              {selectedMediaUrl && (
                <div className="mb-2 relative inline-block">
                  <img src={selectedMediaUrl} alt="selected-gif" className="h-32 rounded-lg border border-slate-700" />
                  <button type="button" onClick={() => setSelectedMediaUrl(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">×</button>
                </div>
              )}
              
              <div className="relative flex items-center bg-[#1e293b]/50 border border-slate-700 rounded-2xl overflow-visible focus-within:ring-2 focus-within:ring-blue-500">
                <textarea 
                  value={replyContent} 
                  onChange={e=>setReplyContent(e.target.value)} 
                  placeholder="Viết bình luận của bạn..." 
                  rows={2}
                  className="w-full bg-transparent p-4 text-white placeholder-slate-500 outline-none resize-none"
                />
                
                <div className="flex items-center gap-2 px-4 border-l border-slate-700 h-full">
                  <div className="relative">
                    <button type="button" onClick={() => {setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false);}} className="text-slate-400 hover:text-yellow-400 transition-colors p-2">
                      <Smile className="w-5 h-5" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 right-0 z-50">
                        <EmojiPicker theme={Theme.DARK} onEmojiClick={(e) => setReplyContent(prev => prev + e.emoji)} />
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button type="button" onClick={() => {setShowGifPicker(!showGifPicker); setShowEmojiPicker(false);}} className="text-slate-400 hover:text-sky-400 transition-colors p-2 font-bold text-xs flex items-center gap-1">
                      GIF
                    </button>
                    {showGifPicker && (
                      <div className="absolute bottom-12 right-0 z-50 w-[300px] h-[400px] bg-[#1e293b] border border-slate-700 rounded-xl flex flex-col shadow-2xl p-2">
                        <div className="mb-2 relative">
                          <input 
                            type="text" 
                            placeholder="Tìm kiếm GIF..." 
                            value={gifSearch}
                            onChange={(e) => setGifSearch(e.target.value)}
                            className="w-full bg-[#0f172a] text-sm text-white px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          <Grid 
                            key={gifSearch} // Re-mount grid when search changes
                            width={280} 
                            columns={2} 
                            fetchGifs={(offset) => gifSearch ? gf.search(gifSearch, { offset, limit: 10 }) : gf.trending({ offset, limit: 10 })} 
                            onGifClick={(gif, e) => {
                              e.preventDefault();
                              setSelectedMediaUrl(gif.images.fixed_height.url);
                              setShowGifPicker(false);
                            }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isReplying || (!replyContent.trim() && !selectedMediaUrl)}
                    className="ml-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-5 h-5 -ml-0.5 text-white"/>
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center p-6 bg-[#1e293b]/30 rounded-2xl border border-slate-700/50">
            <p className="text-slate-400">Vui lòng <Link to="/login" className="text-blue-400 font-bold hover:underline">đăng nhập</Link> để bình luận.</p>
          </div>
        )}

      </div>
    </div>
  );
}
