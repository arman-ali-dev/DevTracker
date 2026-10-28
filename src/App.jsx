import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Dsa from "./pages/Dsa.jsx";
import Interview from "./pages/Interview.jsx";
import Settings from "./pages/Settings.jsx";
import Projects from "./pages/Projects.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="dsa" element={<Dsa />} />
        <Route path="interview" element={<Interview />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="projects" element={<Projects />} />
      </Route>
    </Routes>
  );
}
