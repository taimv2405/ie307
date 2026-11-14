// Màn "Camera": chụp, chọn ảnh từ thư viện, bật/tắt flash, đóng.
import { useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '@/lib/theme';

const MAX_SIDE = 2048; // ML Kit: ~0.57 s at 2048 px vs ~1.1 s at 12 MP on a Redmi Note 12

async function prepare(uri: string, width: number, height: number) {
  const t0 = Date.now();
  const ctx = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > MAX_SIDE) ctx.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ compress: 0.9, format: SaveFormat.JPEG });
  return { ...out, msPrepare: Date.now() - t0 };
}

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cam = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);

  const open = async (uri: string, width: number, height: number, msCapture: number) => {
    const img = await prepare(uri, width, height);
    router.push({ pathname: '/photo', params: { uri: img.uri, w: String(img.width), h: String(img.height), msCapture: String(msCapture), msPrepare: String(img.msPrepare) } });
  };

  const shoot = async () => {
    if (!cam.current || !ready || busy) return;
    setBusy(true);
    try {
      const t0 = Date.now();
      const pic = await cam.current.takePictureAsync({ quality: 0.9 });
      if (pic) await open(pic.uri, pic.width, pic.height, Date.now() - t0);
    } finally {
      setBusy(false);
    }
  };

  const pick = async () => {
    if (busy) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled) return;
    setBusy(true);
    try {
      const a = res.assets[0];
      await open(a.uri, a.width, a.height, 0);
    } finally {
      setBusy(false);
    }
  };

  if (!permission) return <View style={s.root} />;
  if (!permission.granted) {
    return (
      <View style={[s.root, s.center]}>
        <Text style={s.permText}>nhặt cần camera để chụp trang sách.</Text>
        <Pressable style={s.permBtn} onPress={requestPermission}>
          <Text style={s.permBtnText}>Cho phép camera</Text>
        </Pressable>
        <Pressable style={[s.permBtn, s.permGhost]} onPress={pick}>
          <Text style={[s.permBtnText, { color: '#fff' }]}>Chọn ảnh từ thư viện</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <CameraView ref={cam} style={StyleSheet.absoluteFill} facing="back" flash={flash ? 'on' : 'off'} onCameraReady={() => setReady(true)} />
      <View style={[s.top, { top: insets.top + 12 }]}>
        <Pressable style={s.round} onPress={() => (router.canGoBack() ? router.back() : BackHandler.exitApp())} accessibilityLabel="Đóng">
          <Text style={s.icon}>✕</Text>
        </Pressable>
        <Pressable style={[s.round, flash && s.roundOn]} onPress={() => setFlash((f) => !f)} accessibilityLabel="Bật/tắt flash">
          <Text style={[s.icon, flash && { color: C.ink }]}>ϟ</Text>
        </Pressable>
      </View>
      <View style={[s.bottom, { bottom: insets.bottom + 28 }]}>
        <Pressable style={s.gallery} onPress={pick} accessibilityLabel="Chọn ảnh từ thư viện">
          <Text style={s.galleryIcon}>▣</Text>
        </Pressable>
        <Pressable style={s.shutterRing} onPress={shoot} disabled={!ready || busy} accessibilityLabel="Chụp">
          <View style={[s.shutter, (!ready || busy) && { opacity: 0.5 }]}>{busy && <ActivityIndicator color="#fff" />}</View>
        </Pressable>
        <View style={{ width: 52 }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  permText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  permBtn: { backgroundColor: C.red, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 24, minWidth: 220, alignItems: 'center' },
  permGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  roundOn: { backgroundColor: '#FFD54A' },
  icon: { fontSize: 18, color: C.ink, fontWeight: '700' },
  bottom: { position: 'absolute', left: 24, right: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gallery: { width: 52, height: 52, borderRadius: 12, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  galleryIcon: { color: '#fff', fontSize: 22 },
  shutterRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 66, height: 66, borderRadius: 33, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
});
