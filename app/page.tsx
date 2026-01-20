import React, { useState, useEffect, ChangeEvent, DragEvent } from 'react';
import { Upload, FileText, Zap, CheckCircle, Sparkles, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

export default function ContentForgeAI() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [resultLink, setResultLink] = useState('');
  const [jobId, setJobId] = useState('');
  const [pollingAttempts, setPollingAttempts] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setProcessingStage('Uploading your content brief...');

    const formData = new FormData();
    formData.append('data', file);

    try {
      // Stage updates
      const stageInterval = setInterval(() => {
        const stages = [
          'Uploading your content brief...',
          'Analyzing document structure...',
          'Extracting key requirements...',
          'Researching top competitors...',
          'Optimizing for YMYL & SEO...',
          'Generating premium content...',
          'Finalizing your article...'
        ];
        const currentIndex = stages.indexOf(processingStage);
        if (currentIndex < stages.length - 1) {
          setProcessingStage(stages[currentIndex + 1]);
        }
      }, 8000);

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      clearInterval(stageInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to submit: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      
      if (result.data?.webViewLink) {
        setResultLink(result.data.webViewLink);
        setIsSubmitted(true);
        setIsSubmitting(false);
        setProcessingStage('');
      } else if (result.jobId) {
        setJobId(result.jobId);
        startPolling(result.jobId);
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('524') || errorMessage.includes('timeout')) {
        setError('Processing is taking longer than expected. Your content is still being generated. Please wait...');

        setProcessingStage('Still processing - this may take up to 2 minutes...');
      } else {
        setError(`Failed to submit: ${errorMessage}. Please try again.`);
        setIsSubmitting(false);
        setProcessingStage('');
      }
    }
  };

  const startPolling = (id: string) => {
    setProcessingStage('Checking processing status...');
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/check-status?jobId=${id}`);
        const result = await response.json();
        
        if (result.status === 'completed' && result.data?.webViewLink) {
          clearInterval(pollInterval);
          setResultLink(result.data.webViewLink);
          setIsSubmitted(true);
          setIsSubmitting(false);
          setProcessingStage('');
        } else if (result.status === 'failed') {
          clearInterval(pollInterval);
          setError('Processing failed. Please try again.');
          setIsSubmitting(false);
          setProcessingStage('');
        } else {
          setPollingAttempts(prev => prev + 1);
          if (pollingAttempts > 40) { // Max 2 minutes (40 * 3s)
            clearInterval(pollInterval);
            setError('Processing timeout. Please contact support.');
            setIsSubmitting(false);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleReset = () => {
    setFile(null);
    setError('');
    setIsSubmitted(false);
    setIsSubmitting(false);
    setProcessingStage('');
    setResultLink('');
    setJobId('');
    setPollingAttempts(0);
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 min-h-screen overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff33_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,_black,transparent_90%)] [background-size:16px_16px]" />
      </div>

      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem]">
        <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-[128px]" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
                ContentForgeAI
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent leading-tight">
                ContentForgeAI
              </h1>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto font-light text-blue-200/90">
                Transform your content briefs into SEO-optimized, YMYL-compliant, publication-ready articles in minutes
              </p>
            </div>

            {/* Upload Section */}
            <div className="mt-12">
              {isSubmitting ? (
                <div className="bg-gray-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-12 shadow-2xl text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <Loader2 className="absolute inset-0 m-auto w-12 h-12 text-blue-400 animate-pulse" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Processing Your Content Brief</h3>
                    <p className="text-blue-300 text-lg font-medium">{processingStage}</p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 max-w-md mx-auto space-y-3">
                    <div className="flex items-center justify-between text-sm text-blue-200">
                      <span>✓ Document uploaded</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-blue-200">
                      <span>⏳ AI analysis in progress</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-blue-200">
                      <span>⏳ Competitor research</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-blue-200">
                      <span>⏳ SEO optimization</span>
                    </div>
                  </div>

                  <p className="text-blue-300/70 text-sm">This may take 1-2 minutes for complex documents...</p>
                  
                  {error && !error.includes('524') && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              ) : !isSubmitted ? (
                <div className="bg-gray-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  )}

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-blue-400 bg-blue-500/10' 
                        : 'border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/5'
                    }`}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <Upload className={`w-16 h-16 mx-auto mb-4 ${file ? 'text-blue-400' : 'text-blue-300/50'}`} />
                    
                    {file ? (
                      <div className="space-y-2">
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-blue-400 text-sm">✓ Ready to submit ({(file.size / 1024).toFixed(2)} KB)</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-blue-100 font-medium">Drop your PDF here or click to browse</p>
                        <p className="text-blue-300/70 text-sm">Supports PDF files only</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleSubmit}
                      disabled={!file}
                      className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#60A5FA_0%,#1D4ED8_50%,#60A5FA_100%)]" />
                      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-10 py-4 text-lg font-bold text-white backdrop-blur-3xl">
                        <span className="flex items-center space-x-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Generate SEO Content</span>
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-12 shadow-2xl text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">Content Generated Successfully!</h3>
                    <p className="text-blue-200/80 text-lg">Your SEO-optimized article is ready</p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-blue-200 text-sm mb-3">
                      <FileText className="w-4 h-4 inline mr-2" />
                      {file?.name}
                    </p>
                    {resultLink && (
                      <div className="flex gap-3 justify-center">
                        <a
                          href={resultLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium shadow-lg shadow-blue-500/50"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          View in Google Drive
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleReset}
                    className="inline-flex items-center px-8 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-200 rounded-lg hover:bg-blue-500/20 transition-all font-medium"
                  >
                    Submit Another Brief
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4 p-6 bg-gray-900/30 backdrop-blur-sm border border-blue-500/20 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Upload Brief</h3>
              <p className="text-blue-200/70 text-sm">Submit your PDF content brief with all requirements</p>
            </div>

            <div className="text-center space-y-4 p-6 bg-gray-900/30 backdrop-blur-sm border border-blue-500/20 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Processing</h3>
              <p className="text-blue-200/70 text-sm">YMYL compliance, competitor analysis & SEO optimization</p>
            </div>

            <div className="text-center space-y-4 p-6 bg-gray-900/30 backdrop-blur-sm border border-blue-500/20 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Get Results</h3>
              <p className="text-blue-200/70 text-sm">Receive publication-ready content in minutes</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-blue-500/10">
          <div className="text-center text-blue-300/60">
            <p>&copy; 2026 ContentForgeAI. Powered by Advanced AI & SEO Research</p>
          </div>
        </footer>
      </div>
    </div>
  );
},