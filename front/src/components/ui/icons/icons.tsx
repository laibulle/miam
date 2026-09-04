import { View } from 'react-native';

import { colors } from '../tokens';

export interface IconProps {
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 20;

/**
 * Small, friendly geometric marks built from plain Views — no emoji, no icon
 * font/SVG dependency. Flat solid fills, chunky rounded proportions, closed
 * happy-eye faces on the brand mark — inspired directly by Headspace's blob
 * character system (circle/square/triangle shapes with a simple smile).
 */

/** A closed, happy eye/smile stroke: a circle showing only one colored edge. */
function Arc({ size, thickness, color, edge }: { size: number; thickness: number; color: string; edge: 'top' | 'bottom' }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: thickness,
        borderColor: 'transparent',
        ...(edge === 'top' ? { borderTopColor: color } : { borderBottomColor: color }),
      }}
    />
  );
}

export function BlobFace({ size = DEFAULT_SIZE, color = colors.ink }: IconProps) {
  const eyeSize = size * 0.22;
  const eyeThickness = Math.max(1.5, size * 0.065);
  const mouthSize = size * 0.4;
  const mouthThickness = Math.max(1.5, size * 0.07);
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', gap: size * 0.18 }}>
        <Arc size={eyeSize} thickness={eyeThickness} color={color} edge="top" />
        <Arc size={eyeSize} thickness={eyeThickness} color={color} edge="top" />
      </View>
      <Arc size={mouthSize} thickness={mouthThickness} color={color} edge="bottom" />
    </View>
  );
}

/** The Miam brand mark: a friendly round blob with a closed-eye smile. */
export function MiamMascot({ size = DEFAULT_SIZE, color = colors.coral.DEFAULT }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BlobFace size={size} color={colors.onColor} />
    </View>
  );
}

export function BackIcon({ size = DEFAULT_SIZE, color = colors.ink }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: size * 0.24,
          borderBottomWidth: size * 0.24,
          borderRightWidth: size * 0.32,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: color,
          marginRight: size * 0.08,
        }}
      />
    </View>
  );
}

export function CloseIcon({ size = DEFAULT_SIZE, color = colors.ink }: IconProps) {
  const barLength = size * 0.62;
  const barThickness = Math.max(2, size * 0.14);
  const barStyle = {
    position: 'absolute' as const,
    width: barLength,
    height: barThickness,
    borderRadius: barThickness / 2,
    backgroundColor: color,
  };
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[barStyle, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[barStyle, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

export function SettingsIcon({ size = DEFAULT_SIZE, color = colors.ink }: IconProps) {
  const trackWidth = size * 0.78;
  const trackThickness = Math.max(2.5, size * 0.12);
  const knobSize = size * 0.3;
  const track = { width: trackWidth, height: trackThickness, borderRadius: trackThickness / 2, backgroundColor: color, opacity: 0.3 };
  const knob = {
    position: 'absolute' as const,
    width: knobSize,
    height: knobSize,
    borderRadius: knobSize / 2,
    backgroundColor: color,
    top: -(knobSize - trackThickness) / 2,
  };
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', gap: size * 0.3 }}>
      <View style={{ width: trackWidth }}>
        <View style={track} />
        <View style={[knob, { left: trackWidth * 0.58 }]} />
      </View>
      <View style={{ width: trackWidth }}>
        <View style={track} />
        <View style={[knob, { left: trackWidth * 0.18 }]} />
      </View>
    </View>
  );
}

export function HeartIcon({ size = DEFAULT_SIZE, color = colors.coral.DEFAULT }: IconProps) {
  const lobe = size * 0.52;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          width: lobe,
          height: lobe,
          borderRadius: lobe / 2,
          backgroundColor: color,
          top: 0,
          left: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: lobe,
          height: lobe,
          borderRadius: lobe / 2,
          backgroundColor: color,
          top: 0,
          left: size - lobe,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: lobe,
          height: lobe,
          backgroundColor: color,
          top: size * 0.18,
          left: (size - lobe) / 2,
          borderRadius: size * 0.08,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function PauseIcon({ size = DEFAULT_SIZE, color = colors.ink }: IconProps) {
  const barWidth = size * 0.2;
  const barHeight = size * 0.56;
  const bar = { width: barWidth, height: barHeight, borderRadius: barWidth / 2, backgroundColor: color };
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: size * 0.16 }}>
      <View style={bar} />
      <View style={bar} />
    </View>
  );
}

export function PlayIcon({ size = DEFAULT_SIZE, color = colors.ink }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: size * 0.28,
          borderBottomWidth: size * 0.28,
          borderLeftWidth: size * 0.36,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: color,
          marginLeft: size * 0.06,
        }}
      />
    </View>
  );
}

export function ClockIcon({ size = DEFAULT_SIZE, color = colors.coral.DEFAULT }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: Math.max(1.5, size * 0.12),
          height: size * 0.32,
          borderRadius: size * 0.06,
          backgroundColor: colors.onColor,
          marginBottom: size * 0.14,
          transform: [{ rotate: '20deg' }],
        }}
      />
    </View>
  );
}

export function FlameIcon({ size = DEFAULT_SIZE, color = colors.coral.DEFAULT }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: size * 0.6,
          height: size * 0.5,
          borderRadius: size * 0.3,
          borderBottomLeftRadius: size * 0.1,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function PlateIcon({ size = DEFAULT_SIZE, color = colors.coral.DEFAULT }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: (size * 0.4) / 2,
          backgroundColor: colors.onColor,
          opacity: 0.85,
        }}
      />
    </View>
  );
}

export function AlertIcon({ size = DEFAULT_SIZE, color = colors.onColor }: IconProps) {
  const barWidth = Math.max(2, size * 0.16);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', gap: size * 0.14 }}>
      <View style={{ width: barWidth, height: size * 0.4, borderRadius: barWidth / 2, backgroundColor: color }} />
      <View style={{ width: barWidth, height: barWidth, borderRadius: barWidth / 2, backgroundColor: color }} />
    </View>
  );
}
