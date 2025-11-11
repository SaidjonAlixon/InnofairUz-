import HeroSlider from "@/components/HeroSlider";
import ArticleCard from "@/components/ArticleCard";
import NewsCard from "@/components/NewsCard";
import InnovationCard from "@/components/InnovationCard";
import StatsSection from "@/components/StatsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Article, News, Innovation, Category, User } from "@shared/schema";

import techImage from "@assets/generated_images/Technology_robotics_innovation_8147fb21.png";
import medicalImage from "@assets/generated_images/Medical_innovation_research_c66d4f7e.png";
import eduImage from "@assets/generated_images/Education_technology_innovation_5af2e17a.png";
import energyImage from "@assets/generated_images/Energy_innovation_facility_bf558b54.png";
import startupImage from "@assets/generated_images/Startup_innovation_workspace_3d5e0d40.png";
import agriImage from "@assets/generated_images/Agricultural_innovation_technology_58a8de7a.png";

const categoryImages: Record<string, string> = {
  "texnologiya": techImage,
  "tibbiyot": medicalImage,
  "talim": eduImage,
  "energetika": energyImage,
  "startap": startupImage,
  "qishloq-xojaligi": agriImage,
};

export default function Home() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    select: (data) => data.filter(a => a.published).slice(0, 3),
  });

  const { data: newsList = [], isLoading: newsLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
    select: (data) => data.filter(n => n.published).slice(0, 3),
  });

  const { data: innovations = [], isLoading: innovationsLoading } = useQuery<Innovation[]>({
    queryKey: ["/api/innovations"],
    select: (data) => data.filter(i => i.published).slice(0, 3),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Umumiy";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Umumiy";
  };

  const getCategorySlug = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.slug || null;
  };

  const getAuthorName = (authorId: string) => {
    const author = users.find(u => u.id === authorId);
    return author?.fullName || "Noma'lum muallif";
  };

  const getImageForCategory = (categoryId: string | null) => {
    const slug = getCategorySlug(categoryId);
    if (!slug) return techImage;
    return categoryImages[slug] || techImage;
  };

  if (articlesLoading || newsLoading || innovationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const displayArticles = articles.map(article => ({
    id: article.id,
    image: getImageForCategory(article.categoryId),
    category: getCategoryName(article.categoryId),
    title: article.title,
    excerpt: article.excerpt,
    author: getAuthorName(article.authorId),
    date: new Date(article.createdAt).toLocaleDateString('uz-UZ', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }),
    readTime: article.readTime,
  }));

  const displayNews = [
    ...newsList.map(item => ({
      id: item.id,
      image: getImageForCategory(item.categoryId),
      category: getCategoryName(item.categoryId),
      title: item.title,
      date: new Date(item.createdAt).toLocaleDateString('uz-UZ', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
    })),
    {
      id: "innofairuz-bootcamp",
      image: startupImage,
      category: "Startap",
      title: "InnofairUz bootcamp: mentorlik sessiyalari uchun ro'yxat boshlandi",
      date: new Date("2025-04-02").toLocaleDateString('uz-UZ', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
    }
  ];

  const displayInnovations = innovations.map(innovation => ({
    id: innovation.id,
    image: getImageForCategory(innovation.categoryId),
    category: getCategoryName(innovation.categoryId),
    title: innovation.title,
    description: innovation.description,
    author: { name: getAuthorName(innovation.authorId) },
    likes: innovation.likes,
    comments: 0,
  }));

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-16">
        <HeroSlider />

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tadbirlar va e'lonlar</h2>
            <Link href="/tadbirlar">
              <Button variant="ghost" className="gap-1" data-testid="button-view-all-news">
                Barchasi <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayNews.length > 0 ? (
              displayNews.map((item) => (
                <NewsCard key={item.id} {...item} />
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground py-12">
                Hozircha e'lon qilingan tadbirlar mavjud emas
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Loyihalar va g'oyalar katalogi</h2>
            <Link href="/loyihalar">
              <Button variant="ghost" className="gap-1" data-testid="button-view-all-articles">
                Barchasi <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.length > 0 ? (
              displayArticles.map((article) => (
                <ArticleCard key={article.id} {...article} />
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground py-12">
                Hozircha ro'yxatga olingan loyihalar mavjud emas
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tijorat mahsulotlari va prototiplar</h2>
            <Link href="/mahsulotlar">
              <Button variant="ghost" className="gap-1" data-testid="button-view-all-innovations">
                Barchasi <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayInnovations.length > 0 ? (
              displayInnovations.map((innovation) => (
                <InnovationCard key={innovation.id} {...innovation} />
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground py-12">
                Hozircha tijorat mahsulotlari mavjud emas
              </p>
            )}
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-8 lg:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">O'z g'oyangizni InnofairUz sahnasida taqdim eting!</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            G'oya pasportini yuklang, ekspertlar bahosini oling va investorlar bilan uchrashuvni rejalashtiring. InnofairUz sizni hududiy yarmarkalar sahnasiga olib chiqadi.
          </p>
          <Button size="lg" data-testid="button-submit-innovation">
            Loyiha yuborish
          </Button>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Bizning natijalarimiz</h2>
          <StatsSection />
        </section>
      </div>
    </div>
  );
}
