# 小蛋仔汉字闯关岛

为 6 岁学前班小女孩“宝一一”定制的 H5 识字闯关小游戏 MVP。项目使用 Vite + TypeScript + Phaser 3，竖屏设计尺寸为 750x1334，可在桌面浏览器和手机浏览器运行。

本项目没有使用任何已有 IP 的官方形象、LOGO、音效或素材。主角、Boss、按钮、岛屿等均由 Phaser 图形绘制，音效由 Web Audio API 临时生成，方便后续替换正式资源。

## 安装方式

```bash
npm install
```

## 启动方式

```bash
npm run dev
```

启动后打开终端提示的本地地址。手机调试时，请让手机和电脑在同一局域网，并访问 Vite 输出的 Network 地址。

## 构建

```bash
npm run build
```

## 服务端部署配置

当前线上域名和 Nginx 静态目录：

- 域名：`danzai.lufangfang.cn`
- 站点目录：`/data/xiaodanzai`

CentOS 7 服务器可以不安装 Node.js，推荐在本地构建后上传 `dist/` 内容到 `/data/xiaodanzai`：

```bash
npm run build
tar -czf xiaodanzai-dist.tar.gz -C dist .
scp xiaodanzai-dist.tar.gz root@服务器IP:/tmp/
```

服务器解压：

```bash
sudo mkdir -p /data/xiaodanzai
sudo tar -xzf /tmp/xiaodanzai-dist.tar.gz -C /data/xiaodanzai
```

Nginx 配置：

```nginx
server {
    listen 80;
    server_name danzai.lufangfang.cn;

    root /data/xiaodanzai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

写入配置并重载：

```bash
sudo tee /etc/nginx/conf.d/xiaodanzai.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name danzai.lufangfang.cn;

    root /data/xiaodanzai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo nginx -t
sudo systemctl reload nginx
```

## 项目结构

```text
src/
  main.ts
  styles.css
  game/
    scenes/
      HomeScene.ts
      AvatarScene.ts
      MapScene.ts
      GameScene.ts
      BossScene.ts
      ResultScene.ts
      ParentScene.ts
    objects/
      EggHero.ts
      BossMonster.ts
      BigButton.ts
      WordCard.ts
    systems/
      storage.ts
      score.ts
      progress.ts
      sound.ts
      speech.ts
      levelManager.ts
    data/
      chars.ts
      levels.ts
      player.ts
      rewards.ts
    types.ts
```

## 已实现内容

- 唯一用户画像：宝一一，首页、地图、装扮、闯关反馈、结算和家长中心都围绕她展开
- 3 个主题岛：身体乐园、自然山谷、动物森林
- 15 个关卡
- 4 种玩法：听音跳字、看图找字、字卡翻翻乐、Boss 挑战
- 分数、星星、金币、连击
- 关卡星级记录与解锁判断
- 6 个装扮占位奖励
- 本地学习数据记录：出现次数、答对次数、答错次数、最近学习时间、学习状态
- 家长中心：学习时长、已学习字数、已掌握字数、易错字、总正确率、最近通关记录
- localStorage 持久化，刷新页面后进度不丢失

## 如何新增汉字

在 `src/game/data/chars.ts` 的 `charItems` 数组中追加一项：

```ts
{
  id: 'zi_shan',
  char: '山',
  pinyin: 'shan',
  meaning: '高高的大山',
  category: 'nature',
  emoji: '⛰️',
  words: ['大山', '山上', '小山'],
  sentence: '我看见一座大山。',
  confusers: ['水', '木', '田'],
  similarChars: ['出'],
}
```

`char` 必须唯一。`confusers` 用于生成干扰选项，建议至少填写 3 个。

## 如何调整宝一一的专属设定

在 `src/game/data/player.ts` 中修改：

```ts
export const playerProfile = {
  childName: '宝一一',
  shortName: '一一',
  ageLabel: '6 岁学前班',
  heroName: '一一小蛋仔',
  islandName: '宝一一的汉字闯关岛',
  parentCenterName: '宝一一学习小屋',
  coinName: '一一金币',
  starName: '字星星',
  homeQuestion: '宝一一，今天想认识哪个字朋友？',
  islandPromise: '这是只为宝一一准备的识字小岛',
  missionLine: '一一小蛋仔陪宝一一慢慢收集字星星',
  mapGoal: '宝一一的小目标：每天点亮一点点，字朋友会越来越多',
  avatarLine: '给一一小蛋仔换上宝一一喜欢的装扮吧',
  parentNote: '这里记录宝一一在这台设备上的学习脚印。',
  praiseLines: ['宝一一太棒啦', '一一答对啦', '宝一一又点亮一颗字星星啦'],
  retryLine: '宝一一，差一点点哦，再试一次',
  memoryRetryLine: '宝一一没关系，再试一次',
  hintLine: '宝一一的小提示来啦，慢慢看',
};
```

场景文案会统一读取这份配置。这个文件是宝一一专属体验的入口，后续可以继续加入她喜欢的颜色、口头禅、奖励偏好或重点复习主题。

## 如何新增关卡

在 `src/game/data/levels.ts` 的 `levels` 数组中追加 `LevelConfig`：

```ts
{
  id: 'nature-6',
  worldId: 'nature',
  title: '2-6 新关卡',
  mode: 'listen_jump',
  chars: ['山', '水', '木'],
  questionCount: 6,
  isBoss: false,
  unlockStarsRequired: 9,
}
```

`mode` 可选：

- `listen_jump`：听音跳字
- `image_choice`：看图找字
- `memory_match`：字卡翻翻乐
- `boss_quiz`：Boss 挑战

如果是 Boss 关，请设置 `isBoss: true` 且 `mode: 'boss_quiz'`。

## 如何替换角色素材

当前主角由 `src/game/objects/EggHero.ts` 使用 Phaser Graphics 绘制。后续可以：

1. 把正式图片放到 `public/assets/hero/`。
2. 在对应 Scene 中通过 `this.load.image()` 或预加载场景加载图片。
3. 将 `EggHero` 内的 Graphics 绘制替换为 `scene.add.image()` 或 Spine/序列帧动画。
4. 保留 `happyJump()`、`sadShake()`、`celebrate()` 这些方法，减少对场景代码的影响。

## 如何替换音效

当前音效在 `src/game/systems/sound.ts` 中用 Web Audio API 生成：

- `playCorrectSound()`
- `playWrongSound()`
- `playCoinSound()`
- `playWinSound()`

后续可将真实 mp3/ogg 放入 `public/assets/audio/`，再用 Phaser Sound 或 HTMLAudioElement 替换这些函数的内部实现。只要函数名不变，游戏场景无需改动。

## 如何扩展题库与学习策略

推荐方向：

- 增加分级题库：按年龄、主题、笔画数、易混字分组
- 增加复习算法：根据 `weak` 和 `learning` 状态自动提高出现频率
- 增加更多玩法：描一描、拼字、偏旁积木、听词找字
- 增加亲子报告：按周/月统计学习曲线
- 增加正式美术资源：角色皮肤、岛屿背景、粒子奖励
- 增加离线 PWA：支持下载安装到手机桌面
- 增加后端同步：多设备保存学习进度

## 版权说明

本 MVP 的角色、Boss、UI 图形均为原创占位绘制；emoji 使用系统字体渲染；音效为代码生成。项目没有引用“蛋仔派对”的官方形象、LOGO、音效或素材。
