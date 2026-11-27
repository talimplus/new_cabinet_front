/** One of the teacher's groups in "what students owe for this month". */
export interface SalaryForecastGroup {
  groupId: number
  groupName: string
  students: number
  /** What students must pay for the month (the teacher's part of a shared group). */
  due: number
  /** Paid and confirmed by the admin. */
  paid: number
  /** Paid, waiting for the admin to confirm. */
  pending: number
  /** Not paid yet. */
  unpaid: number
  /** 1 = the whole month taught by this teacher; 0.4 = replaced mid-month. */
  factor: number
}

export interface SalaryForecastSums {
  paid: number
  pending: number
  unpaid: number
}

/** `GET /staff-salaries/forecast?userId=&forMonth=` — roughly how much this month's salary will be. */
export interface SalaryForecast {
  userId: number
  /** "YYYY-MM-01". */
  forMonth: string
  isTeacher: boolean
  /** The teacher's share of student payments, %. */
  percent: number
  /** Fixed monthly salary. */
  fixedSalary: number
  /** Calculated so far (fixed + share of confirmed payments ± transfers + bonus). */
  calculated: number
  groups: SalaryForecastGroup[]
  totals: SalaryForecastSums & { due: number }
  /** The teacher's share of each sum. */
  shares: SalaryForecastSums
  /** If everything gets paid: calculated + pending share + unpaid share. */
  estimate: number
  /** Advances given for this month. */
  advanceGiven: number
  paidAmount: number
  /** Advances (+ fines, given cash) exceed the salary by this much. */
  overAmount: number
}
