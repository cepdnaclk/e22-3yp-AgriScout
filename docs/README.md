---
layout: home
permalink: index.html
repository-name: e22-3yp-AgriScout
title: "AgriScout - An AI-Powered Autonomous Robot for Plant and Soil Health Monitoring"
---

# AgriScout: An AI-Powered Autonomous Robot for Plant and Soil Health Monitoring

## Team

- E/22/124 — R.G. Gunawardana — [e22124@eng.pdn.ac.lk](mailto:e22124@eng.pdn.ac.lk)
- E/22/443 — W.M.E.N. Wijesinghe — [e22443@eng.pdn.ac.lk](mailto:e22443@eng.pdn.ac.lk)
- E/22/366 — M.D.S. Senanayake — [e22366@eng.pdn.ac.lk](mailto:e22366@eng.pdn.ac.lk)
- E/22/232 — D.F.A.T.D. Mathangadeera — [e22232@eng.pdn.ac.lk](mailto:e22232@eng.pdn.ac.lk)

<!-- Add a photo of your final robot here -->
<!-- ![AgriScout Robot](./images/agri-scout.png) -->

---

## Table of Contents

1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture)
3. [Hardware and Software Designs](#hardware-and-software-designs)
4. [Testing](#testing)
5. [Detailed Budget](#detailed-budget)
6. [Conclusion](#conclusion)
7. [Links](#links)

---

## Introduction

Agriculture requires continuous monitoring of soil conditions, plant health, moisture levels, and diseases. Traditional manual inspection can be time-consuming and may not provide continuous information about individual plants.

**AgriScout** is an AI-powered autonomous agricultural robot designed to monitor plant health and soil conditions in greenhouses and agricultural fields. The system aims to reduce manual monitoring and help farmers identify potential plant health problems at an early stage.

The robot will navigate between plants, detect obstacles, and stop near individual plants for inspection. Soil sensors will collect measurements such as nitrogen, phosphorus, potassium (NPK), soil moisture, pH, and temperature. A camera will capture plant images for analysis using Artificial Intelligence (AI) and Machine Learning (ML).

The collected information will be stored in a cloud database and displayed through a web-based dashboard. Farmers will be able to monitor plant conditions, view soil measurements, review analysis results, and identify plants that require attention.

Our objective is to develop an intelligent and practical agricultural monitoring solution by integrating robotics, embedded systems, AI, and cloud technologies.

## Solution Architecture

AgriScout consists of an autonomous mobile robot, soil sensors, a camera-based plant monitoring system, AI analysis, cloud storage, and a web dashboard.

### System Workflow

1. **Autonomous Navigation:** The robot moves between plants and detects obstacles.
2. **Plant Inspection:** The robot stops near an individual plant.
3. **Soil Measurement:** Sensors collect soil nutrient and condition measurements.
4. **Image Capture:** The camera captures plant and leaf images.
5. **AI Analysis:** The system analyzes images and sensor readings to identify possible diseases, nutrient deficiencies, and other unhealthy conditions.
6. **Cloud Storage:** Sensor readings, images, and analysis results are transmitted to a cloud database.
7. **Web Dashboard:** Farmers view plant health information, soil measurements, and historical records.
8. **Notifications:** Alerts identify plants that may require attention.

### System Workflow Diagram

Robot Navigation → Plant Detection → Soil Measurement → Image Capture → AI Analysis → Cloud Storage → Web Dashboard → Farmer Notification

<!-- Add your system architecture diagram here -->
<!-- ![System Architecture](./images/system-architecture.png) -->

## Hardware and Software Designs

### Hardware Design

The proposed hardware components include:

- Raspberry Pi as the main computing unit
- ESP32 microcontroller for sensor communication and hardware control
- DC geared motors and a motor driver
- Wheel encoders for movement measurement
- Ultrasonic sensors or LiDAR for obstacle detection
- Camera module for plant image capture
- NPK soil sensor
- Soil moisture sensor
- Soil pH sensor
- Soil temperature sensor
- Servo motor or robotic mechanism for automatic soil probing
- Rechargeable battery
- Wi-Fi communication

### Software Design

The software system will integrate robot control, sensor data collection, image processing, AI analysis, cloud communication, and web-based monitoring.

The main software components include:

- **Robot Navigation:** Controls robot movement and obstacle avoidance.
- **Sensor Data Collection:** Collects and organizes soil measurements.
- **Computer Vision:** Captures and processes plant images.
- **AI and Machine Learning:** Identifies possible plant diseases, nutrient deficiencies, and unhealthy conditions.
- **Cloud Database:** Stores plant measurements, images, and historical records.
- **Web Dashboard:** Displays plant health information and monitoring results.
- **Alert System:** Notifies users about abnormal conditions.

The initial prototype will be developed and tested in a controlled greenhouse environment, with the possibility of future expansion to larger agricultural fields.

## Testing

Testing will evaluate the performance, accuracy, and reliability of the AgriScout prototype.

### Hardware Testing

- Test motor operation and robot movement.
- Evaluate obstacle detection.
- Verify soil sensor readings.
- Test the automatic soil probe insertion and removal mechanism.
- Check camera operation and image capture.
- Evaluate battery performance during operation.

### Software Testing

- Test autonomous navigation and obstacle avoidance.
- Verify sensor data collection and transmission.
- Evaluate plant image processing and AI predictions.
- Test cloud data storage and retrieval.
- Verify the web dashboard and alert system.
- Test communication between the Raspberry Pi and ESP32.

### System Integration Testing

The complete system will be tested in a controlled greenhouse environment. Navigation, plant inspection, soil data collection, image analysis, and remote monitoring will be evaluated.

Detailed test results and performance measurements will be added after implementation and testing.

## Detailed Budget

The following table will be updated with the actual components, quantities, and prices used in the project.

| Item | Quantity | Unit Cost | Total |
|---|:---:|---:|---:|
| Raspberry Pi | 1 | To be updated | To be updated |
| ESP32 development board | 1 | To be updated | To be updated |
| DC geared motors | TBD | To be updated | To be updated |
| Motor driver | TBD | To be updated | To be updated |
| Wheel encoders | TBD | To be updated | To be updated |
| Ultrasonic sensors or LiDAR | TBD | To be updated | To be updated |
| Camera module | 1 | To be updated | To be updated |
| NPK sensor | 1 | To be updated | To be updated |
| Soil moisture sensor | 1 | To be updated | To be updated |
| Soil pH sensor | 1 | To be updated | To be updated |
| Soil temperature sensor | 1 | To be updated | To be updated |
| Servo motor and probing mechanism | TBD | To be updated | To be updated |
| Rechargeable battery | 1 | To be updated | To be updated |
| Chassis and other components | TBD | To be updated | To be updated |

**Note:** The final budget will be calculated using the actual quantities and prices of the selected components.

## Conclusion

AgriScout aims to improve agricultural monitoring by combining autonomous robotics, soil sensors, computer vision, artificial intelligence, and cloud-based technologies.

The proposed system will help farmers monitor individual plants, collect soil information, and identify potential plant health problems more efficiently. The initial prototype will focus on greenhouse monitoring.

Future developments may include improved navigation, more accurate AI models, predictive analytics, additional sensors, and support for larger agricultural fields.

Our long-term goal is to develop a reliable and practical agricultural robot that can be adapted to different greenhouses and help farmers make better decisions through automated monitoring and data-driven insights.

## Links

- [Project Repository](https://github.com/cepdnaclk/e22-3yp-AgriScout){:target="_blank"}
- [Project Website](https://cepdnaclk.github.io/e22-3yp-AgriScout/){:target="_blank"}
- [Project Proposal (PDF)](https://github.com/cepdnaclk/e22-3yp-AgriScout/blob/main/docs/Group11_Proposal.pdf){:target="_blank"}
- [Department of Computer Engineering](https://www.ce.pdn.ac.lk/){:target="_blank"}
- [University of Peradeniya](https://eng.pdn.ac.lk/){:target="_blank"}
