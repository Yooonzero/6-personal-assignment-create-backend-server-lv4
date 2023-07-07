const express = require('express');
const router = express.Router();
const { Comments } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 댓글 작성, 조회, 수정, 삭제

router.post('/comments/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const user = res.locals.user;

    // 로그인 했을 때.

    try {
        await Comments.create({ where: { content } });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '댓글 작성에 실패하였습니다.' });
    }
});

module.exports = router;
