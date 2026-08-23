import express from "express";
import {
  getAllServices,
  getServiceSlots,
  getServiceById,
} from "../controllers/service.controller.js";

const router = express.Router();

router.get(`/`, getAllServices);
router.get(`/:id`, getServiceById);
router.get(`/:id/slots`, getServiceSlots);

export default router;
