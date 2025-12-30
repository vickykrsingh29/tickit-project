import React from 'react';

interface PaginationProps {
  pageIndex: number;
  pageCount: number;
  pageOptions: number[];
  gotoPage: (page: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pageIndex,
  pageCount,
  gotoPage,
  previousPage,
  nextPage,
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageSize,
  setPageSize,
}) => {
  return (
    <div className="py-3 flex items-center justify-between">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={previousPage}
          disabled={!canPreviousPage}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            !canPreviousPage ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        <button
          onClick={nextPage}
          disabled={!canNextPage}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            !canNextPage ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex gap-x-2 items-center">
          <span className="text-sm text-gray-700">
            Page{" "}
            <span className="font-medium">{pageIndex + 1}</span>{" "}
            of{" "}
            <span className="font-medium">{pageOptions.length}</span>
          </span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
            }}
            className="border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                !canPreviousPage ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
              aria-label="First page"
            >
              &laquo;
            </button>
            <button
              onClick={previousPage}
              disabled={!canPreviousPage}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                !canPreviousPage ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
              aria-label="Previous page"
            >
              &lsaquo;
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              {pageIndex + 1}
            </span>
            <button
              onClick={nextPage}
              disabled={!canNextPage}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                !canNextPage ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
              aria-label="Next page"
            >
              &rsaquo;
            </button>
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                !canNextPage ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
              aria-label="Last page"
            >
              &raquo;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;