import express from "express";
import {
  getAllService,
  getServiceById,
} from "../controllers/service.controller.js";

const router = express.Router();

router.get(`/`, getAllService);
router.get(`/:id`, getServiceById);

export default router;
