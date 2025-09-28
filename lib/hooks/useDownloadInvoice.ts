// src/hooks/useDownloadInvoice.ts
import { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const useDownloadInvoice = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    const downloadInvoice = useCallback(async () => {
        if (!invoiceRef.current) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`invoice-${Date.now()}.pdf`);
        } catch (error) {
            console.error('Error generating invoice:', error);
            toast.error('Failed to generate invoice');
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return { invoiceRef, isGenerating, downloadInvoice };
};

export default useDownloadInvoice;