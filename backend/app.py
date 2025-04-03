import pandas as pd
from flask import Flask, request, jsonify
import mlflow
import mlflow.sklearn
import os
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS


app = Flask(__name__)

CORS(app)

scaler = StandardScaler()

trained_columns = [
    "Age", "DailyRate", "DistanceFromHome", "Education", "EnvironmentSatisfaction",
    "HourlyRate", "JobInvolvement", "JobLevel", "JobSatisfaction", "MonthlyIncome",
    "MonthlyRate", "NumCompaniesWorked", "PercentSalaryHike", "PerformanceRating",
    "RelationshipSatisfaction", "StockOptionLevel", "TotalWorkingYears",
    "TrainingTimesLastYear", "WorkLifeBalance", "YearsAtCompany",
    "YearsInCurrentRole", "YearsSinceLastPromotion", "YearsWithCurrManager",
    "BusinessTravel_Travel_Frequently", "BusinessTravel_Travel_Rarely",
    "Department_Research & Development", "Department_Sales",
    "EducationField_Life Sciences", "EducationField_Marketing",
    "EducationField_Medical", "EducationField_Other", "EducationField_Technical Degree",
    "Gender_Male", "JobRole_Human Resources", "JobRole_Laboratory Technician",
    "JobRole_Manager", "JobRole_Manufacturing Director", "JobRole_Research Director",
    "JobRole_Research Scientist", "JobRole_Sales Executive", "JobRole_Sales Representative",
    "MaritalStatus_Married", "MaritalStatus_Single", "OverTime_Yes"
]

# Columns that were scaled
numeric_cols = [
    'Age', 'DailyRate', 'DistanceFromHome', 'Education',
    'EnvironmentSatisfaction', 'JobLevel', 'MonthlyIncome', 'NumCompaniesWorked',
    'PercentSalaryHike', 'TotalWorkingYears', 'YearsAtCompany', 'YearsInCurrentRole',
    'YearsSinceLastPromotion', 'YearsWithCurrManager'
]

# Configure MLflow to use DagsHub
model= mlflow.set_tracking_uri("https://dagshub.com/ghidayaghi/HR_Employee_Attrition.mlflow")  

model = mlflow.sklearn.load_model("models:/Attrition_LogisticRegression/1")  

@app.route("/")
def home():
    return "Attrition Prediction API with preprocessing is running!"

@app.route("/predict", methods=["POST"])
def predict():
    print("[Debug] Received request for prediction")
    try:
        data = request.get_json()
        new_data = pd.DataFrame([data])
        new_data = pd.get_dummies(new_data)
        new_data = new_data.reindex(columns=trained_columns, fill_value=0)
        scaler.fit(new_data[numeric_cols])
        new_data[numeric_cols] = scaler.transform(new_data[numeric_cols])

        pred = model.predict(new_data)[0]
        proba = model.predict_proba(new_data)[0][1]
        
        result = "Yes" if pred == 1 else "No"
        print(f"[Debug] Prediction: {result}")

        return jsonify({"Attrition Prediction": result, "Probability": round(proba, 3)})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(host= "0.0.0.0", port=5000, debug=True)










