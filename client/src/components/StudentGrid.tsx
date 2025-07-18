import StudentCard from "./StudentCard";
import { Student } from "@/types/dashboard";

interface StudentGridProps {
  students: Student[];
}

export default function StudentGrid({ students }: StudentGridProps) {
  if (students.length === 0) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-lg">No students found</p>
          <p className="text-sm">Students will appear here when monitoring begins</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="grid grid-cols-4 gap-6">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </div>
  );
}
