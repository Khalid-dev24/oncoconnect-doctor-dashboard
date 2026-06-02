import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';

const COLORS = {
  navy: '#0A1628',
  card: '#0F1E35',
  teal: '#0B8F8F',
  mint: '#0DD6C8',
  text: '#FFFFFF',
  muted: '#7A9EAE',
  red: '#EF4444',
};

export default function Navbar({ currentPage, onLogout }) {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleNavClick = (path) => {
    setShowMobileMenu(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor_id');
    localStorage.removeItem('doctor_token');
    setShowMobileMenu(false);
    onLogout();
    navigate('/login');
  };

  return (
    <div style={styles.navbar}>
      <div style={styles.navContent}>
        <div style={styles.navBrand}>
          <span style={{ ...styles.logo, ...styles.responsiveLogo }}>❤️</span>
          <span style={{ ...styles.brandName, ...styles.responsiveBrandName }}>OncoConnect</span>
        </div>

        {!isMobile ? (
          <div style={styles.navLinks} className="nav-links">
            <a
              href="/dashboard"
              style={{
                ...styles.navLink,
                color: currentPage === 'dashboard' ? COLORS.mint : COLORS.muted,
              }}
            >
              Dashboard
            </a>
            <a
              href="/patients"
              style={{
                ...styles.navLink,
                color: currentPage === 'patients' ? COLORS.mint : COLORS.muted,
              }}
            >
              Patients
            </a>
            <a
              href="/earnings"
              style={{
                ...styles.navLink,
                color: currentPage === 'earnings' ? COLORS.mint : COLORS.muted,
              }}
            >
              Earnings
            </a>
            <a
              href="/messages"
              style={{
                ...styles.navLink,
                color: currentPage === 'messages' ? COLORS.mint : COLORS.muted,
              }}
            >
              Messages
            </a>
            <a
              href="/prescriptions"
              style={{
                ...styles.navLink,
                color: currentPage === 'prescriptions' ? COLORS.mint : COLORS.muted,
              }}
            >
              Prescriptions
            </a>
            <a
              href="/profile"
              style={{
                ...styles.navLink,
                color: currentPage === 'profile' ? COLORS.mint : COLORS.muted,
              }}
            >
              Profile
            </a>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={styles.hamburger}
              className="hamburger-menu"
            >
              <span />
              <span />
              <span />
            </button>

            {showMobileMenu && (
              <div style={styles.mobileMenu} className="mobile-nav">
                <a
                  href="/dashboard"
                  onClick={() => handleNavClick('/dashboard')}
                  style={styles.mobileLink}
                >
                  Dashboard
                </a>
                <a
                  href="/patients"
                  onClick={() => handleNavClick('/patients')}
                  style={styles.mobileLink}
                >
                  Patients
                </a>
                <a
                  href="/earnings"
                  onClick={() => handleNavClick('/earnings')}
                  style={styles.mobileLink}
                >
                  Earnings
                </a>
                <a
                  href="/prescriptions"
                  onClick={() => handleNavClick('/prescriptions')}
                  style={styles.mobileLink}
                >
                  Prescriptions
                </a>
                <a
                  href="/messages"
                  onClick={() => handleNavClick('/messages')}
                  style={styles.mobileLink}
                >
                  Messages
                </a>
                <a
                  href="/profile"
                  onClick={() => handleNavClick('/profile')}
                  style={styles.mobileLink}
                >
                  Profile
                </a>
                <button onClick={handleLogout} style={styles.mobileLogout}>
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
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
    position: 'relative',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    fontSize: '24px',
  },
  responsiveLogo: {
    // Mobile styles handled by CSS class
  },
  brandName: {
    color: COLORS.mint,
    fontWeight: 'bold',
    fontSize: '18px',
  },
  responsiveBrandName: {
    // Mobile styles handled by CSS class
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
    transition: 'color 0.2s',
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
    transition: 'all 0.2s',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: '5px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  mobileMenu: {
    position: 'absolute',
    top: '70px',
    right: 0,
    left: 0,
    backgroundColor: COLORS.card,
    borderBottom: `1px solid ${COLORS.teal}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '15px',
    gap: '10px',
    zIndex: 999,
  },
  mobileLink: {
    padding: '12px 15px',
    textDecoration: 'none',
    color: COLORS.text,
    fontSize: '14px',
    fontWeight: '500',
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '6px',
    textAlign: 'left',
    backgroundColor: COLORS.navy,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  mobileLogout: {
    backgroundColor: COLORS.red,
    color: COLORS.text,
    border: 'none',
    borderRadius: '6px',
    padding: '12px 15px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
