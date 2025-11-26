import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'react-hot-toast';
import { paymentsApi, appointmentsApi, type Appointment } from '../services/api';
import { CreditCard, Smartphone, Building2, CheckCircle2, Loader2 } from 'lucide-react';

export default function Payment() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');

  const amount = 500; // Mock consultation fee

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setIsLoading(true);
      const appointments = await appointmentsApi.getAll();
      const apt = appointments.find(a => a.id === appointmentId);
      if (apt) {
        setAppointment(apt);
      } else {
        toast.error('Appointment not found');
        navigate('/patient/dashboard');
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      toast.error('Failed to load appointment');
      navigate('/patient/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\//g, '');
    if (value.length <= 4 && /^\d*$/.test(value)) {
      if (value.length >= 2) {
        setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
      } else {
        setCardExpiry(value);
      }
    }
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCardCVV(value);
    }
  };

  const validateForm = () => {
    if (paymentMethod === 'card') {
      if (!cardName.trim()) {
        toast.error('Please enter cardholder name');
        return false;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return false;
      }
      if (cardExpiry.length !== 5) {
        toast.error('Please enter valid expiry date (MM/YY)');
        return false;
      }
      if (cardCVV.length !== 3) {
        toast.error('Please enter valid CVV');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return false;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!bankName) {
        toast.error('Please select a bank');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (!appointmentId) return;

    setIsProcessing(true);

    // Simulate processing delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      await paymentsApi.create({
        amount,
        appointment_id: appointmentId,
        payment_method: paymentMethod,
      });

      setPaymentSuccess(true);
      toast.success('Payment successful!');

      // Redirect to payment history after 3 seconds
      setTimeout(() => {
        navigate('/payments/history');
      }, 3000);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.detail || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-20 h-20 text-green-600 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your payment of Rs. {amount} has been processed successfully.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Appointment ID:</strong> {appointment?.id.slice(0, 8)}...
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Payment Method:</strong> {paymentMethod.toUpperCase()}
                </p>
              </div>
              <p className="text-sm text-gray-500">Redirecting to payment history...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-600">Secure payment for your appointment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column - Order Summary */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointment && (
                  <>
                    <div className="border-b pb-4">
                      <p className="text-sm text-gray-600">Appointment</p>
                      <p className="font-medium">{appointment.date}</p>
                      <p className="text-sm text-gray-600">{appointment.time}</p>
                    </div>
                    <div className="border-b pb-4">
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-medium">{appointment.reason}</p>
                    </div>
                  </>
                )}
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                  <p className="font-medium">Rs. {amount}</p>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>Rs. {amount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Payment Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">UPI</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Net Banking</span>
                  </button>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={cardCVV}
                          onChange={handleCVVChange}
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay)
                      </p>
                    </div>
                  </div>
                )}

                {/* Net Banking Form */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bank">Select Bank</Label>
                      <Select value={bankName} onValueChange={setBankName}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sbi">State Bank of India</SelectItem>
                          <SelectItem value="hdfc">HDFC Bank</SelectItem>
                          <SelectItem value="icici">ICICI Bank</SelectItem>
                          <SelectItem value="axis">Axis Bank</SelectItem>
                          <SelectItem value="pnb">Punjab National Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Pay Button */}
                <div className="pt-4">
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-12 text-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      `Pay Rs. ${amount}`
                    )}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-3">
                    By proceeding, you agree to our terms and conditions. This is a mock payment
                    and no actual transaction will occur.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
