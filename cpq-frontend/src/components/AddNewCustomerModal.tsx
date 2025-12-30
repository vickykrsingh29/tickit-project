import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import {
  FaTrash,
  FaFacebookSquare,
  FaTwitterSquare,
  FaLinkedin,
  FaInstagramSquare,
  FaYoutubeSquare,
  FaGlobe
} from "react-icons/fa";
import CreatableSelect from "react-select/creatable";

interface Option {
  value: string;
  label: string;
}

interface AddNewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: any) => void;
}

const AddNewCustomerModal: React.FC<AddNewCustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [customer, setCustomer] = useState({
    name: "",
    ancillaryName: "",
    // pocName: "",
    // pocDesignation: "",
    email: "",
    // pocEmail: "",
    phone: "",
    website: "",
    socialHandles: [{ platform: "", link: "" }],
    industry: "",
    typeOfCustomer: "",
    gstNumber: "",
    salesRep: "",
    billingStreetAddress: "",
    billingAddressLine2: "",
    billingPin: "",
    billingCity: "",
    billingDistrict: "",
    billingState: "",
    billingCountry: "",
    sameAsBilling: true,
    wpcSameAsBilling: true,
    shippingStreetAddress: "",
    shippingAddressLine2: "",
    shippingPin: "",
    shippingCity: "",
    shippingDistrict: "",
    shippingState: "",
    shippingCountry: "",
    wpcStreetAddress: "",
    wpcAddressLine2: "",
    wpcPin: "",
    wpcCity: "",
    wpcDistrict: "",
    wpcState: "",
    wpcCountry: "",
  });
  const [companies, setCompanies] = useState<Option[]>([]);
  const [typeOfCustomer, setTypeOfCustomer] = useState<Option[]>([]);
  // const [pocDesignations, setPocDesignations] = useState<Option[]>([]);
  const [industries, setIndustries] = useState<Option[]>([]);
  const [salesReps, setSalesReps] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);
  const [image, setImage] = useState<File | null>(null);
  // const [documents, setDocuments] = useState<FileList | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [socialPlatforms] = useState([
    {
      value: 'facebook',
      label: (
        <div className="flex items-center gap-2">
          <FaFacebookSquare className="text-[#4267B2]" size={20} />
          <span>Facebook</span>
        </div>
      )
    },
    {
      value: 'twitter',
      label: (
        <div className="flex items-center gap-2">
          <FaTwitterSquare className="text-[#1DA1F2]" size={20} />
          <span>Twitter</span>
        </div>
      )
    },
    {
      value: 'linkedin',
      label: (
        <div className="flex items-center gap-2">
          <FaLinkedin className="text-[#0077B5]" size={20} />
          <span>LinkedIn</span>
        </div>
      )
    },
    {
      value: 'instagram',
      label: (
        <div className="flex items-center gap-2">
          <FaInstagramSquare className="text-[#E4405F]" size={20} />
          <span>Instagram</span>
        </div>
      )
    },
    {
      value: 'youtube',
      label: (
        <div className="flex items-center gap-2">
          <FaYoutubeSquare className="text-[#FF0000]" size={20} />
          <span>YouTube</span>
        </div>
      )
    },
    {
      value: 'website',
      label: (
        <div className="flex items-center gap-2">
          <FaGlobe className="text-gray-600" size={20} />
          <span>Website</span>
        </div>
      )
    }
  ]);

  const handleAddOption = (
    inputValue: string,
    setOptions: React.Dispatch<React.SetStateAction<Option[]>>,
    setSelected: React.Dispatch<React.SetStateAction<Option | null>>
  ) => {
    const newOption = { value: inputValue, label: inputValue };
    setOptions((prev) => [...prev, newOption]);
    setSelected(newOption);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const [
          companiesRes,
          // pocRes,
          industriesRes,
          repsRes,
          citiesRes,
          districtsRes,
          statesRes,
          countriesRes,
          typeOfCustomerRes,
        ] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/companies`, {
            headers: { Authorization: `Bearer ${token}` },
          }),

          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/customers/industries`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/customers/sales-reps`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/cities`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/districts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/states`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/countries`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/types-of-customers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (
          !companiesRes.ok ||
          !industriesRes.ok ||
          !repsRes.ok ||
          !citiesRes.ok ||
          !districtsRes.ok ||
          !statesRes.ok ||
          !countriesRes.ok ||
          !typeOfCustomerRes.ok
        ) {
          throw new Error("Failed to fetch customer options");
        }

        const [
          companiesData,
          industriesData,
          repsData,
          citiesData,
          districtsData,
          statesData,
          countriesData,
          typeOfCustomerData,
        ] = await Promise.all([
          companiesRes.json(),
          industriesRes.json(),
          repsRes.json(),
          citiesRes.json(),
          districtsRes.json(),
          statesRes.json(),
          countriesRes.json(),
          typeOfCustomerRes.json(),
        ]);

        setCompanies(companiesData);
        setIndustries(industriesData);
        setSalesReps(repsData);
        setCities(citiesData);
        setDistricts(districtsData);
        setStates(statesData);
        setCountries(countriesData);
        setTypeOfCustomer(typeOfCustomerData);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, getAccessTokenSilently]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };


  const handleBillingPincodeLookup = async () => {
    if (!customer.billingPin) return;
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${customer.billingPin}`
      );
      const data = await res.json();
      const postOffice = data[0]?.PostOffice?.[0];
      if (postOffice) {
        setCustomer((prev) => ({
          ...prev,
          billingCity: postOffice.District,
          billingDistrict: postOffice.District,
          billingState: postOffice.State,
          billingCountry: postOffice.Country,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleShippingPincodeLookup = async () => {
    if (!customer.shippingPin) return;
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${customer.shippingPin}`
      );
      const data = await res.json();
      const postOffice = data[0]?.PostOffice?.[0];
      if (postOffice) {
        setCustomer((prev) => ({
          ...prev,
          shippingCity: postOffice.District,
          shippingDistrict: postOffice.District,
          shippingState: postOffice.State,
          shippingCountry: postOffice.Country,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleWPCPincodeLookup = async () => {
    if (!customer.wpcPin) return;
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${customer.wpcPin}`
      );
      const data = await res.json();
      const postOffice = data[0]?.PostOffice?.[0];
      if (postOffice) {
        setCustomer((prev) => ({
          ...prev,
          wpcCity: postOffice.District,
          wpcDistrict: postOffice.District,
          wpcState: postOffice.State,
          wpcCountry: postOffice.Country,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };


  // const handleFileChange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   setFile: React.Dispatch<React.SetStateAction<FileList | null>>
  // ) => {
  //   setFile(e.target.files);
  // };

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Update handleImagesChange for single image
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Clean up old preview URL
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      
      // Create new preview URL
      const url = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(url);
    }
  };

  const handleDeleteImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
      setImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("customer", JSON.stringify(customer));

    if (image) {
      formData.append("image", image);
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save customer");
      }

      // Get the newly created customer from the response
      const newCustomer = await response.json();

      // Call onSubmit with the new customer data
      onSubmit(newCustomer);

      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSocial = () => {
    setCustomer(prev => ({
      ...prev,
      socialHandles: [...prev.socialHandles, { platform: '', link: '' }]
    }));
  };

  const handleSocialChange = (index: number, field: 'platform' | 'link', value: string) => {
    setCustomer(prev => ({
      ...prev,
      socialHandles: prev.socialHandles.map((social, i) =>
        i === index ? { ...social, [field]: value } : social
      )
    }));
  };

  const handleDeleteSocial = (index: number) => {
    setCustomer(prev => ({
      ...prev,
      socialHandles: prev.socialHandles.filter((_, i) => i !== index)
    }));
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
        <h2 className="text-xl font-bold mb-6">Add New Customer</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Parent Company Name*</label>
            <CreatableSelect
              options={companies}
              isClearable
              required
              onCreateOption={(inputValue) => {
                const newOption = { value: inputValue, label: inputValue };
                setCompanies((prev) => [...prev, newOption]);
                setCustomer((prev) => ({ ...prev, name: inputValue }));
              }}
              value={
                customer.name
                  ? { label: customer.name, value: customer.name }
                  : null
              }
              onChange={(selected) => {
                setCustomer((prev) => ({
                  ...prev,
                  name: selected?.value || "",
                }));
              }}
              placeholder="Select or type to create a company"
            />
          </div>
          <div>
            <label className="block text-gray-700">Ancillary Name</label>
            <input
              name="ancillaryName"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter ancillary name"
              value={customer.ancillaryName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700">Company Email*</label>
            <input
              name="email"
              type="email"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter company email"
              value={customer.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700">Company Phone*</label>
            <input
              name="phone"
              type="text"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter company phone number"
              value={customer.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-gray-700">Company Website*</label>
            <input
              name="website"
              type="text"
              required
              className="w-full p-2 border rounded"
              placeholder="Enter company website"
              value={customer.website}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-gray-700">Industry*</label>
            <CreatableSelect
              options={industries}
              isClearable
              required  
              onCreateOption={(inputValue) => {
                const newOption = { value: inputValue, label: inputValue };
                setIndustries((prev) => [...prev, newOption]);
                setCustomer((prev) => ({ ...prev, industry: inputValue }));
              }}
              value={
                customer.industry
                  ? { label: customer.industry, value: customer.industry }
                  : null
              }
              onChange={(selected) =>
                setCustomer((prev) => ({
                  ...prev,
                  industry: selected?.value || "",
                }))
              }
              placeholder="Select or type an industry"
            />
          </div>
          <div>
            <label className="block text-gray-700">Type*</label>
            <CreatableSelect
              options={typeOfCustomer}
              isClearable
              required
              onCreateOption={(inputValue) => {
                // Add the new company option
                const newOption = { value: inputValue, label: inputValue };
                setTypeOfCustomer((prev) => [...prev, newOption]);
                // Update customer.name directly
                setCustomer((prev) => ({ ...prev, typeOfCustomer: inputValue }));
              }}
              // Display the current customer.name as the selected value
              value={
                customer.typeOfCustomer
                  ? { label: customer.typeOfCustomer, value: customer.typeOfCustomer }
                  : null
              }
              onChange={(selected) => {
                // Update customer.name based on user selection
                setCustomer((prev) => ({
                  ...prev,
                  typeOfCustomer: selected?.value || "",
                }));
              }}
              placeholder="Select or type to create a Type"
            />
          </div>
          <div>
            <label className="block text-gray-700">GST Number</label>
            <input
              name="gstNumber"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter customer GST number"
              value={customer.gstNumber}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-gray-700">Sales Rep*</label>
            <CreatableSelect
              options={salesReps}
              isClearable
              required
              onCreateOption={(inputValue) => {
                const newOption = { value: inputValue, label: inputValue };
                setSalesReps((prev) => [...prev, newOption]);
                setCustomer((prev) => ({ ...prev, salesRep: inputValue }));
              }}
              value={
                customer.salesRep
                  ? { label: customer.salesRep, value: customer.salesRep }
                  : null
              }
              onChange={(selected) =>
                setCustomer((prev) => ({
                  ...prev,
                  salesRep: selected?.value || "",
                }))
              }
              placeholder="Select or type a sales rep"
            />
          </div>
          <div>
            <label className="block text-gray-700">Company Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagesChange}
              className="hidden"
              id="image-upload"
            />
            <button
              type="button"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {imagePreviewUrl ? "Change Image" : "Select Image"}
            </button>

               {/* Image Preview */}
            {imagePreviewUrl && (
              <div className="ml-4 relative group w-24 h-24 inline-block align-middle">
                <img
                  src={imagePreviewUrl}
                  alt="Company Logo Preview"
                  className="w-full h-full object-contain rounded"
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full group-hover:bg-red-700"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            )}
          </div>
          {/* <div>
            <label className="block text-gray-700">Documents (Max 3)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={(e) => handleFileChange(e, setDocuments)}
              className="w-full p-2 border rounded"
            />
          </div> */}
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-lg font-bold text-gray-700">Social Media Handles</label>
              <button
                type="button"
                onClick={handleAddSocial}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Add Social Media
              </button>
            </div>

            <div className="space-y-3">
              {customer.socialHandles.map((social, index) => (
                <div key={index} className="flex items-center gap-4">
                  <CreatableSelect
                    options={socialPlatforms}
                    className="w-1/5"
                    value={
                      social.platform
                        ? {
                          value: social.platform,
                          label: (
                            <div className="flex items-center gap-2">
                              {social.platform === 'facebook' && <FaFacebookSquare className="text-[#4267B2]" size={20} />}
                              {social.platform === 'twitter' && <FaTwitterSquare className="text-[#1DA1F2]" size={20} />}
                              {social.platform === 'linkedin' && <FaLinkedin className="text-[#0077B5]" size={20} />}
                              {social.platform === 'instagram' && <FaInstagramSquare className="text-[#E4405F]" size={20} />}
                              {social.platform === 'youtube' && <FaYoutubeSquare className="text-[#FF0000]" size={20} />}
                              {social.platform === 'website' && <FaGlobe className="text-gray-600" size={20} />}
                              <span>{social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}</span>
                            </div>
                          )
                        }
                        : null
                    }
                    onChange={(selected) => handleSocialChange(index, 'platform', selected?.value || '')}
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
                    value={social.link}
                    onChange={(e) => handleSocialChange(index, 'link', e.target.value)}
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
            <label className="block text-lg font-bold text-gray-700">
              Billing Address
            </label>

            <label>Street Address</label>
            <input
              name="billingStreetAddress"
              className="w-full p-2 border rounded"
              placeholder="Enter street address"
              value={customer.billingStreetAddress}
              onChange={handleChange}
            />

            <label>Address Line 2</label>
            <input
              name="billingAddressLine2"
              className="w-full p-2 border rounded"
              placeholder="Enter address line 2"
              value={customer.billingAddressLine2}
              onChange={handleChange}
            />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label>Pin Code</label>
                <div className="flex items-center">
                  <input
                    name="billingPin"
                    className="w-full p-2 border rounded"
                    placeholder="Enter pin code"
                    value={customer.billingPin}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="ml-2 p-2 border rounded bg-blue-500 text-white"
                    onClick={handleBillingPincodeLookup}
                  >
                    Fetch
                  </button>
                </div>
              </div>
              <div>
                <label>City</label>
                <CreatableSelect
                  options={cities}
                  isClearable
                  onCreateOption={(inputValue) => {
                    const newOption = { value: inputValue, label: inputValue };
                    setCities((prev) => [...prev, newOption]);
                    setCustomer((prev) => ({
                      ...prev,
                      billingCity: inputValue,
                    }));
                  }}
                  value={
                    customer.billingCity
                      ? {
                        label: customer.billingCity,
                        value: customer.billingCity,
                      }
                      : null
                  }
                  onChange={(selected) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingCity: selected?.value || "",
                    }))
                  }
                  placeholder="Select or type a city"
                />
              </div>
              <div>
                <label>District</label>
                <CreatableSelect
                  options={districts}
                  isClearable
                  onCreateOption={(inputValue) => {
                    const newOption = {
                      value: inputValue,
                      label: inputValue,
                    };
                    setDistricts((prev) => [...prev, newOption]);
                    setCustomer((prev) => ({
                      ...prev,
                      billingDistrict: inputValue,
                    }));
                  }}
                  value={
                    customer.billingDistrict
                      ? {
                        label: customer.billingDistrict,
                        value: customer.billingDistrict,
                      }
                      : null
                  }
                  onChange={(selected) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingDistrict: selected?.value || "",
                    }))
                  }
                  placeholder="Select or type a district"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label>State</label>
                <CreatableSelect
                  options={states}
                  isClearable
                  onCreateOption={(inputValue) => {
                    const newOption = {
                      value: inputValue,
                      label: inputValue,
                    };
                    setStates((prev) => [...prev, newOption]);
                    setCustomer((prev) => ({
                      ...prev,
                      billingState: inputValue,
                    }));
                  }}
                  value={
                    customer.billingState
                      ? {
                        label: customer.billingState,
                        value: customer.billingState,
                      }
                      : null
                  }
                  onChange={(selected) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingState: selected?.value || "",
                    }))
                  }
                  placeholder="Select or type a state"
                />
              </div>
              <div>
                <label>Country</label>
                <CreatableSelect
                  options={countries}
                  isClearable
                  onCreateOption={(inputValue) => {
                    const newOption = {
                      value: inputValue,
                      label: inputValue,
                    };
                    setCountries((prev) => [...prev, newOption]);
                    setCustomer((prev) => ({
                      ...prev,
                      billingCountry: inputValue,
                    }));
                  }}
                  value={
                    customer.billingCountry
                      ? {
                        label: customer.billingCountry,
                        value: customer.billingCountry,
                      }
                      : null
                  }
                  onChange={(selected) =>
                    setCustomer((prev) => ({
                      ...prev,
                      billingCountry: selected?.value || "",
                    }))
                  }
                  placeholder="Select or type a country"
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 flex items-center">
            <input
              type="checkbox"
              id="sameAsBilling"
              checked={customer.sameAsBilling}
              onChange={(e) => {
                setCustomer((prev) => ({
                  ...prev,
                  sameAsBilling: e.target.checked,
                }));
                if (e.target.checked) {
                  setCustomer((prev) => ({
                    ...prev,
                    shippingStreetAddress: prev.billingStreetAddress,
                    shippingAddressLine2: prev.billingAddressLine2,
                    shippingPin: prev.billingPin,
                    shippingCity: prev.billingCity,
                    shippingDistrict: prev.billingDistrict,
                    shippingState: prev.billingState,
                    shippingCountry: prev.billingCountry,
                  }));
                }
              }}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="sameAsBilling" className="ml-2">
              Shipping address same as billing
            </label>
          </div>
          <div className="col-span-2 flex items-center">
            <input
              type="checkbox"
              id="wpcSameAsBilling"
              checked={customer.wpcSameAsBilling}
              onChange={(e) => {
                setCustomer((prev) => ({
                  ...prev,
                  wpcSameAsBilling: e.target.checked,
                }));
                if (e.target.checked) {
                  setCustomer((prev) => ({
                    ...prev,
                    wpcStreetAddress: prev.billingStreetAddress,
                    wpcAddressLine2: prev.billingAddressLine2,
                    wpcPin: prev.billingPin,
                    wpcCity: prev.billingCity,
                    wpcDistrict: prev.billingDistrict,
                    wpcState: prev.billingState,
                    wpcCountry: prev.billingCountry,
                  }));
                }
              }}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="wpcSameAsBilling" className="ml-2">
              WPC license address same as billing
            </label>
          </div>


          {!customer.sameAsBilling && (
            <div className="col-span-2">
              <label className="block text-lg font-bold text-gray-700">
                Shipping Address
              </label>
              <label>Street Address</label>
              <input
                name="shippingStreetAddress"
                className="w-full p-2 border rounded"
                placeholder="Enter street address"
                value={customer.shippingStreetAddress}
                onChange={handleChange}
              />
              <label>Address Line 2</label>
              <input
                name="shippingAddressLine2"
                className="w-full p-2 border rounded"
                placeholder="Enter address line 2"
                value={customer.shippingAddressLine2}
                onChange={handleChange}
              />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label>Pin Code</label>
                  <div className="flex items-center">
                    <input
                      name="shippingPin"
                      className="w-full p-2 border rounded"
                      placeholder="Enter pin code"
                      value={customer.shippingPin}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="ml-2 p-2 border rounded bg-blue-500 text-white"
                      onClick={handleShippingPincodeLookup}
                    >
                      Fetch
                    </button>
                  </div>
                </div>
                <div>
                  <label>City</label>
                  <CreatableSelect
                    options={cities}
                    isClearable
                    onCreateOption={(inputValue) => {
                      const newOption = {
                        value: inputValue,
                        label: inputValue,
                      };
                      setCities((prev) => [...prev, newOption]);
                      setCustomer((prev) => ({
                        ...prev,
                        shippingCity: inputValue,
                      }));
                    }}
                    value={
                      customer.shippingCity
                        ? {
                          label: customer.shippingCity,
                          value: customer.shippingCity,
                        }
                        : null
                    }
                    onChange={(selected) =>
                      setCustomer((prev) => ({
                        ...prev,
                        shippingCity: selected?.value || "",
                      }))
                    }
                    placeholder="Select or type a city"
                  />
                </div>
                <div>
                  <label>District</label>
                  <CreatableSelect
                    options={districts}
                    isClearable
                    onCreateOption={(inputValue) => {
                      const newOption = {
                        value: inputValue,
                        label: inputValue,
                      };
                      setDistricts((prev) => [...prev, newOption]);
                      setCustomer((prev) => ({
                        ...prev,
                        shippingDistrict: inputValue,
                      }));
                    }}
                    value={
                      customer.shippingDistrict
                        ? {
                          label: customer.shippingDistrict,
                          value: customer.shippingDistrict,
                        }
                        : null
                    }
                    onChange={(selected) =>
                      setCustomer((prev) => ({
                        ...prev,
                        shippingDistrict: selected?.value || "",
                      }))
                    }
                    placeholder="Select or type a district"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label>State</label>
                  <CreatableSelect
                    options={states}
                    isClearable
                    onCreateOption={(inputValue) => {
                      const newOption = {
                        value: inputValue,
                        label: inputValue,
                      };
                      setStates((prev) => [...prev, newOption]);
                      setCustomer((prev) => ({
                        ...prev,
                        shippingState: inputValue,
                      }));
                    }}
                    value={
                      customer.shippingState
                        ? {
                          label: customer.shippingState,
                          value: customer.shippingState,
                        }
                        : null
                    }
                    onChange={(selected) =>
                      setCustomer((prev) => ({
                        ...prev,
                        shippingState: selected?.value || "",
                      }))
                    }
                    placeholder="Select or type a state"
                  />
                </div>
                <div>
                  <label>Country</label>
                  <CreatableSelect
                    options={countries}
                    isClearable
                    onCreateOption={(inputValue) => {
                      const newOption = {
                        value: inputValue,
                        label: inputValue,
                      };
                      setCountries((prev) => [...prev, newOption]);
                      setCustomer((prev) => ({
                        ...prev,
                        shippingCountry: inputValue,
                      }));
                    }}
                    value={
                      customer.shippingCountry
                        ? {
                          label: customer.shippingCountry,
                          value: customer.shippingCountry,
                        }
                        : null
                    }
                    onChange={(selected) =>
                      setCustomer((prev) => ({
                        ...prev,
                        shippingCountry: selected?.value || "",
                      }))
                    }
                    placeholder="Select or type a country"
                  />
                </div>
              </div>
            </div>
          )}

          {!customer.wpcSameAsBilling && (

            <div className="col-span-2">
              <label className="block text-lg font-bold text-gray-700">
                WPC License Address
              </label>

              <label>Street Address</label>
              <input
                name="wpcStreetAddress"
                className="w-full p-2 border rounded"
                placeholder="Enter street address"
                value={customer.wpcStreetAddress}
                onChange={handleChange}
              />

              <label>Address Line 2</label>
              <input
                name="wpcAddressLine2"
                className="w-full p-2 border rounded"
                placeholder="Enter address line 2"
                value={customer.wpcAddressLine2}
                onChange={handleChange}
              />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label>Pin Code</label>
                  <div className="flex items-center">
                    <input
                      name="wpcPin"
                      className="w-full p-2 border rounded"
                      placeholder="Enter pin code"
                      value={customer.wpcPin}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="ml-2 p-2 border rounded bg-blue-500 text-white"
                      onClick={handleWPCPincodeLookup}
                    >
                      Fetch
                    </button>
                  </div>
                </div>
                <div>
                  <label>City</label>
                  <CreatableSelect
                    options={cities}
                    isClearable
                    onCreateOption={(inputValue) => {
                      const newOption = { value: inputValue, label: inputValue };
                      setCities((prev) => [...prev, newOption]);
                      setCustomer((prev) => ({
                        ...prev,
                        wpcCity: inputValue,
                      }));
                    }}
                    value={
                      customer.billingCity
                        ? {
                          label: customer.wpcCity,
                          value: customer.wpcCity,
                        }
                        : null
                    }
                    onChange={(selected) =>
                      setCustomer((prev) => ({
                        ...prev,
                        wpcCity: selected?.value || "",
                      }))
                    }
                    placeholder="Select or type a city"
                  />
                </div>
                <div>
                  <label>District</label>
                  <CreatableSelect
                    options={districts}
                    isClearable
                    onCreateOption={(inputValue) => {
                      const newOption = {
                        value: inputValue,
                        label: inputValue,
                      };
                      setDistricts((prev) => [...prev, newOption]);
                      setCustomer((prev) => ({
                        ...prev,
                        wpcDistrict: inputValue,
                      }));
                    }}
                    value={
                      customer.wpcDistrict
                        ? {
                          label: customer.wpcDistrict,
                          value: customer.wpcDistrict,
                        }
                        : null
                    }
                    onChange={(selected) =>
                      setCustomer((prev) => ({
                        ...prev,
                        wpcDistrict: selected?.value || "",
                      }))
                    }
                    placeholder="Select or type a district"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label>State</label>
                  <CreatableSelect
                    options={states}
                    isClearable
                    onCreateOption={(inputValue) => {
                      const newOption = {
                        value: inputValue,
                        label: inputValue,
                      };
                      setStates((prev) => [...prev, newOption]);
                      setCustomer((prev) => ({
                        ...prev,
                        wpcState: inputValue,
                      }));
                    }}
                    value={
                      customer.wpcState
                        ? {
                          label: customer.wpcState,
                          value: customer.wpcState,
                        }
                        : null
                    }
                    onChange={(selected) =>
                      setCustomer((prev) => ({
                        ...prev,
                        wpcState: selected?.value || "",
                      }))
                    }
                    placeholder="Select or type a state"
                  />
                </div>
                <div>
                  <label>Country</label>
                  <CreatableSelect
                    options={countries}
                    isClearable
                    onCreateOption={(inputValue) => {
                      const newOption = {
                        value: inputValue,
                        label: inputValue,
                      };
                      setCountries((prev) => [...prev, newOption]);
                      setCustomer((prev) => ({
                        ...prev,
                        wpcCountry: inputValue,
                      }));
                    }}
                    value={
                      customer.wpcCountry
                        ? {
                          label: customer.wpcCountry,
                          value: customer.wpcCountry,
                        }
                        : null
                    }
                    onChange={(selected) =>
                      setCustomer((prev) => ({
                        ...prev,
                        wpcCountry: selected?.value || "",
                      }))
                    }
                    placeholder="Select or type a country"
                  />
                </div>
              </div>
            </div>
          )}
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

export default AddNewCustomerModal;
