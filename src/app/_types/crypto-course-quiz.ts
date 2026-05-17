/** Four-option multiple choice; `correctIndex` is server-only. */
export type ModuleMcQuestion = {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly [string, string, string, string];
  readonly correctIndex: 0 | 1 | 2 | 3;
};

export type ModuleMcQuestionPublic = Omit<ModuleMcQuestion, "correctIndex">;

export type MemberCryptoModuleQuizRow = {
  member_id: string;
  module_id: string;
  passed: boolean;
  score: number;
  total: number;
  attempt_count: number;
  updated_at: string;
};
