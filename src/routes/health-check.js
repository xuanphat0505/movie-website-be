import express from 'express';
const router = express.Router();

import { healthCheck } from '../app/Controllers/HealthCheck.js';

router.get('/', healthCheck);

export default router;
