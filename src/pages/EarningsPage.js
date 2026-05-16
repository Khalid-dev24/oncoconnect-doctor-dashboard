import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import Navbar from '../components/Navbar';
import api from '../services/api';

const COLORS = {
  navy: '#0A1628',
  card: '#0F1E35',
  teal: '#0B8F8F',
  mint: '#0DD6C8',
  text: '#FFFFFF',
  muted: '#7A9EAE',
  red: '#EF4444',
  green: '#22C55E',
  amber: '#F59E0B',
};

export default function EarningsPage({ doctorId, onLogout }) {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month'); // month, quarter, year

  const loadEarnings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/doctors/${doctorId}/dashboard`
      );
      setEarnings(response.data.earnings || {});
    } catch (err) {
      console.error('Error loading earnings:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar currentPage="earnings" onLogout={onLogout} />
        <div style={styles.loadingBox}>Loading earnings...</div>
      </div>
    );
  }

  const totalEarnings = earnings?.total || 0;
  const monthlyEarnings = earnings?.this_month || 0;
  const transactions = earnings?.recent_transactions || [];

  const avgPerConsultation = 28000; // Doctor's share per consultation
  const totalConsultations = totalEarnings > 0 ? Math.floor(totalEarnings / avgPerConsultation) : 0;
  const monthlyConsultations = monthlyEarnings > 0 ? Math.floor(monthlyEarnings / avgPerConsultation) : 0;

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <Navbar currentPage="earnings" onLogout={onLogout} />

      {/* Main Content */}
      <div style={{...styles.mainContent, ...(isMobile && { padding: '20px 12px' })}} className="responsive-padding-lg">
        {/* Header */}
        <div style={{...styles.header, ...(isMobile && { marginBottom: '24px' })}}>
          <div>
            <h1 style={{...styles.title, ...(isMobile && { fontSize: '24px' })}}>Earnings Dashboard</h1>
            <p style={styles.subtitle}>Track your income from patient consultations</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{...styles.metricsGrid, ...(isMobile && { gridTemplateColumns: '1fr' })}} data-grid="4col">
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Earned</div>
            <div style={styles.metricValue}>
              ₦{(totalEarnings / 1000).toFixed(1)}K
            </div>
            <div style={styles.metricSubtext}>
              {totalConsultations} consultations
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>This Month</div>
            <div style={styles.metricValue}>
              ₦{(monthlyEarnings / 1000).toFixed(1)}K
            </div>
            <div style={styles.metricSubtext}>
              {monthlyConsultations} consultations
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Per Consultation</div>
            <div style={styles.metricValue}>
              ₦28K
            </div>
            <div style={styles.metricSubtext}>
              Your share (70%)
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Average Daily</div>
            <div style={styles.metricValue}>
              ₦{totalEarnings > 0 ? Math.floor(totalEarnings / 30 / 1000) : 0}K
            </div>
            <div style={styles.metricSubtext}>
              Last 30 days
            </div>
          </div>
        </div>

        {/* Earnings Chart Section */}
        <div style={styles.chartSection}>
          <div style={styles.chartHeader}>
            <h2 style={styles.chartTitle}>Earnings Over Time</h2>
            <div style={{...styles.timeframeButtons, ...(isMobile && { flexDirection: 'column', gap: '8px' })}} className="responsive-filter-container">
              <button
                onClick={() => setTimeframe('month')}
                style={{
                  ...styles.timeframeButton,
                  backgroundColor: timeframe === 'month' ? COLORS.mint : COLORS.card,
                  color: timeframe === 'month' ? COLORS.navy : COLORS.text,
                }}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeframe('quarter')}
                style={{
                  ...styles.timeframeButton,
                  backgroundColor: timeframe === 'quarter' ? COLORS.mint : COLORS.card,
                  color: timeframe === 'quarter' ? COLORS.navy : COLORS.text,
                }}
              >
                Last 3 Months
              </button>
              <button
                onClick={() => setTimeframe('year')}
                style={{
                  ...styles.timeframeButton,
                  backgroundColor: timeframe === 'year' ? COLORS.mint : COLORS.card,
                  color: timeframe === 'year' ? COLORS.navy : COLORS.text,
                }}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Mock Chart */}
          <div style={styles.chartPlaceholder}>
            <div style={styles.chartEmoji}>📊</div>
            <p style={styles.chartPlaceholderText}>
              Chart coming soon - showing earnings trend
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Payment Details</h2>
          <div style={styles.paymentCard}>
            <div style={styles.paymentInfo}>
              <div style={styles.bankIcon}>🏦</div>
              <div>
                <div style={styles.bankName}>Bank Account</div>
                <div style={styles.bankDetails}>
                  Access Bank • ••••••••7890
                </div>
              </div>
            </div>
            <div style={styles.paymentStatus}>
              <div style={styles.statusBadge}>Verified</div>
              <button style={styles.editButton}>Edit</button>
            </div>
          </div>

          <div style={styles.paymentInfo}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Payment Schedule:</span>
              <span style={styles.infoValue}>Daily (T+1 settlement)</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Next Payout:</span>
              <span style={styles.infoValue}>Tomorrow at 9:00 AM</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Processing Fee:</span>
              <span style={styles.infoValue}>FREE (we cover it)</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Transactions</h2>

          {transactions && transactions.length > 0 ? (
            <div style={isMobile ? { overflowX: 'auto', WebkitOverflowScrolling: 'touch' } : {}} className="table-container">
              <div style={styles.transactionTable}>
              <div style={styles.tableHeader}>
                <div style={styles.tableCell}>Type</div>
                <div style={styles.tableCell}>Date</div>
                <div style={styles.tableCell}>Amount</div>
                <div style={styles.tableCell}>Status</div>
              </div>

              {transactions.map((tx, idx) => (
                <div key={idx} style={styles.tableRow}>
                  <div style={styles.tableCell}>
                    <div style={styles.transactionType}>
                      {(tx.payment_type === 'consultation_open' || tx.status === 'consultation_open') && '💬'}
                      {(tx.payment_type === 'window_extension' || tx.status === 'window_extension') && '⏱️'}
                      {(tx.payment_type === 'video_call' || tx.status === 'video_call') && '📹'}
                      {' '}
                      {(tx.payment_type || tx.status || 'Payment').replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>
                  <div style={styles.tableCell}>
                    {new Date(tx.paid_at).toLocaleDateString()}
                  </div>
                  <div style={styles.tableCell}>
                    <span style={styles.amountPositive}>
                      +₦{(tx.doctor_share || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.tableCell}>
                    <span style={styles.statusBadgeSmall}>
                      {tx.status === 'success' ? '✓ Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            </div>
          ) : (
            <div style={styles.emptyTransactions}>
              <div style={styles.emptyIcon}>💸</div>
              <p style={styles.emptyText}>No transactions yet</p>
              <p style={styles.emptySubtext}>
                Start accepting patient consultations to earn money
              </p>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>How Earnings Work</h2>
          <div style={styles.faqContainer}>
            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>❓ How much do I earn per consultation?</div>
              <div style={styles.faqAnswer}>
                You earn 70% of the consultation fee. Patient pays ₦40,000 → You get ₦28,000 instantly.
              </div>
            </div>

            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>⏱️ When do I get paid?</div>
              <div style={styles.faqAnswer}>
                Money is split instantly after payment. It reaches your bank account within 24 hours (T+1 settlement).
              </div>
            </div>

            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>🔄 What about window extensions?</div>
              <div style={styles.faqAnswer}>
                If a patient extends their consultation (₦15,000), you earn ₦10,500 (70%). Same instant split.
              </div>
            </div>

            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>📊 Can I see detailed reports?</div>
              <div style={styles.faqAnswer}>
                Yes! This dashboard shows all your transactions. Download CSV for your records anytime.
              </div>
            </div>

            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>💰 Any hidden fees?</div>
              <div style={styles.faqAnswer}>
                No hidden fees. We charge patients 30%, you get 70%. No processing fees, no monthly charges.
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div style={styles.exportSection}>
          <h3 style={styles.exportTitle}>Download Your Records</h3>
          <p style={styles.exportDescription}>
            Export your earnings and transaction history for accounting or tax purposes
          </p>
          <div style={styles.exportButtons}>
            <button style={styles.exportButton}>
              📄 Download CSV
            </button>
            <button style={styles.exportButton}>
              📊 Download PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: COLORS.navy,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  navbar: {
    backgroundColor: COLORS.card,
    borderBottom: `1px solid ${COLORS.teal}`,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    fontSize: '24px',
  },
  brandName: {
    color: COLORS.mint,
    fontWeight: 'bold',
    fontSize: '18px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  navLink: {
    color: COLORS.muted,
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  logoutButton: {
    backgroundColor: COLORS.red,
    color: COLORS.text,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: 0,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: '14px',
    margin: '8px 0 0 0',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '40px',
  },
  metricCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '24px',
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  metricValue: {
    color: COLORS.green,
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '6px',
  },
  metricSubtext: {
    color: COLORS.muted,
    fontSize: '12px',
  },
  chartSection: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '40px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: 0,
  },
  timeframeButtons: {
    display: 'flex',
    gap: '8px',
  },
  timeframeButton: {
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  chartPlaceholder: {
    backgroundColor: COLORS.navy,
    borderRadius: '8px',
    padding: '60px 40px',
    textAlign: 'center',
  },
  chartEmoji: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  chartPlaceholderText: {
    color: COLORS.muted,
    fontSize: '13px',
    margin: 0,
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 16px 0',
  },
  paymentCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  paymentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  bankIcon: {
    fontSize: '32px',
  },
  bankName: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: '14px',
  },
  bankDetails: {
    color: COLORS.muted,
    fontSize: '12px',
    marginTop: '4px',
  },
  paymentStatus: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: COLORS.green,
    color: COLORS.navy,
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: COLORS.teal,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  infoItem: {
    backgroundColor: COLORS.card,
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: '12px',
  },
  infoValue: {
    color: COLORS.mint,
    fontSize: '12px',
    fontWeight: '600',
  },
  transactionTable: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '16px',
    padding: '16px',
    backgroundColor: COLORS.navy,
    borderBottom: `1px solid ${COLORS.teal}`,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '16px',
    padding: '16px',
    borderBottom: `1px solid ${COLORS.navy}`,
  },
  tableCell: {
    color: COLORS.text,
    fontSize: '13px',
  },
  transactionType: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  amountPositive: {
    color: COLORS.green,
    fontWeight: '600',
  },
  statusBadgeSmall: {
    backgroundColor: COLORS.green,
    color: COLORS.navy,
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
  },
  emptyTransactions: {
    backgroundColor: COLORS.card,
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    color: COLORS.text,
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    color: COLORS.muted,
    fontSize: '13px',
    margin: 0,
  },
  faqContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  faqItem: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    padding: '16px',
  },
  faqQuestion: {
    color: COLORS.mint,
    fontWeight: '600',
    fontSize: '13px',
    marginBottom: '8px',
  },
  faqAnswer: {
    color: COLORS.muted,
    fontSize: '12px',
    lineHeight: '1.6',
  },
  exportSection: {
    backgroundColor: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`,
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
  },
  exportTitle: {
    color: COLORS.navy,
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  exportDescription: {
    color: COLORS.navy,
    fontSize: '13px',
    margin: '0 0 20px 0',
  },
  exportButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  exportButton: {
    backgroundColor: COLORS.navy,
    color: COLORS.mint,
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    color: COLORS.mint,
    fontSize: '16px',
  },
};