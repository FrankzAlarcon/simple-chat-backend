import { Router } from "express";
import { MessageService } from "../services/Message.service";

const router = Router();
const messageService = new MessageService();


router.get('/from/:senderId/to/:receiverId', async (req, res, next) => {
  try {
    const {receiverId, senderId} = req.params;    
    const data =  await messageService.getMessagesWithUser(senderId, receiverId);
    res.status(200).json({data});
  } catch (error) {
    
  }
})

export default router;