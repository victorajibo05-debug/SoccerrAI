import { Router } from 'express'
import { getAllmatchesController, getLivematchesController, getMatchesbydateController, getAllTeamsController, getTeamMatchesController  } from '../controllers/match.controller'

const router = Router()

router.get("/All", getAllmatchesController);

router.get("/Live", getLivematchesController);

router.get("/ByDate", getMatchesbydateController);

router.get("/Teams", getAllTeamsController);

router.get("/Teams/:teamId/Matches", getTeamMatchesController);

export default router;