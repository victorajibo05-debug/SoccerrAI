import type { Request, Response } from 'express';
import { getAllmatches, getLivematches} from '../services/match.service';

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

