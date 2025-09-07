// src/widget/bridge.ts
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

// If you set up an App Group on iOS, put it here:
export const APP_GROUP_ID = "group.com.yourdomain.countdowns";

// ---- WRITE SHARED DATA ----
// For now, we write a JSON blob the widgets can read.
// iOS widgets ultimately need App Group storage; this file write
// is a good default and keeps your app logic stable.
export async function writeShared(events: unknown) {
  const json = JSON.stringify(events);
  try {
    if (Platform.OS === "ios") {
      // TODO (when App Group is wired): write to UserDefaults(suiteName: APP_GROUP_ID)
      // via a tiny native module, then remove this file write.
      const path = FileSystem.documentDirectory + "countdowns.json";
      await FileSystem.writeAsStringAsync(path, json);
      return path;
    } else {
      // ANDROID: keep a copy the widget code can read (e.g., from SharedPreferences or file)
      const path = FileSystem.documentDirectory + "countdowns.json";
      await FileSystem.writeAsStringAsync(path, json);
      return path;
    }
  } catch (e) {
    console.warn("writeShared failed", e);
    throw e;
  }
}

// ---- RELOAD WIDGETS ----
// iOS: WidgetKit.reloadAllTimelines()
// Android: trigger your AppWidget/Glance update
export async function reloadWidgets() {
  try {
    if (Platform.OS === "ios") {
      // If you installed `react-native-widgetkit`:
      // const { WidgetKit } = require('react-native-widgetkit')
      // await WidgetKit.reloadAllTimelines()
      // Temporary no-op until you add the lib:
      return;
    } else {
      // If you installed `react-native-android-widget` (or Glance wrapper),
      // call its update method here, e.g.:
      // const AndroidWidget = require('react-native-android-widget').default
      // await AndroidWidget.updateAll()  // method name may differ per lib
      return;
    }
  } catch (e) {
    console.warn("reloadWidgets failed", e);
  }
}
