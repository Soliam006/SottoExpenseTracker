import { Injectable } from '@angular/core';
import { cloudinaryConfig } from '../cloudinary.config';

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  // ... other properties from Cloudinary
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

  async uploadImage(base64Image: string): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    const response = await fetch(this.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudinary upload failed: ${error.error.message}`);
    }

    return response.json();
  }

  getImageUrl(publicId: string, width?: number, height?: number): string {
    const transformations = [
        'c_fill',
        width ? `w_${width}`: null,
        height ? `h_${height}`: null,
    ].filter(Boolean).join(',');

    if (!transformations) {
        return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${publicId}`;
    }
    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformations}/${publicId}`;
  }
}
