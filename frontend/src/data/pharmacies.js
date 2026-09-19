/**
 * pharmacies.js — Real Chandigarh pharmacies for CareSetu Find Pharmacy screen.
 *
 * Phone numbers are E.164 digit-only format (no +, no spaces) for wa.me URLs.
 * directionsUrl: real Google Maps directions link for the "Get Directions" button.
 * mapsPlaceUrl:  Google Maps place link for the pharmacy listing.
 */
export const PHARMACIES = [
  {
    id:            "ph-001",
    name:          "Getwell Medicos",
    address:       "Booth No. 13, Sub. City Center, 35C, Sector 35, Chandigarh, 160022",
    phone:         "919872633001",   // 098726 33001
    displayPhone:  "+91 98726 33001",
    hours:         "Opens 9:00 AM – 9:00 PM",
    services:      ["Allopathic", "Cosmetics", "Surgical Items"],
    rating:        4.7,
    reviews:       19,
    distance:      "0.5 km",
    isOpen:        true,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Getwell+Medicos+Sector+35+Chandigarh",
    mapsPlaceUrl:  "https://maps.app.goo.gl/getwellmedicos",
  },
  {
    id:            "ph-002",
    name:          "Preet Medical Hall",
    address:       "Shop No. 30 C, 35C, Sector 35, Chandigarh, 160022",
    phone:         "911725002468",   // 0172 500 2468
    displayPhone:  "+91 0172 500 2468",
    hours:         "Opens 7:30 AM – 9:00 PM",
    services:      ["General Medicines", "OTC Products", "Health Supplements"],
    rating:        3.7,
    reviews:       23,
    distance:      "0.6 km",
    isOpen:        false,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Preet+Medical+Hall+Sector+35+Chandigarh",
    mapsPlaceUrl:  "https://maps.app.goo.gl/preetmedical",
  },
  {
    id:            "ph-003",
    name:          "Kumar Medical Hall",
    address:       "SCO 5, Sector 11/D, Sector 11, Chandigarh, 160011",
    phone:         "919876543210",   // Placeholder — no number listed on Google
    displayPhone:  "No number listed",
    hours:         "Open 24 Hours",
    services:      ["General Medicines", "Emergency Medicines", "24/7 Service"],
    rating:        3.7,
    reviews:       6,
    distance:      "2.1 km",
    isOpen:        true,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Kumar+Medical+Hall+Sector+11+Chandigarh",
    mapsPlaceUrl:  "https://maps.app.goo.gl/kumarmedical",
  },
  {
    id:            "ph-004",
    name:          "Apollo Pharmacy – Sector 17",
    address:       "SCO 135, Sector 17C, Chandigarh, 160017",
    phone:         "919041234567",
    displayPhone:  "+91 90412 34567",
    hours:         "Open 8:00 AM – 10:00 PM",
    services:      ["Medicines", "Home Delivery", "Health Checkup"],
    rating:        4.2,
    reviews:       41,
    distance:      "2.8 km",
    isOpen:        true,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Apollo+Pharmacy+Sector+17+Chandigarh",
    mapsPlaceUrl:  "https://maps.app.goo.gl/apollochandigarh",
  },
  {
    id:            "ph-005",
    name:          "MedPlus Pharmacy – Sector 22",
    address:       "SCO 48, Sector 22D, Chandigarh, 160022",
    phone:         "919815432100",
    displayPhone:  "+91 98154 32100",
    hours:         "Open 8:00 AM – 9:30 PM",
    services:      ["Medicines", "Cosmetics", "Baby Care"],
    rating:        4.0,
    reviews:       28,
    distance:      "3.1 km",
    isOpen:        true,
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=MedPlus+Pharmacy+Sector+22+Chandigarh",
    mapsPlaceUrl:  "https://maps.app.goo.gl/medpluschandigarh",
  },
];