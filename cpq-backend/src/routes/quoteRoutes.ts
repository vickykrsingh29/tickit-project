import { Router } from "express";
import {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  getQuoteByRefNo,
  updateQuoteByRefNo,
  downloadQuotePDF,
  approveQuote
} from "../controllers/quoteController";
import { checkJwt } from "../middlewares/auth";

const router = Router();

router.use(checkJwt);
router.post("/", createQuote);
router.get("/", getAllQuotes);
router.get('/ref/:refNo', getQuoteByRefNo);
router.put('/ref/:refNo', updateQuoteByRefNo);
router.get('/download/:refNo', downloadQuotePDF);
router.get("/:id", getQuoteById);
router.put("/:id", updateQuote);
router.delete("/", deleteQuote);
router.post('/approve/:refNo', approveQuote);

export default router;