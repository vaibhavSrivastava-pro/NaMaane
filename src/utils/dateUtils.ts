export const DateUtils = {
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  },

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  getTodayString(): string {
    return this.formatDate(new Date());
  },

  isToday(dateString: string): boolean {
    return dateString === this.getTodayString();
  },

  getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
  }
};
