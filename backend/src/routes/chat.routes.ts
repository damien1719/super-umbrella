import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

export const chatRouter = Router();

// GET conversation messages for a given bilan
chatRouter.get('/conversations/:bilanId/messages', ChatController.listMessages);

// POST a message and get assistant reply
chatRouter.post('/messages', ChatController.sendMessage);

