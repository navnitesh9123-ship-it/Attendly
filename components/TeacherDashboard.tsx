import React, { useState, useEffect } from 'react';
import { Student, Subject, Teacher } from '../types';
import { generateParentEmail } from '../services/geminiService';
import { Button } from './Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface Props {
  user: Teacher;
  students: Student[];
  subjects: Subject[];
  onLogout: () => void;
  onSendMessage: (title: string, message: string) => void;
  onAddStudent: (student: Student) => void;
  onAddSubject: (subject: Subject) => void;
}

const generateMockAttendance = (studentId: string, subjectCode: string) => {
    const hash = (studentId + subjectCode).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 50 + (hash % 51);
};

export const TeacherDashboard: React.FC<Props> = ({ user, students, subjects, onLogout, onSendMessage, onAddStudent, onAddSubject }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'communication'>('overview');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Set initial subject if available
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  const [markedAttendance, setMarkedAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [emailGenerating, setEmailGenerating] = useState<string | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  const [studentStats, setStudentStats] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<{name: string, count: number}[]>([]);
  
  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  
  // Message State
  const [notificationMessage, setNotificationMessage] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");

  // Forms
  const [newStudent, setNewStudent] = useState({ name: '', email: '', rollNumber: '', department: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', totalClasses: 20 });

  useEffect(() => {
    if (!selectedSubject) return;
    const stats: Record<string, number> = {};
    students.forEach(s => {
        stats[s.id] = generateMockAttendance(s.id, selectedSubject.code);
    });
    setStudentStats(stats);
    setMarkedAttendance({});
    
    // Set default notification message when subject changes
    setNotificationMessage(`Warning: Your attendance in ${selectedSubject.name} (${selectedSubject.code}) is below 75%. Please attend upcoming classes to improve your standing.`);
    
    // Prepare Distribution Chart Data
    const distribution = [
      { name: '<50%', count: 0 },
      { name: '50-75%', count: 0 },
      { name: '75-90%', count: 0 },
      { name: '90%+', count: 0 },
    ];

    Object.values(stats).forEach(pct => {
      if (pct < 50) distribution[0].count++;
      else if (pct < 75) distribution[1].count++;
      else if (pct < 90) distribution[2].count++;
      else distribution[3].count++;
    });

    setChartData(distribution);

  }, [selectedSubject, students]);

  const toggleAttendance = (studentId: string) => {
    setMarkedAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'absent' ? 'present' : 'absent'
    }));
  };

  const handleGenerateEmail = async (student: Student) => {
    setEmailGenerating(student.id);
    const email = await generateParentEmail(student, subjects);
    setGeneratedEmail(email);
    setEmailGenerating(null);
  };

  const handleSendAtRiskNotification = () => {
      const attendanceValues = Object.values(studentStats) as number[];
      const atRiskCount = attendanceValues.filter(p => p < 75).length;
      onSendMessage(`Attendance Alert: ${selectedSubject?.name}`, notificationMessage);
      alert(`Sent to ${atRiskCount} students.`);
  };

  const handleSendBroadcast = () => {
    if (!broadcastTitle || !broadcastMessage) return;
    onSendMessage(broadcastTitle, broadcastMessage);
    setBroadcastTitle("");
    setBroadcastMessage("");
    alert("Message broadcasted to all students.");
  };

  const handleSaveStudent = () => {
    if (!newStudent.name || !newStudent.rollNumber) return;
    onAddStudent({
      id: Date.now().toString(),
      ...newStudent,
      avatar: `https://ui-avatars.com/api/?name=${newStudent.name}&background=random`,
      year: '1st Year' // Default
    });
    setShowAddStudent(false);
    setNewStudent({ name: '', email: '', rollNumber: '', department: '' });
  };

  const handleSaveSubject = () => {
    if (!newSubject.name || !newSubject.code) return;
    onAddSubject({
      id: Date.now().toString(),
      ...newSubject,
      attendedClasses: 0 // Default
    });
    setShowAddSubject(false);
    setNewSubject({ name: '', code: '', totalClasses: 20 });
  };

  const attendanceValues = Object.values(studentStats) as number[];
  const atRiskCount = attendanceValues.filter(p => p < 75).length;
  
  const averageAttendance = attendanceValues.length > 0 
    ? Math.round(attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length) 
    : 0;
    
  const medianAttendance = (() => {
      if (attendanceValues.length === 0) return 0;
      const sorted = [...attendanceValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  })();

  if (!selectedSubject) {
    return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
             <h2 className="text-xl font-semibold mb-4">No Subjects Available</h2>
             <Button onClick={() => setShowAddSubject(true)}>Add First Subject</Button>
             
             {/* Add Subject Modal Reuse for empty state */}
             {showAddSubject && (
               <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                     <h3 className="font-semibold text-lg mb-4">Add New Subject</h3>
                     <div className="space-y-3">
                       <input className="w-full border p-2 rounded" placeholder="Subject Name" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} />
                       <input className="w-full border p-2 rounded" placeholder="Subject Code (e.g. CS-101)" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} />
                       <input className="w-full border p-2 rounded" type="number" placeholder="Total Classes" value={newSubject.totalClasses} onChange={e => setNewSubject({...newSubject, totalClasses: parseInt(e.target.value)})} />
                       <div className="flex justify-end gap-2 mt-4">
                          <Button variant="primary" onClick={handleSaveSubject}>Save Subject</Button>
                       </div>
                     </div>
                  </div>
               </div>
             )}
          </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-black rounded flex items-center justify-center">
               <span className="text-white font-bold">T</span>
             </div>
             <span className="font-semibold text-lg">Teacher Dashboard</span>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
             {['overview', 'attendance', 'communication'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
             ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">{user.name}</span>
            <button onClick={() => setShowProfile(true)}>
              <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 hover:ring-2 hover:ring-gray-200 transition-all" />
            </button>
            <Button variant="secondary" onClick={onLogout} className="text-xs py-1.5 px-3">Log Out</Button>
          </div>
        </div>
      </nav>

      {/* Mobile Tab Nav */}
      <div className="md:hidden bg-white border-b border-gray-200 px-6 py-2">
         <div className="flex gap-2">
             {['overview', 'attendance', 'communication'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-2 text-sm font-medium border-b-2 capitalize ${
                    activeTab === tab 
                      ? 'border-gray-900 text-gray-900' 
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  {tab}
                </button>
             ))}
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Subject Sidebar (Global) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Subjects</h3>
                 <button onClick={() => setShowAddSubject(true)} className="text-xs text-blue-600 hover:underline">+ Add New</button>
              </div>
              <div className="space-y-1">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      selectedSubject.id === subject.id 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{subject.code}</span>
                      {selectedSubject.id === subject.id && <span className="bg-gray-700 w-1.5 h-1.5 rounded-full"></span>}
                    </div>
                    <div className={`text-xs mt-0.5 ${selectedSubject.id === subject.id ? 'text-gray-400' : 'text-gray-500'}`}>{subject.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
             
             {/* Header for Content */}
             <div className="mb-6 flex justify-between items-end">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">{selectedSubject.name}</h2>
                   <p className="text-gray-500 text-sm mt-1">{selectedSubject.code} • {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
                </div>
                {activeTab === 'attendance' && (
                   <Button onClick={() => setShowAddStudent(true)} className="text-sm">Add Student</Button>
                )}
             </div>

             {/* TAB: OVERVIEW */}
             {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Class Average</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-bold text-gray-900">{averageAttendance}%</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Median Score</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-bold text-gray-900">{medianAttendance}%</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Students At Risk</p>
                            <div className="flex items-end gap-2">
                                <p className={`text-4xl font-bold ${atRiskCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{atRiskCount}</p>
                                <span className="text-sm text-gray-500 mb-1.5">below 75%</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                       <h3 className="font-semibold text-gray-900 mb-6">Attendance Distribution</h3>
                       <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                               <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                               <Bar dataKey="count" fill="#111827" radius={[4, 4, 0, 0]} barSize={50} />
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                </div>
             )}

             {/* TAB: ATTENDANCE */}
             {activeTab === 'attendance' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Student Roster</h3>
                    <span className="text-sm text-gray-500">{students.length} Enrolled</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-white border-b border-gray-100 text-xs uppercase font-medium text-gray-500">
                        <tr>
                          <th className="px-6 py-3">Student</th>
                          <th className="px-6 py-3">Attendance Rate</th>
                          <th className="px-6 py-3 text-center">Status</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((student) => {
                          const status = markedAttendance[student.id] || 'present';
                          const rate = studentStats[student.id] || 100;
                          const isAtRisk = rate < 75;

                          return (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={student.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                                  <div>
                                    <div className="font-medium text-gray-900">{student.name}</div>
                                    <div className="text-xs text-gray-500">{student.rollNumber}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                     <div 
                                        className={`h-1.5 rounded-full ${isAtRisk ? 'bg-gray-900' : 'bg-gray-500'}`} 
                                        style={{ width: `${rate}%` }}
                                     ></div>
                                   </div>
                                   <span className={`font-medium ${isAtRisk ? 'text-red-600' : 'text-gray-700'}`}>{rate}%</span>
                                </div>
                                {isAtRisk && <span className="text-[10px] text-gray-500 block mt-1">At Risk</span>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => toggleAttendance(student.id)}
                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                                    status === 'present' 
                                      ? 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200' 
                                      : 'bg-white text-gray-400 border-dashed border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {status === 'present' ? 'Present' : 'Absent'}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button 
                                    onClick={() => handleGenerateEmail(student)}
                                    disabled={emailGenerating === student.id}
                                    className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded hover:bg-gray-100"
                                    title="Draft Parent Email"
                                  >
                                    {emailGenerating === student.id ? (
                                       <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                                    ) : (
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                 </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                      <Button variant="primary" className="text-sm" onClick={() => alert("Changes saved successfully.")}>Save Attendance</Button>
                  </div>
                </div>
             )}

             {/* TAB: COMMUNICATION */}
             {activeTab === 'communication' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   
                   {/* Broadcast Message Section */}
                   <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                         <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                            Broadcast Message
                         </h3>
                         <p className="text-xs text-gray-500 mt-0.5">Send a notification to all students in {selectedSubject.code}</p>
                      </div>
                      <div className="p-6 space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                           <input 
                             className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none" 
                             value={broadcastTitle} 
                             onChange={e => setBroadcastTitle(e.target.value)} 
                             placeholder="e.g. Exam Schedule Update" 
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                           <textarea 
                             value={broadcastMessage}
                             onChange={(e) => setBroadcastMessage(e.target.value)}
                             rows={4}
                             className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                             placeholder="Type your message to all students..."
                           />
                         </div>
                         <div className="flex justify-end">
                            <Button variant="primary" onClick={handleSendBroadcast} disabled={!broadcastTitle || !broadcastMessage}>Send Broadcast</Button>
                         </div>
                      </div>
                   </div>

                   {/* At Risk Alert Section */}
                   <div className="bg-white rounded-lg border border-red-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-red-50 bg-red-50/50">
                         <h3 className="font-semibold text-red-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            At-Risk Alert
                         </h3>
                         <p className="text-xs text-red-700 mt-0.5">Targeted notification for {atRiskCount} students falling behind.</p>
                      </div>
                      <div className="p-6">
                         <label className="block text-sm font-medium text-gray-700 mb-2">Alert Message</label>
                         <textarea 
                           value={notificationMessage}
                           onChange={(e) => setNotificationMessage(e.target.value)}
                           rows={3}
                           className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4"
                         />
                         <div className="flex justify-end">
                            <Button variant="danger" onClick={handleSendAtRiskNotification} disabled={atRiskCount === 0}>
                               Notify {atRiskCount} Students
                            </Button>
                         </div>
                      </div>
                   </div>

                </div>
             )}
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Add New Student</h3>
              <div className="space-y-3">
                <input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" placeholder="Full Name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                <input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" placeholder="Roll Number" value={newStudent.rollNumber} onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})} />
                <input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" placeholder="Email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                <input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" placeholder="Department" value={newStudent.department} onChange={e => setNewStudent({...newStudent, department: e.target.value})} />
                <div className="flex justify-end gap-2 mt-4">
                   <Button variant="secondary" onClick={() => setShowAddStudent(false)}>Cancel</Button>
                   <Button variant="primary" onClick={handleSaveStudent}>Add Student</Button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Add New Subject</h3>
              <div className="space-y-3">
                <input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" placeholder="Subject Name" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} />
                <input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" placeholder="Subject Code (e.g. CS-101)" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} />
                <input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" type="number" placeholder="Total Classes" value={newSubject.totalClasses} onChange={e => setNewSubject({...newSubject, totalClasses: parseInt(e.target.value)})} />
                <div className="flex justify-end gap-2 mt-4">
                   <Button variant="secondary" onClick={() => setShowAddSubject(false)}>Cancel</Button>
                   <Button variant="primary" onClick={handleSaveSubject}>Save Subject</Button>
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
                    <p className="text-gray-500 text-sm">{user.department} • {user.specialization}</p>
                    
                    <div className="mt-6 space-y-4">
                       <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-sm text-gray-500">Faculty ID</span>
                          <span className="text-sm font-medium text-gray-900">{user.facultyId}</span>
                       </div>
                       <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-sm text-gray-500">Email</span>
                          <span className="text-sm font-medium text-gray-900">{user.email}</span>
                       </div>
                    </div>

                    <div className="mt-8">
                       <Button variant="secondary" className="w-full" onClick={() => setShowProfile(false)}>Close Profile</Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Email Modal */}
      {generatedEmail && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-semibold text-gray-900">Review Email Draft</h3>
               <button onClick={() => setGeneratedEmail(null)} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {generatedEmail}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setGeneratedEmail(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => {
                alert("Email sent.");
                setGeneratedEmail(null);
              }}>Send Email</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};