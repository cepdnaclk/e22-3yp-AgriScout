# AgriScout – AI-Powered Autonomous Robot for Plant and Soil Health Monitoring

## 📌 Project Overview

**AgriScout** is an AI-powered autonomous agricultural robot designed to move through a greenhouse or agricultural field and monitor individual plants[cite: 1]. The system collects soil and plant-related data using different sensors and a camera, stores the collected data in a cloud database, and analyzes it using Artificial Intelligence and Machine Learning techniques[cite: 1]. 

---

## 🎯 Problem Statement

Traditionally, farmers have to manually inspect plants and measure soil conditions[cite: 1]. This manual monitoring leads to several challenges:

- The manual inspection process can be time-consuming[cite: 1].
- It may not provide continuous or accurate information regarding soil conditions, plant health, moisture levels, and diseases[cite: 1].

AgriScout addresses these challenges by replacing manual monitoring with an autonomous robotic system that detects plant problems early and sends results to a cloud-based web platform[cite: 2].

---

## 🚀 System Workflow & Core Features

### 🔹 Autonomous Navigation & Data Collection
- **Robot Navigation:** The robot autonomously moves between plants and detects obstacles[cite: 2].
- **Plant Inspection:** The robot stops near each plant for inspection[cite: 1].
- **Automatic Probe Control:** A servo motor or robotic mechanism automatically inserts and removes the soil sensor probe[cite: 2].
- **Soil Measurement:** The system measures Nitrogen (N), Phosphorus (P), Potassium (K), soil moisture, soil pH, and soil temperature[cite: 1].
- **Image Capture:** A camera mounted on the robot captures images of the plants and leaves[cite: 1].

### 🔹 AI Analysis & Machine Learning
- **Disease & Damage Detection:** Captured images are analyzed using an AI model to identify possible plant diseases, nutrient deficiencies, leaf damage, or unhealthy plant conditions[cite: 1].
- **Plant Classification:** The AI system classifies plants into conditions such as healthy, possible disease, possible nutrient deficiency, low moisture, and pest or leaf damage[cite: 1].
- **Holistic Assessment:** By combining sensor measurements with camera images, the system provides a more complete assessment of plant health[cite: 1].

### 🔹 Cloud Integration & Web Dashboard
- **Data Storage:** The robot transmits sensor readings, images, and AI results to a cloud platform through Wi-Fi or another communication method[cite: 1]. Each plant has its own digital record containing this data[cite: 1].
- **Web Dashboard:** A web-based dashboard allows farmers or agricultural professionals to monitor the field remotely[cite: 1]. 
- **Monitoring Metrics:** The dashboard displays plant health status, NPK levels, soil moisture, pH, temperature, plant images, detected diseases, historical plant data, and highlights plants requiring attention[cite: 1].
- **Alert System:** The system notifies users when abnormal conditions are detected[cite: 2].

**Main System Workflow:**
Robot Navigation → Plant Detection → Soil Measurement → Image Capture → AI Analysis → Cloud Storage → Web Dashboard → Farmer Notification[cite: 2].

---

## 🏗️ Hardware Architecture

The physical robot integrates the following main hardware components:
- Raspberry Pi or similar single-board computer[cite: 2]
- ESP32 microcontroller[cite: 2]
- DC geared motors and motor driver[cite: 2]
- Wheel encoders[cite: 2]
- Ultrasonic sensors or LiDAR[cite: 2]
- Camera module[cite: 2]
- NPK sensor, soil moisture sensor, pH sensor, and temperature and humidity sensor[cite: 2]
- Servo motor/robotic mechanism for inserting the soil probe[cite: 2]
- Rechargeable battery[cite: 2]
- Wi-Fi/4G communication modules[cite: 2]

---

## ⚙️ System Requirements

### Functional Requirements
- **Autonomous Navigation:** Robot moves between plants and detects obstacles[cite: 2].
- **Soil Monitoring:** Measures NPK, moisture, pH, and temperature[cite: 2].
- **Automatic Probe Control:** Inserts and removes the soil sensor probe automatically[cite: 2].
- **Image Capture:** Captures plant and leaf images using a camera[cite: 2].
- **AI Plant Analysis:** Detects plant diseases, damage, or unhealthy conditions[cite: 2].
- **Data Storage:** Stores sensor readings, images, and AI results in a cloud database[cite: 2].
- **Web Dashboard:** Displays current and historical plant information[cite: 2].
- **Alert System:** Notifies users when abnormal conditions are detected[cite: 2].

### Non-Functional Requirements
- **Accuracy:** Sensors and AI should provide sufficiently accurate results[cite: 2].
- **Reliability:** The robot should operate consistently without frequent failures[cite: 2].
- **Performance:** Data collection and analysis should be completed within a reasonable time[cite: 2].
- **Usability:** The web dashboard should be simple and easy to understand[cite: 2].
- **Security:** User accounts and collected data should be protected[cite: 2].
- **Safety:** The robot should detect obstacles and avoid collisions[cite: 2].
- **Maintainability:** Hardware and software components should be easy to update or replace[cite: 2].
- **Power Efficiency:** The robot should efficiently use battery power during operation[cite: 2].

---

## 📚 System Documentation

- 📄 **Project Proposal:** Group11_Proposal.pdf
  - *Contains the complete initial project outline, including system architecture, expected outcomes, and technical specifications.*
