import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666666',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '22%',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  statTitle: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
});

interface ReportPDFProps {
  usersData: any[];
  stats: any[];
  period: string;
}

const ReportPDF: React.FC<ReportPDFProps> = ({ usersData, stats, period }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>TunzaConnect System Report</Text>
      <Text style={styles.subHeader}>Period: {period}</Text>
      <Text style={styles.subHeader}>Generated: {new Date().toLocaleDateString()}</Text>

      {/* Stats Section */}
      <View style={styles.stats}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statBox}>
            <Text style={styles.statTitle}>{stat.title}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>

      {/* Users Table */}
      <Text style={styles.subHeader}>User Details</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Name</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Email</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Role</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Status</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Created</Text>
          </View>
        </View>

        {/* Table Rows */}
        {usersData.slice(0, 20).map((user, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{user.firstName} {user.lastName}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{user.email}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{user.Role?.name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{user.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{new Date(user.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export const generatePDFReport = async (usersData: any[], stats: any[], period: string) => {
  const blob = await pdf(<ReportPDF usersData={usersData} stats={stats} period={period} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `system-report-${period}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

export default ReportPDF;