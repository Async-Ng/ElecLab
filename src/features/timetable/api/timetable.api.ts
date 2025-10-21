export async function updateTimetable(id: string, data: any) {
  const res = await fetch(`https://6879244663f24f1fdca10af4.mockapi.io/schedule/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}