const db = require('./config/db');

const services = [
  { name: 'Haircut', desc: 'Trim: ₹250, Straight Cut (One Length): ₹350, U-Cut: ₹500, V-Cut: ₹600, Layer Cut: ₹500, Long Layers: ₹600, Step Cut: ₹600, Feather Cut: ₹600, Butterfly Cut: ₹500, Face-Framing Layers: ₹600, Boy Cut: ₹300, Classic Bob: ₹520, Lob (Long Bob): ₹500, Pixie Cut: ₹450, Wolf Cut: ₹650', price: 0 },
  { name: 'Hair Styling', newName: 'Styling', desc: 'Blow Dry: ₹400, Curls: ₹800, Straightening: ₹1200', price: 0 },
  { name: 'Hair Wash & Conditioning', desc: 'Hair Wash: ₹150, Conditioning: ₹250', price: 0 },
  { name: 'Hair Spa', desc: 'Basic Hair Spa: ₹900, Premium Hair Spa: ₹1500', price: 0 },
  { name: 'Hair Coloring', desc: 'Global Color: ₹1500, Highlights: ₹900, Balayage: ₹3500', price: 0 },
  { name: 'Keratin', desc: 'Keratin Treatment: ₹3500', price: 3500 },
  { name: 'Facial', desc: 'Fruit Facial: ₹700, Gold Facial: ₹800, Diamond Facial: ₹900, Anti-aging Facial: ₹1000', price: 0 },
  { name: 'Cleanup', desc: 'Cleanup: ₹600', price: 600 },
  { name: 'Bleach', desc: 'Face Bleach: ₹400, Full Body Bleach: ₹900', price: 0 },
  { name: 'Detan', desc: 'Face Detan: ₹500, Full Body Detan: ₹1300', price: 0 },
  { name: 'Threading', desc: 'Eyebrows: ₹40, Upper Lips: ₹30, Forehead: ₹30', price: 0 },
  { name: 'Face massage', newName: 'Face Massage', desc: 'Face Massage: ₹400', price: 400 },
  { name: 'Waxing', desc: 'Honey Wax Full Body: ₹1500, Honey Wax Arms: ₹250, Honey Wax Legs: ₹350, Honey Wax Underarms: ₹80, Rica Wax Full Body: ₹2500', price: 0 },
  { name: 'Body polishing', newName: 'Body Polishing', desc: 'Body Polishing: ₹2500', price: 2500 },
  { name: 'Body spa', newName: 'Body Spa', desc: 'Body Spa: ₹2500', price: 2500 },
  { name: 'Body massage', newName: 'Body Massage', desc: 'Basic Massage: ₹1200, Aromatherapy / Swedish: ₹2000', price: 0 },
  { name: 'Party makeup', newName: 'Party Makeup', desc: 'Party Makeup: ₹3000', price: 3000 },
  { name: 'Engagement makeup', newName: 'Engagement Makeup', desc: 'Engagement Makeup: ₹6000', price: 6000 },
  { name: 'Bridal makeup', newName: 'Bridal Makeup', desc: 'Bridal Makeup: ₹12000', price: 12000 },
  { name: 'HD / Airbrush makeup', newName: 'Airbrush Makeup', desc: 'Airbrush Makeup: ₹15000', price: 15000 }
];

const updateAll = async () => {
  try {
    for (const s of services) {
      await db.execute(
        "UPDATE services SET description = ?, price = ?, name = ? WHERE name = ? OR name = ?", 
        [s.desc, s.price, s.newName || s.name, s.name, s.newName || s.name]
      );
    }
    console.log("Updated live database dynamically.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
updateAll();
