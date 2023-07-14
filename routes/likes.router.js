const express = require('express');
const router = express.Router();
const { Posts, Likes } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');

// 게시글 좋아요 API
// - 게시글 목록 조회시 글의 좋아요 갯수도 같이 표출하기
router.put('/posts/:postId/likes', authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const post = await Posts.findOne({ where: { postId } });
    const like = await Likes.findAll({ where: { UserId: userId } });

    try {
        // 게시글이 존재하지 않는경우
        if (!post) {
            return res.status(404).json({ errorMessage: '해당하는 게시글이 존재하지 않습니다.' });
        }

        // 좋아요 취소
        if (like.length) {
            await Likes.destroy({ where: { UserId: userId } }).catch((err) => {
                console.log(err);
                return res.status(400).json({ errorMessage: '좋아요 취소가 정상적으로 처리되지 않았습니다.' });
            });
            return res.status(200).json({ message: '좋아요 취소가 정상적으로 완료되었습니다.' });
        }

        // 좋아요 등록
        await Likes.create({ PostId: postId, UserId: userId });
        return res.status(200).json({ message: '좋아요 등록에 성공하였습니다.' });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '좋아요 등록에 실패하였습니다.' });
    }
});

// 좋아요 게시글 조회 API
// - 로그인 토큰을 검사하여, 유효한 토큰일 경우에만 좋아요 게시글 조회 가능
// - 로그인 토큰에 해당하는 사용자가 좋아요 한 글에 한해서, 조회할 수 있게 하기
// - 제목, 작성자명(nickname), 작성 날짜, 좋아요 갯수를 조회하기
// - 제일 좋아요가 많은 게시글을 맨 위에 정렬하기 (내림차순)
// router.get('/posts/likes', authMiddleware, async (req, res) => {});

module.exports = router;
