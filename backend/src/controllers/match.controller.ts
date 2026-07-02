import type { Request, Response } from 'express';
import { getAllmatches, getLivematches, getMatchesbydate, getAllTeams, getTeamMatches } from '../services/match.service';

export const getAllmatchesController = async (req: Request, res: Response) => {
    try {
        const matches = await getAllmatches()
        res.status(200).json(matches)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch matches' })
    }
};

export const getLivematchesController = async (req: Request, res: Response) => {
    try {
        const matches = await getLivematches()
        res.status(200).json(matches)
    } catch (error) {
        res.status(500).json({ error: 'Failed to get live matches' })
    }
};

export const getMatchesbydateController = async (req: Request, res: Response) => {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }
    const data = await getMatchesbydate(date);
    res.json(data);
};

export const getAllTeamsController = async (req: Request, res: Response) => {
    try {
        const teams = await getAllTeams();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
};

export const getTeamMatchesController = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        if (!teamId) {
            return res.status(400).json({ error: 'teamId is required' });
        }
        const data = await getTeamMatches(teamId as any);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team matches' });
    }
};