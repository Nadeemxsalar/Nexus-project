import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
// Firebase se collection aur addDoc import kiya messages database mein save karne ke liye
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import './Profile.css';

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

  // Contact Form States
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  // 🌟 DEFAULT DATA (Fully Editable)
  const defaultData = {
    name: 'Nadeem',
    role: 'BCA Scholar | Developer',
    bio: 'Passionate developer working on modern web ecosystems. Ranked 1st in academics and building scalable tech solutions.',
    github: '#',
    linkedin: '#',
    dpUrl: 'https://ui-avatars.com/api/?name=Nadeem&background=4318FF&color=fff&size=150',
    coverUrl: '',
    skills: [
      { id: 1, name: 'JavaScript / React', percent: '90' },
      { id: 2, name: 'HTML & CSS', percent: '95' },
      { id: 3, name: 'Node.js / Backend', percent: '80' },
      { id: 4, name: 'UI/UX Design', percent: '75' }
    ],
    projects: [
      { id: 1, title: 'Project: NEXUS', desc: 'A massive multi-utility web ecosystem designed for ultimate productivity.', type: 'frontend', tags: 'HTML5, CSS3, JavaScript' },
      { id: 2, title: 'Computer Graphics Engine', desc: 'Interactive rendering algorithms and 3D visual plotting application.', type: 'backend', tags: 'C++, OpenGL' },
      { id: 3, title: 'Portfolio Dashboard', desc: 'Advanced dynamic UI for showcasing skills and managing profile configurations.', type: 'frontend', tags: 'Vanilla JS, CSS Variables' }
    ],
    contents: [
      { id: 1, title: 'Nadeem Fact Star', desc: 'Exploring amazing facts and sharing knowledge with the world.', color: '#ff4757' },
      { id: 2, title: 'Tech with Nadeem', desc: 'Tech tutorials, coding guides, and software reviews.', color: '#00f2fe' }
    ]
  };

  const [userData, setUserData] = useState(defaultData);
  const [formData, setFormData] = useState(defaultData);

  // 1. Fetch Firebase Data 
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsUpdating(true);
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            const merged = { 
              ...defaultData, 
              ...data,
              skills: data.skills && data.skills.length > 0 ? data.skills : defaultData.skills,
              projects: data.projects && data.projects.length > 0 ? data.projects : defaultData.projects,
              contents: data.contents && data.contents.length > 0 ? data.contents : defaultData.contents,
            };
            setUserData(merged);
            setFormData(merged);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsUpdating(false);
        }
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

  // 3. Typewriter Effect
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

  // Save Settings to Database
  const saveProfileData = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), formData);
      setUserData(formData);
      setTimeout(() => {
        setIsUpdating(false);
        showToast("Database Updated Successfully! 🎉");
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

  // 🌟 REACT IMMUTABLE ARRAY HANDLERS (CMS LOGIC)
  const handleArrayChange = (index, field, value, arrayName) => {
    setFormData(prev => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => {
      const currentArray = prev[arrayName] || [];
      return { 
        ...prev, 
        [arrayName]: [...currentArray, { id: Date.now() + Math.random(), ...defaultItem }] 
      };
    });
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => {
      const newArray = [...(prev[arrayName] || [])];
      newArray.splice(index, 1);
      return { ...prev, [arrayName]: newArray };
    });
  };

  // 🌟 HANDLE CONTACT FORM SUBMISSION (Database + Web3Forms Email)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      showToast("❌ Please fill all fields.");
      return;
    }

    setIsSending(true);
    try {
      // 1. Firebase Database mein Save Karna
      await addDoc(collection(db, "messages"), {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        timestamp: new Date(),
        userId: auth.currentUser ? auth.currentUser.uid : 'Guest'
      });

      // 2. Nadeem ko Email Notification Bhejna (Web3Forms ke zariye)
      const emailData = new FormData();
      // YAHAN AAPKI WEB3FORMS ACCESS KEY DAALI HAI 👇
      emailData.append("access_key", "733da440-6246-4a96-a26b-e29e437c158e"); 
      emailData.append("subject", "NEXUS Portfolio: New Contact Message!");
      emailData.append("from_name", "NEXUS Portfolio Notification");
      emailData.append("name", contactForm.name);
      emailData.append("email", contactForm.email);
      emailData.append("message", contactForm.message);

      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: emailData
      });
      
      showToast("✅ Message sent successfully!");
      setContactForm({ name: '', email: '', message: '' }); // Form clear
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("❌ Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const isProjectVisible = (type, title) => {
    const matchFilter = projectFilter === 'all' || projectFilter === type;
    const matchSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  };

  return (
    <>
      {isUpdating && (
        <div className="global-progress-container">
          <div className="global-progress-bar"></div>
        </div>
      )}

      <div id="toast" className={toastMessage ? 'show' : ''}>{toastMessage}</div>

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

        {/* 1. OVERVIEW SECTION */}
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
            <div className="card">
              <h3><i className="fas fa-info-circle"></i> About Me</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{userData.bio}</p>
            </div>
            
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

          <div className="card" style={{ marginBottom: '25px' }}>
            <h3><i className="fas fa-code"></i> Technical Skills</h3>
            <div className="skills-grid">
              {(userData.skills || []).map((skill) => (
                <div className="skill-item" key={skill.id}>
                  <div className="skill-info"><span>{skill.name}</span> <span>{skill.percent}%</span></div>
                  <div className="skill-bar"><div className="skill-progress" style={{ width: `${skill.percent}%` }}></div></div>
                </div>
              ))}
              {userData.skills?.length === 0 && <p style={{color:'var(--text-secondary)'}}>No skills added yet.</p>}
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
            {(userData.projects || []).filter(p => isProjectVisible(p.type, p.title)).map(project => (
              <div className="card project-card" key={project.id}>
                <h3>{project.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>{project.desc}</p>
                {(project.tags || '').split(',').map((tag, idx) => (
                  <span className="tag" key={idx}>{tag.trim()}</span>
                ))}
              </div>
            ))}
            {userData.projects?.length === 0 && <p style={{color:'var(--text-secondary)', width: '100%'}}>No projects added yet.</p>}
          </div>
        </section>

        {/* 3. CONTENT SECTION */}
        <section id="content" className={`section-tab ${activeTab === 'content' ? 'active' : ''}`}>
          <div className="grid-container">
            {(userData.contents || []).map(item => (
              <div className="card" style={{ borderLeft: `5px solid ${item.color}` }} key={item.id}>
                <h3><i className="fab fa-youtube" style={{ color: item.color }}></i> {item.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
             {userData.contents?.length === 0 && <p style={{color:'var(--text-secondary)'}}>No content channels added yet.</p>}
          </div>
        </section>

        {/* 4. REAL CONTACT SECTION */}
        <section id="contact" className={`section-tab ${activeTab === 'contact' ? 'active' : ''}`}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3><i className="fas fa-paper-plane"></i> Get in Touch</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter Your Name " 
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  disabled={isSending}
                />
              </div>
              <div className="form-group">
                <label>Your Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="Enter Your Email" 
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  disabled={isSending}
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  rows="4" 
                  required 
                  placeholder="How can I help you?"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  disabled={isSending}
                ></textarea>
              </div>
              <button type="submit" className={`btn-save ${isSending ? 'loading' : ''}`} disabled={isSending}>
                {isSending ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : 'Send Message'}
              </button>
            </form>
          </div>
        </section>

        {/* 5. SETTINGS SECTION */}
        <section id="settings" className={`section-tab ${activeTab === 'settings' ? 'active' : ''}`}>
          <div className="card" style={{ maxWidth: '750px', margin: '0 auto' }}>
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
            
            <div className="form-group" style={{display: 'flex', gap: '15px'}}>
              <div style={{flex: 1}}>
                <label>GitHub URL</label>
                <input type="url" id="github" value={formData.github || ''} onChange={handleInputChange} placeholder="https://github.com/..." disabled={isUpdating} />
              </div>
              <div style={{flex: 1}}>
                <label>LinkedIn URL</label>
                <input type="url" id="linkedin" value={formData.linkedin || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." disabled={isUpdating} />
              </div>
            </div>

            <hr style={{ margin: '30px 0', borderColor: 'var(--border-color)' }} />

            {/* EDITABLE SKILLS */}
            <h3><i className="fas fa-code"></i> Manage Skills</h3>
            {(formData.skills || []).map((skill, index) => (
              <div key={skill.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="Skill Name" value={skill.name} onChange={(e) => handleArrayChange(index, 'name', e.target.value, 'skills')} style={{ flex: 2, padding: '10px', borderRadius: '5px' }} />
                <input type="number" placeholder="%" value={skill.percent} onChange={(e) => handleArrayChange(index, 'percent', e.target.value, 'skills')} style={{ flex: 1, padding: '10px', borderRadius: '5px' }} />
                <button type="button" className="icon-btn" onClick={() => removeArrayItem('skills', index)} style={{ color: '#ff4757', background: 'transparent' }} title="Delete Skill"><i className="fas fa-trash"></i></button>
              </div>
            ))}
            <button type="button" className="upload-cover-btn" onClick={() => addArrayItem('skills', { name: 'New Skill', percent: '50' })} style={{ display: 'inline-block', marginBottom: '30px', marginTop: '10px' }}>+ Add New Skill</button>

            {/* EDITABLE PROJECTS */}
            <h3><i className="fas fa-laptop-code"></i> Manage Projects</h3>
            {(formData.projects || []).map((project, index) => (
              <div key={project.id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '10px', marginBottom: '15px', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <input type="text" placeholder="Project Title" value={project.title} onChange={(e) => handleArrayChange(index, 'title', e.target.value, 'projects')} style={{ flex: 1, marginRight: '10px', padding: '10px', borderRadius: '5px' }} />
                  <button type="button" className="icon-btn" onClick={() => removeArrayItem('projects', index)} style={{ color: '#ff4757', background: 'white', padding: '10px', borderRadius: '5px' }} title="Delete Project"><i className="fas fa-trash"></i></button>
                </div>
                <textarea placeholder="Description" value={project.desc} onChange={(e) => handleArrayChange(index, 'desc', e.target.value, 'projects')} rows="2" style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px', width: '100%' }}></textarea>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select value={project.type} onChange={(e) => handleArrayChange(index, 'type', e.target.value, 'projects')} style={{ padding: '10px', borderRadius: '5px', flex: 1 }}>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend / System</option>
                  </select>
                  <input type="text" placeholder="Tags (comma separated)" value={project.tags} onChange={(e) => handleArrayChange(index, 'tags', e.target.value, 'projects')} style={{ flex: 2, padding: '10px', borderRadius: '5px' }} />
                </div>
              </div>
            ))}
            <button type="button" className="upload-cover-btn" onClick={() => addArrayItem('projects', { title: '', desc: '', type: 'frontend', tags: '' })} style={{ display: 'inline-block', marginBottom: '30px' }}>+ Add New Project</button>

            {/* EDITABLE CONTENT */}
            <h3><i className="fas fa-video"></i> Manage YouTube / Content</h3>
            {(formData.contents || []).map((content, index) => (
              <div key={content.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input type="text" placeholder="Channel Title" value={content.title} onChange={(e) => handleArrayChange(index, 'title', e.target.value, 'contents')} style={{ flex: 1, padding: '10px', borderRadius: '5px' }} />
                <input type="text" placeholder="Description" value={content.desc} onChange={(e) => handleArrayChange(index, 'desc', e.target.value, 'contents')} style={{ flex: 2, padding: '10px', borderRadius: '5px' }} />
                <input type="color" value={content.color} onChange={(e) => handleArrayChange(index, 'color', e.target.value, 'contents')} style={{ width: '45px', height: '45px', padding: '0', border: 'none', borderRadius: '5px', cursor: 'pointer' }} title="Brand Color" />
                <button type="button" className="icon-btn" onClick={() => removeArrayItem('contents', index)} style={{ color: '#ff4757', background: 'transparent' }} title="Delete Content"><i className="fas fa-trash"></i></button>
              </div>
            ))}
            <button type="button" className="upload-cover-btn" onClick={() => addArrayItem('contents', { title: '', desc: '', color: '#4318FF' })} style={{ display: 'inline-block', marginBottom: '30px', marginTop: '10px' }}>+ Add New Channel</button>

            <button 
              type="button"
              className={`btn-save ${isUpdating ? 'loading' : ''}`} 
              onClick={saveProfileData} 
              disabled={isUpdating}
              style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}
            >
              {isUpdating ? <><i className="fas fa-spinner fa-spin"></i> Saving to Database...</> : 'Save All Updates 🚀'}
            </button>
          </div>
        </section>

      </main>
    </>
  );
}

export default Profile;