# 商品目錄網站(展示 + Email 下單)

純前端靜態網站,無需伺服器與資料庫。顧客瀏覽商品、加入「選購清單」,
最後按下送出後會開啟顧客的 Email,自動帶入商品明細,寄給店家信箱。

## 檔案說明

- `index.html` — 頁面結構,商品資料也寫在這個檔案裡面
- `style.css` — 樣式
- `script.js` — 邏輯(商品渲染、購物車、產生 Email)

商品資料直接內嵌在 `index.html` 裡(`<script id="productsData">` 區塊內),
不需要另外讀取檔案,所以**雙擊 `index.html` 就能直接在瀏覽器預覽**,不會因為
瀏覽器安全限制而空白。

## 客製化步驟

1. 打開 `script.js`,把最上面幾行改成你的資訊:
   ```js
   const MERCHANT_EMAIL = "shop@example.com"; // 改成你收訂單的信箱
   const SHOP_NAME = "小日子選物";           // 改成你的店名
   const LINE_URL = "https://lin.ee/xxxxxxx"; // 改成你的 LINE 官方帳號連結
   ```

   **如何取得正式的 LINE 連結：**
   - 到 [LINE 官方帳號後台](https://manager.line.biz) 登入你的官方帳號
   - 左側選單找到「加入好友按鈕與工具」或「主頁」
   - 那裡會有一組固定連結,格式通常是 `https://lin.ee/xxxxxxx`
   - 複製後貼到 `LINE_URL` 這一行,取代測試用的網址,存檔即可

2. 打開 `index.html`,找到 `<script type="application/json" id="productsData">`
   這個區塊,依照現有格式增刪商品:
   ```json
   {
     "id": "p7",
     "name": "商品名稱",
     "category": "分類名稱",
     "price": 100,
     "description": "產品完整介紹文字,會顯示在商品詳細頁",
     "images": [
       "圖片網址1(建議用 https 連結)",
       "圖片網址2",
       "圖片網址3"
     ],
     "videoUrl": "https://www.youtube.com/watch?v=xxxxxxxxxxx",
     "specs": [
       { "label": "尺寸", "value": "300 x 200 x 400 mm" },
       { "label": "功率", "value": "800W" },
       { "label": "保固", "value": "原廠保固一年" }
     ]
   }
   ```
   - `id` 需唯一,不能跟其他商品重複。
   - `category` 會自動出現在上方的篩選按鈕。
   - `images` 是一個陣列,第一張會是商品卡片與詳細頁的主圖,放多張時詳細頁會出現縮圖可切換。
   - `videoUrl` 可以放 YouTube 影片連結(一般連結或 youtu.be 短連結都可以),沒有影片就留空字串 `""`。
   - `specs` 是規格表,會以表格形式顯示在詳細頁,想要幾列都可以自由增減。
   - 這個區塊就是一段 JSON,記得每個項目之間要用逗號分隔,最後一個項目後面不要加逗號。

3. `index.html` 的 `<title>` 和 `.brand` 文字也可以改成你的店名。

## 商品詳細頁

點擊商品圖片或名稱,會打開該商品的詳細頁,包含:
- 大圖 + 縮圖相簿(多張圖片可切換)
- 規格表(來自 `specs`)
- 產品介紹文字(來自 `description`)
- YouTube 影片嵌入(來自 `videoUrl`,留空則不顯示該區塊)
- 加入清單按鈕

點左上角「← 返回商品列表」可以回到商品清單畫面。

## 部署到 GitHub Pages

1. 在 GitHub 新建一個 repository(例如 `my-shop-catalog`)。
2. 把這個資料夾內的檔案全部上傳到該 repository 的根目錄。
3. 到 repository 的 **Settings → Pages**。
4. Source 選擇 `Deploy from a branch`,Branch 選 `main` / `/(root)`,按 Save。
5. 等 1-2 分鐘,GitHub 會給你一個網址,例如:
   `https://你的帳號.github.io/my-shop-catalog/`

## 關於 Email 下單的限制

這個方式使用瀏覽器的 `mailto:` 連結,原理是幫顧客開啟他電腦/手機上
已設定好的郵件軟體(如 Outlook、Apple Mail、Gmail App),並自動填好收件人、
主旨和訂單內容,**顧客仍需自己按下「送出」**。

限制:
- 如果顧客的裝置沒有設定好任何 Email 軟體(例如只用網頁版 Gmail 但沒登入預設程式),
  點擊後可能沒有反應或跳出瀏覽器詢問視窗。
- 訂單內容過長(商品項目非常多)時,部分信箱可能會截斷網址,建議商品分類清楚、
  避免顧客一次加太多品項。

如果之後想要「顧客不需要自己開 Email、系統自動寄出」,會需要串接第三方表單服務
(例如 Formspree、EmailJS)或後端伺服器,屆時可以再進一步調整。

## 本機測試

直接雙擊 `index.html` 用瀏覽器打開就能預覽,不需要額外的伺服器或安裝任何東西。
