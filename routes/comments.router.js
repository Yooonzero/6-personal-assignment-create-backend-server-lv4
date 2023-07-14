const express = require('express');
const router = express.Router();
const { Posts, Comments } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware.js');

// 댓글 작성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const { userId } = res.locals.user;

    try {
        // 해당하는 게시글이 없는 경우
        const post = await Posts.findOne({ where: { postId } });
        if (!post) {
            return res.status(404).json({ errorMessage: '존재하지 않는 게시글입니다.' });
        }

        // 댓글 형식 확인
        if (content.length < 1) {
            return res.status(412).json({ errorMessage: '댓글 내용을 입력해주세요' });
        }

        // 댓글 생성
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
router.get('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const post = await Posts.findOne({ where: { postId } });
    const comments = await Comments.findAll({ where: { PostId: postId } });

    try {
        // 해당 게시글이 존재하지 않는 경우
        if (!post) {
            return res.status(404).json({ errorMessage: '존재하지 않는 게시글입니다.' });
        }
        // 댓글이 존재하지 않는 경우
        if (!comments) {
            return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
        }
        // 댓글 조회
        const postComments = await comments.map((comment) => comment);
        return res.status(200).json({ message: postComments });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '댓글 목록 조회에 실패하였습니다.' });
    }
});

// 댓글 수정
// - 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 수정 가능
// - 댓글 내용을 비워둔 채 댓글 수정 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// - 댓글 내용을 입력하고 댓글 수정 API를 호출한 경우 작성한 댓글을 수정하기
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    try {
        await Comments.update({ content }, { where: { commentId } });
        return res.status(200).json({ message: '댓글 수정에 성공하였습니다.' });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
    }
});

// 댓글 삭제
// - 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 삭제 가능
// - 원하는 댓글을 삭제하기
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    try {
        await Comments.destroy({ where: { commentId } });
        return res.status(200).json({ message: '성공적으로 댓글을 삭제하였습니다.' });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
    }
});

module.exports = router;
