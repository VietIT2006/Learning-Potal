import payos from '../config/payos.js';

export const createPaymentLink = async (req, res) => {
  try {
    const { amount, description, returnUrl, cancelUrl } = req.body;
    
    // Check minimum 10.000 VND
    if (!amount || amount < 10000) {
      return res.status(400).json({ error: -1, message: 'Số tiền tối thiểu là 10.000 VNĐ', data: null });
    }

    const orderCode = Number(String(Date.now()).slice(-6));
    const body = {
      orderCode,
      amount,
      description: 'Thanh toan vi',
      returnUrl: returnUrl || 'http://localhost:5173/wallet',
      cancelUrl: cancelUrl || 'http://localhost:5173/wallet'
    };

    const paymentLinkRes = await payos.paymentRequests.create(body);
    res.json({ error: 0, message: 'Success', data: { checkoutUrl: paymentLinkRes.checkoutUrl, paymentLinkId: paymentLinkRes.id || paymentLinkRes.paymentLinkId, orderCode } });
  } catch (error) {
    console.error('Lỗi khi tạo payment link:', error);
    res.status(500).json({ error: -1, message: 'fail', data: null });
  }
};

export const getPaymentInfo = async (req, res) => {
  try {
    const orderCode = String(req.params.orderCode);
    const paymentLinkInfo = await payos.paymentRequests.get(orderCode);
    res.json({ error: 0, message: 'Success', data: paymentLinkInfo });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin thanh toán:', error);
    res.status(500).json({ error: -1, message: 'fail', data: null });
  }
};
