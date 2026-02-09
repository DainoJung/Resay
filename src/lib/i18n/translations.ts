export type Language = "ko" | "ja";

export const translations = {
  ko: {
    // Nav
    "nav.history": "기록",

    // Home - status messages
    "status.transcribing": "음성을 텍스트로 변환 중...",
    "status.analyzing": "AI가 피드백을 생성하는 중...",

    // Home - errors
    "error.transcribeFailed": "음성 변환에 실패했습니다. 다시 시도해 주세요.",
    "error.noSpeech": "음성이 인식되지 않았습니다. 더 크고 명확하게 말해 주세요.",
    "error.feedbackFailed": "피드백 생성에 실패했습니다. 다시 시도해 주세요.",
    "error.generic": "오류가 발생했습니다.",

    // Record stop confirmation
    "record.stopConfirmTitle": "음성이 감지되지 않았어요",
    "record.stopConfirmDesc": "녹음된 내용이 없습니다. 녹음을 종료할까요?",
    "record.continueRecording": "계속 녹음",
    "record.stopRecording": "종료",

    // Speaker selector
    "speaker.title": "나는 누구인가요?",
    "speaker.description": "본인의 목소리를 선택하세요",

    // Chat view
    "chat.correctionsCount": "개의 교정이 있어요",
    "chat.perfect": "완벽해요! 교정할 부분이 없습니다.",

    // History
    "history.title": "기록",
    "history.empty.title": "아직 기록이 없어요",
    "history.empty.description": "녹음을 시작하면 여기에 기록이 쌓입니다.",
    "history.noCorrections": "교정할 부분이 없었습니다.",
    "history.tab.calls": "녹음",
    "history.tab.saved": "보관",
    "history.saved.expressions": "표현",
    "history.saved.sentences": "문장",
    "history.saved.empty": "아직 보관한 항목이 없어요",
    "history.detail.expressions": "내게 딱 맞는 원어민 표현",
    "history.detail.callContent": "통화 내용",
    "history.transcriptionFailed": "변환 실패",
    "history.retry": "재시도",
    "history.retrying": "재시도 중...",
    "history.delete": "삭제",
    "history.deleteConfirm": "이 녹음을 삭제할까요?",
    "history.deleteConfirmDesc": "삭제하면 되돌릴 수 없습니다.",
    "history.cancel": "취소",

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
    "settings.targetLanguage": "학습 언어",
    "settings.targetLanguageDescription": "피드백을 받을 언어를 선택하세요",
    "settings.comingSoon": "지원 예정",
    "settings.ttsVoice": "음성",
    "settings.ttsVoiceDescription": "TTS 음성을 선택하세요",
    "settings.ttsStyle": "말하기 스타일",
    "settings.ttsStyleDescription": "TTS 속도와 톤을 조절하세요",
    "settings.ttsStyle.normal": "보통",
    "settings.ttsStyle.slow": "느리게",
    "settings.ttsStyle.fast": "빠르게",
    "settings.ttsStyle.calm": "차분하게",
    "settings.ttsStyle.energetic": "활기차게",
  },
  ja: {
    // Nav
    "nav.history": "履歴",

    // Home - status messages
    "status.transcribing": "音声をテキストに変換中...",
    "status.analyzing": "AIがフィードバックを生成中...",

    // Home - errors
    "error.transcribeFailed": "音声変換に失敗しました。もう一度お試しください。",
    "error.noSpeech": "音声が認識されませんでした。もっとはっきりと話してください。",
    "error.feedbackFailed": "フィードバック生成に失敗しました。もう一度お試しください。",
    "error.generic": "エラーが発生しました。",

    // Record stop confirmation
    "record.stopConfirmTitle": "音声が検出されませんでした",
    "record.stopConfirmDesc": "録音された内容がありません。録音を終了しますか？",
    "record.continueRecording": "録音を続ける",
    "record.stopRecording": "終了",

    // Speaker selector
    "speaker.title": "あなたはどちらですか？",
    "speaker.description": "自分の声を選択してください",

    // Chat view
    "chat.correctionsCount": "件の修正があります",
    "chat.perfect": "完璧です！修正する箇所はありません。",

    // History
    "history.title": "履歴",
    "history.empty.title": "まだ履歴がありません",
    "history.empty.description": "録音を始めると、ここに履歴が蓄積されます。",
    "history.noCorrections": "修正する箇所はありませんでした。",
    "history.tab.calls": "録音",
    "history.tab.saved": "保管",
    "history.saved.expressions": "表現",
    "history.saved.sentences": "文章",
    "history.saved.empty": "まだ保管した項目がありません",
    "history.detail.expressions": "あなたにぴったりのネイティブ表現",
    "history.detail.callContent": "通話内容",
    "history.transcriptionFailed": "変換失敗",
    "history.retry": "再試行",
    "history.retrying": "再試行中...",
    "history.delete": "削除",
    "history.deleteConfirm": "この録音を削除しますか？",
    "history.deleteConfirmDesc": "削除すると元に戻せません。",
    "history.cancel": "キャンセル",

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
    "settings.targetLanguage": "学習言語",
    "settings.targetLanguageDescription": "フィードバックを受ける言語を選択してください",
    "settings.comingSoon": "対応予定",
    "settings.ttsVoice": "音声",
    "settings.ttsVoiceDescription": "TTS音声を選択してください",
    "settings.ttsStyle": "話し方スタイル",
    "settings.ttsStyleDescription": "TTSの速度とトーンを調整してください",
    "settings.ttsStyle.normal": "普通",
    "settings.ttsStyle.slow": "ゆっくり",
    "settings.ttsStyle.fast": "速く",
    "settings.ttsStyle.calm": "穏やかに",
    "settings.ttsStyle.energetic": "元気に",
  },
} as const;

export type TranslationKey = keyof typeof translations.ko;
