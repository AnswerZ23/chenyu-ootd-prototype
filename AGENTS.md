# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

GitHub Pages deployment rule:
- This prototype is deployed at `https://answerz23.github.io/chenyu-ootd-prototype/`, so public assets live under a repository subpath in production.
- Do not hard-code public image or video paths as root-relative strings like `/frames/...`, `/reference/...`, or `/templates/...`.
- Use the `asset(...)` helper in `src/App.jsx` for public media paths so Vite can apply `import.meta.env.BASE_URL` locally and on GitHub Pages.
- When reading old localStorage project data, keep normalizing stored media paths so older `/frames/...` records do not continue to render as broken assets online.

OOTD 2.0 project-mode decisions:
- This v2 prototype is independent from `ootd-merchant-prototype`; do not back-port changes unless explicitly requested.
- The first screen is the project home, not the three-step workbench.
- The front stage no longer uses "任务列表" or "任务中心". Use "项目", "历史项目", and "项目工作台".
- "新建项目" immediately creates a named project and enters the project workbench. Project naming follows `YYMMDD-HHMM-NNN 模板名称`, such as `260618-1342-001 男装车内OOTD`.
- A project contains template selection, uploaded materials, preview rows, action/scene configuration, generated videos, and download actions.
- Keep at most 10 projects. When the user tries to create the 11th project, show a blocking prompt and require manual deletion first; do not auto-delete old projects.
- Project names are editable. Default names still follow the generated `YYMMDD-HHMM-NNN 模板名称` format, but users can rename a project from the project library or inside the workbench.
- Project-mode storage should support returning later to continue editing. Do not assume uploaded resources expire after 18 hours in the product experience; expose account capacity, currently 2GB, as used capacity / total capacity on the project home.
- Historical projects support entering and deleting. Deleting a project requires confirmation and removes that project's saved materials, configuration, previews, and video records.
- Returning home, refreshing, or exiting should preserve the current project state in the prototype's local persistence.
- The left sidebar with the three steps is only shown inside a project workbench. It should show the current project name and a return-home action.
- Download entry points stay inside the project workbench. Do not recreate a separate task-center detail page for v2 unless the product direction changes again.
- If a project has generated or generating videos, show a "生成管理" entry directly below the "视频生成与配置" sidebar step and above "使用指引" so users can find it immediately while entering step 3.
- The "生成管理" modal should present generated videos by generation timeline, with a title area, "全选" control under the title, a top-right "下载选中文件" action, per-video circular selection controls, single-video download actions, and visible progress cards for generating videos.
- The generation manager modal should use a multi-row grid, not a single endless horizontal row. On desktop, show 5 portrait video cards per row so 30 videos resolve into 6 rows × 5 columns with internal scrolling.
- The project home should open as a project-card wall with a lightweight "项目库" heading and one short description. Do not show a large descriptive hero, "项目首页", or "历史项目" section title before the cards.
- Keep a clear visual gap between the project-home heading block and the project-card grid; the heading should breathe, not touch the cards.
- "新建项目" is the first large square-like project card in the gallery, not a separate primary button floating outside the project list.
- Project cards use one shared anatomy: top half visual preview, bottom half project name, latest save time, and video count. The preview area should place vertical video content inside the wide card frame with a centered portrait crop and blurred side-fill background, similar to HeyGen video library cards.
- Project-card status badges use three product states derived from project contents: no generated videos means "编辑中"; any generated videos and no generating/queued videos means "待下载"; any generating or queued videos means a generation state whether or not completed videos already exist.
- The visible generation-state badge is "生成 X", with a space between "生成" and the number. X is the number of videos currently generating or queued. Completed videos remain counted only in the bottom "X 条视频" pill.
- Project-card video count is the number of completed downloadable videos only. If a card says "30 条视频", entering that project must expose 30 downloadable video records.
- Project-card status badges must distinguish editable states from delivery states: keep "待下载" green, use a visibly different warm/neutral treatment for "编辑中", and use a cool/progress treatment for "生成中".
- Historical projects should appear as large visual project cards in a multi-column grid. On wide desktop, aim for about four cards per row so each card feels full enough to inspect.
- Clicking a project card body enters the project directly. Do not show a visible "进入项目" button on each card.
- Project delete appears as a direct top-right delete button on card hover/focus, followed by the existing delete confirmation. Do not use a persistent `...` menu for deletion.
- Inside the project workbench, do not show a duplicate full-width current-project status bar above step 1. The left sidebar already owns the current project name and return-home action.
- In the project workbench sidebar, keep the three-step navigation close under the current-project block and its separator; do not let the steps float in the vertical middle of the sidebar.

Upload-material area decisions:
- "是否自动带入上次素材" is a compact checked control beside the "上传素材" heading, not a large banner.
- Upload entry points appear as a `+` card after the last material card; avoid separate "上传多张" buttons.
- Material thumbnails should show the full image without cropping, and each material card keeps the "参考规范" entry at the lower-right of the card body.
- Model front-face and garment front-flat-lay upload cards must use the same card width, image ratio, and visual scale. Do not let the garment card stretch wider just because the garment group now has fewer fixed slots.
- Uploaded material cards use delete buttons and no selected state; after deletion, the same card position becomes a re-upload entry.
- Required upload slots are model front face and garment front flat-lay only. Do not show separate garment slots for back flat-lay, detail close-up, or wearing-effect image; any extra garment references can only be added through the "继续上传" supplemental card.
- Garment images have a hard product limit of 5 total images: 1 required front flat-lay plus up to 4 supplemental reference images through "继续上传".
- The right-side upload guidance separates model-image requirements from garment-image requirements with clearly different visual treatments, so users can scan them independently.
- Front-face reference requirements include a concrete resolution floor: at least 1024 x 1024px, with 1536px or above preferred.
- Do not show a separate "参考视频模板" summary strip inside the upload-material area; template context belongs in the template-selection step.

Preview and result decisions:
- User-facing copy must avoid workflow terms like input/output. Use plain Chinese such as "确认预览图", "预览图已确认", and "用于生成视频".
- Preview confirmation uses a vertical preview card with click-to-enlarge behavior. Do not show the old right-side original-material or quality-check cards in this step.
- The result step only shows "重抽视频" and "下载视频" in the main action row; do not show a "返回参数" button there.

Video-generation module decisions:
- The front-stage workflow is now three steps: 选择模板, 上传素材, 视频生成与配置. Do not split preview confirmation, parameter configuration, and result download into separate workbench sections.
- Preview count is template configuration, not a global hard-code. The 男装车内 OOTD template currently uses 6 reference samples, while future templates may use 4, 6, or 8.
- For the 男装车内 OOTD template, one preview generation action produces 6 preview images, displayed as 6 rows inside "视频生成与配置".
- Each preview row owns its own action/scene configuration and video result area. Users can reroll one preview row without affecting the other five.
- Model selection and video quantity are global options for the whole "视频生成与配置" module, not repeated inside every row.
- "开源模型" and "闭源模型" are passed as front-end parameters; the actual model invocation happens inside the workflow.
- Single-preview video generation can request at most 5 videos at once. A whole project can retain at most 30 generated or generating video records.
- Re-running generation appends new video records until the project limit is reached; it does not overwrite existing generated videos unless the user explicitly deletes or regenerates a specific video.
- Prompt data must be stored in two layers: the current editable prompt state on each preview row and a prompt snapshot on every video record at generation time.
- "AI一键配置" belongs at the module level and can fill all generated preview-row configurations using a mix of built-in prompt plans and AI-generated output. If no preview image has been generated, clicking it must show "请先生成预览图" and must not write configuration text.
- New project configuration inputs must start empty. Do not preload sample action or scene text such as "系安全带" or "城市道路" into the editable textareas.
- The left sidebar's template step subtitle mirrors the selected template name, such as "男装车内 OOTD".
- Do not show a separate template-summary card inside "视频生成与配置"; selected-template context belongs in the sidebar and template-selection step.
- Preview confirmation is implicit: if the user does not reroll a preview image, it participates in video generation by default. Do not show "全部确认" or row-level "已确认/待确认" states.
- Put global model selection and video quantity on the left side of the video-generation action bar, and keep the "生成视频" action sticky while the user scrolls through step 3.
- Place "AI一键配置" inside the global action bar to the right of video quantity, not in the module title area.
- The sticky global action should use "批量生成视频" plus a visually distinct "批量下载" button. Do not show extra explanatory copy beside these buttons.
- Each preview row should expose its own "生成视频" button in the row configuration column, and the row video-result column should reserve compact "重抽" and "下载" actions.
- Sidebar completion checks are state-based: template is done after a template is selected; upload is done only when required materials are present; video generation is done after either batch or single-row video generation starts.
- Multi-video row results should show at least two video-card spaces in the generated-video column; additional videos scroll horizontally. Keep the configuration column tighter so the video area has room.
- Row-level download means downloading the currently selected generated video card. Batch download downloads all generated videos and does not use row checkboxes.
- Balance-related UI must not use the old credit wording. Use a yuan/balance icon plus the RMB amount instead.
- Generation-related buttons must display estimated balance cost with the yuan icon: preview image generation costs 0.5 yuan per image, preview reroll costs 0.5 yuan per image, video generation costs 1.5 yuan per video, and row-level video generation shows yuan icon + 1.5 /条.
- Estimated cost and actual billing are separate states. Before a workflow call, show "预计消耗" with the yuan icon; after generation completes, show "实际扣费" on generated video records.
- Cost labels inside action buttons should use a compact cost badge, separating the primary action text from "预计消耗" and the yuan icon. Do not place long cost copy as plain button text because it breaks the video-generation toolbar layout.
- Newly generated videos use a uniform 30-second countdown/progress simulation before becoming downloadable. After 30 seconds, the same record must move from generating/queued state into downloadable outputs across the project home, sidebar generation management, and step 3.
- The empty row-level "生成视频" placeholder card must not show an extra plus/circle icon. It should only show "生成视频" plus the yuan icon and "1.5/条" in a clean centered layout.
- AI生成 costs 0.1 yuan per action or scene prompt. AI一键配置 costs 1.2 yuan per click because it generates 12 prompt items across 6 preview rows and writes them directly into their input textareas.
- The top-right account balance label is "可用余额" and the value uses the yuan icon plus amount.
- The left-sidebar "生成管理" entry should be a stronger shortcut label, without secondary action copy like "查看生成进度" or "快速下载视频"; keep only the title and the count summary.
- Generation manager selection controls use circular dots only: selected = solid dot, unselected = hollow dot. Do not use square checkbox visuals.
- Model upload only requires one front-face photo. Do not show full-body or side-face model upload slots in the v2 workbench.
- Project-level generated video records must synchronize into step 3. If a project shows 3 downloadable videos, step 3 must show 3 ready video cards across the preview rows; if it shows 30, step 3 must expose 30 ready video sources.
- New projects start with ungenerated preview rows. The preview image area should show a clear "预览图待生成" empty state until the user clicks "生成预览图"; do not preload finished preview images for a just-created project.
- Row video-result carousels must keep stable card widths while the page scrolls. Do not use scroll-snap, hover-driven selected-video changes, or focus-state width enlargement that can cause the horizontal rail to jump between the first and last video after users scroll away and back.
- In the upload step, the right-side material-guidance panel should sit lower so its top aligns with the upload material card area, not the top of the section header.
- In each preview row, the single-row button text is "AI生成". Clicking it writes generated copy directly into the editable input textarea as a new line. Do not show a separate generated-copy area, "应用" action, or "已应用" state.
- Quick prompt chips in the configuration area append their label into the editable input textarea as a new line. They must not overwrite existing text, trigger AI generation, or overwrite hidden generation snapshots.
- Quick prompt suggestions must be based on the actual preview image content. The preview image has higher generation weight than prompt text, so do not offer weather/scene suggestions that conflict with the current image, such as asking for rain when the preview is clearly a bright car interior.

Task-list decisions:
- The left-sidebar task entry opens an independent history-task page, not a loose raw list inside the workbench.
- Design the task-list page as a polished task center based on the workbench information atoms: selected template, uploaded materials, preview images, per-preview action/scene config, and generated video files.
- Each task row displays only the task ID and template name, such as "260520-1421-001 男装车内OOTD"; do not show brand, status, time, preview thumbnails, prompt details, QA states, or a detail panel.
- The task ID format is YYMMDD-HHMM-NNN.
- Keep at most 10 historical task records. When new records exceed 10, prune the oldest record automatically.
- The task detail area must clearly answer where the user input items are and where the video output files are. Use a richer visual layout when helpful; the row-only display rule applies to the history list rows, not to the detail workspace.
- The task center first screen must answer the task delivery state: task ID, template name, input completeness, output file count, delivery status, and a batch-download action.
- The task cover/hero must use a fixed 320-360px visual band so it never pushes the user-input section or video-output entry below the first screen.
- In the task detail workspace, expose user-input items and video-output files within the first screen or at the first-screen lower edge, with output files treated as a core module rather than a late appendix.
- The task center should be left-aligned in the main work area on wide screens, not centered with a large empty gutter. The history index and task detail should feel like one production workspace.
- On desktop, the task history index panel should stay visible as the user scrolls the task detail page. Use a sticky left panel rather than letting the list disappear with the first screen.
- The task history index should feel like a refined production-task index, not a heavy backend table; keep rows lightweight while preserving the strict "task ID + template name" row content rule.
- In the task history index, place the template name under the task ID inside each row so individual tasks scan clearly; do not add any extra row fields beyond those two values.
- Do not show a "返回工作台" button inside the task history panel header. The panel should focus on history-task navigation.
- The top delivery bar in the task center should keep only the task identity, delivery status ("可下载" or "待生成"), and package download action. Do not add delete actions there, and avoid repeating material or output counts as extra chips in this compact bar.
- The task center first screen should prioritize helping users clearly inspect their original uploaded materials and generated videos. Task IDs, model settings, action/scene prompts, and preview-plan details are secondary and can be shown in a compact bar or collapsible area.
- Original material images in the task center must be large enough to inspect, with model and garment images shown as primary source cards rather than small thumbnails. Generated videos need a large active preview plus clear package-download and single-download actions.
- Task-center output counts must handle real variance: a task can have 0 to 30 generated videos. Show an explicit empty state and disable package download for 0 videos; use an internal scrollable file queue for many videos so the page does not become unmanageably long.
- Task-center video previews should look like short-form vertical video, not a wide cropped image. Keep play, pause, and maximize controls visible as a light overlay that does not obscure the clothing or model.
- Long video filenames must not overflow their cards. Clamp or wrap names within the card and keep the full name accessible through the element title or an equivalent detail affordance.
- When a task has multiple input materials, group them into model materials and garment materials. Required primary materials should be visually larger than supplemental references, and every material card should support click-to-enlarge.
- In the task center source-material band, show model materials as one horizontal row and garment materials as a separate horizontal row on desktop. Avoid side-by-side group columns that make the two material types visually merge.
- The task center detail workspace should keep three clear zones: 原输入素材 as a compact upper material band, 预览区域 as the lower-left large vertical preview, and 视频文件 as the lower-right file queue. The material band should be recognizable but not so tall that the preview area disappears from the first screen.
- The task history index should feel visually full even with only 10 rows. Keep row content limited to task ID and template name, but use row height, subtle card backgrounds, state dots, selected shadows, and a small list-rule footer to improve polish.
