import React from "react";
import CustomersTable from "../components/CustomersTable";

const CustomersPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-full min-w-full">
      <h1 className="text-2xl font-semibold mb-4">Customers</h1>
      <CustomersTable />
    </div>
  );
};

export default CustomersPage;
