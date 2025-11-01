import { apiConfig } from '@/api/httpClient';
import type { Insignia } from '@/model/insignias/Insignia';
import { getInsignias, sortInsignias } from '@/service/conquistas/conquistasService';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatDate = (iso?: string | null) => {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
      .format(new Date(iso));
  } catch {
    return iso ?? '';
  }
};

const resolveIconUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = apiConfig.baseUrl?.replace(/\/$/, '') ?? '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export default function ConquistasPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Insignia[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getInsignias({ sincronizar: true });
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'Erro ao carregar insígnias.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const rows = useMemo(() => [...items].sort(sortInsignias), [items]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Conquistas</Text>
        <Text style={styles.subtitle}>
          Em breve você poderá acompanhar suas medalhas e resultados aqui.
        </Text>

        {loading && <ActivityIndicator />}
        {error && <Text style={styles.error}>{error}</Text>}

        {!loading && !error && (
          <FlatList
            data={rows}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => {
              const conquistada = !!item.desbloqueada && !!item.conquistadaEm;
              const quando = formatDate(item.conquistadaEm);
              const iconUri = resolveIconUrl(item.iconeUrl);
              const primeiraLetra = item.nome?.trim()?.charAt(0)?.toUpperCase();
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      {iconUri ? (
                        <>
                          <Image
                            source={{ uri: iconUri }}
                            style={styles.iconImage}
                            contentFit="cover"
                            transition={200}
                          />
                          {!item.desbloqueada && <View style={styles.iconOverlay} pointerEvents="none" />}
                        </>
                      ) : (
                        <View
                          style={[
                            styles.iconFallback,
                            !item.desbloqueada && styles.iconFallbackLocked,
                          ]}
                        >
                          <Text style={styles.iconFallbackText}>{primeiraLetra ?? '?'}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle}>{item.nome}</Text>
                      {!!item.descricao && <Text style={styles.cardSubtitle}>{item.descricao}</Text>}
                    </View>
                  </View>
                  <Text style={styles.cardMeta}>
                    {conquistada
                      ? `Conquistada ${quando ? `em ${quando}` : '✅'}`
                      : item.desbloqueada
                        ? 'Desbloqueada – finalize para conquistar'
                        : 'Bloqueada'}
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 32, gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 16, lineHeight: 22, color: '#475569', marginBottom: 8 },
  error: { color: '#DC2626' },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardBody: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  cardSubtitle: { marginTop: 4, color: '#475569' },
  cardMeta: { marginTop: 8, fontSize: 12, color: '#334155' },
  iconContainer: {
    width: 64,
    height: 64,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconImage: { width: '100%', height: '100%' },
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(148, 163, 184, 0.55)',
  },
  iconFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  iconFallbackLocked: {
    backgroundColor: '#CBD5F5',
  },
  iconFallbackText: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
});
