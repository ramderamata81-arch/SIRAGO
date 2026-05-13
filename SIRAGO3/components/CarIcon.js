// components/CarIcon.js
import React from 'react';
import { View, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const CarIcon = ({ size = 50, color = '#FFFFFF', rotation = 0 }) => {
  // Gérer si rotation est un Animated.Value ou un nombre
  const rotateTransform = rotation && typeof rotation.interpolate === 'function' 
    ? rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] })
    : `${rotation}deg`;

  return (
    <Animated.View style={{
      width: size,
      height: size,
      transform: [{ rotate: rotateTransform }]
    }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* Carrosserie */}
        <Path
          d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"
          fill={color}
          stroke="#333333"
          strokeWidth="0.5"
        />
        
        {/* Fenêtres */}
        <Path
          d="M6.5 7.5h4.09l.5 2.5H5.5l1-2.5zm6.91 0h4.09l1 2.5h-5.59l.5-2.5z"
          fill="#87CEEB"
          opacity="0.7"
        />
        
        {/* Roue avant */}
        <Circle cx="7.5" cy="16" r="1.5" fill="#333333" />
        <Circle cx="7.5" cy="16" r="0.8" fill="#666666" />
        
        {/* Roue arrière */}
        <Circle cx="16.5" cy="16" r="1.5" fill="#333333" />
        <Circle cx="16.5" cy="16" r="0.8" fill="#666666" />
        
        {/* Phares */}
        <Circle cx="5" cy="11" r="0.5" fill="#FFEB3B" />
        <Circle cx="19" cy="11" r="0.5" fill="#FFEB3B" />
      </Svg>
    </Animated.View>
  );
};

export default CarIcon;
