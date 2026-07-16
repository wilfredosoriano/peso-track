import { create } from "zustand";

interface UiState {
  /** Bill id currently open in the edit sheet/page; null means "add" mode is closed. */
  editingBillId: string | null;
  openEditBill: (billId: string) => void;
  closeEditBill: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  editingBillId: null,
  openEditBill: (billId) => set({ editingBillId: billId }),
  closeEditBill: () => set({ editingBillId: null }),
}));
