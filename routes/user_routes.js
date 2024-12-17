const express = require('express');
const User = require('../models/users'); // 데이터 스키마 가져오기

const router = express.Router();

// 회원가입 라우트
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const newUser = new User({ name, email, password });
        await newUser.save(); // MongoDB에 저장
        console.log('MongoDB 저장 성공');
        res.status(201).json({ message: '회원가입 성공', user: newUser });
    } catch (error) {
        console.error('회원가입 실패:', error);
        res.status(400).json({ message: '회원가입 실패', error: error.message });
    }
});

module.exports = router;
