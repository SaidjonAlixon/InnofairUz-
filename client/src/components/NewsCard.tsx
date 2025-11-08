import { Link } from "wouter";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsCardProps {
  id: string;
  image: string;
  category: string;
  title: string;
  date: string;
}

export default function NewsCard({ id, image, category, title, date }: NewsCardProps) {
  return (
    <Link href={`/yangilik/${id}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 transition-shadow h-full" data-testid={`card-news-${id}`}>
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
          />
        </div>
        <CardHeader className="gap-2">
          <Badge className="w-fit" data-testid={`badge-category-${id}`}>{category}</Badge>
          <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2" data-testid={`text-title-${id}`}>
            {title}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span data-testid={`text-date-${id}`}>{date}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
