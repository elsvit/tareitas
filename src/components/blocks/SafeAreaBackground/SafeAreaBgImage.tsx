import React from 'react';

import BG_IMAGE from '~/assets/img/bg.jpg';
import { SafeAreaBackground } from './SafeAreaBackground';

interface ISafeAreaBgImage {
  bgImg?: string;
  children: React.ReactNode;
}
export const SafeAreaBgImage: React.FC<ISafeAreaBgImage> = ({ bgImg, children }) => {
  const bgImgSrc = bgImg || BG_IMAGE;
  return (
    <SafeAreaBackground hasTopInsets bgImg={bgImgSrc}>
      {children}
    </SafeAreaBackground>
  );
};