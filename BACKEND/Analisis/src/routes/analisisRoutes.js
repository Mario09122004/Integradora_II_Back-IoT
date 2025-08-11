import express from "express";
import { getAllAnalysis, saveAnalysis, deleteAnalysis, updateAnalisys, getAnalysisById, getAnalysisByName } from './../controllers/analisisControler.js'

const router = express.Router();

router.get('/', getAllAnalysis);
router.post('/', saveAnalysis);
router.delete('/:analisysId', deleteAnalysis);
router.put('/:analisysId', updateAnalisys);
router.get('/search/:analisysId', getAnalysisById);
router.get('/search/name/:analisysName', getAnalysisByName)

export default router;