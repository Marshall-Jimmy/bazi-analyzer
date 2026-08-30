// ============================================================
// 八字命理综合分析 - Zustand 状态管理
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalysisInput, BaziResult, FullAnalysisResult, SynastryResult } from '../engine/index.ts';
import { calculateBazi, runFullAnalysis, analyzeSynastry } from '../engine/index.ts';

// ---- 保存的命盘类型 ----
export interface SavedProfile {
  id: string;
  name: string;
  input: AnalysisInput;
  result: BaziResult;
  analysis: FullAnalysisResult;
  createdAt: string;
}

// ---- Tab 类型 ----
export type ActiveTab = 'single' | 'synastry' | 'history';

// ---- Store State ----
interface BaziState {
  // 当前个人命盘
  currentInput: AnalysisInput | null;
  baziResult: BaziResult | null;
  fullAnalysis: FullAnalysisResult | null;

  // 保存的命盘列表
  savedProfiles: SavedProfile[];

  // 合盘
  synastryInput1: AnalysisInput | null;
  synastryInput2: AnalysisInput | null;
  synastryResult: SynastryResult | null;
  synastryBaziResult1: BaziResult | null;
  synastryBaziResult2: BaziResult | null;

  // UI 状态
  activeTab: ActiveTab;
  focusMode: string | null;
}

// ---- Store Actions ----
interface BaziActions {
  setInput: (input: AnalysisInput) => void;
  calculateBazi: () => void;
  runAnalysis: () => void;
  saveProfile: (name: string) => void;
  deleteProfile: (id: string) => void;
  loadProfile: (profile: SavedProfile) => void;
  setSynastryInputs: (input1: AnalysisInput, input2: AnalysisInput) => void;
  runSynastry: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  setFocusMode: (mode: string | null) => void;
  clearAll: () => void;
}

type BaziStore = BaziState & BaziActions;

// ---- 默认状态 ----
const initialState: BaziState = {
  currentInput: null,
  baziResult: null,
  fullAnalysis: null,
  savedProfiles: [],
  synastryInput1: null,
  synastryInput2: null,
  synastryResult: null,
  synastryBaziResult1: null,
  synastryBaziResult2: null,
  activeTab: 'single',
  focusMode: null,
};

// ---- 创建 Store ----
export const useBaziStore = create<BaziStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 设置输入参数
      setInput: (input: AnalysisInput) => {
        set({ currentInput: input, baziResult: null, fullAnalysis: null });
      },

      // 执行排盘计算
      calculateBazi: () => {
        const { currentInput } = get();
        if (!currentInput) return;
        try {
          const result = calculateBazi(currentInput);
          set({ baziResult: result, fullAnalysis: null });
        } catch (err) {
          console.error('排盘计算失败:', err);
          set({ baziResult: null, fullAnalysis: null });
        }
      },

      // 执行完整分析
      runAnalysis: () => {
        const { currentInput, baziResult } = get();
        if (!currentInput || !baziResult) return;
        try {
          const analysis = runFullAnalysis(currentInput, baziResult);
          set({ fullAnalysis: analysis });
        } catch (err) {
          console.error('分析计算失败:', err);
          set({ fullAnalysis: null });
        }
      },

      // 保存命盘
      saveProfile: (name: string) => {
        const { currentInput, baziResult, fullAnalysis, savedProfiles } = get();
        if (!currentInput || !baziResult || !fullAnalysis) return;

        const profile: SavedProfile = {
          id: crypto.randomUUID(),
          name,
          input: currentInput,
          result: baziResult,
          analysis: fullAnalysis,
          createdAt: new Date().toISOString(),
        };

        set({ savedProfiles: [profile, ...savedProfiles] });
      },

      // 删除命盘
      deleteProfile: (id: string) => {
        const { savedProfiles } = get();
        set({ savedProfiles: savedProfiles.filter(p => p.id !== id) });
      },

      // 加载命盘
      loadProfile: (profile: SavedProfile) => {
        set({
          currentInput: profile.input,
          baziResult: profile.result,
          fullAnalysis: profile.analysis,
          activeTab: 'single',
          focusMode: null,
        });
      },

      // 设置合盘输入
      setSynastryInputs: (input1: AnalysisInput, input2: AnalysisInput) => {
        set({
          synastryInput1: input1,
          synastryInput2: input2,
          synastryResult: null,
          synastryBaziResult1: null,
          synastryBaziResult2: null,
        });
      },

      // 执行合盘分析
      runSynastry: () => {
        const { synastryInput1, synastryInput2 } = get();
        if (!synastryInput1 || !synastryInput2) return;
        try {
          const result1 = calculateBazi(synastryInput1);
          const result2 = calculateBazi(synastryInput2);
          const synastry = analyzeSynastry(synastryInput1, synastryInput2, result1, result2, 'romantic');
          set({
            synastryResult: synastry,
            synastryBaziResult1: result1,
            synastryBaziResult2: result2,
          });
        } catch (err) {
          console.error('合盘分析失败:', err);
          set({ synastryResult: null, synastryBaziResult1: null, synastryBaziResult2: null });
        }
      },

      // 切换 Tab
      setActiveTab: (tab: ActiveTab) => {
        set({ activeTab: tab });
      },

      // 设置聚焦模式
      setFocusMode: (mode: string | null) => {
        set({ focusMode: mode });
      },

      // 清空所有数据
      clearAll: () => {
        set({
          currentInput: null,
          baziResult: null,
          fullAnalysis: null,
          synastryInput1: null,
          synastryInput2: null,
          synastryResult: null,
          synastryBaziResult1: null,
          synastryBaziResult2: null,
          activeTab: 'single',
          focusMode: null,
        });
      },
    }),
    {
      name: 'bazi-analyzer-storage',
      // 仅持久化 savedProfiles
      partialize: (state) => ({
        savedProfiles: state.savedProfiles,
      }),
    }
  )
);
