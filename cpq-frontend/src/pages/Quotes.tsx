import React from "react";
import QuotesTable from "../components/QuotesTable";

const QuotesPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen min-w-full">
      <h1 className="text-2xl font-semibold mb-4">Quotes</h1>
      <QuotesTable />
    </div>
  );
};

export default QuotesPage;
