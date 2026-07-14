import React, { useState, useEffect } from "react";
import {
  Typography,
} from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import StatisticsCardsData from "@/data/statistics-cards-data.jsx"; // now imported as hook
import {
  statisticsChartsData,
  updateChartsData,
} from "@/data";
import { ClockIcon } from "@heroicons/react/24/solid";

export function Home() {
  // Call the hook to get live stats
  const statisticsCardsData = StatisticsCardsData();
  const [chartsData, setChartsData] = useState(statisticsChartsData);

  useEffect(() => {
    const loadChartsData = async () => {
      const updatedData = await updateChartsData();
      setChartsData(updatedData);
    };
    loadChartsData();
  }, []);

  return (
    <div className="mt-12">
      {/* Dynamic Statistics Cards */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      {/* Dynamic Charts */}
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {chartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
