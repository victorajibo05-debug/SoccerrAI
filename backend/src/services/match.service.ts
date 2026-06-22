import axios from 'axios';
import { CONFIG } from "../config/env"
import NodeCache from 'node-cache';

const headers = {
    'x-apisports-key': CONFIG.API_KEY,
    'x-apisports-host': CONFIG.API_HOST,
};

const BASE = CONFIG.BASE_URL;

const cache = new NodeCache({ stdTTL: 120 });

async function getCached<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached) {
        return cached;
    }

    const fresh = await fetchFn();
    cache.set(key, fresh);
    return fresh;
}


const handleError = (error: any, message: string) => {
    if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data}`);
    }
    throw new Error(message);
};

export const getAllmatches = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        return await getCached(`all-matches-${today}`, async () => {
            const response = await axios.get<any>(`${BASE}/fixtures?date=${today}`, { headers });
            return response.data;
        });
    } catch (error) {
        handleError(error, 'Failed to fetch matches');
    }
};

export const getLivematches = async () => {
    try {
        return await getCached('live-matches', async () => {
            const response = await axios.get<any>(`${BASE}/fixtures?live=all`, { headers });
            return response.data;
        });
    } catch (error) {
        handleError(error, 'Failed to fetch live matches');
    }
};

