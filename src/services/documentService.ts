import { storage, BUCKET_ID, ID, isAppwriteConfigured } from '@/lib/appwrite';

export interface UploadedDocument {
    fileId: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    size: number;
}

/**
 * Upload a document to Appwrite Storage
 * @param file - The file to upload
 * @param userId - The user ID for organizing files
 * @returns UploadedDocument with file details and URL
 */
export const uploadDocument = async (file: File, userId: string): Promise<UploadedDocument> => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured. Please set VITE_APPWRITE_PROJECT_ID in your .env file.');
    }

    try {
        // Create unique file ID
        const fileId = ID.unique();

        // Upload file to Appwrite Storage
        let uploadFile = file;
        if (file.name.toLowerCase().endsWith('.jpeg')) {
            uploadFile = new File([file], file.name.replace(/\.[jJ][pP][eE][gG]$/, ".jpg"), { type: 'image/jpeg' });
        }
        const result = await storage.createFile(BUCKET_ID, fileId, uploadFile);

        // Generate the file view URL
        const fileUrl = storage.getFileView(BUCKET_ID, result.$id).toString();

        return {
            fileId: result.$id,
            fileName: file.name,
            fileUrl,
            mimeType: file.type,
            size: file.size
        };
    } catch (error: any) {
        console.error('Error uploading document to Appwrite:', error);
        throw new Error(`Failed to upload document: ${error.message}`);
    }
};

/**
 * Upload multiple documents
 * @param files - Array of files to upload
 * @param userId - The user ID
 * @returns Array of uploaded document details
 */
export const uploadMultipleDocuments = async (
    files: File[],
    userId: string
): Promise<UploadedDocument[]> => {
    const uploadPromises = files.map(file => uploadDocument(file, userId));
    return Promise.all(uploadPromises);
};

/**
 * Get the view URL for a document
 * @param fileId - The Appwrite file ID
 * @returns The file view URL
 */
export const getDocumentViewUrl = (fileId: string): string => {
    return storage.getFileView(BUCKET_ID, fileId).toString();
};

/**
 * Get the download URL for a document
 * @param fileId - The Appwrite file ID
 * @returns The file download URL
 */
export const getDocumentDownloadUrl = (fileId: string): string => {
    return storage.getFileDownload(BUCKET_ID, fileId).toString();
};

/**
 * Get file preview (for images)
 * @param fileId - The Appwrite file ID
 * @param width - Preview width
 * @param height - Preview height
 * @returns The preview URL
 */
export const getDocumentPreview = (fileId: string, width = 200, height = 200): string => {
    return storage.getFilePreview(BUCKET_ID, fileId, width, height).toString();
};

/**
 * Delete a document from storage
 * @param fileId - The Appwrite file ID
 */
export const deleteDocument = async (fileId: string): Promise<void> => {
    try {
        await storage.deleteFile(BUCKET_ID, fileId);
    } catch (error: any) {
        console.error('Error deleting document:', error);
        throw new Error(`Failed to delete document: ${error.message}`);
    }
};

/**
 * Convert documents object (from Firestore) to array format for display
 * @param documents - Object with fileName: fileUrl pairs
 * @returns Array of document info
 */
export const parseDocumentsObject = (documents: Record<string, string>): Array<{ name: string; url: string }> => {
    return Object.entries(documents).map(([name, url]) => ({ name, url }));
};
