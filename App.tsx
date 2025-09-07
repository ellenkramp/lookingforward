import { useStore } from "./src/store";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { writeShared } from "@/widget/bridge";

export default function App() {
  const { events, addEvent, removeEvent, diff } = useStore();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [unit, setUnit] = useState<"days" | "hours">("days");

  // On store change (pseudo)
  useEffect(() => {
    const unsub = useStore.subscribe((s) => {
      writeShared(s.events);
      // iOS: WidgetCenter.reloadAllTimelines()
      // Android: AppWidgetManager.notifyAppWidgetViewDataChanged(...)
    });
    return unsub;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Countdowns</Text>

      <View style={{ gap: 8 }}>
        <TextInput
          placeholder="Event title"
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
        />
        <DateTimePicker value={date} onChange={(_, d) => d && setDate(d)} />
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
            <Text style={{ fontSize: 18, fontWeight: "600" }}>
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
