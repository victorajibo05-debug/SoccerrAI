import axios from 'axios';
import NodeCache from 'node-cache';
import { CONFIG } from "../config/env"

const headers = {
    'X-Auth-Token': CONFIG.API_KEY,
};

const BASE = 'https://api.football-data.org/v4';

// Cache responses for 2 minutes to stay well under the 10 requests/minute limit
const cache = new NodeCache({ stdTTL: 120 });

const handleError = (error: any, message: string) => {
    if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(message);
};

async function getCached<T>(key: string, fetchFn: () => Promise<T>, ttl: number = 120): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached) {
        return cached;
    }
    const fresh = await fetchFn();
    cache.set(key, fresh, ttl);
    return fresh;
}

export const getAllmatches = async () => {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 5);

        const dateFrom = today.toISOString().split('T')[0];
        const dateTo = tomorrow.toISOString().split('T')[0];

        return await getCached(`all-matches-${dateFrom}`, async () => {
            const response = await axios.get<any>(`${BASE}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, { headers });
            return response.data;
        });
    } catch (error) {
        handleError(error, 'Failed to fetch matches');
    }
};

export const getLivematches = async () => {
    try {
        return await getCached('live-matches', async () => {
            const response = await axios.get<any>(`${BASE}/matches?status=LIVE`, { headers });
            return response.data;
        });
    } catch (error) {
        handleError(error, 'Failed to fetch live matches');
    }
};

export const getPremierleague = async (competitionCode: string = 'PL') => {
    try {
        return await getCached(`competition-${competitionCode}`, async () => {
            const response = await axios.get<any>(`${BASE}/competitions/${competitionCode}/matches`, { headers });
            return response.data;
        });
    } catch (error) {
        handleError(error, 'Failed to fetch competition matches');
    }
};

export const getMatchDetails = async (matchId: any) => {
    try {
        return await getCached(`match-details-${matchId}`, async () => {
            const response = await axios.get<any>(`${BASE}/matches/${matchId}`, { headers });
            return response.data;
        });
    } catch (error) {
        handleError(error, 'Failed to fetch match details');
    }
};

export const getMatchesbydate = async (date: string) => {
    try {
        const dateObj = new Date(date);
        const nextDay = new Date(dateObj);
        nextDay.setDate(dateObj.getDate() + 1);
        const dateTo = dateObj.toISOString().split('T')[0];

        return await getCached(`matches-by-date-${dateTo}`, async () => {
            const response = await axios.get<any>(`${BASE}/matches?dateFrom=${dateTo}&dateTo=${nextDay.toISOString().split('T')[0]}`, { headers });
            return response.data;
        });
    } catch (error) {
        handleError(error, 'Failed to fetch matches by date');
    }

}


// Competition codes for all 12 free-tier competitions
const FREE_COMPETITIONS = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL', 'ELC', 'DED', 'PPL', 'BSA', 'WC', 'EC'];

export const getAllTeams = async () => {
    try {
        return await getCached('all-teams', async () => {
            const requests = FREE_COMPETITIONS.map((code) =>
                axios.get<any>(`${BASE}/competitions/${code}/teams`, { headers })
                    .then((res) => ({
                        competition: code,
                        teams: res.data.teams || [],
                    }))
                    .catch(() => ({ competition: code, teams: [] }))
            );

            const results = await Promise.all(requests);

            const teams: any[] = [];
            results.forEach(({ competition, teams: competitionTeams }) => {
                competitionTeams.forEach((team: any) => {
                    if (!teams.find((t) => t.id === team.id)) {
                        teams.push({
                            id: team.id,
                            name: team.name,
                            shortName: team.shortName,
                            crest: team.crest,
                            competition,
                        });
                    }
                });
            });

            return teams;
        }, 3600);
    } catch (error) {
        handleError(error, 'Failed to fetch teams');
    }
};

export const getTeamMatches = async (teamId: string) => {
    try {
        return await getCached(`team-matches-${teamId}`, async () => {
            const today = new Date().toISOString().split('T')[0];
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 60);
            const futureDateStr = futureDate.toISOString().split('T')[0];

            const response = await axios.get<any>(
                `${BASE}/teams/${teamId}/matches?dateFrom=${today}&dateTo=${futureDateStr}&status=SCHEDULED,TIMED,IN_PLAY`,
                { headers }
            );
            return response.data;
        }, 300);
    } catch (error) {
        handleError(error, 'Failed to fetch team matches');
    }
};