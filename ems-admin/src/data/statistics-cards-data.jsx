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
    { color: "gray", icon: UsersIcon, title: "Total Junior Candidates", value: "0", footer: { color: "text-green-500", value: "", label: "" } },
    { color: "gray", icon: UserPlusIcon, title: "Total Experienced Candidates", value: "0", footer: { color: "text-green-500", value: "", label: "" } },
    { color: "gray", icon: ChartBarIcon, title: "Total Users", value: "0", footer: { color: "text-green-500", value: "", label: "" } },
    { color: "gray", icon: CheckCircleIcon, title: "Passed Junior", value: "0", footer: { color: "text-green-500", value: "", label: "passed junior candidates" } },
    { color: "gray", icon: XCircleIcon, title: "Failed Junior", value: "0", footer: { color: "text-red-500", value: "", label: "failed junior candidates" } },
    { color: "gray", icon: CheckCircleIcon, title: "Passed Experienced", value: "0", footer: { color: "text-green-500", value: "", label: "passed experienced candidates" } },
    { color: "gray", icon: XCircleIcon, title: "Failed Experienced", value: "0", footer: { color: "text-red-500", value: "", label: "failed experienced candidates" } },
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
            title: "Total Junior Candidates",
            value: data.juniorCandidates?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "junior candidates" },
          },
          {
            color: "gray",
            icon: UserPlusIcon,
            title: "Total Experienced Candidates",
            value: data.experiencedCandidates?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "experienced candidates" },
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
            title: "Passed Junior",
            value: data.passJunior?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "passed junior candidates" },
          },
          {
            color: "gray",
            icon: XCircleIcon,
            title: "Failed Junior",
            value: data.failJunior?.toString() || "0",
            footer: { color: "text-red-500", value: "", label: "failed junior candidates" },
          },
          {
            color: "gray",
            icon: CheckCircleIcon,
            title: "Passed Experienced",
            value: data.passExperienced?.toString() || "0",
            footer: { color: "text-green-500", value: "", label: "passed experienced candidates" },
          },
          {
            color: "gray",
            icon: XCircleIcon,
            title: "Failed Experienced",
            value: data.failExperienced?.toString() || "0",
            footer: { color: "text-red-500", value: "", label: "failed experienced candidates" },
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
