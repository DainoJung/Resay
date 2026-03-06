# Resay

> AI 기반 영어 회화 피드백 서비스 — 실제 대화를 녹음하고, AI가 문장별 교정과 원어민 표현을 알려줍니다.

Resay는 영어 학습자가 실제 대화를 녹음하면, AI가 문장 단위로 교정 피드백을 제공하고, 원어민이 자주 쓰는 표현을 추천하며, 4가지 영역의 숙련도를 평가해주는 웹 애플리케이션입니다.

---

## 주요 기능

### 녹음 & 분석
- 브라우저 기반 실시간 녹음 (1회 최대 5분, 하루 최대 10분)
- 최소 10초 이상 녹음 필수
- 다중 화자 감지 및 화자 선택 (내 발화만 분석)

### AI 피드백
- **문장별 교정**: 각 발화에 대한 자연스러운 영어 표현으로 교정
- **원어민 표현 추천**: 대화에서 추출한 3~5개의 네이티브 표현 학습
- **숙련도 평가**: 문법, 어휘, 유창성, 자연스러움 4개 항목 점수 리포트
- **세션 타이틀 자동 생성**: AI가 대화 내용을 요약한 제목 생성

### 학습 관리
- 연속 학습 스트릭 추적
- 주간 녹음 통계 시각화
- 피드백 & 표현 북마크 저장
- 전체 세션 히스토리 검색 및 관리

### 다국어 지원
- UI 언어: 한국어, 일본어, 중국어
- 학습 대상 언어: 영어 (일본어, 중국어 추후 지원 예정)

### 기타
- 이메일 기반 Passwordless OTP 로그인
- TTS 음성 미리듣기 (7종 음성, 5종 스타일)
- 실패한 전사 세션 재시도
- PWA 스타일 모바일 최적화 UI

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 14.2.35 | App Router 기반 풀스택 프레임워크 |
| **React** | 18 | UI 라이브러리 |
| **TypeScript** | 5 | 정적 타입 시스템 |
| **Tailwind CSS** | 3.4.1 | 유틸리티 기반 스타일링 |
| **React Icons** | 5.5.0 | 아이콘 컴포넌트 |

### Backend & AI
| 기술 | 용도 |
|------|------|
| **Next.js API Routes** | 서버리스 API 엔드포인트 |
| **Google Gemini AI** (`@google/genai`) | 문장 교정, 표현 추출, 숙련도 평가, TTS 음성 생성 |
| **AssemblyAI** | 음성 → 텍스트 전사 (Speaker Diarization 지원) |

### Infrastructure
| 기술 | 용도 |
|------|------|
| **Supabase** | PostgreSQL 데이터베이스 + Auth (OTP) + Storage (오디오 파일) |
| **Vercel** | 배포 플랫폼 |

---

## 프로젝트 구조

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # 홈 (녹음 인터페이스)
│   ├── history/page.tsx        # 학습 기록
│   ├── login/page.tsx          # OTP 로그인
│   ├── onboarding/page.tsx     # 온보딩 (4단계)
│   ├── settings/page.tsx       # 설정
│   ├── api/                    # API 라우트
│   │   ├── transcribe/         # 음성 전사 (AssemblyAI)
│   │   ├── feedback/           # AI 피드백 생성 (Gemini)
│   │   ├── tts/                # 텍스트 → 음성 변환
│   │   ├── retry/              # 실패 세션 재시도
│   │   ├── session/            # 세션 삭제
│   │   ├── bookmark/           # 북마크 토글
│   │   └── audio/              # 오디오 다운로드
│   └── auth/callback/          # OAuth 콜백
├── components/                 # React 컴포넌트
│   ├── RecordButton.tsx        # 녹음 버튼
│   ├── RecordingStatus.tsx     # 녹음 중 타이머
│   ├── SpeakerSelector.tsx     # 화자 선택 UI
│   ├── ChatView.tsx            # 피드백 대화 뷰
│   ├── AudioPlayer.tsx         # 오디오 재생기
│   ├── ProcessingScreen.tsx    # 로딩 화면
│   └── history/                # 히스토리 상세 컴포넌트
│       ├── SessionReport.tsx   # 숙련도 점수 표시
│       ├── ExpressionCarousel  # 표현 캐러셀
│       ├── SentenceCard.tsx    # 피드백 카드
│       └── SavedView.tsx       # 북마크 모음
├── lib/                        # 유틸리티 & 서비스
│   ├── supabase.ts             # Supabase 클라이언트
│   ├── supabase-server.ts      # Supabase 서버 (Admin)
│   ├── assemblyai.ts           # AssemblyAI 연동
│   ├── gemini.ts               # Gemini AI 피드백 로직
│   ├── auth/                   # 인증 관련
│   └── i18n/                   # 다국어 (ko, ja, zh)
├── hooks/                      # 커스텀 훅
│   ├── useAudioRecorder.ts     # 브라우저 녹음
│   └── useStudyStats.ts        # 학습 통계
├── types/index.ts              # TypeScript 타입 정의
└── middleware.ts                # 인증 미들웨어
```

---

## 데이터베이스 스키마

### sessions
세션(녹음) 정보와 숙련도 평가 점수를 저장합니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | 사용자 FK |
| `transcript` | TEXT | 전체 전사 텍스트 |
| `audio_url` | TEXT | 오디오 저장 경로 |
| `utterances` | JSON | 화자별 발화 데이터 |
| `my_speaker` | TEXT | 학습자 화자 라벨 |
| `title` | TEXT | AI 생성 세션 제목 |
| `duration` | INTEGER | 녹음 시간 (초) |
| `status` | TEXT | completed / transcription_failed |
| `grammar_score` | INTEGER | 문법 점수 (0-100) |
| `vocabulary_score` | INTEGER | 어휘 점수 (0-100) |
| `fluency_score` | INTEGER | 유창성 점수 (0-100) |
| `naturalness_score` | INTEGER | 자연스러움 점수 (0-100) |
| `overall_score` | INTEGER | 종합 점수 (0-100) |

### feedbacks
문장별 AI 교정 피드백을 저장합니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID | Primary Key |
| `session_id` | UUID | 세션 FK |
| `original` | TEXT | 사용자 원문 |
| `paraphrase` | TEXT | AI 교정 문장 |
| `explanation` | TEXT | 모국어 설명 |
| `is_perfect` | BOOLEAN | 교정 불필요 여부 |
| `saved` | BOOLEAN | 북마크 여부 |

### expressions
원어민 표현 추천 데이터를 저장합니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID | Primary Key |
| `session_id` | UUID | 세션 FK |
| `keyword` | TEXT | 표현 (e.g., "come in handy") |
| `meaning` | TEXT | 모국어 의미 설명 |
| `example` | TEXT | 예문 |
| `highlight_word` | TEXT | 강조 단어 |
| `saved` | BOOLEAN | 북마크 여부 |

### profiles
사용자 프로필 및 설정을 저장합니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID | auth.users FK |
| `native_language` | TEXT | 모국어 |
| `learning_language` | TEXT | 학습 언어 |
| `display_name` | TEXT | 표시 이름 |
| `onboarding_completed` | BOOLEAN | 온보딩 완료 여부 |
| `tts_voice` | TEXT | TTS 음성 설정 |
| `tts_style` | TEXT | TTS 스타일 설정 |

---

## API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/transcribe` | POST | 오디오 업로드 및 전사 (AssemblyAI) |
| `/api/feedback` | POST | AI 피드백 및 표현 생성 (Gemini) |
| `/api/tts` | POST | 텍스트 → 음성 변환 (Gemini TTS) |
| `/api/retry` | POST | 실패한 전사 세션 재시도 |
| `/api/session` | DELETE | 세션 및 관련 데이터 삭제 |
| `/api/bookmark` | POST | 피드백/표현 북마크 토글 |
| `/api/audio` | GET | 저장된 오디오 파일 다운로드 |

---

## AI 모델 상세

### Google Gemini
- **피드백 생성**: `gemini-3-flash-preview` — 문장 교정, 표현 추출, 숙련도 평가, 세션 타이틀 생성
- **TTS 생성**: `gemini-2.5-flash-preview-tts` — 텍스트를 WAV 오디오로 변환 (24kHz, 16-bit, mono)
- **음성 옵션**: Zephyr, Puck, Charon 등 7종 / normal, slow, fast, calm, energetic 5종 스타일

### AssemblyAI
- **음성 전사**: `universal-3-pro`, `universal-2` 모델
- **Speaker Diarization**: 다중 화자 자동 분리
- **폴링 기반**: 비동기 전사 후 결과 폴링

---

## 시작하기

### 사전 요구사항
- Node.js 18+
- npm

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

---

## 배포

Vercel에서 바로 배포할 수 있습니다. Next.js App Router를 사용하므로 별도 설정 없이 자동 감지됩니다.

---

## 라이선스

Private — All rights reserved.
