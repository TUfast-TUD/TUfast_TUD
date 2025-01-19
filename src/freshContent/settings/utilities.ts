export const time = {
  getMinutes: (clicks: number) => {
    const clickValue = clicks * 3
    return Math.floor(clickValue / 60) ?? 0
  },

  getSeconds: (clicks: number) => {
    const clickValue = clicks * 3
    return clickValue % 60 ?? 0
  }
}
