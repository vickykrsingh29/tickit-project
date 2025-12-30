import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  FaUsers, 
  FaFileInvoice, 
  FaChartLine, 
  FaStar, 
  FaUserPlus, 
  FaClock, 
  FaBox
} from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Enhanced chart options with better styling
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        font: { size: 12 },
        usePointStyle: true,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 14 },
      bodyFont: { size: 13 },
      cornerRadius: 4
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        font: { size: 12 }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: { size: 12 }
      }
    }
  }
};

// Interfaces remain the same
interface KPICards {
  totalQuoteValue: string;
  quoteSuccessRate: string;
  totalActiveCustomers: number;
  newCustomersAdded: number;
  topSalesRepresentative: string;
  averageQuoteProcessingTime: string;
  totalProducts: number;
  totalQuotes: number;
}

interface ChartData {
  quoteTrends: any;
  quoteStatusDistribution: any;
  topProducts: any;
  customerDistribution: any;
}

interface SalesCustomerInsights {
  topCustomers: { customerName: string; totalValue: number }[];
  personQuoteGeneration: any;
  averageApprovalTime: string;
}

interface DashboardData {
  kpiCards: KPICards;
  chartData: ChartData;
  salesCustomerInsights: SalesCustomerInsights;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${backendUrl}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Could not fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [backendUrl, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading dashboard data</div>
      </div>
    );
  }

  const { kpiCards, chartData, salesCustomerInsights } = dashboardData;

  interface KPICardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    bgColor: string;
    textColor: string;
  }

  const KPICard: React.FC<KPICardProps> = ({ icon: Icon, title, value, bgColor, textColor }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className={`p-3 ${bgColor} rounded-full`}>
          <Icon className={`${textColor} text-xl`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );


  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* KPI Cards Grid with more metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={FaFileInvoice}
          title="Total Quote Value"
          value={kpiCards.totalQuoteValue}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <KPICard
          icon={FaChartLine}
          title="Success Rate"
          value={`${kpiCards.quoteSuccessRate}%`}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <KPICard
          icon={FaUsers}
          title="Active Customers"
          value={kpiCards.totalActiveCustomers}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <KPICard
          icon={FaUserPlus}
          title="New Customers (30d)"
          value={kpiCards.newCustomersAdded}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
        <KPICard
          icon={FaStar}
          title="Top Sales Rep"
          value={kpiCards.topSalesRepresentative}
          bgColor="bg-pink-50"
          textColor="text-pink-600"
        />
        <KPICard
          icon={FaClock}
          title="Avg. Processing Time"
          value={`${kpiCards.averageQuoteProcessingTime} days`}
          bgColor="bg-indigo-50"
          textColor="text-indigo-600"
        />
         <KPICard
          icon={FaBox}
          title="Total Products"
          value={kpiCards.totalProducts}
          bgColor="bg-teal-50"
          textColor="text-teal-600"
        />
         <KPICard
          icon={FaFileInvoice}
          title="Total Quotes"
          value={kpiCards.totalQuotes}
          bgColor="bg-lime-50"
          textColor="text-lime-600"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly Quote Trends</h2>
          <div className="h-[300px]">
            <Bar data={chartData.quoteTrends} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Quote Status Distribution</h2>
          <div className="h-[300px]">
            <Doughnut 
              data={chartData.quoteStatusDistribution} 
              options={{
                ...chartOptions,
                cutout: '65%',
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Sales Performance</h2>
          <div className="h-[250px]">
            <Bar 
              data={salesCustomerInsights.personQuoteGeneration} 
              options={chartOptions} 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Top Customers</h2>
          <div className="space-y-3">
            {salesCustomerInsights.topCustomers.map((customer, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-700">{customer.customerName}</span>
                <span className="text-gray-600">₹{customer.totalValue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Top Products</h2>
          <div className="h-[250px]">
            <Bar data={chartData.topProducts} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Industry Distribution</h2>
          <div className="h-[250px]">
            <Doughnut 
              data={chartData.customerDistribution}
              options={{
                ...chartOptions,
                cutout: '65%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;