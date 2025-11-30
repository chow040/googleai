import { EquityReport } from '../types';
import { apiJson } from './apiClient';
import { logger } from '../src/lib/logger';

export const chatWithGemini = async (
  report: EquityReport,
  messageHistory: { role: 'user' | 'model', text: string }[],
  userNotes?: string,
  userThesis?: string
): Promise<string> => {
  try {
    const { data, requestId } = await apiJson<{ text?: string }>('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report, messageHistory, userNotes, userThesis })
    }, { operation: 'ai.chat' });

    logger.info('chat.response.received', { requestId, meta: { historyLength: messageHistory.length } });
    return data.text || "I couldn't generate a response.";
  } catch (error) {
    logger.captureError(error, {
      meta: { endpoint: '/api/chat', ticker: report.ticker }
    });
    return (error as Error)?.message || 'Connection error. Please try again.';
  }
};

export const generateEquityReport = async (ticker: string): Promise<EquityReport> => {
  const { data, requestId } = await apiJson<EquityReport>('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker })
  }, { operation: 'ai.reports.generate' });

  logger.info('reports.generate.success', { requestId, meta: { ticker } });
  return data;
};
