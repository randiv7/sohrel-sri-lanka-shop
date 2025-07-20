
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

interface SalesReport {
  period: string;
  summary: {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
  };
  orders_by_status: Record<string, number>;
  daily_revenue: Array<{ date: string; revenue: number }>;
  top_products: Array<{
    product_id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  generated_at: string;
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [period, setPeriod] = useState('30');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!adminData || !adminData.is_active) {
        navigate('/');
        return;
      }

      const permissions = adminData.permissions as any;
      if (!permissions?.view_analytics) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view analytics.",
          variant: "destructive",
        });
        navigate('/admin');
        return;
      }

      generateReport();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/login');
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const params = new URLSearchParams();
      
      if (dateRange?.from && dateRange?.to) {
        params.append('start_date', dateRange.from.toISOString().split('T')[0]);
        params.append('end_date', dateRange.to.toISOString().split('T')[0]);
      } else {
        params.append('period', period);
      }

      const { data, error } = await supabase.functions.invoke('sales-report-generator', {
        body: Object.fromEntries(params)
      });

      if (error) throw error;

      if (data.success) {
        setReport(data.report);
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate sales report.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusColors = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
    refunded: '#6b7280'
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <div className="text-lg">Loading analytics...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Sales Analytics
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={exportReport} variant="outline" disabled={!report}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Date Range</label>
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>
            <Button onClick={generateReport} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  LKR {report.summary.total_revenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.period}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.summary.total_orders.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.period}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  LKR {report.summary.average_order_value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per order
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Daily Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={report.daily_revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`LKR ${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(report.orders_by_status).map(([status, count]) => ({
                        name: status,
                        value: count,
                        fill: statusColors[status as keyof typeof statusColors] || '#6b7280'
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {Object.entries(report.orders_by_status).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry[0] as keyof typeof statusColors] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={report.top_products.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `LKR ${Number(value).toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Quantity'
                  ]} />
                  <Bar dataKey="quantity" fill="#10b981" name="quantity" />
                  <Bar dataKey="revenue" fill="#3b82f6" name="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
