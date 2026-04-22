import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore'; 
import styles from './AdminPanel.module.css';

const ADMIN_EMAILS = ["nadeemrealhero@gmail.com", "nadeemxsalar@gmail.com"]; 

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [realUsers, setRealUsers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // CRUD & Search States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [searchQuery, setSearchQuery] = useState(''); // 🔍 Naya state search ke liye

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (!ADMIN_EMAILS.includes(currentUser.email)) {
           alert("🚨 ACCESS DENIED: Aapke paas Admin rights nahi hain!");
           navigate('/'); 
        }
      } else {
        setUser(null);
        navigate('/login'); 
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email)) fetchRealData();
  }, [user]);

  const fetchRealData = async () => {
    setIsLoadingData(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const fetchedUsers = [];
      usersSnap.forEach((doc) => fetchedUsers.push({ id: doc.id, ...doc.data() }));
      setRealUsers(fetchedUsers);
    } catch (error) { console.error("Firebase Error:", error); }
    setIsLoadingData(false);
  };

  // --- CRUD OPERATIONS ---
  const handleOpenModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditMode(true);
      setSelectedUserId(userToEdit.id);
      setFormData({ name: userToEdit.name || userToEdit.displayName || '', email: userToEdit.email });
    } else {
      setEditMode(false);
      setFormData({ name: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const userRef = doc(db, "users", selectedUserId);
        await updateDoc(userRef, formData);
        alert("✅ User data updated successfully!");
      } else {
        await addDoc(collection(db, "users"), formData);
        alert("✅ New user added to NEXUS database!");
      }
      setIsModalOpen(false);
      fetchRealData(); 
    } catch (error) {
      alert("❌ Error: Operation failed.");
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`⚠️ WARNING: User "${userName || 'Unknown'}" ko permanently delete karein?`)) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setRealUsers(realUsers.filter(u => u.id !== userId));
        alert(`✅ User deleted!`);
      } catch (error) { alert("❌ Error deleting user."); }
    }
  };

  if (loadingAuth) return <div className={styles.loadingScreen}>NEXUS SECURE CHECK...</div>;
  if (!user || !ADMIN_EMAILS.includes(user.email)) return null; 

  const handleTabChange = (tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); };
  
  const getGreeting = () => {
    const hr = currentTime.getHours();
    return hr < 12 ? 'Good Morning' : hr < 18 ? 'Good Afternoon' : 'Good Evening';
  };

  const renderComingSoon = (title, desc) => (
    <div className={styles.statCard} style={{ textAlign: 'center', padding: '50px' }}>
      <h2 style={{ color: '#fff', fontFamily: 'Orbitron', textShadow: '0 0 15px #00f2fe' }}>{title}</h2>
      <p style={{ color: '#aaa', fontSize: '1.2rem', marginTop: '20px' }}>{desc}</p>
    </div>
  );

  // 🔍 Real-time Filter Logic
  const filteredUsers = realUsers.filter(usr => 
    (usr.name || usr.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (usr.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.adminContainer}>
      <div className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.overlayActive : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* ================= PRO SIDEBAR ================= */}
      <div className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>NEXUS</div>
        
        <div className={styles.sidebarCategory}>CORE</div>
        <div className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`} onClick={() => handleTabChange('dashboard')}>📊 Dashboard</div>
        <div className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`} onClick={() => handleTabChange('analytics')}>📈 Analytics & Reports</div>

        <div className={styles.sidebarCategory}>MANAGEMENT</div>
        <div className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`} onClick={() => handleTabChange('users')}>👥 Users Database</div>
        <div className={`${styles.navItem} ${activeTab === 'roles' ? styles.active : ''}`} onClick={() => handleTabChange('roles')}>🔐 Role-Based Access</div>
        <div className={`${styles.navItem} ${activeTab === 'support' ? styles.active : ''}`} onClick={() => handleTabChange('support')}>🎧 Help & Support</div>

        <div className={styles.sidebarCategory}>MODULES</div>
        <div className={`${styles.navItem} ${activeTab === 'shopping' ? styles.active : ''}`} onClick={() => handleTabChange('shopping')}>🛒 Shop Control</div>
        <div className={`${styles.navItem} ${activeTab === 'restaurant' ? styles.active : ''}`} onClick={() => handleTabChange('restaurant')}>🍝 Restaurant Mgmt</div>
        <div className={`${styles.navItem} ${activeTab === 'cms' ? styles.active : ''}`} onClick={() => handleTabChange('cms')}>📝 Content Mgmt (CMS)</div>

        <div className={styles.sidebarCategory}>SYSTEM</div>
        <div className={`${styles.navItem} ${activeTab === 'finance' ? styles.active : ''}`} onClick={() => handleTabChange('finance')}>💸 Finance & Revenue</div>
        <div className={`${styles.navItem} ${activeTab === 'broadcast' ? styles.active : ''}`} onClick={() => handleTabChange('broadcast')}>📢 Broadcast Center</div>
        <div className={`${styles.navItem} ${activeTab === 'audit' ? styles.active : ''}`} onClick={() => handleTabChange('audit')}>🕵️ Audit Logs</div>
        <div className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => handleTabChange('settings')}>⚙️ Master Settings</div>
        
        <Link to="/" className={styles.navItem} style={{ marginTop: '20px', borderTop: '1px solid rgba(0, 242, 254, 0.2)' }}>⬅️ Exit to Website</Link>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.menuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</div>
          <div className={styles.headerTitle}>
            <h1>COMMAND CENTER</h1>
            <div className={styles.timeClock}>{getGreeting()}, Admin • {currentTime.toLocaleTimeString()}</div>
          </div>
          <div className={styles.adminProfile}>🟢 Master Admin</div>
        </div>

        <div className={styles.dashboardArea}>
          
          {activeTab === 'dashboard' && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Registered Users</h3><p style={{ color: '#00f2fe' }}>{isLoadingData ? "..." : realUsers.length}</p>
                <div className={styles.progressContainer}><div className={styles.progressBar} style={{ width: '100%' }}></div></div>
              </div>
              <div className={styles.statCard}>
                <h3>Daily Active Users</h3><p style={{ color: '#0f0', textShadow: '0 0 10px #0f0' }}>24</p>
                <div className={styles.progressContainer}><div className={styles.progressBar} style={{ width: '15%', background: '#0f0' }}></div></div>
              </div>
              <div className={styles.statCard}>
                <h3>Total Revenue (INR)</h3><p style={{ color: '#f0f', textShadow: '0 0 10px #f0f' }}>₹ 1,24,500</p>
                <div className={styles.progressContainer}><div className={styles.progressBar} style={{ width: '70%', background: '#f0f' }}></div></div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h2>REAL-TIME USER DATABASE</h2>
                
                {/* 🔍 Search Bar & Buttons */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="Search by name or email..." 
                      className={styles.cyberInput} 
                      style={{ width: '250px', marginBottom: '0', padding: '10px' }} 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className={styles.actionBtn} onClick={() => handleOpenModal()}>➕ Add User</button>
                    <button className={styles.actionBtn} onClick={fetchRealData}>🔄 Sync Data</button>
                </div>
              </div>
              
              <table className={styles.glassTable}>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((usr) => (
                      <tr key={usr.id}>
                        <td style={{ color: '#777' }}>{usr.id}</td>
                        <td>{usr.name || usr.displayName || 'N/A'}</td>
                        <td>{usr.email}</td>
                        {/* 🛠️ Fix: Buttons Chipakna using display: flex aur gap */}
                        <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button className={styles.actionBtn} style={{ margin: 0 }} onClick={() => handleOpenModal(usr)}>Edit</button>
                          <button className={`${styles.actionBtn} ${styles.dangerBtn}`} style={{ margin: 0 }} onClick={() => handleDeleteUser(usr.id, usr.name)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#f0f', padding: '20px' }}>
                         Bhai, is naam ya email se koi user nahi mila! 🚀
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ======== ORIGINAL FEATURES UI EXAMPLES ======== */}
          
          {activeTab === 'broadcast' && (
            <div className={styles.tableContainer}>
              <h2 style={{ fontFamily: 'Orbitron', color: '#fff', marginBottom: '20px' }}>📢 SEND PUSH NOTIFICATION</h2>
              <input type="text" placeholder="Notification Title..." className={styles.cyberInput} />
              <textarea placeholder="Write your message to all 1,248 users..." className={styles.cyberInput} style={{ height: '150px' }}></textarea>
              <button className={styles.actionBtn} style={{ padding: '15px 30px', fontSize: '1.2rem', background: '#00f2fe', color: '#000' }}>🚀 SEND BROADCAST</button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={styles.tableContainer}>
              <h2 style={{ fontFamily: 'Orbitron', color: '#fff', marginBottom: '20px' }}>⚙️ SYSTEM SETTINGS</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.2rem' }}>Maintenance Mode:</span>
                <button className={`${styles.actionBtn} ${styles.dangerBtn}`}>TURN ON (Lock Website)</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '1.2rem' }}>Clear Cache & Temp Files:</span>
                <button className={styles.actionBtn}>PURGE CACHE</button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && renderComingSoon('📈 ADVANCED ANALYTICS', 'Graphical charts aur live traffic monitoring system load ho raha hai.')}
          {activeTab === 'roles' && renderComingSoon('🔐 ROLE-BASED ACCESS', 'Managers aur Delivery staff ke sub-accounts banayein aur unki power limit karein.')}
          {activeTab === 'support' && renderComingSoon('🎧 TICKETING INBOX', 'Users ki problems yahan display hongi. Chat module connect karna baaki hai.')}
          {activeTab === 'cms' && renderComingSoon('📝 CONTENT MANAGER', 'Home page ke banners aur text ko yahan se real-time change karein.')}
          {activeTab === 'finance' && renderComingSoon('💸 FINANCE DASHBOARD', 'Stripe/Razorpay APIs connect karke payment track karein.')}
          {activeTab === 'audit' && renderComingSoon('🕵️ AUDIT LOGS', 'Sabhi admins aur sub-admins ki activities ki real-time tracking.')}
          {['shopping', 'restaurant'].includes(activeTab) && renderComingSoon(`${activeTab.toUpperCase()} CONTROLS`, 'Store items aur Menu databases sync kiye ja rahe hain.')}

        </div>
      </div>

      {/* ================= MODAL FORM FOR CREATE/UPDATE ================= */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>{editMode ? "EDIT USER" : "ADD NEW USER"}</h2>
            <form onSubmit={handleSaveUser}>
              <label>Full Name</label>
              <input 
                type="text" 
                className={styles.cyberInput} 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
              <label>Email Address</label>
              <input 
                type="email" 
                className={styles.cyberInput} 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className={styles.actionBtn} style={{ flex: 1, background: '#00f2fe', color: '#000' }}>
                    {editMode ? "UPDATE" : "CREATE"}
                </button>
                <button type="button" className={`${styles.actionBtn} ${styles.dangerBtn}`} style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                    CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;