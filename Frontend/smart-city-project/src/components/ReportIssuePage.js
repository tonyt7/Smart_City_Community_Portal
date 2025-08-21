import React, { useRef,useState } from 'react';
import axios from 'axios';
import Header from "../components/SimpleHeader";
import Footer from "../components/Footer";
import MapComponent from '../components/MapComponent';
import ReportIssueSteps from "./ReportIssueSteps";
import ReportForm from "./ReportForm";
import StatsWidget from "./StatsWidget";
import Leaderboard from "./Leaderboard";
import RecentIssuesCarousel from "./RecentIssueCarousel";
import PopularIssuesCarousel from "./PopularIssuesCarousel";
import "./ReportIssuePage.css";

const storedUser = JSON.parse(localStorage.getItem("user"));
const isLoggedIn = !!storedUser;

const ReportIssuePage = () => {
  const [postcode, setPostcode] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [latLng, setLatLng] = useState({ lat: '', lng: '' });
  const [selectedLocation, setSelectedLocation] = useState(null)
  // Called by map on click
  const handleLocationSelect = ({ lat, lng }) => {
    setLatLng({ lat, lng });
    console.log("📍 Clicked on map:", lat, lng);
    setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
  };
  const mapContainerRef = useRef();

  const scrollToMap = () => {
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  // Called by form when user clicks "Locate Me"
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatLng({ lat: latitude, lng: longitude });
      },
      () => alert("Unable to fetch location.")
    );
  };
  const handleGoClick = async () => {
    try {
      console.log("Searching for:", postcode);
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: postcode,
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        console.log("latitude values:",parseFloat(lat))
        console.log("longitude values:",lon)
        setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert("Postcode not found.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };
  return (
    <div className="report-issue-page">
      <Header />

      <main className="report-main">
      <div className="report-header">
  <h2 class="h2-icon">
    <span className="material-symbols-rounded heading-icon">report_problem</span>
    Report, view, or discuss local problems
  </h2>

  <div class="issue-tags">
  <span><i class="material-symbols-rounded">brush</i> Graffiti</span>
  <span><i class="material-symbols-rounded">delete</i> Fly tipping</span>
  <span><i class="material-symbols-rounded">light</i> Street lights</span>
</div>

  <p>
    
    (like graffiti, fly tipping, broken paving slabs, or street light outages)
  </p>

  <p class="loc-icon">
    
    <strong>Enter a nearby UK postcode, or street name and area:</strong>
  </p>
  <p>e.g. ‘B2 4QA’ or ‘Tib St, Manchester’</p>

  <div className="location-search">
    <input type="text" placeholder="Enter postcode like HP145TQ" className="postcode-input" value={postcode}
          onChange={(e) => setPostcode(e.target.value)} />
    <button className="go-button" onClick={handleGoClick}>Go</button>
  </div>

  <button className="location-button">
  <span className="material-symbols-rounded">location_on</span>
    Use my current location
  </button>
</div>
<ReportIssueSteps/>
        <div className="map-section">
          <div className="map-wrapper">
          <div className="map-container-bg">
            {/* Placeholder for now – replace with actual map component later */}
            <MapComponent center={mapCenter} onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
        </div>
        <div className={`side-tools ${!isLoggedIn ? "blurred" : ""}`}>
  {!isLoggedIn && (
    <div className="blur-overlay">
      <h3>Please log in or register to access this section.</h3>
    </div>
  )}
  <ReportForm
        latLng={latLng}
        onLocateMe={handleLocateMe}
        onSubmit={(data) => {
          // Combine with latLng before sending to backend
          console.log('Submitting:', { ...data, ...latLng });
          
        }}
        scrollToMap={scrollToMap}
      />
  <RecentIssuesCarousel />
  <PopularIssuesCarousel />
  <StatsWidget />
  </div>
        </div>
        </div>
      


      </main>

      <Footer />
    </div>
  );
};

export default ReportIssuePage;
