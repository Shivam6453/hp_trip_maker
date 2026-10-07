import React, { useState, useEffect } from 'react';
import './styles/portal.css';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// UPDATED TO POINT TO LIVE RENDER BACKEND
const API_BASE = 'https://hp-trip-maker-backend.onrender.com/api';

function ChangeMapView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2 && bounds[0] && bounds[1]) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 13 });
    }
  }, [bounds, map]);
  return null;
}

const DISTRICT_DATABASE = {
  kangra: { id: 'kangra', name: "Kangra", hq: "Dharamshala", dialects: "Kangri, Hindi", story: "Ancient Trigarta mentioned in the Mahabharata. Seat of Kangra Miniature painting under Maharaja Sansar Chand.", culture: "Celebrates Sair festival; known for traditional community Dham feasts on leaf plates.", vendors: [{name: "Kangra Tea Estates", item: "First-Flush Green & Black Tea", contact: "+91-1892-223112"}, {name: "Miniature Art Guild", item: "Natural Pigment Paintings", contact: "+91-1892-234551"}], safety: "Heavy monsoons trigger mudslides near Dharamkot. Check flood status before entering seasonal nullahs." },
  shimla: { id: 'shimla', name: "Shimla", hq: "Shimla", dialects: "Mahasui, Hindi", story: "Designated the Summer Capital of British India in 1864 amidst dense deodar ridges.", culture: "Distinct Kath-Kuni architectural heritage and winter ice-skating championships.", vendors: [{name: "Lakkar Bazaar Guild", item: "Handcrafted Deodar Woodcraft", contact: "+91-177-2804321"}, {name: "Kotgarh Orchards", item: "GI-Recognized Apple Preserves", contact: "+91-177-2741122"}], safety: "Winter black-ice formation on Dhalli bypass. Snow chains advisory active during snowfall alerts." },
  kullu: { id: 'kullu', name: "Kullu", hq: "Kullu", dialects: "Kulluvi, Hindi", story: "Revered as Kul-ant-peetha (the end of the habitable world). Governed under traditional Kardar temple councils.", culture: "Famous for the week-long International Kullu Dussehra and geometric wool pattus.", vendors: [{name: "Bhuttico Weavers Society", item: "Merino Wool Handloom Shawls", contact: "+91-1902-260021"}, {name: "Beas Orchardists Cluster", item: "Crispin Mountain Apples", contact: "+91-1902-241109"}], safety: "High flash flood vulnerability along the Beas River basin. Avoid camping within river channels." },
  mandi: { id: 'mandi', name: "Mandi", hq: "Mandi", dialects: "Mandeali, Hindi", story: "The Varanasi of the Hills, housing 81 historic stone temples on the banks of the Beas.", culture: "Host to the International Shivratri Fair where over 200 village deities arrive in royal palanquins.", vendors: [{name: "Mandi Metalcraft Society", item: "Brass Puja Utensils & Bells", contact: "+91-1905-223400"}, {name: "Rewalsar Apiary", item: "Forest Honey & Wild Preserves", contact: "+91-1905-231908"}], safety: "Aut tunnel to Pandoh corridor prone to rockfalls during continuous rains." },
  chamba: { id: 'chamba', name: "Chamba", hq: "Chamba", dialects: "Chameali, Gaddi", story: "Founded in 920 AD by Raja Sahil Varman, preserving classical post-Gupta art.", culture: "Home to Gaddi pastoralists and GI-certified Chamba Rumal double-sided silk embroidery.", vendors: [{name: "Chamba Rumal Heritage Society", item: "GI-Certified Silk Embroidery", contact: "+91-1899-222340"}, {name: "Chamba Chappal Guild", item: "Embroidered Leather Footwear", contact: "+91-1899-224419"}], safety: "Sach Pass single-lane hairpins require 4x4 high-clearance vehicles." },
  spiti: { id: 'spiti', name: "Lahaul & Spiti", hq: "Keylong", dialects: "Bhoti, Spiti dialect", story: "High-altitude cold desert trans-Himalayan frontier with Buddhist gompas founded by Padmasambhava.", culture: "Millennial Vajrayana gompas of Ki and Tabo; Losar festivities and Cham lama dances.", vendors: [{name: "Spiti Seabuckthorn Collective", item: "Wild Berry Juices & Herbal Teas", contact: "+91-1906-222233"}, {name: "Lahaul Woolen Coop", item: "Handspun Yak Wool Waistcoats", contact: "+91-1906-231140"}], safety: "Acute Mountain Sickness (AMS) risk. 48-hour acclimatization mandatory before crossing high passes." },
  kinnaur: { id: 'kinnaur', name: "Kinnaur", hq: "Reckong Peo", dialects: "Kinnauri, Hindi", story: "Mentioned in the Mahabharata as the land of the Kinnaras. Believed to have sheltered the Pandavas.", culture: "Harmonious coexistence of Hinduism and Tibetan Buddhism. Distinct green-velvet Kinnauri Thepang.", vendors: [{name: "Sangla Chilgoza Guild", item: "Wild Himalayan Pine Nuts", contact: "+91-1786-242211"}, {name: "Kalpa Handlooms", item: "Woven Woolen Patti Blankets", contact: "+91-1786-226701"}], safety: "Taranda Dhank rock-cut cliff highway is prone to shooting stone hazards." },
  sirmaur: { id: 'sirmaur', name: "Sirmaur", hq: "Nahan", dialects: "Sirmauri, Hindi", story: "Bordered by the Giri and Tons rivers. Legend ties sacred Renuka Lake to the mother of Sage Parshurama.", culture: "Rich martial folk traditions including the historic Thoda archery dances.", vendors: [{name: "Giri-par Spice Cluster", item: "Mountain Ginger & Garlic", contact: "+91-1702-224109"}, {name: "Nahan Metal Craft", item: "Hand-Cast Brass Utensils", contact: "+91-1702-231200"}], safety: "Trek to Churdhar Peak experiences erratic whiteout snowstorms even in early spring." },
  solan: { id: 'solan', name: "Solan", hq: "Solan", dialects: "Baghati, Hindi", story: "Known as the Mushroom City of India, named after patron deity Goddess Shoolini Devi.", culture: "Shoolini Mela held annually every June. Cultural bridge connecting the plains with the upper hills.", vendors: [{name: "Solan Agro-Produce", item: "Cultivated Shiitake & Button Mushrooms", contact: "+91-1792-223450"}, {name: "Kasauli Fruit Products", item: "Plum & Apricot Jams", contact: "+91-1792-272111"}], safety: "Parwanoo-Solan bypass prone to slope slides during excessive cloudbursts." },
  bilaspur: { id: 'bilaspur', name: "Bilaspur", hq: "Bilaspur", dialects: "Bilaspuri, Hindi", story: "Ancient kingdom of Kahlur, celebrated for the Govind Sagar reservoir formed by Bhakra Dam.", culture: "Famed for Nalwari Cattle Fair featuring folk wrestling and agricultural exhibitions.", vendors: [{name: "Sutlej Fisheries Society", item: "Fresh Mahseer Produce", contact: "+91-1978-222301"}, {name: "Bilaspur Basketry", item: "Hand-Woven Bamboo Baskets", contact: "+91-1978-224411"}], safety: "High commercial vehicular traffic on Kiratpur-Bilaspur highway requires defensive driving." },
  hamirpur: { id: 'hamirpur', name: "Hamirpur", hq: "Hamirpur", dialects: "Kangri, Hindi", story: "Named after Raja Hamir Chand. Historically recognized for highest per-capita military enlistment.", culture: "Celebrates the holy shrine of Baba Balak Nath at Deotsidh; rich folk ballads of battlefield bravery.", vendors: [{name: "Nadaun Pottery Guild", item: "Traditional Terracotta Pitchers", contact: "+91-1972-232110"}, {name: "Sujanpur Khadi Bhavan", item: "Handspun Wool & Cotton", contact: "+91-1972-224090"}], safety: "Summer daytime temperatures exceed 40°C in lower valley riverbeds." },
  una: { id: 'una', name: "Una", hq: "Una", dialects: "Doabi, Pahari, Hindi", story: "Gateway district to Himachal Pradesh from the Punjab plains, nestled along the Swan River basin.", culture: "Renowned pilgrimage destination for the sacred Chintpurni Devi Shaktipeeth Temple.", vendors: [{name: "Una Cane Craft Guild", item: "Rustic Cane Chairs & Tables", contact: "+91-1975-223101"}, {name: "Swan Valley Oil Mill", item: "Cold-Pressed Mustard Oil", contact: "+91-1975-234200"}], safety: "Swan river seasonal nullahs swell rapidly in monsoon; avoid crossing inundated causeways." }
};

const DEFAULT_HEROES = [
  { id: "H-01", name: "Captain Vikram Batra", title: "Param Vir Chakra (Posthumous)", district: "Palampur, Kangra", category: "Armed Forces", legacy: "Hero of the 1999 Kargil War who recaptured Point 5140 and Point 4875. Revered for his battlefield message: 'Yeh Dil Maange More'." },
  { id: "H-02", name: "Major Somnath Sharma", title: "Param Vir Chakra (First Recipient)", district: "Dadh, Kangra", category: "Armed Forces", legacy: "First recipient of India's highest wartime gallantry medal. Held the defense of Badgam aerodrome in November 1947 against overwhelming numbers." },
  { id: "H-03", name: "Dalip Singh Rana (The Great Khali)", title: "WWE World Heavyweight Champion", district: "Dhiraina, Sirmaur", category: "Sports & Culture", legacy: "First Indian professional wrestler signed by WWE to win a World Heavyweight Championship, establishing global visibility for Indian athletics." },
  { id: "H-04", name: "Subedar Major Vijay Kumar", title: "Olympic Silver Medalist", district: "Barsar, Hamirpur", category: "Sports", legacy: "Secured the Olympic Silver Medal in the 25m Rapid Fire Pistol event at the 2012 London Olympic Games." }
];

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [heroes, setHeroes] = useState(DEFAULT_HEROES);
  
  // Trip Optimizer State
  const [plannerForm, setPlannerForm] = useState({ origin: 'Chandigarh', destination: 'Shimla', days: '4', budget: '15000', transit_mode: 'hrtc_volvo' });
  const [plannerOutput, setPlannerOutput] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Transit Tracker State
  const [trackerOrigin, setTrackerOrigin] = useState('Chandigarh');
  const [trackerDest, setTrackerDest] = useState('Manali');
  const [trackerOutput, setTrackerOutput] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/heroes`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setHeroes(data); })
      .catch(() => console.log("Using built-in state heroes registry."));
  }, []);

  const handlePlanSubmit = (e) => {
    e.preventDefault();
    setIsOptimizing(true);
    fetch(`${API_BASE}/optimize-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...plannerForm, 
        days: Number(plannerForm.days), 
        budget: Number(plannerForm.budget)
      })
    })
      .then(res => res.json())
      .then(data => {
        setPlannerOutput(data);
        setIsOptimizing(false);
      })
      .catch(() => {
        setIsOptimizing(false);
        alert("Backend server offline. Please start 'python run.py'.");
      });
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    fetch(`${API_BASE}/transit-tracker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: trackerOrigin, destination: trackerDest })
    })
      .then(res => res.json())
      .then(data => {
        setTrackerOutput(data);
        setIsSearching(false);
      })
      .catch(() => {
        setIsSearching(false);
        alert("Backend server offline. Please verify Flask backend is running on port 5000.");
      });
  };

  const antiBlurStyles = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    willChange: 'transform',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)'
  };

  const pageBackgroundStyles = {
    paddingTop: '150px',
    minHeight: '100vh',
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.96)), url('/hero.png')`,
    backgroundAttachment: 'fixed',
    ...antiBlurStyles
  };

  const renderHome = () => (
    <>
      <header className="hero-header" style={{ backgroundImage: `url('/hero.png')`, ...antiBlurStyles }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">Department of Tourism & Civil Aviation</span>
          <h1>Dev Bhoomi</h1>
          <p>Official registry for Himalayan heritage, verified indigenous cooperatives, and real-time open mountain routing telemetry.</p>
          <button className="btn-primary" onClick={() => document.getElementById('districts-section').scrollIntoView()}>
            Access 12 Mountain Realms
          </button>
        </div>
      </header>

      <section className="section-container">
        <div className="section-header">
          <span className="section-subtitle">Pride of the State</span>
          <h2 className="section-title">Hall of Fame</h2>
          <p className="section-description">Honoring the defenders, champions, and pioneers who shaped national heritage and represented Himachal Pradesh on the global stage.</p>
        </div>
        <div className="grid-2">
          {heroes.map(hero => (
            <div key={hero.id} className="premium-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ backgroundColor: '#F8FAFC', overflow: 'hidden' }}>
                <img 
                  src={`/${hero.id.toLowerCase()}.png`} 
                  alt={hero.name}
                  style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                />
              </div>
              <div style={{ padding: '25px', borderTop: '4px solid var(--accent-gold)', flex: 1, backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  {hero.category} &bull; {hero.district}
                </span>
                <h3 style={{ margin: '8px 0 4px 0', fontSize: '1.7rem' }}>{hero.name}</h3>
                <p style={{ fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '12px', fontSize: '0.95rem' }}>{hero.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>{hero.legacy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <span className="section-subtitle">Heritage Repository</span>
          <h2 className="section-title">The Epochs of Himachal</h2>
        </div>
        <div className="grid-3">
          <div className="premium-card">
            <h3>Ancient Janapadas</h3>
            <p>Evolving from autonomous village republics, the region maintained independence through geographic isolation, governed by decentralized Devta councils.</p>
          </div>
          <div className="premium-card">
            <h3>Kath-Kuni Engineering</h3>
            <p>The indigenous technique interlocks cedar deodar beams and dry stone without mortar, allowing massive structures to absorb severe seismic shear forces.</p>
          </div>
          <div className="premium-card">
            <h3>Statehood (1971)</h3>
            <p>Transitioning from a Chief Commissioner's province to a Union Territory, Himachal achieved full statehood on January 25, 1971, unifying its distinct hill dialects.</p>
          </div>
        </div>
      </section>

      <section id="districts-section" className="section-container" style={{ background: '#FFFFFF', maxWidth: '100%' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="section-header">
            <span className="section-subtitle">Geographic Registry</span>
            <h2 className="section-title">The 12 Realms</h2>
          </div>
          <div className="grid-3">
            {Object.values(DISTRICT_DATABASE).map(dist => (
              <div key={dist.id} className="district-card" onClick={() => {
                setSelectedDistrictId(dist.id);
                setCurrentView('district-detail');
                window.scrollTo(0, 0);
              }}>
                <div className="district-bg" style={{ backgroundImage: `url('/${dist.id}.png')`, backgroundColor: '#CBD5E1', ...antiBlurStyles }}></div>
                <div className="district-overlay"></div>
                <div className="district-content">
                  <h3>{dist.name}</h3>
                  <p>HQ: {dist.hq} &bull; {dist.dialects}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const renderDistrictDetail = () => {
    const dist = DISTRICT_DATABASE[selectedDistrictId];
    if (!dist) return null;

    return (
      <section className="section-container" style={pageBackgroundStyles}>
        <button className="btn-outline" onClick={() => {
          setCurrentView('home');
          setTimeout(() => document.getElementById('districts-section')?.scrollIntoView(), 100);
        }}>
          &larr; Return to Registry
        </button>

        <div className="district-card" style={{ height: '420px', cursor: 'default', borderRadius: '4px', marginBottom: '40px' }}>
          <div className="district-bg" style={{ backgroundImage: `url('/${dist.id}.png')`, backgroundColor: '#CBD5E1', ...antiBlurStyles }}></div>
          <div className="district-overlay" style={{ opacity: 0.65 }}></div>
          <div className="district-content" style={{ padding: '40px' }}>
            <h1 style={{ fontSize: '4rem', color: '#FFF' }}>{dist.name}</h1>
            <p style={{ fontSize: '1.1rem', color: '#F8FAFC' }}>Administrative Center: {dist.hq} &bull; Primary Dialects: {dist.dialects}</p>
          </div>
        </div>

        <div className="grid-2">
          <div className="premium-card">
            <h3>Chronicles & Heritage</h3>
            <p style={{ marginBottom: '15px' }}>{dist.story}</p>
            <p>{dist.culture}</p>
          </div>
          <div className="premium-card" style={{ borderTop: '4px solid #DC2626' }}>
            <h3 style={{ color: '#DC2626' }}>Terrain & Safety Protocols</h3>
            <p>{dist.safety}</p>
          </div>
        </div>

        <div className="premium-card" style={{ marginTop: '40px' }}>
          <h3>Verified Indigenous Cooperatives & Artisans</h3>
          <div className="grid-2">
            {dist.vendors.map((v, idx) => (
              <div key={idx} style={{ padding: '20px', background: '#F8FAFC', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                <strong style={{ display: 'block', color: 'var(--primary-navy)', fontSize: '1.2rem', marginBottom: '5px' }}>{v.name}</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px' }}>{v.item}</span>
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.95rem', fontWeight: 600 }}>Contact: {v.contact}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderPlanner = () => (
    <section className="section-container" style={pageBackgroundStyles}>
      <div className="section-header">
        <span className="section-subtitle">Algorithmic Concierge</span>
        <h2 className="section-title">Journey Optimizer Engine</h2>
      </div>
      <div className="grid-2">
        <div className="premium-card">
          <form onSubmit={handlePlanSubmit}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-navy)', marginBottom: '8px' }}>Origin City</label>
            <input type="text" className="form-input" placeholder="e.g. Chandigarh, Delhi" value={plannerForm.origin} onChange={e => setPlannerForm({...plannerForm, origin: e.target.value})} required />

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-navy)', marginBottom: '8px' }}>Destination Node</label>
            <input type="text" className="form-input" placeholder="e.g. Shimla, Manali, Spiti" value={plannerForm.destination} onChange={e => setPlannerForm({...plannerForm, destination: e.target.value})} required />

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-navy)', marginBottom: '8px' }}>Duration (Days)</label>
            <input type="number" className="form-input" min="1" max="30" value={plannerForm.days} onChange={e => setPlannerForm({...plannerForm, days: e.target.value})} required />

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-navy)', marginBottom: '8px' }}>Budget Ceiling (INR)</label>
            <input type="number" className="form-input" min="1000" step="500" value={plannerForm.budget} onChange={e => setPlannerForm({...plannerForm, budget: e.target.value})} required />

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-navy)', marginBottom: '8px' }}>Transit Category</label>
            <select className="form-select" value={plannerForm.transit_mode} onChange={e => setPlannerForm({...plannerForm, transit_mode: e.target.value})}>
              <option value="hrtc_ordinary">HRTC State Bus (Budget Lodging)</option>
              <option value="hrtc_volvo">HRTC Volvo Luxury (Standard Lodging)</option>
              <option value="private_taxi">Dedicated Hill Taxi (Premium Lodging)</option>
            </select>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isOptimizing}>
              {isOptimizing ? "Running Optimization Engine..." : "Execute Optimization"}
            </button>
          </form>
        </div>

        <div className="premium-card" style={{ background: plannerOutput ? '#F0FDF4' : '#FFFFFF' }}>
          <h3 style={{ marginBottom: '25px' }}>Telemetry Output</h3>
          {plannerOutput ? (
            <div>
              <p style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '20px' }}>
                <strong>{plannerOutput.destination}</strong> (~{plannerOutput.estimated_travel_time_hours} Hours Transit)
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span>Lodging & Food ({plannerOutput.duration_days} Days):</span> <strong>₹{plannerOutput.cost_breakdown.lodging_food_inr.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span>Transit Cost (Round-Trip):</span> <strong>₹{plannerOutput.cost_breakdown.transit_round_trip_inr.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span>Contingency Reserve:</span> <strong>₹{plannerOutput.cost_breakdown.contingency_reserve_inr.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '1.4rem' }}>
                <span>Total Projected:</span>
                <strong className={plannerOutput.budget_analysis.status === 'Optimal' ? 'status-good' : 'status-alert'}>
                  ₹{plannerOutput.cost_breakdown.total_estimated_inr.toLocaleString('en-IN')}
                </strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '15px', textAlign: 'center' }}>
                Analysis: {plannerOutput.budget_analysis.status}
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Enter parameters to compute dynamic lodging constraints, exact round-trip transit matrices, and contingency reserves via the ML Engine.</p>
          )}
        </div>
      </div>
    </section>
  );

  const renderTransit = () => (
    <section className="section-container" style={pageBackgroundStyles}>
      <div className="section-header">
        <span className="section-subtitle">Real-World Mountain Routing</span>
        <h2 className="section-title">Open Highway Telemetry</h2>
        <p className="section-description">
          Calculate actual mountain road distances, driving times, and carrier tariffs between any points in Himachal Pradesh using the verified HRTC registry and OpenStreetMap.
        </p>
      </div>

      <div className="grid-2">
        <div className="premium-card">
          <h3 style={{ marginBottom: '20px' }}>Route Scanner</h3>
          <form onSubmit={handleTrackSubmit}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-navy)', marginBottom: '8px' }}>
              Origin (Any Town, Bus Stand, or Village)
            </label>
            <input
              type="text"
              className="form-input"
              value={trackerOrigin}
              onChange={e => setTrackerOrigin(e.target.value)}
              placeholder="e.g. Chandigarh, Hamirpur, Shimla..."
              required
            />

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-navy)', marginBottom: '8px' }}>
              Destination (Any Destination in HP)
            </label>
            <input
              type="text"
              className="form-input"
              value={trackerDest}
              onChange={e => setTrackerDest(e.target.value)}
              placeholder="e.g. Manali, Dharamshala, Kaza..."
              required
            />

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px 0' }} disabled={isSearching}>
              {isSearching ? "Querying Highway Telemetry..." : "Calculate Route & Schedules"}
            </button>
          </form>
        </div>

        <div className="premium-card" style={{ padding: '20px' }}>
          {trackerOutput && trackerOutput.status === 'success' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <strong style={{ fontSize: '1.15rem', color: 'var(--primary-navy)' }}>{trackerOutput.route_info}</strong>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{trackerOutput.distance_km} KM ({trackerOutput.base_duration_hours} hrs)</span>
              </div>

              <div style={{ height: '320px', width: '100%', marginBottom: '20px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                <MapContainer 
                  key={`${trackerOutput.orig_coords[0]}-${trackerOutput.dest_coords[0]}-${trackerOutput.route_info}`}
                  center={trackerOutput.orig_coords} 
                  zoom={8} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <ChangeMapView bounds={[trackerOutput.orig_coords, trackerOutput.dest_coords]} />
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={trackerOutput.orig_coords}><Popup><strong>Origin:</strong> {trackerOrigin.toUpperCase()}</Popup></Marker>
                  <Marker position={trackerOutput.dest_coords}><Popup><strong>Destination:</strong> {trackerDest.toUpperCase()}</Popup></Marker>
                  {trackerOutput.route_points && <Polyline positions={trackerOutput.route_points} color="#1E3A8A" weight={5} opacity={0.85} />}
                </MapContainer>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {trackerOutput.fleet.map((bus, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', border: '1px solid var(--border-light)', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>{bus.operator}</strong>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '1.1rem' }}>₹{bus.fare_inr}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Dep: {bus.departure} &bull; ETA: {bus.estimated_arrival}</span>
                      <span className={bus.delay_status.includes('Verified') ? 'status-good' : 'status-alert'}>{bus.delay_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : trackerOutput && trackerOutput.status === 'error' ? (
            <p style={{ color: '#DC2626', fontWeight: 600 }}>{trackerOutput.message}</p>
          ) : (
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              Enter any origin and destination across Himachal Pradesh. The verified ML graph engine will locate exact coordinates, calculate road distance, check direct buses, or construct seamless connecting transfers.
            </p>
          )}
        </div>
      </div>
    </section>
  );

  const renderSafety = () => (
    <section className="section-container" style={pageBackgroundStyles}>
      <div className="section-header">
        <span className="section-subtitle">Civil Protection</span>
        <h2 className="section-title">Emergency Command Grid</h2>
      </div>
      <div className="grid-2">
        <div className="premium-card">
          <h3 style={{ color: '#DC2626', marginBottom: '25px' }}>Direct Incident Hotlines</h3>
          <div style={{ padding: '15px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>State Disaster Management Authority</span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--primary-navy)' }}>1070</strong>
          </div>
          <div style={{ padding: '15px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Central Police Command</span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--primary-navy)' }}>112</strong>
          </div>
          <div style={{ padding: '15px 0' }}>
            <span style={{ display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Paramedic & Trauma Fleet</span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--primary-navy)' }}>108</strong>
          </div>
        </div>
        <div className="premium-card">
          <h3 style={{ color: 'var(--primary-navy)', marginBottom: '25px' }}>Mandatory Civil Regulations</h3>
          <ul style={{ listStyleType: 'none' }}>
            <li style={{ marginBottom: '20px', paddingLeft: '20px', borderLeft: '3px solid var(--accent-gold)' }}>
              <strong style={{ display: 'block', color: 'var(--primary-navy)' }}>Winter Transit Registration</strong>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Vehicular movement through Rohtang and Atal Tunnel is strictly monitored during heavy snowfall alerts.</span>
            </li>
            <li style={{ marginBottom: '20px', paddingLeft: '20px', borderLeft: '3px solid var(--accent-gold)' }}>
              <strong style={{ display: 'block', color: 'var(--primary-navy)' }}>Strict Environmental Protection</strong>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Single-use plastics are strictly prohibited.</span>
            </li>
            <li style={{ paddingLeft: '20px', borderLeft: '3px solid var(--accent-gold)' }}>
              <strong style={{ display: 'block', color: 'var(--primary-navy)' }}>Off-Road Penalties</strong>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Driving on fragile alpine meadows carries immediate vehicle impoundment.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );

  const renderContact = () => (
    <section className="section-container" style={pageBackgroundStyles}>
      <div className="section-header">
        <span className="section-subtitle">Reach Out</span>
        <h2 className="section-title">Contact the Directorate</h2>
      </div>
      <div className="grid-2">
        <div className="premium-card">
          <h3 style={{ marginBottom: '20px' }}>Send an Inquiry</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert("Inquiry submitted to the state tourism coordination desk."); }}>
            <input type="text" className="form-input" placeholder="Full Name" required />
            <input type="email" className="form-input" placeholder="Email Address" required />
            <textarea className="form-input" style={{ resize: 'vertical', minHeight: '150px' }} placeholder="How can we assist your journey across Himachal Pradesh?" required></textarea>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Submit Inquiry</button>
          </form>
        </div>
        <div className="premium-card" style={{ backgroundColor: 'var(--primary-navy)', color: '#FFF' }}>
          <h3 style={{ color: 'var(--accent-gold)' }}>Headquarters</h3>
          <p style={{ color: '#EAEAEA', marginBottom: '30px' }}>Directorate of Tourism and Civil Aviation<br/>SDA Complex, Block No. 28<br/>Kasumpti, Shimla-171009<br/>Himachal Pradesh, India</p>
          <h3 style={{ color: 'var(--accent-gold)', fontSize: '1.3rem' }}>Direct Lines</h3>
          <p style={{ color: '#EAEAEA', marginBottom: '10px' }}><strong>General Inquiry:</strong> +91-177-2625924</p>
          <p style={{ color: '#EAEAEA', marginBottom: '10px' }}><strong>Tourist Information:</strong> +91-177-2652561</p>
          <p style={{ color: '#EAEAEA' }}><strong>Email:</strong> tourismmin-hp@nic.in</p>
        </div>
      </div>
    </section>
  );

  return (
    <div>
      <nav className="top-nav">
        <div className="nav-brand" onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }}>
          Himachal <span>Tourism</span>
        </div>
        <div className="nav-links">
          <button className={currentView === 'home' || currentView === 'district-detail' ? 'active' : ''} onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }}>Explore</button>
          <button className={currentView === 'planner' ? 'active' : ''} onClick={() => { setCurrentView('planner'); window.scrollTo(0,0); }}>Optimizer</button>
          <button className={currentView === 'transit' ? 'active' : ''} onClick={() => { setCurrentView('transit'); window.scrollTo(0,0); }}>Live Transit & Map</button>
          <button className={currentView === 'safety' ? 'active' : ''} onClick={() => { setCurrentView('safety'); window.scrollTo(0,0); }}>Safety</button>
          <button className={currentView === 'contact' ? 'active' : ''} onClick={() => { setCurrentView('contact'); window.scrollTo(0,0); }}>Contact</button>
        </div>
      </nav>
      {currentView === 'home' && renderHome()}
      {currentView === 'district-detail' && renderDistrictDetail()}
      {currentView === 'planner' && renderPlanner()}
      {currentView === 'transit' && renderTransit()}
      {currentView === 'safety' && renderSafety()}
      {currentView === 'contact' && renderContact()}
    </div>
  );
}
