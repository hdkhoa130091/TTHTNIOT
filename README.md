# 🏥 IoT Cloud-Based Health Monitoring System

A real-time health monitoring solution designed to acquire vital signs using embedded sensors, synchronize data to the cloud via **Firebase**, and visualize metrics on a responsive web dashboard.

---
## Demo
![532185982078437920-ezgif com-video-to-gif-converter (2)](https://github.com/user-attachments/assets/bd21e8f4-5042-4314-a74b-d0ffd9057e4f)
![ScreencastFrom2026-03-2014-17-39-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/6b4ad152-0c0e-4762-8270-32d037e86576)
![ScreencastFrom2026-03-2014-14-39-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/e41b91e0-2577-4701-a85b-43b45c117e98)

---

## Key Features
* **Non-invasive Biometric Sensing:** High-precision data acquisition for Body Temperature, Heart Rate, and $SpO_2$ using **MAX30100** and **MLX90614** sensors.
* **I2C Protocol Optimization:** Managed bus timing and data registers to ensure stable and accurate sensor communication.
* **Real-time Cloud Synchronization:** Instant data streaming to **Firebase Realtime Database** for global accessibility.
* **Live Web Visualization:** A responsive dashboard providing instant health updates and historical data tracking.

---

## System Architecture
1. **Hardware Layer:** **ESP32** microcontroller interfaces with medical sensors via the **I2C protocol** to collect biometric data.
2. **Cloud Layer:** **Firebase** serves as the backend infrastructure for real-time data persistence and user management.
3. **Application Layer:** A web-based interface (**HTML/CSS/JS**) retrieves and displays live health metrics from the cloud.

---

## Tech Stack

| Component | Technology / Tools |
| :--- | :--- |
| **Microcontroller** | **ESP32** (Wi-Fi enabled) |
| **Sensors** | **MAX30100** (Pulse/Oximeter), **MLX90614** (Contactless IR Temp) |
| **Backend** | **Firebase** (Realtime DB & Auth) |
| **Frontend** | **Web Dashboard** (HTML5, CSS3, JavaScript) |
| **Protocols** | **I2C** (Inter-Integrated Circuit), HTTP/WebSockets |

---
