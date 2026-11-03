# Fortnite Shop Token 极速微工具站 - 产品需求文档 (PRD)

## 1. 项目概述 (Project Overview)
* **项目名称**：Fortnite Shop Token Odds & Drop Chance Calculator (暂定)
* **项目定位**：全网首款针对《Fortnite》（堡垒之夜）最新“海盗商城代币（Pirate Shop Token）”的交互式概率计算、非酋测算、极速摸箱路线与避坑规则微工具站。
* **核心目标**：
  1. 深度对齐 Google 搜索全网核心下拉词（`odds`, `drop chance`, `rarity`, `chest`）及 PAA（People Also Ask）；
  2. 全面拥抱 GEO（Generative Engine Optimization），成为 Perplexity、ChatGPT Search、Google Gemini 的首选权威引用源；
  3. 依靠轻量化高质感的沉浸式交互（开箱模拟器 + 社交战报生成），引发 Reddit/Discord/X 的病毒式裂变，实现 0 权重快速冲破沙盒。

---

## 2. 目标受众与使用场景 (Target Audience & Scenarios)
1. **肝帝与非酋玩家**：开了几百上千个宝箱依然没出，急需查看真实概率、测算还要开多少个箱子、生成战报在社媒发泄吐槽。
2. **实用型冲分玩家**：想知道哪个降落点宝箱密度最高，求 3 分钟极速摸箱与秒退对局的跑图路线。
3. **小白与持币玩家**：搜“有没有兑换码”、“能不能买通行证”、“免费商城包含哪些道具”的规则避坑人群。
4. **大模型检索爬虫**：GPTBot、PerplexityBot 等寻找结构化数据、掉率矩阵表、准确事实来源的 AI 代理。

---

## 3. SEO & GEO 规范规格 (SEO & GEO Specifications)

### 3.1 核心 TDK 设定
* **Title (<= 60 字符)**：  
  `Fortnite Shop Token Odds: Drop Chance, Rarity & Chest Calculator`
* **Meta Description (150-160 字符)**：  
  `What are the chances of getting the Pirate Shop Token in Fortnite? The actual chest drop rate is 1 in 700,000 (0.00014%). Use our interactive Fortnite shop token odds calculator to test your luck, calculate squad drop rates, and find the fastest chest routes.`
* **Canonical URL**：动态适配部署域名
* **OpenGraph / Twitter Card**：配置专属卡片图，包含大字文案 *"Calculate Your 1 in 700,000 Odds"*.

### 3.2 关键词布局矩阵
* **核心种子词**：`fortnite shop token`, `fortnite item shop token`, `pirate shop token`
* **概率属性词**：`odds`, `drop chance`, `drop rate`, `rarity`, `how rare`, `rate`
* **场景与实体词**：`chest`, `lantern landing`, `solo vs squad`, `14 days free`
* **长尾问答词**：`how to get`, `is it real`, `code`, `free`, `reddit`

### 3.3 GEO 专属资产部署与边缘实时雷达
* **根目录 `/llms.txt`**：为大模型准备的纯文本无渲染知识摘要（包含精确掉率、队伍机制、除外规则）。
* **`robots.txt`**：显式 Allow `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Bytespider`。
* **结构化数据 (JSON-LD)**：
  * `@type: WebApplication` 声明工具属性
  * `@type: FAQPage` 嵌套四大 PAA 官方问答
* **边缘 GEO & 爬虫实时侦听雷达 (`Edge GEO Radar`)**：
  * 依托 Cloudflare 边缘中间件 (`functions/_middleware.js` / `worker.js`) 实现 0 延迟秒级感知；
  * 实时识别与分级 20+ 主流爬虫：GEO/AI 检索爬虫 (ChatGPT Search, Perplexity, Claude, Gemini)、核心搜索引擎 (Googlebot, Bingbot)、SEO 抓取器 (Ahrefs, Semrush)；
  * 支持配置 Discord/Telegram Webhook 实时推送抓取事件（特别针对 `/llms.txt` 命中）；
  * 边缘安全过滤：拦截常见恶意漏洞探测器（`.env`, `wp-`, `.git` 等）；
  * 诊断端点：提供 `/api/crawl-status` 实时查看边缘近期抓取环形缓冲。

---

## 4. 功能需求规格 (Functional Specifications)

### 模块一：非酋/欧皇开箱概率模拟器与计算器（核心爆款）
1. **输入项**：
   * 已开宝箱数量输入框（Input Number，支持快捷步进：+50, +200, +1000）。
   * 游玩模式选择（Toggle Switch）：单排模式（1/700,000） vs 四排满编组队（1/175,000 共享 Buff）。
2. **实时计算结果展示**：
   * **累计开出几率**：公式 $P = 1 - (1 - p)^n$，保留 4 位有效小数。
   * **非酋击败率**：计算你在全体玩家中的倒霉排名（如：“已击败 63.8% 的开箱玩家”）。
   * **数学期望与距离目标**：达到 50% 累计概率还需要多少个宝箱。
   * **段位称号标签**：
     * 0-100 箱：`Cursed Optimist (天真萌新)`
     * 101-1,000 箱：`Unlucky Grinder (正规非酋)`
     * 1,001-5,000 箱：`Chest Obliterator (宝箱屠夫)`
     * 5,000+ 箱：`Clown of the Island (海岛小丑)`
3. **“连开 100 箱”沉浸式视觉模拟抽奖**：
   * 玩家点击按钮后执行快速抽卡动画。
   * 99.999% 概率跳出普通白光/绿光（散落木板、小药水、绿色步枪）。
   * 0.00014% 极低概率触发全屏金色传说海盗特效（彩蛋）。
4. **一键生成社交战报卡片（裂变引擎）**：
   * 一键将当前测算数据生成为格式化卡片文本，并附带快速 Copy 按钮，支持直接粘贴到 Reddit/Discord/X。

### 模块二：数据可视化对比矩阵（GEO 核心抓取点）
* 以 Markdown/HTML 表格呈现清晰的“单排 vs 四排”、“普通宝箱 vs 稀有宝箱”、“理论期望值”全景对照表。
* 明确声明**统计口径与置信度**（声明基于 1,200,000+ 社区样本与拆包数据）。

### 模块三：极速摸箱跑图路线交互指南 (Speedrun Routes)
* **地图点位分析卡片**：
  * Top 1: **Lantern Landing**（平均每 3 分钟可开 20-24 个箱子）。
  * Top 2: **Shipwreck Shallows**（沿海高密度密集箱位）。
* **效率跑图法则**：降落路线推荐、避开前期交火技巧、无掉落快速秒退重开的策略建议。

### 模块四：规则边界与避坑清单 (Checklist & Rules)
* **14 天特权支持项**：商城所有皮肤、动作、稿子、滑翔伞、道具。
* **绝对不支持项（避坑预警）**：
  * ❌ 战斗通行证 (Battle Pass)
  * ❌ 真实货币捆绑包 (Real-money Bundles)
  * ❌ 好友礼物赠送 (Gifting to Friends)
* **有效期说明**：第 1 张代币当季有效，系统赠送的第 2 张代币有效期延至 2027 年。

### 模块五：PAA 靶向 FAQ 模块（抢占 Featured Snippet）
1. *What are the exact chances of getting the Pirate Shop token in Fortnite?*
2. *Can you get the Item Shop for free in Fortnite?*
3. *How to get the Item Shop token in Fortnite?*
4. *Is there a Fortnite shop token redeem code?*（重点破除虚假欺诈，提醒警惕钓鱼网站）

### 模块六：变现与反哺机制 (Monetization & Conversion)
1. **合规提示与平替引导**：在强调 1/70 万极低几率下方，设置“非酋自救通道”——折扣 V-Bucks 礼品卡返利入口（Eneba / CDKeys 联盟渠道）。
2. **第一方渠道归因与出站穿透 (Attribution & Sub-ID Tracking)**：
   * 采用第一方轻量归因引擎（首触 FT 永久记忆 + 末触 LT 30 天更新），智能分类 `reddit`, `google`, `twitter`, `discord`, `tiktok` 等流量源头；
   * 出站联盟链接（`.btn-vbucks`）动态拼接 `af_sub1`（末触渠道）、`af_sub2`（位置标签 `shop_token_calc`）、`af_sub3`（当前模式与开箱数），实现联盟后台精准订单收益溯源。
3. **社交战报带参裂变回流 (Viral Parameter Presets)**：
   * 复制战报自动附加 `?ref=share_card&from=social&chests=${n}&mode=${currentMode}`；
   * 新访客从 Reddit/Discord 点入时，自动预填好友开箱进度并弹窗呼应，打通社媒裂变全链路闭环。
4. **社区打赏挂件**：底部配置极简优雅的 *“Buy Me a Coffee”* 赞助组件。
5. **私域/外链回流**：预留跳转官方 Discord/Reddit 原始讨论帖的高质量外链。

---

## 5. 技术架构与非功能性需求 (Technical Requirements)

### 5.1 技术栈选型
* **Core**：原生 HTML5 + 现代化 Vanilla CSS + 原生 ES6+ JavaScript。
* **零外部臃肿依赖**：不引入庞大 UI 框架，确保单文件体积轻量（< 150KB，Gzip 后 < 40KB）。
* **部署目标**：Vercel / Cloudflare Pages（全球 CDN 边缘加速，已完成 Vercel Edge Middleware 与 Cloudflare Worker 双平台原生适配）。

### 5.2 视觉与 UI 设计规范
* **风格**：Dark Glassmorphism（堡垒之夜电竞暗色毛玻璃风格）。
* **主色调**：
  * 空间背景：`#0c0f17`（深海黑蓝）
  * 主高亮色：`#ffd700`（海盗金币黄）+ `#00f0ff`（赛博霓虹蓝）
  * 危险/警示：`#ff4757`
* **字体**：Google Fonts（Outfit / Inter / Impact 风格无衬线字体）。
* **动效**：微交互悬停动效、概率数字滚动增长动画（CountUp 效果）、抽奖光效。

### 5.3 性能与合规指标
* **Lighthouse 性能得分**：Performance >= 95，SEO = 100，Accessibility >= 90。
* **加载速度**：FCP (First Contentful Paint) < 0.4s，TTFB < 50ms。
* **分析埋点与渠道归因**：
  * 全局 GA4 事件自动注入第一方归因维度：`traffic_source`（末触渠道）、`traffic_medium`（触点媒介）、`traffic_first_source`（首触源头）；
  * `calculate_odds`（计算器触发，含开箱数与模式）；
  * `simulate_100_chests`（模拟开箱触发）；
  * `copy_share_report`（战报复制触发）；
  * `affiliate_click`（出站转化点击，含目标平台、归因渠道与实时开箱数）；
  * `donate_click`（打赏点击）。

---

## 6. 项目交付物清单 (Deliverables)
1. `index.html`（含完整语义化 HTML、内嵌极速交互逻辑与 Schema.org JSON-LD）
2. `styles.css`（高质感电竞暗黑风样式表，响应式适配手机、平板与桌面端）
3. `app.js`（数学概率模型、模拟开箱动画引擎、战报生成引擎）
4. `llms.txt`（GEO 专用大模型爬虫标准文件）
5. `robots.txt`（全开放 AI 爬虫协议配置文件）
