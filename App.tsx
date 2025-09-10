import { Platform, NativeModules } from "react-native";
import Constants from "expo-constants";

console.log({
  platform: Platform.OS,
  appOwnership: Constants.appOwnership, // 'expo' | 'guest' | 'standalone'
  expoSQLitePresent: !!NativeModules.ExpoSQLite,
});

import { useStore } from "./src/store";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { writeShared } from "@/widget/bridge";
import { useFonts } from "expo-font";
import DropDownPicker from "react-native-dropdown-picker";

export default function App() {
  // ---- Zustand selectors: always call hooks in the same order ----
  const hydrated = useStore((s) => s.hydrated);
  const hydrate = useStore((s) => s.hydrate);
  const events = useStore((s) => s.events);
  const addEvent = useStore((s) => s.addEvent);
  const removeEvent = useStore((s) => s.removeEvent);
  const diff = useStore((s) => s.diff);

  // Fonts hook (also a hook; must run before any early return)
  const [fontsLoaded] = useFonts({
    InterRegular: require("./assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
    BebasNeue: require("./assets/fonts/BebasNeue-Regular.ttf"),
    Script: require("./assets/fonts/Handlee-Regular.ttf"),
    Noto: require("./assets/fonts/NotoSerif-VariableFont_wdth,wght.ttf"),
    Parisienne: require("./assets/fonts/Parisienne-Regular.ttf"),
  });

  // Local state hooks — keep them before any early return too
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("InterRegular");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [items, setItems] = useState([
    { label: "Inter", value: "InterRegular", fontFamily: "InterRegular" },
    { label: "Bebas Neue", value: "BebasNeue", fontFamily: "BebasNeue" },
    { label: "Handlee", value: "Script", fontFamily: "Script" },
    { label: "Noto Serif", value: "Noto", fontFamily: "Noto" },
    { label: "Parisienne", value: "Parisienne", fontFamily: "Parisienne" },
  ]);
  const [date, setDate] = useState(new Date());
  const [unit, setUnit] = useState<"days" | "hours">("days");

  // Trigger hydrate in an effect (not during render)
  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  // Subscribe to just the events slice (avoid re-running for unrelated state)
  useEffect(() => {
    // push current state immediately
    writeShared(useStore.getState().events);

    // subscribe to all state; compare events to avoid extra writes
    const unsub = useStore.subscribe((state, prevState) => {
      if (state.events !== prevState?.events) {
        writeShared(state.events);
      }
    });

    return unsub;
  }, []);

  // Now it's safe to early-return AFTER every hook has run
  if (!hydrated || !fontsLoaded) return null;

  const currentStyles = styles(value);

  return (
    <SafeAreaView style={{ flex: 1, margin: 12, padding: 16, gap: 12 }}>
      <Text style={currentStyles.title}>Choose a Font</Text>

      <View style={currentStyles.pickerContainer}>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          style={currentStyles.picker}
          dropDownContainerStyle={{ borderWidth: 1 }}
          textStyle={{ fontFamily: value, fontSize: 16 }}
          renderListItem={(props: any) => {
            const {
              item,
              label,
              isSelected,
              onPress,
              style,
              labelStyle,
              disabled,
            } = props;
            return (
              <TouchableOpacity
                style={style}
                onPress={() => onPress(item)}
                disabled={disabled}
              >
                <Text
                  style={[
                    labelStyle,
                    { fontFamily: item.fontFamily, fontSize: 16 },
                    isSelected && { textDecorationLine: "underline" },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={{ gap: 8 }}>
        <TextInput
          placeholder="Event title"
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
        />
        <Button
          title={date.toLocaleDateString()}
          onPress={() => setShowDatePicker(true)}
        />
        {showDatePicker && (
          <DateTimePicker value={date} onChange={(_, d) => d && setDate(d)} />
        )}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            title={`Unit: ${unit}`}
            onPress={() => setUnit(unit === "days" ? "hours" : "days")}
          />
          <Button
            title="Add"
            onPress={() => {
              if (!title) return;
              addEvent(title, date.toISOString(), unit);
              setTitle("");
            }}
          />
        </View>
      </View>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderWidth: 1,
              borderRadius: 10,
              marginVertical: 6,
            }}
          >
            <Text style={{ fontSize: 18, fontFamily: value || undefined }}>
              {item.title}
            </Text>
            <Text style={{ marginTop: 4 }}>
              {diff(item)} {item.unit} left
            </Text>
            <Button title="Delete" onPress={() => removeEvent(item.id)} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = (font: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: "#f5f5f5",
    },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    pickerContainer: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      overflow: "visible",
      width: "80%",
      backgroundColor: "#fff",
      zIndex: 1000,
    },
    picker: { height: 50, width: "100%" },
    pickerItem: { fontSize: 16 },
    previewText: {
      marginTop: 20,
      fontSize: 18,
      textAlign: "center",
      fontFamily: font,
    },
  });
