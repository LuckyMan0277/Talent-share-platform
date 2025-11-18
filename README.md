# 재능기부 매칭 플랫폼

사람들이 자신의 재능을 나누고 다른 사람의 재능을 배울 수 있는 재능기부 매칭 플랫폼입니다.

## 프로젝트 개요

무료 재능 공유를 통한 사회 기여와 서로 배우고 가르치는 커뮤니티를 형성하는 것을 목표로 합니다.

## 기술 스택

### Frontend
- React 18
- React Router v6
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt
- Multer (파일 업로드)

## 프로젝트 구조

```
project/
├── client/                 # Frontend React 앱
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── server/                 # Backend Node.js 앱
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── .claude/               # Claude Code 에이전트
    └── agents/
```

## 설치 및 실행

### 사전 요구사항

- Node.js (v14 이상)
- MongoDB (로컬 또는 MongoDB Atlas)

### Backend 설정

1. server 디렉토리로 이동
```bash
cd server
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일에서 다음 항목을 설정하세요:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/talent-sharing
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

4. 서버 실행
```bash
npm run dev
```

서버는 http://localhost:5000 에서 실행됩니다.

### Frontend 설정

1. client 디렉토리로 이동
```bash
cd client
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일에서 다음 항목을 설정하세요:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. 앱 실행
```bash
npm start
```

React 앱은 http://localhost:3000 에서 실행됩니다.

## 주요 기능

### 1. 사용자 인증
- 회원가입
- 로그인/로그아웃
- JWT 기반 인증

### 2. 재능 관리
- 재능 등록 (제목, 설명, 카테고리, 일정)
- 재능 목록 조회
- 재능 상세 정보
- 재능 수정/삭제
- 카테고리별 필터링
- 검색 기능

### 3. 수업 신청
- 가능한 일정 조회
- 수업 신청
- 신청 취소
- 신청 현황 확인

### 4. 마이페이지
- 내가 등록한 재능 목록
- 내가 신청한 수업 목록
- 내 재능에 신청한 사람 목록
- 프로필 수정 (이름, 비밀번호, 프로필 이미지)
- 리뷰 작성 (확정된 예약)

### 5. 이미지 업로드
- 프로필 이미지 업로드 및 표시
- 재능 대표 이미지 업로드
- 이미지 미리보기
- 파일 크기 및 타입 검증 (5MB, 이미지 파일)

### 6. 알림 시스템
- 실시간 알림 (30초 폴링)
- 수업 신청/취소 시 알림
- 리뷰 등록 시 알림
- 읽음/읽지 않음 상태 관리
- Navigation에 알림 벨 및 개수 표시

### 7. 리뷰/평가 시스템
- 별점 평가 (1-5점)
- 리뷰 작성/수정/삭제
- 평균 평점 계산 및 표시
- 재능별 리뷰 목록
- 중복 리뷰 방지

### 8. UI/UX 개선
- 로딩 스피너 (모든 페이지)
- 토스트 알림 시스템 (성공/실패 메시지)
- 개선된 에러 메시지
- 반응형 디자인
- 모달 다이얼로그

## API 엔드포인트

### 인증 (Auth)
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/logout` - 로그아웃

### 재능 (Talents)
- `GET /api/talents` - 재능 목록 조회
- `GET /api/talents/:id` - 재능 상세 조회
- `POST /api/talents` - 재능 등록 (인증 필요)
- `PUT /api/talents/:id` - 재능 수정 (인증 필요)
- `DELETE /api/talents/:id` - 재능 삭제 (인증 필요)
- `GET /api/talents/:id/schedules` - 재능의 일정 조회
- `POST /api/talents/:id/schedules` - 일정 추가 (인증 필요)

### 예약 (Bookings)
- `GET /api/bookings` - 내 예약 목록 (인증 필요)
- `GET /api/bookings/:id` - 예약 상세 (인증 필요)
- `POST /api/bookings` - 예약 생성 (인증 필요)
- `PUT /api/bookings/:id` - 예약 상태 변경 (인증 필요)
- `DELETE /api/bookings/:id` - 예약 취소 (인증 필요)

### 사용자 (Users)
- `GET /api/users/my-talents` - 내가 등록한 재능 (인증 필요)
- `GET /api/users/my-bookings` - 내가 신청한 수업 (인증 필요)
- `GET /api/users/received-bookings` - 내 재능에 신청한 사람들 (인증 필요)
- `PUT /api/users/profile` - 프로필 수정 (인증 필요, multipart/form-data)

### 알림 (Notifications)
- `GET /api/notifications` - 알림 목록 (인증 필요)
- `GET /api/notifications/unread-count` - 읽지 않은 알림 개수 (인증 필요)
- `PUT /api/notifications/:id/read` - 알림 읽음 표시 (인증 필요)
- `PUT /api/notifications/read-all` - 모든 알림 읽음 표시 (인증 필요)
- `DELETE /api/notifications/:id` - 알림 삭제 (인증 필요)

### 리뷰 (Reviews)
- `POST /api/reviews` - 리뷰 작성 (인증 필요)
- `GET /api/reviews/talent/:talentId` - 재능별 리뷰 조회
- `GET /api/reviews/provider/:providerId` - 제공자별 리뷰 조회
- `GET /api/reviews/my-reviews` - 내가 작성한 리뷰 (인증 필요)
- `PUT /api/reviews/:id` - 리뷰 수정 (인증 필요)
- `DELETE /api/reviews/:id` - 리뷰 삭제 (인증 필요)
- `GET /api/reviews/can-review/:bookingId` - 리뷰 작성 가능 여부 (인증 필요)

## 데이터 모델

### User
- name: 이름
- email: 이메일 (고유)
- password: 비밀번호 (해시)

### Talent
- userId: 등록한 사용자
- title: 제목
- description: 설명
- category: 카테고리
- location: 장소
- isOnline: 온라인 여부
- maxParticipants: 최대 인원

### Schedule
- talentId: 재능 ID
- date: 날짜
- startTime: 시작 시간
- endTime: 종료 시간
- currentParticipants: 현재 신청 인원

### Booking
- userId: 신청한 사용자
- talentId: 재능 ID
- scheduleId: 일정 ID
- status: 상태 (confirmed, cancelled)

## 개발 상태

### Phase 1: 기본 구조 ✅
- [x] 프로젝트 초기 설정
- [x] 데이터베이스 스키마 설계
- [x] 기본 API 구조 (CRUD)
- [x] 간단한 UI 프레임워크

### Phase 2: 핵심 기능 ✅
- [x] 사용자 인증 구현
  - [x] 회원가입/로그인 페이지
  - [x] JWT 인증
  - [x] AuthContext로 전역 상태 관리
- [x] 재능 등록 기능
  - [x] 재능 등록 폼
  - [x] 다중 일정 추가
  - [x] 온라인/오프라인 선택
- [x] 재능 목록 조회
  - [x] 카드 형식 목록
  - [x] 카테고리 필터
  - [x] 온라인/오프라인 필터
  - [x] 검색 기능
- [x] 수업 신청 기능
  - [x] 일정별 신청
  - [x] 신청 취소
  - [x] 마이페이지에서 관리

### Phase 3: 개선 및 테스트 ✅
- [x] UI/UX 개선
  - [x] 로딩 스피너 컴포넌트
  - [x] 토스트 알림 시스템
  - [x] 개선된 에러 메시지
- [x] 재능 수정 기능
  - [x] TalentEditPage 생성
  - [x] 소유자 확인
  - [x] 수정 버튼 추가
- [x] 프로필 수정 기능
  - [x] ProfileEditPage 생성
  - [x] 이름 수정
  - [x] 비밀번호 변경
  - [x] 프로필 수정 버튼 추가
- [ ] 이미지 업로드 (Phase 4로 이월)
- [ ] 버그 수정
- [ ] 테스트
- [ ] 배포 준비

## 라이센스

MIT

## 기여

이 프로젝트는 사회문제 해결을 위한 재능기부 플랫폼입니다.
