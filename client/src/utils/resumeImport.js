// Resume Import Utility - Based on OpenResume's PDF parsing functionality
// This is a simplified version - for production, consider using more robust PDF parsing libraries

export const parseResumeFromText = (text) => {
  // Basic text parsing to extract resume information
  // This is a simplified implementation - OpenResume uses more sophisticated parsing
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const parsedData = {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };

  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    parsedData.personalInfo.email = emailMatch[0];
  }

  // Extract phone number
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    parsedData.personalInfo.phone = phoneMatch[0];
  }

  // Extract LinkedIn URL
  const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch) {
    parsedData.personalInfo.linkedin = linkedinMatch[0];
  }

  // Extract GitHub URL
  const githubRegex = /https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+/;
  const githubMatch = text.match(githubRegex);
  if (githubMatch) {
    parsedData.personalInfo.github = githubMatch[0];
  }

  // Extract website URL
  const websiteRegex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const websiteMatch = text.match(websiteRegex);
  if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github')) {
    parsedData.personalInfo.website = websiteMatch[0];
  }

  // Try to extract name (usually the first line or largest text)
  if (lines.length > 0) {
    const firstLine = lines[0];
    // If first line doesn't contain email or phone, it's likely the name
    if (!emailRegex.test(firstLine) && !phoneRegex.test(firstLine)) {
      parsedData.personalInfo.name = firstLine;
    }
  }

  // Extract skills (look for common skill keywords)
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker',
    'Kubernetes', 'Git', 'Linux', 'Agile', 'Scrum', 'Machine Learning', 'AI',
    'Data Science', 'Analytics', 'Project Management', 'Leadership', 'Communication'
  ];

  const foundSkills = skillKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  parsedData.skills = [...new Set(foundSkills)]; // Remove duplicates

  // Basic experience extraction (look for company patterns)
  const experiencePatterns = [
    /([A-Z][a-zA-Z\s&]+)\s*[-–]\s*([A-Z][a-zA-Z\s]+)/g,
    /([A-Z][a-zA-Z\s&]+)\s*at\s*([A-Z][a-zA-Z\s]+)/g
  ];

  experiencePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && match[2] && !match[1].includes('@') && !match[1].includes('http')) {
        parsedData.experience.push({
          company: match[2].trim(),
          position: match[1].trim(),
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        });
      }
    }
  });

  // Basic education extraction
  const educationPatterns = [
    /([A-Z][a-zA-Z\s]+)\s*[-–]\s*([A-Z][a-zA-Z\s]+)/g,
    /([A-Z][a-zA-Z\s]+)\s*in\s*([A-Z][a-zA-Z\s]+)/g
  ];

  educationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && match[2] && 
          (match[1].toLowerCase().includes('university') || 
           match[1].toLowerCase().includes('college') ||
           match[1].toLowerCase().includes('bachelor') ||
           match[1].toLowerCase().includes('master') ||
           match[1].toLowerCase().includes('phd'))) {
        parsedData.education.push({
          institution: match[1].trim(),
          degree: match[2].trim(),
          field: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: '',
          description: ''
        });
      }
    }
  });

  return parsedData;
};

// File upload handler for resume import with PDF and DOCX support
export const handleFileUpload = async (file, onSuccess, onError) => {
  if (!file) {
    onError('No file selected');
    return;
  }

  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      // Handle text files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const parsedData = parseResumeFromText(text);
          onSuccess(parsedData);
        } catch (error) {
          onError('Error parsing text file: ' + error.message);
        }
      };
      reader.onerror = () => onError('Error reading file');
      reader.readAsText(file);
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // Handle PDF files using pdfjs-dist
      await parsePDFFile(file, onSuccess, onError);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileName.endsWith('.docx')) {
      // Handle Word documents using mammoth
      await parseDOCXFile(file, onSuccess, onError);
    } else {
      onError('Unsupported file type. Please use .txt, .pdf, or .docx files.');
    }
  } catch (error) {
    onError('Error processing file: ' + error.message);
  }
};

// Parse PDF file using pdfjs-dist
const parsePDFFile = async (file, onSuccess, onError) => {
  try {
    // Dynamic import to avoid build issues if pdfjs-dist is not installed
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    const parsedData = parseResumeFromText(fullText);
    onSuccess(parsedData);
  } catch (error) {
    onError('Error parsing PDF file: ' + error.message + '. Please ensure pdfjs-dist is installed.');
  }
};

// Parse DOCX file using mammoth
const parseDOCXFile = async (file, onSuccess, onError) => {
  try {
    // Dynamic import to avoid build issues if mammoth is not installed
    const mammoth = await import('mammoth');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    const parsedData = parseResumeFromText(result.value);
    onSuccess(parsedData);
  } catch (error) {
    onError('Error parsing DOCX file: ' + error.message + '. Please ensure mammoth is installed.');
  }
};

// Sample resume data for testing
export const getSampleResumeData = () => {
  return {
    personalInfo: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      website: 'https://johndoe.com',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe'
    },
    summary: 'Experienced software engineer with 5+ years of experience in full-stack development. Passionate about creating scalable web applications and leading development teams.',
    experience: [
      {
        company: 'Tech Company Inc.',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2020-01',
        endDate: '',
        current: true,
        description: 'Led development of microservices architecture, improved system performance by 40%, and mentored junior developers.'
      },
      {
        company: 'StartupXYZ',
        position: 'Full Stack Developer',
        location: 'San Francisco, CA',
        startDate: '2018-06',
        endDate: '2019-12',
        current: false,
        description: 'Developed and maintained web applications using React, Node.js, and MongoDB. Collaborated with cross-functional teams.'
      }
    ],
    education: [
      {
        institution: 'University of California',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        location: 'Berkeley, CA',
        startDate: '2014-09',
        endDate: '2018-05',
        gpa: '3.8/4.0',
        description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git'],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce platform with React frontend and Node.js backend.',
        technologies: 'React, Node.js, MongoDB, Stripe API',
        url: 'https://myecommerce.com',
        github: 'https://github.com/johndoe/ecommerce'
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2021-03',
        url: 'https://aws.amazon.com/verification'
      }
    ]
  };
};
