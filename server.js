console.log('서버 시작 중...');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

// Express 앱 초기화
const app = express();

// MongoDB 연결
console.log('MongoDB 연결 시도 중...');
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB 연결 성공'))
    .catch((err) => console.error('MongoDB 연결 실패:', err));

// User 스키마 및 모델 정의
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    score1: { type: Number, default: 0 },
    score2: { type: Number, default: 0 },
    score3: { type: Number, default: 0 },
    score4: { type: Number, default: 0 },
    score5: { type: Number, default: 0 },
    score6: { type: Number, default: 0 },
    score7: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
});
const User = mongoose.model('User', userSchema);

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'yourSecretKey',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

// 정적 파일 제공
app.use(express.static(path.join(__dirname)));

// 로그인 상태 확인 미들웨어
function requireLogin(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.status(401).json({ message: '로그인이 필요합니다.' });
    }
}

// 라우트
app.get('/', (req, res) => {
    res.redirect(req.session.user ? '/afterlogin/main_log.html' : '/main.html');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// 회원가입 라우트
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).send('회원가입 성공');
    } catch (err) {
        console.error('회원가입 실패:', err);
        if (err.code === 11000) {
            res.status(400).send('중복된 이메일입니다.');
        } else {
            res.status(500).send('회원가입 실패');
        }
    }
});

// 로그인 라우트
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }

        req.session.user = { id: user._id, name: user.name, email: user.email };
        res.status(200).json({ message: `환영합니다, ${user.name}님!` });
    } catch (err) {
        console.error('로그인 실패:', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 로그아웃 라우트
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('로그아웃 실패:', err);
            return res.status(500).send('로그아웃 실패');
        }
        res.redirect('/main.html');
    });
});

// 사용자 데이터 가져오기 라우트
app.get('/getUserData', requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const totalScore =
            user.score1 +
            user.score2 +
            user.score3 +
            user.score4 +
            user.score5 +
            user.score6 +
            user.score7;

        res.status(200).json({
            name: user.name,
            email: user.email,
            totalScore,
        });
    } catch (err) {
        console.error('사용자 데이터 조회 실패:', err);
        res.status(500).json({ message: '데이터 조회 중 오류가 발생했습니다.' });
    }
});

// 점수 저장 라우트
app.post('/submitScore', requireLogin, async (req, res) => {
    const { problemId, score } = req.body;

    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 문제별 점수 업데이트
        if (user[`score${problemId}`] === 0) {
            user[`score${problemId}`] = score;
            user.totalScore += score;
            await user.save();
        }

        res.status(200).json({ totalScore: user.totalScore, message: '점수가 저장되었습니다.' });
    } catch (err) {
        console.error('점수 저장 실패:', err);
        res.status(500).json({ message: '점수 저장 중 오류가 발생했습니다.' });
    }
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
