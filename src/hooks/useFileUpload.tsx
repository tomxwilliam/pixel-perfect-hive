
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { toast } from '@/components/ui/use-toast'

interface FileUploadOptions {
  entityType?: string
  entityId?: string
  maxFileSize?: number // in bytes
  allowedTypes?: string[]
}

interface UploadedFile {
  id: string
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string
  filePath: string
  entityType?: string
  entityId?: string
  uploadedAt: string
}

export const useFileUpload = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadFile = async (
    file: File,
    options: FileUploadOptions = {}
  ): Promise<UploadedFile | null> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload files',
        variant: 'destructive'
      })
      return null
    }

    const {
      entityType,
      entityId,
      maxFileSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = []
    } = options

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${maxFileSize / 1024 / 1024}MB`,
        variant: 'destructive'
      })
      return null
    }

    // Validate file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: `Allowed types: ${allowedTypes.join(', ')}`,
        variant: 'destructive'
      })
      return null
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100)
          }
        })

      if (storageError) {
        throw storageError
      }

      // Save file metadata to database
      const { data: fileData, error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          filename: fileName,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          file_path: storageData.path,
          entity_type: entityType,
          entity_id: entityId
        })
        .select()
        .single()

      if (dbError) {
        // Clean up storage if database insert fails
        await supabase.storage.from('uploads').remove([fileName])
        throw dbError
      }

      toast({
        title: 'Success',
        description: 'File uploaded successfully'
      })

      return fileData as UploadedFile
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
      return null
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const deleteFile = async (fileId: string): Promise<boolean> => {
    if (!user) return false

    try {
      // Get file info first
      const { data: fileData, error: fetchError } = await supabase
        .from('file_uploads')
        .select('file_path')
        .eq('id', fileId)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('uploads')
        .remove([fileData.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      toast({
        title: 'Success',
        description: 'File deleted successfully'
      })

      return true
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
      return false
    }
  }

  const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }

  return {
    uploadFile,
    deleteFile,
    getFileUrl,
    uploading,
    uploadProgress
  }
}
