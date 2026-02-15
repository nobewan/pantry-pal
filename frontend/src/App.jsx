import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavTabs from './components/NavTabs.jsx'
import Cards from './components/Cards.jsx'
import FoodMonitor from './components/FoodMonitor.jsx'


export default function App() {
    return (
      <>
      <body className = "bg-slate-100"></body>
      <Router>
        <NavTabs />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Cards />} />
            <Route path="/foodMonitor" element={<FoodMonitor />} />
          </Routes>
        </div>
      </Router>
      </>
    );
  }