import { Student, Subject, ClassSession, Teacher, Notification, Task } from './types';

export const MOCK_STUDENTS: Student[] = [
  { 
    id: 's1', 
    name: 'Alex Chen', 
    email: 'alex@attendly.com', 
    avatar: 'https://picsum.photos/seed/alex/100/100',
    rollNumber: '2024-CS-042',
    department: 'Computer Science',
    year: '3rd Year'
  },
  { 
    id: 's2', 
    name: 'Jordan Smith', 
    email: 'jordan@attendly.com', 
    avatar: 'https://picsum.photos/seed/jordan/100/100',
    rollNumber: '2024-CS-043',
    department: 'Computer Science',
    year: '3rd Year'
  },
];

export const MOCK_TEACHER: Teacher = {
  id: 't1',
  name: 'Dr. Sarah Connor',
  email: 'sarah.connor@attendly.com',
  avatar: 'https://picsum.photos/seed/sarah/100/100',
  facultyId: 'FAC-099',
  department: 'Computer Science',
  specialization: 'Artificial Intelligence'
};

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Quantum Physics', code: 'PHY-404', totalClasses: 24, attendedClasses: 20 },
  { id: 'sub2', name: 'Neural Networks', code: 'CS-302', totalClasses: 30, attendedClasses: 15 }, // Low attendance example
  { id: 'sub3', name: 'Cyber Ethics', code: 'ETH-101', totalClasses: 12, attendedClasses: 12 },
  { id: 'sub4', name: 'Advanced Calculus', code: 'MAT-201', totalClasses: 28, attendedClasses: 22 },
];

export const MOCK_SESSIONS: ClassSession[] = [
  // Physics
  { id: 'p1', subjectId: 'sub1', date: '2023-10-01', topic: 'Wave Particle Duality', status: 'present', smartNotes: 'Key concept: Light behaves as both a particle and a wave. Remember De Broglie wavelength equation.' },
  { id: 'p2', subjectId: 'sub1', date: '2023-10-03', topic: 'Schrodinger Equation', status: 'present', smartNotes: 'Time-dependent vs Time-independent equations. Psi represents the wave function.' },
  { id: 'p3', subjectId: 'sub1', date: '2023-10-05', topic: 'Heisenberg Uncertainty', status: 'absent', smartNotes: 'Missed class. Peer notes: Delta x * Delta p >= h-bar / 2. Cannot know position and momentum simultaneously.' },
  { id: 'p4', subjectId: 'sub1', date: '2023-10-08', topic: 'Quantum Tunneling', status: 'present', smartNotes: 'Particles can pass through potential barriers higher than their energy level.' },
  
  // Neural Networks
  { id: 'n1', subjectId: 'sub2', date: '2023-10-02', topic: 'Perceptrons', status: 'present', smartNotes: 'Single layer neural network. Linear classifier.' },
  { id: 'n2', subjectId: 'sub2', date: '2023-10-04', topic: 'Backpropagation', status: 'absent', smartNotes: 'Missed. Critical topic: Chain rule used to calculate gradients for weight updates.' },
  { id: 'n3', subjectId: 'sub2', date: '2023-10-06', topic: 'Activation Functions', status: 'absent', smartNotes: 'ReLU is standard. Sigmoid vanishes gradients. Tanh is zero-centered.' },
  { id: 'n4', subjectId: 'sub2', date: '2023-10-09', topic: 'Convolutional Layers', status: 'present', smartNotes: 'Filters extract features. Pooling reduces dimensionality.' },
  
  // Ethics
  { id: 'e1', subjectId: 'sub3', date: '2023-10-01', topic: 'Utilitarianism in AI', status: 'present', smartNotes: 'Greatest good for greatest number. Trolley problem variations.' },
  { id: 'e2', subjectId: 'sub3', date: '2023-10-08', topic: 'Data Privacy Laws', status: 'present', smartNotes: 'GDPR and CCPA implications for software engineering.' },

  // Calculus
  { id: 'm1', subjectId: 'sub4', date: '2023-10-02', topic: 'Multiple Integrals', status: 'present', smartNotes: 'Integrating over regions in 2D and 3D space.' },
  { id: 'm2', subjectId: 'sub4', date: '2023-10-05', topic: 'Vector Fields', status: 'present', smartNotes: 'Visualizing flow. Gradient, Divergence, and Curl operators.' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Welcome to Attendly', message: 'Your student profile has been successfully set up. Check your dashboard for real-time attendance tracking.', date: '2023-10-01', type: 'system', read: false }
];

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Submit Quantum Physics Assignment', completed: false, dueDate: '2023-10-15', subjectId: 'sub1' },
  { id: 't2', title: 'Read Chapter 4 for Ethics', completed: true, dueDate: '2023-10-10', subjectId: 'sub3' },
  { id: 't3', title: 'Prepare for Calculus Midterm', completed: false, dueDate: '2023-10-20', subjectId: 'sub4' },
];