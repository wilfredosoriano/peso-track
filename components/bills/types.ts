export interface BillListItem {
  id: string;
  name: string;
  expression: string;
  yourShare: number;
  dueDate: Date;
  isPaid: boolean;
  isPaused: boolean;
  isRecurring: boolean;
  categoryName: string;
  categoryColor: string | null;
  categoryIcon: string | null;
}
