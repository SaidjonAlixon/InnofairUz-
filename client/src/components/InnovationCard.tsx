import { Link } from "wouter";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface InnovationCardProps {
  id: string;
  image: string;
  category: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
}

export default function InnovationCard({
  id,
  image,
  category,
  title,
  description,
  author,
  likes,
  comments,
}: InnovationCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-shadow h-full flex flex-col" data-testid={`card-innovation-${id}`}>
      <Link href={`/goya/${id}`}>
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
          />
        </div>
      </Link>
      <CardHeader className="flex-grow">
        <Badge className="w-fit mb-2" data-testid={`badge-category-${id}`}>{category}</Badge>
        <Link href={`/goya/${id}`}>
          <h3 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2" data-testid={`text-title-${id}`}>
            {title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-3" data-testid={`text-description-${id}`}>{description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.avatar} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium" data-testid={`text-author-${id}`}>{author.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-1" data-testid={`button-like-${id}`}>
            <Heart className="h-4 w-4" />
            <span className="text-xs">{likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1" data-testid={`button-comment-${id}`}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{comments}</span>
          </Button>
          <Button variant="ghost" size="sm" data-testid={`button-share-${id}`}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
