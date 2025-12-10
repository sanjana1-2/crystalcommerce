# Payment Link Generation - Test Guide

## 🔗 Payment Link Features Added

### 1. Admin Dashboard Payment Links
- Navigate to: http://localhost:3001/admin (login as sanjana@gmail.com / 2342)
- Click on "Payment Links" tab
- Click "Generate Payment Link" button
- Fill in amount and customer details
- Get shareable payment link

### 2. Cart Payment Links
- Add items to cart: http://localhost:3001
- Go to cart: http://localhost:3001/cart
- Click "🔗 Generate Payment Link" button
- Get payment link for entire cart

### 3. Payment Link Features
- ✅ Multiple payment methods (UPI, Cards, Net Banking, Wallets)
- ✅ Auto SMS & Email notifications to customers
- ✅ Real-time payment status tracking
- ✅ Secure payment verification
- ✅ Success/failure callback handling

### 4. API Endpoints Added
- `POST /payment/generate-link` - Generate custom payment link
- `POST /payment/generate-cart-link` - Generate cart payment link
- `GET /payment/link-status/:paymentLinkId` - Check payment status
- `GET /payment/link-success/:paymentLinkId` - Handle success callback

### 5. New Pages
- `/payment-success` - Payment success page
- `/payment-failed` - Payment failure page

### 6. Test Payment Link
To test payment links:
1. Generate a payment link from admin dashboard or cart
2. Open the generated link
3. Use Razorpay test credentials:
   - Test Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
   - UPI: success@razorpay (for success)
   - UPI: failure@razorpay (for failure)

### 7. Integration Details
- Uses Razorpay Payment Links API
- Supports all major payment methods
- Automatic notifications enabled
- Callback URLs configured for success/failure
- Payment verification with signature validation

## 🚀 Ready to Use!
Both servers are running:
- Frontend: http://localhost:3001
- Backend: http://localhost:5001
- Admin Dashboard: http://localhost:3001/admin (sanjana@gmail.com / 2342)