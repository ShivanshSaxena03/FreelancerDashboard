'use client';

import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { PremiumPdfDocument } from './PremiumPdfDocument';
import { Download, Printer, X } from 'lucide-react';

interface PreviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  documentId: string;
  title: string;
  client: any;
  freelancer: any;
  content: any;
  date: string;
}

export default function DocumentPreviewer({
  isOpen,
  onClose,
  type,
  documentId,
  title,
  client,
  freelancer,
  content,
  date,
}: PreviewerModalProps) {
  if (!isOpen) return null;

  const pdfInstance = (
    <PremiumPdfDocument
      type={type}
      documentId={documentId}
      title={title}
      client={client}
      freelancer={freelancer}
      content={content}
      date={date}
    />
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50 shrink-0">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
              Agency Proposal Previewer
            </h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Review formatting and signature layout before building PDF bundle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Download Link Wrapper */}
            <PDFDownloadLink
              document={pdfInstance}
              fileName={`${type}_${documentId}.pdf`}
              className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-900 transition-all cursor-pointer"
            >
              {({ loading }) => (
                <>
                  <Download className="w-3.5 h-3.5" />
                  {loading ? 'Compiling PDF...' : 'Download Proposal'}
                </>
              )}
            </PDFDownloadLink>

            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic PDF Viewer Container */}
        <div className="flex-1 bg-neutral-100 relative">
          <PDFViewer className="w-full h-full border-0">
            {pdfInstance}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
