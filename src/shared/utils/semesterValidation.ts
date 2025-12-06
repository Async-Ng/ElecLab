/**
 * Validation utilities for semester, week, and date
 *
 * Năm học có 52 tuần:
 * HK 1: Tuần 1-20 (20 tuần)
 * HK 2: Tuần 21-40 (20 tuần)
 * HK 3: Tuần 41-52 (12 tuần)
 */

export enum SemesterWeekRange {
  HK1_START = 1,
  HK1_END = 20,
  HK2_START = 21,
  HK2_END = 40,
  HK3_START = 41,
  HK3_END = 52,
}

/**
 * Get valid week range for a semester
 * @param semester - Semester number (1, 2, or 3)
 * @returns Object with start and end week, or null if invalid semester
 */
export function getWeekRangeBySemester(
  semester: number
): { start: number; end: number } | null {
  switch (semester) {
    case 1:
      return {
        start: SemesterWeekRange.HK1_START,
        end: SemesterWeekRange.HK1_END,
      };
    case 2:
      return {
        start: SemesterWeekRange.HK2_START,
        end: SemesterWeekRange.HK2_END,
      };
    case 3:
      return {
        start: SemesterWeekRange.HK3_START,
        end: SemesterWeekRange.HK3_END,
      };
    default:
      return null;
  }
}

/**
 * Validate if week belongs to semester
 * @param semester - Semester number (1, 2, or 3)
 * @param week - Week number (1-52)
 * @returns true if valid, false otherwise
 */
export function isWeekValidForSemester(
  semester: number,
  week: number
): boolean {
  if (!Number.isInteger(week) || week < 1 || week > 52) {
    return false;
  }

  const range = getWeekRangeBySemester(semester);
  if (!range) return false;

  return week >= range.start && week <= range.end;
}

/**
 * Get semester from week number
 * @param week - Week number (1-52)
 * @returns Semester number (1, 2, or 3), or null if invalid
 */
export function getSemesterFromWeek(week: number): number | null {
  if (!Number.isInteger(week) || week < 1 || week > 52) {
    return null;
  }

  if (week >= 1 && week <= 20) return 1;
  if (week >= 21 && week <= 40) return 2;
  if (week >= 41 && week <= 52) return 3;

  return null;
}

/**
 * Validate date format (DD/MM/YYYY)
 * @param dateStr - Date string in DD/MM/YYYY format
 * @returns true if valid date format and valid date, false otherwise
 */
export function isValidDateFormat(dateStr: string): boolean {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(dateRegex);

  if (!match) return false;

  const [, day, month, year] = match;
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  // Basic validation
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  // Month-specific day validation
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Check for leap year
  if (m === 2 && ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)) {
    daysInMonth[1] = 29;
  }

  return d <= daysInMonth[m - 1];
}

/**
 * Get error message for invalid week/semester combination
 * @param semester - Semester number
 * @param week - Week number
 * @returns Error message or empty string if valid
 */
export function getWeekValidationError(semester: number, week: number): string {
  if (!Number.isInteger(semester) || semester < 1 || semester > 3) {
    return "Học kỳ phải là 1, 2 hoặc 3";
  }

  if (!Number.isInteger(week) || week < 1 || week > 52) {
    return "Tuần phải là từ 1 đến 52";
  }

  if (!isWeekValidForSemester(semester, week)) {
    const range = getWeekRangeBySemester(semester);
    if (range) {
      return `HK ${semester} phải có tuần từ ${range.start} đến ${range.end}`;
    }
    return "Tuần không phù hợp với học kỳ";
  }

  return "";
}

/**
 * Get error message for invalid date
 * @param dateStr - Date string in DD/MM/YYYY format
 * @returns Error message or empty string if valid
 */
export function getDateValidationError(dateStr: string): string {
  if (!dateStr || dateStr.trim() === "") {
    return "Ngày không được để trống";
  }

  if (!isValidDateFormat(dateStr)) {
    return "Ngày phải có định dạng DD/MM/YYYY (ví dụ: 05/08/2024)";
  }

  return "";
}
