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

export default function DoctorProfile({ doctorId, onLogout }) {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    mdcn_number: '',
    hospital: '',
    specialty: 'Oncology',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
  });

  const [files, setFiles] = useState({
    profile_photo: null,
    signature: null,
    letterhead: null,
  });

  const [previews, setPreviews] = useState({
    profile_photo: null,
    signature: null,
    letterhead: null,
  });

  const [uploadingFiles, setUploadingFiles] = useState({
    profile_photo: false,
    signature: false,
    letterhead: false,
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      try {
        const response = await api.get(`/api/doctors/${doctorId}/profile`);
        setDoctorData(response.data.doctor);
        setFormData({
          full_name: response.data.doctor.full_name || '',
          email: response.data.doctor.email || '',
          phone_number: response.data.doctor.phone_number || '',
          mdcn_number: response.data.doctor.mdcn_number || '',
          hospital: response.data.doctor.hospital || '',
          specialty: response.data.doctor.specialty || 'Oncology',
          bank_name: response.data.doctor.bank_name || '',
          bank_account_number: response.data.doctor.bank_account_number || '',
          bank_account_name: response.data.doctor.bank_account_name || '',
        });
        setPreviews({
          profile_photo: response.data.doctor.profile_photo_url || null,
          signature: response.data.doctor.signature_url || null,
          letterhead: response.data.doctor.letterhead_url || null,
        });
      } catch (apiErr) {
        // If endpoint doesn't exist, use default empty data
        if (apiErr.response?.status === 404) {
          console.log('Profile endpoint not available, using default data');
          setDoctorData({
            full_name: 'Doctor Name',
            email: '',
            phone_number: '',
            mdcn_number: doctorId,
            hospital: '',
            specialty: 'Oncology',
            bank_name: '',
            bank_account_number: '',
            bank_account_name: '',
          });
        } else {
          throw apiErr;
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileSelect = (e, fileType) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles({ ...files, [fileType]: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [fileType]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (fileType) => {
    if (!files[fileType]) return;

    try {
      setUploadingFiles({ ...uploadingFiles, [fileType]: true });
      const formDataToSend = new FormData();
      formDataToSend.append('file', files[fileType]);
      formDataToSend.append('file_type', fileType);

      await api.post(`/api/doctors/${doctorId}/upload-file`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage({ type: 'success', text: `${fileType.replace(/_/g, ' ')} uploaded successfully!` });
      setFiles({ ...files, [fileType]: null });
      setTimeout(() => loadProfile(), 1000);
    } catch (err) {
      console.error('Error uploading file:', err);
      setMessage({ type: 'error', text: `Failed to upload ${fileType.replace(/_/g, ' ')}` });
    } finally {
      setUploadingFiles({ ...uploadingFiles, [fileType]: false });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/api/doctors/${doctorId}/profile`, formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
      setTimeout(() => loadProfile(), 1000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar currentPage="profile" onLogout={onLogout} />
        <div style={styles.loadingBox}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar currentPage="profile" onLogout={onLogout} />

      <div style={{ ...styles.mainContent, ...(isMobile && { padding: '20px 12px' }) }} className="responsive-padding-lg">
        {/* Header */}
        <div style={{ ...styles.header, ...(isMobile && { marginBottom: '24px' }) }}>
          <div>
            <h1 style={{ ...styles.title, ...(isMobile && { fontSize: '24px' }) }}>Doctor Profile</h1>
            <p style={styles.subtitle}>Manage your profile information and documents</p>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            style={{
              ...styles.messageBox,
              backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: message.type === 'success' ? COLORS.green : COLORS.red,
            }}
          >
            <span style={{ color: message.type === 'success' ? COLORS.green : COLORS.red }}>
              {message.type === 'success' ? '✓' : '⚠️'} {message.text}
            </span>
          </div>
        )}

        {/* Profile Header Card */}
        <div style={{ ...styles.profileCard, ...(isMobile && { padding: '16px' }) }}>
          <div style={{ ...styles.profileHeader, ...(isMobile && { flexDirection: 'column', alignItems: 'center', textAlign: 'center' }) }}>
            <div style={styles.profilePhotoSection}>
              {previews.profile_photo ? (
                <img src={previews.profile_photo} alt="Profile" style={styles.profilePhoto} />
              ) : (
                <div style={styles.profilePhotoPlaceholder}>
                  <span style={styles.profilePhotoIcon}>👤</span>
                </div>
              )}
            </div>
            <div style={{ ...styles.profileInfo, ...(isMobile && { marginTop: '16px' }) }}>
              <h2 style={styles.profileName}>{formData.full_name || 'Doctor Name'}</h2>
              <p style={styles.profileMdcn}>{formData.mdcn_number}</p>
              <p style={styles.profileSpecialty}>{formData.specialty}</p>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={{ ...styles.editButton, ...(isMobile && { width: '100%', marginTop: '12px' }) }}
                >
                  ✎ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {editing && (
          <form onSubmit={handleSaveProfile} style={{ ...styles.formCard, ...(isMobile && { padding: '16px' }) }}>
            <h2 style={styles.sectionTitle}>Edit Profile Information</h2>

            <div style={{ ...styles.formGrid, ...(isMobile && { gridTemplateColumns: '1fr', gap: '12px' }) }} data-grid="form2col">
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>MDCN Number</label>
                <input
                  type="text"
                  name="mdcn_number"
                  value={formData.mdcn_number}
                  onChange={handleInputChange}
                  style={styles.input}
                  disabled
                />
                <p style={styles.hint}>MDCN cannot be changed after registration</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Hospital/Clinic</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Specialty</label>
                <select name="specialty" value={formData.specialty} onChange={handleInputChange} style={styles.input}>
                  <option>Oncology</option>
                  <option>Medical Oncology</option>
                  <option>Surgical Oncology</option>
                  <option>Radiation Oncology</option>
                </select>
              </div>
            </div>

            <div style={styles.divider} />

            <h3 style={styles.sectionSubtitle}>Bank Account Details</h3>

            <div style={{ ...styles.formGrid, ...(isMobile && { gridTemplateColumns: '1fr', gap: '12px' }) }} data-grid="form2col">
              <div style={styles.formGroup}>
                <label style={styles.label}>Bank Name</label>
                <select name="bank_name" value={formData.bank_name} onChange={handleInputChange} style={styles.input}>
                  <option value="">Select bank</option>
                  <option>Access Bank</option>
                  <option>GTBank</option>
                  <option>First Bank</option>
                  <option>UBA</option>
                  <option>Zenith Bank</option>
                  <option>Standard Chartered</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Account Number</label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Account Holder Name</label>
                <input
                  type="text"
                  name="bank_account_name"
                  value={formData.bank_account_name}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formButtons}>
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{ ...styles.cancelButton, ...(isMobile && { flex: 1 }) }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ ...styles.saveButton, ...(isMobile && { flex: 1 }), opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Documents Section */}
        <div style={styles.documentsSection}>
          <h2 style={styles.sectionTitle}>Upload Documents</h2>
          <p style={styles.sectionDescription}>
            Upload your profile photo, signature, and letterhead to be used in your digital prescriptions
          </p>

          <div style={{ ...styles.documentsGrid, ...(isMobile && { gridTemplateColumns: '1fr', gap: '12px' }) }} data-grid="3col">
            {/* Profile Photo */}
            <div style={{ ...styles.documentCard, ...(isMobile && { padding: '16px' }) }}>
              <h3 style={styles.documentTitle}>Profile Photo</h3>
              <p style={styles.documentDescription}>JPG or PNG, max 5MB</p>

              <div style={styles.previewContainer}>
                {previews.profile_photo ? (
                  <img src={previews.profile_photo} alt="Profile" style={styles.documentPreview} />
                ) : (
                  <div style={styles.previewPlaceholder}>
                    <span style={styles.previewIcon}>📸</span>
                    <p>No photo uploaded</p>
                  </div>
                )}
              </div>

              <label style={styles.fileInputLabel}>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileSelect(e, 'profile_photo')}
                  style={{ display: 'none' }}
                />
                📁 Choose Photo
              </label>

              {files.profile_photo && (
                <button
                  onClick={() => uploadFile('profile_photo')}
                  disabled={uploadingFiles.profile_photo}
                  style={{ ...styles.uploadButton, ...(isMobile && { width: '100%' }), opacity: uploadingFiles.profile_photo ? 0.6 : 1 }}
                >
                  {uploadingFiles.profile_photo ? '⏳ Uploading...' : '⬆ Upload Photo'}
                </button>
              )}
            </div>

            {/* Signature */}
            <div style={{ ...styles.documentCard, ...(isMobile && { padding: '16px' }) }}>
              <h3 style={styles.documentTitle}>Signature</h3>
              <p style={styles.documentDescription}>JPG or PNG, max 2MB</p>

              <div style={styles.previewContainer}>
                {previews.signature ? (
                  <img src={previews.signature} alt="Signature" style={styles.documentPreview} />
                ) : (
                  <div style={styles.previewPlaceholder}>
                    <span style={styles.previewIcon}>✍️</span>
                    <p>No signature uploaded</p>
                  </div>
                )}
              </div>

              <label style={styles.fileInputLabel}>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileSelect(e, 'signature')}
                  style={{ display: 'none' }}
                />
                📁 Choose Signature
              </label>

              {files.signature && (
                <button
                  onClick={() => uploadFile('signature')}
                  disabled={uploadingFiles.signature}
                  style={{ ...styles.uploadButton, ...(isMobile && { width: '100%' }), opacity: uploadingFiles.signature ? 0.6 : 1 }}
                >
                  {uploadingFiles.signature ? '⏳ Uploading...' : '⬆ Upload Signature'}
                </button>
              )}
            </div>

            {/* Letterhead */}
            <div style={{ ...styles.documentCard, ...(isMobile && { padding: '16px' }) }}>
              <h3 style={styles.documentTitle}>Letterhead</h3>
              <p style={styles.documentDescription}>JPG, PNG or PDF, max 5MB</p>

              <div style={styles.previewContainer}>
                {previews.letterhead ? (
                  previews.letterhead.endsWith('.pdf') ? (
                    <div style={styles.pdfPreview}>
                      <span style={styles.previewIcon}>📄</span>
                      <p>PDF Uploaded</p>
                    </div>
                  ) : (
                    <img src={previews.letterhead} alt="Letterhead" style={styles.documentPreview} />
                  )
                ) : (
                  <div style={styles.previewPlaceholder}>
                    <span style={styles.previewIcon}>📋</span>
                    <p>No letterhead uploaded</p>
                  </div>
                )}
              </div>

              <label style={styles.fileInputLabel}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => handleFileSelect(e, 'letterhead')}
                  style={{ display: 'none' }}
                />
                📁 Choose Letterhead
              </label>

              {files.letterhead && (
                <button
                  onClick={() => uploadFile('letterhead')}
                  disabled={uploadingFiles.letterhead}
                  style={{ ...styles.uploadButton, ...(isMobile && { width: '100%' }), opacity: uploadingFiles.letterhead ? 0.6 : 1 }}
                >
                  {uploadingFiles.letterhead ? '⏳ Uploading...' : '⬆ Upload Letterhead'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>ℹ️</span>
          <div>
            <p style={styles.infoTitle}>Your Documents Are Secure</p>
            <p style={styles.infoText}>
              All your documents are encrypted and stored securely. They are only used to generate authentic digital prescriptions for your patients.
            </p>
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
  messageBox: {
    border: `1px solid`,
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  profilePhotoSection: {
    flex: '0 0 120px',
  },
  profilePhoto: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `3px solid ${COLORS.mint}`,
  },
  profilePhotoPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: COLORS.navy,
    border: `3px solid ${COLORS.teal}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoIcon: {
    fontSize: '48px',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 8px 0',
  },
  profileMdcn: {
    color: COLORS.mint,
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  profileSpecialty: {
    color: COLORS.muted,
    fontSize: '13px',
    margin: '0 0 12px 0',
  },
  editButton: {
    backgroundColor: COLORS.mint,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  formCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: COLORS.text,
    margin: '0 0 16px 0',
  },
  sectionSubtitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.mint,
    margin: '0 0 12px 0',
  },
  sectionDescription: {
    color: COLORS.muted,
    fontSize: '13px',
    margin: '0 0 20px 0',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: COLORS.mint,
    marginBottom: '6px',
  },
  input: {
    backgroundColor: COLORS.navy,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '6px',
    padding: '10px 12px',
    color: COLORS.text,
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    minHeight: '44px',
  },
  hint: {
    fontSize: '11px',
    color: COLORS.muted,
    margin: '4px 0 0 0',
  },
  divider: {
    height: '1px',
    backgroundColor: COLORS.teal,
    margin: '20px 0',
  },
  formButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  saveButton: {
    backgroundColor: COLORS.mint,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelButton: {
    backgroundColor: COLORS.teal,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  documentsSection: {
    marginBottom: '40px',
  },
  documentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  documentCard: {
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  documentTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: COLORS.text,
    margin: '0 0 4px 0',
  },
  documentDescription: {
    fontSize: '12px',
    color: COLORS.muted,
    margin: '0 0 16px 0',
  },
  previewContainer: {
    marginBottom: '12px',
    height: '150px',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.navy,
    border: `2px dashed ${COLORS.teal}`,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.muted,
    textAlign: 'center',
  },
  previewIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  pdfPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.navy,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.mint,
  },
  fileInputLabel: {
    backgroundColor: COLORS.navy,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    color: COLORS.text,
    transition: 'all 0.2s',
    marginBottom: '8px',
  },
  uploadButton: {
    backgroundColor: COLORS.green,
    color: COLORS.navy,
    border: 'none',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  infoBox: {
    backgroundColor: `rgba(11, 143, 143, 0.1)`,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    gap: '12px',
  },
  infoIcon: {
    fontSize: '20px',
    flex: '0 0 20px',
  },
  infoTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: COLORS.mint,
    margin: '0 0 4px 0',
  },
  infoText: {
    fontSize: '12px',
    color: COLORS.muted,
    margin: 0,
    lineHeight: '1.5',
  },
  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: COLORS.mint,
    fontSize: '16px',
  },
};
