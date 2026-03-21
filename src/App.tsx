import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import Home from './pages/Home';
import MapPage from './pages/Map';
import WaterPage from './pages/Water';
import ElectricityPage from './pages/Electricity';
import AnalysisPage from './pages/Analysis';
import ActionsPage from './pages/Actions';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/water" element={<WaterPage />} />
            <Route path="/electricity" element={<ElectricityPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/actions" element={<ActionsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
