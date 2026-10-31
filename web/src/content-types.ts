export interface LessonStep {
  label: string;
  body: string;
}

export interface LessonCodeFile {
  path: string;
  className: string;
  packageName: string;
  code: string;
}

export interface Lesson {
  id: string;
  kind: "foundation" | "deep-dive";
  /** 所属 Stage（V1.2 起提供，用于跨阶段导航与目录分组） */
  stageId: string;
  /** 所属 Module（V1.2 起提供，对应 web/content/stages.json 的 modules） */
  moduleId: string;
  title: string;
  summary: string;
  sourcePath: string;
  markdown: string;
  code: string;
  codePath: string;
  packageName: string;
  className: string;
  /** 课程目录内全部 Java 文件（主文件在前；V1.3 起提供，多文件课程用） */
  codeFiles: LessonCodeFile[];
  relatedLessonIds: string[];
  exerciseIds: string[];
  predictionIds: string[];
  steps: LessonStep[];
}

export interface ExerciseCase {
  id: string;
  label: string;
  input: string;
  expected: string;
  kind: "normal" | "boundary" | "invalid";
}

export interface Exercise {
  id: string;
  title: string;
  sourcePath: string;
  markdown: string;
  hints: string[];
  starterCode: string;
  className: string;
  packageName: string;
  lessonIds: string[];
  cases: ExerciseCase[];
  referencePaths: string[];
  note?: string;
}

export interface Prediction {
  id: string;
  title: string;
  sourcePath: string;
  code: string;
  prompt: string;
  answer: string;
  explanation: string;
  lessonIds: string[];
  modifiedAnswer?: string;
}

export interface Modification {
  id: string;
  title: string;
  sourcePath: string;
  markdown: string;
  lessonIds: string[];
  referencePaths: string[];
  note?: string;
}

export type ContentState =
  | "published"
  | "materials"
  | "draft"
  | "planned";

export interface StageModule {
  id: string;
  title: string;
}

export interface Stage {
  id: string;
  title: string;
  scope: string;
  status: string;
  materialState: string;
  sourcePath?: string;
  /** 内容发布状态（V1.2 起提供；与学习者的掌握状态无关） */
  contentState: ContentState;
  /** 首批课程已发布、阶段内容仍在持续建设（V1.3 起提供） */
  building?: boolean;
  /** 阶段内专题模块（V1.2 起提供） */
  modules: StageModule[];
  prerequisites: string;
  evidence: string;
}

export interface SourceDocument {
  id: string;
  title: string;
  sourcePath: string;
  markdown: string;
}

export interface ReferenceResource {
  sourcePath: string;
  url: string;
}

export interface WorkspaceConfig {
  /** 工作台 CURRENT 任务逐项对应的站内路由 */
  currentTaskRoutes: string[];
  /** 首页『值得再看一遍』推荐（课程 ID + 展示文案） */
  reviewPicks: Array<{ id: string; label: string }>;
}

export interface Catalog {
  lessons: Lesson[];
  exercises: Exercise[];
  predictions: Prediction[];
  modifications: Modification[];
  stages: Stage[];
  documents: SourceDocument[];
  currentTasks: string[];
  references: ReferenceResource[];
  /** 工作台固定入口配置（V1.2 起提供） */
  workspace: WorkspaceConfig;
}
