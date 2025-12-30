import { useAuth0 } from "@auth0/auth0-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { FaTrash } from "react-icons/fa";
import Select from "react-select";
import { Column, useTable } from "react-table";
import AddColumnModal from "./AddColumnModal";
import AddNewProductModal from "./AddNewProductModal";

interface QuotationTableProps {
  initialData?: QuotationItem[];
  quoteRefNo?: string; // Add quoteRefNo prop
  initialVisibleColumns?: string[];
  isEditing?: boolean; // Add isEditing prop
}
interface QuotationItem {
  id: number;
  item: string;
  qty: number;
  unit: string;
  price: number;
  tax: number;
  discount: number;
  amount: number;
  itemCategory: string;
  itemCode: string;
  description: string;
  serialNo: string;
  batchNo: string;
  expDate: string;
  mfgDate: string;
  modelNo: string;
  size: string;
}

const QuotationTable = forwardRef(
  (
    {
      initialData,
      quoteRefNo,
      initialVisibleColumns,
      isEditing,
    }: QuotationTableProps, // Update props
    ref
  ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [productNamesOptions, setProductNamesOptions] = useState<
      Array<{ label: string; value: string }>
    >([]);
    const [unitsOptions, setUnitsOptions] = useState<
      Array<{ label: string; value: string }>
    >([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(
      initialVisibleColumns || []
    ); // Initialize with initialVisibleColumns
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [currentEditingRow, setCurrentEditingRow] =
      useState<QuotationItem | null>(null);
    const initialMaxId = initialData
      ? initialData.reduce((max, item) => Math.max(max, item.id), 0)
      : 0;
    const [nextId, setNextId] = useState(initialMaxId + 1);

    useEffect(() => {
      if (initialVisibleColumns) {
        console.log("Initial visible columns:", initialVisibleColumns);
        setVisibleColumns(initialVisibleColumns);
      }
    }, [initialVisibleColumns]);

    const handleSaveColumns = async (columns: string[]) => {
      setVisibleColumns(columns);
      try {
        const token = await getAccessTokenSilently();
        await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/quotes/ref/${quoteRefNo}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ visibleColumns: columns }), // Send visibleColumns to backend
          }
        );
      } catch (error) {
        console.error("Error saving columns:", error);
      }
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          const token = await getAccessTokenSilently();
          const [productsResponse, unitsResponse] = await Promise.all([
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/products`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/units`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

          const productsData = await productsResponse.json();
          const unitsData = await unitsResponse.json();

          setProductNamesOptions(productsData);
          setUnitsOptions(unitsData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }, [getAccessTokenSilently]);

    const [data, setData] = useState<QuotationItem[]>(
      initialData || [
        {
          id: nextId,
          item: "",
          qty: 0,
          unit: "",
          price: 0,
          tax: 0,
          discount: 0,
          amount: 0,
          itemCategory: "",
          itemCode: "",
          description: "",
          serialNo: "",
          batchNo: "",
          expDate: "",
          mfgDate: "",
          modelNo: "",
          size: "",
        },
      ]
    );

    // filepath: src/components/QuotationTable.tsx
    const addRow = () => {
      const newRow: QuotationItem = {
        id: nextId, // Use the next available ID
        item: "",
        qty: 0,
        unit: "",
        price: 0,
        tax: 0,
        discount: 0,
        amount: 0,
        itemCategory: "",
        itemCode: "",
        description: "",
        serialNo: "",
        batchNo: "",
        expDate: "",
        mfgDate: "",
        modelNo: "",
        size: "",
      };
      setData([...data, newRow]);
      setNextId(nextId + 1); // Increment the next ID
    };
    const handleInputChange = (
      id: number,
      field: keyof QuotationItem,
      value: any
    ) => {
      // Ensure the value is non-negative for specific fields
      const nonNegativeFields: (keyof QuotationItem)[] = [
        "qty",
        "price",
        "tax",
        "discount",
      ];
      if (nonNegativeFields.includes(field) && Number(value) < 0) {
        return;
      }

      setData((prevData) =>
        prevData.map((row) =>
          row.id === id
            ? {
                ...row,
                [field]: value,
                amount:
                  field === "qty" ||
                  field === "price" ||
                  field === "tax" ||
                  field === "discount"
                    ? calculateAmount({
                        ...row,
                        [field]: value,
                      })
                    : row.amount,
              }
            : row
        )
      );
    };
    const calculateAmount = (row: QuotationItem) => {
      const qty = Number(row.qty);
      const price = Number(row.price);
      const discount = Number(row.discount);
      const tax = Number(row.tax);
      const subtotal = qty * price - (qty * price * discount) / 100;
      const total = subtotal + (subtotal * tax) / 100;
      return Math.round(total); // Round to the nearest integer
    };

    const fetchProductDetails = async (productName: string, token: string) => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/name/${productName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return await response.json();
    };

    const handleAddProduct = async (newProduct: any) => {
      try {
        // Add new product to options
        const newOption = {
          value: newProduct.productName,
          label: newProduct.productName,
        };
        setProductNamesOptions((prev) => [...prev, newOption]);

        // Update the current row with new product details
        setData((prevData) =>
          prevData.map((item) =>
            item.id === currentEditingRow?.id
              ? {
                  ...item,
                  item: newProduct.productName,
                  unit: newProduct.unitOfMeasurement,
                  price: newProduct.pricePerPiece,
                  tax: newProduct.gst,
                  description: newProduct.notes,
                  amount:
                    item.qty * newProduct.pricePerPiece +
                    (item.qty * newProduct.pricePerPiece * newProduct.gst) /
                      100 -
                    (item.qty * newProduct.pricePerPiece * item.discount) / 100,
                }
              : item
          )
        );
      } catch (error) {
        console.error("Error updating with new product:", error);
      }
    };

    const deleteRow = (id: number) => {
      if (window.confirm("Are you sure you want to delete this row?")) {
        setData((prevData) => {
          const newData = prevData.filter((row) => row.id !== id);
          // Reorder the IDs after deletion
          return newData.map((row, index) => ({ ...row, id: index + 1 }));
        });
        // Update nextId to be one greater than the number of rows
        setNextId(data.length);
      }
    };

    const columns: Column<QuotationItem>[] = useMemo(() => {
      const baseColumns: Column<QuotationItem>[] = [
        {
          Header: "#",
          accessor: "id",
          Cell: ({ value }) => <span>{value}</span>,
        },
        {
          Header: "Item",
          accessor: "item",
          Cell: ({ value, row }) => (
            <Select
              className="w-full"
              value={productNamesOptions.find(
                (option) => option.value === value
              )}
              options={[
                {
                  value: "add_new",
                  label: "+ Add New Product",
                  isDisabled: false,
                },
                ...productNamesOptions,
              ]}
              isDisabled={!isEditing} // Disable when not in edit mode
              onChange={async (selected: any) => {
                if (selected.value === "add_new") {
                  setCurrentEditingRow(row.original);
                  setIsAddProductModalOpen(true);
                  return;
                }

                try {
                  const token = await getAccessTokenSilently();
                  const product = await fetchProductDetails(
                    selected.value,
                    token
                  );
                  setData((prevData) =>
                    prevData.map((item) =>
                      item.id === row.original.id
                        ? {
                            ...item,
                            item: selected.value,
                            unit: product.unitOfMeasurement,
                            price: product.pricePerPiece,
                            tax: product.gst,
                            description: product.notes,
                            amount:
                              item.qty * product.pricePerPiece +
                              (item.qty * product.pricePerPiece * product.gst) /
                                100 -
                              (item.qty *
                                product.pricePerPiece *
                                item.discount) /
                                100,
                          }
                        : item
                    )
                  );
                } catch (error) {
                  console.error("Error fetching product details:", error);
                }
              }}
            />
          ),
        },
        {
          Header: "Qty",
          accessor: "qty",
          Cell: ({ value, row }) => (
            <input
              type="number"
              className="w-full"
              min="0"
              value={value}
              disabled={!isEditing} // Disable when not in edit mode
              onChange={(e) =>
                handleInputChange(row.original.id, "qty", e.target.value)
              }
            />
          ),
        },
        {
          Header: "Unit",
          accessor: "unit",
          Cell: ({ value, row }) => (
            <Select
              className="w-full"
              value={unitsOptions.find((option) => option.value === value)}
              options={unitsOptions}
              isDisabled={!isEditing} // Disable when not in edit mode
              onChange={(selected: any) => {
                handleInputChange(row.original.id, "unit", selected.value);
              }}
            />
          ),
        },
        {
          Header: "Price/Unit",
          accessor: "price",
          Cell: ({ value, row }) => (
            <input
              type="number"
              min="0"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "price", e.target.value)
              }
            />
          ),
        },

        {
          Header: "Tax (%)",
          accessor: "tax",
          Cell: ({ value, row }) => (
            <input
              type="number"
              min="0"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "tax", e.target.value)
              }
            />
          ),
        },
        {
          Header: "Amount",
          accessor: "amount",
          Cell: ({ value }) => <span>{value}</span>,
        },
      ];

      const additionalColumnsMap: { [key: string]: Column<QuotationItem> } = {
        "Item Category": {
          Header: "Item Category",
          accessor: "itemCategory",
          Cell: ({ value, row }) => (
            <input
              type="text"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(
                  row.original.id,
                  "itemCategory",
                  e.target.value
                )
              }
            />
          ),
        },
        "Item Code": {
          Header: "Item Code",
          accessor: "itemCode",
          Cell: ({ value, row }) => (
            <input
              type="text"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "itemCode", e.target.value)
              }
            />
          ),
        },
        Description: {
          Header: "Description",
          accessor: "description",
          Cell: ({ value, row }) => (
            <textarea
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(
                  row.original.id,
                  "description",
                  e.target.value
                )
              }
            />
          ),
        },
        "Serial No./ IMEI No.": {
          Header: "Serial No./ IMEI No.",
          accessor: "serialNo",
          Cell: ({ value, row }) => (
            <input
              type="text"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "serialNo", e.target.value)
              }
            />
          ),
        },
        "Batch No.": {
          Header: "Batch No.",
          accessor: "batchNo",
          Cell: ({ value, row }) => (
            <input
              type="text"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "batchNo", e.target.value)
              }
            />
          ),
        },
        "Exp. Date": {
          Header: "Exp. Date",
          accessor: "expDate",
          Cell: ({ value, row }) => (
            <input
              type="date"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "expDate", e.target.value)
              }
            />
          ),
        },
        "Mfg Date": {
          Header: "Mfg Date",
          accessor: "mfgDate",
          Cell: ({ value, row }) => (
            <input
              type="date"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "mfgDate", e.target.value)
              }
            />
          ),
        },
        "Discount %": {
          Header: "Discount %",
          accessor: "discount",
          Cell: ({ value, row }) => (
            <input
              type="number"
              min="0"
              max="100"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "discount", e.target.value)
              }
            />
          ),
        },
        "Model No.": {
          Header: "Model No.",
          accessor: "modelNo",
          Cell: ({ value, row }) => (
            <input
              type="text"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "modelNo", e.target.value)
              }
            />
          ),
        },

        Size: {
          Header: "Size",
          accessor: "size",
          Cell: ({ value, row }) => (
            <input
              type="text"
              min="0"
              className="w-full"
              disabled={!isEditing} // Disable when not in edit mode
              value={value}
              onChange={(e) =>
                handleInputChange(row.original.id, "size", e.target.value)
              }
            />
          ),
        },
      };

      const additionalColumns = visibleColumns
        .map((col) => additionalColumnsMap[col])
        .filter(Boolean) as Column<QuotationItem>[];

      // Determine the index to insert additional columns before 'tax'
      const taxColumnIndex = baseColumns.findIndex(
        (col) => col.accessor === "tax"
      );
      const reorderedColumns = [...baseColumns];
      additionalColumns.forEach((col, index) => {
        reorderedColumns.splice(taxColumnIndex + index, 0, col);
      });

      return reorderedColumns;
    }, [productNamesOptions, unitsOptions, visibleColumns, isEditing]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      useTable<QuotationItem>({ columns, data });

    const totalAmount = data.reduce((total, row) => total + row.amount, 0);

    useImperativeHandle(ref, () => ({
      getItems: () =>
        data.map((item) => {
          const { id, ...itemWithoutId } = item;
          return {
            productName: item.item,
            quantity: item.qty,
            unitPrice: item.price,
            tax: item.tax,
            discount: item.discount,
            amount: item.amount,
            unit: item.unit,
            itemCategory: item.itemCategory, // Directly include
            itemCode: item.itemCode, // Directly include
            description: item.description, // Directly include
            serialNo: item.serialNo, // Directly include
            batchNo: item.batchNo, // Directly include
            expDate: item.expDate, // Directly include
            mfgDate: item.mfgDate, // Directly include
            modelNo: item.modelNo, // Directly include
            size: item.size, // Directly include
          };
        }),
      getTotalAmount: () => totalAmount,
      getVisibleColumns: () => visibleColumns, // Add this line
    }));

    // Increment nextId after initializing data
    useEffect(() => {
      if (initialData && initialData.length > 0) {
        const maxId = initialData.reduce(
          (max, item) => Math.max(max, item.id),
          0
        );
        setNextId(maxId + 1);
      } else {
        setNextId(1); // If no initial data, start at 1
      }
    }, [initialData]);

    return (
      <div className="bg-white shadow rounded p-4">
        <table {...getTableProps()} className="w-full border-collapse">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="bg-gray-200 text-left"
              >
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
                <tr {...row.getRowProps()} className="group relative">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="border p-2">
                      {cell.render("Cell")}
                    </td>
                  ))}
                  {isEditing && ( // Add this conditional rendering
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 hidden group-hover:block">
                      <FaTrash
                        className="text-gray-500 cursor-pointer hover:text-red-500"
                        size={18}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRow(row.original.id);
                        }}
                      />
                    </div>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={calculateColSpan(visibleColumns)}
                className="text-right border p-2 font-bold"
              >
                Total
              </td>
              <td className="border p-2">{totalAmount}</td>
            </tr>
          </tfoot>
        </table>
        <div className="flex mt-4">
          {isEditing && ( // Conditionally render buttons
            <>
              <button
                onClick={addRow}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add Row
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-green-500 text-white rounded ml-2"
              >
                Add Columns
              </button>
            </>
          )}
        </div>
        <AddColumnModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveColumns}
          initialVisibleColumns={visibleColumns} // Pass initialVisibleColumns
        />
        <AddNewProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          onAddProduct={handleAddProduct}
        />
      </div>
    );
  }
);

// Helper function to calculate colspan for the footer
const calculateColSpan = (visibleColumns: string[]) => {
  // Base columns: id, item, qty, unit, price, discount, tax, amount
  // Additional columns are inserted before tax
  const baseColCount = 6; // Adjust if base columns change
  return baseColCount + visibleColumns.length;
};

export default QuotationTable;
