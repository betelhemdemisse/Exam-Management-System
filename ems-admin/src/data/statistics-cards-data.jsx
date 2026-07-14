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
            value: data.dataEncoderCandidates?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "data encoder candidates" },
          },
          {
            color: "gray",
            icon: UserPlusIcon,
            title: "Total Supervisor Candidates",
            value: data.supervisorCandidates?.toString() || "0",
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
            value: data.passDataEncoder?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "passed data encoder candidates" },
          },
          {
            color: "gray",
            icon: XCircleIcon,
            title: "Failed Data Encoder",
            value: data.failDataEncoder?.toString() || "0",
            footer: { color: "text-red-500", value: "", label: "failed data encoder candidates" },
          },
          {
            color: "gray",
            icon: CheckCircleIcon,
            title: "Passed Supervisor",
            value: data.passSupervisor?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "passed supervisor candidates" },
          },
          {
            color: "gray",
            icon: XCircleIcon,
            title: "Failed Supervisor",
            value: data.failSupervisor?.toString() || "0",
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

export default StatisticsCardsData;
