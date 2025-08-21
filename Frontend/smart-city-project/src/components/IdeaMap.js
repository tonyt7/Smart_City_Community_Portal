import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";



// Fix marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const bouncingIcon = new L.DivIcon({
  className: "bounce-marker",
  html: "<div style='background:#007bff;width:18px;height:18px;border-radius:50%;border:2px solid white;'></div>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const statusIcons = {
  "Vote On": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  "Processing": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  "Completed": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  "Future": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  "Unsuccessful": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  "Not Plausible": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};


const ClickHandler = ({ onClick }) => {
    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        onClick(coords);
      },
    });
    return null;
  }; 
// 💡 Add this BELOW the Leaflet icon fix or at the bottom
const MapLegend = () => {
    const legendItems = [
      { color: "#007bff", label: "Vote On 🔥" },
      { color: "#fd7e14", label: "Processing ⚙️" },
      { color: "#28a745", label: "Completed ✅" },
      { color: "#6f42c1", label: "Future 💡" },
      { color: "#dc3545", label: "Unsuccessful ❌" },
      { color: "#6c757d", label: "Not Plausible 🚫" },
    ];
  
    return (
      <div className="map-legend">
        {legendItems.map((item) => (
          <div className="legend-item" key={item.label}>
            <span
              className="legend-color"
              style={{ backgroundColor: item.color }}
            ></span>
            {item.label}
          </div>
        ))}
      </div>
    );
  };
 
const IdeaMap = ({ onMapClick, selectedCoords  }) => {
    const [ideaMarkers, setIdeaMarkers] = useState([]);
    useEffect(() => {
    axios.get("http://localhost:5000/ideas/approved") // Adjust if different port
      .then((res) => setIdeaMarkers(res.data))
      .catch((err) => console.error("Failed to load ideas", err));
  }, []);

  return (
    <MapContainer
    
      center={[52.4862, -1.8904]} // Example: Birmingham
      zoom={13}
      style={{ height: "400px", width: "100%" }}
      scrollWheelZoom={true}
    >
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {ideaMarkers.map((idea) => (
  <Marker
    key={idea.id}
    position={[idea.latitude, idea.longitude]}
    icon={statusIcons[idea.status] || statusIcons["Vote On"]}
  >
    <Popup>
      <strong>{idea.title}</strong><br />
      {idea.description}<br />
      <em>
    Status:{" "}
    <span className={`status-pill status-${idea.status.toLowerCase().replace(/\s/g, '')}`}>
      {idea.status}
    </span>
  </em>
    </Popup>
  </Marker>
))}

      {/* Example Marker */}
      <Marker position={[52.4862, -1.8904]}>
        <Popup>A sample idea pinned here!</Popup>
      </Marker>
      <ClickHandler onClick={onMapClick} />
      {selectedCoords && (
       <Marker position={selectedCoords} icon ={bouncingIcon} draggable={true}>
         <Popup>
           <strong>Your selected location</strong><br />
           Lat: {selectedCoords[0].toFixed(5)}<br />
           Lng: {selectedCoords[1].toFixed(5)}
         </Popup>
       </Marker>
   )}
      <MapLegend/>
    </MapContainer>
  );
};

export default IdeaMap;
