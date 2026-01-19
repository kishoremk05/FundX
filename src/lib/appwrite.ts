import { Client, Storage, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

// Configure Appwrite - UPDATE THESE VALUES WITH YOUR APPWRITE CREDENTIALS
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'YOUR_PROJECT_ID';
const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'loan-documents';

client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// Export storage instance and configuration
export const storage = new Storage(client);
export const BUCKET_ID = APPWRITE_BUCKET_ID;
export { ID, client };

// Helper to check if Appwrite is configured
export const isAppwriteConfigured = (): boolean => {
    return APPWRITE_PROJECT_ID !== 'YOUR_PROJECT_ID' && APPWRITE_PROJECT_ID.length > 0;
};
