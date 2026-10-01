import { themeBalham } from 'ag-grid-community';

export const appTheme = themeBalham.withParams({
  fontFamily: 'inherit',
  fontSize: 12,
  rowHeight: 32,          // was 44 (passed per-page)
  headerHeight: 36,
  cellHorizontalPadding: 8,
  spacing: 4,
  headerBackgroundColor: '#f8fafc',
  headerTextColor: '#475569',
  headerFontSize: 11,
  headerFontWeight: 600,
  borderColor: '#e2e8f0',
  rowHoverColor: '#f1f5f9',
  selectedRowBackgroundColor: '#e0e7ff',
  wrapperBorderRadius: 0,
  borderRadius: 2,
});
