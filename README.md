# EWNexus Invoice Tool

輕量客製化invoice/工單工具，給EWNexus品牌旗下的產品。已有具體客戶想要這個功能。

## 目標客群

**工人本身才是付費客戶，不是終端屋主/車主**——水電工、修車廠、一般維修工這類**沒有固定店面、
沒有現成高階POS/開票系統**的小型/流動業者。已經有固定店面的通常已經有高階服務，不是這個工具要打的對象。

## 核心設計原則：零檔案負擔

照片與PDF完全不落地存在Easypanel主機上（基礎版），伺服器與儲存成本幾乎降為零：
- 工人手機拍照 → 前端本地直接渲染HTML樣板+照片 → 生成PDF
- PDF透過Email(Resend)/WA直接寄給客戶，副本寄一份給工人自己
- 後端資料庫只存**純文字**紀錄（客戶名稱/電話、項目、金額、付款狀態），一筆工單<1KB

## 功能規格

### 使用流程（工人手機PWA操作）
1. 選擇客戶（或新增，僅第一次要填客戶資料，之後自動帶入）
2. 從自訂/常用服務項目**或 Bundle** 選單勾選
3. 拍攝施工前/施工後照片
4. 系統本地生成PDF，**自動同時寄 Email + SMS 給客戶**，副本寄工人自己

### Bundle 功能（2026-08-19 加入，已測試）
**Bundle = 把多個現有service_items綁在一起，價格由工人自訂，不是各項加總**

- 工人建立 Bundle，從自己現有的service_items裡挑幾個綁再一起，例：「Emergency Leak Package $350」
  = Inspection($50) + Emergency Repair($250) 兩個子項綁一起，價格自訂350（不等於50+250）
- **顯示方式（修正）**：不是只顯示一行——是「大標題+價格」+底下列出包含哪些子項目名稱，
  比較專業的帳單格式，客戶看得到內容但不一定看到子項各自的價錢
- Bundle 與單項服務可混用在同一張工單（`work_orders.line_items` JSON裡用`type:"bundle"`
  區分，含`sub_items`陣列存子項名稱）
- `bundles` collection：company / bundle_name / price / description / **items**（關聯到
  service_items，多選，這樣才存得住「包含哪些子項目」），同樣多租戶隔離。
  **實測過**：Joe建的Bundle含2個子項目，Bob查不到(0筆)，隔離正常

### 標的物（Asset）欄位（2026-08-19 加入，已測試）
不同行業要記錄「這次服務的對象是什麼」——修車記車輛(VIN/車牌/型號)、產品維修記品號，
遛狗這類可能完全不需要。做成**template層級可設定的欄位組合**，邏輯跟service_items一樣：
EWNexus做DEMO起草稿，工人可以直接用或自己改/加欄位。

- `templates.asset_field_schema`（JSON）：定義這個行業預設要記錄哪些欄位，
  例：`[{"label":"VIN","type":"text"},{"label":"License Plate","type":"text"}]`
- `work_orders.asset_details`（JSON）：實際填入的值，key對應schema的label
- **實測過**：修車template設定VIN/車牌/型號三個欄位，開工單時實際填入車輛資料，
  存進去、讀出來都正確

### 週期性/訂閱式 Invoice（2026-08-19 加入，已測試）
給定期合約用（草坪維護、保養合約），設定一次自動重複出帳單，不用每次手動開單。

- `recurring_invoices`（新）：company / customer / line_items / total_amount /
  `frequency`(weekly/biweekly/monthly/quarterly/yearly) / `next_run_date` / active
- **實測過**：Joe建一筆$100/月的維護合約，Bob看不到(0筆)，隔離正常
- **產生邏輯**：`generate_next_invoice.py` — 給一筆recurring_invoice id，
  1) 用它的`next_run_date`當作新work_order的`work_date`（不是「今天」，這樣批次預先產生時
  每筆才對應到自己真正的到期日）建一張新work_order，2) 把`next_run_date`往frequency推一次
- **批次預先產生（2026-08-19 加入，已測試）**：不用等一個一直在跑、精準抓時間點的排程器，
  改成建約當下就一次把未來N筆都用同一支腳本重複呼叫N次生出來（各自帶自己該有的未來日期）。
  同一支`generate_next_invoice.py`加`generate_batch(recurring_id, token, count)`，monthly就是
  count=12、quarterly就是count=3-4，邏輯不變只是重複跑。已用Joe的月費合約測試batch=3，
  next_run_date正確從10/1→10/31→11/30→12/30依序推進，work_date也各自對應正確
- **狀態**：「產生下一筆」與「批次預先產生」都做完測試過。**真正到期自動觸發batch的cron本身
  還沒排**（例如合約續約時自動重新批次補滿），排到跟SMS提醒/Twilio同一批自動化工程
  （Phase 3/4），不是資料庫或產生邏輯的問題
- **月底日期問題（2026-08-19 修正，已測試）**：monthly/quarterly/yearly不是拿「上一筆日期+30天」
  這種天數疊加法算（會飄移，而且卡過2月縮到28號後永遠回不去31號）。改成`recurring_invoices`
  新增`start_date`(錨點日，合約一開始那次就固定，不再變)+`periods_elapsed`(第幾期)，
  每次都是「錨點+N個月」用Python `calendar.monthrange`查那個月實際天數重新算，
  不是接著上一筆繼續加。實測過：錨點1/31，2月自動縮到28（或閏年29），**3月自動跳回31，
  不會卡住**；錨點29號同理只有2月受影響，30/31天月份都準；錨點跨2028閏年2月正確算出29號
  （不是28）。工人也可以在產生下一筆時手動微調實際日期（`generate_next_invoice`的
  `override_date`參數），系統只負責算建議值，微調永遠是人手動做，不是系統自動改

### SMS 主動通知（2026-08-19 加入）
兩種場景：

| 場景 | 發給誰 | 時機 |
|------|--------|------|
| 發票通知 | 客戶 | 工單完成後立即，Email + SMS 同時發 |
| **預約提醒** | **客戶** | **預約時間前 N 小時（工人自訂）自動發** |

預約提醒邏輯：`work_orders` 加 `scheduled_at` 欄位，PocketBase hook 或 cron 在 `scheduled_at - Nh` 觸發 Twilio SMS。客戶收到「明天 2pm 您的維修預約，技師 Joe，請確認」。

Twilio 成本：~$0.0079/則 + $1/月號碼。**狀態：Phase 3，老闆確認用 Twilio 後才動工。**

### Template商店
- 不同行業（水電/修車/HVAC等）各自的invoice/report樣式，**EWNexus自己設計上架**，用戶選用不能自訂結構
- 每個template帶現成的常用服務項目/金額預設
- Logo、公司名稱：第一次設定好，之後固定套用在所有invoice上

### 「報告」功能（進階，讓invoice後面感覺更專業）
維修前/維修後報告，template由EWNexus設計。**這個功能需要照片留存**，跟零成本架構有取捨：
- 基礎版：零儲存，歷史紀錄只有文字（項目/金額/日期），不含照片
- 進階版（+$3/月）：**用Cloudflare R2存照片，保留1年**，成本極低（R2約$0.015/GB/月，
  1000工單/月×3張照片×2MB≈6GB，一年下來成本可忽略），换來報告真的能查到圖

### 歷史查詢
**是工人自己查自己的客戶/工單紀錄**，不是給終端屋主/車主用的獨立入口。不用另外做外部人存取的
認證系統，直接是工人自己帳號登入後的一個功能，保持輕量。

## 資料模型（PocketBase collections）

| Collection | 內容 |
|------|------|
| `companies` | 工人/公司帳號、logo、公司名稱、選用的template、`subscription_tier`(base/premium)、`price_locked`（鎖定價格，續約套用同一個數字，不會自動變動）、`price_paid`（記帳用）、`subscription_expires_at` |
| `templates` | 各行業template庫（EWNexus設計上架），含常用服務項目預設 |
| `customers` | 客戶資料（名稱/電話/地址），綁定company，重複使用 |
| `service_items` | 服務項目+金額預設，可自訂 |
| `work_orders` | 工單：客戶+項目+金額+付款狀態+(進階版才有的維修前後照片，存R2 URL不是本地) |

## 訂閱與收費

**手動收款，暫不接Stripe**（客戶數量還少，值得先手動）：
- 工人用Zelle轉帳給老闆，老闆收到後手動進PocketBase後台把該工人的`subscription_expires_at`
  設成「今天+1年」——**系統自動根據到期日判斷要不要鎖住功能，不用手動開關**
- 一次繳一年，不是按月收，降低老闆自己手動對帳的頻率

### 高階版 vs 低階版功能比較表（2026-08-18彙整定案）
| 功能 | 基礎版(Base) | 進階版(Premium) |
|------|:---:|:---:|
| Invoice / Report / 客戶管理核心功能 | ✅ | ✅ |
| Service items / Discounts 自訂 | ✅ | ✅ |
| Terms of service 自訂 | ✅ | ✅ |
| Template商店可選數量 | **限3個** | **無限** |
| 維修前後照片留存(R2, 1年) | ❌（照片當下用完即棄） | ✅ |
| 客戶簽名確認 | ❌ | ✅ |
| 月費(推廣期) | $5.99 | $8.99 |
| 年繳(推廣期) | $66 | $90 |

確認：這樣的分層對得起兩者的差價（+$3/月、+$24/年），照片跟簽名成本都極低（R2幾乎免費），
真正在賣的是「模板選擇自由度」+「留存/信任感功能」這兩塊，不是成本堆出來的差異。

### 定價（推廣期，2026-08-18定案）
| 方案 | 月費(參考) | 年繳 | 內容 |
|------|-----------|------|------|
| 基礎版 | $5.99 | $66 | 純文字工單紀錄 |
| 進階版 | $8.99 | $90 | 含維修前後照片留存(R2, 1年) |
| 推廣期結束後 | 各+$2 | 屆時另訂 | — |

**價格政策**：每個工人簽約當下鎖定的價格，續約永遠套用同一個數字，不會因為之後漲價被追加。
價格本身是老闆跟客戶談的business decision，系統只需要記錄「哪個方案」+「到期日」+「實收金額」，
不需要在程式邏輯裡算錢。

## 技術棧

| 部分 | 選擇 |
|------|------|
| 前端 | PWA（可安裝到手機桌面） |
| PDF生成 | html2pdf.js / jsPDF，手機本地渲染 |
| 後端 | PocketBase（單一執行檔+內建SQLite，<30MB記憶體） |
| Email | Resend API |
| WhatsApp(選配) | 沿用現有Meta WA Cloud API設定(`wa_outreach.py`可參考改) |
| 照片儲存(進階版) | Cloudflare R2 |
| 部署 | Easypanel |

## 之後：WA推廣

工具做出來後，用現有WA外發基礎設施（`wa_outreach.py`）推廣，鎖定NexAutoGear/TXRobo現有名單裡
符合「工人/小商家」輪廓的leads。細節等Phase 1完成後再排。

## Phase 1 完成狀態（2026-08-18）

**本地PocketBase已跑起來測試**（`/mnt/work/CEO/projects/ewnexus-invoice-tool/pocketbase/`），
`http://192.168.0.161:8090/_/` 可從瀏覽器直接看（admin後台，僅EWNexus內部管理用，工人不會接觸這個介面）。

### 資料模型定案（6個collections，不是原本規劃的5個，多了discounts）
| Collection | 類型 | 說明 |
|------|------|------|
| `companies` | **auth**（登入帳號） | 工人帳號本身就是company，**不拆User/Company兩張表**——同一家公司兩個員工要各自買、各自獨立帳號，不做企業共用機制 |
| `templates` | base | 行業template，**一次性起始種子，不是要持續維護的活文件**——工人選了之後複製成自己的service_items，之後改不改跟公版無關，EWNexus不用接收命名建議 |
| `customers` | base | 工人自己的客戶名單，`company`欄位+API Rule隔離 |
| `service_items` | base | 工人自己的服務項目/價格，同樣隔離 |
| `discounts` | base | **新增**：折扣選項（百分比/固定金額兩種），工人可設多個，同樣隔離 |
| `work_orders` | base | 工單本體：company/customer/line_items/subtotal/discount_applied/total_amount/payment_status/work_date/before_photos/after_photos |

### 多租戶隔離 — 已測試，不是假設
每個worker-only collection都設了 `listRule/viewRule/createRule/updateRule/deleteRule = "company = @request.auth.id"`。
用兩個真實帳號(Joe's Plumbing / Bob's Auto Repair)實測過：
- Bob查不到Joe的customers/service_items/discounts（列表0筆、直接用ID查也是404）
- Bob無法偽造一筆掛在Joe公司底下的紀錄（createRule擋下，400）
- Joe登入後能正常看到自己的資料
- **admin(superuser)不受這些規則限制，看得到全部**——這是正常/必要的，平台方要能管理支援，
  隔離規則是擋工人互看，不是擋admin。後台可用`company`欄位篩選，不會是攤開的一坨資料。

### History / Calendar
不需要新的collection，是`work_orders`（已有`work_date`+隔離規則）在前端的兩種呈現方式而已，
Phase 2做前端時處理，不是資料庫層的事。**只給工人自己看，不是給終端客戶的功能。**

### Easypanel部署
- API token找到了（`50f941b467b3d17a0cade5fe92722d733a1ae61cf024e5c6328b934c1ab51070`，原本存在claude2的memory裡，
  現在也記在這份文件），部署觸發端點已知（`services.app.deployService`），但**建立新service的端點還沒查到**
  ——教訓：下次要先查EasyPanel官方文件/原始碼，不要用猜的（見memory `feedback_api_docs.md`）
- 先在本地開發驗證，部署到Easypanel留到後面階段再處理

## 提醒功能定案（2026-08-18，Phase 3再做，先記決定）

三種提醒方式，服務不同對象，不衝突：
| 方式 | 提醒誰 | 說明 |
|------|--------|------|
| App內紅點提示 | 工人 | 開App時查有沒有明天到期的工單，最簡單，前端加個檢查 |
| **SMS** | **客戶** | 提醒用SMS不用Email的方向不變（Email已讀率不夠）。**但2026-08-18推翻「用現有實體手機系統」的決定**——老闆原話：「不能用我的實體手機 那是我內部的方案」，內部行銷用手機不該跟客戶產品的簡訊功能混用。**改用Twilio**（正規API，約$0.0079/則+每月$1號碼租金），但老闆說「一開始我不確定」——**尚未定案，先不做，等確定要投入再串接** |
| WA提醒 | 工人 | 次要，工人通常記得自己行程，排最後 |

明確排除：**不做真的手機推播通知**（PWA Push API），太難，老闆說了不用做這個技術棧。

## 服務條款欄位 + 簽名功能定案（2026-08-18）

- `companies`加`terms_of_service`欄位（保固/付款期限等條款，公司層級設定一次套用到全部invoice）
- `templates`加`default_terms_draft`（給預設起草稿，工人可以改成自己用詞，邏輯跟service_items一樣：
  template只是起點，改了是工人自己的，不影響公版，EWNexus不用接收命名/用詞建議）
- **簽名功能定案**：選填 + **高級版(premium)專屬**，跟照片留存同一個付費分層邏輯。最適合放在
  Report流程（工人站在客戶面前的場景），不放在遠端寄送的Invoice上（客戶不在場，簽名沒意義）

### 過程中抓到一個真bug（測試流程發揮作用的實例）
加完`terms_of_service`欄位後，Joe想更新自己的公司資料被拒絕(403)——因為`companies`是auth類型
collection，一開始只設了`listRule`/`createRule`等，**沒設`updateRule`/`viewRule`允許本人改自己資料**，
預設變成「連本人都改不了自己」。已修（`viewRule`/`updateRule` = `id = @request.auth.id`），
重新測試過：Joe能改自己的、Bob改Joe的資料被擋(404)。**如果沒有每步都測，這個bug要等前端做完才會
發現，届時排查成本高很多。**

## 銷售稅 + 記帳/財務摘要（2026-08-18，測試過）

**範圍界定（重要，避免誤解）**：這個App**不做實際報稅/送出稅表**——不同州稅法複雜，做錯是合規責任
問題，不是技術問題。**能做、且真正有價值的是**：把收入(invoice)+支出(expense)整理成一份財務摘要
報表，工人自己或會計師報稅時拿去用，省去對帳麻煩——這是「一條龍記帳」的合理範圍，不是報稅軟體。

### 已加且測試過
- `companies.sales_tax_rate`：工人自己設定當地稅率(如德州8.25%)
- `work_orders.tax_amount`：稅額，總額 = 小計 - 折扣 + 稅（實測：小計$100+稅$8.25=總額$108.25 ✅）
- `expenses`表（新）：company/expense_date/category/vendor/amount/receipt_photo/notes，
  同樣的隔離規則，測試過Bob看不到Joe的開銷紀錄
- `work_orders.payment_status` 加了 `void` 選項（配合作廢功能）

### 待做
- Premium tier的照片保留到Cloudflare R2（現在premium上傳直接進PocketBase file storage，佔位用，
  還沒接R2——**卡在沒有Cloudflare帳號的R2 access key/secret**，`~/ops/CREDENTIALS_MASTER.md`裡
  沒有這組資料，沒辦法用假的key硬測，這段程式碼還沒寫，等老闆給key再做，不想交一段沒測過的signing邏輯)
- PDF不是用html2pdf.js產生檔案，是用瀏覽器原生列印(`window.print()`)存成PDF——夠用、不用多引入一個函式庫

## Phase 2.2：自動化收尾（2026-08-19 晚上，老闆睡覺時做的，隔天早上回報）
老闆說「下一輪都做完」，這幾項裡面**沒有外部帳號/金鑰依賴**的全部做完測完；
**需要真的寄信/發簡訊/連外部雲端**的，因為`irreversible-check`規則(發送類動作要老闆確認)+根本沒有
金鑰可以測，所以做成「dry-run」：邏輯全部寫好測過，只是暫時不會真的送出去，一旦老闆把金鑰填上去，
不用改任何程式碼就會自動變成真的送。

### Recurring Invoice 自動排程（已上crontab，已測試）
`pocketbase/run_recurring_invoices.py`：每天早上6:30(本地時間)自動跑一次，檢查所有公司的
`recurring_invoices`，`next_run_date<=今天`的都自動補產生invoice，用admin token(bypass所有公司
的API rule，因為要一次處理所有worker帳號)。跟人工測試/前端UI共用同一套「錨點日期」算法，沒有重寫。
- **實測過「一次補好幾期」**：故意建一個已經欠3個月的合約(next_run_date設在3個月前)，手動跑一次，
  正確一次生出5/19、6/19、7/19、8/19四張invoice，日期正確依序遞增，next_run_date正確停在9/19
  (今天之後)。再跑第二次結果是0筆(不會重複產生，冪等)。
- crontab entry: `30 6 * * * python3 .../run_recurring_invoices.py >> recurring_cron.log`
- 支援`--dry-run`參數，只印出「哪些筆到期了」不會真的產生invoice，方便老闆之後想先看不想真的動。

### Invoice通知(Email/SMS) — dry-run模式，等金鑰
新增PocketBase JS hook `pocketbase/pb_hooks/notify.pb.js`，定義`POST /api/send-invoice/{work_order_id}`：
- Email用PocketBase**內建mailer**(不是Resend——這樣不用另外申請一個帳號，`/_/`後台Settings>Mail
  設定SMTP就能用，老闆應該已經有Gmail之類可以拿來當SMTP，比申請Resend簡單)
- SMS用Twilio REST API，讀`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_FROM_NUMBER`三個環境變數
- **兩邊都是「沒設定就只記log不真的送」**：SMTP沒開/Twilio沒設，會在`pb.log`寫一行
  `[DRY RUN] would email xxx@xxx.com: Invoice from ... — $150`，前端「Save & Send」按鈕存完invoice後
  會自動呼叫這支API，把結果顯示在畫面上("email not sent (SMTP not configured yet) · SMS not sent
  (Twilio not configured yet)")，老闆一看畫面就知道現在是dry-run狀態，不是功能壞掉
- **實測過**：401(沒登入)、403(Bob想送Joe的invoice)、200正常dry-run(email+phone都有的客戶，兩邊都
  正確記log並回傳正確金額/客戶資訊)、cron腳本用admin token呼叫也正確通過(superuser bypass公司歸屬檢查)
- 「Generate next」(手動)和cron自動產生的recurring invoice，產生後也都會呼叫這支API，邏輯統一
- **要啟用真的寄信/發簡訊，老闆只要**：(1) 去PocketBase後台`/_/`設定SMTP帳密，或 (2) 把Twilio三個
  環境變數加進去重啟PocketBase——不用碰任何程式碼

### Finances CSV匯出（已做，已測試）
點「Export CSV」直接在瀏覽器產生CSV下載，欄位：日期/類型(Income或Expense)/描述/客戶或廠商/金額/
已收銷售稅。Income只算實際有進帳的(排除void跟estimate)。純前端產生，沒有額外後端端點。

## Phase 2：前端PWA — 整合完成（2026-08-19）
`pwa/app.html` + `pwa/app.js`，Stitch設計系統7個畫面全部接上真實後端，不是假資料：

- [x] 工人登入介面
- [x] **Onboarding + Template Store**：新帳號(company.template為空)登入後自動跳4步驟引導，
  Step2從`templates` collection動態抓industry卡片(現在有Plumbing/Auto Repair/HVAC三個)，選了以後
  自動把該template的`default_service_items`整批seed進這家公司的service_items，Step3公司資料+ToS
  草稿自動帶入該template的`default_terms_draft`
- [x] 選客戶/新增客戶、選服務項目+折扣+**Bundle**(勾選後顯示大項目+縮排子項目)，即時算總額
- [x] **Asset/target-object欄位**：依company.template.asset_field_schema動態產生輸入框(例如修車業
  自動出現VIN/車牌/型號)，Plumbing沒有schema就整段隱藏，測過兩種情況
- [x] **A4正式Invoice Preview**：不是小票樣式，logo+公司資訊+bill to+品項表(含bundle子項目縮排)+
  小計/折扣/稅/總額+條款，附「Print / Save PDF」按鈕(呼叫瀏覽器原生列印，手機也能存PDF)
- [x] **Job Report**：獨立於invoice，前/後照片各上限5張，Base tier只用來現場產生報告不上傳存檔，
  Premium才會真的把照片POST進reports collection(FormData multipart)
- [x] **History**：List(狀態pill: Paid綠/Unpaid紅/Void灰底刪除線) + Calendar(月曆格子上的圓點標記
  當天有幾筆、什麼狀態)兩種視圖切換
- [x] **Customers CRM**：搜尋、卡片顯示過去工單數+未收款金額，點進去看聯絡方式+總營收+未結餘額，
  可以直接從這裡跳去開新invoice
- [x] **Finances**：淨利/總收入/總支出、依分類(Materials/Fuel/Tools/Other)列支出明細、銷售稅估算
  (不是報稅工具，就是抓公司設定的稅率乘營收)
- [x] **Recurring Invoices UI**：Settings內管理，「Generate next」按鈕直接呼叫錨點日期邏輯(跟
  `generate_next_invoice.py`同一套算法，port成JS)，日期欄位可以手動微調再送出

### 這輪測試方式（不只是寫完就報告，全部真的跑過）
用Playwright + Chromium(裝在/mnt/work，不佔SSD)開真瀏覽器登入測試帳號，寫了兩個腳本：
`pwa/e2e_test/test_full.js`（8個功能場景：onboarding全流程/bundle算式/asset欄位顯示邏輯/report
存檔/history渲染/CRM明細/finances加支出/recurring生成下一筆，全部斷言真實DOM狀態，不是用眼睛看）
和截圖腳本（9張手機視角screenshot逐一看排版）。這輪測試抓到並修好3個後端bug：
1. `templates` collection沒設listRule/viewRule，工人登入後抓不到自己的template設定(403)
2. `companies.tokenKey`欄位的autogeneratePattern不知道什麼時候被清空了，會擋掉所有新用戶註冊
   （這個跟現在做的UI無關，但如果不是這輪測試不會發現，是會擋到未來真實客戶開帳號的嚴重bug）
3. A4 preview用`aspect-ratio`硬算寬度，在手機窄螢幕上把總額欄位擠出畫面外，改成響應式寬度修好

還沒做（下一輪）：Email/SMS/WA實際發送、R2照片長期保存、recurring invoice自動排程觸發。

## Phase 2.1：History/Calendar/Report 補強（2026-08-19 第二輪，已測試）
老闆看完第一輪後提的三個問題，都處理了：

### History List 篩選
資料量一多手機上會滾到瘋掉，加了客戶篩選、狀態篩選(All/Paid/Unpaid/Estimate/Void)、日期區間
(from/to)，全部前端篩(資料量對單一工人來說不會大到需要server-side查詢)。「Clear filters」一鍵重置。

### Calendar 改成「預約提醒」，不是invoice日期
原本Calendar顯示的是invoice的work_date，老闆說Calendar主要功能應該是**雙方的預約提醒**，執行過後
還要保留(不是完成就消失)。改成新的`appointments` collection：company/customer/`scheduled_at`/
`summary`(簡短行動概要)/`address`(選填——碰面不一定在住家，留空就顯示客戶資料裡的地址)。
月曆格子上有預約的日期會有藍點，點下去下面會列出當天所有預約(客戶名+時間+概要+地址)。這個資料結構
之後如果要做「預約前N小時發SMS提醒客戶」的功能(README前面提過的Phase 3項目)，資料層已經現成可用，
不用再重做一次。

### Report History + 跟Invoice的連結邏輯
老闆問的核心問題：「如果每個invoice都固定連report，還是不一定」——**答案是schema本來就兩種都撐得住**，
`reports.work_order`本來就是選填的relation，不需要為兩種情況寫不同邏輯：
- 習慣每單都寫report的工人：開report時把Linked Invoice下拉選起來就好，等於每次都填
- 不一定寫report的工人：那個下拉留空，report就是獨立記錄，一樣存得進去

真正缺的是「看歷史」的介面，不是資料層。做法：
- Job Report畫面加「New Report / History」切換(跟History List/Calendar同一種UI pattern)，
  History列表裡每筆report會顯示「Linked to invoice — $金額」或「Standalone report」badge
- Invoice History List的每張卡片，如果有report連過來，會多顯示一個小圖示(assignment_turned_in)，
  一眼看出這張invoice有沒有對應的工作報告

### 財務頁面bug修正：銷售稅算法錯誤
老闆抓到的真bug：原本「Sales Tax Estimate」是拿營收乘稅率去估算，這是錯的——銷售稅是跟客戶收的錢
(每張invoice開立時就已經算好存在`tax_amount`欄位)，不是工人自己的所得要另外課的稅，拿營收乘稅率
等於重複計算。改成「Sales Tax Collected」= 直接加總所有invoice的`tax_amount`，並註明「這不是你的收入，
是欠州政府的錢」，估算/計算(estimate狀態的invoice)排除在外，Void也排除。

### 新增：Estimate(報價/預先規劃)狀態
老闆提的第四點：付款狀態要能區分「已付/未付/**還沒做但先有報價**」。沒有另外開一張表，直接在
`work_orders.payment_status`加一個`estimate`值(跟cash/zelle/card/unpaid/void同一個欄位)，
邏輯最簡單：工人開單時選"Estimate"，這張單就會出現在History裡可以用狀態篩選挑出來看，但不會被算進
Finances的營收或銷售稅(估算還沒實際發生)，CRM客戶詳情頁的Total Revenue也排除estimate。

### 這輪也是全部真跑過(Playwright)
`pwa/e2e_test/test_v2.js`，5個場景全部斷言真實DOM/資料：History三種篩選(客戶/狀態/日期範圍，含
「篩到沒有符合的顯示正確空狀態」)、建立預約+月曆正確顯示+點日期顯示詳情、Report History正確區分
Linked/Standalone兩種badge、Finances的稅收顯示改成「Collected」且數字等於tax_amount加總不是
income×rate、建立estimate發票後金額不會跑進Finances的Income數字裡。測完把過程中產生的測試資料
(appointments/reports/estimate work_order)都清掉了。
