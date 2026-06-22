# 晨羽 OOTD 商家原型

这是“晨羽 OOTD：服装素材爆款复刻机”的前端产品原型，用于演示项目制工作流、素材上传、预览生成、视频生成管理和下载状态。

## 本地运行

```powershell
npm install
npm run dev
```

默认会启动到本地 Vite 服务，通常是：

```text
http://127.0.0.1:5173/
```

如果该端口被占用，Vite 会自动切换到下一个端口。

## 构建检查

```powershell
npm run build
```

## GitHub Pages 发布

线上地址：

```text
https://answerz23.github.io/chenyu-ootd-prototype/
```

这个项目部署在 GitHub Pages 的仓库子路径下，所以静态图片和视频不能直接写成网站根路径，例如：

```js
"/frames/frame_00.jpg"
"/reference/model-front-reference.png"
"/templates/car-ootd-template.mp4"
```

新增 `public/` 里的图片或视频时，请使用 `src/App.jsx` 里的 `asset(...)` 方法：

```js
asset("/frames/frame_00.jpg")
asset("/reference/model-front-reference.png")
asset("/templates/car-ootd-template.mp4")
```

这样本地开发和 GitHub Pages 都能正确加载资源：

- 本地：`http://127.0.0.1:5173/frames/frame_00.jpg`
- 线上：`https://answerz23.github.io/chenyu-ootd-prototype/frames/frame_00.jpg`

## 主要文件

- `src/App.jsx`：核心原型交互与页面结构
- `src/styles.css`：界面样式
- `public/`：原型演示素材
- `AGENTS.md`：后续协作与产品规则说明
