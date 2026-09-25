import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StaffAttendanceReport from '../StaffAttendanceReport.vue'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { StaffAttendanceReport as Report, StaffReportRow } from '../../interfaces/staff-attendance-report.interface'
import { t } from '@/locales'

function makeRow(overrides: Partial<StaffReportRow> = {}): StaffReportRow {
  return {
    user: { id: 10, firstName: 'Ali', lastName: 'Valiyev', role: UserRole.TEACHER },
    expectedDays: 20,
    attendedDays: 18,
    missedDays: 2,
    lateDays: 1,
    totalLateMinutes: 45,
    flaggedDays: 0,
    ...overrides,
  }
}

function makeReport(rows: StaffReportRow[], overrides: Partial<Report> = {}): Report {
  return { from: '2026-09-01', to: '2026-09-24', centerNotConfigured: false, rows, ...overrides }
}

function mountReport(report: Report | null, loading = false) {
  return mount(StaffAttendanceReport, { props: { report, loading } })
}

describe('StaffAttendanceReport', () => {
  it('renders one row per report row with the employee name and day counts', () => {
    const wrapper = mountReport(makeReport([makeRow(), makeRow({ user: { id: 11, firstName: 'Bek', lastName: 'Aliyev', role: UserRole.TEACHER } })]))
    const rows = wrapper.get('tbody').findAll('tr')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.text()).toContain('Ali Valiyev')
    expect(rows[1]!.text()).toContain('Bek Aliyev')
  })

  it('shows missedDays in a danger span only when > 0', () => {
    const withMissed = mountReport(makeReport([makeRow({ missedDays: 3 })]))
    const cellWithMissed = withMissed.get('tbody tr').findAll('td')[3]!
    expect(cellWithMissed.text()).toBe('3')
    expect(cellWithMissed.html()).toContain('text-danger')

    const noMissed = mountReport(makeReport([makeRow({ missedDays: 0 })]))
    const cellNoMissed = noMissed.get('tbody tr').findAll('td')[3]!
    expect(cellNoMissed.html()).not.toContain('text-danger')
  })

  describe('total late minutes formatting', () => {
    it('shows just minutes under an hour', () => {
      const wrapper = mountReport(makeReport([makeRow({ totalLateMinutes: 45 })]))
      const cell = wrapper.get('tbody tr').findAll('td')[5]!
      expect(cell.text()).toBe(`45 ${t('staffAttendance.minutesShort')}`)
    })

    it('shows hours + remaining minutes', () => {
      const wrapper = mountReport(makeReport([makeRow({ totalLateMinutes: 90 })]))
      const cell = wrapper.get('tbody tr').findAll('td')[5]!
      expect(cell.text()).toBe(`1 ${t('staffAttendance.hoursShort')} 30 ${t('staffAttendance.minutesShort')}`)
    })

    it('shows only hours with no remainder', () => {
      const wrapper = mountReport(makeReport([makeRow({ totalLateMinutes: 120 })]))
      const cell = wrapper.get('tbody tr').findAll('td')[5]!
      expect(cell.text()).toBe(`2 ${t('staffAttendance.hoursShort')}`)
    })

    it('shows a dash for zero', () => {
      const wrapper = mountReport(makeReport([makeRow({ totalLateMinutes: 0 })]))
      const cell = wrapper.get('tbody tr').findAll('td')[5]!
      expect(cell.text()).toBe('—')
    })
  })

  it('shows a warning badge for flaggedDays > 0, else a dash', () => {
    const flagged = mountReport(makeReport([makeRow({ flaggedDays: 2 })]))
    const cell = flagged.get('tbody tr').findAll('td')[6]!
    expect(cell.text()).toBe('2')
    expect(cell.html()).toContain('bg-warning')

    const notFlagged = mountReport(makeReport([makeRow({ flaggedDays: 0 })]))
    const cellNotFlagged = notFlagged.get('tbody tr').findAll('td')[6]!
    expect(cellNotFlagged.text()).toBe('—')
  })

  it('renders the report hint text', () => {
    const wrapper = mountReport(makeReport([makeRow()]))
    expect(wrapper.text()).toContain(t('staffAttendance.report.hint'))
  })

  it('renders an empty table with no report loaded', () => {
    const wrapper = mountReport(null)
    expect(wrapper.get('tbody').text()).toContain(t('common.noData'))
  })
})
