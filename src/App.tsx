// import { useState, useRef } from 'react';
// import './App.css';

// interface UploadedFile {
//   id: string;
//   file: File;
//   fileName: string;
//   progress: number;
//   status: 'uploading' | 'complete' | 'error';
//   transcribedText?: string;
// }

// function App() {
//   const [files, setFiles] = useState<UploadedFile[]>([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Open file picker when upload box is clicked
//   const openFilePicker = () => {
//     fileInputRef.current?.click();
//   };

//   // Handle file selection from input
//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFiles = event.target.files;
//     if (selectedFiles) {
//       handleFiles(Array.from(selectedFiles));
//     }
//   };

//   // Handle drag and drop
//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
    
//     const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
//       ['.png', '.jpg', '.jpeg'].some(ext => file.name.toLowerCase().endsWith(ext))
//     );
    
//     if (droppedFiles.length > 0) {
//       handleFiles(droppedFiles);
//     }
//   };

//   // Process uploaded files
//   const handleFiles = (fileList: File[]) => {
//     const newFiles: UploadedFile[] = fileList.map(file => ({
//       id: Math.random().toString(36).substr(2, 9),
//       file,
//       fileName: file.name,
//       progress: 0,
//       status: 'uploading',
//     }));

//     setFiles(prev => [...prev, ...newFiles]);

//     // Simulate upload and OCR for each file
//     newFiles.forEach(uploadedFile => {
//       simulateUploadAndOCR(uploadedFile.id);
//     });
//   };

//   // Simulate upload progress and OCR processing
//   const simulateUploadAndOCR = async (fileId: string) => {
//     // Simulate upload progress
//     for (let progress = 0; progress <= 100; progress += 20) {
//       await new Promise(resolve => setTimeout(resolve, 300));
//       setFiles(prev =>
//         prev.map(f =>
//           f.id === fileId ? { ...f, progress } : f
//         )
//       );
//     }

//     // Simulate OCR processing
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // TODO: Replace with actual API call
//     // const response = await fetch('/api/ocr', {
//     //   method: 'POST',
//     //   body: formData
//     // });
//     // const data = await response.json();
    
//     const mockTranscribedText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam orci ipsum, tempus eu elementum et, laoreet sed quam. Praesent tempus nisi vitae dui tempor, vitae mollis dui suscipit. Integer fermentum velit vel nisl bibendum cursus.";

//     setFiles(prev =>
//       prev.map(f =>
//         f.id === fileId
//           ? { ...f, status: 'complete', transcribedText: mockTranscribedText }
//           : f
//       )
//     );
//   };

//   // Remove file from list
//   const removeFile = (fileId: string) => {
//     setFiles(prev => prev.filter(f => f.id !== fileId));
//   };

//   // Get the most recent transcribed text
//   const latestTranscription = files
//     .filter(f => f.transcribedText)
//     .slice(-1)[0]?.transcribedText;

//   return (
//     <div className="app-container">
//       {/* Header */}
//       <h1 className="app-title">
//         Find food Altrernatives
//         <span className="italic-part">without sacrificing the taste</span>
//       </h1>

//       {/* Upload Box */}
//       <div
//         className={`upload-box ${isDragging ? 'dragging' : ''}`}
//         onClick={openFilePicker}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//       >
//         <input
//           ref={fileInputRef}
//           type="file"
//           className="hidden"
//           accept=".png,.jpg,.jpeg"
//           multiple
//           onChange={handleFileSelect}
//         />
//         <span className="upload-text">Upload file here</span>
//       </div>

//       {/* File List */}
//       {files.length > 0 && (
//         <div className="file-list">
//           {files.map(file => (
//             <div key={file.id} className="file-item">
//               <span className="file-name">{file.fileName}</span>
//               <span className="file-progress">
//                 {file.status === 'complete' ? 'Complete' : `Progress ${file.progress}%`}
//               </span>
//               <button
//                 className="file-delete"
//                 onClick={() => removeFile(file.id)}
//                 aria-label="Remove file"
//               >
                
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Transcribed Text Box */}
//       {latestTranscription && (
//         <div className="transcription-box">
//           <h2 className="transcription-title">Transcribed text:</h2>
//           <p className="transcription-content">{latestTranscription}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import { useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Handle text submission
  const handleSubmit = async () => {
    if (!inputText.trim() || isProcessing) return;

    setIsProcessing(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('http://localhost:5001/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputText })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError('Error processing your query. Please make sure the Flask server is running on port 5001.');
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Enter key (Ctrl+Enter or Cmd+Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <h1 className="app-title">
        Find food Alternatives
        <span className="italic-part">without sacrificing the taste</span>
      </h1>

      {/* Input Box with Button Inside */}
      <div className="upload-box-wrapper">
        <div className="upload-glow"></div>
        <div className="upload-box" style={{ 
          height: 'auto', 
          minHeight: '90px',
          padding: '1.5rem 2rem',
          cursor: 'default',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your food preference or dietary question here..."
            disabled={isProcessing}
            style={{
              flex: 1,
              minHeight: '60px',
              maxHeight: '300px',
              padding: '0',
              border: 'none',
              background: 'transparent',
              color: '#FFFFFF',
              fontSize: '1.5rem',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '400',
              letterSpacing: '0.01em',
              resize: 'none',
              outline: 'none',
              lineHeight: '1.4',
            }}
          />
          
          {/* Submit Button Inside */}
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim() || isProcessing}
            style={{
              padding: '1rem 2rem',
              backgroundColor: isProcessing || !inputText.trim() ? '#333333' : '#FFFFFF',
              color: isProcessing || !inputText.trim() ? '#FFFFFF' : '#000000',
              border: 'none',
              borderRadius: '40px',
              fontSize: '1.2rem',
              fontWeight: '500',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.01em',
              cursor: isProcessing || !inputText.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              opacity: isProcessing || !inputText.trim() ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isProcessing && inputText.trim()) {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing && inputText.trim()) {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }
            }}
          >
            {isProcessing ? 'Processing...' : 'Get Alternatives'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="transcription-box" style={{ 
          backgroundColor: 'rgba(255, 230, 230, 0.9)',
          borderColor: '#ffcccc',
          marginTop: '2rem',
        }}>
          <h2 className="transcription-title" style={{ color: '#cc0000' }}>Error:</h2>
          <p className="transcription-content" style={{ color: '#990000' }}>{error}</p>
        </div>
      )}

      {/* Result Box - Sticks to input */}
      {result && !error && (
        <div className="transcription-box" style={{ marginTop: '2rem' }}>
          <h2 className="transcription-title">Suggested Alternatives:</h2>
          <p className="transcription-content">{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;