import { useEffect, useState } from "react";
import { timetableApi } from "../services/timetableAPI";
import { Timetable } from "../services/types";

export const useTimetable = () => {
  const [data, setData] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await timetableApi.getAll();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, fetchData };
};
