import { collection, addDoc, Timestamp, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { storage, BUCKET_ID, ID, isAppwriteConfigured } from "@/lib/appwrite";

export interface FormSubmission {
    id?: string;
    userId: string;
    applicationId?: string; // Linked application
    formType: "loan_agreement" | "guarantee";
    formData: Record<string, any>;
    pdfUrl?: string;
    pdfFileId?: string; // Appwrite file ID
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    status: "pending" | "approved" | "rejected";
    reviewedBy?: string;
    reviewedAt?: Timestamp;
}

/**
 * Helper to remove undefined values from an object recursively
 */
const sanitizeData = (data: any): any => {
    if (data === null || data === undefined) return null;
    if (typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(sanitizeData);

    const sanitized: any = {};
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== undefined) {
            sanitized[key] = sanitizeData(value);
        }
    });
    return sanitized;
};

/**
 * Submit a form to Firestore
 */
export const submitForm = async (
    userId: string,
    formType: "loan_agreement" | "guarantee",
    formData: Record<string, any>,
    applicationId?: string
): Promise<string> => {
    try {
        const submission: any = {
            userId,
            formType,
            formData: sanitizeData(formData),
            status: "pending",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // Only add applicationId if it's a valid string
        if (applicationId && typeof applicationId === 'string' && applicationId !== 'undefined' && applicationId !== 'null') {
            submission.applicationId = applicationId;
        }

        const docRef = await addDoc(collection(db, "forms"), submission);

        // If applicationId is provided, also link it to the application's documents
        if (applicationId && typeof applicationId === 'string' && applicationId !== 'undefined') {
            try {
                // Link is actually finalized in uploadFormPDF when fileUrl is available
                console.log(`Form ${docRef.id} linked to application ${applicationId}`);
            } catch (e) {
                console.warn("Non-critical error linking form to application metadata:", e);
            }
        }
        return docRef.id;
    } catch (error) {
        console.error("Error submitting form:", error);
        throw new Error("Failed to submit form");
    }
};

/**
 * Upload PDF to Appwrite Storage and update form document
 */
export const uploadFormPDF = async (
    formId: string,
    userId: string,
    pdfBlob: Blob,
    formType: string
): Promise<string> => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured. Please set VITE_APPWRITE_PROJECT_ID in your .env file.');
    }

    try {
        // Create unique file ID
        const fileId = ID.unique();
        const fileName = `${formType}_${formId}.pdf`;

        // Convert Blob to File
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

        // Upload to Appwrite Storage
        const result = await storage.createFile(BUCKET_ID, fileId, pdfFile);

        // Get the file view URL
        const fileUrl = storage.getFileView(BUCKET_ID, result.$id).toString();

        // Update form document with PDF URL and file ID
        await updateDoc(doc(db, "forms", formId), {
            pdfUrl: fileUrl,
            pdfFileId: result.$id,
            updatedAt: Timestamp.now(),
        });

        // CRITICAL: Also update the loan_application document so admin sees it in "Attached Documents"
        try {
            const formSnap = await getDocs(query(collection(db, 'forms'), where('__name__', '==', formId)));
            if (!formSnap.empty) {
                const formDoc = formSnap.docs[0].data();
                if (formDoc.applicationId && typeof formDoc.applicationId === 'string' && formDoc.applicationId !== 'undefined') {
                    const appRef = doc(db, 'loan_applications', formDoc.applicationId);
                    const appSnap = await getDocs(query(collection(db, 'loan_applications'), where('__name__', '==', formDoc.applicationId)));
                    if (!appSnap.empty) {
                        const appData = appSnap.docs[0].data();
                        const existingDocs = appData.documents || {};
                        const docKey = formType === 'loan_agreement' ? 'Loan Agreement' : 'Guarantee Form';

                        await updateDoc(appRef, {
                            documents: {
                                ...existingDocs,
                                [docKey]: fileUrl
                            },
                            updated_at: new Date().toISOString()
                        });
                        console.log(`Successfully attached ${docKey} to application ${formDoc.applicationId}`);
                    }
                }
            }
        } catch (e) {
            console.error("Error linking PDF to loan application:", e);
        }

        return fileUrl;
    } catch (error: any) {
        console.error("Error uploading PDF to Appwrite:", error);
        throw new Error(`Failed to upload PDF: ${error.message}`);
    }
};

/**
 * Get PDF download URL from Appwrite
 */
export const getFormPDFDownloadUrl = (fileId: string): string => {
    return storage.getFileDownload(BUCKET_ID, fileId).toString();
};

/**
 * Delete PDF from Appwrite Storage
 */
export const deleteFormPDF = async (fileId: string): Promise<void> => {
    try {
        await storage.deleteFile(BUCKET_ID, fileId);
    } catch (error: any) {
        console.error("Error deleting PDF from Appwrite:", error);
        throw new Error(`Failed to delete PDF: ${error.message}`);
    }
};

/**
 * Get user's forms
 */
export const getUserForms = async (userId: string): Promise<FormSubmission[]> => {
    try {
        const q = query(collection(db, "forms"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as FormSubmission[];
    } catch (error) {
        console.error("Error getting user forms:", error);
        throw new Error("Failed to retrieve forms");
    }
};

/**
 * Get all forms (admin only)
 */
export const getAllForms = async (): Promise<FormSubmission[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "forms"));

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as FormSubmission[];
    } catch (error) {
        console.error("Error getting all forms:", error);
        throw new Error("Failed to retrieve forms");
    }
};

/**
 * Update form status (admin only)
 */
export const updateFormStatus = async (
    formId: string,
    status: "pending" | "approved" | "rejected",
    reviewerId: string
): Promise<void> => {
    try {
        await updateDoc(doc(db, "forms", formId), {
            status,
            reviewedBy: reviewerId,
            reviewedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error updating form status:", error);
        throw new Error("Failed to update form status");
    }
};
