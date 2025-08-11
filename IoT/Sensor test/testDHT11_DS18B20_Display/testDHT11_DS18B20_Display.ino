#include <OneWire.h>
#include <DallasTemperature.h>
#include "SevSeg.h"
#include <DHT.h>

// =================== SENSOR DS18B20 ===================
OneWire ourWire(32);                 // Pin de datos DS18B20
DallasTemperature sensors(&ourWire); // Objeto para DS18B20

// =================== SENSOR DHT11 =====================
#define DHTPIN 33         // Pin digital para DHT11
#define DHTTYPE DHT11     // Tipo de sensor
DHT dht(DHTPIN, DHTTYPE); // Objeto del DHT11

// =================== DISPLAY 7 SEGMENTOS ==============
SevSeg sevseg;

// ========== VARIABLES GLOBALES COMPARTIDAS ============
volatile float temperatura = 0.0;       // Temp DS18B20
volatile float temperaturaDHT = 0.0;    // Temp DHT11
volatile float humedadDHT = 0.0;        // Humedad DHT11
float temperatureDisplay = 0.0;

// ========== TAREA: SENSOR DS18B20 + DHT11 (Núcleo 0) ==========
void leerSensores(void *parameter) {
  while (true) {
    // DS18B20
    sensors.requestTemperatures();
    temperatura = sensors.getTempCByIndex(0);
    temperatureDisplay = temperatura * 100; // Para mostrar con 2 decimales

    // DHT11
    temperaturaDHT = dht.readTemperature();
    humedadDHT = dht.readHumidity();

    // Mostrar en Serial
    Serial.print("Temp DS18B20: ");
    Serial.print(temperatura);
    Serial.print(" C | Temp DHT11: ");
    Serial.print(temperaturaDHT);
    Serial.print(" C | Humedad: ");
    Serial.print(humedadDHT);
    Serial.println(" %");

    vTaskDelay(1000 / portTICK_PERIOD_MS); // Espera 1 segundo
  }
}

// ========== TAREA: ACTUALIZAR DISPLAY (Núcleo 1) ==========
void actualizarDisplay(void *parameter) {
  while (true) {
    sevseg.setNumber(temperatureDisplay, 2); // Mostrar con 2 decimales
    sevseg.refreshDisplay();
    vTaskDelay(1 / portTICK_PERIOD_MS); // Refrescado rápido
  }
}

// =================== SETUP ===================
void setup() {
  delay(1000);
  Serial.begin(9600);

  // Iniciar sensores
  sensors.begin();
  dht.begin();

  // Configuración del display
  byte numDigits = 4;
  byte digitPins[] = {23, 22, 21, 19};
  byte segmentPins[] = {18, 5, 17, 16, 4, 2, 15, 13};

  bool resistorsOnSegments = true;
  byte hardwareConfig = COMMON_CATHODE;
  bool updateWithDelays = true;

  sevseg.begin(hardwareConfig, numDigits, digitPins, segmentPins, resistorsOnSegments);
  sevseg.setBrightness(90);

  // Crear tareas
  xTaskCreatePinnedToCore(leerSensores, "LeerSensores", 4096, NULL, 1, NULL, 0); // Núcleo 0
  xTaskCreatePinnedToCore(actualizarDisplay, "Display", 2048, NULL, 1, NULL, 1); // Núcleo 1
}

void loop() {
  // No se usa
}