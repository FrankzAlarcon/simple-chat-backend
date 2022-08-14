import { Router } from "express";
import { GroupService } from "../services/Group.service";
import { MessageService } from "../services/Message.service";

const router = Router();
const messageService = new MessageService();
const groupService =  new GroupService();

router.get('/:userId', async (req, res, next) => {
  const {userId} = req.params;
  const groups = await groupService.getUserGroups(userId);
  res.status(200).json({groups});
})

router.get('/user/:userId/group/:groupId', async (req, res, next) => {
  try {
    const {groupId} = req.params;
    const messages =  await messageService.getGroupMessages(groupId);
    res.status(200).json({messages});
  } catch (error) {
    res.status(400).json({error});
  }
})

export default router;