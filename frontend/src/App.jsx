import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import PollPage from "./pages/PollPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<PollPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </>
  );
}
