# 배포 가이드

## 목차
1. [사전 준비](#사전-준비)
2. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
3. [프로덕션 배포](#프로덕션-배포)
4. [환경 변수 설정](#환경-변수-설정)
5. [문제 해결](#문제-해결)

## 사전 준비

### 필수 소프트웨어
- Node.js (v16 이상)
- npm (v8 이상)
- MongoDB (v5 이상)
- Git

### 권장 도구
- PM2 (프로세스 관리)
- Nginx (리버스 프록시)
- Docker (선택사항)

## 로컬 개발 환경 설정

### 1. 저장소 클론
```bash
git clone <repository-url>
cd project
```

### 2. 백엔드 설정

#### 2.1 의존성 설치
```bash
cd server
npm install
```

#### 2.2 환경 변수 설정
`server/.env` 파일 생성:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/talent-sharing
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

#### 2.3 MongoDB 시작
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

#### 2.4 서버 시작
```bash
# 개발 모드 (nodemon)
npm run dev

# 프로덕션 모드
npm start
```

### 3. 프론트엔드 설정

#### 3.1 의존성 설치
```bash
cd client
npm install
```

#### 3.2 환경 변수 설정
`client/.env` 파일 생성:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### 3.3 클라이언트 시작
```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속

## 프로덕션 배포

### 방법 1: 전통적인 서버 배포

#### 1. 서버 준비
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm nginx mongodb

# Node.js v16+ 설치 (필요한 경우)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. 애플리케이션 배포

```bash
# 프로젝트 디렉토리로 이동
cd /var/www/talent-sharing

# 저장소 클론
git clone <repository-url> .

# 백엔드 설정
cd server
npm install --production
```

#### 3. 환경 변수 설정
`server/.env` (프로덕션):
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/talent-sharing
JWT_SECRET=generate-a-very-secure-random-string-here
JWT_EXPIRE=30d
CLIENT_URL=https://yourdomain.com
```

**중요**: JWT_SECRET은 반드시 안전한 랜덤 문자열로 변경하세요!
```bash
# 랜덤 문자열 생성 (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 4. PM2로 서버 실행
```bash
# PM2 전역 설치
sudo npm install -g pm2

# 서버 시작
cd server
pm2 start server.js --name talent-sharing-api

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

#### 5. 프론트엔드 빌드
```bash
cd client
npm install
npm run build
```

#### 6. Nginx 설정

`/etc/nginx/sites-available/talent-sharing`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 프론트엔드 (React 빌드)
    location / {
        root /var/www/talent-sharing/client/build;
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 업로드된 파일
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

심볼릭 링크 생성 및 Nginx 재시작:
```bash
sudo ln -s /etc/nginx/sites-available/talent-sharing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. SSL 인증서 (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 방법 2: Docker 배포

#### 1. Dockerfile 생성

`server/Dockerfile`:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

`client/Dockerfile`:
```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongodb:27017/talent-sharing
      - JWT_SECRET=${JWT_SECRET}
      - CLIENT_URL=https://yourdomain.com
    depends_on:
      - mongodb
    volumes:
      - ./server/uploads:/app/uploads

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

#### 3. Docker 실행
```bash
# .env 파일 생성
echo "JWT_SECRET=$(openssl rand -hex 64)" > .env

# 컨테이너 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

## 환경 변수 설정

### 백엔드 환경 변수

| 변수명 | 필수 | 기본값 | 설명 |
|--------|------|--------|------|
| NODE_ENV | ✓ | development | 실행 환경 (development/production) |
| PORT | ✓ | 5000 | 서버 포트 |
| MONGO_URI | ✓ | - | MongoDB 연결 문자열 |
| JWT_SECRET | ✓ | - | JWT 토큰 시크릿 키 |
| JWT_EXPIRE | | 30d | JWT 토큰 만료 시간 |
| CLIENT_URL | ✓ | - | 프론트엔드 URL (CORS) |

### 프론트엔드 환경 변수

| 변수명 | 필수 | 기본값 | 설명 |
|--------|------|--------|------|
| REACT_APP_API_URL | ✓ | - | 백엔드 API URL |

## 데이터베이스 관리

### MongoDB 백업
```bash
# 백업
mongodump --db talent-sharing --out /backup/$(date +%Y%m%d)

# 복원
mongorestore --db talent-sharing /backup/20240101/talent-sharing
```

### 인덱스 생성
MongoDB에 접속하여 인덱스 확인:
```javascript
use talent-sharing

// 인덱스 확인
db.notifications.getIndexes()
db.reviews.getIndexes()
db.talents.getIndexes()

// 필요시 수동 인덱스 생성 (모델에 정의되어 있으므로 일반적으로 불필요)
```

## 보안 체크리스트

### 백엔드
- [ ] JWT_SECRET을 안전한 랜덤 문자열로 변경
- [ ] MongoDB 인증 활성화
- [ ] 파일 업로드 크기 제한 확인 (5MB)
- [ ] CORS 설정 확인 (CLIENT_URL)
- [ ] Rate limiting 추가 고려
- [ ] Helmet.js 추가 고려

### 프론트엔드
- [ ] API URL을 환경 변수로 관리
- [ ] 민감한 정보 하드코딩 제거
- [ ] HTTPS 사용

### 인프라
- [ ] 방화벽 설정 (필요한 포트만 개방)
- [ ] SSL/TLS 인증서 설치
- [ ] 정기적인 백업 설정
- [ ] 로그 모니터링 설정

## PM2 명령어

```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs talent-sharing-api

# 재시작
pm2 restart talent-sharing-api

# 중지
pm2 stop talent-sharing-api

# 삭제
pm2 delete talent-sharing-api

# 모니터링
pm2 monit
```

## 문제 해결

### 이미지 업로드 실패
1. `server/uploads` 디렉토리 권한 확인
   ```bash
   chmod 755 server/uploads
   ```

2. Nginx 설정에서 `client_max_body_size` 확인
   ```nginx
   client_max_body_size 10M;
   ```

### MongoDB 연결 실패
1. MongoDB 실행 확인
   ```bash
   sudo systemctl status mongod
   ```

2. 방화벽 확인 (원격 MongoDB 사용 시)
   ```bash
   sudo ufw allow 27017
   ```

### CORS 에러
- `server/.env`에서 `CLIENT_URL` 확인
- 프로덕션에서는 실제 도메인 사용

### 프론트엔드 빌드 에러
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
npm cache clean --force
```

## 성능 최적화

### 1. Nginx 캐싱
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. MongoDB 연결 풀
`server/config/db.js`:
```javascript
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 5
});
```

### 3. Gzip 압축 (Nginx)
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
```

## 모니터링

### PM2 모니터링
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 로그 관리
```bash
# 애플리케이션 로그
tail -f /var/log/pm2/talent-sharing-api-error.log

# Nginx 로그
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 업데이트 절차

```bash
# 1. 코드 업데이트
git pull origin main

# 2. 의존성 업데이트 (필요시)
cd server && npm install
cd ../client && npm install

# 3. 프론트엔드 재빌드
cd client
npm run build

# 4. 백엔드 재시작
pm2 restart talent-sharing-api

# 5. Nginx 재시작 (필요시)
sudo systemctl reload nginx
```

## 지원

문제가 발생하면:
1. 로그 확인 (`pm2 logs`, nginx 로그)
2. GitHub Issues 확인
3. 문서 재확인

---

**마지막 업데이트**: 2024년
