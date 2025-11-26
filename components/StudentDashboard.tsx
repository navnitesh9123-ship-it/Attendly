import React, { useState, useEffect } from 'react';
import { Subject, Student, ClassSession, Notification, Task } from '../types';
import { MOCK_SESSIONS } from '../constants';
import { getAttendanceInsights } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Button } from './Button';

interface Props {
  user: Student;
  subjects: Subject[];
  notifications: Notification[];
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<Props> = ({ user, subjects, notifications, tasks, onAddTask, onToggleTask, onDeleteTask, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview');
  const [insight, setInsight] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<Notification[]>([]);
  
  // Tasks Form State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");

  // Modals
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
  const totalAttended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  // Chart Data Preparation
  const performanceData = subjects.map(s => ({
    name: s.code,
    fullName: s.name,
    attendance: s.totalClasses > 0 ? Math.round((s.attendedClasses / s.totalClasses) * 100) : 0
  }));

  useEffect(() => {
    // Generate system alerts based on attendance < 75%
    const systemAlerts: Notification[] = subjects
      .filter(s => s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) < 0.75)
      .map(s => ({
        id: `sys-${s.id}`,
        title: 'Low Attendance Warning',
        message: `Your attendance in ${s.name} is below 75%. Please attend upcoming classes.`,
        date: new Date().toISOString().split('T')[0],
        type: 'system',
        read: false
      }));

    // Combine system alerts with messages passed from App (teacher messages)
    setActiveAlerts([...notifications, ...systemAlerts]);
  }, [subjects, notifications]);

  const handleGetInsight = async () => {
    setLoadingAI(true);
    const result = await getAttendanceInsights(subjects, user.name);
    setInsight(result);
    setLoadingAI(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    
    onAddTask({
      id: Date.now().toString(),
      title: newTaskTitle,
      dueDate: newTaskDate,
      completed: false
    });
    setNewTaskTitle("");
    setNewTaskDate("");
  };

  const calculateRecovery = (attended: number, total: number) => {
    if (total === 0) return 0;
    const target = 0.75;
    const currentPct = attended / total;
    if (currentPct >= target) return 0;
    const needed = Math.ceil((0.75 * total - attended) / 0.25);
    return Math.max(0, needed);
  };

  const getSubjectSessions = (subjectId: string) => {
    return MOCK_SESSIONS.filter(s => s.subjectId === subjectId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <span className="font-semibold text-lg tracking-tight">Attendly</span>
          </div>
          
          <div className="hidden md:flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              My Tasks
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">{user.email}</span>
            <button onClick={() => setShowProfile(true)}>
              <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 hover:ring-2 hover:ring-gray-200 transition-all" />
            </button>
            <Button variant="secondary" onClick={onLogout} className="text-xs py-1.5 px-3">Sign out</Button>
          </div>
        </div>
      </nav>

      {/* Mobile Tab Nav */}
      <div className="md:hidden bg-white border-b border-gray-200 px-6 py-2">
         <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === 'overview' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === 'tasks' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}
            >
              Tasks
            </button>
         </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}.</p>
            </div>

            {/* Notifications & Alerts Section */}
            <div className="mb-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                   <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                   <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                   <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{activeAlerts.length}</span>
                </div>
                {activeAlerts.length > 0 ? (
                  <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                    {activeAlerts.map((note, idx) => (
                      <li key={idx} className="px-4 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${note.type === 'system' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-0.5">
                              <span className="font-semibold text-gray-800">{note.title}</span>
                              <span className="text-xs text-gray-400">{note.date}</span>
                           </div>
                           <p className="text-gray-600">{note.message}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm italic">
                    No new notifications.
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Analytics Graph */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-6">Subject Performance</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                          <RechartsTooltip 
                             cursor={{fill: '#f3f4f6'}}
                             contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                          />
                          <Bar dataKey="attendance" fill="#111827" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Cards */}
                <div className="grid grid-cols-1 gap-6">
                  {subjects.map(subject => {
                    const percentage = subject.totalClasses > 0 ? Math.round((subject.attendedClasses / subject.totalClasses) * 100) : 0;
                    const isLow = percentage < 75;
                    const classesNeeded = calculateRecovery(subject.attendedClasses, subject.totalClasses);
                    
                    const data = [
                      { name: 'Attended', value: subject.attendedClasses },
                      { name: 'Missed', value: Math.max(0, subject.totalClasses - subject.attendedClasses) },
                    ];

                    if (subject.totalClasses === 0) {
                      data[1].value = 1; 
                    }

                    return (
                      <div key={subject.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{subject.name}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{subject.code}</span>
                          </div>
                          <div className={`text-xl font-bold ${isLow ? 'text-gray-900' : 'text-gray-600'}`}>
                            {percentage}%
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={25}
                                    outerRadius={32}
                                    dataKey="value"
                                    stroke="none"
                                  >
                                    <Cell fill={isLow ? '#1f2937' : '#4b5563'} />
                                    <Cell fill="#f3f4f6" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                          </div>
                          
                          <div className="flex-1">
                              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                <div 
                                  className={`h-2 rounded-full ${isLow ? 'bg-gray-900' : 'bg-gray-500'}`} 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>{subject.attendedClasses} attended</span>
                                <span>{subject.totalClasses} total</span>
                              </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-3">
                          {isLow && classesNeeded > 0 ? (
                              <span className="text-xs text-gray-600">
                                Attend next <span className="font-bold text-gray-900">{classesNeeded}</span> classes to recover.
                              </span>
                          ) : (
                              <span className="text-xs text-green-700 font-medium">On track</span>
                          )}
                          <button 
                              onClick={() => setSelectedSubject(subject)}
                              className="text-xs font-semibold text-gray-900 hover:underline flex items-center gap-1"
                          >
                            View Details
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                 {/* Overall Score */}
                 <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Overall Attendance</h3>
                    <div className="text-5xl font-bold text-gray-900 mb-2">{overallPercentage}%</div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${overallPercentage < 75 ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                       {overallPercentage < 75 ? 'Attention Needed' : 'Good Standing'}
                    </div>
                 </div>

                 {/* AI Assistant */}
                 <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col h-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs">AI</div>
                      <h3 className="font-semibold text-gray-900">Academic Assistant</h3>
                    </div>
                    
                    <div className="flex-1 mb-4 bg-gray-50 rounded p-4 text-sm text-gray-600 leading-relaxed min-h-[120px]">
                      {insight ? insight : "Click 'Analyze' to get personalized feedback on your attendance records."}
                    </div>

                    <Button onClick={handleGetInsight} isLoading={loadingAI} className="w-full" variant="secondary">
                      Analyze Performance
                    </Button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TASKS */}
        {activeTab === 'tasks' && (
           <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="mb-8 flex justify-between items-center">
                   <div>
                       <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
                       <p className="text-gray-500 text-sm mt-1">Manage your study schedule and assignments.</p>
                   </div>
                   <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium">
                       {tasks.filter(t => t.completed).length} / {tasks.length} Completed
                   </div>
               </div>

               <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
                  <form onSubmit={handleCreateTask} className="p-4 bg-gray-50 border-b border-gray-200 flex gap-4 items-center">
                      <div className="flex-1">
                          <input 
                             type="text" 
                             placeholder="Add a new task..." 
                             className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                             value={newTaskTitle}
                             onChange={(e) => setNewTaskTitle(e.target.value)}
                          />
                      </div>
                      <div className="w-40">
                          <input 
                             type="date"
                             className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                             value={newTaskDate}
                             onChange={(e) => setNewTaskDate(e.target.value)}
                          />
                      </div>
                      <Button variant="primary" type="submit" disabled={!newTaskTitle}>Add Task</Button>
                  </form>

                  <ul className="divide-y divide-gray-100">
                     {tasks.length > 0 ? tasks.map(task => (
                       <li key={task.id} className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${task.completed ? 'bg-gray-50/50' : ''}`}>
                          <button 
                             onClick={() => onToggleTask(task.id)}
                             className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-gray-400'}`}
                          >
                             {task.completed && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </button>
                          
                          <div className="flex-1">
                             <h4 className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {task.title}
                             </h4>
                             {task.dueDate && (
                                <p className={`text-xs mt-0.5 ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                   Due: {task.dueDate} {new Date(task.dueDate) < new Date() && !task.completed && '(Overdue)'}
                                </p>
                             )}
                          </div>

                          <button onClick={() => onDeleteTask(task.id)} className="text-gray-400 hover:text-red-600 transition-colors p-2">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </li>
                     )) : (
                       <li className="p-8 text-center text-gray-400 italic text-sm">You have no pending tasks.</li>
                     )}
                  </ul>
               </div>
           </div>
        )}
      </main>

      {/* Subject Detail Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-end">
           <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 px-8 py-6 flex justify-between items-start z-10">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedSubject.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">{selectedSubject.code} • Detailed History</p>
                 </div>
                 <button 
                   onClick={() => setSelectedSubject(null)}
                   className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                 >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="p-8">
                 <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                       Class History
                    </h3>
                    
                    <div className="space-y-6 relative border-l border-gray-200 ml-2 pl-6">
                        {getSubjectSessions(selectedSubject.id).length > 0 ? (
                           getSubjectSessions(selectedSubject.id).map((session) => (
                              <div key={session.id} className="relative">
                                 {/* Timeline dot */}
                                 <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white ${session.status === 'present' ? 'bg-gray-900' : 'bg-gray-300'}`}></span>
                                 
                                 <div className="flex justify-between items-start mb-2">
                                    <div>
                                       <h4 className="font-semibold text-gray-900 text-sm">{session.topic}</h4>
                                       <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                        session.status === 'present' 
                                            ? 'bg-gray-100 text-gray-900 border border-gray-200' 
                                            : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                        {session.status}
                                    </span>
                                 </div>

                                 {/* Smart Notes Section */}
                                 <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 border border-gray-100">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-gray-400">
                                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                       SMART NOTES
                                    </div>
                                    <p className="leading-relaxed text-xs md:text-sm">{session.smartNotes || "No notes available for this session."}</p>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <p className="text-gray-500 text-sm italic">No class history recorded yet.</p>
                        )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="relative h-32 bg-gray-900">
                 <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 p-1 bg-white/10 hover:bg-white/20 rounded-full text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="px-6 pb-6 relative">
                 <div className="absolute -top-12 left-6 p-1 bg-white rounded-full">
                    <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full bg-gray-200 object-cover" />
                 </div>
                 <div className="mt-14">
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 text-sm