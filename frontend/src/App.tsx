import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import Navbar from "./components/Navbar";
import ActivityDetail from "./pages/ActivityDetail";

function App() {
  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
