import { useCart } from '../context/CartContext';

const Toast = () => {
  const { toast } = useCart();

  if (!toast) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[toast.type] || 'bg-green-500';

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }[toast.type] || '✓';

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse`}>
      <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
        {icon}
      </span>
      <span className="font-medium">{toast.message}</span>
    </div>
  );
};

export default Toast;
