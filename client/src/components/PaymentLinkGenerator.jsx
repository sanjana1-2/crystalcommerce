import { useState } from 'react';
import api from '../api/axios';

const PaymentLinkGenerator = ({ onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generatePaymentLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate phone number (no recurring digits)
    if (formData.customerPhone && /^(\d)\1{9}$/.test(formData.customerPhone)) {
      setError('Phone number cannot have all same digits (e.g., 9999999999)');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/payment/generate-link', {
        amount: parseFloat(formData.amount),
        description: formData.description,
        customerInfo: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone || '9876543210' // Default valid phone
        }
      });

      setGeneratedLink(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate payment link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Payment link copied to clipboard!');
  };

  const shareLink = (url) => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Link - ShopKart',
        text: `Payment of ₹${generatedLink.amount} - ${generatedLink.description}`,
        url: url
      });
    } else {
      copyToClipboard(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Generate Payment Link</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {!generatedLink ? (
          <form onSubmit={generatePaymentLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="1"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Payment description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="customer@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Phone
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="9876543210"
                pattern="[0-9]{10}"
              />
              <p className="text-xs text-gray-500 mt-1">
                10-digit phone number (avoid repeating digits like 9999999999)
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.amount}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Payment Link'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Payment Link Generated!</h3>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>Amount:</strong> ₹{generatedLink.amount}</p>
                <p><strong>Description:</strong> {generatedLink.description}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Link:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generatedLink.paymentLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(generatedLink.paymentLink)}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => shareLink(generatedLink.paymentLink)}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-dark"
              >
                Share Link
              </button>
              <button
                onClick={() => window.open(generatedLink.paymentLink, '_blank')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
              >
                Open Link
              </button>
            </div>

            <button
              onClick={() => {
                setGeneratedLink(null);
                setFormData({
                  amount: '',
                  description: '',
                  customerName: '',
                  customerEmail: '',
                  customerPhone: ''
                });
              }}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700"
            >
              Generate Another Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentLinkGenerator;