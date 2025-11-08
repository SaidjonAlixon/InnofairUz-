import { useParams } from "wouter";
import { Calendar, User, Clock, ArrowLeft, Facebook, Linkedin, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import CommentSection from "@/components/CommentSection";

import techImage from "@assets/generated_images/Technology_robotics_innovation_8147fb21.png";

export default function ArticleDetail() {
  const params = useParams();
  const id = params.id;

  const article = {
    id,
    image: techImage,
    category: "Texnologiya",
    title: "Kvant kompyuterlari: Kelajak texnologiyasi bugun",
    author: {
      name: "Aziz Normatov",
      avatar: "",
      role: "Texnologiya mutaxassisi",
    },
    date: "15 Yanvar, 2025",
    readTime: "8 daqiqa",
    content: `
      <p>Kvant kompyuterlari zamonaviy texnologiyaning eng muhim yutuqlaridan biri hisoblanadi. Ular klassik kompyuterlardan tubdan farq qiladi va ko'plab murakkab muammolarni hal qilishda katta imkoniyatlarga ega.</p>
      
      <h2>Kvant kompyuterlari qanday ishlaydi?</h2>
      <p>Kvant kompyuterlari kvant mexanikasi qonunlaridan foydalanadi. Klassik kompyuterlar ma'lumotni bitlar (0 va 1) ko'rinishida saqlasa, kvant kompyuterlari kubitlardan foydalanadi. Kubitlar bir vaqtning o'zida bir nechta holatda bo'lishi mumkin.</p>
      
      <h2>Qo'llanilish sohalari</h2>
      <p>Kvant kompyuterlari quyidagi sohalarda katta yutuqlarga erishishi mumkin:</p>
      <ul>
        <li>Tibbiyot va dori-darmonlarni kashf etish</li>
        <li>Kriptografiya va xavfsizlik</li>
        <li>Moliyaviy modellashtirish</li>
        <li>Sun'iy intellekt va mashinali o'rganish</li>
        <li>Iqlim o'zgarishini modellashtirish</li>
      </ul>
      
      <h2>Kelajak istiqbollari</h2>
      <p>Kvant kompyuterlari hali rivojlanish bosqichida bo'lsa-da, yaqin kelajakda ular ko'plab sohalarni o'zgartirishi kutilmoqda. Tadqiqotchilar va kompaniyalar ushbu texnologiyani takomillashtirish ustida faol ishlashmoqda.</p>
      
      <p>O'zbekiston ham ushbu sohada ilmiy tadqiqotlarni boshlagan va kelajakda kvant texnologiyalari bo'yicha xalqaro hamkorlikni rivojlantirish rejalashtirilmoqda.</p>
    `,
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link href="/maqolalar">
          <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </Button>
        </Link>

        <article className="max-w-4xl mx-auto">
          <Badge className="mb-4" data-testid="badge-category">{article.category}</Badge>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="text-title">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={article.author.avatar} />
                <AvatarFallback>{article.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-foreground" data-testid="text-author">{article.author.name}</div>
                <div className="text-xs">{article.author.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span data-testid="text-date">{article.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span data-testid="text-readtime">{article.readTime}</span>
              </div>
            </div>
          </div>

          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-2 mb-8">
            <span className="text-sm font-medium">Ulashish:</span>
            <Button size="sm" variant="outline" data-testid="button-share-facebook">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" data-testid="button-share-linkedin">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" data-testid="button-share-twitter">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" data-testid="button-share-telegram">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
            data-testid="content-article"
          />

          <Separator className="my-12" />

          <CommentSection articleId={article.id || "1"} />
        </article>
      </div>
    </div>
  );
}
