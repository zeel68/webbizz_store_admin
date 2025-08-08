interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    [key: string]: any;
}

interface CloudinaryError {
    error: {
        message: string;
        [key: string]: any;
    };
}

class CloudinaryService {
    private cloudName: string;
    private uploadPreset: string;

    constructor() {
        this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
        this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'BizzWeb';
    }

    async uploadImage(file: File, folder: string = 'ecommerce_uploads'): Promise<CloudinaryUploadResult> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error: CloudinaryError = await response.json();
            throw new Error(error.error?.message || 'Image upload failed');
        }

        return response.json();
    }

    async uploadMultipleImages(files: File[], folder: string = 'ecommerce_uploads'): Promise<CloudinaryUploadResult[]> {
        const uploadPromises = files.map(file => this.uploadImage(file, folder));
        return Promise.all(uploadPromises);
    }

    async deleteImage(publicId: string): Promise<void> {
        try {
            // Note: Deleting images requires server-side implementation with API key/secret
            // This is a placeholder for the delete functionality
            // In a real implementation, you'd need a server endpoint to handle deletions
            const response = await fetch('/api/cloudinary/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicId }),
            });

            if (!response.ok) {
                console.warn(`Failed to delete image with public_id: ${publicId}`);
            }
        } catch (error) {
            console.warn(`Error deleting image: ${error}`);
        }
    }

    async deleteMultipleImages(publicIds: string[]): Promise<void> {
        const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
        await Promise.allSettled(deletePromises);
    }

    extractPublicId(url: string): string {
        try {
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            const publicId = filename.split('.')[0];

            // Find the folder structure
            const uploadIndex = parts.findIndex(part => part === 'upload');
            if (uploadIndex !== -1 && uploadIndex < parts.length - 2) {
                const folderParts = parts.slice(uploadIndex + 2, -1);
                return folderParts.length > 0 ? `${folderParts.join('/')}/${publicId}` : publicId;
            }

            return publicId;
        } catch (error) {
            console.warn('Failed to extract public_id from URL:', url);
            return '';
        }
    }
}

export const cloudinaryService = new CloudinaryService();

// Utility function for handling image uploads with cleanup on failure
export async function uploadImagesWithCleanup<T>(
    files: File[],
    folder: string,
    saveOperation: (imageUrls: string[]) => Promise<T>
): Promise<T> {
    let uploadedImages: CloudinaryUploadResult[] = [];

    try {
        // Upload all images first
        if (files.length > 0) {
            uploadedImages = await cloudinaryService.uploadMultipleImages(files, folder);
        }

        // Extract URLs for the save operation
        const imageUrls = uploadedImages.map(result => result.secure_url);

        // Attempt to save the entity
        const result = await saveOperation(imageUrls);

        // If we reach here, the save was successful
        return result;
    } catch (error) {
        // If save failed, clean up uploaded images
        if (uploadedImages.length > 0) {
            const publicIds = uploadedImages.map(result => result.public_id);
            await cloudinaryService.deleteMultipleImages(publicIds);
            console.log('Cleaned up uploaded images due to save failure');
        }

        // Re-throw the original error
        throw error;
    }
}
