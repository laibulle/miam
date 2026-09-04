import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { colors } from '../tokens';

export interface IconProps {
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 20;
const palette = {
  apricot: '#FF913F',
  honey: '#FFCA54',
  sky: '#80CDE9',
  rose: '#F5AACB',
  sage: '#ACCEAD',
  cocoa: '#553E32',
  cream: '#FFF8EA',
};

// A shared drawing space keeps the rounded strokes consistent on web and native.
function Canvas({ size, children }: { size: number; children: ReactNode }) {
  return (
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
      <View style={{ position: 'absolute', width: 100, height: 100, left: (size - 100) / 2, top: (size - 100) / 2, transform: [{ scale: size / 100 }] }}>
        {children}
      </View>
    </View>
  );
}

function Shape({ x, y, w, h = w, color, radius = 50, rotate = 0, style }: {
  x: number; y: number; w: number; h?: number; color: string; radius?: number; rotate?: number; style?: ViewStyle;
}) {
  return <View style={{ position: 'absolute', left: x, top: y, width: w, height: h, backgroundColor: color, borderRadius: radius, transform: [{ rotate: `${rotate}deg` }], ...style }} />;
}

function Stroke({ x, y, length, color, rotate = 0, thickness = 9 }: {
  x: number; y: number; length: number; color: string; rotate?: number; thickness?: number;
}) {
  return <Shape x={x} y={y} w={length} h={thickness} radius={thickness / 2} color={color} rotate={rotate} />;
}

function Smile({ x, y, w, h, color, thickness = 4 }: {
  x: number; y: number; w: number; h: number; color: string; thickness?: number;
}) {
  return <View style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderColor: color, borderBottomWidth: thickness, borderLeftWidth: thickness, borderRightWidth: thickness, borderBottomLeftRadius: w / 2, borderBottomRightRadius: w / 2 }} />;
}

function Face({ color = palette.cocoa }: { color?: string }) {
  return (
    <>
      <Smile x={27} y={39} w={17} h={10} color={color} />
      <Smile x={56} y={39} w={17} h={10} color={color} />
      <Smile x={40} y={58} w={20} h={12} color={color} thickness={4.5} />
    </>
  );
}

export function BlobFace({ size = DEFAULT_SIZE, color = palette.cocoa }: IconProps) {
  return <Canvas size={size}><Face color={color} /></Canvas>;
}

type CharacterShape = 'pebble' | 'cushion' | 'petal';
function Character({ size, color, shape = 'pebble' }: { size: number; color: string; shape?: CharacterShape }) {
  const corners: ViewStyle = shape === 'cushion'
    ? { borderTopLeftRadius: 24, borderTopRightRadius: 30, borderBottomLeftRadius: 28, borderBottomRightRadius: 23 }
    : shape === 'petal'
      ? { borderTopLeftRadius: 15, borderTopRightRadius: 48, borderBottomLeftRadius: 48, borderBottomRightRadius: 48 }
      : { borderTopLeftRadius: 46, borderTopRightRadius: 43, borderBottomLeftRadius: 40, borderBottomRightRadius: 48 };
  return (
    <Canvas size={size}>
      <View style={{ position: 'absolute', left: 3, top: 4, width: 94, height: 93, backgroundColor: color, overflow: 'hidden', ...corners }}>
        <Shape x={-14} y={64} w={118} h={52} color={palette.cocoa} style={{ opacity: 0.055 }} rotate={-15} />
      </View>
      <Shape x={19} y={52} w={10} h={5} color={palette.rose} style={{ opacity: 0.6 }} />
      <Shape x={71} y={52} w={10} h={5} color={palette.rose} style={{ opacity: 0.6 }} />
      <Face />
    </Canvas>
  );
}

export function MiamMascot({ size = DEFAULT_SIZE, color = palette.apricot }: IconProps) {
  return <Character size={size} color={color} />;
}

/** A little gathering of calm characters for the welcome illustration. */
export function MiamCompanions({ size = 260 }: Pick<IconProps, 'size'>) {
  return (
    <Canvas size={size}>
      <View style={{ position: 'absolute', left: 6, top: 16, transform: [{ rotate: '-14deg' }] }}><Character size={27} color={palette.sky} /></View>
      <View style={{ position: 'absolute', left: 62, top: 5, transform: [{ rotate: '24deg' }] }}><Character size={26} color={palette.honey} shape="cushion" /></View>
      <Shape x={38} y={7} w={12} h={18} color={palette.rose} radius={5} rotate={-23} style={{ borderBottomRightRadius: 12 }} />
      <View style={{ position: 'absolute', left: 29, top: 32, transform: [{ rotate: '-4deg' }] }}><MiamMascot size={46} /></View>
      <View style={{ position: 'absolute', left: 9, top: 64, transform: [{ rotate: '-26deg' }] }}><Character size={25} color={palette.honey} shape="petal" /></View>
      <View style={{ position: 'absolute', left: 64, top: 71, transform: [{ rotate: '-24deg' }] }}><Character size={27} color={palette.sky} shape="petal" /></View>
      <Shape x={82} y={45} w={15} h={18} color={palette.rose} radius={6} rotate={-30} style={{ borderBottomLeftRadius: 12 }} />
    </Canvas>
  );
}

export function BackIcon({ size = DEFAULT_SIZE, color = palette.cocoa }: IconProps) {
  return (
    <Canvas size={size}>
      <Stroke x={25} y={45} length={55} color={color} />
      <Stroke x={18} y={34} length={34} color={color} rotate={-43} />
      <Stroke x={18} y={57} length={34} color={color} rotate={43} />
    </Canvas>
  );
}

export function CloseIcon({ size = DEFAULT_SIZE, color = palette.cocoa }: IconProps) {
  return (
    <Canvas size={size}>
      <Stroke x={18} y={45} length={64} color={color} rotate={45} />
      <Stroke x={18} y={45} length={64} color={color} rotate={-45} />
    </Canvas>
  );
}

export function SettingsIcon({ size = DEFAULT_SIZE, color = palette.cocoa }: IconProps) {
  return (
    <Canvas size={size}>
      <Stroke x={14} y={29} length={72} color={color} thickness={6} />
      <Stroke x={14} y={65} length={72} color={color} thickness={6} />
      <Shape x={32} y={23} w={18} color={color} />
      <Shape x={60} y={59} w={18} color={color} />
    </Canvas>
  );
}

export function HeartIcon({ size = DEFAULT_SIZE, color = palette.rose }: IconProps) {
  return (
    <Canvas size={size}>
      <Shape x={14} y={16} w={45} color={color} />
      <Shape x={41} y={16} w={45} color={color} />
      <Shape x={26} y={28} w={49} color={color} radius={13} rotate={45} />
    </Canvas>
  );
}

export function PauseIcon({ size = DEFAULT_SIZE, color = palette.cocoa }: IconProps) {
  return (
    <Canvas size={size}>
      <Shape x={25} y={20} w={16} h={60} color={color} />
      <Shape x={59} y={20} w={16} h={60} color={color} />
    </Canvas>
  );
}

export function PlayIcon({ size = DEFAULT_SIZE, color = palette.cocoa }: IconProps) {
  return (
    <Canvas size={size}>
      <View style={{ position: 'absolute', left: 32, top: 24, width: 0, height: 0, borderTopWidth: 26, borderBottomWidth: 26, borderLeftWidth: 40, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color }} />
      <Stroke x={26} y={45} length={51} thickness={12} color={color} rotate={32} />
      <Stroke x={26} y={43} length={51} thickness={12} color={color} rotate={-32} />
      <Shape x={26} y={22} w={12} h={56} color={color} />
    </Canvas>
  );
}

export function ClockIcon({ size = DEFAULT_SIZE, color = palette.honey }: IconProps) {
  return (
    <Canvas size={size}>
      <Shape x={40} y={1} w={20} h={13} color={color} radius={5} />
      <Shape x={8} y={13} w={84} h={83} color={color} style={{ borderBottomLeftRadius: 37, borderTopRightRadius: 39 }} />
      <Stroke x={36} y={39} length={26} color={palette.cocoa} rotate={-90} thickness={7} />
      <Stroke x={47} y={50} length={25} color={palette.cocoa} rotate={28} thickness={7} />
      <Shape x={44} y={47} w={9} color={palette.cocoa} />
    </Canvas>
  );
}

export function FlameIcon({ size = DEFAULT_SIZE, color = palette.apricot }: IconProps) {
  return (
    <Canvas size={size}>
      <Shape x={22} y={13} w={59} h={76} color={color} rotate={18} style={{ borderTopLeftRadius: 6, borderTopRightRadius: 43, borderBottomLeftRadius: 37, borderBottomRightRadius: 39 }} />
      <Shape x={35} y={46} w={32} h={40} color={color === colors.onColor ? palette.cocoa : palette.honey} rotate={16} style={{ borderTopLeftRadius: 3, borderTopRightRadius: 24, borderBottomLeftRadius: 21, borderBottomRightRadius: 22 }} />
    </Canvas>
  );
}

export function PlateIcon({ size = DEFAULT_SIZE, color = palette.sage }: IconProps) {
  return (
    <Canvas size={size}>
      <Shape x={20} y={15} w={64} h={71} color={color} />
      <View style={{ position: 'absolute', left: 31, top: 26, width: 42, height: 49, borderWidth: 4, borderColor: palette.cream, borderRadius: 25 }} />
      <Stroke x={-18} y={48} length={64} color={palette.cocoa} rotate={90} thickness={6} />
      <Shape x={5} y={17} w={18} h={25} color={palette.cocoa} radius={6} />
      <Stroke x={60} y={48} length={64} color={palette.cocoa} rotate={90} thickness={6} />
      <Shape x={84} y={16} w={16} h={29} color={palette.cocoa} />
    </Canvas>
  );
}

export function AlertIcon({ size = DEFAULT_SIZE, color = colors.onColor }: IconProps) {
  return (
    <Canvas size={size}>
      <Shape x={42} y={17} w={16} h={42} color={color} />
      <Shape x={42} y={70} w={16} color={color} />
    </Canvas>
  );
}
