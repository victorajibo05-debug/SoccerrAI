import { Router } from 'express'
import { getAllmatchesController, getLivematchesController } from '../controllers/match.controller'

const router = Router()

router.get("/All", getAllmatchesController);

router.get("/Live", getLivematchesController);



export default router;