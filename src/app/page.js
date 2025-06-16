'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' ||
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a PDF or DOCX file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-8">
            <Image
              src="/resume-logo.svg"
              alt="Resume Analyzer Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight px-4">
            Resume Analyzer
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl px-4">
            Transform your resume analysis experience with our AI-powered tool. Get instant insights and professional feedback on your resume.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={!file || loading}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold
                  ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
                  transition-colors duration-200 shadow-lg hover:shadow-xl w-full`}
              >
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {analysis && (
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Summary</h2>
              <p className="text-gray-600">{analysis.summary}</p>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ATS Score</h2>
              <div className="flex items-center space-x-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={analysis.ats_score >= 70 ? "#10B981" : analysis.ats_score >= 40 ? "#F59E0B" : "#EF4444"}
                      strokeWidth="3"
                      strokeDasharray={`${analysis.ats_score}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{analysis.ats_score}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">
                    {analysis.ats_score >= 70
                      ? "Great job! Your resume is well-optimized for ATS systems."
                      : analysis.ats_score >= 40
                      ? "Your resume needs some improvements to be more ATS-friendly."
                      : "Your resume needs significant improvements to pass ATS screening."}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Identified Skills</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Industry Focus</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.industry_focus.map((industry, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommendations</h2>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${getSeverityColor(rec.severity)}`} />
                      <div>
                        <p className="font-medium text-gray-900">{rec.message}</p>
                        {rec.suggestion && (
                          <p className="mt-1 text-sm text-gray-600">{rec.suggestion}</p>
                        )}
                        {rec.example && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                            <p className="font-medium">Example:</p>
                            <p>{rec.example}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-sm sm:text-base text-gray-600">Get instant feedback on your resume using advanced AI technology.</p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Quick Results</h3>
              <p className="text-sm sm:text-base text-gray-600">Receive detailed analysis and suggestions in seconds.</p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Professional Tips</h3>
              <p className="text-sm sm:text-base text-gray-600">Get expert recommendations to improve your resume&apos;s impact.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
