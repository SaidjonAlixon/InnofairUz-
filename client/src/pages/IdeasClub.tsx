import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment, User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  MessageCircle, 
  Users, 
  Send, 
  Heart, 
  TrendingUp, 
  Clock, 
  Sparkles,
  MessageSquare,
  UserPlus,
  Zap
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface DiscussionPost {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  createdAt: Date;
  comments: Comment[];
  isLiked?: boolean;
}

export default function IdeasClub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  const { data: allComments = [], isLoading, refetch: refetchComments } = useQuery<Comment[]>({
    queryKey: ["/api/comments"],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });


  // Filter approved comments that are not tied to specific content (general discussions)
  const discussionPosts = useMemo(() => {
    // Filter for general discussion posts (no articleId, newsId, innovationId)
    // In Yoshlar klubi, all general discussion posts are shown (they are auto-approved)
    const posts = allComments
      .filter((comment) => {
        // Show only general discussion posts (not tied to articles, news, or innovations)
        // Don't filter by approved - all general discussions are auto-approved
        return !comment.articleId && !comment.newsId && !comment.innovationId;
      })
      .map((comment) => {
        const author = users.find((u) => u.id === comment.authorId);
        // Get replies - show all replies for general discussions (no parentId means it's a top-level post)
        const replies = allComments.filter(
          (c) => c.parentId === comment.id && !c.articleId && !c.newsId && !c.innovationId
        );
        return {
          id: comment.id,
          content: comment.content,
          authorId: comment.authorId,
          authorName: author?.fullName || "Noma'lum foydalanuvchi",
          authorAvatar: author?.avatar || undefined,
          likes: comment.likes || 0,
          createdAt: new Date(comment.createdAt),
          comments: replies,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return posts;
  }, [allComments, users]);

  const onlineUsers = useMemo(() => {
    // Simulate online users (in real app, this would come from WebSocket or presence API)
    return users.slice(0, 5);
  }, [users]);

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Kirish talab qilinadi");
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          authorId: user.id,
          // No articleId, newsId, or innovationId - this makes it a general discussion
        }),
      });
      if (!response.ok) throw new Error("Post yuborib bo'lmadi");
      return response.json();
    },
    onSuccess: async (newComment) => {
      // Ensure the comment is marked as approved for immediate display
      const approvedComment = { ...newComment, approved: true };
      
      // Optimistic update - immediately update the cache
      queryClient.setQueryData<Comment[]>(["/api/comments"], (old = []) => {
        // Check if comment already exists to avoid duplicates
        const existing = old?.find(c => c.id === approvedComment.id);
        if (existing) {
          return old.map(c => c.id === approvedComment.id ? approvedComment : c);
        }
        return [approvedComment, ...(old || [])];
      });
      
      // Immediately refetch to get the latest data from server
      await refetchComments();
      
      toast({
        title: "Post chop etildi!",
        description: "Postingiz darhol ko'rinadi.",
      });
      setNewPost("");
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error?.message || "Postni yuborib bo'lmadi.",
        variant: "destructive",
      });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string; content: string }) => {
      if (!user) throw new Error("Kirish talab qilinadi");
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          authorId: user.id,
          parentId,
        }),
      });
      if (!response.ok) throw new Error("Javob yuborib bo'lmadi");
      return response.json();
    },
    onSuccess: async (newReply, variables) => {
      // Ensure the reply is marked as approved for immediate display
      const approvedReply = { ...newReply, approved: true };
      // Optimistic update - add the new reply immediately
      queryClient.setQueryData<Comment[]>(["/api/comments"], (old = []) => {
        return [approvedReply, ...old];
      });
      // Refetch to ensure we have the latest data from server
      await refetchComments();
      setReplyContent({ ...replyContent, [variables.parentId]: "" });
      setReplyingTo(null);
      toast({
        title: "Javob chop etildi!",
        description: "Javobingiz darhol ko'rinadi.",
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Javobni yuborib bo'lmadi.",
        variant: "destructive",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Like qo'shib bo'lmadi");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
    },
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Kirish talab qilinadi",
        description: "Post yozish uchun tizimga kiring.",
        variant: "destructive",
      });
      return;
    }
    if (!newPost.trim()) {
      toast({
        title: "Xabar bo'sh",
        description: "Iltimos, xabarni kiriting.",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPost.trim());
  };

  const handleReply = (postId: string) => {
    const content = replyContent[postId]?.trim();
    if (!content) return;
    createReplyMutation.mutate({ parentId: postId, content });
  };

  const trendingPosts = useMemo(() => {
    return [...discussionPosts]
      .sort((a, b) => (b.likes + b.comments.length) - (a.likes + a.comments.length))
      .slice(0, 5);
  }, [discussionPosts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <Badge variant="outline" className="mx-auto w-fit gap-2 text-sm">
            <Sparkles className="h-4 w-4" />
            Community Forum
          </Badge>
          <h1 className="text-4xl font-bold">Yoshlar klubi</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Yoshlar uchun innovatsion g'oyalar, fikrlar va tajribalarni baham ko'ring. Bu yerda siz boshqa yoshlar bilan suhbatlashishingiz va yangi loyihalar haqida muhokama qilishingiz mumkin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Yangi post yozish
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fikringizni, savolingizni yoki g'oyangizni baham ko'ring.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <Textarea
                    placeholder="Nima haqida gapirmoqchisiz? Fikringizni yozing..."
                    className="min-h-[120px] resize-none"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    disabled={createPostMutation.isPending}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {user ? `${user.fullName} sifatida post yozasiz` : "Post yozish uchun kiring"}
                    </p>
                    <Button
                      type="submit"
                      disabled={createPostMutation.isPending || !user}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {createPostMutation.isPending ? "Yuborilmoqda..." : "Yuborish"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Discussion Posts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  Muhokamalar
                </h2>
                <Badge variant="secondary" className="gap-2">
                  <Users className="h-3 w-3" />
                  {discussionPosts.length} post
                </Badge>
              </div>

              {discussionPosts.length > 0 ? (
                <div className="space-y-4">
                  {discussionPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.authorAvatar} />
                            <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{post.authorName}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(post.createdAt, { 
                                    addSuffix: true
                                  })}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                            <div className="flex items-center gap-4 pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() => likePostMutation.mutate(post.id)}
                              >
                                <Heart className="h-4 w-4" />
                                {post.likes}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                              >
                                <MessageCircle className="h-4 w-4" />
                                {post.comments.length} javob
                              </Button>
                            </div>

                            {/* Reply Section */}
                            {replyingTo === post.id && (
                              <div className="pt-4 border-t space-y-2">
                                <Textarea
                                  placeholder="Javob yozing..."
                                  className="min-h-[80px] resize-none"
                                  value={replyContent[post.id] || ""}
                                  onChange={(e) =>
                                    setReplyContent({ ...replyContent, [post.id]: e.target.value })
                                  }
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyContent({ ...replyContent, [post.id]: "" });
                                    }}
                                  >
                                    Bekor qilish
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleReply(post.id)}
                                    disabled={!replyContent[post.id]?.trim()}
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Yuborish
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {post.comments.length > 0 && (
                              <div className="pt-4 space-y-3 border-t">
                                {post.comments.map((reply) => {
                                  const replyAuthor = users.find((u) => u.id === reply.authorId);
                                  return (
                                    <div key={reply.id} className="flex gap-3 pl-4 border-l-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={replyAuthor?.avatar} />
                                        <AvatarFallback>
                                          {replyAuthor?.fullName?.[0] || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-semibold">
                                            {replyAuthor?.fullName || "Noma'lum"}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(reply.createdAt), {
                                              addSuffix: true,
                                            })}
                                          </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                          {reply.content}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12 space-y-4">
                      <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Hozircha muhokamalar mavjud emas. Birinchi postni siz yozing!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Online Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Faol foydalanuvchilar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {onlineUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback>{u.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground">{u.role}</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Trending Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trend postlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingPosts.length > 0 ? (
                    trendingPosts.map((post, idx) => (
                      <div key={post.id} className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">
                          #{idx + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Heart className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{post.likes}</span>
                            <MessageCircle className="h-3 w-3 text-muted-foreground ml-2" />
                            <span className="text-xs text-muted-foreground">
                              {post.comments.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Hozircha trend postlar yo'q</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Community Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community qoidalari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Har bir post konstruktiv va hurmatli bo'lsin.</p>
                <p>• Spam va reklama qoldirmang.</p>
                <p>• Mualliflik huquqlariga hurmat ko'rsating.</p>
                <p>• Do'stona muhitni saqlang.</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Statistika
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Jami postlar:</span>
                  <span className="font-semibold">{discussionPosts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Faol foydalanuvchilar:</span>
                  <span className="font-semibold">{onlineUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Jami javoblar:</span>
                  <span className="font-semibold">
                    {discussionPosts.reduce((sum, p) => sum + p.comments.length, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
