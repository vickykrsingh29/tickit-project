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

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onUpdateCustomer: () => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customerId,
  onUpdateCustomer,
}) => {
  if (!isOpen) return null;

  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    name: "",
    ancillaryName: "",
    email: "",
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
    existingImages: [] as string[],
    newImages: [] as File[],
    imagesToDelete: [] as string[],
  });

  const [companies, setCompanies] = useState<Option[]>([]);
  const [industries, setIndustries] = useState<Option[]>([]);
  const [typeOfCustomer, setTypeOfCustomer] = useState<Option[]>([]);
  const [salesReps, setSalesReps] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  // Fetch customer data when modal opens
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch customer data");
        }

        const data = await response.json();

        // Set existing image if available
        if (data.images && data.images.length > 0) {
          setExistingImageUrl(data.images[0]);
          setImagePreviewUrl(data.images[0]);
        }

        // Ensure data is not undefined and has the expected structure
        if (data) {
          setFormData({
            ...formData,
            ...data,
            socialHandles: data.socialHandles || [{ platform: "", link: "" }],
            existingImages: data.existingImages || [],
            newImages: data.newImages || [],
            imagesToDelete: data.imagesToDelete || [],
          });

          // Add these fields to the options arrays if they don't exist
          if (data.billingCity) {
            setCities(prev => {
              const exists = prev.some(city => city.value === data.billingCity);
              return exists ? prev : [...prev, { value: data.billingCity, label: data.billingCity }];
            });
          }
          if (data.billingDistrict) {
            setDistricts(prev => {
              const exists = prev.some(district => district.value === data.billingDistrict);
              return exists ? prev : [...prev, { value: data.billingDistrict, label: data.billingDistrict }];
            });
          }
          if (data.billingState) {
            setStates(prev => {
              const exists = prev.some(state => state.value === data.billingState);
              return exists ? prev : [...prev, { value: data.billingState, label: data.billingState }];
            });
          }
          if (data.billingCountry) {
            setCountries(prev => {
              const exists = prev.some(country => country.value === data.billingCountry);
              return exists ? prev : [...prev, { value: data.billingCountry, label: data.billingCountry }];
            });
          }

          // Do the same for shipping address if it exists
          if (data.shippingCity) {
            setCities(prev => {
              const exists = prev.some(city => city.value === data.shippingCity);
              return exists ? prev : [...prev, { value: data.shippingCity, label: data.shippingCity }];
            });
          }
          if (data.shippingDistrict) {
            setDistricts(prev => {
              const exists = prev.some(district => district.value === data.shippingDistrict);
              return exists ? prev : [...prev, { value: data.shippingDistrict, label: data.shippingDistrict }];
            });
          }
          if (data.shippingState) {
            setStates(prev => {
              const exists = prev.some(state => state.value === data.shippingState);
              return exists ? prev : [...prev, { value: data.shippingState, label: data.shippingState }];
            });
          }
          if (data.shippingCountry) {
            setCountries(prev => {
              const exists = prev.some(country => country.value === data.shippingCountry);
              return exists ? prev : [...prev, { value: data.shippingCountry, label: data.shippingCountry }];
            });
          }

          // And for WPC address
          if (data.wpcCity) {
            setCities(prev => {
              const exists = prev.some(city => city.value === data.wpcCity);
              return exists ? prev : [...prev, { value: data.wpcCity, label: data.wpcCity }];
            });
          }
          if (data.wpcDistrict) {
            setDistricts(prev => {
              const exists = prev.some(district => district.value === data.wpcDistrict);
              return exists ? prev : [...prev, { value: data.wpcDistrict, label: data.wpcDistrict }];
            });
          }
          if (data.wpcState) {
            setStates(prev => {
              const exists = prev.some(state => state.value === data.wpcState);
              return exists ? prev : [...prev, { value: data.wpcState, label: data.wpcState }];
            });
          }
          if (data.wpcCountry) {
            setCountries(prev => {
              const exists = prev.some(country => country.value === data.wpcCountry);
              return exists ? prev : [...prev, { value: data.wpcCountry, label: data.wpcCountry }];
            });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching customer data:", error);
        setError('Failed to fetch customer data');
        setLoading(false);
      }
    };

    if (isOpen && customerId) {
      fetchCustomerData();
    }
  }, [isOpen, customerId, getAccessTokenSilently]);

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
          // fetch(
          //   `${import.meta.env.VITE_BACKEND_URL
          //   }/api/customers/poc-designations`,
          //   {
          //     headers: { Authorization: `Bearer ${token}` },
          //   }
          // ),
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

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && !imagePreviewUrl.startsWith('http')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (imagePreviewUrl && !imagePreviewUrl.startsWith('http')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      const selectedFile = e.target.files[0];
      setImage(selectedFile);

      const url = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(url);
      setExistingImageUrl(null);
    }
  };

  const handleDeleteImage = async () => {
    if (existingImageUrl) {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
          },
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customerId}/image`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: existingImageUrl }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete image');
        }

        setExistingImageUrl(null);
        setImagePreviewUrl(null);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    } else if (imagePreviewUrl) {
      // Clean up local preview
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
      setImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
        },
      });

      const formDataToSend = new FormData();
      formDataToSend.append("customer", JSON.stringify(formData));
      if (image) {
        formDataToSend.append("image", image);
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers/${customerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      onUpdateCustomer();
      onClose();
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIndustry = (inputValue: string) => {
    const newOption = { value: inputValue, label: inputValue };
    setIndustries((prev) => [...prev, newOption]);
    setFormData((prev) => ({
      ...prev,
      industry: inputValue,
    }));
  };

  const handleAddSocial = () => {
    setFormData(prev => ({
      ...prev,
      socialHandles: [...prev.socialHandles, { platform: '', link: '' }]
    }));
  };

  const handleSocialChange = (index: number, field: 'platform' | 'link', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialHandles: prev.socialHandles.map((social, i) =>
        i === index ? { ...social, [field]: value } : social
      )
    }));
  };

  const handleDeleteSocial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialHandles: prev.socialHandles.filter((_, i) => i !== index)
    }));
  };

  const handleBillingPincodeLookup = async () => {
    if (!formData.billingPin) return;
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${formData.billingPin}`
      );
      const data = await res.json();
      const postOffice = data[0]?.PostOffice?.[0];
      if (postOffice) {
        setFormData((prev) => ({
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
    if (!formData.shippingPin) return;
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${formData.shippingPin}`
      );
      const data = await res.json();
      const postOffice = data[0]?.PostOffice?.[0];
      if (postOffice) {
        setFormData((prev) => ({
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
    if (!formData.wpcPin) return;
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${formData.wpcPin}`
      );
      const data = await res.json();
      const postOffice = data[0]?.PostOffice?.[0];
      if (postOffice) {
        setFormData((prev) => ({
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

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-center h-full">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <h2 className="text-xl font-bold mb-6">Edit Customer</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Parent Company Name*</label>
              <CreatableSelect
                options={companies}
                isClearable
                required
                onCreateOption={(inputValue) => {
                  const newOption = { value: inputValue, label: inputValue };
                  setCompanies((prev) => [...prev, newOption]);
                  setFormData((prev) => ({
                    ...prev,
                    name: inputValue,
                  }));
                }}
                value={
                  formData.name
                    ? { label: formData.name, value: formData.name }
                    : null
                }
                onChange={(selected) => {
                  const value = selected?.value || "";
                  setFormData((prev) => ({
                    ...prev,
                    name: value,
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
                value={formData.ancillaryName}
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
                value={formData.email}
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
                placeholder="Enter company phone"
                value={formData.phone}
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
                value={formData.website}
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
                  setFormData((prev) => ({
                    ...prev,
                    industry: inputValue,
                  }));
                }}
                value={
                  formData.industry
                    ? { label: formData.industry, value: formData.industry }
                    : null
                }
                onChange={(selected) => {
                  const value = selected?.value || "";
                  setFormData((prev) => ({
                    ...prev,
                    industry: value,
                  }));
                }}
                placeholder="Select or type an industry"
              />
            </div>

            <div>
              <label className="block text-gray-700">Industry Type*</label>
              <CreatableSelect
                options={typeOfCustomer}
                isClearable
                required
                value={
                  formData.typeOfCustomer
                    ? { value: formData.typeOfCustomer, label: formData.typeOfCustomer }
                    : null
                }
                onChange={(selected) => {
                  const value = selected?.value || "";
                  setFormData((prev) => ({
                    ...prev,
                    typeOfCustomer: value,
                  }));
                }}
                onCreateOption={(inputValue) => {
                  const newOption = { value: inputValue, label: inputValue };
                  setTypeOfCustomer((prev) => [...prev, newOption]);
                  setFormData((prev) => ({
                    ...prev,
                    typeOfCustomer: inputValue,
                  }));
                }}
                placeholder="Select or type an industry type"
              />
            </div>

            <div>
              <label className="block text-gray-700">Sales Representative*</label>
              <CreatableSelect
                options={salesReps}
                isClearable
                required
                value={
                  formData.salesRep
                    ? { value: formData.salesRep, label: formData.salesRep }
                    : null
                }
                onChange={(selected) => {
                  const value = selected?.value || "";
                  setFormData((prev) => ({
                    ...prev,
                    salesRep: value,
                  }));
                }}
                onCreateOption={(inputValue) => {
                  const newOption = { value: inputValue, label: inputValue };
                  setSalesReps((prev) => [...prev, newOption]);
                  setFormData((prev) => ({
                    ...prev,
                    salesRep: inputValue,
                  }));
                }}
                placeholder="Select or type a sales representative"
              />
            </div>

            <div>
              <label className="block text-gray-700">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter GST number"
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
          </div>

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
              {formData.socialHandles.map((social, index) => (
                <div key={index} className="flex items-center gap-4">
                  <CreatableSelect
                    options={socialPlatforms}
                    className="w-1/3"
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
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Billing Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="billingStreetAddress"
                  value={formData.billingStreetAddress}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="billingAddressLine2"
                  value={formData.billingAddressLine2}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">PIN Code</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="billingPin"
                    value={formData.billingPin}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    
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
                <label className="block text-sm font-medium mb-1">City</label>
                <CreatableSelect
                  options={cities}
                  isClearable
                  
                  value={
                    formData.billingCity
                      ? { value: formData.billingCity, label: formData.billingCity }
                      : null
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      billingCity: selected?.value || "",
                    }))
                  }
                  onCreateOption={(inputValue) => {
                    const newOption = { value: inputValue, label: inputValue };
                    setCities((prev) => [...prev, newOption]);
                    setFormData((prev) => ({
                      ...prev,
                      billingCity: inputValue,
                    }));
                  }}
                  placeholder="Select or type a city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="billingDistrict"
                  value={formData.billingDistrict}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  name="billingState"
                  value={formData.billingState}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="billingCountry"
                  value={formData.billingCountry}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  
                />
              </div>
            </div>
          </div>

          <div className="col-span-2 flex items-center">
            {console.log(formData)}
            <input
              type="checkbox"
              id="sameAsBilling"
              name="sameAsBilling"
              checked={formData.sameAsBilling}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  sameAsBilling: e.target.checked,
                }));
                if (e.target.checked) {
                  setFormData((prev) => ({
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
              name="wpcSameAsBilling"
              checked={formData.wpcSameAsBilling}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  wpcSameAsBilling: e.target.checked,
                }));
                if (e.target.checked) {
                  setFormData((prev) => ({
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

          {!formData.sameAsBilling && (
            <div className="col-span-2">
              <label className="block text-lg font-bold mb-4">Shipping Address</label>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    name="shippingStreetAddress"
                    className="w-full p-2 border rounded"
                    placeholder="Enter street address"
                    value={formData.shippingStreetAddress}
                    onChange={handleChange}
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <input
                    name="shippingAddressLine2"
                    className="w-full p-2 border rounded"
                    placeholder="Enter address line 2"
                    value={formData.shippingAddressLine2}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pin Code</label>
                    <div className="flex items-center">
                      <input
                        name="shippingPin"
                        className="w-full p-2 border rounded"
                        placeholder="Enter pin code"
                        value={formData.shippingPin}
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
                      
                      value={
                        formData.shippingCity
                          ? { label: formData.shippingCity, value: formData.shippingCity }
                          : null
                      }
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          shippingCity: selected?.value || "",
                        }))
                      }
                      onCreateOption={(inputValue) => {
                        const newOption = { value: inputValue, label: inputValue };
                        setCities((prev) => [...prev, newOption]);
                        setFormData((prev) => ({
                          ...prev,
                          shippingCity: inputValue,
                        }));
                      }}
                      placeholder="Select or type a city"
                    />
                  </div>

                  <div>
                    <label>District</label>
                    <CreatableSelect
                      options={districts}
                      isClearable
                      
                      value={
                        formData.shippingDistrict
                          ? { label: formData.shippingDistrict, value: formData.shippingDistrict }
                          : null
                      }
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          shippingDistrict: selected?.value || "",
                        }))
                      }
                      onCreateOption={(inputValue) => {
                        const newOption = { value: inputValue, label: inputValue };
                        setDistricts((prev) => [...prev, newOption]);
                        setFormData((prev) => ({
                          ...prev,
                          shippingDistrict: inputValue,
                        }));
                      }}
                      placeholder="Select or type a district"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>State</label>
                    <CreatableSelect
                      options={states}
                      isClearable
                      
                      value={
                        formData.shippingState
                          ? { label: formData.shippingState, value: formData.shippingState }
                          : null
                      }
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          shippingState: selected?.value || "",
                        }))
                      }
                      onCreateOption={(inputValue) => {
                        const newOption = { value: inputValue, label: inputValue };
                        setStates((prev) => [...prev, newOption]);
                        setFormData((prev) => ({
                          ...prev,
                          shippingState: inputValue,
                        }));
                      }}
                      placeholder="Select or type a state"
                    />
                  </div>

                  <div>
                    <label>Country</label>
                    <CreatableSelect
                      options={countries}
                      isClearable
                      
                      value={
                        formData.shippingCountry
                          ? { label: formData.shippingCountry, value: formData.shippingCountry }
                          : null
                      }
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          shippingCountry: selected?.value || "",
                        }))
                      }
                      onCreateOption={(inputValue) => {
                        const newOption = { value: inputValue, label: inputValue };
                        setCountries((prev) => [...prev, newOption]);
                        setFormData((prev) => ({
                          ...prev,
                          shippingCountry: inputValue,
                        }));
                      }}
                      placeholder="Select or type a country"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WPC Address Section */}
          {!formData.wpcSameAsBilling && (
            <div className="col-span-2">
              <label className="block text-lg font-bold text-gray-700">
                WPC License Address
              </label>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    name="wpcStreetAddress"
                    className="w-full p-2 border rounded"
                    placeholder="Enter street address"
                    value={formData.wpcStreetAddress}
                    onChange={handleChange}
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <input
                    name="wpcAddressLine2"
                    className="w-full p-2 border rounded"
                    placeholder="Enter address line 2"
                    value={formData.wpcAddressLine2}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pin Code</label>
                    <div className="flex items-center">
                      <input
                        name="wpcPin"
                        className="w-full p-2 border rounded"
                        placeholder="Enter pin code"
                        value={formData.wpcPin}
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
                      
                      value={
                        formData.wpcCity
                          ? { value: formData.wpcCity, label: formData.wpcCity }
                          : null
                      }
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          wpcCity: selected?.value || "",
                        }))
                      }
                      onCreateOption={(inputValue) => {
                        const newOption = { value: inputValue, label: inputValue };
                        setCities((prev) => [...prev, newOption]);
                        setFormData((prev) => ({
                          ...prev,
                          wpcCity: inputValue,
                        }));
                      }}
                      placeholder="Select or type a city"
                    />
                  </div>

                  <div>
                    <label>District</label>
                    <CreatableSelect
                      options={districts}
                      isClearable
                      
                      value={
                        formData.wpcDistrict
                          ? { value: formData.wpcDistrict, label: formData.wpcDistrict }
                          : null
                      }
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          wpcDistrict: selected?.value || "",
                        }))
                      }
                      onCreateOption={(inputValue) => {
                        const newOption = { value: inputValue, label: inputValue };
                        setDistricts((prev) => [...prev, newOption]);
                        setFormData((prev) => ({
                          ...prev,
                          wpcDistrict: inputValue,
                        }));
                      }}
                      placeholder="Select or type a district"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>State</label>
                    <CreatableSelect
                      options={states}
                      isClearable
                      
                      value={
                        formData.wpcState
                          ? { value: formData.wpcState, label: formData.wpcState }
                          : null
                      }
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          wpcState: selected?.value || "",
                        }))
                      }
                      onCreateOption={(inputValue) => {
                        const newOption = { value: inputValue, label: inputValue };
                        setStates((prev) => [...prev, newOption]);
                        setFormData((prev) => ({
                          ...prev,
                          wpcState: inputValue,
                        }));
                      }}
                      placeholder="Select or type a state"
                    />
                  </div>

                  <div>
                    <label>Country</label>
                    <CreatableSelect
                      options={countries}
                      isClearable
                      
                      value={
                        formData.wpcCountry
                          ? { value: formData.wpcCountry, label: formData.wpcCountry }
                          : null
                      }
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          wpcCountry: selected?.value || "",
                        }))
                      }
                      onCreateOption={(inputValue) => {
                        const newOption = { value: inputValue, label: inputValue };
                        setCountries((prev) => [...prev, newOption]);
                        setFormData((prev) => ({
                          ...prev,
                          wpcCountry: inputValue,
                        }));
                      }}
                      placeholder="Select or type a country"
                    />
                  </div>
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

export default EditCustomerModal;