import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8080";

export default function Teste() {
  const [status, setStatus] = useState("idle");
  const [out, setOut] = useState(null);
  const [path, setPath] = useState("/actuator/health"); // mude para seu endpoint

  async function ping() {
    try {
      setStatus("loading");
      const res = await fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json" } });
      const json = await res.json();
      setOut(json);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      Alert.alert("Erro", e?.message ?? "Falha ao chamar API");
    }
  }

  useEffect(() => { /* opcional: ping automático */ }, []);

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Tela de Teste</Text>
      <Text style={{ color: "#374151" }}>Base: {BASE}</Text>

      <TextInput
        value={path}
        onChangeText={setPath}
        placeholder="/meu-endpoint"
        style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 10 }}
        autoCapitalize="none"
      />

      <Pressable onPress={ping} style={{ backgroundColor: "#2563eb", padding: 12, borderRadius: 12, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>Chamar API</Text>
      </Pressable>

      {status === "loading" && <ActivityIndicator size="large" />}
      {status === "done" && (
        <View style={{ padding: 12, backgroundColor: "#f3f4f6", borderRadius: 12 }}>
          <Text selectable style={{ fontFamily: "monospace" }}>{JSON.stringify(out, null, 2)}</Text>
        </View>
      )}
      {status === "error" && <Text style={{ color: "red" }}>Erro ao chamar API (veja o alerta).</Text>}
    </View>
  );
}