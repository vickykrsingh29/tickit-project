import React from "react";

interface SerialNumbersSectionProps {
  serialNumbers: string[];
  handleSerialNumberChange: (index: number, value: string) => void;
  addSerialNumberField: () => void;
  removeSerialNumberField: (index: number) => void;
}

const SerialNumbersSection: React.FC<SerialNumbersSectionProps> = ({
  serialNumbers,
  handleSerialNumberChange,
  addSerialNumberField,
  removeSerialNumberField,
}) => {
  return (
    <div className="col-span-2">
      <label className="block text-gray-700">Serial Numbers</label>
      {serialNumbers.map((sn, index) => (
        <div key={index} className="flex space-x-2 mb-2">
          <input
            type="text"
            value={sn}
            onChange={(e) => handleSerialNumberChange(index, e.target.value)}
            className="w-full p-2 border rounded"
            placeholder={`Serial number ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => removeSerialNumberField(index)}
            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addSerialNumberField}
        className="mt-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        + Add Serial Number
      </button>
    </div>
  );
};

export default SerialNumbersSection;