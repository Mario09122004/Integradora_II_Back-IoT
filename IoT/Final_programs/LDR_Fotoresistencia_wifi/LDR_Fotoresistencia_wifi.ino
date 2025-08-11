#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <FS.h>
#include <SPIFFS.h>
#include <WebServer.h>

const int ldrPin = A0;
const int ledPin = 8;
const char* deviceId = "lightControl_001";

const char* serverUrl = "http://vps-5127231-x.dattaweb.com:3500/ldr"; //Colocar la url del sevidor

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
    doc["pass"] = "2#_k.y*=Y,q2vg5gbYCG@LcQ,_)?V*UJ;QAmbU:f[e=GC3#wy$";

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
  delay(5000);
  digitalWrite(ledPin, LOW);
  delay(5000);
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
  WiFi.softAP(deviceId);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP: ");
  Serial.println(IP);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/save", HTTP_POST, handleSave);
  server.begin();
}

void handleRoot() {
  String html = R"rawliteral(
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Configuración WiFi</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', sans-serif;
          background: #fff;
          color: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        h1, h2 {
          color: red;
          margin-bottom: 1rem;
        }

        form {
          background: #000;
          color: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.4);
          width: 90%;
          max-width: 400px;
          box-sizing: border-box;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: #fff;
        }

        input {
          width: 91.5%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 2px solid red;
          border-radius: 6px;
          font-size: 1rem;
          background: #fff;
          color: #000;
        }

        input:focus {
          outline: none;
          border-color: #cc0000;
        }

        input[type="submit"] {
          background-color: red;
          width: 100%;
          color: white;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        input[type="submit"]:hover {
          background-color: #cc0000;
        }

        @media (max-width: 480px) {
          form {
            padding: 1.5rem;
          }

          h2 {
            font-size: 1.5rem;
          }

          input {
            font-size: 1rem;
          }
        }
      </style>
    </head>
    <body>
      <h2>Configurar WiFi</h2>
      <form action="/save" method="post">
        <label for="ssid">SSID:</label>
        <input name="ssid" id="ssid" placeholder="Nombre de red WiFi" required>
        <label for="password">Contraseña:</label>
        <input name="password" id="password" type="password" placeholder="Contraseña WiFi">
        <input type="submit" value="Guardar">
      </form>
    </body>
    </html>
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
