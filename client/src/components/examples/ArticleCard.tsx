import ArticleCard from '../ArticleCard';
import techImage from '@assets/generated_images/Technology_robotics_innovation_8147fb21.png';

export default function ArticleCardExample() {
  return (
    <div className="p-4 max-w-md">
      <ArticleCard
        id="1"
        image={techImage}
        category="Texnologiya"
        title="Kvant kompyuterlari: Kelajak texnologiyasi bugun"
        excerpt="Kvant kompyuterlari hozirgi paytda eng istiqbolli texnologiyalardan biri hisoblanadi va kelajakda..."
        author="Aziz Normatov"
        date="15 Yanvar, 2025"
        readTime="8 daqiqa"
      />
    </div>
  );
}
