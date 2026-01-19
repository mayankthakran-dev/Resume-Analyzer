import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const JSONRenderer = ({ data, level = 1 }) => {
  if (typeof data === "string" || typeof data === "number") {
    return <h5 className="ml-4 py-1 text-slate-600">{data}</h5>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="ml-6 list-disc">
        {data.map((item, idx) => (
          <li key={idx} className="text-gray-800 mb-2">
            {typeof item === "object" ? <JSONRenderer data={item} /> : item}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === "object") {
    // Special case: object has 'point' and 'details'
    if (data.point && data.details) {
      return (
        <div className="ml-4 mb-4">
          <h1 className="text-xl text-gray-900 py-1">{data.point}</h1>
          <p className="ml-4 text-gray-800">{data.details}</p>
        </div>
      );
    }

    // Generic object rendering
    return (
      <div className="ml-4">
        {Object.entries(data).map(([key, value], idx) => (
          <div key={idx} className="mb-2">
            <h1
              className={` py-2 font-semibold font-sans ${
                level === 1
                  ? "text-3xl text-slate-800"
                  : "text-xl text-gray-700"
              }`}
            >
              {key.replace(/_/g, " ").toUpperCase()}
            </h1>
            <JSONRenderer data={value} level={level + 1} />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const AnalyzedContent = () => {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const result = localStorage.getItem("analysisResult");
    if (result) {
      // Convert analysis to single paragraph
      const plainText = result
        .replace("```json", "") // remove newlines
        .replace(/\n/g, " ") // remove newlines
        .replace(/#+/g, "") // remove markdown headings
        .replace(/\*+/g, "") // remove bullets
        .replace(/\s+/g, " ") // normalize multiple spaces
        .replace("```", "") // normalize multiple spaces
        .trim();

      const jsonObject = JSON.parse(plainText);
      setAnalysis(jsonObject);
      console.log(jsonObject);
      setLoading(false);
    } else {
      navigate("/");
    }
  }, []);

  const handleNewAnalysis = () => {
    localStorage.removeItem("analysisResult");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Analyzing your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            Resume Analysis Report
          </h1>
          <button
            onClick={handleNewAnalysis}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            New Analysis
          </button>
        </div>

        {/* JSON Content */}
        <div className="bg-slate-100 rounded-xl overflow-hidden p-6 md:p-8 border border-slate-200">
          {analysis && <JSONRenderer data={analysis} />}
        </div>
        {console.log(analysis)}

        {/* Tip */}
        <div className="mt-6 text-center text-sm text-gray-600">
          💡 Tip: Use these insights to improve your resume before applying to
          jobs
        </div>
      </div>
    </div>
  );
};

export default AnalyzedContent;
