import HeroSlider from "@/components/HeroSlider";
import CategoryFilter from "@/components/CategoryFilter";
import ArticleCard from "@/components/ArticleCard";
import NewsCard from "@/components/NewsCard";
import InnovationCard from "@/components/InnovationCard";
import StatsSection from "@/components/StatsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import techImage from "@assets/generated_images/Technology_robotics_innovation_8147fb21.png";
import medicalImage from "@assets/generated_images/Medical_innovation_research_c66d4f7e.png";
import eduImage from "@assets/generated_images/Education_technology_innovation_5af2e17a.png";
import energyImage from "@assets/generated_images/Energy_innovation_facility_bf558b54.png";
import startupImage from "@assets/generated_images/Startup_innovation_workspace_3d5e0d40.png";
import agriImage from "@assets/generated_images/Agricultural_innovation_technology_58a8de7a.png";

export default function Home() {
  const articles = [
    {
      id: "1",
      image: techImage,
      category: "Texnologiya",
      title: "Kvant kompyuterlari: Kelajak texnologiyasi bugun",
      excerpt: "Kvant kompyuterlari hozirgi paytda eng istiqbolli texnologiyalardan biri hisoblanadi va kelajakda bir qancha muammolarni hal qilishda yordam beradi.",
      author: "Aziz Normatov",
      date: "15 Yanvar, 2025",
      readTime: "8 daqiqa",
    },
    {
      id: "2",
      image: medicalImage,
      category: "Tibbiyot",
      title: "Sun'iy intellekt tibbiyotda: Yangi imkoniyatlar",
      excerpt: "AI texnologiyalari tibbiyotda diagnostika va davolashni yangi bosqichga olib chiqmoqda. Kasalliklarni erta aniqlash imkoniyatlari kengaymoqda.",
      author: "Malika Yusupova",
      date: "14 Yanvar, 2025",
      readTime: "6 daqiqa",
    },
    {
      id: "3",
      image: eduImage,
      category: "Ta'lim",
      title: "Virtual haqiqat ta'limda: Interaktiv ta'lim usullari",
      excerpt: "VR texnologiyalari talabalar uchun yangicha ta'lim tajribasini taqdim etmoqda. O'quv jarayoni yanada qiziqarli va samarali bo'lmoqda.",
      author: "Javohir Karimov",
      date: "13 Yanvar, 2025",
      readTime: "5 daqiqa",
    },
  ];

  const news = [
    {
      id: "1",
      image: energyImage,
      category: "Energetika",
      title: "O'zbekistonda yangi quyosh elektr stansiyasi ishga tushirildi",
      date: "18 Yanvar, 2025",
    },
    {
      id: "2",
      image: startupImage,
      category: "Startap",
      title: "Mahalliy startaplar xalqaro investitsiya oldi",
      date: "17 Yanvar, 2025",
    },
  ];

  const innovations = [
    {
      id: "1",
      image: energyImage,
      category: "Energetika",
      title: "Quyosh energiyasini saqlash uchun yangi batareya tizimi",
      description: "Ushbu loyiha quyosh energiyasini samaraliroq saqlash va foydalanish imkonini beradi, bu esa energiya tejashga yordam beradi.",
      author: { name: "Dilshod Rahimov" },
      likes: 234,
      comments: 45,
    },
    {
      id: "2",
      image: agriImage,
      category: "Qishloq xo'jaligi",
      title: "Aqlli issiqxona tizimi - kelajak qishloq xo'jaligi",
      description: "IoT texnologiyalari yordamida ishlaydigan avtomatlashtirilgan issiqxona tizimi hosildorlikni 40% oshiradi.",
      author: { name: "Nodira Sultanova" },
      likes: 189,
      comments: 32,
    },
    {
      id: "3",
      image: techImage,
      category: "Texnologiya",
      title: "Mobil ilova orqali tibbiy xizmatlar",
      description: "Bemorlarga shifokorlar bilan onlayn maslahatlashish va tibbiy yordamni tezkor olish imkonini beruvchi platforma.",
      author: { name: "Sardor Alimov" },
      likes: 312,
      comments: 67,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-16">
        <HeroSlider />

        <section>
          <h2 className="text-2xl font-bold mb-6">Turkumlar</h2>
          <CategoryFilter />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Eng ko'p o'qilgan maqolalar</h2>
            <Link href="/maqolalar">
              <Button variant="ghost" className="gap-1" data-testid="button-view-all-articles">
                Barchasi <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">So'nggi yangiliklar</h2>
            <Link href="/yangiliklar">
              <Button variant="ghost" className="gap-1" data-testid="button-view-all-news">
                Barchasi <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Innovatsion g'oyalar va loyihalar</h2>
            <Link href="/goyalar">
              <Button variant="ghost" className="gap-1" data-testid="button-view-all-innovations">
                Barchasi <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {innovations.map((innovation) => (
              <InnovationCard key={innovation.id} {...innovation} />
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-8 lg:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">O'z innovatsiyangizni joylashtiring!</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Sizning innovatsion g'oyalaringiz va loyihalaringiz minglab odamlarga ilhom berishi mumkin. Hoziroq platformamizga qo'shing!
          </p>
          <Button size="lg" data-testid="button-submit-innovation">
            Innovatsiya joylashtirish
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
