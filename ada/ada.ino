#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <Adafruit_MLX90614.h>
#include <AdafruitIO_WiFi.h>
#include <AdafruitIO.h>

// --------------------- Adafruit IO Configuration ---------------------
#define IO_USERNAME "HoangChien"
#define IO_KEY "aio_xmJD94vuqjLCZRJLZmFw70N0l9zT"

#define WIFI_SSID "Loan"
#define WIFI_PASS "1122/23/6"

AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);

// --------------------- Feed Configuration ---------------------
AdafruitIO_Feed *powerControl = io.feed("nutnhan1");   // Nút 1: Bật/tắt ESP32
AdafruitIO_Feed *sensorControl = io.feed("nutnhan2"); // Nút 2: Bật/tắt cảm biến MLX90614
AdafruitIO_Feed *sensorSwitch = io.feed("nutnhan3");  // Nút 3: Chuyển đổi cảm biến

// --------------------- MAX30100 Configuration ---------------------
#define REPORTING_PERIOD_MS 1000
PulseOximeter pox;
uint32_t tsLastReport = 0;

// --------------------- MLX90614 Configuration ---------------------
Adafruit_MLX90614 mlx = Adafruit_MLX90614();

// --------------------- LED Pin ---------------------
#define LED_PIN 2 // LED onboard
bool isESP32On = false;   // Trạng thái ESP32
bool isMLXOn = false;     // Trạng thái cảm biến MLX90614
bool isUsingMLX = true;   // Trạng thái chuyển đổi cảm biến (true: MLX90614, false: MAX30100)

// --------------------- Callback Functions ---------------------
void onBeatDetected() {
    if (isESP32On && !isUsingMLX) {
        Serial.println("Beat detected!");
    }
}

void handlePowerControl(AdafruitIO_Data *data) {
    isESP32On = data->toPinLevel();
    Serial.print("ESP32 Power: ");
    Serial.println(isESP32On ? "ON" : "OFF");

    if (!isESP32On) {
        isMLXOn = false; // Tắt cảm biến khi ESP32 tắt
        sensorControl->save(0);
    }
}

void handleSensorControl(AdafruitIO_Data *data) {
    if (isESP32On && isUsingMLX) {
        isMLXOn = data->toPinLevel();
        Serial.print("MLX90614: ");
        Serial.println(isMLXOn ? "ON" : "OFF");
    } else {
        Serial.println("MLX90614 Control ignored.");
    }
}

void handleSwitchSensor(AdafruitIO_Data *data) {
    isUsingMLX = data->toPinLevel();
    Serial.print("Using Sensor: ");
    Serial.println(isUsingMLX ? "MLX90614" : "MAX30100");

    if (isUsingMLX) {
        isMLXOn = true;
    } else {
        isMLXOn = false;
    }
}

// --------------------- Setup Function ---------------------
void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);

    // --------------------- Adafruit IO Setup ---------------------
    Serial.print("Connecting to Adafruit IO...");
    io.connect();
    while (io.status() < AIO_CONNECTED) {
        Serial.print(".");
        delay(1000);
    }
    Serial.println("\nConnected to Adafruit IO!");

    powerControl->onMessage(handlePowerControl);
    sensorControl->onMessage(handleSensorControl);
    sensorSwitch->onMessage(handleSwitchSensor);

    // --------------------- MAX30100 Setup ---------------------
    Serial.print("Initializing MAX30100...");
    if (!pox.begin()) {
        Serial.println("FAILED");
    } else {
        Serial.println("SUCCESS");
    }
    pox.setOnBeatDetectedCallback(onBeatDetected);

    // --------------------- MLX90614 Setup ---------------------
    Serial.print("Initializing MLX90614...");
    if (!mlx.begin()) {
        Serial.println("FAILED");
        while (1); // Dừng nếu không kết nối được cảm biến
    }
    Serial.println("SUCCESS");
}

// --------------------- Loop Function ---------------------
void loop() {
    io.run(); // Duy trì kết nối Adafruit IO

    if (isESP32On) {
        if (isUsingMLX && isMLXOn) {
            // Đọc và hiển thị nhiệt độ từ MLX90614
            float ambientTemp = mlx.readAmbientTempC();
            float objectTemp = mlx.readObjectTempC();

            Serial.print("MLX90614 - Ambient Temp: ");
            Serial.print(ambientTemp);
            Serial.print(" °C\tObject Temp: ");
            Serial.println(objectTemp);

            // Cập nhật dữ liệu lên Adafruit IO
            sensorControl->save(ambientTemp);
            sensorControl->save(objectTemp);

        } else if (!isUsingMLX) {
            // Đọc và hiển thị nhịp tim, SpO2 từ MAX30100
            pox.update();
            if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
                Serial.print("MAX30100 - Heart rate: ");
                Serial.print(pox.getHeartRate());
                Serial.print(" bpm / SpO2: ");
                Serial.println(pox.getSpO2());

                // Cập nhật dữ liệu lên Adafruit IO
                sensorControl->save(pox.getHeartRate());
                sensorControl->save(pox.getSpO2());

                tsLastReport = millis();
            }
        }
    } else {
        digitalWrite(LED_PIN, LOW); // Tắt LED khi ESP32 tắt
    }
}
