import React, { useState, useEffect } from "react";
import StatisticsService from "@/service/statistics.service";
import {
  BanknotesIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

// Statistics Cards Data Hook - Original
export const StatisticsCardsData = () => {
  const [stats, setStats] = useState([
    { color: "gray", icon: BanknotesIcon, title: "Total Candidates", value: "0", footer: { color: "text-green-500", value: "", label: "" } },
    { color: "gray", icon: UsersIcon, title: "Total Data Encoder Candidates", value: "0", footer: { color: "text-green-500", value: "", label: "" } },
    { color: "gray", icon: UserPlusIcon, title: "Total Supervisor Candidates", value: "0", footer: { color: "text-green-500", value: "", label: "" } },
    { color: "gray", icon: ChartBarIcon, title: "Total Users", value: "0", footer: { color: "text-green-500", value: "", label: "" } },
    { color: "gray", icon: CheckCircleIcon, title: "Passed Data Encoder", value: "0", footer: { color: "text-green-500", value: "", label: "passed data encoder candidates" } },
    { color: "gray", icon: XCircleIcon, title: "Failed Data Encoder", value: "0", footer: { color: "text-red-500", value: "", label: "failed data encoder candidates" } },
    { color: "gray", icon: CheckCircleIcon, title: "Passed Supervisor", value: "0", footer: { color: "text-green-500", value: "", label: "passed supervisor candidates" } },
    { color: "gray", icon: XCircleIcon, title: "Failed Supervisor", value: "0", footer: { color: "text-red-500", value: "", label: "failed supervisor candidates" } },
  ]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await StatisticsService.getstatistics();

        setStats([
          {
            color: "gray",
            icon: BanknotesIcon,
            title: "Total Candidates",
            value: data.totalRegisteredStudents?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "students in total" },
          },
          {
            color: "gray",
            icon: UsersIcon,
            title: "Total Data Encoder Candidates",
            value: data.juniorCandidates?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "data encoder candidates" },
          },
          {
            color: "gray",
            icon: UserPlusIcon,
            title: "Total Supervisor Candidates",
            value: data.experiencedCandidates?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "supervisor candidates" },
          },
          {
            color: "gray",
            icon: ChartBarIcon,
            title: "Total Users",
            value: data.totalRegisteredUsers?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "users in total" },
          },
          {
            color: "gray",
            icon: CheckCircleIcon,
            title: "Passed Data Encoder",
            value: data.passJunior?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "passed data encoder candidates" },
          },
          {
            color: "gray",
            icon: XCircleIcon,
            title: "Failed Data Encoder",
            value: data.failJunior?.toString() || "0",
            footer: { color: "text-red-500", value: "", label: "failed data encoder candidates" },
          },
          {
            color: "gray",
            icon: CheckCircleIcon,
            title: "Passed Supervisor",
            value: data.passExperienced?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "passed supervisor candidates" },
          },
          {
            color: "gray",
            icon: XCircleIcon,
            title: "Failed Supervisor",
            value: data.failExperienced?.toString() || "0",
            footer: { color: "text-red-500", value: "", label: "failed supervisor candidates" },
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };

    fetchStatistics();
  }, []);

  return stats;
};

// Default export for the dashboard component
export default function StatisticsCardsDataWithDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await StatisticsService.getstatistics();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Prepare data for charts
  const candidateComparisonData = [
    {
      name: 'Data Encoder',
      Total: stats?.juniorCandidates || 0,
      Passed: stats?.passJunior || 0,
      Failed: stats?.failJunior || 0,
    },
    {
      name: 'Supervisor',
      Total: stats?.experiencedCandidates || 0,
      Passed: stats?.passExperienced || 0,
      Failed: stats?.failExperienced || 0,
    },
  ];

  const passFailData = [
    { name: 'Passed Data Encoder', value: stats?.passJunior || 0 },
    { name: 'Failed Data Encoder', value: stats?.failJunior || 0 },
    { name: 'Passed Supervisor', value: stats?.passExperienced || 0 },
    { name: 'Failed Supervisor', value: stats?.failExperienced || 0 },
  ];

  const passRateData = [
    {
      subject: 'Data Encoder',
      'Pass Rate': stats?.juniorCandidates ? ((stats.passJunior / stats.juniorCandidates) * 100).toFixed(1) : 0,
      'Fail Rate': stats?.juniorCandidates ? ((stats.failJunior / stats.juniorCandidates) * 100).toFixed(1) : 0,
    },
    {
      subject: 'Supervisor',
      'Pass Rate': stats?.experiencedCandidates ? ((stats.passExperienced / stats.experiencedCandidates) * 100).toFixed(1) : 0,
      'Fail Rate': stats?.experiencedCandidates ? ((stats.failExperienced / stats.experiencedCandidates) * 100).toFixed(1) : 0,
    },
  ];

  const radarData = [
    {
      subject: 'Data Encoder',
      A: stats?.juniorCandidates || 0,
      fullMark: Math.max(stats?.juniorCandidates || 0, stats?.experiencedCandidates || 0, 100),
    },
    {
      subject: 'Supervisor',
      A: stats?.experiencedCandidates || 0,
      fullMark: Math.max(stats?.juniorCandidates || 0, stats?.experiencedCandidates || 0, 100),
    },
    {
      subject: 'Passed',
      A: (stats?.passJunior || 0) + (stats?.passExperienced || 0),
      fullMark: (stats?.juniorCandidates || 0) + (stats?.experiencedCandidates || 0) || 100,
    },
    {
      subject: 'Failed',
      A: (stats?.failJunior || 0) + (stats?.failExperienced || 0),
      fullMark: (stats?.juniorCandidates || 0) + (stats?.experiencedCandidates || 0) || 100,
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color = "blue", footer }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
      {footer && (
        <div className="mt-4">
          <span className={`${footer.color} text-sm font-medium`}>
            {footer.value} {footer.label}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Candidates"
          value={stats?.totalRegisteredStudents || 0}
          icon={BanknotesIcon}
          color="blue"
          footer={{ color: "text-green-500", value: "", label: "students in total" }}
        />
        <StatCard
          title="Data Encoder Candidates"
          value={stats?.juniorCandidates || 0}
          icon={UsersIcon}
          color="green"
          footer={{ color: "text-green-500", value: "", label: "junior candidates" }}
        />
        <StatCard
          title="Supervisor Candidates"
          value={stats?.experiencedCandidates || 0}
          icon={UserPlusIcon}
          color="purple"
          footer={{ color: "text-green-500", value: "", label: "experienced candidates" }}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalRegisteredUsers || 0}
          icon={ChartBarIcon}
          color="orange"
          footer={{ color: "text-green-500", value: "", label: "registered users" }}
        />
      </div>

      {/* Charts Grid - You can add recharts here if needed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Add your charts here */}
      </div>

      {/* Success Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Data Encoder Success Rate</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats?.juniorCandidates ? ((stats.passJunior / stats.juniorCandidates) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${stats?.juniorCandidates ? ((stats.passJunior / stats.juniorCandidates) * 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats?.passJunior || 0} passed out of {stats?.juniorCandidates || 0} candidates
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Supervisor Success Rate</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats?.experiencedCandidates ? ((stats.passExperienced / stats.experiencedCandidates) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-full">
              <UserPlusIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${stats?.experiencedCandidates ? ((stats.passExperienced / stats.experiencedCandidates) * 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats?.passExperienced || 0} passed out of {stats?.experiencedCandidates || 0} candidates
            </p>
          </div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Passed Candidates</p>
              <p className="text-2xl font-bold">{(stats?.passJunior || 0) + (stats?.passExperienced || 0)}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Failed Candidates</p>
              <p className="text-2xl font-bold">{(stats?.failJunior || 0) + (stats?.failExperienced || 0)}</p>
            </div>
            <XCircleIcon className="h-8 w-8 opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Users</p>
              <p className="text-2xl font-bold">{stats?.totalRegisteredUsers || 0}</p>
            </div>
            <UsersIcon className="h-8 w-8 opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Overall Success Rate</p>
              <p className="text-2xl font-bold">
                {stats?.totalRegisteredStudents ? 
                  ((((stats.passJunior || 0) + (stats.passExperienced || 0)) / stats.totalRegisteredStudents) * 100).toFixed(1) 
                  : 0}%
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 opacity-75" />
          </div>
        </div>
      </div>
    </div>
  );
}