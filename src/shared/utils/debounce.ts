/** Debounce a function by `wait` ms (trailing edge). */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait = 350): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}
