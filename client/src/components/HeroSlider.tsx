import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage1 from "@assets/generated_images/Innovation_hero_workspace_a9a93579.png";
import heroImage2 from "@assets/generated_images/Technology_robotics_innovation_8147fb21.png";
import heroImage3 from "@assets/generated_images/Medical_innovation_research_c66d4f7e.png";

const slides = [
  {
    id: 1,
    image: heroImage1,
    category: "InnofairUz 2025",
    title: "Hududiy innovatsion yarmarka onlayn formatda",
    description: "Tadbirlar taqvimi, ishtirokchilar va pitch sessiyalar yagona platformada to'plandi.",
  },
  {
    id: 2,
    image: heroImage2,
    category: "Investorlar maydoni",
    title: "Tayyor loyihalar va hamkorlik takliflari bilan tanishing",
    description: "Startaplar, ilmiy markazlar va ishlab chiqaruvchilar uchun investitsiya imkoniyatlari.",
  },
  {
    id: 3,
    image: heroImage3,
    category: "Media & Master-klasslar",
    title: "Ekspertlar bilan intervyular va muvaffaqiyatli tajribalar",
    description: "Video kutubxona, master-klasslar va mentorlik sessiyalari onlayn efirda.",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[32rem] w-full overflow-hidden rounded-lg">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-16 text-white">
            <Badge className="w-fit mb-4 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30">
              {slide.category}
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 max-w-3xl">
              {slide.title}
            </h2>
            <p className="text-lg lg:text-xl text-white/90 mb-6 max-w-2xl">
              {slide.description}
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                data-testid="button-read-more"
              >
                Batafsil o'qish
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
        onClick={prevSlide}
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
        onClick={nextSlide}
        data-testid="button-next-slide"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            data-testid={`button-slide-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
