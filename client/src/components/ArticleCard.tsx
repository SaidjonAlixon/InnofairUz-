import { Link } from "wouter";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ArticleCardProps {
  id: string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
}

export default function ArticleCard({
  id,
  image,
  category,
  title,
  excerpt,
  author,
  date,
  readTime,
}: ArticleCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-shadow h-full flex flex-col" data-testid={`card-article-${id}`}>
      <Link href={`/maqola/${id}`}>
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
        <Link href={`/maqola/${id}`}>
          <h3 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2" data-testid={`text-title-${id}`}>
            {title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2" data-testid={`text-excerpt-${id}`}>{excerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span data-testid={`text-author-${id}`}>{author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span data-testid={`text-date-${id}`}>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span data-testid={`text-readtime-${id}`}>{readTime}</span>
          </div>
        </div>
        <Link href={`/maqola/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1 h-auto p-0" data-testid={`button-read-${id}`}>
            Batafsil <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
