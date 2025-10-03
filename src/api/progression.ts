import axios from "axios";

export const saveProgression = async (email: string, progression: any) => {
  const res = await axios.post("http://localhost:8000/api/progression/save", {
    email,
    progression,
  });
  return res.data;
};

export const getProgression = async (email: string) => {
  const res = await axios.get(`http://localhost:8000/api/progression/${email}`);
  return res.data;
};
