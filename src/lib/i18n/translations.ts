export type Language = "ko" | "ja" | "zh";

export const translations = {
  ko: {
    // Nav
    "nav.history": "기록",

    // Home - study stats
    "stats.streak": "일 연속 학습 중",
    "stats.weeklyMinutes": "이번 주 {m}분 녹음",
    "stats.weeklyNoRecord": "이번 주 첫 녹음을 해보세요!",

    // Home - status messages
    "status.transcribing": "음성을 텍스트로 변환 중...",
    "status.analyzing": "AI가 피드백을 생성하는 중...",

    // Home - errors
    "error.transcribeFailed": "음성 변환에 실패했습니다. 다시 시도해 주세요.",
    "error.noSpeech": "음성이 인식되지 않았습니다. 더 크고 명확하게 말해 주세요.",
    "error.feedbackFailed": "피드백 생성에 실패했습니다. 다시 시도해 주세요.",
    "error.generic": "오류가 발생했습니다.",

    // Record stop confirmation
    "record.stopConfirmTitle": "녹음이 너무 짧아요",
    "record.stopConfirmDesc": "10초 이상 녹음해야 저장할 수 있어요.",
    "record.continueRecording": "계속 녹음",
    "record.stopRecording": "종료",
    "record.dailyLimitReached": "오늘 녹음 가능 시간(10분)을 모두 사용했어요.",

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
    "history.detail.callContent": "녹음 내용",
    "history.transcriptionFailed": "변환 실패",
    "history.retry": "재시도",
    "history.retrying": "재시도 중...",
    "history.delete": "삭제",
    "history.deleteConfirm": "이 녹음을 삭제할까요?",
    "history.deleteConfirmDesc": "삭제하면 되돌릴 수 없습니다.",
    "history.cancel": "취소",

    // Session Report
    "report.title": "영어 실력 리포트",
    "report.grammar": "문법",
    "report.vocabulary": "어휘력",
    "report.fluency": "유창성",
    "report.naturalness": "자연스러움",
    "report.excellent": "Excellent",
    "report.good": "Good",
    "report.fair": "Fair",
    "report.keepTrying": "Keep trying",
    "report.needsPractice": "Needs practice",

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

    // Settings - Account
    "settings.account": "계정",
    "settings.accountDescription": "로그인 정보 및 계정 관리",
    "settings.logout": "로그아웃",
    "settings.logoutConfirm": "로그아웃 하시겠습니까?",
    "settings.logoutConfirmDesc": "다시 로그인하려면 이메일 인증이 필요합니다.",
    "settings.cancel": "취소",
  },
  ja: {
    // Nav
    "nav.history": "履歴",

    // Home - study stats
    "stats.streak": "日連続学習中",
    "stats.weeklyMinutes": "今週 {m}分録音",
    "stats.weeklyNoRecord": "今週の最初の録音をしてみましょう！",

    // Home - status messages
    "status.transcribing": "音声をテキストに変換中...",
    "status.analyzing": "AIがフィードバックを生成中...",

    // Home - errors
    "error.transcribeFailed": "音声変換に失敗しました。もう一度お試しください。",
    "error.noSpeech": "音声が認識されませんでした。もっとはっきりと話してください。",
    "error.feedbackFailed": "フィードバック生成に失敗しました。もう一度お試しください。",
    "error.generic": "エラーが発生しました。",

    // Record stop confirmation
    "record.stopConfirmTitle": "録音が短すぎます",
    "record.stopConfirmDesc": "10秒以上録音しないと保存できません。",
    "record.continueRecording": "録音を続ける",
    "record.stopRecording": "終了",
    "record.dailyLimitReached": "今日の録音可能時間（10分）を使い切りました。",

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
    "history.detail.callContent": "録音内容",
    "history.transcriptionFailed": "変換失敗",
    "history.retry": "再試行",
    "history.retrying": "再試行中...",
    "history.delete": "削除",
    "history.deleteConfirm": "この録音を削除しますか？",
    "history.deleteConfirmDesc": "削除すると元に戻せません。",
    "history.cancel": "キャンセル",

    // Session Report
    "report.title": "英語力レポート",
    "report.grammar": "文法",
    "report.vocabulary": "語彙力",
    "report.fluency": "流暢さ",
    "report.naturalness": "自然さ",
    "report.excellent": "Excellent",
    "report.good": "Good",
    "report.fair": "Fair",
    "report.keepTrying": "Keep trying",
    "report.needsPractice": "Needs practice",

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

    // Settings - Account
    "settings.account": "アカウント",
    "settings.accountDescription": "ログイン情報とアカウント管理",
    "settings.logout": "ログアウト",
    "settings.logoutConfirm": "ログアウトしますか？",
    "settings.logoutConfirmDesc": "再度ログインするにはメール認証が必要です。",
    "settings.cancel": "キャンセル",
  },
  zh: {
    // Nav
    "nav.history": "记录",

    // Home - study stats
    "stats.streak": "天连续学习中",
    "stats.weeklyMinutes": "本周录音 {m}分钟",
    "stats.weeklyNoRecord": "来录下本周的第一段吧！",

    // Home - status messages
    "status.transcribing": "正在将语音转换为文字...",
    "status.analyzing": "AI正在生成反馈...",

    // Home - errors
    "error.transcribeFailed": "语音转换失败，请重试。",
    "error.noSpeech": "未检测到语音，请说得更大声、更清晰。",
    "error.feedbackFailed": "反馈生成失败，请重试。",
    "error.generic": "发生错误。",

    // Record stop confirmation
    "record.stopConfirmTitle": "录音太短了",
    "record.stopConfirmDesc": "需要录音10秒以上才能保存。",
    "record.continueRecording": "继续录音",
    "record.stopRecording": "结束",
    "record.dailyLimitReached": "今天的录音时间（10分钟）已用完。",

    // Speaker selector
    "speaker.title": "你是哪一位？",
    "speaker.description": "请选择你的声音",

    // Chat view
    "chat.correctionsCount": "处需要纠正",
    "chat.perfect": "太棒了！没有需要纠正的地方。",

    // History
    "history.title": "记录",
    "history.empty.title": "还没有记录",
    "history.empty.description": "开始录音后，记录会在这里显示。",
    "history.noCorrections": "没有需要纠正的地方。",
    "history.tab.calls": "录音",
    "history.tab.saved": "收藏",
    "history.saved.expressions": "表达",
    "history.saved.sentences": "句子",
    "history.saved.empty": "还没有收藏的内容",
    "history.detail.expressions": "为你量身定制的地道表达",
    "history.detail.callContent": "录音内容",
    "history.transcriptionFailed": "转换失败",
    "history.retry": "重试",
    "history.retrying": "重试中...",
    "history.delete": "删除",
    "history.deleteConfirm": "要删除这段录音吗？",
    "history.deleteConfirmDesc": "删除后将无法恢复。",
    "history.cancel": "取消",

    // Session Report
    "report.title": "英语水平报告",
    "report.grammar": "语法",
    "report.vocabulary": "词汇量",
    "report.fluency": "流利度",
    "report.naturalness": "自然度",
    "report.excellent": "Excellent",
    "report.good": "Good",
    "report.fair": "Fair",
    "report.keepTrying": "Keep trying",
    "report.needsPractice": "Needs practice",

    // Audio recorder errors
    "recorder.error": "录音时发生错误。",
    "recorder.permissionDenied": "需要麦克风权限，请在浏览器设置中允许。",
    "recorder.unavailable": "无法使用麦克风。",

    // Settings
    "settings.title": "设置",
    "settings.name": "名字",
    "settings.nameDescription": "显示在主页上的名字",
    "settings.namePlaceholder": "请输入名字",
    "settings.language": "语言",
    "settings.languageDescription": "选择应用显示语言",
    "settings.targetLanguage": "学习语言",
    "settings.targetLanguageDescription": "选择你想获得反馈的语言",
    "settings.comingSoon": "即将推出",
    "settings.ttsVoice": "语音",
    "settings.ttsVoiceDescription": "选择TTS语音",
    "settings.ttsStyle": "说话风格",
    "settings.ttsStyleDescription": "调整TTS的速度和语调",
    "settings.ttsStyle.normal": "正常",
    "settings.ttsStyle.slow": "慢速",
    "settings.ttsStyle.fast": "快速",
    "settings.ttsStyle.calm": "平静",
    "settings.ttsStyle.energetic": "活力",

    // Settings - Account
    "settings.account": "账户",
    "settings.accountDescription": "登录信息和账户管理",
    "settings.logout": "退出登录",
    "settings.logoutConfirm": "确定要退出登录吗？",
    "settings.logoutConfirmDesc": "重新登录需要邮箱验证。",
    "settings.cancel": "取消",
  },
} as const;

export type TranslationKey = keyof typeof translations.ko;
