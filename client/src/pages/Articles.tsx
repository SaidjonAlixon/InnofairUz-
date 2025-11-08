import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Article, Category, User } from "@shared/schema";
import ArticleCard from "@/components/ArticleCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    select: (data) => data.filter(a => a.published),
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

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || article.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const displayArticles = filteredArticles.map(article => ({
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Barcha maqolalar</h1>
          <p className="text-lg text-muted-foreground">
            Innovatsiya va texnologiya haqida eng so'nggi maqolalar
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Maqolalarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-articles"
          />
        </div>

        <CategoryFilter />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.length > 0 ? (
            displayArticles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))
          ) : (
            <p className="col-span-3 text-center text-muted-foreground py-12">
              Hech qanday maqola topilmadi
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
