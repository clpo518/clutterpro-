/**
 * Clinical Report PDF Generator
 * 
 * Creates a professional, medical-grade PDF report for SLPs
 * using @react-pdf/renderer
 * 
 * Structure:
 * 1. Professional header
 * 2. Patient information
 * 3. Follow-up summary
 * 4. Rate measurements (table by context)
 * 5. Regularity analysis
 * 6. Temporal progression
 * 7. Observations (if provided)
 * 8. Therapeutic directions
 * 9. Disclaimer
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { ClinicalAnalysis, getSPSColor, getSPSInterpretation } from "@/lib/clinicalReportAnalysis";

// Color palette
const colors = {
  primary: "#059669", // Emerald-600
  primaryLight: "#ecfdf5",
  secondary: "#0284c7", // Sky-600
  warning: "#d97706", // Amber-600
  danger: "#dc2626", // Red-600
  text: "#1e293b", // Slate-800
  textMuted: "#64748b", // Slate-500
  border: "#e2e8f0", // Slate-200
  background: "#ffffff",
  tableHeader: "#f1f5f9", // Slate-100
  sectionBg: "#f8fafc", // Slate-50
};

// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    paddingBottom: 60,
    backgroundColor: colors.background,
    color: colors.text,
  },
  
  // Header
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 2,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 10,
  },
  headerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  headerMetaItem: {
    fontSize: 9,
    color: colors.textMuted,
  },
  recipientBox: {
    backgroundColor: colors.sectionBg,
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  recipientText: {
    fontSize: 10,
    color: colors.text,
  },
  
  // Section with numbering
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  sectionNumber: {
    width: 22,
    height: 22,
    backgroundColor: colors.primary,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionNumberText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text,
  },
  
  // Patient info card
  patientCard: {
    backgroundColor: colors.sectionBg,
    padding: 12,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  patientDetail: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 2,
  },
  
  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.sectionBg,
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  
  // Table styles
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableHeader: {
    backgroundColor: colors.tableHeader,
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 9,
  },
  tableCellHeader: {
    fontWeight: "bold",
    fontSize: 9,
    color: colors.text,
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableCellMuted: {
    color: colors.textMuted,
  },
  
  // Interpretation box
  interpretationBox: {
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: 8,
  },
  interpretationText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.text,
  },
  
  // Notes box
  notesBox: {
    backgroundColor: colors.sectionBg,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 60,
  },
  notesLabel: {
    fontSize: 8,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: "bold",
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.text,
  },
  
  // Recommendation box
  recommendationBox: {
    backgroundColor: "#fef3c7", // Amber-100
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  recommendationTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.warning,
    marginBottom: 6,
  },
  
  // Chart placeholder
  chartContainer: {
    backgroundColor: colors.sectionBg,
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text,
  },
  chartBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 70,
    gap: 3,
    paddingBottom: 15,
  },
  chartColumn: {
    flex: 1,
    minWidth: 15,
    borderRadius: 2,
  },
  chartLabel: {
    fontSize: 6,
    color: colors.textMuted,
    marginTop: 3,
    textAlign: "center",
  },
  chartLegend: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
    justifyContent: "center",
  },
  chartLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegendText: {
    fontSize: 7,
    color: colors.textMuted,
  },
  
  // Disclaimer
  disclaimer: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    fontSize: 7,
    color: colors.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 1.4,
  },
  
  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.textMuted,
  },
});

interface ClinicalReportPDFProps {
  analysis: ClinicalAnalysis;
  therapistName?: string;
}

// Section Header Component
const SectionHeader: React.FC<{ number: number; title: string }> = ({ number, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionNumber}>
      <Text style={styles.sectionNumberText}>{number}</Text>
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const ClinicalReportPDF: React.FC<ClinicalReportPDFProps> = ({
  analysis,
  therapistName,
}) => {
  const today = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  // Calculate bar heights for chart (max 60px)
  const maxSPS = Math.max(...analysis.evolutionData.map(d => d.sps), 6);
  const getBarHeight = (sps: number) => Math.max((sps / maxSPS) * 60, 4);
  
  const getBarColor = (sps: number) => {
    const color = getSPSColor(sps);
    if (color === "green") return colors.primary;
    if (color === "orange") return colors.warning;
    return colors.danger;
  };
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1. PROFESSIONAL HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SLP Follow-Up Clinical Report</Text>
          <Text style={styles.headerSubtitle}>Instrumental analysis of articulatory rate</Text>

          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaItem}>Date: {today}</Text>
            {therapistName && (
              <Text style={styles.headerMetaItem}>Clinician: {therapistName}</Text>
            )}
          </View>

          {analysis.recipientDoctor && (
            <View style={styles.recipientBox}>
              <Text style={styles.recipientText}>Attention: {analysis.recipientDoctor}</Text>
            </View>
          )}
        </View>
        
        {/* 2. PATIENT INFORMATION */}
        <View style={styles.section}>
          <SectionHeader number={1} title="Patient Information" />
          <View style={styles.patientCard}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{analysis.patientName}</Text>
              {analysis.patientAge && (
                <Text style={styles.patientDetail}>Age: {analysis.patientAge} years</Text>
              )}
              <Text style={styles.patientDetail}>Follow-up since {analysis.followUpSince}</Text>
            </View>
          </View>
        </View>
        
        {/* 3. FOLLOW-UP SUMMARY */}
        <View style={styles.section}>
          <SectionHeader number={2} title="Follow-Up Summary" />
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analysis.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analysis.totalPracticeMinutes}</Text>
              <Text style={styles.statLabel}>Practice minutes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analysis.currentStreak}</Text>
              <Text style={styles.statLabel}>Consecutive days</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analysis.fluencyRatio}%</Text>
              <Text style={styles.statLabel}>Within target zone</Text>
            </View>
          </View>
        </View>
        
        {/* 4. RATE MEASUREMENTS */}
        <View style={styles.section}>
          <SectionHeader number={3} title="Articulatory Rate Measurements" />
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Context</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellCenter]}>Measured (syll/s)</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellCenter]}>Norm</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellCenter]}>Interpretation</Text>
            </View>

            {/* Reading */}
            {analysis.readingStats.count > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Oral reading ({analysis.readingStats.count} sessions)</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                  {analysis.readingStats.min.toFixed(2)} - {analysis.readingStats.max.toFixed(2)}{"\n"}
                  <Text style={styles.tableCellMuted}>(avg = {analysis.readingStats.avg.toFixed(2)})</Text>
                </Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>3.5 - 5.5</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>{getSPSInterpretation(analysis.readingStats.avg)}</Text>
              </View>
            )}

            {/* Improvisation */}
            {analysis.improvisationStats.count > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Spontaneous speech ({analysis.improvisationStats.count} sessions)</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                  {analysis.improvisationStats.min.toFixed(2)} - {analysis.improvisationStats.max.toFixed(2)}{"\n"}
                  <Text style={styles.tableCellMuted}>(avg = {analysis.improvisationStats.avg.toFixed(2)})</Text>
                </Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>4.0 - 5.5</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>{getSPSInterpretation(analysis.improvisationStats.avg)}</Text>
              </View>
            )}

            {/* Global if only one type */}
            {(analysis.readingStats.count === 0 || analysis.improvisationStats.count === 0) && (
              <View style={[styles.tableRow, styles.tableRowLast]}>
                <Text style={styles.tableCell}>Overall average</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                  {analysis.minSPS.toFixed(2)} - {analysis.maxSPS.toFixed(2)}{"\n"}
                  <Text style={styles.tableCellMuted}>(avg = {analysis.avgSPS.toFixed(2)})</Text>
                </Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>3.5 - 5.5</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>{getSPSInterpretation(analysis.avgSPS)}</Text>
              </View>
            )}

            {/* Articulatory Rate */}
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={styles.tableCell}>Articulatory rate*</Text>
              <Text style={[styles.tableCell, styles.tableCellCenter]}>{analysis.articulatoryRate.toFixed(2)}</Text>
              <Text style={[styles.tableCell, styles.tableCellCenter]}>5.0 - 6.5</Text>
              <Text style={[styles.tableCell, styles.tableCellCenter, styles.tableCellMuted]}>Excluding pauses</Text>
            </View>
          </View>
          <Text style={{ fontSize: 7, color: colors.textMuted, marginTop: 4 }}>
            * Articulatory rate estimated per Van Zaalen = speech rate excluding breathing pauses
          </Text>
        </View>
        
        {/* 5. REGULARITY ANALYSIS */}
        <View style={styles.section}>
          <SectionHeader number={4} title="Regularity Analysis" />
          <View style={styles.interpretationBox}>
            <Text style={styles.interpretationText}>{analysis.mainDiagnosis}</Text>
          </View>
          <View style={[styles.interpretationBox, { marginTop: 6 }]}>
            <Text style={styles.interpretationText}>{analysis.fluencyInterpretation}</Text>
          </View>
        </View>
        
        {/* 6. TEMPORAL PROGRESSION (if included) */}
        {analysis.includeEvolutionChart && analysis.evolutionData.length > 2 && (
          <View style={styles.section}>
            <SectionHeader number={5} title="Temporal Progression" />
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Progress chart (recent sessions)</Text>
              <View style={styles.chartBar}>
                {analysis.evolutionData.map((point, idx) => (
                  <View key={idx} style={{ flex: 1, alignItems: "center" }}>
                    <View
                      style={[
                        styles.chartColumn,
                        {
                          height: getBarHeight(point.sps),
                          backgroundColor: getBarColor(point.sps),
                        },
                      ]}
                    />
                    <Text style={styles.chartLabel}>{point.date.slice(0, 6)}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.chartLegendItem}>
                  <View style={[styles.chartLegendDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.chartLegendText}>Normal fluency (≤ 4.5)</Text>
                </View>
                <View style={styles.chartLegendItem}>
                  <View style={[styles.chartLegendDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.chartLegendText}>Fast (4.5-5.5)</Text>
                </View>
                <View style={styles.chartLegendItem}>
                  <View style={[styles.chartLegendDot, { backgroundColor: colors.danger }]} />
                  <Text style={styles.chartLegendText}>Cluttering (&gt; 5.5)</Text>
                </View>
              </View>
            </View>
            <View style={styles.interpretationBox}>
              <Text style={styles.interpretationText}>{analysis.trendInterpretation}</Text>
            </View>
          </View>
        )}
        
        {/* 7. OBSERVATIONS (if provided) */}
        {analysis.therapistNotes && (
          <View style={styles.section}>
            <SectionHeader number={analysis.includeEvolutionChart ? 6 : 5} title="Clinician Observations" />
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{analysis.therapistNotes}</Text>
            </View>
          </View>
        )}
        
        {/* 8. THERAPEUTIC DIRECTIONS */}
        <View style={styles.section}>
          <SectionHeader
            number={analysis.therapistNotes
              ? (analysis.includeEvolutionChart ? 7 : 6)
              : (analysis.includeEvolutionChart ? 6 : 5)
            }
            title="Suggested Therapeutic Directions"
          />
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Proposed therapeutic approaches:</Text>
            <Text style={styles.interpretationText}>{analysis.recommendation}</Text>
          </View>
        </View>
        
        {/* 9. DISCLAIMER */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This document is an instrumental aid for measuring articulatory rate.{"\n"}
            It does not replace the clinical diagnosis of the SLP or the standard speech assessment.{"\n"}
            The data presented should be integrated into the patient's overall evaluation.
          </Text>
          <Text style={[styles.disclaimerText, { marginTop: 6 }]}>
            Data collected via ClutterPro.com - Fluency training platform
          </Text>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ClutterPro.com — Speech rate measurement tool</Text>
          <Text style={styles.footerText}>Page 1/1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ClinicalReportPDF;
