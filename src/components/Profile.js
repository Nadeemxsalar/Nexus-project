import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import './Profile.css'; // Naya import yahan lagao

function Profile() {
  const navigate = useNavigate();
  
  // -- States --
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false); 

  const [displayedRole, setDisplayedRole] = useState('');

  // Default data ekdum original HTML jaisa
  const [userData, setUserData] = useState({
    name: 'Nadeem',
    role: 'BCA Scholar | Developer',
    bio: 'Passionate developer working on modern web ecosystems. Ranked 1st in academics and building scalable tech solutions.',
    github: '#',
    linkedin: '#',
    dpUrl: 'https://ui-avatars.com/api/?name=Nadeem&background=4318FF&color=fff&size=150',
    coverUrl: ''
  });

  const [formData, setFormData] = useState({ ...userData });

  // 1. Fetch Firebase Data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsUpdating(true);
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const mergedData = { ...userData, ...data };
          setUserData(mergedData);
          setFormData(mergedData);
        }
        setIsUpdating(false);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Theme Handling
  useEffect(() => {
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. Typewriter Effect (Original logic)
  useEffect(() => {
    if (activeTab === 'dashboard') {
      let i = 0;
      const text = userData.role || 'BCA Scholar | Developer';
      setDisplayedRole('');
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedRole((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [userData.role, activeTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Image Upload Logic
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadstart = () => setIsUpdating(true);
    
    reader.onloadend = async () => {
      const base64String = reader.result;
      const fieldName = type === 'dp' ? 'dpUrl' : 'coverUrl';
      
      try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          [fieldName]: base64String
        });
        setUserData(prev => ({ ...prev, [fieldName]: base64String }));
        showToast(`✅ ${type === 'dp' ? 'Profile Picture' : 'Cover Photo'} updated!`);
      } catch (err) {
        showToast("❌ Error uploading image");
      } finally {
        setIsUpdating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Settings
  const saveProfileData = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), formData);
      setUserData(formData);
      setTimeout(() => {
        setIsUpdating(false);
        showToast("Profile Updated Successfully! 🎉");
        setActiveTab('dashboard'); 
      }, 800);
    } catch (error) {
      setIsUpdating(false);
      showToast("Error updating profile: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Project Search & Filter Logic
  const isProjectVisible = (type, title) => {
    const matchFilter = projectFilter === 'all' || projectFilter === type;
    const matchSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  };

  return (
    <>
      {/* GLOBAL PROGRESS BAR */}
      {isUpdating && (
        <div className="global-progress-container">
          <div className="global-progress-bar"></div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div id="toast" className={toastMessage ? 'show' : ''}>{toastMessage}</div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`} id="sidebar">
        <div className="brand">PRO<span>FILE</span></div>
        <ul className="nav-links">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}><i className="fas fa-home"></i> Overview</li>
          <li className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => { setActiveTab('projects'); setSidebarOpen(false); }}><i className="fas fa-laptop-code"></i> Projects</li>
          <li className={`nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => { setActiveTab('content'); setSidebarOpen(false); }}><i className="fas fa-video"></i> Content</li>
          <li className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => { setActiveTab('contact'); setSidebarOpen(false); }}><i className="fas fa-envelope"></i> Contact</li>
          <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}><i className="fas fa-cog"></i> Settings</li>
          <li className="nav-item" onClick={handleLogout} style={{color: '#ff4757', marginTop: 'auto'}}><i className="fas fa-sign-out-alt"></i> Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        {/* HEADER */}
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <i className="fas fa-bars menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}></i>
            <h2 id="pageTitle" style={{textTransform: 'capitalize'}}>{activeTab === 'dashboard' ? 'Overview' : activeTab}</h2>
          </div>
          
          <div className="header-actions">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if(e.target.value && activeTab !== 'projects') setActiveTab('projects');
                }}
              />
            </div>
            <button className="icon-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); showToast("🔗 Profile link copied to clipboard!"); }} title="Share Profile"><i className="fas fa-share-alt"></i></button>
            <button className="icon-btn" onClick={() => window.print()} title="Download Resume"><i className="fas fa-file-pdf"></i></button>
            <button className="icon-btn theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><i className={theme === 'dark' ? "fas fa-sun" : "fas fa-moon"} id="themeIcon"></i></button>
          </div>
        </header>

        {/* 1. OVERVIEW (DASHBOARD) SECTION */}
        <section id="dashboard" className={`section-tab ${activeTab === 'dashboard' ? 'active' : ''}`}>
          <div className="profile-header">
            <div className="cover-photo" style={{ background: userData.coverUrl ? `url(${userData.coverUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #4318FF, #868CFF)' }}>
              <input type="file" id="coverUpload" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'cover')} />
              <button className="upload-cover-btn" onClick={() => document.getElementById('coverUpload').click()} disabled={isUpdating}>
                <i className="fas fa-camera"></i> Edit Cover
              </button>
            </div>
            <div className="profile-info">
              <div className="dp-container">
                <img src={userData.dpUrl} alt="DP" style={{ opacity: isUpdating ? 0.5 : 1 }} />
                <input type="file" id="dpUpload" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'dp')} />
                <label htmlFor="dpUpload" className="upload-dp-btn" style={{ pointerEvents: isUpdating ? 'none' : 'auto' }}><i className="fas fa-pen"></i></label>
              </div>
              <h1 className="user-name">{userData.name}</h1>
              <p className="user-role">{displayedRole}</p> 
              <div className="social-links">
                <a href={userData.github} target="_blank" rel="noreferrer"><i className="fab fa-github"></i></a>
                <a href={userData.linkedin} target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
          </div>

          <div className="grid-container">
            {/* About Me Card */}
            <div className="card">
              <h3><i className="fas fa-info-circle"></i> About Me</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{userData.bio}</p>
            </div>
            
            {/* Experience & Education Card */}
            <div className="card">
              <h3><i className="fas fa-history"></i> Experience & Education</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <span className="timeline-date">2023 - Present</span>
                  <h4>Lead Developer @ NEXUS</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Building the ultimate productivity ecosystem.</p>
                </div>
                <div className="timeline-item">
                  <span className="timeline-date">2021 - Present</span>
                  <h4>BCA Scholar</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ranked #1. Focusing on Advanced Computer Science.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Skills Card */}
          <div className="card" style={{ marginBottom: '25px' }}>
            <h3><i className="fas fa-code"></i> Technical Skills</h3>
            <div className="grid-container" style={{ marginBottom: 0 }}>
              <div>
                <div className="skill-item">
                  <div className="skill-info"><span>JavaScript / React</span> <span>90%</span></div>
                  <div className="skill-bar"><div className="skill-progress" style={{ width: '90%' }}></div></div>
                </div>
                <div className="skill-item">
                  <div className="skill-info"><span>HTML & CSS</span> <span>95%</span></div>
                  <div className="skill-bar"><div className="skill-progress" style={{ width: '95%' }}></div></div>
                </div>
              </div>
              <div>
                <div className="skill-item">
                  <div className="skill-info"><span>Node.js / Backend</span> <span>80%</span></div>
                  <div className="skill-bar"><div className="skill-progress" style={{ width: '80%' }}></div></div>
                </div>
                <div className="skill-item">
                  <div className="skill-info"><span>UI/UX Design</span> <span>75%</span></div>
                  <div className="skill-bar"><div className="skill-progress" style={{ width: '75%' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROJECTS SECTION */}
        <section id="projects" className={`section-tab ${activeTab === 'projects' ? 'active' : ''}`}>
          <div className="filter-container">
            <button className={`filter-btn ${projectFilter === 'all' ? 'active' : ''}`} onClick={() => setProjectFilter('all')}>All</button>
            <button className={`filter-btn ${projectFilter === 'frontend' ? 'active' : ''}`} onClick={() => setProjectFilter('frontend')}>Frontend</button>
            <button className={`filter-btn ${projectFilter === 'backend' ? 'active' : ''}`} onClick={() => setProjectFilter('backend')}>Backend / System</button>
          </div>

          <div className="grid-container" id="projectsContainer">
            {/* NEXUS Project */}
            {isProjectVisible('frontend', 'Project: NEXUS') && (
              <div className="card project-card">
                <h3>Project: NEXUS</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>A massive multi-utility web ecosystem designed for ultimate productivity.</p>
                <span className="tag">HTML5</span> <span className="tag">CSS3</span> <span className="tag">JavaScript</span>
              </div>
            )}
            
            {/* CG Engine Project */}
            {isProjectVisible('backend', 'Computer Graphics Engine') && (
              <div className="card project-card">
                <h3>Computer Graphics Engine</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Interactive rendering algorithms and 3D visual plotting application.</p>
                <span className="tag">C++</span> <span className="tag">OpenGL</span>
              </div>
            )}

            {/* Portfolio Project */}
            {isProjectVisible('frontend', 'Portfolio Dashboard') && (
              <div className="card project-card">
                <h3>Portfolio Dashboard</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Advanced dynamic UI for showcasing skills and managing profile configurations.</p>
                <span className="tag">Vanilla JS</span> <span className="tag">CSS Variables</span>
              </div>
            )}
          </div>
        </section>

        {/* 3. CONTENT SECTION */}
        <section id="content" className={`section-tab ${activeTab === 'content' ? 'active' : ''}`}>
          <div className="grid-container">
            <div className="card" style={{ borderLeft: '5px solid red' }}>
              <h3><i className="fab fa-youtube" style={{ color: 'red' }}></i> Nadeem Fact Star</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Exploring amazing facts and sharing knowledge with the world.</p>
            </div>
            <div className="card" style={{ borderLeft: '5px solid #00f2fe' }}>
              <h3><i className="fab fa-youtube" style={{ color: '#00f2fe' }}></i> Tech with Nadeem</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Tech tutorials, coding guides, and software reviews.</p>
            </div>
          </div>
        </section>

        {/* 4. CONTACT SECTION */}
        <section id="contact" className={`section-tab ${activeTab === 'contact' ? 'active' : ''}`}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3><i className="fas fa-paper-plane"></i> Get in Touch</h3>
            <form onSubmit={(e) => { e.preventDefault(); showToast("✅ Message sent successfully!"); e.target.reset(); }}>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Your Email</label>
                <input type="email" required placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="4" required placeholder="How can I help you?"></textarea>
              </div>
              <button type="submit" className="btn-save">Send Message</button>
            </form>
          </div>
        </section>

        {/* 5. SETTINGS SECTION */}
        <section id="settings" className={`section-tab ${activeTab === 'settings' ? 'active' : ''}`}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3><i className="fas fa-user-edit"></i> Edit Profile Info</h3>
            
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" id="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Enter your name" disabled={isUpdating} />
            </div>
            <div className="form-group">
              <label>Current Role / Tagline</label>
              <input type="text" id="role" value={formData.role || ''} onChange={handleInputChange} placeholder="e.g. Lead Developer" disabled={isUpdating} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea id="bio" rows="3" value={formData.bio || ''} onChange={handleInputChange} placeholder="Write something about yourself..." disabled={isUpdating}></textarea>
            </div>
            
            <h3 style={{ marginTop: '30px' }}><i className="fas fa-link"></i> Social Links</h3>
            <div className="form-group">
              <label>GitHub URL</label>
              <input type="url" id="github" value={formData.github || ''} onChange={handleInputChange} placeholder="https://github.com/yourusername" disabled={isUpdating} />
            </div>
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input type="url" id="linkedin" value={formData.linkedin || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/yourusername" disabled={isUpdating} />
            </div>

            <button 
              className={`btn-save ${isUpdating ? 'loading' : ''}`} 
              onClick={saveProfileData} 
              disabled={isUpdating}
            >
              {isUpdating ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : 'Save All Changes'}
            </button>
          </div>
        </section>

      </main>
    </>
  );
}

export default Profile;