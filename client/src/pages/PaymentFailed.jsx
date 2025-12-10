import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const [failureReason, setFailureReason] = useState('');

  useEffect(() => {
    const reason = searchParams.get('reason');
    
    const reasonMessages = {
      'signature_mismatch': 'Payment verification failed due to security reasons.',
      'payment_failed': 'Payment was not completed successfully.',
      'server_error': 'A technical error occurred during payment processing.',
      'cancelled': 'Payment was cancelled by the user.',
      'timeout': 'Payment session expired. Please try again.'
    };

    setFailureReason(reasonMessages[reason] || 'Payment could not be completed.');
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          {failureReason}
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-red-800 mb-2">What happened?</h3>
          <p className="text-sm text-red-700">
            Your payment could not be processed. No amount has been deducted from your account.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/cart"
            className="block w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark"
          >
            Try Again
          </Link>
          <Link
            to="/"
            className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Need Help?</h4>
          <p className="text-sm text-yellow-700">
            If you continue to face issues, please contact our support team or try using a different payment method.
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Payment processed by Razorpay</p>
          <p>Timestamp: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;