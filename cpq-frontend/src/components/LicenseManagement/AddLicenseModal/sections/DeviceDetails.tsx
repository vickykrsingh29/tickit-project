import React from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { DeviceDetail, OptionsState } from '../types';
import { useBrandProducts } from '../hooks/useBrandProducts';

interface DeviceDetailsProps {
  devices: DeviceDetail[];
  options: OptionsState;
  onDeviceChange: (id: number, field: keyof DeviceDetail, value: string | number) => void;
  onAddDevice: () => void;
  onRemoveDevice: (id: number) => void;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({
  devices,
  options,
  onDeviceChange,
  onAddDevice,
  onRemoveDevice
}) => {
  const { brandProductsData, loading } = useBrandProducts();

  // Create brand options for dropdown
  const brandOptions = brandProductsData.map(item => ({
    value: item.brand,
    label: item.brand
  }));
  
  // Get products for a specific brand
  const getProductsForBrand = (brandName: string): { value: string; label: string }[] => {
    const brandData = brandProductsData.find(item => item.brand === brandName);
    if (!brandData) return [];
    
    return brandData.products.map(product => ({
      value: product.productName,
      label: product.productName
    }));
  };

  return (
    <div className="border-b pb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Device-Specific Details</h3>
        <button
          type="button"
          onClick={onAddDevice}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
        >
          + Add Device
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading brands and products...</div>
      ) : (
        devices.map((device, index) => (
          <div
            key={device.id}
            className="mb-6 p-4 border rounded bg-gray-50"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Device {index + 1}</h4>
              {devices.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveDevice(device.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">
                  Brand*
                </label>
                <Select
                  options={brandOptions}
                  value={device.brand ? { value: device.brand, label: device.brand } : null}
                  onChange={(selected) =>
                    onDeviceChange(
                      device.id,
                      "brand",
                      selected?.value || ""
                    )
                  }
                  placeholder="Select brand"
                  className="basic-select"
                  classNamePrefix="select"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">
                  Product Name/Model*
                </label>
                <Select
                  options={device.brand ? getProductsForBrand(device.brand) : []}
                  value={device.productName ? { value: device.productName, label: device.productName } : null}
                  onChange={(selected) =>
                    onDeviceChange(
                      device.id,
                      "productName",
                      selected?.value || ""
                    )
                  }
                  placeholder={device.brand ? "Select product" : "Select brand first"}
                  isDisabled={!device.brand}
                  className="basic-select"
                  classNamePrefix="select"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Frequency Range (MHz)*
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  value={device.frequencyRange}
                  onChange={(e) =>
                    onDeviceChange(
                      device.id,
                      "frequencyRange",
                      e.target.value
                    )
                  }
                  placeholder="e.g., 136-174"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Power Output (Watts)*
                </label>
                <input
                  type="number"
                  required
                  className="w-full p-2 border rounded"
                  value={device.powerOutput}
                  onChange={(e) =>
                    onDeviceChange(
                      device.id,
                      "powerOutput",
                      Number(e.target.value)
                    )
                  }
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Quantity Approved*
                </label>
                <input
                  type="number"
                  required
                  className="w-full p-2 border rounded"
                  value={device.quantityApproved}
                  onChange={(e) =>
                    onDeviceChange(
                      device.id,
                      "quantityApproved",
                      Number(e.target.value)
                    )
                  }
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Country of Origin
                </label>
                <CreatableSelect
                  options={options.countriesOfOrigin}
                  value={
                    device.countryOfOrigin
                      ? {
                          value: device.countryOfOrigin,
                          label: device.countryOfOrigin,
                        }
                      : null
                  }
                  onChange={(selected) =>
                    onDeviceChange(
                      device.id,
                      "countryOfOrigin",
                      selected?.value || ""
                    )
                  }
                  placeholder="Select or enter country"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Equipment Type*
                </label>
                <CreatableSelect
                  options={options.equipmentTypes}
                  value={
                    device.equipmentType
                      ? {
                          value: device.equipmentType,
                          label: device.equipmentType,
                        }
                      : null
                  }
                  onChange={(selected) =>
                    onDeviceChange(
                      device.id,
                      "equipmentType",
                      selected?.value || ""
                    )
                  }
                  placeholder="Select or enter equipment type"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Technology Used
                </label>
                <CreatableSelect
                  options={options.technologiesUsed}
                  value={
                    device.technologyUsed
                      ? {
                          value: device.technologyUsed,
                          label: device.technologyUsed,
                        }
                      : null
                  }
                  onChange={(selected) =>
                    onDeviceChange(
                      device.id,
                      "technologyUsed",
                      selected?.value || ""
                    )
                  }
                  placeholder="Select or enter technology"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DeviceDetails;