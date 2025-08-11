#include "SevSeg.h"
SevSeg sevseg;

void setup() {
  byte numDigits = 4;

  byte digitPins[] = {23, 22, 21, 19};   // Pines para controlar los dígitos
  byte segmentPins[] = {18, 5, 17, 16, 4, 2, 15, 13}; // a, b, c, d, e, f, g, dp

  bool resistorsOnSegments = true; // resistencias en los segmentos (no en los dígitos)
  byte hardwareConfig = COMMON_CATHODE;
  bool updateWithDelays = true;

  sevseg.begin(hardwareConfig, numDigits, digitPins, segmentPins, resistorsOnSegments);
  sevseg.setBrightness(90);
}

void loop() {
  sevseg.setNumber(5248, 2);
  sevseg.refreshDisplay();
}
