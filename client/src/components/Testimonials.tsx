import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah J.",
      role: "Guest",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      content: "The best vacation rental experience I've ever had. The villa was exactly as described and the host was incredibly helpful.",
      location: "Bali Bamboo Villa"
    },
    {
      name: "Michael C.",
      role: "Guest",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      content: "Nomad Villas made our honeymoon unforgettable. Seamless booking process and stunning property.",
      location: "Santorini Cliffside Suite"
    },
    {
      name: "Emily R.",
      role: "Guest",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      content: "I love the 'Guest Favorite' feature. It really helped us pick a place we could trust. 10/10 recommend.",
      location: "Modern Desert Retreat"
    }
  ];

  return (
    <div className="py-24 bg-muted/30">
      <div className="container-padding">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
          Loved by travelers worldwide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-background p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-lg font-medium leading-relaxed mb-6">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={t.image} />
                  <AvatarFallback>{t.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">Stayed at <span className="text-foreground font-medium">{t.location}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
