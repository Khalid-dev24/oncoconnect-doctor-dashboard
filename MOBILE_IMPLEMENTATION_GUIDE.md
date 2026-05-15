# Mobile Responsiveness - Implementation Guide

## Overview
This guide provides step-by-step solutions to make the OncoConnect dashboard mobile responsive.

---

## Solution: Create a Responsive CSS File

### Step 1: Create Global Responsive CSS

Create a new file: `src/styles/responsive.css`

```css
/* ===== BREAKPOINTS ===== */
/* Mobile: 320px - 480px */
/* Mobile+: 481px - 640px */
/* Tablet: 641px - 1024px */
/* Desktop: 1025px+ */

/* ===== RESET & BASE STYLES ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  width: 100%;
}

/* ===== RESPONSIVE TEXT ===== */
@media (max-width: 640px) {
  h1 { font-size: 24px !important; }
  h2 { font-size: 18px !important; }
  h3 { font-size: 16px !important; }
  p { font-size: 14px !important; }
  label { font-size: 13px !important; }
  input, select, button { font-size: 16px !important; }
}

/* ===== NAVIGATION BAR ===== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
}

@media (max-width: 768px) {
  .nav-links {
    gap: 15px;
  }
  
  .nav-link {
    font-size: 12px !important;
  }
}

@media (max-width: 480px) {
  .nav-links {
    display: none;
  }
  
  .hamburger-menu {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    gap: 5px;
  }
  
  .hamburger-menu span {
    width: 25px;
    height: 3px;
    background-color: #0DD6C8;
    border-radius: 2px;
  }
  
  .mobile-nav {
    position: absolute;
    top: 70px;
    right: 0;
    left: 0;
    background: #0F1E35;
    border-bottom: 1px solid #0B8F8F;
    display: flex;
    flex-direction: column;
    padding: 15px;
    gap: 10px;
  }
  
  .mobile-nav a,
  .mobile-nav button {
    padding: 12px 15px !important;
    width: 100% !important;
    text-align: left;
    border: 1px solid #0B8F8F;
    border-radius: 6px;
    font-size: 14px !important;
  }
}

/* ===== CONTAINERS & PADDING ===== */
.container {
  min-height: 100vh;
  width: 100%;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 30px 15px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 20px 12px;
  }
}

/* ===== FLEX LAYOUTS - RESPONSIVE ===== */
.flex-row-tablet-column {
  display: flex;
  flex-direction: row;
  gap: 32px;
}

@media (max-width: 1024px) {
  .flex-row-tablet-column {
    flex-direction: column;
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .flex-row-tablet-column {
    gap: 16px;
  }
}

/* ===== GRID LAYOUTS - RESPONSIVE ===== */
/* Stats Grid: 4 columns desktop, 2 tablet, 1 mobile */
.stats-grid {
  display: grid;
  gridTemplateColumns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .stats-grid {
    gridTemplateColumns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    gridTemplateColumns: 1fr;
  }
}

/* Cards Grid: 3 columns desktop, 2 tablet, 1 mobile */
.cards-grid {
  display: grid;
  gridTemplateColumns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

@media (max-width: 1024px) {
  .cards-grid {
    gridTemplateColumns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .cards-grid {
    gridTemplateColumns: 1fr;
  }
}

/* Form Grid: 2 columns desktop, 1 mobile */
.form-grid {
  display: grid;
  gridTemplateColumns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .form-grid {
    gridTemplateColumns: 1fr;
    gap: 12px;
  }
}

/* ===== FORM ELEMENTS ===== */
input, select, textarea {
  min-height: 44px;
  padding: 10px 12px;
}

@media (max-width: 480px) {
  input, select, textarea {
    min-height: 48px;
    padding: 12px 14px;
  }
}

/* ===== BUTTON SIZES ===== */
button {
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

@media (max-width: 480px) {
  button {
    min-height: 48px;
    width: 100%;
    padding: 12px 16px;
  }
}

/* ===== CARDS ===== */
.card {
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #0B8F8F;
  background: #0F1E35;
}

@media (max-width: 480px) {
  .card {
    padding: 16px;
    border-radius: 8px;
  }
}

/* ===== MODAL ===== */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: #0F1E35;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

@media (max-width: 480px) {
  .modal {
    padding: 16px;
  }
  
  .modal-content {
    border-radius: 8px;
    padding: 16px;
    max-height: 95vh;
  }
}

/* ===== TABLE RESPONSIVE ===== */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 480px) {
  table {
    font-size: 12px;
  }
  
  .table-cell {
    padding: 8px 4px;
  }
}

/* ===== LOGO & BRANDING ===== */
.logo {
  font-size: 24px;
}

.brand-name {
  font-size: 18px;
  font-weight: bold;
}

@media (max-width: 480px) {
  .logo {
    font-size: 20px;
  }
  
  .brand-name {
    font-size: 14px;
  }
}

/* ===== SECTIONS ===== */
.section {
  margin-bottom: 40px;
}

@media (max-width: 480px) {
  .section {
    margin-bottom: 24px;
  }
}

/* ===== UTILITY CLASSES ===== */
.hide-mobile {
  display: none !important;
}

.show-mobile {
  display: none !important;
}

@media (max-width: 480px) {
  .hide-mobile {
    display: block !important;
  }
  
  .show-mobile {
    display: block !important;
  }
}

/* ===== SPACING RESPONSIVE ===== */
.padding-large {
  padding: 40px;
}

.padding-medium {
  padding: 24px;
}

@media (max-width: 768px) {
  .padding-large {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .padding-large {
    padding: 16px;
  }
  
  .padding-medium {
    padding: 12px;
  }
}

/* ===== GAP RESPONSIVE ===== */
.gap-large {
  gap: 32px;
}

.gap-medium {
  gap: 16px;
}

@media (max-width: 480px) {
  .gap-large {
    gap: 16px;
  }
  
  .gap-medium {
    gap: 8px;
  }
}

/* ===== FLEXBOX LAYOUTS ===== */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 480px) {
  .flex-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ===== SPECIAL COMPONENTS ===== */

/* Login Page - Two Column to Single */
.login-container {
  display: flex;
  flex-direction: row;
}

.login-left, .login-right {
  flex: 1;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    display: none;
  }
}

/* Header Layout */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 40px;
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .header > button {
    width: 100%;
  }
}

/* Invite Section */
.invite-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

@media (max-width: 768px) {
  .invite-section {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .invite-section {
    gap: 16px;
  }
}

/* Input Group */
.input-group {
  display: flex;
  gap: 8px;
}

@media (max-width: 480px) {
  .input-group {
    flex-direction: column;
  }
  
  .input-group input {
    flex: 1;
  }
  
  .input-group button {
    width: 100%;
  }
}

/* ===== PRINT STYLES ===== */
@media print {
  .navbar, .modal {
    display: none;
  }
}
```

---

## Step 2: Add Mobile Navigation Hook

Create: `src/hooks/useResponsive.js`

```javascript
import { useState, useEffect } from 'react';

export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    isMobile: typeof window !== 'undefined' ? window.innerWidth <= 480,
    isTablet: typeof window !== 'undefined' ? window.innerWidth <= 1024 && window.innerWidth > 480,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth > 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        isMobile: width <= 480,
        isTablet: width <= 1024 && width > 480,
        isDesktop: width > 1024,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}
```

---

## Step 3: Update Login Page

Example conversion for `DoctorLogin.js`:

```javascript
import { useResponsive } from '../hooks/useResponsive';

export default function DoctorLogin({ onLogin }) {
  const { isMobile } = useResponsive();
  
  // When isMobile is true, hide left panel and adjust styles
  const containerStyle = isMobile ? {
    ...styles.container,
    flexDirection: 'column', // Stack vertically on mobile
  } : styles.container;
  
  const leftPanelStyle = isMobile ? {
    ...styles.leftPanel,
    display: 'none', // Hide on mobile
  } : styles.leftPanel;
  
  const rightPanelStyle = isMobile ? {
    ...styles.rightPanel,
    padding: '20px', // Reduce padding on mobile
  } : styles.rightPanel;
  
  // ... rest of component
}
```

---

## Step 4: Update Navigation Bar Component

Create: `src/components/Navbar.js`

```javascript
import { useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { useNavigate } from 'react-router-dom';

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

  const handleLogout = () => {
    localStorage.removeItem('doctor_id');
    localStorage.removeItem('doctor_token');
    onLogout();
    navigate('/login');
  };

  if (isMobile) {
    return (
      <div style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.navBrand}>
            <span style={styles.logo}>❤️</span>
            <span style={styles.brandName}>OncoConnect</span>
          </div>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={styles.hamburger}
          >
            <span style={styles.hamburgerLine} />
            <span style={styles.hamburgerLine} />
            <span style={styles.hamburgerLine} />
          </button>
        </div>

        {showMobileMenu && (
          <div style={styles.mobileMenu}>
            <a href="/dashboard" style={styles.mobileLink}>Dashboard</a>
            <a href="/patients" style={styles.mobileLink}>Patients</a>
            <a href="/earnings" style={styles.mobileLink}>Earnings</a>
            <a href="/prescriptions" style={styles.mobileLink}>Prescriptions</a>
            <button onClick={handleLogout} style={styles.mobileLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  // Desktop navbar
  return (
    <div style={styles.navbar}>
      <div style={styles.navContent}>
        <div style={styles.navBrand}>
          <span style={styles.logo}>❤️</span>
          <span style={styles.brandName}>OncoConnect</span>
        </div>
        
        <div style={styles.navLinks}>
          <a href="/dashboard" style={{...styles.navLink, color: currentPage === 'dashboard' ? COLORS.mint : COLORS.muted}}>
            Dashboard
          </a>
          <a href="/patients" style={{...styles.navLink, color: currentPage === 'patients' ? COLORS.mint : COLORS.muted}}>
            Patients
          </a>
          <a href="/earnings" style={{...styles.navLink, color: currentPage === 'earnings' ? COLORS.mint : COLORS.muted}}>
            Earnings
          </a>
          <a href="/prescriptions" style={{...styles.navLink, color: currentPage === 'prescriptions' ? COLORS.mint : COLORS.muted}}>
            Prescriptions
          </a>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
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
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: '5px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  hamburgerLine: {
    width: '25px',
    height: '3px',
    backgroundColor: COLORS.mint,
    borderRadius: '2px',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '15px',
    gap: '10px',
    borderTop: `1px solid ${COLORS.teal}`,
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
  },
};
```

---

## Step 5: Import CSS in Main App

Update `src/index.js`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/responsive.css';  // Add this line

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Testing Checklist

- [ ] Test on iPhone 12 (390x844)
- [ ] Test on iPhone SE (375x667)
- [ ] Test on iPad (768x1024)
- [ ] Test on Galaxy S21 (360x800)
- [ ] Test on Pixel 6 (412x915)
- [ ] Test on desktop (1920x1080)
- [ ] Test landscape orientation
- [ ] Test form submission on mobile
- [ ] Test navigation menu toggle
- [ ] Test modal on mobile
- [ ] Test table scrolling on mobile
- [ ] Test button touch targets (44x44px minimum)

---

## Implementation Order

1. Import responsive CSS in index.js
2. Create useResponsive hook
3. Create Navbar component with mobile support
4. Update each page component to use responsive styles
5. Test on multiple devices
6. Fine-tune breakpoints as needed
7. Add touch-friendly improvements

---

## Notes

- **Breakpoints:** 480px (mobile), 768px (tablet), 1024px (desktop)
- **Font size on mobile:** Minimum 16px for inputs to prevent iOS zoom
- **Touch targets:** Minimum 44x44px for accessibility
- **Spacing:** Reduce padding/margins on mobile
- **Grid columns:** 1 column on mobile, 2+ on tablet/desktop
- **Navigation:** Hamburger menu for mobile
- **Typography:** Responsive font sizes

This approach provides a solid foundation for mobile responsiveness across the entire application.
