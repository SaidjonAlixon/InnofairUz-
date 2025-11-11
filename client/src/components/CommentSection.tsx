import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Comment as CommentRecord, User } from "@shared/schema";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");

  const { data: comments = [], refetch } = useQuery<CommentRecord[]>({
    queryKey: ["/api/comments/article", articleId],
    queryFn: async () => {
      const response = await fetch(`/api/comments/article/${articleId}?approved=true`);
      if (!response.ok) {
        throw new Error("Izohlarni olishda xatolik yuz berdi");
      }
      return response.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((entry) => map.set(entry.id, entry));
    return map;
  }, [users]);

  const formattedComments = useMemo(() => {
    return comments.map((comment) => {
      const author = userMap.get(comment.authorId);
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        likes: comment.likes ?? 0,
        authorName: author?.fullName || "Noma'lum foydalanuvchi",
        avatar: author?.avatar || undefined,
      };
    });
  }, [comments, userMap]);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Kirish talab qilinadi",
        description: "Izoh qoldirish uchun profilingizga kiring yoki ro'yxatdan o'ting.",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          authorId: user.id,
          articleId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Izohni saqlashda xatolik yuz berdi");
      }

      setNewComment("");
      toast({
        title: "Izoh qabul qilindi",
        description: "Moderatsiyadan o'tgach, izohingiz sahifada ko'rinadi.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Izohni yuborib bo'lmadi",
        description: error?.message ?? "Keyinroq qayta urinib ko'ring.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Izohlar ({formattedComments.length})
      </h2>

      <Card className="p-4 mb-8">
        {user ? (
          <>
            <Textarea
              placeholder="Fikr bildiring..."
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              className="mb-4 min-h-[100px]"
              data-testid="textarea-comment"
            />
            <div className="text-xs text-muted-foreground mb-2">
              Izohingiz moderatsiyadan so'ng nashr etiladi.
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} data-testid="button-submit-comment">
                Izoh qoldirish
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Izoh qoldirish uchun profilga kiring. Agar hisobingiz bo'lmasa, bir necha soniyada ro'yxatdan o'ting.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/auth/login")}>Kirish</Button>
              <Button variant="outline" onClick={() => navigate("/auth/register")}>
                Ro'yxatdan o'tish
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div>
        {formattedComments.map((comment) => (
          <Card key={comment.id} className="p-4 mb-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                {comment.avatar ? <AvatarImage src={comment.avatar} /> : null}
                <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium" data-testid={`text-commenter-${comment.id}`}>
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString("uz-UZ") : ""}
                  </span>
                </div>
                <p className="text-sm mb-3" data-testid={`text-comment-${comment.id}`}>
                  {comment.content}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-1 h-auto p-1" data-testid={`button-like-${comment.id}`}>
                    <ThumbsUp className="h-3 w-3" />
                    <span className="text-xs">{comment.likes}</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {formattedComments.length === 0 && (
          <p className="text-sm text-muted-foreground">Hozircha izohlar mavjud emas. Birinchi bo'lib fikr bildiring!</p>
        )}
      </div>
    </div>
  );
}
