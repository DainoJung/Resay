# Resay - MVP

## 한 줄 정의
**실제 영어 대화를 녹음하고, "이렇게 말했으면 더 좋았을 텐데"를 알려주는 앱**

---

## 핵심 플로우

```
[🎙️ 녹음] → [STT] → [AI 피드백] → [히스토리 저장]
```

---

## 피드백 포맷

| 항목 | 예시 |
|------|------|
| 원문 | I don't have any plan. |
| Paraphrase | I don't have any plans. |
| 설명 | "any" 뒤엔 복수 명사 사용 |

---

## MVP 기능

- [x] 녹음 버튼 (시작/정지)
- [x] 발화 → STT → AI 피드백
- [x] 피드백 카드 UI
- [x] 히스토리 저장/조회

---

## 제외 (v2)

- 로그인 (익명 사용)
- VAD 자동 감지
- Conversation 그룹핑
- 다국어 설정

---

## 스택

```
Frontend: Next.js 14 + Tailwind
Backend:  Supabase (DB + Storage)
AI:       AssemblyAI (STT) + Gemini 3 Flash (피드백)
```

---

## 검증할 것

> 사람들이 실제 대화를 녹음해서 발화별 피드백을 받는 것에 가치를 느끼는가?
