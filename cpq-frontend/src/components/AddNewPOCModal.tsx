import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import {
  FaFacebookSquare,
  FaGlobe,
  FaInstagramSquare,
  FaLinkedin,
  FaTrash,
  FaTwitterSquare,
  FaYoutubeSquare,
} from "react-icons/fa";
import CreatableSelect from "react-select/creatable";

interface AddNewPOCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poc: POC) => void;
  customerId: string;
  initialData?: {
    name: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
  };
}

interface Option {
    value: string;
    label: string;
}

interface POC {
    name: string;
    designation: string;
    department: string;
    socialHandles: { platform: string; link: string }[];
    phone: string;
    email: string;
    remarks: string;
}

const AddNewPOCModal: React.FC<AddNewPOCModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customerId,
  initialData,
}) => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [poc, setPoc] = useState<POC>(() => ({
    name: initialData?.name || "",
    designation: initialData?.designation || "",
    department: initialData?.department || "",
    socialHandles: [{ platform: "", link: "" }],
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    remarks: "",
  }));

  // Reset form when modal opens with new initialData
  useEffect(() => {
    if (isOpen && initialData) {
      setPoc({
        name: initialData.name || "",
        designation: initialData.designation || "",
        department: initialData.department || "",
        socialHandles: [{ platform: "", link: "" }],
        phone: initialData.phone || "",
        email: initialData.email || "",
        remarks: "",
      });
    }
  }, [isOpen, initialData]);

  const [designations, setDesignations] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const [designationsRes, departmentsRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_BACKEND_URL
            }/api/poc/designations?customerId=${customerId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            `${import.meta.env.VITE_BACKEND_URL
            }/api/poc/departments?customerId=${customerId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        if (!designationsRes.ok || !departmentsRes.ok) {
          throw new Error("Failed to fetch POC options");
        }

        const [designationsData, departmentsData] = await Promise.all([
          designationsRes.json(),
          departmentsRes.json(),
        ]);

        setDesignations(designationsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, getAccessTokenSilently]);

  const socialPlatforms = [
    {
      value: "facebook",
      label: (
        <div className="flex items-center gap-2">
          <FaFacebookSquare className="text-[#4267B2]" size={20} />
          <span>Facebook</span>
        </div>
      ),
    },
    {
      value: "twitter",
      label: (
        <div className="flex items-center gap-2">
          <FaTwitterSquare className="text-[#1DA1F2]" size={20} />
          <span>Twitter</span>
        </div>
      ),
    },
    {
      value: "linkedin",
      label: (
        <div className="flex items-center gap-2">
          <FaLinkedin className="text-[#0077B5]" size={20} />
          <span>LinkedIn</span>
        </div>
      ),
    },
    {
      value: "instagram",
      label: (
        <div className="flex items-center gap-2">
          <FaInstagramSquare className="text-[#E4405F]" size={20} />
          <span>Instagram</span>
        </div>
      ),
    },
    {
      value: "youtube",
      label: (
        <div className="flex items-center gap-2">
          <FaYoutubeSquare className="text-[#FF0000]" size={20} />
          <span>YouTube</span>
        </div>
      ),
    },
    {
      value: "website",
      label: (
        <div className="flex items-center gap-2">
          <FaGlobe className="text-gray-600" size={20} />
          <span>Website</span>
        </div>
      ),
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPoc((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialHandleChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedSocialHandles = [...poc.socialHandles];
    updatedSocialHandles[index] = {
      ...updatedSocialHandles[index],
      [field]: value,
    };
    setPoc((prev) => ({ ...prev, socialHandles: updatedSocialHandles }));
  };

  const handleAddSocialHandle = () => {
    setPoc((prev) => ({
      ...prev,
      socialHandles: [...prev.socialHandles, { platform: "", link: "" }],
    }));
  };

  const handleDeleteSocial = (index: number) => {
    setPoc((prev) => ({
      ...prev,
      socialHandles: prev.socialHandles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("poc", JSON.stringify(poc));

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/poc?customerId=${customerId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save POC");
      }

      // Get the newly created POC from the response
      const newPoc = await response.json();

      // Call onSubmit with the new POC data
      onSubmit(newPoc);

      // Reset form and close modal
      setPoc({
        name: "",
        designation: "",
        department: "",
        socialHandles: [{ platform: "", link: "" }],
        phone: "",
        email: "",
        remarks: "",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting POC:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="absolute inset-y-0 right-0 w-full sm:w-2/3 bg-white p-6 shadow-md flex flex-col overflow-y-auto">
        <div
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </div>
        <h2 className="text-xl font-bold mb-6">Add New POC</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Name*</label>
            <input
              name="name"
              type="text"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter name"
              value={poc.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-gray-700">Designation*</label>
            <CreatableSelect
              options={designations}
              required
              isClearable
              onCreateOption={(inputValue) => {
                const newOption = { value: inputValue, label: inputValue };
                setDesignations((prev) => [...prev, newOption]);
                setPoc((prev) => ({ ...prev, designation: inputValue }));
              }}
              value={
                poc.designation
                  ? { label: poc.designation, value: poc.designation }
                  : null
              }
              onChange={(newValue: any) => {
                setPoc((prev) => ({
                  ...prev,
                  designation: newValue?.value || "",
                }));
              }}
              placeholder="Select or type a designation"
            />
          </div>
          <div>
            <label className="block text-gray-700">Department*</label>
            <CreatableSelect
              options={departments}
              isClearable
              required
              className="basic-single"
              classNamePrefix="select"
              onCreateOption={(inputValue) => {
                const newOption = { label: inputValue, value: inputValue };
                setDepartments((prev) => [...prev, newOption]);
                setPoc((prev) => ({ ...prev, department: inputValue }));
              }}
              value={
                poc.department
                  ? { label: poc.department, value: poc.department }
                  : null
              }
              onChange={(newValue: any) => {
                console.log(newValue);
                setDepartments((prev) =>
                  newValue ? [...prev, newValue] : prev
                );
                setPoc((prev) => ({
                  ...prev,
                  department: newValue?.value || "",
                }));
              }}
              placeholder="Select or type a department"
            />
          </div>
          <div>
            <label className="block text-gray-700">Phone*</label>
            <input
              name="phone"
              type="text"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter phone number"
              value={poc.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-gray-700">Email*</label>
            <input
              name="email"
              type="email"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter email"
              value={poc.email}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-lg font-bold text-gray-700">
                Social Media Handles
              </label>
              <button
                type="button"
                onClick={handleAddSocialHandle}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Add Social Media
              </button>
            </div>
            <div className="space-y-3">
              {poc.socialHandles.map((handle, index) => (
                <div key={index} className="flex items-center gap-4">
                  <CreatableSelect
                    options={socialPlatforms}
                    className="w-1/5"
                    value={
                      handle.platform
                        ? {
                            value: handle.platform,
                            label: (
                              <div className="flex items-center gap-2">
                                {handle.platform === "facebook" && (
                                  <FaFacebookSquare
                                    className="text-[#4267B2]"
                                    size={20}
                                  />
                                )}
                                {handle.platform === "twitter" && (
                                  <FaTwitterSquare
                                    className="text-[#1DA1F2]"
                                    size={20}
                                  />
                                )}
                                {handle.platform === "linkedin" && (
                                  <FaLinkedin
                                    className="text-[#0077B5]"
                                    size={20}
                                  />
                                )}
                                {handle.platform === "instagram" && (
                                  <FaInstagramSquare
                                    className="text-[#E4405F]"
                                    size={20}
                                  />
                                )}
                                {handle.platform === "youtube" && (
                                  <FaYoutubeSquare
                                    className="text-[#FF0000]"
                                    size={20}
                                  />
                                )}
                                {handle.platform === "website" && (
                                  <FaGlobe
                                    className="text-gray-600"
                                    size={20}
                                  />
                                )}
                                <span>
                                  {handle.platform.charAt(0).toUpperCase() +
                                    handle.platform.slice(1)}
                                </span>
                              </div>
                            ),
                          }
                        : null
                    }
                    onChange={(selected) =>
                      handleSocialHandleChange(
                        index,
                        "platform",
                        selected?.value || ""
                      )
                    }
                    placeholder="Select platform"
                    formatCreateLabel={(inputValue) => (
                      <div className="flex items-center gap-2">
                        <FaGlobe className="text-gray-600" size={20} />
                        <span>Add "{inputValue}"</span>
                      </div>
                    )}
                  />
                  <input
                    type="url"
                    value={handle.link}
                    onChange={(e) =>
                      handleSocialHandleChange(index, "link", e.target.value)
                    }
                    placeholder="Enter social media link"
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteSocial(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Remarks</label>
            <input
              name="remarks"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter remarks"
              value={poc.remarks}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 text-right">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewPOCModal;
