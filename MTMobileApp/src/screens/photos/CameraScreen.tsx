import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { api } from '../../services/api';

export default function CameraScreen({ route, navigation }: any) {
  const visitId = route?.params?.visitId;
  const agentId = route?.params?.agentId;
  const [photos, setPhotos] = useState<
    { id: string; uri: string; timestamp: string }[]
  >([]);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Xəta', 'Kamera hazır deyil');
      return;
    }

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const uri =
        Platform.OS === 'android' ? `file://${photo.path}` : photo.path;

      const newPhoto = {
        id: `photo-${Date.now()}`,
        uri,
        timestamp: new Date().toLocaleTimeString('az-AZ', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setPhotos(prev => [...prev, newPhoto]);
    } catch (err: any) {
      Alert.alert('Xəta', 'Foto çəkilə bilmədi: ' + (err.message || ''));
    } finally {
      setCapturing(false);
    }
  };

  const handleDeletePhoto = (id: string) => {
    Alert.alert('Sil', 'Bu fotonu silmək istəyirsiniz?', [
      { text: 'Ləğv et', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => setPhotos(photos.filter(p => p.id !== id)),
      },
    ]);
  };

  const handleUploadAll = async () => {
    if (photos.length === 0) {
      Alert.alert('Xəta', 'Ən azı 1 foto çəkin');
      return;
    }

    setUploading(true);
    try {
      if (!visitId || !agentId) throw new Error('Visit or agent is missing');
      for (const photo of photos)
        await api.uploadPhoto({ visitId, agentId, uri: photo.uri });

      Alert.alert('Uğurlu', `${photos.length} foto yükləndi`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Xəta', err.message || 'Yükləmə uğursuz oldu');
    } finally {
      setUploading(false);
    }
  };

  // Permission not granted
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Kamera icazəsi lazımdır</Text>
          <Text style={styles.permissionText}>
            Foto çəkmək üçün kamera icazəsi verin
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={requestPermission}
          >
            <Text style={styles.permissionBtnText}>İcazə ver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No camera device
  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>⚠️</Text>
          <Text style={styles.permissionTitle}>Kamera tapılmadı</Text>
          <Text style={styles.permissionText}>
            Cihazda kamera aşkar edilmədi
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera viewfinder */}
      <View style={styles.viewfinder}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          onInitialized={() => setCameraReady(true)}
        />

        {/* Corners overlay */}
        <View style={styles.overlayCorners}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>

        {/* Watermark overlay */}
        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>
            MTM · {new Date().toLocaleDateString('az-AZ')}
          </Text>
          <Text style={styles.watermarkText}>
            Visit: {visitId?.slice(-8) || '—'}
          </Text>
        </View>
      </View>

      {/* Capture button */}
      <View style={styles.captureRow}>
        <TouchableOpacity
          style={styles.captureBtn}
          onPress={handleCapture}
          disabled={capturing || !cameraReady}
          activeOpacity={0.7}
        >
          {capturing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.captureBtnInner} />
          )}
        </TouchableOpacity>
      </View>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <View style={styles.gallery}>
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>
              Çəkilən fotolar ({photos.length})
            </Text>
            <TouchableOpacity
              onPress={handleUploadAll}
              disabled={uploading}
              style={styles.uploadBtn}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.uploadBtnText}>⬆ Hamısını yüklə</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
          >
            {photos.map(photo => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoThumb}
                onLongPress={() => handleDeletePhoto(photo.id)}
              >
                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                <Text style={styles.photoTime}>{photo.timestamp}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>📌 Rəf fotosunu çəkin</Text>
        <Text style={styles.instructionText}>📌 Vitrin fotosunu çəkin</Text>
        <Text style={styles.instructionText}>📌 Qiymət etiketini çəkin</Text>
        {photos.length === 0 && (
          <Text style={styles.hintText}>Foto çəkmək üçün düyməyə basın</Text>
        )}
        {photos.length > 0 && (
          <Text style={styles.hintText}>Silmək üçün fotoya uzun basın</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  viewfinder: { flex: 1, position: 'relative' },
  overlayCorners: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#6C63FF',
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#6C63FF',
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#6C63FF',
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#6C63FF',
    borderBottomRightRadius: 8,
  },
  watermark: { position: 'absolute', bottom: 24, left: 20 },
  watermarkText: { color: '#ffffff80', fontSize: 11, fontFamily: 'monospace' },
  captureRow: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  gallery: { backgroundColor: '#111', paddingVertical: 12 },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  galleryTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  uploadBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  uploadBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  photoScroll: { paddingHorizontal: 12 },
  photoThumb: { marginRight: 8, borderRadius: 8, overflow: 'hidden' },
  photoImage: { width: 80, height: 80, borderRadius: 8 },
  photoTime: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 4,
  },
  instructionText: { color: '#9ca3af', fontSize: 12 },
  hintText: { color: '#6C63FF', fontSize: 12, marginTop: 8, fontWeight: '500' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionIcon: { fontSize: 48, marginBottom: 16 },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  permissionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
