export enum ETaskStatus {
  Pending = 'pending', // gray
  Completed = 'completed', // green
  Approved = 'approved', // gold
  Rejected = 'rejected', // red
  // Cancelled = 'cancelled', // gray
}

export enum ETaskRepeatType {
  None = 'none',
  Day = 'day', // daily
  Week = 'week', // weekly
  Month = 'month', // monthly
}
