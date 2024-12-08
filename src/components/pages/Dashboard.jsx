import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, GraduationCap, School, TrendingUp } from "lucide-react";
import { baseurl } from "../../baseurl/baseurl";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalSalaryExpense: 0,
    totalIncome: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalTeachers: 0,
    totalRevenue: 0,
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const url = new URL(baseurl + "/api/analytics");
        const params = {
          viewType: "yearly",
          year: 2024,
          fromDate,
          toDate,
        };
        url.search = new URLSearchParams(params).toString();

        const response = await axios.get(url.toString());
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    // Only fetch data when both dates are selected or the component mounts
    if (fromDate && toDate) {
      fetchAnalytics();
    }
  }, [fromDate, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your school management system
        </p>
      </div>

      <div className="flex items-center space-x-6 mb-6">
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700">
            From Date:
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700">
            To Date:
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={analyticsData.totalStudents}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Teachers"
          value={analyticsData.totalTeachers}
          icon={GraduationCap}
          color="bg-green-500"
        />
        <StatCard
          title="Total Classes"
          value={analyticsData.totalClasses}
          icon={School}
          color="bg-purple-500"
        />
        <StatCard
          title="Revenue"
          value={`$${analyticsData.totalRevenue}`}
          icon={TrendingUp}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Additional sections like Recent Activity and Quick Actions */}
      </div>
    </div>
  );
};

export default Analytics;
