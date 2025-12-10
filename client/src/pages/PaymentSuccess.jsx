import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const linkId = searchParams.get('link_id');
    
    if (paymentId || linkId) {
      setPaymentDetails({
        paymentId,
        linkId,
        timestamp: new Date().toLocaleString()
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. Thank you for your purchase!
        </p>

        {paymentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-800 mb-2">Payment Details:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {paymentDetails.paymentId && (
                <p><strong>Payment ID:</strong> {paymentDetails.paymentId}</p>
              )}
              {paymentDetails.linkId && (
                <p><strong>Link ID:</strong> {paymentDetails.linkId}</p>
              )}
              <p><strong>Time:</strong> {paymentDetails.timestamp}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/orders"
            className="block w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            📧 A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;