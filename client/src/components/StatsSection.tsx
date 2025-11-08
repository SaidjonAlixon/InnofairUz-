import { FileText, Users, Lightbulb, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    id: 1,
    icon: FileText,
    value: "1,250+",
    label: "Maqolalar",
  },
  {
    id: 2,
    icon: Lightbulb,
    value: "850+",
    label: "Innovatsiyalar",
  },
  {
    id: 3,
    icon: Users,
    value: "45,000+",
    label: "O'quvchilar",
  },
  {
    id: 4,
    icon: TrendingUp,
    value: "95%",
    label: "O'sish",
  },
];

export default function StatsSection() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.id} className="hover-elevate active-elevate-2 transition-shadow" data-testid={`card-stat-${stat.id}`}>
            <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
              <Icon className="h-8 w-8 text-primary" />
              <div className="text-3xl font-bold" data-testid={`text-value-${stat.id}`}>{stat.value}</div>
              <div className="text-sm text-muted-foreground text-center" data-testid={`text-label-${stat.id}`}>{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
