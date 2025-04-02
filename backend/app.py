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

# Load column names used during training
with open("models/columns.txt", "r") as f:
    trained_columns = [line.strip() for line in f]

@app.route("/")
def home():
    return "Attrition Prediction API with preprocessing is running!"

@app.route("/predict", methods=["POST"])
def predict():
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
        
        return jsonify({"Attrition Prediction": result, "Probability": round(proba, 3)})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)











