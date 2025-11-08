import { useState } from "react";
import { MessageSquare, ThumbsUp, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [comments] = useState<Comment[]>([
    {
      id: "1",
      author: { name: "Jasur Tursunov" },
      content: "Juda qiziqarli va foydali maqola! Kvant kompyuterlari haqida ko'proq o'qishni xohlayman.",
      date: "16 Yanvar, 2025",
      likes: 12,
      replies: [
        {
          id: "1-1",
          author: { name: "Aziz Normatov" },
          content: "Rahmat! Tez orada ushbu mavzu bo'yicha yanada batafsil maqolalar tayyorlayman.",
          date: "16 Yanvar, 2025",
          likes: 5,
        },
      ],
    },
    {
      id: "2",
      author: { name: "Dilnoza Karimova" },
      content: "O'zbekistonda ham bu sohada tadqiqotlar olib borilayotganini eshitdim. Bunday loyihalar haqida ham yozsangiz ajoyib bo'lardi.",
      date: "16 Yanvar, 2025",
      likes: 8,
    },
  ]);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      console.log("New comment submitted:", { articleId, content: newComment });
      setNewComment("");
    }
  };

  const Comment = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-12" : ""}`}>
      <Card className="p-4 mb-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium" data-testid={`text-commenter-${comment.id}`}>{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{comment.date}</span>
            </div>
            <p className="text-sm mb-3" data-testid={`text-comment-${comment.id}`}>{comment.content}</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1 h-auto p-1" data-testid={`button-like-${comment.id}`}>
                <ThumbsUp className="h-3 w-3" />
                <span className="text-xs">{comment.likes}</span>
              </Button>
              {!isReply && (
                <Button variant="ghost" size="sm" className="gap-1 h-auto p-1" data-testid={`button-reply-${comment.id}`}>
                  <Reply className="h-3 w-3" />
                  <span className="text-xs">Javob berish</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      {comment.replies?.map((reply) => (
        <Comment key={reply.id} comment={reply} isReply />
      ))}
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Izohlar ({comments.length})
      </h2>

      <Card className="p-4 mb-8">
        <Textarea
          placeholder="Fikr bildiring..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-4 min-h-[100px]"
          data-testid="textarea-comment"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmitComment} data-testid="button-submit-comment">
            Izoh qoldirish
          </Button>
        </div>
      </Card>

      <div>
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
