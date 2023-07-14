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
router.get('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const post = await Posts.findOne({ where: { postId } });
    const comments = await Comments.findAll({
        where: { PostId: postId },
        // 댓글 내림차순 정렬
        order: [['createdAt', 'DESC']],
    });

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
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const { userId } = res.locals.user;
    const post = await Posts.findOne({ where: { postId } });
    const comments = await Comments.findOne({ where: { commentId } });

    try {
        // 게시글 존재 확인
        if (!post) {
            return res.status(404).json({ errorMessage: '해당하는 게시글이 존재하지 않습니다.' });
        }

        // 댓글 존재 확인
        if (!comments) {
            return res.status(404).json({ errorMessage: '해당하는 댓글이 존재하지 않습니다.' });
        }

        // 댓글 수정권한 확인
        if (comments.UserId !== userId) {
            return res.status(403).json({ errorMessage: '댓글 수정권한이 없습니다.' });
        }

        // 댓글 내용 형식 확인
        if (content.length < 1) {
            return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
        }

        // 댓글 수정
        await Comments.update({ content }, { where: { commentId } }).catch((err) => {
            console.log(err);
            res.status(400).json({ errorMessage: '댓글 수정이 정상적으로 처리되지 않았습니다.' });
        });
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
