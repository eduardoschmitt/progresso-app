import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';

const FALLBACK_URL = 'http://10.0.2.2:8080';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_URL;

type RequestStatus = 'idle' | 'loading' | 'done' | 'error';

export default function TestPage() {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [output, setOutput] = useState<unknown>(null);
  const [path, setPath] = useState('/actuator/health');

  const ping = async () => {
    try {
      setStatus('loading');
      const response = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await response.json();
      setOutput(json);
      setStatus('done');
    } catch (error) {
      setStatus('error');
      const message =
        error instanceof Error ? error.message : 'Falha ao chamar API';
      Alert.alert('Erro', message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Tela de Teste</Text>
      <Text style={{ color: '#374151' }}>Base: {BASE_URL}</Text>

      <TextInput
        value={path}
        onChangeText={setPath}
        placeholder="/meu-endpoint"
        style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10 }}
        autoCapitalize="none"
      />

      <Pressable
        onPress={ping}
        style={{
          backgroundColor: '#2563eb',
          padding: 12,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Chamar API</Text>
      </Pressable>

      {status === 'loading' && <ActivityIndicator size="large" />}
      {status === 'done' && (
        <View style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 12 }}>
          <Text selectable style={{ fontFamily: 'monospace' }}>
            {JSON.stringify(output, null, 2)}
          </Text>
        </View>
      )}
      {status === 'error' && (
        <Text style={{ color: 'red' }}>Erro ao chamar API (veja o alerta).</Text>
      )}
    </View>
  );
}
