import api from "./api";

export const fetchQuestions = async () => {
  const resultats = await api.post("/questions/start");
  return resultats.data;
};

export const submitQuestionsResultats = async () => {
  const resultats = await api.post("/questions/submit");
  return resultats.data;
};