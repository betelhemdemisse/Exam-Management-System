import { chartsConfig } from "@/configs";
import StatisticsService from "@/service/statistics.service";

const websiteViewsChart = {
  type: "bar",
  height: 220,
  series: [
    {
      name: "Data Encoder",
      data: [0],
    },
    {
      name: "Supervisor",
      data: [0],
    },
  ],
  options: {
    ...chartsConfig,
    colors: ["#388e3c", "#0288d1"],
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: ["Candidates"],
    },
  },
};

const dailySalesChart = {
  type: "pie",
  height: 220,
  series: [0, 0],
  options: {
    ...chartsConfig,
    colors: ["#388e3c", "#f44336"],
    labels: ["Passed", "Failed"],
    legend: {
      position: "bottom",
    },
  },
};

const completedTaskChart = {
  type: "bar",
  height: 220,
  series: [
    {
      name: "Data Encoder",
      data: [0, 0],
    },
    {
      name: "Supervisor",
      data: [0, 0],
    },
  ],
  options: {
    ...chartsConfig,
    colors: ["#388e3c", "#0288d1"],
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: ["Passed", "Failed"],
    },
  },
};

export const statisticsChartsData = [
  {
    color: "white",
    title: "Candidates by Type",
    description: "Data Encoder vs Supervisor",
    footer: "updated just now",
    chart: websiteViewsChart,
  },
  {
    color: "white",
    title: "Pass/Fail Ratio",
    description: "Overall exam results",
    footer: "updated just now",
    chart: dailySalesChart,
  },
  {
    color: "white",
    title: "Results by Type",
    description: "Pass/Fail by candidate type",
    footer: "updated just now",
    chart: completedTaskChart,
  },
];

export const updateChartsData = async () => {
  try {
    const data = await StatisticsService.getstatistics();

    // Update candidates by type chart
    statisticsChartsData[0].chart.series[0].data = [data.dataEncoderCandidates || 0];
    statisticsChartsData[0].chart.series[1].data = [data.supervisorCandidates || 0];

    // Update pass/fail ratio chart
    const totalPassed = (data.passDataEncoder || 0) + (data.passSupervisor || 0);
    const totalFailed = (data.failDataEncoder || 0) + (data.failSupervisor || 0);
    statisticsChartsData[1].chart.series = [totalPassed, totalFailed];

    // Update results by type chart
    statisticsChartsData[2].chart.series[0].data = [data.passDataEncoder || 0, data.failDataEncoder || 0];
    statisticsChartsData[2].chart.series[1].data = [data.passSupervisor || 0, data.failSupervisor || 0];

    return statisticsChartsData;
  } catch (error) {
    console.error("Failed to update charts data:", error);
    return statisticsChartsData;
  }
};

export default statisticsChartsData;
