import { GoogleGenAI } from "@google/genai";
import { Subject, Student } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getAttendanceInsights = async (subjects: Subject[], studentName: string): Promise<string> => {
  try {
    const dataContext = subjects.map(s => 
      `${s.name}: ${s.attendedClasses}/${s.totalClasses} attended`
    ).join('\n');

    const prompt = `
      You are a helpful academic counselor at a university.
      Student Name: ${studentName}
      Attendance Data:
      ${dataContext}

      Provide a concise, professional analysis of this attendance.
      If attendance is low (<75%) in any subject, suggest specific improvement steps politely.
      If attendance is high, encourage them to keep it up.
      Keep the tone supportive and realistic. Max 50 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to retrieve insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Service temporarily unavailable.";
  }
};

export const generateParentEmail = async (student: Student, subjects: Subject[]): Promise<string> => {
    try {
        const lowAttendanceSubjects = subjects.filter(s => (s.attendedClasses / s.totalClasses) < 0.75);
        
        if (lowAttendanceSubjects.length === 0) {
            return "No alerts necessary. Student is in good standing.";
        }

        const prompt = `
            Draft a polite, professional email to the parents of ${student.name}.
            The student has low attendance in: ${lowAttendanceSubjects.map(s => s.name).join(', ')}.
            The tone should be concerned but helpful, inviting the parents to discuss how we can support the student.
            Sign off as "Academic Affairs Office".
            Keep it plain text.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Error generating email draft.";
    } catch (error) {
        return "Service temporarily unavailable.";
    }
}