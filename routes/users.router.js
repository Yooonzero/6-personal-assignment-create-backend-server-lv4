const express = require('express');
const router = express.Router();
const { Users } = require('../models');
const jwt = require('jsonwebtoken');

// 회원가입 API
router.post('/signup', async (req, res) => {
    console.log(Users);
    const { nickname, email, password, confirm } = req.body;
    try {
        const confirmedNickname = /^[a-zA-Z0-9]{3,}$/.test(nickname);
        if (!confirmedNickname) {
            res.status(412).json({
                errorMessage: '닉네임의 형식이 올바르지 않습니다.',
            });
            return;
        }

        // 닉네임 중복 확인
        const existNickname = await Users.findOne({ where: { nickname } });
        if (existNickname) {
            return res.status(412).json({
                errorMessage: '이미 존재하는 닉네임 입니다.',
            });
        }

        //패스워드 길이 확인 : 4자이상
        if (password.length < 4) {
            res.status(412).json({
                errorMessage: '패스워드의 형식이 올바르지 않습니다.',
            });
            return;
        }

        //패스워드의 값이 닉네임과 동일하지는 않는지 확인
        // if (password.includes(...nickname)) // 한 글자라도 포함되어 있다면, 사용하지 못하게 하는 코드.
        if (password.includes(nickname)) {
            res.status(412).json({
                errorMessage: '패스워드에 닉네임이 포함되어있습니다.',
            });
            return;
        }

        // 패스워드 확인
        if (password !== confirm) {
            res.status(412).json({
                errorMessage: '패스워드가 일치하지 않습니다.',
            });
            return;
        }

        // 회원가입
        const user = new Users({ nickname, email, password });
        await user.save();

        res.status(201).json({ message: '회원가입을 축하드립니다.' });
    } catch (err) {
        console.log(err);
        console.log(err.message);
        res.status(400).json({ errorMessage: '요청하신 데이터 형식이 올바르지 않습니다.' });
        return;
    }
});

// 로그인 API
router.post('/login', async (req, res) => {
    const { nickname, password } = req.body; // body에 입력값을 받고,
    try {
        const user = await Users.findOne({ nickname }); // DB에서 입력한 nickname을 가진 user를 찾아 변수에 할당하고,

        // DB에 해당하는 nickname이 없거나, 사용자의 password가 일치하지 않는경우.
        if (!nickname || password !== user.password) {
            res.status(412).json({ errorMessage: '회원 정보가 일치하지 않습니다.' }); // 해당 오류메시지 출력.
            return;
        }

        // jwt 생성
        const token = jwt.sign({ userId: user.userId }, 'customized-secret-key');

        // 쿠키 생성
        res.cookie('Authorization', `Bearer ${token}`); // Authorization이라는 이름의 bearer타입의 토큰 생성.
        res.status(200).json({ token });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
    }
});

module.exports = router;
