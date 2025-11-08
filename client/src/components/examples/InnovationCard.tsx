import InnovationCard from '../InnovationCard';
import energyImage from '@assets/generated_images/Energy_innovation_facility_bf558b54.png';

export default function InnovationCardExample() {
  return (
    <div className="p-4 max-w-md">
      <InnovationCard
        id="1"
        image={energyImage}
        category="Energetika"
        title="Quyosh energiyasini saqlash uchun yangi batareya tizimi"
        description="Ushbu loyiha quyosh energiyasini samaraliroq saqlash va foydalanish imkonini beradi, bu esa energiya tejashga yordam beradi."
        author={{
          name: "Dilshod Rahimov",
          avatar: "",
        }}
        likes={234}
        comments={45}
      />
    </div>
  );
}
