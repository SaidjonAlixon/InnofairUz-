import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Cpu, Heart, GraduationCap, Zap, Rocket, Sprout, Users } from "lucide-react";

const categories = [
  { id: "all", name: "Barchasi", icon: Users },
  { id: "technology", name: "Texnologiya", icon: Cpu },
  { id: "medicine", name: "Tibbiyot", icon: Heart },
  { id: "education", name: "Ta'lim", icon: GraduationCap },
  { id: "energy", name: "Energetika", icon: Zap },
  { id: "startup", name: "Startap", icon: Rocket },
  { id: "agriculture", name: "Qishloq xo'jaligi", icon: Sprout },
];

export default function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="flex-shrink-0 gap-2"
            onClick={() => {
              setSelectedCategory(category.id);
              console.log("Category selected:", category.id);
            }}
            data-testid={`button-category-${category.id}`}
          >
            <Icon className="h-4 w-4" />
            {category.name}
          </Button>
        );
      })}
    </div>
  );
}
