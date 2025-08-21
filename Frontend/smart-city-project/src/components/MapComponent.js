import React, { useRef, useEffect, useState, } from "react";
import { MapContainer, TileLayer, Marker, Popup,useMap,useMapEvents} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from "axios";
import L from "leaflet";
import "./MapComponent.css";
import "./ReportIssuePage.css";

//Fix missing default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userMarkerIcon = new L.Icon({
  iconUrl: '/icons/grafiti.png',
  iconSize: [32, 32],
});
const MapUpdater = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 14); // Zoom level 14 or adjust to fit your preference
    }
  }, [center, map]);

  return null;
};
const ClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng });
    },
  });
  return null;
};

const FlyToController = ({ flyToCoords, markerRefs }) => {
  const map = useMap();

  useEffect(() => {
    if (flyToCoords) {
      const { lat, lng, id } = flyToCoords;
      map.flyTo([parseFloat(lat), parseFloat(lng)], 17, {
        duration: 1.5,
      });

      // Open popup after a short delay
      setTimeout(() => {
        if (markerRefs.current[id]) {
          markerRefs.current[id].openPopup();
        }
      }, 1600); // matches flyTo duration
    }
  }, [flyToCoords, markerRefs, map]);

  return null;
};
const statusColors = {
  "Open": "#f70d1a",          // red
  "In-Review": "#ffc107",     // yellow
  "In-Progress": "#ffc107",   // optional alias
  "Resolved": "#28a745",      // green
};
// Icons based on category
const categoryIcons = {
  pothole: new L.Icon({ iconUrl: "/icons/pothole.png", iconSize: [50, 50] }),
  graffiti: new L.Icon({ iconUrl: "/icons/grafiti.png", iconSize: [50, 50] }),
  default: new L.Icon({ iconUrl: "/icons/issues.png", iconSize: [50, 50] })
};



const MapComponent = ({ center, onLocationSelect,selectedLocation }) => {
  const defaultPosition = [51.505, -0.09];
  const[isMapReady, setIsMapReady] =useState(false);
  const mapRef=useRef();
  const [flyToTarget, setFlyToTarget] = useState(null);
  const markerRefs = useRef({});
  
  const [issues, setIssues] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Open");
  const [selectedCategory, setSelectedCategory] = useState("Everything");
  const [userVotes, setUserVotes] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  

  useEffect(() => {
    axios.get("http://localhost:5000/api/issues/all")
      .then(res => setIssues(res.data))
      .catch(err => console.error("Failed to fetch issues:", err));
  }, []);

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  axios.get(`http://localhost:5000/api/issues/user-votes/${user.id}`)
    .then(res => setUserVotes(res.data))
    .catch(err => console.error("❌ Failed to fetch user votes:", err));
}, []);
  const filteredIssues = issues.filter(issue => {
    return (
      (selectedStatus === "All" || issue.status === selectedStatus) &&
      (selectedCategory === "Everything" || issue.category === selectedCategory)
    );
  });

const refreshIssues = () => {
  axios.get("http://localhost:5000/api/issues/all")
    .then(res => setIssues(res.data))
    .catch(err => console.error("❌ Failed to refresh issues:", err));
}
const handleUpvote = async (issueId) => {
  if (!user || !user.id) return alert("Please log in to vote");

  try {
    await axios.post(`http://localhost:5000/api/issues/${issueId}/vote`, {
      user_id: user.id,          // ✅ required by backend
      vote_type: "upvote",       // ✅ matches backend logic
    });
    refreshIssues();             // 🔄 re-fetch to update UI
  } catch (err) {
    console.error("❌ Upvote error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Voting failed");
  }
};

const handleDownvote = async (issueId) => {
  if (!user || !user.id) return alert("Please log in to vote");

  try {
    await axios.post(`http://localhost:5000/api/issues/${issueId}/vote`, {
      user_id: user.id,
      vote_type: "downvote",
    });
    refreshIssues();
  } catch (err) {
    console.error("❌ Downvote error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Voting failed");
  }
};

  const getStatusIconWithBackground = (category, status) => {
  const categoryIconUrl = categoryIcons[category.toLowerCase()]?.options.iconUrl || categoryIcons.default.options.iconUrl;
  const bgColor = statusColors[status] || "#999";

  return L.divIcon({
    className: "",
    html: `
      <div class="status-icon-circle" style="background-color: ${bgColor}">
        <img src="${categoryIconUrl}" class="status-icon-image" />
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],  // center bottom point
    popupAnchor: [0, -40]
  });
};


  
  console.log("🔍 Center value received:", center);
  return (
    
    <div style={{ display: 'flex', backgroundColor: '#fff' }}>
      <div className='map-placeholder' style={{ position:'relative', border: '4px solid #000', width: '69%', height: '600px' }}>
      <MapContainer
  center={center || defaultPosition}
  zoom={13}
  style={{ height: '100%', width: '100%' }}
  whenCreated={(map) => {
    console.log("✅ Map initialized");
    mapRef.current = map;
    console.log("🗺️ mapRef.current now set:", mapRef.current);

    setIsMapReady(true);
  }}
>  
<TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ClickHandler onMapClick={onLocationSelect} />
          {selectedLocation?.lat && selectedLocation?.lng &&  (
             <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={userMarkerIcon}>
             <Popup>Selected Location</Popup>
           </Marker>
)}

          {filteredIssues.map(issue => (
            
            <Marker
              key={issue.id}
              position={[issue.latitude, issue.longitude]}
              icon={getStatusIconWithBackground(issue.category, issue.status)}
              ref={(ref) => {
    if (ref) markerRefs.current[issue.id] = ref;
  }}
            >
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <img src={`http://localhost:5000/uploads/${issue.image_path}`} alt="Issue" style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                  <h4>{issue.title}</h4>
                  <p>{issue.description}</p>
                  <p>Status: <strong>{issue.status}</strong></p>
                   </div>
              </Popup>
            </Marker>
            
            
          ))}
          <MapUpdater center={center} />
          <FlyToController flyToCoords={flyToTarget} markerRefs={markerRefs} />

          
        </MapContainer>
        <div className="color-guide" style={{ marginTop: "20px" }}>
          <h4>🧭 Marker Color Guide</h4>
          <ul>
            <li><img src="/icons/pothole.png" alt="Pothole" width="30" /> Pothole</li>
            <li><img src="/icons/grafiti.png" alt="Graffiti" width="30" /> Graffiti</li>
            <li><img src="/icons/issues.png" alt="Other" width="30" /> Other</li>
          </ul>
        </div>
      </div>

      {/* Sidebar Filters */}
      <div className="sidebar" style={{ width: '30%', padding: '20px' }}>
      <h2><i class="fa-solid fa-file-contract"></i> Community Issues</h2>
        <div className="filters">
          <label>
            Report Status
            <select onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="Open">Open</option>
              <option value="In-Review">In-Review</option>
              <option value="Resolved">Resolved</option>
              <option value="All">All</option>
            </select>
          </label>

          <label>
            Category
            <select onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="Everything">Everything</option>
              <option value="pothole">Pothole</option>
              <option value="graffiti">Graffiti</option>
            </select>
          </label>
          <label>
            Sort By
            <select onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="Everything">Most Upvoted</option>
              <option value="pothole">Newest</option>
              <option value="graffiti">Oldest</option>
            </select>
          </label>
        </div>
        <div className="issue-scroll-list" style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '20px' }}>
  {filteredIssues.map(issue => {
     const hasVoted = userVotes.some(v => v.issue_id === issue.id);

      return (
    <div key={issue.id} className="issue-scroll-card" >
      <h5>{issue.title}</h5>
      <p>{issue.description}</p>
      <div className="vote-actions">
            <button onClick={() => handleUpvote(issue.id)} disabled={hasVoted}><span className="material-symbols-rounded">thumb_up</span>{issue.upvotes}</button>
            <button onClick={() => handleDownvote(issue.id)} disabled={hasVoted}><span className="material-symbols-rounded">thumb_down</span>{issue.downvotes}</button>
            <button onClick={() => setFlyToTarget({ lat: issue.latitude, lng: issue.longitude, id: issue.id })}

   className="map-link">
              <span className="material-symbols-rounded">location_on</span> View on Map
            </button>
          </div>
    </div>
    );
})}

</div>

      </div>
    </div>
  );
};

export default MapComponent;
