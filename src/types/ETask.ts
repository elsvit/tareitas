export enum ETaskStatus {
  Pending = 'pending',
  Completed = 'completed',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}

export enum ETaskRepeatType {
  None = 'none',
  Day = 'day', // daily
  Week = 'week', // weekly
  Month = 'month', // monthly
}
