# 재능기부 매칭 플랫폼 - 서브 에이전트 정의

## 개요
프로젝트를 효율적으로 개발하기 위한 전문화된 서브 에이전트들의 역할과 책임을 정의합니다.

---

## 1. Frontend Agent (프론트엔드 에이전트)

### 책임
- React 컴포넌트 개발
- UI/UX 구현
- 상태 관리 (React Hooks, Context API)
- 라우팅 설정
- API 연동
- 반응형 디자인

### 주요 작업
- 페이지 컴포넌트 작성
- 재사용 가능한 UI 컴포넌트 개발
- CSS/스타일링
- 폼 validation
- 클라이언트 사이드 로직

### 기술 스택
- React
- React Router
- Axios
- CSS/Tailwind CSS/Material-UI

---

## 2. Backend Agent (백엔드 에이전트)

### 책임
- RESTful API 설계 및 구현
- 비즈니스 로직 처리
- 데이터베이스 연동
- 인증/인가 구현
- 에러 핸들링
- API 문서화

### 주요 작업
- Express 라우터 설정
- 컨트롤러 작성
- 미들웨어 구현
- API 엔드포인트 개발
- 보안 처리

### 기술 스택
- Node.js
- Express.js
- JWT
- bcrypt

---

## 3. Database Agent (데이터베이스 에이전트)

### 책임
- 데이터베이스 스키마 설계
- 모델 정의
- 쿼리 최적화
- 데이터 마이그레이션
- 인덱싱

### 주요 작업
- 스키마 설계 및 구현
- ORM/ODM 설정 (Mongoose/Sequelize)
- 데이터베이스 관계 설정
- 쿼리 작성
- 데이터 검증 규칙

### 기술 스택
- MongoDB + Mongoose 또는
- PostgreSQL + Sequelize

---

## 4. Auth Agent (인증/인가 에이전트)

### 책임
- 사용자 인증 시스템
- 세션/토큰 관리
- 비밀번호 암호화
- 접근 권한 제어
- 보안 정책 구현

### 주요 작업
- 회원가입/로그인 로직
- JWT 토큰 발급 및 검증
- 비밀번호 해싱
- Protected Route 구현
- 인증 미들웨어

### 기술 스택
- JWT
- bcrypt
- Express middleware

---

## 5. API Integration Agent (API 통합 에이전트)

### 책임
- Frontend-Backend 연동
- API 클라이언트 구현
- 에러 처리
- 로딩 상태 관리
- 데이터 캐싱

### 주요 작업
- Axios 인스턴스 설정
- API 호출 함수 작성
- 응답 데이터 처리
- 에러 핸들링
- 인터셉터 구현

### 기술 스택
- Axios
- React Hooks (useState, useEffect)

---

## 6. Testing Agent (테스팅 에이전트)

### 책임
- 단위 테스트 작성
- 통합 테스트
- API 테스트
- E2E 테스트
- 버그 검증

### 주요 작업
- 테스트 케이스 작성
- 모킹 데이터 준비
- 테스트 실행 및 리포트
- 테스트 커버리지 확인

### 기술 스택
- Jest
- React Testing Library
- Supertest (API 테스트)

---

## 7. DevOps Agent (데브옵스 에이전트)

### 책임
- 개발 환경 설정
- 배포 파이프라인
- 환경 변수 관리
- CI/CD 구성
- 서버 설정

### 주요 작업
- 프로젝트 초기 설정
- 빌드 스크립트 작성
- 배포 설정
- 환경 분리 (dev/prod)

### 기술 스택
- npm/yarn
- Git
- Vercel/Netlify (Frontend)
- Render/Railway (Backend)

---

## 8. UI/UX Agent (UI/UX 에이전트)

### 책임
- 디자인 시스템 구축
- 사용자 경험 최적화
- 반응형 레이아웃
- 접근성 향상
- 인터랙션 디자인

### 주요 작업
- 컴포넌트 디자인
- 색상/타이포그래피 시스템
- 레이아웃 구성
- 모바일 최적화
- 사용성 개선

### 기술 스택
- CSS/SCSS
- Tailwind CSS
- Figma (디자인 참고)

---

## 9. Data Validation Agent (데이터 검증 에이전트)

### 책임
- 입력 데이터 검증
- 폼 유효성 검사
- 데이터 정규화
- 보안 취약점 방지

### 주요 작업
- Frontend 폼 validation
- Backend 데이터 검증
- 스키마 validation
- XSS/SQL Injection 방지

### 기술 스택
- Joi/Yup (Backend validation)
- React Hook Form (Frontend)
- express-validator

---

## 10. Feature Agent (기능 개발 에이전트)

### 책임
- 특정 기능 end-to-end 구현
- Feature별 통합
- 비즈니스 로직 구현

### 주요 기능별 에이전트
- **Talent Registration Agent**: 재능 등록 기능
- **Talent Listing Agent**: 재능 목록 조회 기능
- **Booking Agent**: 수업 신청 기능
- **User Profile Agent**: 마이페이지 기능
- **Schedule Management Agent**: 일정 관리 기능

### 주요 작업
- Full-stack 기능 구현
- Frontend + Backend + Database 통합
- 기능 테스트

---

## 에이전트 협업 워크플로우

### 신규 기능 개발 시
```
1. Feature Agent: 요구사항 분석
2. Database Agent: 데이터 모델 설계
3. Backend Agent: API 개발
4. Frontend Agent: UI 구현
5. API Integration Agent: 연동
6. Testing Agent: 테스트
7. DevOps Agent: 배포
```

### 버그 수정 시
```
1. Testing Agent: 버그 재현 및 분석
2. 해당 영역 Agent: 수정 작업
3. Testing Agent: 검증
```

### 리팩토링 시
```
1. Code Review Agent: 코드 분석
2. 해당 영역 Agent: 리팩토링
3. Testing Agent: 회귀 테스트
```

---

## 에이전트 간 인터페이스

### API 계약
- Backend Agent → Frontend Agent: API 명세서 (Swagger/OpenAPI)
- Database Agent → Backend Agent: 스키마 정의 및 모델

### 데이터 포맷
- JSON for API communication
- 표준화된 에러 응답 형식
- 일관된 네이밍 컨벤션

### 문서화
- 각 에이전트는 자신의 작업을 문서화
- API 문서
- 컴포넌트 사용 가이드
- 데이터베이스 스키마 문서

---

## 프로젝트 단계별 에이전트 활용

### Phase 1: 초기 설정
- DevOps Agent: 프로젝트 구조 생성
- Database Agent: 스키마 설계

### Phase 2: 인증 시스템
- Auth Agent: 인증 로직
- Backend Agent: API
- Frontend Agent: 로그인/회원가입 UI

### Phase 3: 재능 등록
- Feature Agent (Talent Registration)
- Database Agent: Talent, Schedule 모델
- Backend Agent: API
- Frontend Agent: 등록 폼

### Phase 4: 재능 목록 및 신청
- Feature Agent (Talent Listing & Booking)
- Backend Agent: 조회/필터링 API
- Frontend Agent: 목록 UI, 신청 UI

### Phase 5: 마이페이지
- Feature Agent (User Profile)
- Backend Agent: 사용자 데이터 API
- Frontend Agent: 마이페이지 UI

### Phase 6: 테스트 및 배포
- Testing Agent: 전체 테스트
- DevOps Agent: 배포 설정

---

## 에이전트 우선순위

### High Priority (필수)
1. Frontend Agent
2. Backend Agent
3. Database Agent
4. Auth Agent
5. DevOps Agent

### Medium Priority (중요)
6. API Integration Agent
7. Feature Agents
8. Data Validation Agent

### Low Priority (선택적)
9. Testing Agent
10. UI/UX Agent (기본적인 UI는 Frontend Agent가 처리)

---

## 에이전트 활용 가이드

### 단일 에이전트 작업
간단한 작업이나 특정 영역에 국한된 작업

### 다중 에이전트 협업
복잡한 기능이나 full-stack 작업이 필요한 경우

### 에이전트 간 커뮤니케이션
- 명확한 인터페이스 정의
- 문서화된 API 계약
- 정기적인 통합 테스트

---

## 다음 단계

1. **프로젝트 초기화**: DevOps Agent 활용
2. **데이터베이스 설계**: Database Agent 활용
3. **인증 시스템 구축**: Auth Agent + Backend Agent + Frontend Agent
4. **핵심 기능 개발**: Feature Agents 순차적 활용
