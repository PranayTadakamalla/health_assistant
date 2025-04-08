import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const NearbyHospitals: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        // Fetch nearby hospitals from OpenStreetMap Overpass API
        axios
          .get(
            `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=hospital](around:5000,${latitude},${longitude});out;`
          )
          .then((res) => {
            setHospitals(res.data.elements);
          })
          .catch((err) => console.error(err));
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Nearby Hospitals</h1>
      {location ? (
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: "500px", width: "100%" }}
          className="rounded-lg shadow-lg"
        >
          {/* OpenStreetMap Tiles */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User Location Marker */}
          <Marker position={[location.lat, location.lng]}>
            <Popup>You are here</Popup>
          </Marker>

          {/* Hospitals Markers */}
          {hospitals.map((hospital) => (
            <Marker key={hospital.id} position={[hospital.lat, hospital.lon]}>
              <Popup>
                🏥 {hospital.tags.name || "Unnamed Hospital"} <br />
                📍 ({hospital.lat.toFixed(4)}, {hospital.lon.toFixed(4)})
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <p className="text-center text-gray-600">Fetching location...</p>
      )}
    </div>
  );
};

export default NearbyHospitals;
