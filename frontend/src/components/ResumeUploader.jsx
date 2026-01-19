import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URI;

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showWaiting, setShowWaiting] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = async () => {
    setIsUploading(true);
    setTimeout(() => {
      setShowWaiting(true);
    }, 5000);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await axios.post(`${backendUrl}/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data.status);
      localStorage.setItem("analysisResult", response.data.analysis);
      navigate("/analysis");
    } catch (error) {
      // Axios automatically throws on non-2xx responses (e.g. 400/500)
      setError(`${error.response.data.error}`);
      setFile(null);
      setIsUploading(false);
      setShowWaiting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }

    // ✅ Reset the input value to allow re-uploading the same file
    e.target.value = "";
  };

  const validateFile = (file) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX file");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return false;
    }

    if (file.size > maxSize) {
      setError("File size exceeds limit(5MB).");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl  rounded-2xl overflow-hidden">
        {/* Header */}
        <div className=" p-6 text-center ">
          <h1 className="text-2xl font-bold text-indigo-500">AI Powered</h1>
          <h1 className="text-6xl font-bold text-indigo-600 pb-6">
            Resume Analyzer
          </h1>
          <p className="text-indigo-400 mt-2">
            Upload your resume for professional analysis and improvement
            suggestions
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8  flex-col justify-center items-center">
          {error && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-white shadow-xl rounded-xl p-6 w-80 text-center transform transition-all hover:scale-105">
                <h2 className="text-xl font-mono font-semibold text-red-500 mb-3">
                  Error
                </h2>
                <p className="text-slate-600 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="bg-blue-500 text-white px-5 py-2 rounded-lg w-28 hover:w-64 transition-all duration-300 ease-in-out hover:bg-blue-600"
                >
                  OK
                </button>
              </div>
            </div>
          )}
          {!file ? (
            /* Upload Area */
            <div
              className={`flex-col justify-center items-center border-2 border-dashed rounded-xl p-8 py-20 text-center transition-all duration-300 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 hover:border-indigo-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={triggerFileInput}
            >
              <div className="flex justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Drag & Drop your resume here
              </h3>
              <p className="text-gray-600 mb-4">
                Supported formats: PDF, DOCX (Max 5MB)
              </p>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Browse Files
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="hidden"
              />
            </div>
          ) : (
            /* File Preview */
            <div className="border border-gray-200 rounded-xl p-8 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 truncate max-w-xs">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 items-center">
                {!isUploading ? (
                  <button
                    onClick={handleFileUpload}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center w-54"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Analyze Resume
                  </button>
                ) : (
                  <button
                    onClick={handleFileUpload}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center w-54 justify-center"
                  >
                    <div className="animate-spin w-6 h-6 border border-b-0 border-r-0 rounded-full"></div>
                  </button>
                )}

                {showWaiting && (
                  <p className="text-slate-600 animate-pulse duration-75">
                    Analysis will take a few moments, please have patience.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>🔒 Your files are securely processed and never stored</p>
            <p className="mt-1">
              💡 Get insights on skills, experience, and ATS compatibility
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;
