export interface HistoryItem {
  id: string;
  title: string;
  contractText: string;
  analysisText: string;
  timestamp: string;
}

export interface AnalysisResult {
  summary: string;
  redFlags: string;
  counterClauses: string;
}
