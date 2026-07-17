# 英泰維修單系統（GitHub Pages 向量 PDF 版）

## 重要：放入中文字型

PDF 不再截圖網頁，而是用 jsPDF 逐字、逐線建立真正的 A4 PDF。為顯示繁體中文，請從教育部官方「國字標準字體字型檔－楷書」下載 ZIP，解壓縮後將 TTF 字型檔重新命名為：

`TW-MOE-Std-Kai.ttf`

並放到：

`fonts/TW-MOE-Std-Kai.ttf`

請維持教育部字型檔原樣，不要修改；本系統在 PDF 頁尾標示「字型來源：中華民國教育部標準楷書」。

## GitHub Pages 部署

將整個資料夾內容上傳到 GitHub Pages 發布來源根目錄：

- `index.html`
- `js/pdf-generator.js`
- `fonts/TW-MOE-Std-Kai.ttf`

PDF 按鈕會直接產生向量 PDF；iPad 優先開啟系統分享表單，電腦直接下載。
