import React, { useState } from 'react';
import './App.css'; // Optional if you want to extract styling later

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getDropdownOptions = (key) => {
  const options = {
    BusinessTravel: ["Travel_Rarely", "Travel_Frequently", "Non-Travel"],
    Department: ["Research & Development", "Sales", "Human Resources"],
    EducationField: ["Life Sciences", "Medical", "Marketing", "Technical Degree", "Other", "Human Resources"],
    Gender: ["Male", "Female"],
    JobRole: [
      "Sales Executive", "Research Scientist", "Laboratory Technician", "Manufacturing Director",
      "Healthcare Representative", "Manager", "Sales Representative", "Research Director", "Human Resources"
    ],
    MaritalStatus: ["Single", "Married", "Divorced"],
    OverTime: ["Yes", "No"]
  };

  return options[key] || [];
};

const fieldLabels = {
  Age: "Age (in years)",
  Gender: "Gender",
  MaritalStatus: "Marital Status",
  Education: "Education (1 = Below College to 5 = Doctor)",
  EducationField: "Education Field",
  JobLevel: "Job Level (1 = Entry, 5 = Executive)",
  JobRole: "Job Role",
  Department: "Department",
  BusinessTravel: "Business Travel Frequency",
  OverTime: "Works Overtime?",
  MonthlyIncome: "Monthly Income (USD)",
  DailyRate: "Daily Rate ($)",
  PercentSalaryHike: "Salary Hike (%)",
  EnvironmentSatisfaction: "Environment Satisfaction (1-4)",
  TotalWorkingYears: "Total Working Years",
  NumCompaniesWorked: "Number of Companies Worked For",
  DistanceFromHome: "Distance From Home (km)",
  YearsAtCompany: "Years at Company",
  YearsInCurrentRole: "Years in Current Role",
  YearsSinceLastPromotion: "Years Since Last Promotion",
  YearsWithCurrManager: "Years With Current Manager"
};

const getMinValue = (key) => {
  const mins = {
    Age: 18,
    DailyRate: 0,
    DistanceFromHome: 0,
    Education: 1,
    EnvironmentSatisfaction: 1,
    JobLevel: 1,
    MonthlyIncome: 0,
    NumCompaniesWorked: 0,
    PercentSalaryHike: 0,
    TotalWorkingYears: 0,
    YearsAtCompany: 0,
    YearsInCurrentRole: 0,
    YearsSinceLastPromotion: 0,
    YearsWithCurrManager: 0
  };
  return mins[key] ?? 0;
};

const getMaxValue = (key) => {
  const maxs = {
    Age: 65,
    DailyRate: 1500,
    DistanceFromHome: 100,
    Education: 5,
    EnvironmentSatisfaction: 4,
    JobLevel: 5,
    MonthlyIncome: 20000,
    NumCompaniesWorked: 15,
    PercentSalaryHike: 100,
    TotalWorkingYears: 40,
    YearsAtCompany: 40,
    YearsInCurrentRole: 30,
    YearsSinceLastPromotion: 15,
    YearsWithCurrManager: 30
  };
  return maxs[key] ?? 100;
};

function App() {
  const [form, setForm] = useState({
    Age: 35,
    DailyRate: 1100,
    DistanceFromHome: 10,
    Education: 3,
    EnvironmentSatisfaction: 4,
    Gender: "Male",
    JobLevel: 2,
    JobRole: "Research Scientist",
    MaritalStatus: "Single",
    MonthlyIncome: 4000,
    NumCompaniesWorked: 2,
    OverTime: "Yes",
    PercentSalaryHike: 12,
    TotalWorkingYears: 10,
    YearsAtCompany: 5,
    YearsInCurrentRole: 3,
    YearsSinceLastPromotion: 1,
    YearsWithCurrManager: 2,
    BusinessTravel: "Travel_Rarely",
    Department: "Research & Development",
    EducationField: "Life Sciences"
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setResult(data["Attrition Prediction"] || data["error"]);
    } catch (err) {
      setResult("Error connecting to backend.");
    }
  };

  const renderFields = (keys) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
      {keys.map((key) => (
        <div key={key} style={{ flex: '1 1 45%' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
            {fieldLabels[key] || key}
          </label>
          {getDropdownOptions(key).length > 0 ? (
            <select
              name={key}
              value={form[key]}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            >
              {getDropdownOptions(key).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              name={key}
              value={form[key]}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
              min={getMinValue(key)}
              max={getMaxValue(key)}
              step="1"
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto', fontFamily: 'Arial' }}>
      <h2>Attrition Prediction</h2>

      <h3>🧍 Personal Info</h3>
      {renderFields(["Age", "Gender", "MaritalStatus", "Education", "EducationField"])}

      <h3>💼 Job Info</h3>
      {renderFields(["JobLevel", "JobRole", "Department", "BusinessTravel", "OverTime"])}

      <h3>💰 Income & Performance</h3>
      {renderFields(["MonthlyIncome", "DailyRate", "PercentSalaryHike", "EnvironmentSatisfaction"])}

      <h3>📈 Experience & History</h3>
      {renderFields([
        "TotalWorkingYears", "NumCompaniesWorked", "DistanceFromHome",
        "YearsAtCompany", "YearsInCurrentRole", "YearsSinceLastPromotion", "YearsWithCurrManager"
      ])}

      <button
        onClick={handleSubmit}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Predict
      </button>

      {result && (
        <div style={{ marginTop: '24px', fontSize: '18px', fontWeight: 'bold', color: result === "Yes" ? "red" : "green" }}>
          Prediction: {result === "Yes" ? "The employee will leave" : "The employee will stay"}
        </div>
      )}
    </div>
  );
}

export default App;
