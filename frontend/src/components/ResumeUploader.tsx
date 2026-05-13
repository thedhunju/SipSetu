import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';

interface ResumeUploaderProps {
  applicantId: string;
  onUploadSuccess?: (data: any) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ applicantId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicant_id', applicantId);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setProgress(percentCompleted);
        },
      });

      toast.success('Resume uploaded successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
      setFile(null);
      setProgress(0);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to upload resume. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50/30' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-transform
          ${isDragActive ? 'scale-110 bg-blue-100' : 'bg-blue-50'}`}>
          <UploadCloud className={`h-6 w-6 ${isDragActive ? 'text-blue-600' : 'text-[#1E3A5F]'}`} />
        </div>

        {file ? (
          <div className="space-y-1">
            <p className="font-semibold text-slate-900 flex items-center justify-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              {file.name}
            </p>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <>
            <h4 className="font-semibold text-slate-900">
              {isDragActive ? 'Drop your resume here' : 'Upload Resume'}
            </h4>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Drag and drop your PDF, DOCX or TXT file here, or click to browse.
            </p>
          </>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleUpload();
        }}
        disabled={!file || uploading}
        className="w-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            Confirm Upload
          </>
        )}
      </Button>
    </div>
  );
};
