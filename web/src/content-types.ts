export interface LessonStep {
  label: string;
  body: string;
}

export interface Lesson {
  id: string;
  kind: "foundation" | "deep-dive";
  title: string;
  summary: string;
  sourcePath: string;
  markdown: string;
  code: string;
  codePath: string;
  packageName: string;
  className: string;
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

export interface Stage {
  id: string;
  title: string;
  scope: string;
  status: string;
  materialState: string;
  sourcePath?: string;
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

export interface Catalog {
  lessons: Lesson[];
  exercises: Exercise[];
  predictions: Prediction[];
  modifications: Modification[];
  stages: Stage[];
  documents: SourceDocument[];
  currentTasks: string[];
  references: ReferenceResource[];
}
