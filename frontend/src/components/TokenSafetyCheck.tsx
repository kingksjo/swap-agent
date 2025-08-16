import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Token } from '../types';
import { SwapService } from '../utils/swapService';

interface Props {
  token: Token;
  onContinue: () => void;
  onCancel: () => void;
}

export const TokenSafetyCheck: React.FC<Props> = ({ token, onContinue, onCancel }) => {
  const swapService = new SwapService();
  const safetyResult = swapService.checkTokenSafety(token);

  const getRiskColor = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW': return 'text-green-400 bg-green-900/20 border-green-700';
      case 'MEDIUM': return 'text-orange-400 bg-orange-900/20 border-orange-700';
      case 'HIGH': return 'text-red-400 bg-red-900/20 border-red-700';
    }
  };

  const getRiskIcon = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW': return <CheckCircle className="w-4 h-4" />;
      case 'MEDIUM': return <AlertTriangle className="w-4 h-4" />;
      case 'HIGH': return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-medium">Token Safety Check</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Token</span>
          <div className="flex items-center gap-2">
            <span className="text-white">{token.name} ({token.symbol})</span>
            {safetyResult.isVerified ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Risk Level</span>
          <div className={`flex items-center gap-1 px-2 py-1 rounded border ${getRiskColor(safetyResult.riskLevel)}`}>
            {getRiskIcon(safetyResult.riskLevel)}
            <span className="text-sm font-medium">{safetyResult.riskLevel}</span>
          </div>
        </div>

        {token.liquidityUSD && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Liquidity</span>
            <span className="text-white">${token.liquidityUSD.toLocaleString()}</span>
          </div>
        )}
      </div>

      {safetyResult.warnings.length > 0 && (
        <div className="mb-4 p-3 bg-orange-900/20 border border-orange-700 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-orange-400 text-sm font-medium">Warnings</p>
              <ul className="text-orange-300 text-xs mt-1 space-y-1">
                {safetyResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );
};