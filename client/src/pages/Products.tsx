import { useQuery } from "@tanstack/react-query";
import type { Category, Innovation, User } from "@shared/schema";
import InnovationCard from "@/components/InnovationCard";
import { Button } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";

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

export default function ProductsPage() {
  const { data: innovations = [], isLoading } = useQuery<Innovation[]>({
    queryKey: ["/api/innovations"],
    select: (data) => data.filter(item => item.published),
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

  const getImageForCategory = (categoryId: string | null) => {
    const slug = getCategorySlug(categoryId);
    if (!slug) return techImage;
    return categoryImages[slug] || techImage;
  };

  const getAuthorName = (authorId: string) => {
    const author = users.find(u => u.id === authorId);
    return author?.fullName || "Noma'lum muallif";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Mahsulotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const displayProducts = innovations.map(innovation => ({
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
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PackageSearch className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Tijoratlashtirishga tayyor mahsulotlar</h1>
          <p className="text-lg text-muted-foreground">
            Pilot bosqichdan muvaffaqiyatli o'tgan va bozorga chiqarishga tayyor yechimlar, uskunalar hamda xizmatlar katalogi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.length > 0 ? (
            displayProducts.map((product) => (
              <InnovationCard key={product.id} {...product} />
            ))
          ) : (
            <p className="col-span-3 text-center text-muted-foreground py-12">
              Hozircha tijoratlashtirishga tayyor mahsulotlar ro'yxati bo'sh.
            </p>
          )}
        </div>

        <section className="rounded-xl border bg-card p-8 text-center space-y-4">
          <h2 className="text-3xl font-semibold">Mahsulotingizni ro'yxatga qo'shing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Innovatsion mahsulotingizni inno-fair.uz katalogiga joylab, investorlar va sanoat shartnomalarini jalb qiling. Ekspertlar jamoasi mos keluvchi bozor segmentlarini tanlashga yordam beradi.
          </p>
          <Button size="lg" data-testid="button-submit-product">
            Mahsulotni yuborish
          </Button>
        </section>
      </div>
    </div>
  );
}




