import { isUsingMockData } from '../lib/agentClient';

/**
 * Visual indicator showing when the app is running in mock mode
 */
export function MockModeIndicator() {
  const isMockMode = isUsingMockData();

  if (!isMockMode) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
      <div className="w-2 h-2 bg-white rounded-full"></div>
      <span className="text-sm font-medium">🎭 Mock Mode Active</span>
    </div>
  );
}
