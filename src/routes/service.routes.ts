import express from "express";
import { getAllService } from "../controllers/service.controller.js";

const router = express.Router();

router.get(`/`, getAllService);

export default router;
