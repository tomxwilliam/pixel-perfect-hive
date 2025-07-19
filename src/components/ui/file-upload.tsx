
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from './button'
import { Progress } from './progress'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Upload, X, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileUploaded?: (file: any) => void
  entityType?: string
  entityId?: string
  maxFileSize?: number
  allowedTypes?: string[]
  multiple?: boolean
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  entityType,
  entityId,
  maxFileSize = 10 * 1024 * 1024,
  allowedTypes = [],
  multiple = false,
  className
}) => {
  const { uploadFile, isUploading, uploadProgress } = useFileUpload()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const uploadedFile = await uploadFile(file, entityType, entityId)
      
      if (uploadedFile && onFileUploaded) {
        onFileUploaded(uploadedFile)
      }
    }
  }, [uploadFile, entityType, entityId, onFileUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxSize: maxFileSize,
    accept: allowedTypes.length > 0 ? 
      Object.fromEntries(allowedTypes.map(type => [type, []])) : 
      undefined
  })

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <Upload className="h-8 w-8 animate-pulse text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Uploading...</p>
            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
            <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? "Drop files here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {allowedTypes.length > 0 && `Accepted: ${allowedTypes.join(', ')} • `}
                Max size: {maxFileSize / 1024 / 1024}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface FileListProps {
  files: any[]
  onRemove?: (fileId: string) => void
  showRemove?: boolean
}

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  onRemove, 
  showRemove = true 
}) => {
  const { deleteFile } = useFileUpload()

  const handleRemove = async (file: any) => {
    const success = await deleteFile(file.id, file.file_path)
    if (success && onRemove) {
      onRemove(file.id)
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <File className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">No files uploaded</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <File className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{file.original_filename}</p>
              <p className="text-xs text-muted-foreground">
                {(file.file_size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          
          {showRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(file)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
