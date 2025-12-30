import React, { useState, useMemo, useEffect } from "react";
import { useTable, Column } from "react-table";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

interface Transaction {
  transId: number;
  quoteNo: string;
  stage: string;
  date: string;
  remarks: string;
  quoteDetails?: {
    totalAmount: number;
    status: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
  };
}

const TransactionsTable: React.FC<{ customerId: string }> = ({ customerId }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        // First fetch customer details to get the name
        const customerResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customer details');
        }

        const customerData = await customerResponse.json();
        console.log('Customer Data:', customerData);

        // Fetch all quotes
        const quotesResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/quotes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!quotesResponse.ok) {
          throw new Error('Failed to fetch quotes');
        }

        const allQuotes = await quotesResponse.json();
        console.log('All Quotes:', allQuotes);
        
        // Filter quotes using multiple criteria
        const customerQuotes = allQuotes.filter((quote: any) => {
          const matchesCustomerId = quote.customer?.id?.toString() === customerId;
          const matchesCustomerName = quote.customer?.name === customerData.name;
          const matchesEmail = quote.customer?.email === customerData.email;
          
          return matchesCustomerId || matchesCustomerName || matchesEmail;
        });

        console.log('Filtered Customer Quotes:', customerQuotes);

        // Transform the filtered quotes
        const transformedQuotes = customerQuotes.map((quote: any, index: number) => ({
          transId: index + 1,
          quoteNo: quote.refNo,
          stage: quote.status,
          date: new Date(quote.updatedAt || quote.createdAt).toLocaleDateString(),
          remarks: '',
          quoteDetails: {
            totalAmount: quote.totalAmount || 0,
            status: quote.status || 'Unknown',
            items: Array.isArray(quote.quoteItems) ? quote.quoteItems : []
          }
        }));

        console.log('Transformed Quotes:', transformedQuotes);
        setData(transformedQuotes);
      } catch (error) {
        console.error("Error fetching quotes:", error);
        setError("Failed to load quotes");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchQuotes();
    }
  }, [customerId, getAccessTokenSilently]);

  const columns = useMemo<Column<Transaction>[]>(
    () => [
      {
        Header: "Quote No",
        accessor: "quoteNo",
        Cell: ({ value }: { value: string }) => (
          <Link 
            to={`/quote-details?quoteId=${value}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {value}
          </Link>
        )
      },
      {
        Header: "Status",
        accessor: "stage",
      },
      {
        Header: "Amount",
        accessor: (row: Transaction) => row.quoteDetails?.totalAmount || 0,
        Cell: ({ value }: { value: number }) => (
          <span>₹{value.toFixed(2)}</span>
        )
      },
      {
        Header: "Date",
        accessor: "date",
      }
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  if (loading) return <div>Loading quotes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (data.length === 0) return <div>No quotes found for this customer.</div>;

  return (
    <div className="bg-white shadow rounded p-4">
      <table {...getTableProps()} className="w-full border-collapse">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-200 text-left">
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} className="border p-2">
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="border p-2">
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
