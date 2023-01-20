const router = require('express').Router();
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const authMiddleware = require('../middlewares/authMiddleware');

// new - message
router.post('/new-message', authMiddleware, async (req, res) => {
    try {
        // store message in DB
        const newMessage = new Message(req.body);
        const savedMessage = await newMessage.save();

        // update last message of chat
        await Chat.findOneAndUpdate(
            { _id: req.body.chat },
            {
                lastMessage: savedMessage._id,
                $inc: {
                    unreadMessages: 1
                }
            }
        );

        res.send({
            success: true,
            message: 'Message send successfully.',
            data: savedMessage
        });

    } catch (error) {
        res.send({
            success: false,
            message: 'Error sanding message.',
            data: error.message,
        })
    }
});

// get-all-messages
router.get('/get-all-messages/:chatId', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            chat: req.params.chatId
        }).sort({ createdAt: 1 });

        res.send({
            success: true,
            message: 'Message fetched successfully...!',
            data: messages,
        });

    } catch (error) {
        res.send({
            success: false,
            message: 'Failed to fetching messages',
            data: error.messages,
        });
    }
});

module.exports = router;