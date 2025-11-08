import NewsCard from '../NewsCard';
import medicalImage from '@assets/generated_images/Medical_innovation_research_c66d4f7e.png';

export default function NewsCardExample() {
  return (
    <div className="p-4 max-w-sm">
      <NewsCard
        id="1"
        image={medicalImage}
        category="Tibbiyot"
        title="Yangi diagnostika usuli kasalliklarni 90% aniqlikda aniqlaydi"
        date="18 Yanvar, 2025"
      />
    </div>
  );
}
