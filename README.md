
# 🌱 FarmAI Diversify – Smart Crop Diversification Advisor  

This is our **AI-powered platform** that helps farmers with **smart crop diversification strategies**.  
It is designed to be **farmer-friendly, scalable, and bilingual (English & Hindi)**.  

---

## 🔗 Demo / Presentation  
👉 [Demo Video](https://drive.google.com/file/d/1hDVCdpgQGv7_CIusTN8kHLwOAL9gM3WH/view?usp=drive_link)  

 
—
## 📊 Datasets Used  
1. [Crop recommendation dataset - kaggle](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset)  
2. [Indian Crop Production & Prices Dataset](https://www.kaggle.com/search?q=Indian+Crop+Production+%26+Prices+date%3A90)  
3. [Agmarknet API (market prices)  ](https://www.kaggle.com/datasets/ishankat/daily-wholesale-commodity-prices-india-mandis)  
---

## 🌐 APIs Used  
- **OpenWeather API** → [https://openweathermap.org/api](https://openweathermap.org/api)  
- **Hugging Face (Translation)** → [Helsinki-NLP/opus-mt-en-hi](https://huggingface.co/Helsinki-NLP/opus-mt-en-hi)  

---


## 📌 Features  
- Smart crop recommendations (soil, rainfall, and demand-based)  
- Expected yield & market value prediction  
- Rainfall forecasting with climate fit  
- Risk factor (Low/Medium/High)  
- Multi-language support (English & Hindi)  
- Simple and mobile-friendly UI  

---

## 🛠️ Tech Stack  
- **Frontend:** React + TailwindCSS  
- **Backend:** Flask (Python APIs), Node.js + Express.js  
- **ML Models:** Scikit-learn, Prophet, LightGBM, TensorFlow  
- **Database:** SQLite  
- **APIs:** OpenWeatherMap, EmailJS, Hugging Face  

---


## 📂 Project Structure  
```plaintext
FarmAI-Diversify/
│── frontend/              # React + Tailwind code
│── backend/               # Node.js + Express.js
│── ml-models/             # Python ML Models (Flask APIs)
│── datasets/              # CSV files (soil, rainfall, market prices)
│── README.md

```

⚡ How to Run Locally
Clone the repository:
```bash
git clone https://github.com/YourUsername/FarmAI-Diversify.git
```
  2. Navigate into the project:
```bash
cd FarmAI-Diversify
```
3. Run the Frontend (React):
```bash

cd frontend
npm install
npm start
```
4. Run the Backend (Node.js + Express):
```bash
cd backend
npm install
node app.js
```

5. Run the ML Services (Flask):
```bash
cd ml-models
pip install -r requirements.txt
python recommend.py
python forecast.py
```
👨‍💻 Authors
###  The API Avengers
