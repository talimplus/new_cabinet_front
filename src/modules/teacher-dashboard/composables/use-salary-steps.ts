import { computed, type Ref } from 'vue'
import { t } from '@/locales'
import type { SalaryStep } from '../interfaces/salary-step.interface'
import type { TeacherSalaryRow } from '../interfaces/teacher-dashboard.interface'

/**
 * The salary as a waterfall: calculated → + bonus → − fines → − advances →
 * handed over. Steps that are 0 are left out; the scale is the biggest point
 * the walk reaches (calculated + bonus).
 */
export function useSalarySteps(row: Ref<TeacherSalaryRow | null>) {
  const steps = computed<SalaryStep[]>(() => {
    const r = row.value
    if (!r) return []
    const peak = r.baseSalary + r.bonusAmount
    const earned = peak - r.fineAmount
    const list: SalaryStep[] = [
      {
        key: 'base', label: t('teacherDashboard.salary.base'), amount: r.baseSalary, sign: '',
        from: 0, to: r.baseSalary, fill: 'bg-fg-subtle', total: true, hint: t('teacherDashboard.salary.baseHint'),
      },
    ]
    if (r.bonusAmount > 0) {
      list.push({
        key: 'bonus', label: t('teacherDashboard.salary.bonus'), amount: r.bonusAmount, sign: '+',
        from: r.baseSalary, to: peak, fill: 'bg-success', total: false, hint: t('teacherDashboard.salary.bonusHint'),
      })
    }
    if (r.fineAmount > 0) {
      list.push({
        key: 'fine', label: t('teacherDashboard.salary.fine'), amount: r.fineAmount, sign: '−',
        from: Math.max(0, earned), to: peak, fill: 'bg-danger', total: false, hint: t('teacherDashboard.salary.fineHint'),
      })
    }
    if (r.advanceAmount > 0) {
      list.push({
        key: 'advance', label: t('teacherDashboard.salary.advance'), amount: r.advanceAmount, sign: '−',
        from: Math.max(0, r.netSalary), to: Math.max(0, earned), fill: 'bg-info', total: false,
        hint: t('teacherDashboard.salary.advanceHint'),
      })
    }
    list.push({
      key: 'net', label: t('teacherDashboard.salary.net'), amount: r.netSalary, sign: '',
      from: 0, to: r.netSalary, fill: 'bg-primary', total: true, hint: t('teacherDashboard.salary.netHint'),
    })
    return list
  })

  const scale = computed(() => Math.max(1, ...steps.value.map((s) => s.to)))
  return { steps, scale }
}
