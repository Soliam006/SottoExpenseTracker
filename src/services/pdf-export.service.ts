import { Injectable, inject } from '@angular/core';
import { Project } from '../models/project.model';
import { Entry } from '../models/entry.model';
import { CloudinaryService } from './cloudinary.service';
import {LanguageService} from "@/src/core/services/language.service";

@Injectable({
    providedIn: 'root'
})
export class PdfExportService {
    private cloudinaryService = inject(CloudinaryService);
    private translate = inject(LanguageService);

    async exportProjectReceiptsAsPdf(project: Project, entries: Entry[]): Promise<void> {
        const allReceipts = entries
            .filter(entry => entry.type === 'receipt' && entry.receiptImagePublicIds && entry.receiptImagePublicIds.length > 0)
            .flatMap(entry =>
                entry.receiptImagePublicIds!.map(publicId => ({
                    publicId,
                    date: entry.date,
                    description: entry.description,
                    price: entry.price
                }))
            );

        if (allReceipts.length === 0) {
            alert('No receipts with images found for this project.');
            return;
        }

        // Using dynamic import for jsPDF to keep it out of the main bundle
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        for (let i = 0; i < allReceipts.length; i++) {
            const receipt = allReceipts[i];

            if (i > 0) {
                doc.addPage();
            }

            const page_margin = 15;
            const page_width = doc.internal.pageSize.getWidth();
            const page_height = doc.internal.pageSize.getHeight();

            doc.setFontSize(16);
            doc.text(`${this.translate.get('entries.table.project')} - ${project.name}`, page_margin, 20);
            doc.setFontSize(12);
            const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(receipt.price);
            doc.text(`${this.translate.get('entries.table.date')}: ${receipt.date} | ${this.translate.get('entries.table.description')}: ${receipt.description} | ${this.translate.get('entries.table.amount')}: ${priceFormatted}`, page_margin, 30, { maxWidth: page_width - (page_margin * 2) });

            const imageUrl = this.cloudinaryService.getImageUrl(receipt.publicId); // Get original size
            const imageBase64 = await this.getBase64FromUrl(imageUrl);

            const imgProps = await this.getImageProperties(imageBase64);

            const content_width = page_width - (page_margin * 2);
            const content_height = page_height - 50 - page_margin; // 50 for header

            const ratio = Math.min(content_width / imgProps.width, content_height / imgProps.height);

            const imgWidth = imgProps.width * ratio;
            const imgHeight = imgProps.height * ratio;

            const x = (page_width - imgWidth) / 2;
            const y = 50;

            // jsPDF can sometimes fail with certain JPEG formats, so we specify 'JPEG'
            doc.addImage(imageBase64, 'JPEG', x, y, imgWidth, imgHeight);
        }

        doc.save(`${project.name.replace(/\s/g, '_')}_${this.translate.get('entries.receipt')}.pdf`);
    }

    private async getBase64FromUrl(url: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    private getImageProperties(src: string): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = reject;
            img.src = src;
        });
    }
}
