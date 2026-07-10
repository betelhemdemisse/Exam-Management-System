import React, { useState } from "react";
import { Typography } from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import StatisticsCardsDataWithDashboard, { StatisticsCardsData } from "@/data/statistics-cards-data.jsx";

export function Home() {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'dashboard'

  // Call the hook to get live stats for cards view
  const statisticsCardsData = StatisticsCardsData();

  return (
    <div className="mt-12 px-4">
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              viewMode === 'cards' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-200`}
          >
            Cards View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              viewMode === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-200`}
          >
            Dashboard View
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        // Original Cards View
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
      ) : (
        // Dashboard View with Charts
        <StatisticsCardsDataWithDashboard />
      )}
    </div>
  );
}

export default Home;