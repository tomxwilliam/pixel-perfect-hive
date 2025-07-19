
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFile {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  entityType?: string;
  entityId?: string;
  uploadedAt: string;
}

interface UseFileUploadOptions {
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: Error) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    onUploadComplete,
    onUploadError,
  } = options;

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    return null;
  };

  const uploadFile = async (
    file: File,
    entityType?: string,
    entityId?: string
  ): Promise<UploadedFile | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'File validation failed',
        description: validationError,
        variant: 'destructive',
      });
      onUploadError?.(new Error(validationError));
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `${user.id}/${filename}`;

      // Simulate upload progress since Supabase doesn't provide native progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(95);

      // Save file metadata to database
      const { data: fileRecord, error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          filename,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          file_path: filePath,
          entity_type: entityType,
          entity_id: entityId,
          user_id: user.id,
        })
        .select()
        .single();

      if (dbError) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage.from('uploads').remove([filePath]);
        throw dbError;
      }

      setUploadProgress(100);

      const uploadedFile: UploadedFile = {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalFilename: fileRecord.original_filename,
        fileSize: fileRecord.file_size,
        mimeType: fileRecord.mime_type,
        filePath: fileRecord.file_path,
        entityType: fileRecord.entity_type,
        entityId: fileRecord.entity_id,
        uploadedAt: fileRecord.uploaded_at,
      };

      toast({
        title: 'File uploaded successfully',
        description: `${file.name} has been uploaded.`,
      });

      onUploadComplete?.(uploadedFile);
      return uploadedFile;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
      onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from('uploads')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
  };

  const deleteFile = async (fileId: string, filePath: string): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('uploads')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: 'File deleted',
        description: 'File has been successfully deleted.',
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploadFile,
    getFileUrl,
    deleteFile,
    isUploading,
    uploadProgress,
    validateFile,
  };
};
