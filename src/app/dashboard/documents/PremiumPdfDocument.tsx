'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Standard fonts
Font.register({
  family: 'Helvetica-Bold',
  src: 'https://fonts.gstatic.com/s/helveticaneue/v70/normal.ttf', // Fallback to PDF native Helvetica
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111',
    lineHeight: 1.6,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandName: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  docType: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  meta: {
    textAlign: 'right',
  },
  metaText: {
    fontSize: 9,
    color: '#666',
  },
  addresses: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addressCol: {
    width: '45%',
  },
  addressTitle: {
    fontSize: 9,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  titleSection: {
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  // Table
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginVertical: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontWeight: 'bold',
  },
  col1: { width: '40%' },
  col2: { width: '40%' },
  col3: { width: '20%', textAlign: 'right' },
  colTotal: { width: '80%', textAlign: 'right', fontWeight: 'bold' },
  colTotalVal: { width: '20%', textAlign: 'right', fontWeight: 'bold' },
  summarySection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryGrid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryCol: {
    width: '45%',
  },
  clauseTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 4,
  },
  signatureContainer: {
    marginTop: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    marginTop: 40,
  },
});

interface PdfDocumentProps {
  type: string;
  documentId: string;
  title: string;
  client: any;
  freelancer: any;
  content: any;
  date: string;
}

export const PremiumPdfDocument = ({ type, documentId, title, client, freelancer, content, date }: PdfDocumentProps) => {
  const isInvoice = type === 'invoice';
  const isQuotation = type === 'quotation';
  const isAgreement = type === 'agreement';
  const isRequirement = type === 'requirement';
  const isHandover = type === 'handover';
  const currency = content.currency || '$';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>{freelancer?.freelancer_name || 'Freelancer OS'}</Text>
            <Text style={styles.docType}>{type}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaText}>Document ID: {documentId}</Text>
            <Text style={styles.metaText}>Date: {date}</Text>
            {isInvoice && <Text style={styles.metaText}>Status: {content.status || 'Pending'}</Text>}
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addresses}>
          <View style={styles.addressCol}>
            <Text style={styles.addressTitle}>From</Text>
            <Text style={{ fontWeight: 'bold' }}>{freelancer?.freelancer_name}</Text>
            <Text>{freelancer?.freelancer_email}</Text>
            <Text>{freelancer?.phone_number}</Text>
            <Text>{freelancer?.address}</Text>
          </View>
          <View style={styles.addressCol}>
            <Text style={styles.addressTitle}>To</Text>
            <Text style={{ fontWeight: 'bold' }}>{client?.name}</Text>
            <Text>{client?.company_name}</Text>
            <Text>{client?.email}</Text>
            <Text>{client?.address}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {client?.project_type && <Text style={{ color: '#666', fontSize: 10 }}>Project: {client.project_type}</Text>}
        </View>

        {/* Quotation & Invoice Table */}
        {(isQuotation || isInvoice) && (
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.col1}>Service / Item</Text>
              <Text style={styles.col2}>Description</Text>
              <Text style={styles.col3}>Price</Text>
            </View>
            {(content.services || []).map((service: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{service.name}</Text>
                <Text style={styles.col2}>{service.description || 'N/A'}</Text>
                <Text style={styles.col3}>{currency}{parseFloat(service.price || '0').toFixed(2)}</Text>
              </View>
            ))}

            {/* Calculations */}
            <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
              <View style={styles.tableRow}>
                <Text style={styles.colTotal}>Subtotal</Text>
                <Text style={styles.colTotalVal}>{currency}{parseFloat(content.subtotal || '0').toFixed(2)}</Text>
              </View>
              {parseFloat(content.discount || '0') > 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.colTotal}>Discount</Text>
                  <Text style={styles.colTotalVal}>-{currency}{parseFloat(content.discount || '0').toFixed(2)}</Text>
                </View>
              )}
              {parseFloat(content.tax || '0') > 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.colTotal}>Tax</Text>
                  <Text style={styles.colTotalVal}>{currency}{parseFloat(content.tax || '0').toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.colTotal, { fontSize: 12 }]}>Grand Total</Text>
                <Text style={[styles.colTotalVal, { fontSize: 12 }]}>{currency}{parseFloat(content.grandTotal || content.total || '0').toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Dynamic Details / Terms for Quotation */}
        {isQuotation && (
          <View style={styles.summarySection}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCol}>
                <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Timeline</Text>
                <Text>{content.timeline || 'N/A'}</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Payment Terms</Text>
                <Text>{content.paymentSchedule || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCol}>
                <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Revisions Included</Text>
                <Text>{content.revisions || 'N/A'}</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Advance Payment</Text>
                <Text>{content.advancePercent || '0'}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Agreement Clauses */}
        {isAgreement && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.clauseTitle}>1. Project Scope & Change Requests</Text>
            <Text>{content.projectScope || freelancer?.default_agreement_clauses?.projectScope || 'Detailed in main specification and approved quotation. Outside requirements are treated as change requests.'}</Text>
            <Text style={{ marginTop: 4 }}>Support & Maintenance: {content.supportDuration || 'N/A'}</Text>

            <Text style={styles.clauseTitle}>2. Ownership & Intellectual Property</Text>
            <Text>{content.ownershipClause || freelancer?.default_agreement_clauses?.ownership}</Text>

            <Text style={styles.clauseTitle}>3. Client Responsibilities & Access Credentials</Text>
            <Text>{freelancer?.default_agreement_clauses?.clientResponsibilities || 'Client shall provide necessary content and temporary credentials in a timely manner.'}</Text>

            <Text style={styles.clauseTitle}>4. Third-Party Service Disclaimer</Text>
            <Text>{freelancer?.default_agreement_clauses?.thirdPartyDisclaimer || 'Developer is not liable for hosting, domain or external API service outages or billing changes.'}</Text>

            <Text style={styles.clauseTitle}>5. Confidentiality</Text>
            <Text>{content.confidentialityClause || freelancer?.default_agreement_clauses?.confidentiality}</Text>

            <Text style={styles.clauseTitle}>6. Limitation of Liability</Text>
            <Text>{content.liabilityClause || freelancer?.default_agreement_clauses?.liability}</Text>

            <Text style={styles.clauseTitle}>7. Payment Default & Project Suspension</Text>
            <Text>Failure to clear invoice milestones within 7 business days of the deadline will result in immediate suspension of all production work, credentials access, and active deployments until account balances are settled.</Text>

            <Text style={styles.clauseTitle}>8. Termination & Dispute Resolution</Text>
            <Text>Either party may terminate this agreement with 14 days written notice. In the event of early termination, the client shall reimburse the Developer for all work completed up to the date of notice. Disputes shall be resolved through amicable negotiation before proceeding to formal arbitration.</Text>

            <Text style={styles.clauseTitle}>9. Maintenance Programs & Support Packages</Text>
            <Text>{freelancer?.default_agreement_clauses?.maintenancePlans || 'Basic Plan (₹299/mo) and Pro Plan (₹549/mo) support structures available upon request.'}</Text>
          </View>
        )}


        {/* Requirement Form Content */}
        {isRequirement && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 8 }}>Website Design & Feature Outline</Text>
            <View style={{ marginVertical: 4 }}>
              <Text>Color Preferences: {content.colorPreferences || 'N/A'}</Text>
              <Text>Target Pages: {content.websitePages || 'N/A'}</Text>
              <Text>Core Features Required: {content.featuresRequired || 'N/A'}</Text>
              <Text>Competitor References: {content.competitorReferences || 'N/A'}</Text>
              <Text>Branding & Logo Details: {content.brandingDetails || 'N/A'}</Text>
              <Text>Social Media Links: {content.socialMedia || 'N/A'}</Text>
              <Text>SEO Requirements: {content.seoRequirements || 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* Handover Specifications */}
        {isHandover && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 8 }}>Project Delivery & Access Details</Text>
            <View style={{ marginVertical: 4 }}>
              <Text>Live Website URL: {content.websiteUrl || 'N/A'}</Text>
              <Text>Hosting Access Details: {content.hostingDetails || 'N/A'}</Text>
              <Text>Domain Access Details: {content.domainDetails || 'N/A'}</Text>
              <Text>Git Repository Information: {content.repositoryInfo || 'N/A'}</Text>
              <Text>Deployment Protocol: {content.deploymentInfo || 'N/A'}</Text>
              <Text>Support and Maintenance Info: {content.supportInfo || 'N/A'}</Text>
            </View>
          </View>
        )}


        {/* Signatures */}
        {(isQuotation || isAgreement) && (
          <View style={styles.signatureContainer}>
            <View style={styles.signatureBlock}>
              <Text>Freelancer Signature</Text>
              {freelancer?.freelancer_name && (
                <Text style={{ fontStyle: 'italic', marginTop: 15, fontSize: 12 }}>{freelancer.freelancer_name}</Text>
              )}
            </View>
            <View style={styles.signatureBlock}>
              <Text>Client Signature Placeholder</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
