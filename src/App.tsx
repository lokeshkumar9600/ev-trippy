import { Routes, Route } from "react-router-dom";

import VehicleExplorer from "./pages/VehicleExplorer";
import TripPlanner from "./pages/TripPlanner";
import NearbyStations from "./pages/NearbyStations";

function App() {
  return (
    <Routes>
      <Route path="/" element={<VehicleExplorer />} />
      <Route path="/plan-trip/:vehicleId" element={<TripPlanner />} />
      <Route path="/nearby" element={<NearbyStations />}
      />
    </Routes>
  );
}

export default App;