export type Language = "ko" | "ja";

export const translations = {
  ko: {
    // App
    "app.subtitle": "영어를 더 자연스럽게",
    "home.partnerName": "Tomo",

    // Nav
    "nav.record": "녹음",
    "nav.history": "기록",
    "nav.settings": "설정",

    // Home - status messages
    "status.transcribing": "음성을 텍스트로 변환 중...",
    "status.analyzing": "AI가 피드백을 생성하는 중...",

    // Home - errors & actions
    "error.transcribeFailed": "음성 변환 실패",
    "error.feedbackFailed": "피드백 생성 실패",
    "error.generic": "오류가 발생했습니다.",
    "action.recordAgain": "다시 녹음하기",

    // Home - empty state
    "empty.title": "영어로 말해보세요",
    "empty.description": "녹음 버튼을 누르고 영어로 말한 뒤, AI 피드백을 받아보세요.",

    // Speaker selector
    "speaker.title": "나는 누구인가요?",
    "speaker.description": "본인의 목소리를 선택하세요",

    // Chat view
    "chat.correctionsCount": "개의 교정이 있어요",
    "chat.perfect": "완벽해요! 교정할 부분이 없습니다.",

    // Feedback categories
    "category.grammar": "문법",
    "category.vocabulary": "어휘",
    "category.expression": "표현",
    "category.pronunciation": "발음",

    // Feedback card
    "feedback.original": "원문",
    "feedback.correction": "교정",

    // Feedback list
    "feedbackList.myWords": "내가 말한 내용",
    "feedbackList.perfect": "완벽해요!",
    "feedbackList.nothingToFix": "교정할 부분이 없습니다.",
    "feedbackList.count": "개의 피드백",


    // History
    "history.title": "기록",
    "history.subtitle": "지난 피드백을 다시 확인하세요",
    "history.empty.title": "아직 기록이 없어요",
    "history.empty.description": "녹음을 시작하면 여기에 기록이 쌓입니다.",
    "history.feedbackCount": "개 피드백",
    "history.perfect": "완벽!",
    "history.noCorrections": "교정할 부분이 없었습니다.",
    "history.tab.calls": "녹음",
    "history.tab.saved": "보관",
    "history.saved.expressions": "표현",
    "history.saved.sentences": "문장",
    "history.saved.empty": "아직 보관한 항목이 없어요",
    "history.card.practice": "연습",
    "history.card.bookmark": "보관",
    "history.detail.expressions": "내게 딱 맞는 원어민 표현",
    "history.detail.callContent": "통화 내용",

    // Audio recorder errors
    "recorder.error": "녹음 중 오류가 발생했습니다.",
    "recorder.permissionDenied": "마이크 사용 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.",
    "recorder.unavailable": "마이크를 사용할 수 없습니다.",

    // Settings
    "settings.title": "설정",
    "settings.name": "이름",
    "settings.nameDescription": "홈 화면에 표시되는 이름",
    "settings.namePlaceholder": "이름을 입력하세요",
    "settings.language": "언어",
    "settings.languageDescription": "앱 표시 언어를 선택하세요",
  },
  ja: {
    // App
    "app.subtitle": "英語をもっと自然に",
    "home.partnerName": "Tomo",

    // Nav
    "nav.record": "録音",
    "nav.history": "履歴",
    "nav.settings": "設定",

    // Home - status messages
    "status.transcribing": "音声をテキストに変換中...",
    "status.analyzing": "AIがフィードバックを生成中...",

    // Home - errors & actions
    "error.transcribeFailed": "音声変換に失敗しました",
    "error.feedbackFailed": "フィードバック生成に失敗しました",
    "error.generic": "エラーが発生しました。",
    "action.recordAgain": "もう一度録音する",

    // Home - empty state
    "empty.title": "英語で話してみましょう",
    "empty.description": "録音ボタンを押して英語で話した後、AIフィードバックを受けましょう。",

    // Speaker selector
    "speaker.title": "あなたはどちらですか？",
    "speaker.description": "自分の声を選択してください",

    // Chat view
    "chat.correctionsCount": "件の修正があります",
    "chat.perfect": "完璧です！修正する箇所はありません。",

    // Feedback categories
    "category.grammar": "文法",
    "category.vocabulary": "語彙",
    "category.expression": "表現",
    "category.pronunciation": "発音",

    // Feedback card
    "feedback.original": "原文",
    "feedback.correction": "修正",

    // Feedback list
    "feedbackList.myWords": "自分が話した内容",
    "feedbackList.perfect": "完璧です！",
    "feedbackList.nothingToFix": "修正する箇所はありません。",
    "feedbackList.count": "件のフィードバック",

    // History
    "history.title": "履歴",
    "history.subtitle": "過去のフィードバックを確認しましょう",
    "history.empty.title": "まだ履歴がありません",
    "history.empty.description": "録音を始めると、ここに履歴が蓄積されます。",
    "history.feedbackCount": "件のフィードバック",
    "history.perfect": "完璧！",
    "history.noCorrections": "修正する箇所はありませんでした。",
    "history.tab.calls": "録音",
    "history.tab.saved": "保管",
    "history.saved.expressions": "表現",
    "history.saved.sentences": "文章",
    "history.saved.empty": "まだ保管した項目がありません",
    "history.card.practice": "練習",
    "history.card.bookmark": "保管",
    "history.detail.expressions": "あなたにぴったりのネイティブ表現",
    "history.detail.callContent": "通話内容",

    // Audio recorder errors
    "recorder.error": "録音中にエラーが発生しました。",
    "recorder.permissionDenied": "マイクの使用許可が必要です。ブラウザの設定で許可してください。",
    "recorder.unavailable": "マイクを使用できません。",

    // Settings
    "settings.title": "設定",
    "settings.name": "名前",
    "settings.nameDescription": "ホーム画面に表示される名前",
    "settings.namePlaceholder": "名前を入力してください",
    "settings.language": "言語",
    "settings.languageDescription": "アプリの表示言語を選択してください",
  },
} as const;

export type TranslationKey = keyof typeof translations.ko;
