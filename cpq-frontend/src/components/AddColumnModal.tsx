import React, { useState, useEffect } from "react";

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedColumns: string[]) => void;
  initialVisibleColumns?: string[]; // Add initialVisibleColumns prop
}

const availableColumns = [
  "Item Category",
  "Item Code",
  "Description",
  "Discount %",
  "Serial No./ IMEI No.",
  "Batch No.",
  "Exp. Date",
  "Mfg Date",
  "Model No.",
  "Size",
];

const AddColumnModal: React.FC<AddColumnModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialVisibleColumns = [],
}) => {
  const [selectedOptions, setSelectedOptions] = useState<
    Array<{ label: string; value: string }>
  >(() => {
    return initialVisibleColumns.map((col) => ({ label: col, value: col }));
  });

  const handleSave = () => {
    const selected = selectedOptions.map((option) => option.value);
    onSave(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="absolute inset-y-0 right-0 w-full sm:w-1/2 bg-white p-6 shadow-md flex flex-col">
        <div
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </div>
        <h2 className="text-xl font-bold mb-6">Select Columns to Display</h2>
        <div className="checkbox-list">
          {availableColumns.map((col) => (
            <label key={col} className="block mb-2">
              <input
                type="checkbox"
                value={col}
                checked={selectedOptions.some((option) => option.value === col)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOptions([
                      ...selectedOptions,
                      { label: col, value: col },
                    ]);
                  } else {
                    setSelectedOptions(
                      selectedOptions.filter((option) => option.value !== col)
                    );
                  }
                }}
                className="mr-2"
              />
              {col}
            </label>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddColumnModal;
