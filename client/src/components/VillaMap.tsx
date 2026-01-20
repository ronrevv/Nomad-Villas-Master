import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Villa } from "@shared/schema";
import L from "leaflet";
import { useEffect } from "react";
import { Link } from "wouter";

// Fix Leaflet icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  villas: Villa[];
  className?: string;
}

// Helper to center map on markers
function MapBounds({ villas }: { villas: Villa[] }) {
  const map = useMap();

  useEffect(() => {
    if (villas.length === 0) return;

    // In a real app, you'd geocode locations.
    // For this MVP, we will simulate lat/lng based on location string or random nearby points
    // But since we don't have lat/lng in DB, we'll hardcode some for the seeded villas
    // or just center on a default if unknown.
    // Let's assume some pseudo-locations for the demo.

    // For now, let's just set view to the first "found" location or global
    // Actually, without lat/lng in the DB, this is tricky.
    // I will modify the map to just show a world view or specific region.

  }, [villas, map]);

  return null;
}

const LOCATION_COORDS: Record<string, [number, number]> = {
  "Bali, Indonesia": [-8.409518, 115.188919],
  "Joshua Tree, CA": [34.1347, -116.3172],
  "Santorini, Greece": [36.3932, 25.4615],
  "Lapland, Finland": [67.9222, 26.5046],
};

export default function VillaMap({ villas, className }: MapProps) {
  // Default to 0,0
  const center: [number, number] = [20, 0];

  return (
    <MapContainer center={center} zoom={2} scrollWheelZoom={false} className={className} style={{ height: "100%", width: "100%", borderRadius: "0.5rem", zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {villas.map((villa) => {
        // Try to find coords, or randomize slightly if multiple in same place
        let coords = LOCATION_COORDS[villa.location];
        if (!coords) {
          // Random coords if not found (just for demo so map isn't empty)
           coords = [Math.random() * 160 - 80, Math.random() * 360 - 180];
        }

        return (
          <Marker key={villa.id} position={coords}>
            <Popup>
               <div className="text-sm">
                 <h3 className="font-bold">{villa.title}</h3>
                 <p>{villa.location}</p>
                 <p className="font-semibold">${villa.pricePerNight} / night</p>
                 <Link href={`/villas/${villa.id}`}>View Details</Link>
               </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
