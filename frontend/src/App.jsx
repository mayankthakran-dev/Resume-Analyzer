import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResumeUploader from "./components/ResumeUploader";
import AnalyzedContent from "./components/AnalyzedContent";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResumeUploader />} />
        <Route path="/analysis" element={<AnalyzedContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
