const express = require('express');
const router = express.Router();
const { Comments, Posts } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 댓글 작성, 조회, 수정, 삭제

// 댓글 작성
// - 로그인 토큰을 검사하여, 유효한 토큰일 경우에만 댓글 작성 가능
// - 댓글 내용을 비워둔 채 댓글 작성 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// - 댓글 내용을 입력하고 댓글 작성 API를 호출한 경우 작성한 댓글을 추가하기
router.post('/comments/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const { userId } = res.locals.user;

    // 댓글 내용을 비워두었을 때
    try {
        // if (!content) {
        //     return res.status(412).json({ errorMessage: '댓글 내용을 입력해주세요' });
        // }
        await Comments.create({ UserId: userId, PostId: postId, content });
        return res.status(200).json({ message: '댓글 작성에 성공하였습니다' });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '댓글 작성에 실패하였습니다.' });
    }
});

// 댓글 조회
// - 로그인 토큰을 전달하지 않아도 댓글 목록 조회가 가능하도록 하기
// - 조회하는 게시글에 작성된 모든 댓글을 목록 형식으로 볼 수 있도록 하기
// - 작성 날짜 기준으로 내림차순 정렬하기
router.get('/comments/:postId', async (req, res) => {
    const { postId } = req.params;
    const comments = await Comments.findAll({ where: { PostId: postId } });
    try {
        const postComments = await comments.map((comment) => comment);
        return res.status(200).json({ message: postComments });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '댓글 목록 조회에 실패하였습니다.' });
    }
});

module.exports = router;
