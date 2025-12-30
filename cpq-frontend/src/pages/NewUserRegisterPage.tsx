import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";
import CreatableSelect from "react-select/creatable";

interface CompanyOption {
  label: string;
  value: string;
}
interface TeamOption {
  label: string;
  value: string;
}

const NewUserRegisterPage: React.FC = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [teamName, setTeamName] = useState("");
  const email = user?.email || "";
  const history = useHistory();

  useEffect(() => {
    if (user) {
      setFirstName(user.given_name || '');
      setLastName(user.family_name || '');
      fetchCompanies();
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/companies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const companies = await response.json();
        setCompanyOptions(companies);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  const fetchTeams = async (selectedCompany: string) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/teams/${encodeURIComponent(selectedCompany)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const teams = await response.json();
        setTeamOptions(teams);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };
  // Modify handleCompanyChange to fetch teams when company changes
  const handleCompanyChange = (newValue: CompanyOption | null) => {
    setCompanyName(newValue?.value || "");
    setTeamName(""); // Reset team selection
    if (newValue?.value) {
      fetchTeams(newValue.value);
    } else {
      setTeamOptions([]); // Clear team options if no company selected
    }
  };

  const handleTeamChange = (newValue: TeamOption | null) => {
    setTeamName(newValue?.value || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: user?.sub,
            email,
            firstName,
            lastName,
            designation,
            companyName,
            teamName,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to create user");
      alert("User created successfully");
      history.push("/approval-pending");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Register New User
        </h1>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Email</label>
          <input
            type="email"
            disabled
            className="border p-2 w-full rounded"
            value={email}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">First Name</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Last Name</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Designation</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Company Name</label>
          <CreatableSelect
            isClearable
            options={companyOptions}
            onChange={handleCompanyChange}
            placeholder="Select or type to create a company"
            value={
              companyName ? { label: companyName, value: companyName } : null
            }
            className="react-select-container"
            classNamePrefix="react-select"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Team Name</label>
          <CreatableSelect
            isClearable
            options={teamOptions}
            onChange={handleTeamChange}
            value={teamName ? { label: teamName, value: teamName } : null}
            placeholder="Select or type to create a team"
            className="react-select-container"
            classNamePrefix="react-select"
            required
            isDisabled={!companyName} // Disable if no company selected
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewUserRegisterPage;