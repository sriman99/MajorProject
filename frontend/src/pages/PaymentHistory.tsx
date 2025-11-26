import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { paymentsApi, appointmentsApi, type Payment, type Appointment } from '../services/api';
import { toast } from 'react-hot-toast';
import { CreditCard, Smartphone, Building2, Loader2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const [paymentsData, appointmentsData] = await Promise.all([
        paymentsApi.getAll(),
        appointmentsApi.getAll(),
      ]);

      setPayments(paymentsData);

      // Create a map of appointments for quick lookup
      const appointmentsMap: Record<string, Appointment> = {};
      appointmentsData.forEach(apt => {
        appointmentsMap[apt.id] = apt;
      });
      setAppointments(appointmentsMap);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (paymentId: string) => {
    setExpandedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'upi':
        return <Smartphone className="w-5 h-5" />;
      case 'netbanking':
        return <Building2 className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'hh:mm a');
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/patient/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-1">View all your past payments and transactions</p>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</h3>
              <p className="text-gray-600 mb-6">You haven't made any payments yet.</p>
              <Button onClick={() => navigate('/appointments')}>
                Book an Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const appointment = appointments[payment.appointment_id];
              const isExpanded = expandedPayments.has(payment.id);

              return (
                <Card key={payment.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          {getPaymentMethodIcon(payment.payment_method)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Rs. {payment.amount}
                            </h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Payment Method:</span>{' '}
                              {payment.payment_method.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Date:</span> {formatDate(payment.created_at)}{' '}
                              at {formatTime(payment.created_at)}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Transaction ID:</span>{' '}
                              {payment.id.slice(0, 12)}...
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(payment.id)}
                        className="ml-4"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4">Appointment Details</h4>
                        {appointment ? (
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500">Appointment Date</p>
                                <p className="text-sm font-medium">{appointment.date}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Appointment Time</p>
                                <p className="text-sm font-medium">{appointment.time}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <p className="text-sm font-medium capitalize">{appointment.status}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Appointment ID</p>
                                <p className="text-sm font-medium">{appointment.id.slice(0, 8)}...</p>
                              </div>
                            </div>
                            <div className="pt-2">
                              <p className="text-xs text-gray-500">Reason</p>
                              <p className="text-sm font-medium">{appointment.reason}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Appointment details not available</p>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Payment ID</span>
                              <span className="text-sm font-medium">{payment.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Amount Paid</span>
                              <span className="text-sm font-medium">Rs. {payment.amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Payment Status</span>
                              <span className="text-sm font-medium capitalize">{payment.status}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Payment Date</span>
                              <span className="text-sm font-medium">
                                {formatDate(payment.created_at)} {formatTime(payment.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Card */}
        {payments.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Overview of all your payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
                  <p className="text-sm text-gray-600">Total Payments</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {payments.filter(p => p.status === 'success').length}
                  </p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    Rs. {payments.reduce((sum, p) => sum + p.amount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
