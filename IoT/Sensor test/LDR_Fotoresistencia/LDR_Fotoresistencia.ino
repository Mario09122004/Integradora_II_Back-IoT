#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <FS.h>
#include <SPIFFS.h>
#include <WebServer.h>

const int ldrPin = A0;
const int ledPin = 8;
const char* deviceId = "esp32c3_001";

const char* serverUrl = "http://example.com/data";

// Variables para WiFi
String ssid;
String password;

// Servidor Web en modo AP
WebServer server(80);

void startAPMode();
void handleRoot();
void handleSave();
void loadWiFiCredentials();
void saveWiFiCredentials(const String& ssid, const String& pass);

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);

  // Monta SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("Error al montar SPIFFS");
    return;
  }

  // Cargar credenciales desde JSON
  loadWiFiCredentials();

  // Intentar conectar
  WiFi.begin(ssid.c_str(), password.c_str());
  Serial.print("Conectando a WiFi");
  unsigned long startAttemptTime = millis();

  // Esperar máximo 10 segundos
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    Serial.print(".");
    delay(500);
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nNo se pudo conectar. Activando Access Point...");
    startAPMode();
  } else {
    Serial.println("\nConectado a WiFi!");
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    int ldrValue = analogRead(ldrPin);

    // Crear JSON
    StaticJsonDocument<200> doc;
    doc["id"] = deviceId;
    doc["ldr"] = ldrValue;

    String output;
    serializeJson(doc, output);

    Serial.println("JSON generado:");
    Serial.println(output);

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(output);
    Serial.print("HTTP Code: ");
    Serial.println(httpCode);
    http.end();
  } else {
    server.handleClient();  // Solo si está en modo AP
  }

  digitalWrite(ledPin, HIGH);
  delay(100);
  digitalWrite(ledPin, LOW);
  delay(1000);
}

void loadWiFiCredentials() {
  File file = SPIFFS.open("/wifi.json", "r");
  if (!file) {
    Serial.println("No se encontró archivo wifi.json");
    ssid = "";
    password = "";
    return;
  }

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, file);
  if (error) {
    Serial.println("Error al parsear wifi.json");
    return;
  }

  ssid = doc["ssid"].as<String>();
  password = doc["password"].as<String>();

  Serial.println("Credenciales WiFi cargadas:");
  Serial.println("SSID: " + ssid);
  file.close();
}

void saveWiFiCredentials(const String& ssid, const String& pass) {
  StaticJsonDocument<256> doc;
  doc["ssid"] = ssid;
  doc["password"] = pass;

  File file = SPIFFS.open("/wifi.json", "w");
  if (!file) {
    Serial.println("No se pudo abrir wifi.json para escribir");
    return;
  }

  serializeJson(doc, file);
  file.close();
  Serial.println("Credenciales guardadas, reiniciando...");
  delay(1000);
  ESP.restart();
}

void startAPMode() {
  WiFi.softAP("ESP32_Config");

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP: ");
  Serial.println(IP);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/save", HTTP_POST, handleSave);
  server.begin();
}

void handleRoot() {
  String html = R"rawliteral(
    <html><body>
      <h2>Configurar WiFi</h2>
      <form action="/save" method="post">
        SSID: <input name="ssid"><br>
        Password: <input name="password" type="password"><br>
        <input type="submit" value="Guardar">
      </form>
    </body></html>
  )rawliteral";
  server.send(200, "text/html", html);
}

void handleSave() {
  String newSsid = server.arg("ssid");
  String newPass = server.arg("password");

  if (newSsid.length() > 0 && newPass.length() > 0) {
    saveWiFiCredentials(newSsid, newPass);
  } else {
    server.send(400, "text/plain", "Datos inválidos");
  }
}
