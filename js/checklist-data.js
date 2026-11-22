// iPhone 安全強化清單
// priority: critical（一定要做）| high（強烈建議）| medium（建議）
// 設定路徑以 iOS 18 / 26 為準；iOS 17 以前「設定 > App > X」多半是「設定 > X」。

export const CATEGORIES = [
  { id: 'lock', name: '解鎖與失竊防護', icon: '🔒' },
  { id: 'account', name: 'Apple 帳號', icon: '👤' },
  { id: 'system', name: '系統與更新', icon: '⚙️' },
  { id: 'privacy', name: '隱私權與追蹤', icon: '🕵️' },
  { id: 'comms', name: '訊息、電話與網路', icon: '📶' },
  { id: 'advanced', name: '高風險族群進階防護', icon: '🛡️' },
];

export const CHECKLIST = [
  // ── 解鎖與失竊防護 ──
  {
    id: 'passcode-strong', cat: 'lock', priority: 'critical',
    title: '使用 6 位數以上或英數字密碼',
    why: '4 位數密碼可被快速猜出。iPhone 被偷時，密碼是保護所有資料的最後一道門。避免生日、123456、重複數字。',
    steps: ['設定 > Face ID 與密碼 > 更改密碼', '點「密碼選項」> 選「自訂英數字密碼」或「6 位數數字密碼」'],
  },
  {
    id: 'stolen-device', cat: 'lock', priority: 'critical',
    title: '開啟「失竊裝置保護」',
    why: '小偷偷看到你的密碼再搶走手機，就能改掉 Apple 帳號密碼、關閉「尋找」。開啟後，在不熟悉的地點做這些操作必須用 Face ID，並強制等待一小時。',
    steps: ['設定 > Face ID 與密碼', '開啟「失竊裝置保護」（iOS 17.3 以上）', '「需要安全延遲」建議選「隨時」'],
  },
  {
    id: 'lockscreen-access', cat: 'lock', priority: 'high',
    title: '限制鎖定畫面可使用的功能',
    why: '鎖定時能開控制中心，小偷就能直接關掉網路，讓你無法定位手機；能用「USB 配件」則可能被拿去接傳輸設備。',
    steps: ['設定 > Face ID 與密碼 >「鎖定時允許取用」', '關閉：控制中心、USB 配件、錢包、回覆訊息、配件、以訊息回覆', '「USB 配件」保持關閉（關閉 = 鎖定超過 1 小時禁止資料傳輸）'],
  },
  {
    id: 'auto-lock', cat: 'lock', priority: 'medium',
    title: '自動鎖定設在 1 分鐘以內',
    why: '縮短手機沒上鎖、別人可以直接拿來用的時間。',
    steps: ['設定 > 螢幕顯示與亮度 > 自動鎖定', '選 30 秒或 1 分鐘'],
  },
  {
    id: 'notif-preview', cat: 'lock', priority: 'high',
    title: '通知預覽只在解鎖時顯示',
    why: '驗證碼簡訊常會出現在鎖定畫面，別人不用解鎖就能看到，拿去登入你的帳號或盜刷。',
    steps: ['設定 > 通知 > 顯示預覽', '選「解鎖時」'],
  },
  {
    id: 'sim-pin', cat: 'lock', priority: 'high',
    title: '設定 SIM 卡 PIN 碼',
    why: '手機被偷時，小偷可以把 SIM 卡插到別支手機上收你的簡訊驗證碼，用來重設網銀、LINE 等帳號。',
    steps: ['先向電信業者確認預設 PIN（台灣常見為 0000 或 1234，打錯 3 次會鎖卡）', '設定 > 行動服務 > SIM PIN > 開啟', '點「更改 PIN」改成只有你知道的號碼'],
  },
  {
    id: 'erase-data', cat: 'lock', priority: 'medium',
    title: '考慮開啟「清除資料」',
    why: '連續輸錯 10 次密碼就清除 iPhone。請先確定 iCloud 備份正常；家裡有小孩常亂按的人請斟酌。',
    steps: ['設定 > Face ID 與密碼', '最底部開啟「清除資料」'],
  },
  {
    id: 'locked-apps', cat: 'lock', priority: 'medium',
    title: '敏感 App 加上 Face ID 鎖',
    why: '借別人手機或手機已解鎖被拿走時，網銀、相簿、LINE、Email 還是需要再驗證一次。',
    steps: ['在主畫面長按 App（例如照片、LINE、銀行 App）', '選「需要 Face ID」（iOS 18 以上）'],
  },

  // ── Apple 帳號 ──
  {
    id: 'apple-2fa', cat: 'account', priority: 'critical',
    title: '確認 Apple 帳號已開啟雙重認證',
    why: '只有密碼被盜時，雙重認證可以擋住別人登入你的 iCloud（照片、備份、通訊錄、位置）。',
    steps: ['設定 > 點最上方你的名字 > 登入與安全性', '確認「雙重認證」為「開啟」', '確認「受信任的電話號碼」都是你本人的號碼'],
  },
  {
    id: 'apple-password', cat: 'account', priority: 'critical',
    title: 'Apple 帳號用獨一無二的強密碼',
    why: '如果 Apple 帳號跟其他網站用同一組密碼，那些網站外洩時你的 iCloud 也會跟著被入侵。',
    steps: ['設定 > 你的名字 > 登入與安全性 > 更改密碼', '用這個工具的「密碼檢查」分頁確認新密碼沒有外洩紀錄'],
  },
  {
    id: 'apple-devices', cat: 'account', priority: 'critical',
    title: '移除不認識的已登入裝置',
    why: '帳號一旦被盜，入侵者的裝置會出現在清單裡，可以同步你的照片、訊息與鑰匙圈。',
    steps: ['設定 > 你的名字 > 往下捲到裝置清單', '逐一點開，不認識的就選「從帳號中移除」', '之後馬上改 Apple 帳號密碼'],
  },
  {
    id: 'account-recovery', cat: 'account', priority: 'high',
    title: '設定救援聯絡人',
    why: '手機遺失或忘記密碼時，可以靠信任的親友找回帳號，不用把救援方式交給陌生客服。',
    steps: ['設定 > 你的名字 > 登入與安全性 > 帳號復原', '新增「救援聯絡人」（對方需要有 Apple 裝置）'],
  },
  {
    id: 'find-my', cat: 'account', priority: 'critical',
    title: '開啟「尋找我的 iPhone」與「傳送最後位置」',
    why: '可以定位、鎖定或遠端清除遺失的手機。開啟後，別人必須有你的 Apple 帳號密碼才能重置手機（啟用鎖定），手機被偷也沒有轉賣價值。',
    steps: ['設定 > 你的名字 > 尋找 > 尋找我的 iPhone', '開啟：尋找我的 iPhone、「尋找」網路、傳送最後位置'],
  },
  {
    id: 'passwords-app', cat: 'account', priority: 'high',
    title: '處理「密碼」App 的安全性建議',
    why: 'iPhone 會比對已知的外洩資料庫，並列出重複使用、太簡單或已經外洩的密碼。',
    steps: ['打開「密碼」App（iOS 18；舊版在 設定 > 密碼）', '點「安全性」，依序修改每個被標示的密碼', '確認「偵測外洩的密碼」已開啟'],
  },
  {
    id: 'passkeys', cat: 'account', priority: 'medium',
    title: '重要服務改用通行密鑰（Passkey）',
    why: '通行密鑰綁定真正的網域，假網站騙不走，也不會因為其他網站外洩而被盜。Google、LINE、Microsoft、部分電商都已支援。',
    steps: ['到各服務的帳號安全性設定找「通行密鑰 / Passkey」', '選擇建立，存到 iCloud 鑰匙圈'],
  },
  {
    id: 'hide-email', cat: 'account', priority: 'medium',
    title: '註冊網站時使用「隱藏我的電子郵件」',
    why: '每個網站都拿到不同的轉寄信箱。哪個網站外洩或亂寄廣告，直接停用那一個轉寄地址就好（需要 iCloud+）。',
    steps: ['設定 > 你的名字 > iCloud > 隱藏我的電子郵件', '註冊時在 Email 欄位選「隱藏我的電子郵件」'],
  },

  // ── 系統與更新 ──
  {
    id: 'auto-update', cat: 'system', priority: 'critical',
    title: '開啟自動更新與「背景安全性改進」',
    why: '大多數入侵都是利用已經修補過的漏洞，還沒更新的手機就是主要目標。Apple 也會推送不用重開機的緊急安全修補。',
    steps: ['設定 > 一般 > 軟體更新 > 自動更新', '全部開啟：iOS 更新的「下載」與「安裝」、安全性回應與系統檔案（新版名稱為「背景安全性改進」）', '現在就檢查一次有沒有新版本'],
  },
  {
    id: 'profiles', cat: 'system', priority: 'critical',
    title: '檢查並移除不明的描述檔或 VPN',
    why: '詐騙集團常騙人安裝「描述檔」，拿來攔截網路流量、遠端管理手機。不是公司或學校發的就要移除。',
    steps: ['設定 > 一般 > VPN 與裝置管理', '看到不認識的描述檔或「裝置管理」項目，點進去選「移除」', '同時檢查 設定 > VPN，刪掉不是自己裝的 VPN'],
  },
  {
    id: 'no-jailbreak', cat: 'system', priority: 'critical',
    title: '不越獄，只從 App Store 安裝 App',
    why: '越獄會拆掉 iOS 的沙盒保護。號稱「免費版」、「企業版」、要你信任開發者的 App，常常是間諜軟體。',
    steps: ['設定 > 一般 > VPN 與裝置管理：不要「信任」不明的企業開發者', '刪掉不是從 App Store 來的 App'],
  },
  {
    id: 'app-review', cat: 'system', priority: 'high',
    title: '刪除不用或不認識的 App',
    why: 'App 越少，能拿到權限、蒐集資料的對象就越少。手電筒、清理、加速類 App 常常過度蒐集個資。',
    steps: ['設定 > 一般 > iPhone 儲存空間：查看所有 App 與最後使用日期', '刪掉不認識或半年沒用的 App'],
  },
  {
    id: 'restart', cat: 'system', priority: 'medium',
    title: '每週重新開機一次',
    why: '部分進階間諜軟體只存在記憶體中，重開機就會清掉。美國國安局（NSA）的行動裝置建議也列了這一項。',
    steps: ['同時按住側邊按鈕與任一音量鍵 > 滑動關機 > 再開機'],
  },
  {
    id: 'backup', cat: 'system', priority: 'high',
    title: '確認 iCloud 備份正常',
    why: '真的被入侵或被勒索時，有備份才能放心清除手機、重新設定。',
    steps: ['設定 > 你的名字 > iCloud > iCloud 備份', '開啟並確認「上次成功備份」時間是最近的'],
  },

  // ── 隱私權與追蹤 ──
  {
    id: 'safety-check', cat: 'privacy', priority: 'high',
    title: '執行「安全檢查」',
    why: '一次看完你分享給誰（位置、照片、行事曆）、哪些 App 拿到了什麼權限。特別適合懷疑被伴侶或熟人監控的人。',
    steps: ['設定 > 隱私權與安全性 > 安全檢查', '點「管理分享與取用權」並依照步驟檢查', '情況緊急時可以用「緊急重置」立即停止所有分享'],
  },
  {
    id: 'app-tracking', cat: 'privacy', priority: 'high',
    title: '關閉「允許 App 要求追蹤」',
    why: '不讓 App 跨 App、跨網站追蹤你，減少被廣告商建立個人檔案。',
    steps: ['設定 > 隱私權與安全性 > 追蹤', '關閉「允許 App 要求追蹤」'],
  },
  {
    id: 'location', cat: 'privacy', priority: 'high',
    title: '檢查定位權限，關閉「精確位置」',
    why: '很多 App 不需要你的精確位置，或不需要「永遠」取得位置。',
    steps: ['設定 > 隱私權與安全性 > 定位服務', '逐一檢查 App：改成「使用 App 期間」或「永不」', '天氣、新聞這類 App 可以關閉「精確位置」', '系統服務 > 重要位置：檢查紀錄，不需要就關閉'],
  },
  {
    id: 'perm-cam-mic', cat: 'privacy', priority: 'high',
    title: '檢查相機、麥克風、照片、通訊錄權限',
    why: '只有真的需要的 App 才給權限。照片建議選「有限取用」，只開放部分照片。',
    steps: ['設定 > 隱私權與安全性 > 相機 / 麥克風 / 照片 / 聯絡人 / 本地網路 / 藍牙', '關掉不需要的 App'],
  },
  {
    id: 'privacy-report', cat: 'privacy', priority: 'medium',
    title: '開啟「App 隱私權報告」',
    why: '記錄每個 App 什麼時候用了相機、麥克風、位置，又連到了哪些網域，可以抓出偷偷蒐集資料的 App。',
    steps: ['設定 > 隱私權與安全性 > App 隱私權報告 > 開啟', '幾天後回來查看'],
  },
  {
    id: 'safari', cat: 'privacy', priority: 'high',
    title: 'Safari 開啟詐騙警告與防追蹤',
    why: '遇到已知的釣魚網站會先警告，並且阻擋跨網站追蹤與瀏覽器指紋辨識。',
    steps: ['設定 > App > Safari', '開啟「詐騙網站警告」', '開啟「防止跨網站追蹤」；「隱藏 IP 位址」選「追蹤器與網站」', '進階 >「進階追蹤與指紋保護」選「所有瀏覽」'],
  },
  {
    id: 'paste', cat: 'privacy', priority: 'medium',
    title: '控制 App 讀取剪貼板',
    why: '剪貼板裡可能有密碼、驗證碼或帳號，不要讓 App 隨意讀取。',
    steps: ['設定 > App > 選擇該 App >「從其他 App 貼上」', '選「詢問」或「拒絕」'],
  },

  // ── 訊息、電話與網路 ──
  {
    id: 'filter-sms', cat: 'comms', priority: 'high',
    title: '過濾未知寄件人簡訊、未知來電靜音',
    why: '大多數詐騙是從陌生簡訊、陌生來電開始的（包裹、ETC 欠費、假檢警）。',
    steps: ['設定 > App > 訊息 > 開啟「過濾未知寄件人」', '設定 > App > 電話 > 開啟「將未知來電者設為靜音」（會影響外送、快遞來電，請斟酌）', '可以另外安裝 Whoscall 這類 App，到 設定 > App > 電話 > 來電封鎖與識別 開啟'],
  },
  {
    id: 'airdrop', cat: 'comms', priority: 'high',
    title: 'AirDrop 設為「僅限聯絡人」',
    why: '避免在公共場所被陌生人傳送騷擾圖片或惡意檔案。',
    steps: ['設定 > 一般 > AirDrop', '選「僅限聯絡人」或「接收關閉」（「所有人」10 分鐘後會自動恢復）'],
  },
  {
    id: 'wifi', cat: 'comms', priority: 'medium',
    title: '公共 Wi-Fi 不自動加入，開啟私人 Wi-Fi 位址',
    why: '假熱點可以竊聽或竄改網路流量。私人位址可以避免你在不同場所被追蹤。',
    steps: ['設定 > Wi-Fi > 詢問是否加入網路：選「詢問」', '「自動加入熱點」選「詢問加入」', '點各網路旁的 ⓘ > 私人 Wi-Fi 位址 選「固定」或「輪替」', '忘記不再使用的公共網路'],
  },
  {
    id: 'bluetooth-tracker', cat: 'comms', priority: 'medium',
    title: '注意「發現未知配件」通知',
    why: 'iPhone 偵測到不明的 AirTag 或追蹤器一直跟著你時會發出通知，可能是有人在跟蹤你。',
    steps: ['設定 > 通知 > 追蹤通知：確認已開啟', '收到通知時，用「尋找」App 播放聲音找出追蹤器；有安全疑慮請報警'],
  },
  {
    id: 'siri-lock', cat: 'comms', priority: 'medium',
    title: '關閉鎖定時使用 Siri',
    why: '別人不用解鎖就能叫 Siri 打電話、傳訊息、讀出部分個人資料。',
    steps: ['設定 > Siri（或 Apple Intelligence 與 Siri）', '關閉「鎖定時允許使用 Siri」'],
  },

  // ── 高風險族群進階防護 ──
  {
    id: 'adp', cat: 'advanced', priority: 'high',
    title: '開啟「進階資料保護」（iCloud 端對端加密）',
    why: '開啟後，iCloud 備份、照片、備忘錄等資料全部端對端加密，連 Apple 都無法讀取。前提是要先設好救援聯絡人或救援密鑰，否則忘記密碼資料就救不回來。',
    steps: ['先完成「設定救援聯絡人」', '設定 > 你的名字 > iCloud > 進階資料保護 > 開啟'],
  },
  {
    id: 'security-keys', cat: 'advanced', priority: 'medium',
    title: 'Apple 帳號綁定實體安全金鑰',
    why: '登入需要插入實體金鑰（例如 YubiKey），釣魚網站無法騙走。適合記者、公眾人物、企業高層。',
    steps: ['準備兩把通過 FIDO 認證的安全金鑰', '設定 > 你的名字 > 登入與安全性 > 安全金鑰 > 新增'],
  },
  {
    id: 'contact-key', cat: 'advanced', priority: 'medium',
    title: '開啟 iMessage 聯絡人密鑰驗證',
    why: '有人試圖冒充或攔截你的 iMessage 對話時會發出警告。',
    steps: ['設定 > 你的名字 > 聯絡人密鑰驗證 > 開啟（iOS 17.2 以上）'],
  },
  {
    id: 'lockdown', cat: 'advanced', priority: 'medium',
    title: '必要時開啟「鎖定模式」',
    why: '專門防禦 Pegasus 這類國家級間諜軟體，會限制訊息附件、網頁技術、FaceTime 陌生來電、有線連接等功能。一般人不需要開；如果你是記者、社運人士、律師、政治工作者，或收到 Apple 的威脅通知，請開啟。',
    steps: ['設定 > 隱私權與安全性 > 鎖定模式 > 開啟鎖定模式', '重新開機後生效'],
  },
];

export const WARNING_SIGNS = [
  { sign: '「設定 > 一般 > VPN 與裝置管理」出現不認識的描述檔', level: 'high' },
  { sign: '收到 Apple 的「威脅通知」（Email 或 appleid.apple.com 頁面上方）', level: 'high' },
  { sign: '沒有登入卻收到 Apple 帳號雙重認證碼或「新裝置登入」通知', level: 'high' },
  { sign: 'Apple 帳號的裝置清單裡有你不認識的裝置', level: 'high' },
  { sign: '沒在用相機或麥克風時，螢幕右上角出現綠點（相機）或橘點（麥克風）', level: 'high' },
  { sign: '出現自己沒裝的 App，或曾經「信任」過不明的企業開發者', level: 'medium' },
  { sign: '朋友說收到你沒傳過的訊息', level: 'medium' },
  { sign: 'Safari 首頁或搜尋引擎被改掉、一直跳出廣告或「中毒」警告', level: 'low' },
  { sign: '手機待機時異常發燙、很快沒電、行動數據用量暴增', level: 'low' },
];

export const INCIDENT_STEPS = [
  { title: '先斷網，冷靜下來', body: '如果正在被遠端操控或正在被詐騙，先開飛航模式。不要回撥簡訊或訊息裡的電話。' },
  { title: '用另一台安全的裝置改 Apple 帳號密碼', body: '到 account.apple.com 修改密碼，並移除不認識的裝置與受信任電話號碼。' },
  { title: '移除描述檔、VPN 與可疑 App', body: '設定 > 一般 > VPN 與裝置管理，移除所有不明項目；刪除最近安裝的可疑 App。' },
  { title: '更新 iOS 到最新版並重新開機', body: '設定 > 一般 > 軟體更新。' },
  { title: '執行「安全檢查 > 緊急重置」', body: '設定 > 隱私權與安全性 > 安全檢查，停止所有位置與資料分享，並登出其他裝置。' },
  { title: '更改重要帳號密碼', body: '依序修改 Email、網銀、LINE、社群帳號，全部開啟雙重認證。先改 Email，因為其他帳號的重設信都會寄到那裡。' },
  { title: '金融資料可能外洩時立刻通知銀行', body: '打信用卡背面的客服電話停卡、凍結帳戶，並檢查近期交易。' },
  { title: '懷疑被針對性攻擊：開啟鎖定模式並尋求協助', body: '收到 Apple 威脅通知時，可以聯絡 Access Now 數位安全求助專線（免費，有中文服務）。' },
  { title: '最後手段：清除並重新設定', body: '先手動保存照片等重要資料，再執行 設定 > 一般 > 移轉或重置 iPhone > 清除所有內容和設定。懷疑備份也被感染時，請「設定為新 iPhone」，不要從備份還原。' },
  { title: '被詐騙或遭勒索：報案', body: '台灣：撥打 165 反詐騙專線，緊急狀況撥 110。保留簡訊、對話紀錄與轉帳證明作為證據。' },
];
