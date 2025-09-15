import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const targetRoleSuggestions = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'UI/UX Designer', 'Mobile Developer', 'QA Engineer', 'AI Engineer', 'Cloud Architect', 'Business Analyst', 'Cybersecurity Specialist', 'ML Engineer', 'Project Manager', 'Other',
];
const skillsList = [
  'Python', 'JavaScript', 'HTML', 'CSS', 'SQL', 'Java', 'C++', 'React', 'Node.js', 'Django', 'Flask', 'Angular', 'Vue', 'TypeScript', 'Swift', 'Kotlin', 'Go', 'Ruby', 'PHP', 'R', 'C#', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Figma', 'Photoshop', 'Illustrator', 'Other',
];

export default function Form1Page() {
  const [form, setForm] = useState({
    name: '',
    education: '',
    role: '',
    skills: [],
    skillInput: '',
    targetRole: '',
    shortGoal: '',
    longGoal: '',
    resume: null,
  });
  const [filteredRoles, setFilteredRoles] = useState(targetRoleSuggestions);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
    if (name === 'targetRole') {
      setFilteredRoles(targetRoleSuggestions.filter(r => r.toLowerCase().includes(value.toLowerCase())));
    }
  };
  const handleSkillInput = e => {
    setForm(f => ({ ...f, skillInput: e.target.value }));
  };
  const handleAddSkill = skill => {
    if (skill && !form.skills.includes(skill)) {
      setForm(f => ({ ...f, skills: [...f.skills, skill], skillInput: '' }));
    }
  };
  const handleRemoveSkill = skill => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };
  const handleSkillInputKeyDown = e => {
    if (e.key === 'Enter' && form.skillInput) {
      e.preventDefault();
      handleAddSkill(form.skillInput);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      let resumeUrl = '';
      if (form.resume) {
        const storageRef = ref(storage, `resumes/${user.uid}/${form.resume.name}`);
        await uploadBytes(storageRef, form.resume);
        resumeUrl = await getDownloadURL(storageRef);
      }
      await setDoc(doc(db, 'users', user.uid), {
        name: form.name,
        education: form.education,
        role: form.role,
        skills: form.skills,
        targetRole: form.targetRole,
        shortGoal: form.shortGoal,
        longGoal: form.longGoal,
        resumeUrl,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-layout fixed-signup-layout">
      <div className="login-left fixed-signup-photo">
        <img className="login-image" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" alt="Career" />
        <div className="login-left-overlay">
          <h1>Welcome to CareerPath</h1>
          <p>Your personalized learning and career growth assistant.</p>
        </div>
      </div>
      <div className="login-right fixed-signup-form">
        <form className="signup-form-card profile-grid-form" onSubmit={handleSubmit} style={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <div className="signup-form-header" style={{marginBottom: '0.3rem'}}>
            <span className="signup-plane" style={{fontSize: '1.1rem', marginBottom: 0}}>✈️</span>
            <h2 style={{fontSize: '1rem', margin: 0}}>Profile</h2>
          </div>
          <div className="profile-grid" style={{flex: 1, minHeight: 0, alignItems: 'start'}}>
            <div className="profile-grid-col">
              <label>Name</label>
              <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="profile-grid-col">
              <label>Education</label>
              <select name="education" value={form.education} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="High School">High School</option>
                <option value="College">College</option>
                <option value="Graduate">Graduate</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            <div className="profile-grid-col">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Student">Student</option>
                <option value="Intern">Intern</option>
                <option value="Fresher">Fresher</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            <div className="profile-grid-col">
              <label>Target Role</label>
              <input type="text" name="targetRole" placeholder="Target" value={form.targetRole} onChange={handleChange} list="target-role-list" autoComplete="off" required />
              <datalist id="target-role-list">
                {filteredRoles.map(r => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
            <div className="profile-grid-col profile-grid-col-span2">
              <label>Skills</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.2rem' }}>
                {form.skills.map(skill => (
                  <span key={skill} style={{ background: 'var(--beige)', color: 'var(--brown)', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                    {skill} <button type="button" style={{ marginLeft: 2, background: 'none', border: 'none', color: 'var(--brown)', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => handleRemoveSkill(skill)}>&times;</button>
                  </span>
                ))}
              </div>
              <input type="text" name="skillInput" placeholder="Add skill..." value={form.skillInput} onChange={handleSkillInput} onKeyDown={handleSkillInputKeyDown} list="skills-list" style={{marginBottom: 0}} />
              <datalist id="skills-list">
                {skillsList.filter(s => !form.skills.includes(s)).map(s => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div className="profile-grid-col profile-grid-col-span2">
              <label>Goal</label>
              <textarea name="shortGoal" placeholder="Your goal" value={form.shortGoal} onChange={handleChange} rows={1} style={{resize: 'none', minHeight: '1.7rem', maxHeight: '2.2rem'}} required />
            </div>
            <div className="profile-grid-col">
              <label>Resume</label>
              <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} style={{padding: 0}} />
            </div>
            <div className="profile-grid-col" style={{display: 'flex', alignItems: 'end', justifyContent: 'end'}}>
              <button className="primary-btn" type="submit" disabled={loading} style={{width: '100%', fontSize: '0.9rem', padding: '0.4rem 0.7rem', margin: 0}}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
            {error && <div className="form-error profile-grid-col-span2">{error}</div>}
          </div>
        </form>
      </div>
    </div>
  );
}
