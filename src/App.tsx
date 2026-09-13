import { Routes, Route } from "react-router-dom";

import VehicleExplorer from "./pages/VehicleExplorer";
import TripPlanner from "./pages/TripPlanner";

function App() {
  return (
    <Routes>
      <Route path="/" element={<VehicleExplorer />} />
      <Route path="/plan-trip/:vehicleId" element={<TripPlanner />} />
    </Routes>
  );
}

export default App;