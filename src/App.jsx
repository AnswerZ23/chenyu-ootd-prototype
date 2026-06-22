import { useEffect, useRef, useState } from "react";

const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const frames = [
  asset("/frames/frame_00.jpg"),
  asset("/frames/frame_02.jpg"),
  asset("/frames/frame_04.jpg"),
  asset("/frames/frame_06.jpg"),
  asset("/frames/frame_08.jpg"),
  asset("/frames/frame_10.jpg"),
];

const templateVideo = asset("/templates/car-ootd-template.mp4");

const faceMaterialTypes = [
  {
    title: "正脸照",
    desc: "五官清晰，适合作为主身份参考",
    frame: asset("/reference/model-front-reference.png?v=photo-20260617"),
    required: true,
    minimum: "最低 1024 x 1024px，建议 1536px 以上",
    tips: ["五官完整清晰，眼睛、鼻子、嘴完整可见", "无遮挡、无墨镜和帽子，头部不要过小", "光线均匀，避免强阴影、强滤镜和明显压缩失真"],
  },
];

const garmentMaterialTypes = [
  {
    title: "正面平铺图",
    desc: "颜色、版型和 Logo 主参考",
    frame: asset("/reference/garment-front-flat-reference.png?v=image2-20260617-1342"),
    required: true,
    tips: ["衣服正面完整展示", "领口、袖口、下摆不要被裁切", "Logo、纹理和颜色尽量清晰"],
  },
  {
    title: "背面平铺图",
    desc: "用于补充背部结构和领口信息",
    frame: asset("/reference/garment-back-flat-reference.png?v=image2-20260617-1342"),
    tips: ["衣服背面完整展示", "背部结构、后领和下摆清楚", "背景保持干净"],
  },
  {
    title: "细节特写图",
    desc: "补充纹理、纽扣、印花等细节",
    frame: asset("/reference/garment-detail-reference.png?v=image2-20260617-1342"),
    tips: ["拍清面料肌理", "纽扣、刺绣、印花等重点细节清楚", "避免反光和过曝"],
  },
  {
    title: "上身效果图",
    desc: "帮助还原真实穿着比例",
    frame: asset("/reference/garment-look-reference.png?v=image2-20260617-1342"),
    tips: ["展示真实穿着比例", "衣服主体完整，不被手臂或道具遮挡", "姿态自然，便于还原上身效果"],
  },
];

const defaultActionSuggestions = [
  {
    label: "沿用当前动作",
    text: "沿用当前预览图动作",
    prompt: "基于当前预览图的车内人物姿态延展动作，不大幅改变身体方向和镜头构图，动作自然连续。",
  },
  {
    label: "强化穿搭展示",
    text: "强化穿搭展示",
    prompt: "在保留当前预览图人物姿态和车内构图的基础上，轻微强调上衣版型、肩线和袖口细节，动作幅度保持克制。",
  },
];

const defaultSceneSuggestions = [
  {
    label: "保留当前光线",
    text: "保留当前车内光线",
    prompt: "基于当前预览图已有的车内光线、窗外环境和构图继续生成，不强行改变天气、昼夜和道路类型，保持人物与服装清晰。",
  },
  {
    label: "弱化窗外变化",
    text: "弱化窗外变化",
    prompt: "以当前预览图的车内画面为主，窗外只做轻微自然运动，不加入与画面冲突的雨天、夜景或复杂道路变化。",
  },
];

const actionPolishMap = {
  系安全带:
    "坐在驾驶座上，自然地拉过安全带并系好，眼神专注看向前方，双手随后轻握方向盘，整体动作自然流畅。",
  手持咖啡开车:
    "单手轻握方向盘，另一只手自然拿着咖啡杯，目视前方道路，姿态松弛自信，呈现都市通勤穿搭氛围。",
  看后视镜转头:
    "驾驶过程中自然看向后视镜，并轻微转头观察侧后方，动作克制真实，人物表情沉稳专注。",
  打方向盘:
    "双手轻握方向盘并自然转向，车辆行驶在城市道路中，身体随方向轻微移动，画面真实顺滑。",
};

const scenePolishMap = {
  晴天:
    "白天晴朗的城市街道，车流稀少，阳光透过车窗洒进车内，光影柔和自然，整体画面明亮干净。",
  高架道路:
    "城市高架道路行驶场景，远处建筑和道路栏杆有轻微运动模糊，呈现通勤感和速度感。",
  城市道路:
    "日常城市道路，车流不拥挤，窗外建筑自然掠过，光线真实，适合男装 OOTD 种草视频。",
};

const actionSuggestionMap = {
  系安全带: [
    {
      label: "沿用系安全带",
      text: "系安全带",
      prompt: "基于预览图中人物坐在驾驶座、正在系安全带的实际画面，延续拉过安全带并扣好的动作，身体姿态和镜头角度保持一致。",
    },
    {
      label: "整理安全带",
      text: "整理安全带",
      prompt: "基于当前人物已在车内系安全带的画面，只补充整理安全带和衣服褶皱的小动作，避免改变为喝咖啡、转头或其他不匹配动作。",
    },
    {
      label: "看向前方",
      text: "看向前方",
      prompt: "保持预览图中的驾驶座位置和安全带状态，让人物自然抬眼看向前方，动作幅度轻，服装主体保持清晰。",
    },
  ],
  手持咖啡开车: [
    {
      label: "沿用咖啡动作",
      text: "手持咖啡开车",
      prompt: "基于预览图中车内通勤画面，延续单手持咖啡、另一只手靠近方向盘的动作，不改变人物位置和镜头构图。",
    },
    {
      label: "轻放咖啡",
      text: "轻放咖啡",
      prompt: "在当前车内画面基础上，让人物轻微放下咖啡杯，动作自然克制，避免新增与预览图不一致的大幅肢体变化。",
    },
  ],
  看后视镜转头: [
    {
      label: "沿用转头",
      text: "看后视镜转头",
      prompt: "基于预览图中的车内侧向姿态，让人物自然看向后视镜并轻微转头，保持当前光线和镜头视角。",
    },
    {
      label: "小幅回头",
      text: "小幅回头",
      prompt: "沿用当前预览图的车内镜头，只做小幅回头观察动作，避免改变座位、方向盘位置或画面主体。",
    },
  ],
  打方向盘: [
    {
      label: "沿用方向盘",
      text: "打方向盘",
      prompt: "基于预览图中的车内驾驶姿态，延续轻微打方向盘动作，人物上半身和服装展示保持稳定清晰。",
    },
    {
      label: "轻握方向盘",
      text: "轻握方向盘",
      prompt: "保持当前预览图构图，让人物双手或单手自然轻握方向盘，动作幅度小，不改变天气和车内光线。",
    },
  ],
};

const sceneSuggestionMap = {
  城市道路: [
    {
      label: "沿用车内自然光",
      text: "车内自然光",
      prompt: "基于预览图已有的车内自然光和城市道路窗外画面继续生成，窗外只做轻微运动，不强行改成雨天、夜景或高架道路。",
    },
    {
      label: "突出通勤感",
      text: "车内通勤感",
      prompt: "沿用当前车内与窗外城市道路氛围，轻微强化日常通勤感，保持服装、人物脸部和车内空间清晰稳定。",
    },
    {
      label: "保留当前构图",
      text: "保留当前构图",
      prompt: "严格基于当前预览图构图生成后续视频，保留车内座椅、车窗光线和人物位置，不追加与画面冲突的新场景。",
    },
  ],
  晴天: [
    {
      label: "沿用明亮车内",
      text: "明亮车内自然光",
      prompt: "基于预览图中已有的明亮车内光线继续生成，保持窗外自然亮度和人物服装清晰，不把画面改成雨天或夜景。",
    },
    {
      label: "柔和窗光",
      text: "柔和窗光",
      prompt: "沿用当前预览图的车窗自然光，让光线更柔和干净，人物面部和黑色服装细节保持可见。",
    },
  ],
  高架道路: [
    {
      label: "保留高架感",
      text: "保留高架行驶感",
      prompt: "基于当前预览图的车内行驶画面，窗外只保留轻微道路运动感，不强行替换为雨天、夜景或完全不同地点。",
    },
    {
      label: "弱化背景",
      text: "弱化窗外背景",
      prompt: "以预览图中的人物和服装为主体，窗外道路背景保持轻微虚化运动，不抢服装展示重点。",
    },
  ],
};

const templatePreviewSamples = [
  {
    id: "sample-01",
    title: "预览图 1",
    sample: "参考样本 1",
    shot: "上车系安全带",
    image: frames[0],
    action: "系安全带",
    scene: "城市道路",
  },
  {
    id: "sample-02",
    title: "预览图 2",
    sample: "参考样本 2",
    shot: "手持咖啡开车",
    image: frames[1],
    action: "手持咖啡开车",
    scene: "晴天",
  },
  {
    id: "sample-03",
    title: "预览图 3",
    sample: "参考样本 3",
    shot: "看后视镜转头",
    image: frames[2],
    action: "看后视镜转头",
    scene: "高架道路",
  },
  {
    id: "sample-04",
    title: "预览图 4",
    sample: "参考样本 4",
    shot: "打方向盘",
    image: frames[3],
    action: "打方向盘",
    scene: "城市道路",
  },
  {
    id: "sample-05",
    title: "预览图 5",
    sample: "参考样本 5",
    shot: "车内穿搭展示",
    image: frames[4],
    action: "手持咖啡开车",
    scene: "晴天",
  },
  {
    id: "sample-06",
    title: "预览图 6",
    sample: "参考样本 6",
    shot: "收尾行驶镜头",
    image: frames[5],
    action: "打方向盘",
    scene: "城市道路",
  },
];

const initialPreviewRows = templatePreviewSamples.map((sample) => ({
  ...sample,
  version: 1,
  actionText: sample.action,
  sceneText: sample.scene,
  actionPrompt: actionSuggestionMap[sample.action]?.[0]?.prompt ?? actionPolishMap[sample.action],
  scenePrompt: sceneSuggestionMap[sample.scene]?.[0]?.prompt ?? scenePolishMap[sample.scene],
  videoStatus: "待生成",
}));

function materialKey(group, title) {
  return `${group}:${title}`;
}

function getActionSuggestions(row) {
  return actionSuggestionMap[row.action] ?? defaultActionSuggestions;
}

function getSceneSuggestions(row) {
  return sceneSuggestionMap[row.scene] ?? defaultSceneSuggestions;
}

function fallbackActionPrompt(row) {
  return `基于预览图“${row.shot}”的实际画面继续生成，保留当前人物姿态、车内构图和服装展示重点，只做自然连续的小幅动作。`;
}

function fallbackScenePrompt(row) {
  return `基于预览图“${row.shot}”的实际车内画面继续生成，保留当前光线、窗外环境和构图，不强行改变天气、昼夜或道路类型。`;
}

const MAX_TASK_HISTORY = 10;
const PROJECT_LIMIT = 10;
const VIDEO_GENERATION_DURATION_MS = 30000;
const VIDEO_GENERATION_TICK_MS = 1000;
const PROJECT_STORAGE_KEY = "chenyu-ootd-v2-projects";
const PROJECT_VIEW_STORAGE_KEY = "chenyu-ootd-v2-view";
const PROJECT_ACTIVE_STORAGE_KEY = "chenyu-ootd-v2-active-project";

const defaultTaskMaterials = {
  model: [
    {
      title: "正脸照",
      desc: "身份与五官主参考",
      image: asset("/reference/model-front-reference.png?v=photo-20260617"),
      alt: "模特正脸照",
      required: true,
    },
  ],
  garment: [
    {
      title: "正面平铺图",
      desc: "颜色、版型和 Logo 主参考",
      image: asset("/reference/garment-front-flat-reference.png?v=image2-20260617-1342"),
      alt: "服装正面平铺图",
      required: true,
    },
    {
      title: "背面平铺图",
      desc: "背部结构与后领信息",
      image: asset("/reference/garment-back-flat-reference.png?v=image2-20260617-1342"),
      alt: "服装背面平铺图",
    },
    {
      title: "细节特写图",
      desc: "纹理、纽扣和印花细节",
      image: asset("/reference/garment-detail-reference.png?v=image2-20260617-1342"),
      alt: "服装细节特写图",
    },
    {
      title: "上身效果图",
      desc: "真实穿着比例参考",
      image: asset("/reference/garment-look-reference.png?v=image2-20260617-1342"),
      alt: "服装上身效果图",
    },
  ],
};

const tasks = [
  {
    id: "260617-1928-001",
    template: "男装车内OOTD",
    hero: frames[0],
    outputCount: 3,
    inputs: {
      templateVideo: "男装车内 OOTD 模板",
      model: "正脸照",
      garment: "正面平铺图、细节特写图、上身效果图",
      generation: "开源模型 / 每张预览图 1 条视频",
    },
    outputs: [
      { name: "260617-1928-001-01.mp4", shot: "上车系安全带", poster: frames[0], status: "可下载" },
      { name: "260617-1928-001-02.mp4", shot: "手持咖啡开车", poster: frames[1], status: "可下载" },
      { name: "260617-1928-001-03.mp4", shot: "看后视镜转头", poster: frames[2], status: "可下载" },
    ],
  },
  { id: "260617-1846-002", template: "男装车内OOTD", hero: frames[1], outputCount: 30 },
  { id: "260617-1732-003", template: "男装车内OOTD", hero: frames[2], outputCount: 0, generatingCount: 4 },
  { id: "260616-2015-004", template: "男装车内OOTD", hero: frames[3], outputCount: 12, generatingCount: 3 },
  { id: "260616-1830-005", template: "男装车内OOTD", hero: frames[4], outputCount: 7 },
  { id: "260615-2124-006", template: "男装车内OOTD", hero: frames[5], outputCount: 18 },
  { id: "260615-1658-007", template: "男装车内OOTD", hero: frames[0], outputCount: 1 },
  { id: "260614-1942-008", template: "男装车内OOTD", hero: frames[1], outputCount: 24 },
  { id: "260614-1426-009", template: "男装车内OOTD", hero: frames[2], outputCount: 5 },
  { id: "260613-2055-010", template: "男装车内OOTD", hero: frames[3], outputCount: 15 },
  { id: "260613-1738-011", template: "男装车内OOTD", hero: frames[4] },
].slice(0, MAX_TASK_HISTORY);

function formatProjectTime(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yy}${mm}${dd}-${hh}${min}`;
}

function formatSavedTime(date = new Date()) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${min}`;
}

function getNextProjectNumber(projects) {
  const numbers = projects
    .map((project) => Number(project.id.split("-").at(-1)))
    .filter((number) => Number.isFinite(number));
  return Math.max(0, ...numbers) + 1;
}

function buildProjectName(id, template = "男装车内OOTD") {
  return `${id} ${template}`;
}

function getProjectCover(project, fallbackIndex = 0) {
  return project.cover ?? project.outputs?.[0]?.poster ?? frames[fallbackIndex % frames.length];
}

function buildOutputVideo(source, index, options = {}) {
  const sample = templatePreviewSamples[index % templatePreviewSamples.length];
  const status = options.status ?? "可下载";
  const isGenerating = status === "生成中" || status === "队列中";
  return {
    id: options.id ?? `${source.id}-${String(index + 1).padStart(2, "0")}`,
    name: options.name ?? `${source.id}-${String(index + 1).padStart(2, "0")}-${sample.shot}.mp4`,
    shot: options.shot ?? sample.shot,
    poster: options.poster ?? sample.image,
    status,
    progress: isGenerating ? options.progress ?? 36 : 100,
    previewRowId: options.previewRowId,
    generationStartedAt: isGenerating ? options.generationStartedAt ?? Date.now() : undefined,
    generatedAt: options.generatedAt ?? formatSavedTime(new Date(Date.now() - index * 7 * 60 * 1000)),
  };
}

function createGeneratingOutputs(source, startIndex = 0, count = source.generatingCount ?? 0, options = {}) {
  const now = Date.now();
  return Array.from({ length: count }, (_, index) =>
    {
      const progress = options.fresh ? 0 : [18, 42, 67, 81][index % 4];
      return buildOutputVideo(source, startIndex + index, {
        status: index % 3 === 2 ? "队列中" : "生成中",
        progress,
        previewRowId: options.previewRowId,
        generationStartedAt: now - (progress / 100) * VIDEO_GENERATION_DURATION_MS,
      });
    }
  );
}

function isGeneratingOutput(output) {
  return output.status === "生成中" || output.status === "队列中";
}

function getGeneratingCount(project) {
  return project.generatingOutputs?.length ?? 0;
}

function deriveProjectStatus(project) {
  const generatingCount = getGeneratingCount(project);
  const readyCount = project.outputs?.length ?? 0;
  if (generatingCount > 0) return "生成中";
  if (readyCount > 0) return "待下载";
  return "编辑中";
}

function getProjectStatusLabel(project) {
  const status = deriveProjectStatus(project);
  if (status === "生成中") return `生成 ${getGeneratingCount(project)}`;
  return status;
}

function getProjectStatusClass(project) {
  return deriveProjectStatus(project);
}

function updateProjectGenerationProgress(project, now = Date.now()) {
  const generatingOutputs = project.generatingOutputs ?? [];
  if (generatingOutputs.length === 0) return project;

  let changed = false;
  const readyOutputs = [];
  const pendingOutputs = [];

  generatingOutputs.forEach((output) => {
    const progressSeed = output.progress ?? 0;
    const startedAt = output.generationStartedAt ?? now - (progressSeed / 100) * VIDEO_GENERATION_DURATION_MS;
    const elapsed = Math.max(0, now - startedAt);
    const nextProgress = Math.min(100, Math.round((elapsed / VIDEO_GENERATION_DURATION_MS) * 100));

    if (nextProgress >= 100) {
      changed = true;
      readyOutputs.push({
        ...output,
        status: "可下载",
        progress: 100,
        generationStartedAt: undefined,
        generatedAt: formatSavedTime(new Date(now)),
      });
      return;
    }

    const nextOutput = {
      ...output,
      status: output.status === "队列中" && nextProgress > 0 ? "生成中" : output.status,
      progress: nextProgress,
      generationStartedAt: startedAt,
    };

    if (
      output.progress !== nextOutput.progress ||
      output.status !== nextOutput.status ||
      output.generationStartedAt !== nextOutput.generationStartedAt
    ) {
      changed = true;
    }

    pendingOutputs.push(nextOutput);
  });

  if (!changed) return project;

  const nextProject = {
    ...project,
    outputs: [...(project.outputs ?? []), ...readyOutputs].slice(0, 30),
    generatingOutputs: pendingOutputs,
    updatedAt: formatSavedTime(new Date(now)),
  };

  return {
    ...nextProject,
    outputCount: nextProject.outputs.length,
    status: deriveProjectStatus(nextProject),
  };
}

function normalizeOutputList(project, outputs = []) {
  return outputs.map((output, index) => ({
    ...buildOutputVideo(project, index, { status: output.status ?? "可下载" }),
    ...output,
    status: isGeneratingOutput(output) ? output.status : "可下载",
    progress: isGeneratingOutput(output) ? output.progress ?? 42 : 100,
    generationStartedAt: isGeneratingOutput(output)
      ? output.generationStartedAt ?? Date.now() - ((output.progress ?? 42) / 100) * VIDEO_GENERATION_DURATION_MS
      : undefined,
  }));
}

function normalizeProject(project, index = 0) {
  const outputCount = Math.min(project.outputCount ?? project.outputs?.length ?? 0, 30);
  const outputs = Array.isArray(project.outputs) && project.outputs.length > 0
    ? normalizeOutputList(project, project.outputs)
    : Array.from({ length: outputCount }, (_, outputIndex) => buildOutputVideo(project, outputIndex));
  let generatingOutputs = Array.isArray(project.generatingOutputs)
    ? normalizeOutputList(project, project.generatingOutputs).map((output) => ({
        ...output,
        status: "生成中",
        progress: output.progress ?? 42,
      }))
    : [];

  if (project.status === "生成中" && generatingOutputs.length === 0) {
    generatingOutputs = createGeneratingOutputs(project, outputs.length, Math.max(1, Math.min(project.count ?? 2, 4)));
  }

  const normalized = {
    ...project,
    cover: project.cover ?? outputs[0]?.poster ?? frames[index % frames.length],
    outputs,
    generatingOutputs,
    outputCount: outputs.length,
  };
  return {
    ...normalized,
    status: deriveProjectStatus(normalized),
  };
}

function getProjectVideosForPreviewRow(project, rowId, rowIndex, rowCount) {
  if (!project) return [];
  const readyItems = (project.outputs ?? []).map((output, index) => ({ output, index, status: "ready" }));
  const generatingItems = (project.generatingOutputs ?? []).map((output, index) => ({
    output,
    index: (project.outputs?.length ?? 0) + index,
    status: "generating",
  }));

  return [...readyItems, ...generatingItems]
    .filter((item) => (
      item.output.previewRowId ? item.output.previewRowId === rowId : item.index % rowCount === rowIndex
    ))
    .map(({ output, index, status }) => ({
      id: output.id ?? output.name ?? `project-video-${index}`,
      sequence: index + 1,
      status,
      statusLabel: status === "generating" ? output.status ?? "生成中" : "可下载",
      progress: output.progress ?? (status === "generating" ? 42 : 100),
      poster: output.poster,
      sourceName: output.name,
      shot: output.shot,
    }));
}

function createProjectSnapshot(task, index) {
  const normalized = normalizeTask(task);
  const id = task.id;
  const generatingOutputs = createGeneratingOutputs(normalized, normalized.outputs.length);
  const project = {
    id,
    name: buildProjectName(id, task.template),
    template: task.template,
    cover: normalized.outputs[0]?.poster ?? task.hero ?? frames[index % frames.length],
    selectedTemplate: "car-ootd",
    previewRows: initialPreviewRows,
    model: "open",
    count: 1,
    deletedMaterials: {},
    outputs: normalized.outputs,
    generatingOutputs,
    outputCount: normalized.outputs.length,
    updatedAt: `06-${17 - Math.min(index, 4)} ${String(19 - index).padStart(2, "0")}:28`,
  };
  return {
    ...project,
    status: deriveProjectStatus(project),
  };
}

function createInitialProjects() {
  return tasks.slice(0, 4).map(createProjectSnapshot);
}

function safeReadLocalStorage(key) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWriteLocalStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Prototype only: local persistence can fail in private browsing.
  }
}

function getInitialProjectState() {
  let projects = createInitialProjects();
  const storedProjects = safeReadLocalStorage(PROJECT_STORAGE_KEY);
  if (storedProjects) {
    try {
      const parsed = JSON.parse(storedProjects);
      if (Array.isArray(parsed) && parsed.length > 0) {
        projects = parsed.slice(0, PROJECT_LIMIT).map(normalizeProject);
      }
    } catch {
      projects = createInitialProjects();
    }
  }

  const savedActiveId = safeReadLocalStorage(PROJECT_ACTIVE_STORAGE_KEY);
  const activeProject = projects.find((project) => project.id === savedActiveId) ?? null;
  const savedView = safeReadLocalStorage(PROJECT_VIEW_STORAGE_KEY);
  const viewMode = savedView === "project-workbench" && activeProject ? "project-workbench" : "home";

  return {
    projects,
    activeProjectId: activeProject?.id ?? null,
    activeProject,
    viewMode,
  };
}

function createTaskOutputs(task) {
  const outputCount = task.outputCount ?? 2;
  return Array.from({ length: outputCount }, (_, index) => buildOutputVideo(task, index));
}

function normalizeTask(task) {
  const outputs = task.outputs ?? createTaskOutputs(task);
  return {
    ...task,
    inputs: task.inputs ?? {
      templateVideo: "男装车内 OOTD 模板",
      model: "正脸照",
      garment: "正面平铺图、细节特写图、上身效果图",
      generation: "开源模型 / 每张预览图 1 条视频",
    },
    materials: task.materials ?? defaultTaskMaterials,
    outputs,
  };
}

export function App() {
  const initialDataRef = useRef(null);
  if (!initialDataRef.current) {
    initialDataRef.current = getInitialProjectState();
  }
  const initialData = initialDataRef.current;
  const initialProject = initialData.activeProject;

  const [projects, setProjects] = useState(initialData.projects);
  const [activeProjectId, setActiveProjectId] = useState(initialData.activeProjectId);
  const [previewRows, setPreviewRows] = useState(initialProject?.previewRows ?? initialPreviewRows);
  const [model, setModel] = useState(initialProject?.model ?? "open");
  const [count, setCount] = useState(initialProject?.count ?? 1);
  const [toast, setToast] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [batchGenerationRequest, setBatchGenerationRequest] = useState({ id: 0, quantity: 1 });
  const [viewMode, setViewMode] = useState(initialData.viewMode);
  const [selectedTemplate, setSelectedTemplate] = useState(initialProject?.selectedTemplate ?? "car-ootd");
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false);
  const [deletedMaterials, setDeletedMaterials] = useState(initialProject?.deletedMaterials ?? {});
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [generationManagerOpen, setGenerationManagerOpen] = useState(false);

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;
  const activeProjectVideoCount = (activeProject?.outputs?.length ?? 0) + (activeProject?.generatingOutputs?.length ?? 0);

  const completionStatus = {
    1: Boolean(selectedTemplate),
    2:
      !deletedMaterials[materialKey("model", "正脸照")] &&
      !deletedMaterials[materialKey("garment", "正面平铺图")],
    3: activeProjectVideoCount > 0 || previewRows.some((row) => row.videoStatus === "生成中" || row.videoStatus === "可下载"),
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    safeWriteLocalStorage(PROJECT_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    safeWriteLocalStorage(PROJECT_VIEW_STORAGE_KEY, viewMode);
    if (activeProjectId) {
      safeWriteLocalStorage(PROJECT_ACTIVE_STORAGE_KEY, activeProjectId);
    }
  }, [viewMode, activeProjectId]);

  useEffect(() => {
    if (!projects.some((project) => (project.generatingOutputs ?? []).length > 0)) return undefined;

    const timer = window.setInterval(() => {
      const now = Date.now();
      setProjects((items) => {
        let changed = false;
        const nextItems = items.map((project) => {
          const nextProject = updateProjectGenerationProgress(project, now);
          if (nextProject !== project) changed = true;
          return nextProject;
        });
        return changed ? nextItems : items;
      });
    }, VIDEO_GENERATION_TICK_MS);

    return () => window.clearInterval(timer);
  }, [projects]);

  useEffect(() => {
    if (!activeProjectId) return;
    const readyCount = previewRows.filter((row) => row.videoStatus === "可下载").length;
    setProjects((items) =>
      items.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              selectedTemplate,
              previewRows,
              model,
              count,
              deletedMaterials,
              outputCount: project.outputs?.length ?? readyCount,
              status: deriveProjectStatus(project),
              updatedAt: formatSavedTime(),
            }
          : project
      )
    );
  }, [activeProjectId, previewRows, model, count, selectedTemplate, deletedMaterials]);

  function updatePreviewRow(rowId, patch) {
    setPreviewRows((rows) =>
      rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row))
    );
  }

  function useExample(rowId, type, suggestion) {
    const target = previewRows.find((row) => row.id === rowId);
    const label = typeof suggestion === "string" ? suggestion : suggestion.text;
    const prompt = typeof suggestion === "string"
      ? type === "action"
        ? actionPolishMap[suggestion] ?? fallbackActionPrompt(target)
        : scenePolishMap[suggestion] ?? fallbackScenePrompt(target)
      : suggestion.prompt;

    updatePreviewRow(
      rowId,
      type === "action"
        ? { actionText: label, actionPrompt: prompt }
        : { sceneText: label, scenePrompt: prompt }
    );
  }

  function polish(rowId, type) {
    const target = previewRows.find((row) => row.id === rowId);
    if (!target) return;
    if (type === "action") {
      const match = getActionSuggestions(target).find((item) => target.actionText.includes(item.text.slice(0, 2)));
      updatePreviewRow(rowId, {
        actionPrompt: match ? match.prompt : fallbackActionPrompt(target),
      });
      setToast("已按当前预览图画面润色动作");
    } else {
      const match = getSceneSuggestions(target).find((item) => target.sceneText.includes(item.text.slice(0, 2)));
      updatePreviewRow(rowId, {
        scenePrompt: match ? match.prompt : fallbackScenePrompt(target),
      });
      setToast("已按当前预览图画面润色风景");
    }
  }

  function aiConfigureAll() {
    setPreviewRows((rows) =>
      rows.map((row, index) => {
        const action = templatePreviewSamples[index]?.action ?? "系安全带";
        const scene = templatePreviewSamples[index]?.scene ?? "城市道路";
        const actionSuggestion = getActionSuggestions({ action, shot: templatePreviewSamples[index]?.shot ?? row.shot })[0];
        const sceneSuggestion = getSceneSuggestions({ scene, shot: templatePreviewSamples[index]?.shot ?? row.shot })[0];
        return {
          ...row,
          actionText: action,
          sceneText: scene,
          actionPrompt: actionSuggestion?.prompt ?? actionPolishMap[action],
          scenePrompt: sceneSuggestion?.prompt ?? scenePolishMap[scene],
        };
      })
    );
    setToast("已按 6 张预览图画面生成配置方案");
  }

  function rerollPreview(rowId) {
    setPreviewRows((rows) =>
      rows.map((row, rowIndex) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          version: row.version + 1,
          confirmed: false,
          image: frames[(rowIndex + row.version) % frames.length],
          videoStatus: "待生成",
        };
      })
    );
    setToast("已重抽该预览图");
  }

  function downloadResult() {
    setToast("已加入下载队列");
  }

  function downloadProjectOutput(output) {
    setToast(`${output.name} 已加入下载队列`);
  }

  function downloadSelectedOutputs(outputs) {
    if (outputs.length === 0) return;
    setToast(`${outputs.length} 个视频已加入打包下载`);
  }

  function addProjectGeneratingOutputs(quantity = 1, rowId = null) {
    if (!activeProjectId) return;
    setProjects((items) =>
      items.map((project) => {
        if (project.id !== activeProjectId) return project;
        const startIndex = (project.outputs?.length ?? 0) + (project.generatingOutputs?.length ?? 0);
        const generatingOutputs = [
          ...(project.generatingOutputs ?? []),
          ...createGeneratingOutputs(project, startIndex, quantity, { fresh: true, previewRowId: rowId }),
        ];
        const nextProject = {
          ...project,
          generatingOutputs,
          updatedAt: formatSavedTime(),
        };
        return {
          ...nextProject,
          status: deriveProjectStatus(nextProject),
        };
      })
    );
  }

  function promoteProjectGeneratingOutput() {
    if (!activeProjectId) return;
    setProjects((items) =>
      items.map((project) => {
        if (project.id !== activeProjectId) return project;
        const generatingOutputs = [...(project.generatingOutputs ?? [])];
        const completed = generatingOutputs.shift();
        if (!completed) return project;
        const readyOutput = {
          ...completed,
          status: "可下载",
          progress: 100,
          generatedAt: formatSavedTime(),
        };
        const nextProject = {
          ...project,
          outputs: [...(project.outputs ?? []), readyOutput].slice(0, 30),
          generatingOutputs,
          updatedAt: formatSavedTime(),
        };
        return {
          ...nextProject,
          outputCount: nextProject.outputs.length,
          status: deriveProjectStatus(nextProject),
        };
      })
    );
  }

  function goToStep(id, stepNumber) {
    setViewMode("project-workbench");
    setActiveStep(stepNumber);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function loadProject(project) {
    setActiveProjectId(project.id);
    setSelectedTemplate(project.selectedTemplate ?? "car-ootd");
    setPreviewRows(project.previewRows ?? initialPreviewRows);
    setModel(project.model ?? "open");
    setCount(project.count ?? 1);
    setDeletedMaterials(project.deletedMaterials ?? {});
    setActiveStep(1);
    setViewMode("project-workbench");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function createProject() {
    if (projects.length >= PROJECT_LIMIT) {
      setLimitDialogOpen(true);
      return;
    }
    const number = getNextProjectNumber(projects);
    const id = `${formatProjectTime()}-${String(number).padStart(3, "0")}`;
    const project = {
      id,
      name: buildProjectName(id),
      template: "男装车内OOTD",
      cover: frames[0],
      selectedTemplate: "car-ootd",
      previewRows: initialPreviewRows,
      model: "open",
      count: 1,
      deletedMaterials: {},
      outputs: [],
      outputCount: 0,
      updatedAt: formatSavedTime(),
      status: "编辑中",
    };
    setProjects((items) => [project, ...items]);
    loadProject(project);
    setToast("已新建项目，内容会实时保存");
  }

  function returnHome() {
    setViewMode("home");
    setToast("项目已实时保存");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function askDeleteProject(project) {
    setProjectToDelete(project);
  }

  function confirmDeleteProject() {
    if (!projectToDelete) return;
    setProjects((items) => items.filter((project) => project.id !== projectToDelete.id));
    if (projectToDelete.id === activeProjectId) {
      setActiveProjectId(null);
      setViewMode("home");
    }
    setProjectToDelete(null);
    setToast("项目已删除");
  }

  function startGeneration() {
    setPreviewRows((rows) =>
      rows.map((row) => ({ ...row, videoStatus: "生成中" }))
    );
    setBatchGenerationRequest((request) => ({ id: request.id + 1, quantity: count }));
    goToStep("step-generate", 3);
  }

  function startRowGeneration(rowId, quantity = 1) {
    setPreviewRows((rows) =>
      rows.map((row) =>
        row.id === rowId ? { ...row, videoStatus: "生成中" } : row
      )
    );
    addProjectGeneratingOutputs(quantity, rowId);
  }

  function markRowVideoReady(rowId) {
    setPreviewRows((rows) =>
      rows.map((row) =>
        row.id === rowId ? { ...row, videoStatus: "可下载" } : row
      )
    );
    promoteProjectGeneratingOutput();
  }

  function selectTemplate(templateId) {
    if (templateId !== "car-ootd") {
      setToast("该爆款模板即将开放");
      return;
    }
    setSelectedTemplate(templateId);
    setToast("已选中男装车内 OOTD 模板");
  }

  function previewTemplateVideo(event) {
    event.stopPropagation();
    setTemplatePreviewOpen(true);
  }

  return (
    <div className="app">
      <TopBar />
      <div className={viewMode === "home" ? "shell home-shell" : "shell"}>
        {viewMode !== "home" && (
          <Sidebar
            step={activeStep}
            goToStep={goToStep}
            selectedTemplateName={selectedTemplate === "car-ootd" ? "男装车内 OOTD" : "未选择模板"}
            completionStatus={completionStatus}
            activeProject={activeProject}
            returnHome={returnHome}
            openGenerationManager={() => setGenerationManagerOpen(true)}
          />
        )}
        <main className={viewMode === "home" ? "main home-page" : "main flow-page"}>
          {viewMode === "home" ? (
            <ProjectHome
              projects={projects}
              createProject={createProject}
              openProject={loadProject}
              askDeleteProject={askDeleteProject}
            />
          ) : (
            <>
              <div id="step-template" className="flow-section template-flow-section">
                <TemplateScreen
                  selectedTemplate={selectedTemplate}
                  selectTemplate={selectTemplate}
                  previewTemplateVideo={previewTemplateVideo}
                />
              </div>
              <div id="step-upload" className="flow-section">
                <UploadScreen
                  goToStep={goToStep}
                  deletedMaterials={deletedMaterials}
                  setDeletedMaterials={setDeletedMaterials}
                />
              </div>
              <div id="step-generate" className="flow-section">
                <VideoGenerationScreen
                  previewRows={previewRows}
                  updatePreviewRow={updatePreviewRow}
                  model={model}
                  setModel={setModel}
                  count={count}
                  setCount={setCount}
                  polish={polish}
                  useExample={useExample}
                  rerollPreview={rerollPreview}
                  aiConfigureAll={aiConfigureAll}
                  onGenerate={startGeneration}
                  downloadResult={downloadResult}
                  generateRowVideo={startRowGeneration}
                  markRowVideoReady={markRowVideoReady}
                  batchGenerationRequest={batchGenerationRequest}
                  activeProject={activeProject}
                />
              </div>
            </>
          )}
        </main>
      </div>
      {toast && <div className="toast">{toast}</div>}
      {limitDialogOpen && (
        <ConfirmModal
          title="项目数量已达上限"
          desc="最多保留 10 个项目。请先删除不需要的历史项目，再创建新项目。"
          confirmText="知道了"
          close={() => setLimitDialogOpen(false)}
          confirm={() => setLimitDialogOpen(false)}
        />
      )}
      {projectToDelete && (
        <ConfirmModal
          title="删除项目"
          desc={`确认删除「${projectToDelete.name}」吗？项目内素材、配置、预览图和视频记录都会一起移除。`}
          confirmText="删除项目"
          close={() => setProjectToDelete(null)}
          confirm={confirmDeleteProject}
          danger
        />
      )}
      {templatePreviewOpen && (
        <TemplatePreviewModal close={() => setTemplatePreviewOpen(false)} />
      )}
      {generationManagerOpen && activeProject && (
        <GenerationManagerModal
          project={activeProject}
          close={() => setGenerationManagerOpen(false)}
          downloadOutput={downloadProjectOutput}
          downloadSelected={downloadSelectedOutputs}
        />
      )}
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="brand">
        <div>
          <div className="product">晨羽 OOTD</div>
          <div className="subtle">服装素材爆款复刻机</div>
        </div>
      </div>
      <div className="top-actions">
        <div className="balance">可用剩余算力 <PowerCost value="12,450" /></div>
        <button className="icon-button" aria-label="通知">通知</button>
        <div className="user">
          <span className="avatar">A</span>
          品牌商家 A
        </div>
      </div>
    </header>
  );
}

function PowerCost({ value, suffix = "" }) {
  return (
    <span className="power-cost" aria-label={`${value}算力${suffix}`}>
      <span className="power-cost-icon" aria-hidden="true" />
      <strong>{value}</strong>
      {suffix && <em>{suffix}</em>}
    </span>
  );
}

function Sidebar({ step, goToStep, selectedTemplateName, completionStatus, activeProject, returnHome, openGenerationManager }) {
  const items = [
    { id: 1, title: "选择模板", desc: selectedTemplateName, target: "step-template" },
    { id: 2, title: "上传素材", desc: "模特图 + 服装图", target: "step-upload" },
    { id: 3, title: "视频生成与配置", desc: "6 图配置与下载", target: "step-generate" },
  ];
  const readyOutputCount = activeProject?.outputs?.length ?? 0;
  const generatingOutputCount = activeProject?.generatingOutputs?.length ?? 0;
  const hasGenerationRecords = readyOutputCount > 0 || generatingOutputCount > 0;
  return (
    <aside className="sidebar">
      <div className="project-sidebar-head">
        <span>当前项目</span>
        <strong title={activeProject?.name}>{activeProject?.name ?? "未选择项目"}</strong>
        <button type="button" className="ghost wide" onClick={returnHome}>返回首页</button>
      </div>
      <nav className="steps">
        {items.map((item) => (
          (() => {
            const isDone = Boolean(completionStatus[item.id]);
            return (
          <button
            key={item.id}
            className={`step ${step === item.id ? "active" : ""} ${isDone ? "done" : ""}`}
            onClick={() => goToStep(item.target, item.id)}
          >
            <span className="step-number">{isDone ? "✓" : item.id}</span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.desc}</small>
            </span>
          </button>
            );
          })()
        ))}
      </nav>
      {hasGenerationRecords && (
        <button type="button" className="generation-manager-card sidebar-generation-manager" onClick={openGenerationManager}>
          <span>生成管理</span>
          <em>
            {readyOutputCount} 条可下载
            {generatingOutputCount > 0 ? ` · ${generatingOutputCount} 条生成/队列` : ""}
          </em>
        </button>
      )}
      <div className="sidebar-bottom">
        <div className="guide">
          <strong>使用指引</strong>
          <span>返回首页或刷新页面时，当前项目会实时保存。</span>
        </div>
      </div>
    </aside>
  );
}

function ProjectHome({ projects, createProject, openProject, askDeleteProject }) {
  function handleCardKeyDown(event, project) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProject(project);
    }
  }

  return (
    <section className="project-home" aria-label="项目首页">
      <div className="project-home-heading">
        <div>
          <h1>项目库</h1>
          <p>新建或继续编辑项目，素材、配置和视频结果会实时保存。</p>
        </div>
        <span>{projects.length} / {PROJECT_LIMIT} 个项目</span>
      </div>

      <section className="history-projects" aria-label="项目卡片">
        <div className="project-card-grid">
          <article className="new-project-card" onClick={createProject}>
            <div className="new-project-cover">
              <div className="new-project-mark">+</div>
              <span>新建项目</span>
            </div>
            <div className="new-project-body">
              <strong>新建项目</strong>
              <small>自动命名并进入工作台</small>
              <em>素材、配置、视频会实时保存</em>
            </div>
          </article>
          {projects.map((project, index) => {
            const projectStatus = getProjectStatusClass(project);
            const projectStatusLabel = getProjectStatusLabel(project);
            const readyOutputCount = project.outputs?.length ?? 0;
            return (
              <article
                key={project.id}
                className="project-card"
                role="button"
                tabIndex={0}
                onClick={() => openProject(project)}
                onKeyDown={(event) => handleCardKeyDown(event, project)}
              >
                <button
                  type="button"
                  className="project-card-delete"
                  aria-label={`删除 ${project.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    askDeleteProject(project);
                  }}
                >
                  删除
                </button>
                <div className="project-card-cover">
                  <img
                    className="project-card-cover-blur"
                    src={getProjectCover(project, index)}
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="project-card-phone-frame">
                    <img
                      className="project-card-poster"
                      src={getProjectCover(project, index)}
                      alt={`${project.name} 预览`}
                    />
                  </div>
                  <span className={`project-status-badge status-${projectStatus}`}>{projectStatusLabel}</span>
                </div>
                <div className="project-card-body">
                  <strong>{project.name}</strong>
                  <div className="project-card-meta">
                    <span>最近保存 {project.updatedAt}</span>
                    <em>{readyOutputCount} 条视频</em>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function GenerationManagerModal({ project, close, downloadOutput, downloadSelected }) {
  const readyOutputs = project.outputs ?? [];
  const generatingOutputs = project.generatingOutputs ?? [];
  const [selectedIds, setSelectedIds] = useState(() => new Set(readyOutputs.map((output) => output.id ?? output.name)));

  useEffect(() => {
    setSelectedIds(new Set(readyOutputs.map((output) => output.id ?? output.name)));
  }, [project.id, readyOutputs.length]);

  const selectedReadyOutputs = readyOutputs.filter((output) => selectedIds.has(output.id ?? output.name));
  const allSelected = readyOutputs.length > 0 && selectedReadyOutputs.length === readyOutputs.length;
  const timelineOutputs = [...generatingOutputs, ...readyOutputs].map((output, index) => ({
    ...output,
    timelineIndex: index,
  }));

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(readyOutputs.map((output) => output.id ?? output.name)));
  }

  function toggleOutput(outputId) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(outputId)) {
        next.delete(outputId);
      } else {
        next.add(outputId);
      }
      return next;
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div className="generation-modal" role="dialog" aria-modal="true" aria-label="生成管理" onClick={(event) => event.stopPropagation()}>
        <div className="generation-modal-head">
          <div>
            <span>生成管理</span>
            <strong>{project.name}</strong>
            <p>按生成时间线查看视频，已完成内容可单个下载或勾选后批量下载。</p>
          </div>
          <div className="generation-modal-actions">
            <button
              type="button"
              className="primary-dark"
              disabled={selectedReadyOutputs.length === 0}
              onClick={() => downloadSelected(selectedReadyOutputs)}
            >
              下载选中文件
            </button>
            <button type="button" className="ghost icon-close" aria-label="关闭生成管理" onClick={close}>×</button>
          </div>
        </div>

        <div className="generation-select-row">
          <label className="generation-select-control">
            <input type="checkbox" checked={allSelected} disabled={readyOutputs.length === 0} onChange={toggleAll} />
            <span className="selection-dot" aria-hidden="true" />
            <span>全选</span>
          </label>
          <em>{selectedReadyOutputs.length} / {readyOutputs.length} 条已选，{generatingOutputs.length} 条生成/队列</em>
        </div>

        <div className="generation-timeline">
          {timelineOutputs.length > 0 ? (
            timelineOutputs.map((output, index) => {
              const outputId = output.id ?? output.name;
              const isGenerating = isGeneratingOutput(output);
              const isSelected = selectedIds.has(outputId);
              return (
                <article key={`${outputId}-${index}`} className={isGenerating ? "generation-video-card is-generating" : "generation-video-card"}>
                  {!isGenerating && (
                    <label className="generation-check" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOutput(outputId)}
                        aria-label={`选择 ${output.name}`}
                      />
                      <span className="selection-dot" aria-hidden="true" />
                    </label>
                  )}
                  <div className="generation-video-preview">
                    <img src={output.poster} alt={output.shot} />
                    <span className="video-result-label">{isGenerating ? output.status : `视频 ${String(index + 1).padStart(2, "0")}`}</span>
                    <em>00:05</em>
                    {isGenerating ? (
                      <div className="video-card-progress">
                        <div className="progress"><div style={{ width: `${output.progress ?? 42}%` }} /></div>
                        <strong>{output.progress ?? 42}%</strong>
                        <span>{output.status === "队列中" ? "排队等待" : "正在生成"}</span>
                      </div>
                    ) : (
                      <span className="video-preview-hint">预览中 · 单击放大</span>
                    )}
                  </div>
                  <div className="generation-video-copy">
                    <strong title={output.name}>{output.name}</strong>
                    <span>{output.shot}</span>
                    <small>{output.generatedAt ?? "刚刚生成"}</small>
                  </div>
                  <button
                    type="button"
                    className="primary-dark"
                    disabled={isGenerating}
                    onClick={() => downloadOutput(output)}
                  >
                    {isGenerating ? output.status : "下载"}
                  </button>
                </article>
              );
            })
          ) : (
            <div className="generation-empty">
              <strong>还没有视频</strong>
              <span>生成完成后，这里会按时间线展示可下载视频。</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, desc, confirmText, close, confirm, danger = false }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-label={title}>
        <strong>{title}</strong>
        <p>{desc}</p>
        <div className="confirm-actions">
          <button type="button" className="ghost" onClick={close}>取消</button>
          <button type="button" className={danger ? "danger-button" : "primary-dark"} onClick={confirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateScreen({ selectedTemplate, selectTemplate, previewTemplateVideo }) {
  const selectedVideoRef = useRef(null);

  useEffect(() => {
    if (selectedTemplate !== "car-ootd") return;
    selectedVideoRef.current?.play().catch(() => undefined);
  }, [selectedTemplate]);

  function handleTemplateKeyDown(event, templateId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectTemplate(templateId);
    }
  }

  return (
    <section className="stage template-stage">
      <div className="template-copy">
        <HeaderBlock
          label="步骤 1"
          title="选择爆款模板"
          desc="默认选中男装车内 OOTD 模板。模板用竖屏视频展示，未来可继续扩展 3-5 个不同服装爆款模板。"
        />
        <div className="template-library">
          <div
            className={selectedTemplate === "car-ootd" ? "template-tile selected" : "template-tile"}
            role="button"
            tabIndex={0}
            onClick={() => selectTemplate("car-ootd")}
            onKeyDown={(event) => handleTemplateKeyDown(event, "car-ootd")}
          >
            <video
              ref={selectedVideoRef}
              src={templateVideo}
              muted
              loop
              playsInline
              autoPlay
              poster={frames[3]}
              onClick={previewTemplateVideo}
              aria-label="单击放大播放男装车内 OOTD 模板视频"
            />
            <div className="tile-copy">
              <strong>男装车内 OOTD</strong>
              <span>车内驾驶场景种草视频</span>
              <em>{selectedTemplate === "car-ootd" ? "默认选中" : "点击框体选中"}</em>
            </div>
          </div>
          {["通勤外套街拍", "秋冬叠穿试衣间", "运动套装出街", "更多模板"].map((name, index) => (
            <div
              key={name}
              className="template-tile placeholder"
              role="button"
              tabIndex={0}
              onClick={() => selectTemplate(`placeholder-${index}`)}
              onKeyDown={(event) => handleTemplateKeyDown(event, `placeholder-${index}`)}
            >
              <div className="template-placeholder">{index + 2}</div>
              <div className="tile-copy">
                <strong>{name}</strong>
                <span>{index === 3 ? "预留扩展位" : "后续接入独立流程"}</span>
                <em>即将开放</em>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UploadScreen({ goToStep, deletedMaterials, setDeletedMaterials }) {
  const [activeSpec, setActiveSpec] = useState(null);

  function isDeleted(group, title) {
    return Boolean(deletedMaterials[materialKey(group, title)]);
  }

  function deleteMaterial(group, title) {
    setDeletedMaterials((current) => ({ ...current, [materialKey(group, title)]: true }));
  }

  function restoreMaterial(group, title) {
    setDeletedMaterials((current) => ({ ...current, [materialKey(group, title)]: false }));
  }

  return (
    <>
      <section className="stage two-col">
        <div>
          <div className="upload-headline">
            <div className="header-block">
              <span>步骤 2</span>
              <div className="upload-title-line">
                <h1>上传素材</h1>
                <label className="auto-import-toggle">
                  <input type="checkbox" defaultChecked />
                  <span>是否自动带入上次素材</span>
                </label>
              </div>
              <p>模特图片只需要上传 1 张正脸照。服装图片必传项只有正面平铺图；背面平铺图、细节图和上身效果图作为可选补充。首次上传后会被后台记住，刷新或关闭页面后自动带入。</p>
            </div>
          </div>

          <div className="material-section">
            <div className="material-head">
              <div>
                <strong>模特图片</strong>
                <span>只需 1 张正脸照，作为人物身份和五官参考</span>
              </div>
            </div>
            <div className="material-grid model-grid">
              {faceMaterialTypes.map((item) => (
                <MaterialCard
                  key={item.title}
                  title={item.title}
                  desc={item.desc}
                  image={item.frame}
                  required={item.required}
                  deleted={isDeleted("model", item.title)}
                  onDelete={() => deleteMaterial("model", item.title)}
                  onUpload={() => restoreMaterial("model", item.title)}
                  onOpenSpec={() => setActiveSpec({ ...item, type: "模特图片" })}
                />
              ))}
            </div>
          </div>

          <div className="material-section">
            <div className="material-head">
              <div>
                <strong>服装图片</strong>
                <span>必传项只有正面平铺图，建议补充背面、细节和上身效果图</span>
              </div>
            </div>
            <div className="material-grid garment">
              {garmentMaterialTypes.map((item) => (
                <MaterialCard
                  key={item.title}
                  title={item.title}
                  desc={item.desc}
                  image={item.frame}
                  required={item.required}
                  deleted={isDeleted("garment", item.title)}
                  onDelete={() => deleteMaterial("garment", item.title)}
                  onUpload={() => restoreMaterial("garment", item.title)}
                  onOpenSpec={() => setActiveSpec({ ...item, type: "服装图片" })}
                />
              ))}
              <AddMaterialCard label="继续上传" desc="补充更多服装细节" />
            </div>
          </div>

          <button className="primary cost-button" onClick={() => goToStep("step-generate", 3)}>
            生成预览图 <PowerCost value={12} />
          </button>
        </div>
        <InfoPanel />
      </section>
      {activeSpec && <SpecModal spec={activeSpec} close={() => setActiveSpec(null)} />}
    </>
  );
}

function MaterialCard({ title, desc, image, required, deleted, onDelete, onUpload, onOpenSpec }) {
  return (
    <div className={deleted ? "material-card empty" : "material-card"}>
      {!deleted && (
        <button type="button" className="material-delete" aria-label={`删除${title}`} onClick={onDelete}>
          ×
        </button>
      )}
      {!deleted ? (
        <img src={image} alt={`${title}参考图`} />
      ) : (
        <button type="button" className="material-empty-action" onClick={onUpload}>
          <span>+</span>
          <strong>重新上传</strong>
          <small>{required ? "必传项" : "可选补充"}</small>
        </button>
      )}
      <div className="material-card-body">
        <div>
          <div className="material-title-row">
            <strong>{title}</strong>
            {required && <em className="required-badge">必传</em>}
          </div>
          <span>{desc}</span>
        </div>
        <button type="button" className="spec-link" onClick={onOpenSpec}>参考规范</button>
      </div>
    </div>
  );
}

function SpecModal({ spec, close }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div className="spec-modal" role="dialog" aria-modal="true" aria-label={`${spec.title}参考规范`} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <strong>{spec.title}参考规范</strong>
            <span>{spec.type}</span>
          </div>
          <button type="button" aria-label="关闭参考规范" onClick={close}>×</button>
        </div>
        <div className="spec-content">
          {spec.frame ? (
            <img src={spec.frame} alt={`${spec.title}参考范本`} />
          ) : (
            <div className="spec-placeholder">
              <span>{spec.placeholder}</span>
            </div>
          )}
          <div className="spec-copy">
            <p>{spec.desc}</p>
            {spec.minimum && <p className="spec-minimum">{spec.minimum}</p>}
            <ul>
              {spec.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddMaterialCard({ label, desc }) {
  return (
    <button type="button" className="material-add-card">
      <span>+</span>
      <strong>{label}</strong>
      <small>{desc}</small>
    </button>
  );
}

function VideoGenerationScreen({
  previewRows,
  updatePreviewRow,
  model,
  setModel,
  count,
  setCount,
  polish,
  useExample,
  rerollPreview,
  aiConfigureAll,
  onGenerate,
  downloadResult,
  generateRowVideo,
  markRowVideoReady,
  batchGenerationRequest,
  activeProject,
}) {
  const [focusedVideoRowId, setFocusedVideoRowId] = useState(null);
  const batchVideoCost = previewRows.length * count * 10;
  const aiConfigureCost = previewRows.length * 2;

  return (
    <section className="stage video-config-stage">
      <div className="video-config-top">
        <HeaderBlock
          label="步骤 3"
          title="视频生成与配置"
          desc="男装车内 OOTD 模板后台默认使用 6 张参考样本，一次生成 6 张对应预览图。每张预览图都可以单独重抽，并拥有自己的动作与风景配置。"
        />
      </div>

      <div className="generation-action-bar">
        <div className="global-controls">
          <div className="global-control">
            <div className="panel-title">模型选择</div>
            <div className="segmented compact-segmented">
              <button className={model === "open" ? "selected" : ""} onClick={() => setModel("open")}>开源模型</button>
              <button className={model === "closed" ? "selected" : ""} onClick={() => setModel("closed")}>闭源模型</button>
            </div>
          </div>
          <div className="global-control">
            <div className="panel-title">视频数量</div>
            <div className="counter compact-counter">
              <button onClick={() => setCount(Math.max(1, count - 1))}>−</button>
              <strong>{count}</strong>
              <span>条</span>
              <button onClick={() => setCount(Math.min(5, count + 1))}>＋</button>
            </div>
          </div>
          <div className="global-control action-global-control">
            <div className="panel-title">快捷配置</div>
            <button className="primary ai-inline-button cost-button" onClick={aiConfigureAll}>
              AI一键配置 <PowerCost value={aiConfigureCost} />
            </button>
          </div>
        </div>
        <div className="sticky-generate">
          <button className="primary batch-generate cost-button" onClick={onGenerate}>
            批量生成视频 <PowerCost value={batchVideoCost} />
          </button>
          <button className="download-button batch-download" onClick={downloadResult}>批量下载</button>
        </div>
      </div>

      <div className="preview-generation-list">
        {previewRows.map((row, index) => (
          <PreviewGenerationRow
            key={row.id}
            row={row}
            index={index}
            model={model}
            updatePreviewRow={updatePreviewRow}
            useExample={useExample}
            polish={polish}
            rerollPreview={rerollPreview}
            generateRowVideo={generateRowVideo}
            downloadResult={downloadResult}
            markRowVideoReady={markRowVideoReady}
            count={count}
            batchGenerationRequest={batchGenerationRequest}
            focusedVideoRowId={focusedVideoRowId}
            setFocusedVideoRowId={setFocusedVideoRowId}
            projectVideoItems={getProjectVideosForPreviewRow(activeProject, row.id, index, previewRows.length)}
          />
        ))}
      </div>
    </section>
  );
}

function PreviewGenerationRow({
  row,
  index,
  model,
  updatePreviewRow,
  useExample,
  polish,
  rerollPreview,
  generateRowVideo,
  downloadResult,
  markRowVideoReady,
  count,
  batchGenerationRequest,
  focusedVideoRowId,
  setFocusedVideoRowId,
  projectVideoItems,
}) {
  const rowRef = useRef(null);
  const carouselRef = useRef(null);
  const [previewZoomOpen, setPreviewZoomOpen] = useState(false);
  const [videoZoomIndex, setVideoZoomIndex] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [videoItems, setVideoItems] = useState([]);
  const hasVideoCards = videoItems.length > 0;
  const projectVideoSignature = projectVideoItems
    .map((item) => `${item.id}:${item.status}:${item.progress}`)
    .join("|");

  useEffect(() => {
    if (selectedVideoIndex > Math.max(videoItems.length - 1, 0)) {
      setSelectedVideoIndex(0);
    }
  }, [selectedVideoIndex, videoItems.length]);

  useEffect(() => {
    if (projectVideoItems.length === 0) return;
    setVideoItems(projectVideoItems);
  }, [projectVideoSignature]);

  useEffect(() => {
    if (projectVideoItems.length > 0 || row.videoStatus !== "待生成") return;
    setVideoItems([]);
  }, [row.videoStatus, row.version, projectVideoSignature]);

  useEffect(() => {
    if (batchGenerationRequest.id > 0) {
      startVideoGeneration(Math.max(1, batchGenerationRequest.quantity));
    }
  }, [batchGenerationRequest.id]);

  useEffect(() => {
    if (!hasVideoCards || !rowRef.current) {
      setFocusedVideoRowId((currentRowId) => (
        currentRowId === row.id ? null : currentRowId
      ));
      return undefined;
    }

    const updateFocusByScrollAnchor = () => {
      const rowElement = rowRef.current;
      if (!rowElement) return;

      const rect = rowElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const anchorY = Math.min(
        Math.max(viewportHeight * 0.48, 260),
        viewportHeight - 130
      );
      const isAnchorInsideRow = rect.top <= anchorY && rect.bottom >= anchorY;

      if (isAnchorInsideRow) {
        setFocusedVideoRowId(row.id);
        return;
      }

      setFocusedVideoRowId((currentRowId) => (
        currentRowId === row.id ? null : currentRowId
      ));
    };

    updateFocusByScrollAnchor();
    const focusTimer = window.setInterval(updateFocusByScrollAnchor, 220);
    window.addEventListener("scroll", updateFocusByScrollAnchor, { passive: true });
    window.addEventListener("resize", updateFocusByScrollAnchor);

    return () => {
      window.clearInterval(focusTimer);
      window.removeEventListener("scroll", updateFocusByScrollAnchor);
      window.removeEventListener("resize", updateFocusByScrollAnchor);
    };
  }, [hasVideoCards, row.id, setFocusedVideoRowId]);

  function startVideoGeneration(quantity = 1) {
    generateRowVideo(row.id, quantity);
  }

  function rerollVideoItem(videoId) {
    generateRowVideo(row.id);
    setSelectedVideoIndex(0);
  }

  function deleteVideoItem(videoId) {
    setVideoItems((items) => items.filter((item) => item.id !== videoId));
  }

  function scrollCarousel(direction) {
    carouselRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  const openVideoPreview = (videoIndex) => {
    setSelectedVideoIndex(videoIndex);
    setVideoZoomIndex(videoIndex);
  };

  const handleVideoKeyDown = (event, videoIndex) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openVideoPreview(videoIndex);
    }
  };

  const handleVideoAction = (event, action, videoId, displayIndex) => {
    event.stopPropagation();
    setSelectedVideoIndex(displayIndex);

    if (action === "download") {
      downloadResult();
      return;
    }

    if (action === "reroll") {
      rerollVideoItem(videoId);
      return;
    }

    deleteVideoItem(videoId);
  };

  return (
    <article
      ref={rowRef}
      className={[
        "preview-generation-row",
        hasVideoCards ? "has-video-result" : "",
        focusedVideoRowId === row.id && hasVideoCards ? "is-focus-preview" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="row-preview-card">
        <div className="row-card-head">
          <div>
            <strong>{row.title}</strong>
            <span>{row.sample} · {row.shot}</span>
          </div>
          <em>V{row.version}</em>
        </div>
        <button className="row-preview-button" type="button" onClick={() => setPreviewZoomOpen(true)}>
          <img src={row.image} alt={`${row.title}放大预览`} />
        </button>
        <div className="row-preview-actions">
          <button className="ghost cost-button" onClick={() => rerollPreview(row.id)}>
            重抽此图 <PowerCost value={2} />
          </button>
        </div>
      </div>

      <div className="row-config-card">
        <div className="row-section-title">
          <strong>配置区</strong>
          <span>每张预览图独立生效</span>
        </div>
        <MiniPromptBlock
          title="动作"
          examples={getActionSuggestions(row)}
          value={row.actionText}
          setValue={(value) => updatePreviewRow(row.id, { actionText: value })}
          prompt={row.actionPrompt}
          setPrompt={(value) => updatePreviewRow(row.id, { actionPrompt: value })}
          onPolish={() => polish(row.id, "action")}
          applied={row.actionAppliedPrompt === row.actionPrompt}
          onApply={() => {
            updatePreviewRow(row.id, { actionAppliedPrompt: row.actionPrompt });
            setToast("已应用动作 AI 文案");
          }}
          onExample={(value) => useExample(row.id, "action", value)}
        />
        <MiniPromptBlock
          title="风景"
          examples={getSceneSuggestions(row)}
          value={row.sceneText}
          setValue={(value) => updatePreviewRow(row.id, { sceneText: value })}
          prompt={row.scenePrompt}
          setPrompt={(value) => updatePreviewRow(row.id, { scenePrompt: value })}
          onPolish={() => polish(row.id, "scene")}
          applied={row.sceneAppliedPrompt === row.scenePrompt}
          onApply={() => {
            updatePreviewRow(row.id, { sceneAppliedPrompt: row.scenePrompt });
            setToast("已应用风景 AI 文案");
          }}
          onExample={(value) => useExample(row.id, "scene", value)}
        />
      </div>

      <div className="row-video-card">
        <div className="row-section-title">
          <strong>生成的视频</strong>
          <span>{model === "open" ? "开源模型" : "闭源模型"} · 每张图 {count} 条</span>
        </div>
        <div className="row-video-shell">
          {videoItems.length > 1 && (
            <>
              <button className="carousel-arrow carousel-arrow-left" type="button" onClick={() => scrollCarousel(-1)} aria-label="向左滑动视频">
                ‹
              </button>
              <button className="carousel-arrow carousel-arrow-right" type="button" onClick={() => scrollCarousel(1)} aria-label="向右滑动视频">
                ›
              </button>
            </>
          )}
          <div ref={carouselRef} className="row-video-carousel" aria-label={`${row.title}生成的视频列表`}>
              {videoItems.map((item, videoIndex) => (
                <div
                  key={item.id}
                  role={item.status === "ready" ? "button" : undefined}
                  tabIndex={item.status === "ready" ? 0 : undefined}
                  className={[
                    "video-result-card",
                    item.status === "generating" ? "is-generating" : "",
                    selectedVideoIndex === videoIndex && item.status === "ready" ? "selected" : "",
                  ].filter(Boolean).join(" ")}
                  onMouseEnter={() => setSelectedVideoIndex(videoIndex)}
                  onClick={() => {
                    if (item.status === "ready") openVideoPreview(videoIndex);
                  }}
                  onKeyDown={(event) => {
                    if (item.status === "ready") handleVideoKeyDown(event, videoIndex);
                  }}
                >
                  <img src={item.poster ?? row.image} alt={`${row.title}视频 ${videoIndex + 1}`} />
                  <span className="video-result-label">
                    {item.status === "generating" ? item.statusLabel ?? "生成中" : `视频 ${videoIndex + 1}`}
                  </span>
                  {item.status === "generating" ? (
                    <div className="video-card-progress">
                      <div className="progress"><div style={{ width: `${item.progress ?? 0}%` }} /></div>
                      <strong>{item.progress ?? 0}%</strong>
                      <span>{item.statusLabel === "队列中" ? "排队等待" : "正在生成"}</span>
                    </div>
                  ) : (
                    <>
                      <em>00:05</em>
                      <span className="video-preview-hint">预览中 · 单击放大</span>
                      <div className="video-card-actions" aria-label={`视频 ${videoIndex + 1}操作`}>
                        <button
                          type="button"
                          className="video-icon-button"
                          aria-label={`重抽视频 ${videoIndex + 1}，消耗 10 算力`}
                          onClick={(event) => handleVideoAction(event, "reroll", item.id, videoIndex)}
                        >
                          ↻
                        </button>
                        <button
                          type="button"
                          className="video-icon-button"
                          aria-label={`下载视频 ${videoIndex + 1}`}
                          onClick={(event) => handleVideoAction(event, "download", item.id, videoIndex)}
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        type="button"
                        className="video-icon-button video-delete-action"
                        aria-label={`删除视频 ${videoIndex + 1}`}
                        onClick={(event) => handleVideoAction(event, "delete", item.id, videoIndex)}
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              ))}
              <button type="button" className="video-generate-card" onClick={() => startVideoGeneration(1)}>
                <strong>生成视频</strong>
                <small><PowerCost value={10} suffix="/条" /></small>
              </button>
            </div>
        </div>
      </div>

      {previewZoomOpen && (
        <ImagePreviewModal image={row.image} title={row.title} close={() => setPreviewZoomOpen(false)} />
      )}
      {videoZoomIndex !== null && (
        <ImagePreviewModal
          image={row.image}
          title={`${row.title} · 视频 ${videoZoomIndex + 1}`}
          close={() => setVideoZoomIndex(null)}
        />
      )}
    </article>
  );
}

function MiniPromptBlock({ title, examples, value, setValue, prompt, setPrompt, applied, onPolish, onApply, onExample }) {
  return (
    <div className="mini-prompt-card">
      <div className="mini-prompt-head">
        <strong>{title}</strong>
        <button className="cost-button" onClick={onPolish}>AI润色 <PowerCost value={1} /></button>
      </div>
      <div className="mini-chips">
        {examples.map((example) => (
          <button key={typeof example === "string" ? example : example.label} onClick={() => onExample(example)}>
            {typeof example === "string" ? example : example.label}
          </button>
        ))}
      </div>
      <textarea value={value} onChange={(event) => setValue(event.target.value)} maxLength={180} />
      <div className="polished-mini-wrap">
        <textarea className="polished-mini" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={320} />
        <button type="button" className={applied ? "apply-polish-button applied" : "apply-polish-button"} onClick={onApply}>
          {applied ? "已应用" : "应用"}
        </button>
      </div>
    </div>
  );
}

function ImagePreviewModal({ image, title, close }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div className="image-preview-modal" role="dialog" aria-modal="true" aria-label={`${title}放大预览`} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <strong>{title}</strong>
          <button type="button" aria-label="关闭预览图" onClick={close}>×</button>
        </div>
        <img src={image} alt={`${title}放大预览`} />
      </div>
    </div>
  );
}

function TemplatePreviewModal({ close }) {
  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="template-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <strong>男装车内 OOTD 模板预览</strong>
          <button onClick={close} aria-label="关闭模板预览">×</button>
        </div>
        <video src={templateVideo} controls autoPlay muted loop playsInline />
      </div>
    </div>
  );
}

function TaskScreen() {
  const [activeTaskId, setActiveTaskId] = useState(tasks[0]?.id);
  const [selectedOutputIndex, setSelectedOutputIndex] = useState(0);
  const [materialZoom, setMaterialZoom] = useState(null);
  const activeTask = normalizeTask(tasks.find((task) => task.id === activeTaskId) ?? tasks[0]);
  const previewInputs = templatePreviewSamples.slice(0, 4);
  const outputCount = activeTask.outputs.length;
  const selectedOutput = activeTask.outputs[selectedOutputIndex] ?? activeTask.outputs[0];
  const sourceMaterialSections = [
    { title: "模特素材", kind: "model", items: activeTask.materials.model },
    { title: "服装素材", kind: "garment", items: activeTask.materials.garment },
  ];

  useEffect(() => {
    setSelectedOutputIndex(0);
  }, [activeTaskId]);

  return (
    <section className="task-screen" aria-label="任务列表">
      <div className="task-command-center">
        <div className="task-board-slot">
          <aside className="task-board">
            <header className="task-board-head">
              <div>
                <span>历史任务</span>
                <h1>任务列表</h1>
              </div>
            </header>
            <div className="task-list" role="list" aria-label="最近任务">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  className={task.id === activeTask.id ? "task active" : "task"}
                  type="button"
                  role="listitem"
                  onClick={() => setActiveTaskId(task.id)}
                >
                  <strong>{task.id}</strong>
                  <span>{task.template}</span>
                </button>
              ))}
            </div>
            <div className="task-board-foot">
              <strong>最近 10 条</strong>
              <span>仅显示任务编号和模板名称</span>
            </div>
          </aside>
        </div>

        <div className="task-detail-stage">
          <section className="task-delivery-bar" aria-label="任务交付概览">
            <div>
              <span>当前任务</span>
              <strong>{activeTask.id}</strong>
              <em>{activeTask.template}</em>
            </div>
            <div className="delivery-status-strip">
              <span>{outputCount > 0 ? "可下载" : "待生成"}</span>
            </div>
            <button type="button" className="primary-dark" disabled={outputCount === 0}>打包下载</button>
          </section>

          <section className="task-section source-section" aria-label="原输入素材">
            <div className="section-title-row">
              <div>
                <span>原始上传</span>
                <h3>原输入素材</h3>
                <p>多张素材按类型分组展示，必传主素材更突出，补充图用于快速扫读。</p>
              </div>
              <button type="button" className="ghost">回到输入编辑</button>
            </div>
            <div className="source-material-groups">
              {sourceMaterialSections.map((section) => (
                <div key={section.title} className={`source-material-group source-material-group-${section.kind}`}>
                  <div className="source-group-head">
                    <strong>{section.title}</strong>
                    <span>{section.items.length} 张</span>
                  </div>
                  <div className="source-material-grid">
                    {section.items.map((material) => (
                      <article key={`${section.title}-${material.title}`} className={material.required ? "source-material-card featured" : "source-material-card"}>
                        <button type="button" onClick={() => setMaterialZoom(material)} aria-label={`放大查看${material.title}`}>
                          <img src={material.image} alt={material.alt} />
                        </button>
                        <div>
                          <strong>{material.title}{material.required ? " · 必传" : ""}</strong>
                          <span>{material.desc}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="task-section delivery-section" aria-label="输出视频">
            <div className="section-title-row">
              <div>
                <span>成片预览</span>
                <h3>预览区域</h3>
                <p>{outputCount > 0 ? `当前任务共 ${outputCount} 条视频，点击右侧文件卡切换预览。` : "当前任务还没有生成视频，保留空状态方便用户判断。"} </p>
              </div>
              <button type="button" className="primary-dark" disabled={outputCount === 0}>打包下载</button>
            </div>
            <div className="delivery-viewer">
              <div className="output-preview-stage" aria-label="预览区域">
                {selectedOutput ? (
                  <div className="output-phone-preview">
                    <img src={selectedOutput.poster} alt={`${selectedOutput.shot}大预览`} />
                    <span className="preview-badge">竖屏视频</span>
                    <div className="video-hover-controls" aria-label="视频快捷操作">
                      <button type="button" aria-label="播放">▶</button>
                      <button type="button" aria-label="暂停">Ⅱ</button>
                      <button
                        type="button"
                        aria-label="最大化预览"
                        onClick={() => setMaterialZoom({ title: selectedOutput.name, image: selectedOutput.poster })}
                      >
                        ⛶
                      </button>
                    </div>
                    <div className="output-preview-caption">
                      <div>
                        <strong title={selectedOutput.name}>{selectedOutput.name}</strong>
                        <span>{selectedOutput.shot}</span>
                      </div>
                      <em>00:05</em>
                    </div>
                  </div>
                ) : (
                  <div className="output-empty-state">
                    <strong>暂无输出视频</strong>
                    <span>该任务可能还未开始生成，或生成失败后等待重新生成。</span>
                  </div>
                )}
              </div>
              <div className="output-queue-head">
                <strong>视频文件</strong>
                <span>{outputCount > 0 ? `${outputCount} 条，最多模拟 30 条` : "0 条"}</span>
              </div>
              <div className={outputCount > 9 ? "output-playlist is-many" : "output-playlist"} aria-label="输出视频列表">
                {activeTask.outputs.map((output, index) => (
                  <article
                    key={output.name}
                    className={index === selectedOutputIndex ? "output-list-card selected" : "output-list-card"}
                    onClick={() => setSelectedOutputIndex(index)}
                  >
                    <div className="output-thumb">
                      <img src={output.poster} alt={output.shot} />
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="output-card-copy">
                      <strong title={output.name}>{output.name}</strong>
                      <span>{output.shot}</span>
                      <small>{output.status}</small>
                    </div>
                    <div className="output-list-actions">
                      <button type="button" onClick={() => setSelectedOutputIndex(index)}>预览</button>
                      <button type="button" onClick={(event) => event.stopPropagation()}>下载</button>
                    </div>
                  </article>
                ))}
                {outputCount === 0 && (
                  <div className="output-list-empty">
                    <strong>还没有视频文件</strong>
                    <span>生成完成后会在这里按文件顺序展示，支持单个预览和单个下载。</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="task-section assist-section" aria-label="其他任务信息">
            <details>
              <summary>查看其他任务信息</summary>
              <div className="assist-info-grid">
                <article>
                  <strong>生成配置</strong>
                  <span>{activeTask.inputs.templateVideo}</span>
                  <span>{activeTask.inputs.generation}</span>
                </article>
                <article>
                  <strong>动作 / 风景配置</strong>
                  <span>4 组动作建议已应用</span>
                  <span>基于预览图画面生成</span>
                </article>
              </div>
              <div className="preview-strip compact">
                {previewInputs.map((sample) => (
                  <article key={sample.id} className="preview-chip-card">
                    <img src={sample.image} alt={sample.title} />
                    <div>
                      <strong>{sample.title}</strong>
                      <span>{sample.action} / {sample.scene}</span>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          </section>
        </div>
      </div>
      {materialZoom && (
        <ImagePreviewModal image={materialZoom.image} title={materialZoom.title} close={() => setMaterialZoom(null)} />
      )}
    </section>
  );
}

function HeaderBlock({ label, title, desc }) {
  return (
    <div className="header-block">
      <span>{label}</span>
      <h1>{title}</h1>
      <p>{desc}</p>
    </div>
  );
}

function InfoPanel() {
  return (
    <aside className="info-panel upload-info-panel">
      <strong>素材规范</strong>
      <div className="material-guidance">
        <section className="guidance-card guidance-model">
          <span>模特图片规范</span>
          <ul>
            <li>正脸照为必传项，最低 1024 x 1024px，建议 1536px 以上。</li>
            <li>五官完整清晰，无遮挡、无墨镜和帽子，光线均匀。</li>
            <li>当前版本不要求上传全身照和侧脸照，避免增加商家准备素材成本。</li>
          </ul>
        </section>
        <section className="guidance-card guidance-garment">
          <span>服装图片规范</span>
          <ul>
            <li>必传项只有正面平铺图，用于识别颜色、版型、Logo 和纹理。</li>
            <li>背面平铺图不是必传项，可作为背部结构和后领信息补充。</li>
            <li>细节特写和上身效果图为可选补充，用于提升纹理和穿着比例还原。</li>
          </ul>
        </section>
      </div>
      <p className="info-note">每张已上传素材都可以删除，删除后可在原位置重新上传；首次上传后后台自动保存，下次进入晨羽 OOTD 会自动带入。</p>
    </aside>
  );
}
