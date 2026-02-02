import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  requiredAmount: number;
  creditsPerPayment: number;
  onPaymentSuccess?: () => void;
}

const ZIGMA_TOKEN_MINT = 'xT4tzTkuyXyDqCWeZyahrhnknPd8KBuuNjPngvqcyai';
const PHANTOM_TOKEN_URL = `https://phantom.com/tokens/solana/${ZIGMA_TOKEN_MINT}?referralId=gkr7v4xfqno`;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  requiredAmount,
  creditsPerPayment,
  onPaymentSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    setPaymentStatus('verifying');

    try {
      // Check payment status via Helius webhook
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.zigma.pro';
      const response = await fetch(`${apiBaseUrl}/api/helius/payment-status/${walletAddress}`);
      const data = await response.json();
      
      if (data.success && data.hasRecentPayment) {
        setPaymentStatus('success');
        setCreditsBalance(creditsPerPayment);
        
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // No payment found yet, show error
        setPaymentStatus('error');
        setTimeout(() => {
          setPaymentStatus('pending');
        }, 3000);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setPaymentStatus('error');
      setTimeout(() => {
        setPaymentStatus('pending');
      }, 3000);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Purchase Chat Credits</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Payment Info */}
        <div className="space-y-4 mb-4">
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-lg">💎</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">${requiredAmount} USD in $ZIGMA</p>
                <p className="text-green-400 text-xs">= {creditsPerPayment} Chat Credits</p>
              </div>
            </div>
          </div>

          {/* Phantom Token Link */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
            <a
              href={PHANTOM_TOKEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center"
            >
              <ExternalLink className="w-4 h-4" />
              Buy $ZIGMA on Phantom
            </a>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-lg p-3 flex justify-center">
            <QRCodeSVG
              value={walletAddress}
              size={160}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Wallet Address */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <code className="text-green-400 text-xs font-mono flex-1 break-all">
                {walletAddress}
              </code>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'success' && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-semibold text-sm">Payment Verified!</p>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 font-semibold text-sm">Verification Failed</p>
            </div>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerifyPayment}
          disabled={isVerifying || paymentStatus === 'success'}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : paymentStatus === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Verified
            </>
          ) : (
            'Verify Payment'
          )}
        </button>
      </div>
    </div>
  );
};
