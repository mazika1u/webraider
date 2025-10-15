const logEl = document.getElementById('log');
const x_super_properties = 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiaGFzX2NsaWVudF9tb2RzIjpmYWxzZSwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzNC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTM0LjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjM4NDg4NywiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=';

function appendLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logEl.textContent += '\n' + timestamp + ' | ' + message;
    logEl.scrollTop = logEl.scrollHeight;
}

function clearLog() {
    logEl.textContent = '';
}

let shouldStopSpam = false;
let messageContent = '';
let lastPollMessageIds = new Map();

const tokensInput = document.getElementById('tokens');
const guildInput = document.getElementById('guildId');
const channelInput = document.getElementById('channelIds');
const messageFileInput = document.getElementById('messageFile');
const messageTextInput = document.getElementById('messageText');
const randomizeCheckbox = document.getElementById('randomize');
const allmentionCheckbox = document.getElementById('allmention');
const delayInput = document.getElementById('delay');
const limitInput = document.getElementById('limit');
const mentionInput = document.getElementById('mentionIds');
const pollTitleInput = document.getElementById('pollTitle');
const pollAnswersInput = document.getElementById('pollAnswers');
const autoFillBtn = document.getElementById('autoFillChannels');
const fetchMentionsBtn = document.getElementById('fetchMentions');
const submitBtn = document.getElementById('submitBtn');
const stopBtn = document.getElementById('stopSpam');
const leaveBtn = document.getElementById('leaveBtn');
const autoVoteBtn = document.getElementById('autoVoteBtn');
const form = document.getElementById('form');

// 言語オプションのチェックボックス
const addArabicCheckbox = document.getElementById('addArabic');
const addJapaneseCheckbox = document.getElementById('addJapanese');
const addKoreanCheckbox = document.getElementById('addKorean');
const addChineseCheckbox = document.getElementById('addChinese');

// 自動投票オプション
const autoVoteCheckbox = document.getElementById('autoVote');
const voteDelayInput = document.getElementById('voteDelay');

// ランダムテキストのサンプルデータ
const randomTexts = {
    arabic: [
        "مرحبا بالعالم",
        "كيف حالك اليوم؟",
        "هذا نص عربي عشوائي",
        "التقنية تتطور بسرعة",
        "الطبيعة جميلة ورائعة",
        "الشمس تشرق من الشرق",
        "الحياة مليئة بالمفاجآت",
        "التعلم مستمر مدى الحياة",
        "الصداقة كنز ثمين",
        "السفر يوسع الآفاق"
    ],
    japanese: [
        "こんにちは、世界",
        "今日はどうですか？",
        "これはランダムな日本語のテキストです",
        "テクノロジーは急速に進化しています",
        "自然は美しく素晴らしい",
        "太陽は東から昇ります",
        "人生は驚きに満ちています",
        "学習は生涯続くプロセスです",
        "友情は貴重な宝物です",
        "旅行は視野を広げます"
    ],
    korean: [
        "안녕하세요, 세계",
        "오늘 어떠세요?",
        "이것은 무작위 한국어 텍스트입니다",
        "기술은 빠르게 발전하고 있습니다",
        "자연은 아름답고 훌륭합니다",
        "태양은 동쪽에서 떠오릅니다",
        "인생은 놀라움으로 가득합니다",
        "학습은 평생 지속되는 과정입니다",
        "우정은 소중한 보물입니다",
        "여행은 시야를 넓힙니다"
    ],
    chinese: [
        "你好，世界",
        "你今天怎么样？",
        "这是随机的中文文本",
        "技术正在快速发展",
        "自然美丽而奇妙",
        "太阳从东方升起",
        "生活充满惊喜",
        "学习是终身的过程",
        "友谊是珍贵的财富",
        "旅行开阔视野"
    ]
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseList(input) {
    const items = input.split(/[\s,]+/).map(item => item.trim()).filter(item => item);
    return [...new Set(items)];
}

function generateRandomLanguageText() {
    const selectedLanguages = [];
    
    if (addArabicCheckbox.checked) selectedLanguages.push('arabic');
    if (addJapaneseCheckbox.checked) selectedLanguages.push('japanese');
    if (addKoreanCheckbox.checked) selectedLanguages.push('korean');
    if (addChineseCheckbox.checked) selectedLanguages.push('chinese');
    
    if (selectedLanguages.length === 0) return '';
    
    const randomLanguage = selectedLanguages[Math.floor(Math.random() * selectedLanguages.length)];
    const texts = randomTexts[randomLanguage];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    
    return randomText;
}

function getMessageInputType() {
    const fileOption = document.querySelector('.message-option-btn[data-option="file"]');
    return fileOption.classList.contains('active') ? 'file' : 'text';
}

function getMessageContent() {
    const inputType
