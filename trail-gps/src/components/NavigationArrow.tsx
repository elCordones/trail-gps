import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Polygon, Defs, RadialGradient, Stop } from 'react-native-svg';

interface NavigationArrowProps {
  heading: number; // 0..360 graus
  size?: number;
  showCone?: boolean;
}

export const NavigationArrow: React.FC<NavigationArrowProps> = ({
  heading,
  size = 64,
  showCone = true,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ rotate: `${heading}deg` }],
        },
      ]}
      pointerEvents="none"
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* Degradat del con de visió */}
          <RadialGradient id="beamGradient" cx="50%" cy="100%" r="90%">
            <Stop offset="0%" stopColor="#00E5FF" stopOpacity="0.45" />
            <Stop offset="70%" stopColor="#00E5FF" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Con de rumb / feix direccional */}
        {showCone && (
          <Path
            d="M 50 50 L 15 5 A 70 70 0 0 1 85 5 Z"
            fill="url(#beamGradient)"
          />
        )}

        {/* Ombra de la fletxa */}
        <Polygon
          points="50,18 72,76 50,64 28,76"
          fill="rgba(0,0,0,0.5)"
          transform="translate(0, 3)"
        />

        {/* Marc exterior blanc d'alt contrast */}
        <Polygon
          points="50,16 75,78 50,65 25,78"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Cos interior de la fletxa (Cian elèctric fluorescent per a màxima visibilitat al sol) */}
        <Polygon
          points="50,22 70,74 50,63 30,74"
          fill="#00E5FF"
          stroke="#0097A7"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Centre de precisió GPS */}
        <Polygon
          points="50,28 50,63 30,74"
          fill="#00B0FF"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
