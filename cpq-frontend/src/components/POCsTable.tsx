import React, { useMemo, useState, useEffect } from "react";
import { useTable, usePagination, useRowSelect, useGlobalFilter, useFilters, Column, IdType, Row } from "react-table";
import { FaEdit, FaTrash, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaGlobe, FaLinkedin } from "react-icons/fa";
import AddNewPOCModal from "./AddNewPOCModal";
import EditPOCModal from "./EditPOCModal";
import Select from "react-select";
import { useAuth0 } from "@auth0/auth0-react";

interface POC {
    id: number;
    name: string;
    designation: string;
    department: string;
    socialHandles: { platform: string; link: string }[];
    phone: string;
    email: string;
    remarks: string;
}

// Custom global filter function to handle normal text searches and column-specific filters
function multiColumnGlobalFilter(
    rows: Array<Row<POC>>,
    columnIds: Array<IdType<POC>>,
    filterValue: string
) {
    if (!filterValue) return rows;

    // If the filter string doesn't contain ":", treat it as a normal substring search
    if (!filterValue.includes(":")) {
        const lower = filterValue.toLowerCase();
        return rows.filter((row) =>
            columnIds.some((id) => {
                const val = row.values[id];
                return String(val).toLowerCase().includes(lower);
            })
        );
    }

    // Otherwise, parse semicolon-delimited filters
    // e.g. "designation:Manager,Director;department:IT"
    const pairs = filterValue.split(";").map((pair) => {
        const [col, vals] = pair.split(":");
        return { col, vals: vals?.split(",") ?? [] };
    });

    return rows.filter((row) =>
        pairs.every(({ col, vals }) => {
            if (!col || vals.length === 0) return true;
            const rowVal = row.values[col];
            return vals.includes(String(rowVal));
        })
    );
}

const POCsTable: React.FC<{ customerId: string }> = ({ customerId }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [pocs, setPocs] = useState<POC[]>([]);
    const [originalPocs, setOriginalPocs] = useState<POC[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPOC, setCurrentPOC] = useState<POC | null>(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        designation: [] as any[],
        department: [] as any[],
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            setShowFilters(false);
          }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, []);
      
    useEffect(() => {
        const fetchPOCs = async () => {
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
                    },
                });

                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/poc?customerId=${customerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log(response)
                
                if (!response.ok) {
                    throw new Error("Failed to fetch POCs");
                }

                const data = await response.json();
                if (Array.isArray(data)) {
                    setPocs(data);
                    setOriginalPocs(data); // Store original data
                } else {
                    console.error("Fetched data is not an array:", data);
                }
            } catch (error) {
                console.error("Error fetching POCs:", error);
            }
        };
        

        fetchPOCs();
    }, [customerId, getAccessTokenSilently]);

    const getColumnFilterOptions = (key: string) => {
        const uniqueValues = Array.from(new Set(originalPocs.map((item) => item[key as keyof POC])));
        return uniqueValues.map((value) => ({ label: value, value }));
    };

    const handleTempFilterChange = (type: string, value: any) => {
        setTempFilters((prev) => ({
            ...prev,
            [type]: value,
        }));
    };

    const applyFilters = () => {
        let filteredData = [...originalPocs];

        if (tempFilters.designation.length > 0) {
            const designations = tempFilters.designation.map((d) => d.value);
            filteredData = filteredData.filter((item) => designations.includes(item.designation));
        }

        if (tempFilters.department.length > 0) {
            const departments = tempFilters.department.map((d) => d.value);
            filteredData = filteredData.filter((item) => departments.includes(item.department));
        }

        setPocs(filteredData);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setTempFilters({
            designation: [],
            department: [],
        });
        setPocs(originalPocs);
    };

    const columns = useMemo(
        () => [
            {
                Header: "Name",
                accessor: "name",
            },
            {
                Header: "Designation",
                accessor: "designation", 
                Filter: ({ column: { filterValue, setFilter } }: { column: { filterValue: any, setFilter: (value: any) => void } }) => (
                    <Select
                        options={getColumnFilterOptions("designation")}
                        value={filterValue}
                        onChange={option => setFilter(option ? option.value : null)}
                        isClearable
                        placeholder="Filter by Designation"
                    />
                ),
            },
            {
                Header: "Department",
                accessor: "department",
                Filter: ({ column: { filterValue, setFilter } }) => (
                    <Select
                        options={getColumnFilterOptions("department")}
                        value={filterValue}
                        onChange={option => setFilter(option ? option.value : null)}
                        isClearable
                        placeholder="Filter by Department"
                    />
                ),
            },
            {
                Header: "Social Handles",
                accessor: "socialHandles",  
                Cell: ({ value }: { value: { platform: string; link: string }[] }) => (
                    <div className="flex items-center gap-2">
                        {value.map((handle, index) => {
                            const IconComponent = {
                                twitter: <FaTwitter className="text-[#1DA1F2]" size={20} />,
                                linkedin: <FaLinkedin className="text-[#0077B5]" size={20} />,
                                facebook: <FaFacebook className="text-[#4267B2]" size={20} />,
                                instagram: <FaInstagram className="text-[#E4405F]" size={20} />,
                                youtube: <FaYoutube className="text-[#FF0000]" size={20} />,
                                website: <FaGlobe className="text-gray-600" size={20} />,
                            }[handle.platform];

                            return (
                                <a
                                    key={index}
                                    href={handle.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {IconComponent}
                                </a>
                            );
                        })}
                    </div>
                ),
            },
            {
                Header: "Phone",
                accessor: "phone",
            },
            {
                Header: "Email",
                accessor: "email",
            },
            {
                Header: "Remarks",
                accessor: "remarks",
            },
            {
                Header: "Actions",
                Cell: ({ row }: { row: any }) => (
                    <div className="flex space-x-2">
                        <FaEdit size={20} onClick={() => handleEdit(row.original)} className="text-blue-500" />
                        <FaTrash size={20} onClick={() => handleDelete(row.original.id)} className="text-red-500" />
                    </div>
                ),
            },
        ],
        [originalPocs]
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setGlobalFilter: setTableGlobalFilter,
    } = useTable(
        {
            columns: columns as Column<POC>[],
            data: pocs,
            initialState: { pageIndex: 0, pageSize: 10 },
            globalFilter: multiColumnGlobalFilter,
        },
        useGlobalFilter,
        useFilters,
        usePagination,
        useRowSelect
    );

    useEffect(() => {
        setTableGlobalFilter(globalFilter);
    }, [globalFilter, setTableGlobalFilter]);

    const handleEdit = (poc: POC) => {
        setCurrentPOC(poc);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const token = await getAccessTokenSilently({
                authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
                },
            });
    
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/poc/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (!response.ok) {
                throw new Error("Failed to delete POC");
            }
    
            setPocs((prev) => prev.filter((poc) => poc.id !== id));
            setOriginalPocs((prev) => prev.filter((poc) => poc.id !== id)); // Update originalPocs state
    
        } catch (error) {
            console.error("Error deleting POC:", error);
        }
    };
    const handleAdd = () => {
        setIsAddModalOpen(true);
    };

    const handleAddModalClose = () => {
        setIsAddModalOpen(false);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setCurrentPOC(null);
    };

    const handleAddModalSubmit = (newPoc: POC) => {
        setPocs((prev) => [...prev, newPoc]);
        setOriginalPocs((prev) => [...prev, newPoc]);
        setIsAddModalOpen(false);
    };

    const handleEditModalSubmit = (updatedPoc: POC) => {
        setPocs((prev) =>
            prev.map((poc) => (poc.id === updatedPoc.id ? updatedPoc : poc))
        );
        setOriginalPocs((prev) =>
            prev.map((poc) => (poc.id === updatedPoc.id ? updatedPoc : poc))
        );
        setIsEditModalOpen(false);
        setCurrentPOC(null);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">POCs</h2>
                <input
                        value={globalFilter || ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search all columns..."
                        className="p-2 border rounded w-1/2"
                    />
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters((prev) => !prev)}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Filter
                        </button>
                        {showFilters && (
                            <div className="absolute top-full right-0 mt-2 bg-white shadow-md rounded p-4 z-10 w-80">
                                {/* Designation Filter */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Designation
                                    </label>
                                    <Select
                                        isMulti
                                        value={tempFilters.designation}
                                        options={getColumnFilterOptions("designation")}
                                        onChange={(selected) =>
                                            handleTempFilterChange("designation", selected || [])
                                        }
                                        className="w-full"
                                    />
                                </div>
                                
                                {/* Department Filter */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Department
                                    </label>
                                    <Select
                                        isMulti
                                        value={tempFilters.department}
                                        options={getColumnFilterOptions("department")}
                                        onChange={(selected) =>
                                            handleTempFilterChange("department", selected || [])
                                        }
                                        className="w-full"
                                    />
                                </div>

                                {/* Filter Action Buttons */}
                                <div className="flex justify-end space-x-2 mt-4">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={applyFilters}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Add New POC
                    </button>
                </div>
            </div>
            
            <table {...getTableProps()} className="w-full text-left border-collapse">
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps()} className="border-b p-4">
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
                                    <td {...cell.getCellProps()} className="border-b p-4">
                                        {cell.render("Cell")}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <AddNewPOCModal
                isOpen={isAddModalOpen}
                onClose={handleAddModalClose}
                onSubmit={(newPoc: any) => handleAddModalSubmit(newPoc)}
                customerId={customerId}
            />
            {currentPOC && (
                <EditPOCModal
                    isOpen={isEditModalOpen}
                    onClose={handleEditModalClose}
                    onSubmit={handleEditModalSubmit}
                    poc={currentPOC}
                    customerId={customerId}
                />
            )}
        </div>
    );
};

export default POCsTable;
