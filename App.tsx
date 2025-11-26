import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { UserRole, Notification, Student, Subject, Task } from './types';
import { MOCK_STUDENTS, MOCK_TEACHER, INITIAL_NOTIFICATIONS, MOCK_SUBJECTS, INITIAL_TASKS } from './constants';

const App: React.FC = () => {
  // Routing State
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [isLoading, setIsLoading] = useState(true);
  
  // Centralized Data State
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // Handle Hash Navigation
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Simulate initial system boot
    setTimeout(() => setIsLoading(false), 800);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const handleLogin = (role: UserRole) => {
    setIsLoading(true);
    // Simulate network delay for effect
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'student') {
        navigate('#/student');
      } else if (role === 'teacher') {
        navigate('#/teacher');
      }
    }, 600);
  };

  const handleLogout = () => {
    navigate('#/');
  };

  const handleSendMessage = (title: string, message: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      date: new Date().toISOString().split('T')[0],
      type: 'teacher',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleAddStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const handleAddSubject = (subject: Subject) => {
    setSubjects(prev => [...prev, subject]);
  };

  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Router Switch Logic
  if (route.startsWith('#/student')) {
    return (
      <StudentDashboard 
        user={students[0]} // Log in as the first student for demo
        subjects={subjects}
        notifications={notifications}
        tasks={tasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onLogout={handleLogout} 
      />
    );
  }

  if (route.startsWith('#/teacher')) {
    return (
      <TeacherDashboard 
        user={MOCK_TEACHER}
        students={students}
        subjects={subjects}
        onSendMessage={handleSendMessage}
        onAddStudent={handleAddStudent}
        onAddSubject={handleAddSubject}
        onLogout={handleLogout} 
      />
    );
  }

  // Default to Login
  return <LoginScreen onLogin={handleLogin} />;
};

export default App;