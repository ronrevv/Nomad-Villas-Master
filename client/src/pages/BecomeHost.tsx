import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCreateVilla } from "@/hooks/use-villas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVillaSchema, type InsertVilla } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Building, TreePine, Tent, Palmtree, Warehouse, Castle,
  Wifi, Tv, Car, ChefHat, Coffee, Dumbbell, Wind,
  Upload, ChevronLeft, ChevronRight, Plus, Minus, MapPin
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

// Steps configuration
const STEPS = [
  { id: 'category', title: 'Which of these best describes your place?' },
  { id: 'location', title: 'Where is your place located?' },
  { id: 'basics', title: 'Share some basics about your place' },
  { id: 'amenities', title: 'What does your place offer?' },
  { id: 'photos', title: 'Add some photos of your house' },
  { id: 'title', title: 'Now, let\'s give your house a title' },
  { id: 'description', title: 'Create your description' },
  { id: 'price', title: 'Now, set your price' },
  { id: 'review', title: 'Review your listing' },
];

const CATEGORIES = [
  { label: 'House', icon: Home },
  { label: 'Apartment', icon: Building },
  { label: 'Cabin', icon: TreePine },
  { label: 'Camp', icon: Tent },
  { label: 'Island', icon: Palmtree },
  { label: 'Loft', icon: Warehouse },
  { label: 'Castle', icon: Castle },
];

const AMENITIES_LIST = [
  { label: 'Wifi', icon: Wifi },
  { label: 'TV', icon: Tv },
  { label: 'Kitchen', icon: ChefHat },
  { label: 'Parking', icon: Car },
  { label: 'AC', icon: Wind },
  { label: 'Coffee', icon: Coffee },
  { label: 'Gym', icon: Dumbbell },
];

export default function BecomeHost() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const createVilla = useCreateVilla();

  const form = useForm<InsertVilla>({
    resolver: zodResolver(insertVillaSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      pricePerNight: 50,
      maxGuests: 4,
      amenities: [],
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
        "https://images.unsplash.com/photo-1502005229766-3c8ef95a4a6f?w=800"
      ],
      hostId: user?.id || "",
    },
  });

  const nextStep = async () => {
    // Validate current step fields if needed
    // For MVP we skip strict validation per step, but in real app we'd trigger form.trigger(['field'])
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      await onSubmit();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const onSubmit = async () => {
    const data = form.getValues();
    if (!user) {
        window.location.href = "/api/login";
        return;
    }

    // Ensure hostId is set
    data.hostId = user.id;

    createVilla.mutate(data, {
      onSuccess: () => {
        setLocation("/host");
      }
    });
  };

  // Step Components
  const renderStep = () => {
    switch (step) {
      case 0: // Category
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                type="button"
                className={`flex flex-col items-center justify-center p-6 border rounded-xl hover:border-black transition-all ${
                  // Since we don't have a category field in schema yet, we'll just store it in description or ignore for MVP
                  // Let's pretend we're selecting it visually
                  "hover:bg-accent"
                }`}
                onClick={() => {
                   // Ideally store category in state or form
                   nextStep();
                }}
              >
                <cat.icon className="w-8 h-8 mb-3" />
                <span className="font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>
        );

      case 1: // Location
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Where is your place located?</label>
              <div className="relative">
                 <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                 <Input
                   {...form.register("location")}
                   placeholder="Enter your address"
                   className="pl-10 h-12 text-lg"
                 />
              </div>
            </div>
            {/* Mock Map */}
            <div className="h-[400px] bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
               <img
                 src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/115.1889,-8.4095,9,0/800x600?access_token=mock"
                 alt="Map"
                 className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale"
                 onError={(e) => (e.currentTarget.style.display = 'none')}
               />
               <div className="bg-background/80 p-4 rounded-lg z-10 backdrop-blur">
                  Map Preview (Mock)
               </div>
            </div>
          </div>
        );

      case 2: // Basics (Guests)
        return (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex items-center justify-between py-6 border-b">
               <div>
                 <div className="font-semibold text-lg">Guests</div>
                 <div className="text-muted-foreground">How many guests can stay?</div>
               </div>
               <div className="flex items-center gap-4">
                 <Button
                   type="button"
                   variant="outline"
                   size="icon"
                   className="rounded-full"
                   onClick={() => {
                     const val = form.getValues("maxGuests") || 1;
                     if (val > 1) form.setValue("maxGuests", val - 1);
                   }}
                 >
                   <Minus className="w-4 h-4" />
                 </Button>
                 <span className="text-xl font-medium w-8 text-center">{form.watch("maxGuests")}</span>
                 <Button
                   type="button"
                   variant="outline"
                   size="icon"
                   className="rounded-full"
                   onClick={() => {
                     const val = form.getValues("maxGuests") || 1;
                     form.setValue("maxGuests", val + 1);
                   }}
                 >
                   <Plus className="w-4 h-4" />
                 </Button>
               </div>
             </div>
             {/* Mock fields for Rooms/Beds since schema doesn't have them yet */}
             <div className="flex items-center justify-between py-6 border-b">
               <div>
                 <div className="font-semibold text-lg">Bedrooms</div>
               </div>
               <div className="flex items-center gap-4">
                 <Button type="button" variant="outline" size="icon" className="rounded-full"><Minus className="w-4 h-4" /></Button>
                 <span className="text-xl font-medium w-8 text-center">2</span>
                 <Button type="button" variant="outline" size="icon" className="rounded-full"><Plus className="w-4 h-4" /></Button>
               </div>
             </div>
             <div className="flex items-center justify-between py-6 border-b">
               <div>
                 <div className="font-semibold text-lg">Bathrooms</div>
               </div>
               <div className="flex items-center gap-4">
                 <Button type="button" variant="outline" size="icon" className="rounded-full"><Minus className="w-4 h-4" /></Button>
                 <span className="text-xl font-medium w-8 text-center">1</span>
                 <Button type="button" variant="outline" size="icon" className="rounded-full"><Plus className="w-4 h-4" /></Button>
               </div>
             </div>
          </div>
        );

      case 3: // Amenities
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {AMENITIES_LIST.map((item) => {
              const current = form.watch("amenities") || [];
              const isSelected = current.includes(item.label);

              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex flex-col p-4 border rounded-xl transition-all ${
                    isSelected ? "border-black bg-black/5 ring-1 ring-black" : "hover:border-black"
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      form.setValue("amenities", current.filter(c => c !== item.label));
                    } else {
                      form.setValue("amenities", [...current, item.label]);
                    }
                  }}
                >
                  <item.icon className="w-6 h-6 mb-2" />
                  <span className="font-semibold text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        );

      case 4: // Photos
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
               <Upload className="w-10 h-10 mb-4 text-muted-foreground" />
               <div className="font-semibold text-lg">Drag your photos here</div>
               <p className="text-muted-foreground">Choose at least 5 photos</p>
               <Button variant="link" className="mt-2">Upload from your device</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {form.watch("images")?.map((img, i) => (
                 <div key={i} className="aspect-square relative rounded-lg overflow-hidden group">
                   <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                   <button type="button" className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                     <Minus className="w-4 h-4" />
                   </button>
                 </div>
               ))}
            </div>
          </div>
        );

      case 5: // Title
        return (
           <div className="space-y-4">
             <Textarea
               {...form.register("title")}
               className="text-2xl font-bold min-h-[120px] resize-none p-4"
               placeholder="e.g. Modern Villa with Ocean View"
               maxLength={50}
             />
             <div className="text-muted-foreground text-sm">
               {form.watch("title")?.length || 0}/50
             </div>
           </div>
        );

      case 6: // Description
        return (
           <div className="space-y-4">
             <Textarea
               {...form.register("description")}
               className="text-lg min-h-[200px] p-4"
               placeholder="Share what makes your place special..."
               maxLength={500}
             />
             <div className="text-muted-foreground text-sm">
               {form.watch("description")?.length || 0}/500
             </div>
           </div>
        );

      case 7: // Price
        return (
          <div className="flex flex-col items-center justify-center space-y-8 py-10">
             <div className="flex items-center gap-4">
                <Button
                   type="button"
                   variant="outline"
                   size="icon"
                   className="h-12 w-12 rounded-full"
                   onClick={() => {
                     const val = form.getValues("pricePerNight") || 50;
                     if (val > 10) form.setValue("pricePerNight", val - 10);
                   }}
                 >
                   <Minus className="w-6 h-6" />
                 </Button>
                 <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold">$</span>
                   <Input
                      type="number"
                      {...form.register("pricePerNight", { valueAsNumber: true })}
                      className="text-6xl font-bold h-24 w-48 text-center border-0 focus-visible:ring-0 p-0 pl-8"
                   />
                 </div>
                 <Button
                   type="button"
                   variant="outline"
                   size="icon"
                   className="h-12 w-12 rounded-full"
                   onClick={() => {
                     const val = form.getValues("pricePerNight") || 50;
                     form.setValue("pricePerNight", val + 10);
                   }}
                 >
                   <Plus className="w-6 h-6" />
                 </Button>
             </div>
             <div className="text-center">
               <div className="text-lg">per night</div>
               <div className="text-muted-foreground mt-2">Places like yours in your area usually range from $75 to $130</div>
             </div>
          </div>
        );

      case 8: // Review
        const values = form.getValues();
        return (
          <div className="max-w-md mx-auto border rounded-xl overflow-hidden shadow-lg bg-card">
             <div className="aspect-[4/3] relative">
               <img src={values.images[0]} alt="Cover" className="w-full h-full object-cover" />
             </div>
             <div className="p-4">
               <h3 className="font-semibold text-lg">{values.title || "Untitled Listing"}</h3>
               <p className="text-muted-foreground">{values.location || "No location"}</p>
               <div className="mt-2 flex items-baseline gap-1">
                 <span className="font-bold">${values.pricePerNight}</span>
                 <span className="text-sm">night</span>
               </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-20 border-b flex items-center justify-between px-10">
         <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-primary" />
         </div>
         <div className="hidden md:block">
           <Button variant="ghost" className="rounded-full">Save & Exit</Button>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
           <motion.div
             key={step}
             initial={{ opacity: 0, x: direction * 50 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -direction * 50 }}
             transition={{ duration: 0.3, ease: "easeInOut" }}
             className="w-full max-w-2xl"
           >
             <h1 className="text-3xl md:text-4xl font-bold mb-8 animate-in slide-in-from-bottom-5 fade-in duration-500">
               {STEPS[step].title}
             </h1>
             {renderStep()}
           </motion.div>
        </div>

        {/* Footer */}
        <div className="h-20 border-t bg-background flex items-center justify-between px-6 md:px-10 z-10">
           <Button
             variant="ghost"
             onClick={prevStep}
             disabled={step === 0}
             className="underline font-semibold"
           >
             Back
           </Button>

           <div className="flex gap-2 items-center">
             {/* Progress Bar */}
             <div className="hidden md:flex gap-1 mr-4">
               {STEPS.map((_, i) => (
                 <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-black' : 'bg-gray-200'}`} />
               ))}
             </div>

             <Button
               size="lg"
               className="min-w-[120px] font-bold"
               onClick={nextStep}
               disabled={createVilla.isPending}
             >
               {createVilla.isPending ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : step === STEPS.length - 1 ? (
                 "Publish"
               ) : (
                 "Next"
               )}
             </Button>
           </div>
        </div>
      </main>
    </div>
  );
}
