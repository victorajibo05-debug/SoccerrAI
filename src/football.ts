import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const getMatchesByDate = (date: string) =>
    api.get(`/ByDate`, { params: { date } });

export const getAllTeams = () =>
    api.get('/Teams');

export const getTeamMatches = (teamId: number) =>
    api.get(`/Teams/${teamId}/Matches`);