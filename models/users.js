const mongoose = require('mongoose');

// 사용자 스키마 정의
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },       // 필수값, 문자열
    email: { type: String, required: true, unique: true }, // 필수값, 고유값
    password: { type: String, required: true },   // 필수값, 문자열
    createdAt: { type: Date, default: Date.now }, // 기본값: 현재 시간
    score1: { type: String, default: null },      // 숫자, 기본값: null
    score2: { type: String, default: null },      // 숫자, 기본값: null
    score3: { type: String, default: null },      // 숫자, 기본값: null
    score4: { type: String, default: null },      // 숫자, 기본값: null
    score5: { type: String, default: null },      // 숫자, 기본값: null
    score6: { type: String, default: null },      // 숫자, 기본값: null
    score7: { type: String, default: null },
    totalScore: { type: Number, default: 0 },       // 숫자, 기본값: null
});

// Mongoose 모델 생성 및 내보내기
const User = mongoose.model('User', userSchema);
module.exports = User;
