import { Timetable } from "../services/types";
import TimetableForm from "./TimetableForm";

interface Props {
  data: Timetable[];
}

export default function TimetableTable({ data }: Props) {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
          <div className="font-semibold">
            {item.date} - {item.subject} ({item.className})
          </div>
          <TimetableForm timetable={item} />
        </div>
      ))}
    </div>
  );
}
