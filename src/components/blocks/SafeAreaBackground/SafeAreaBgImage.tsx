import React from 'react';

import BG_IMAGE from '~/assets/img/bg.jpg';
import { SafeAreaBackground } from './SafeAreaBackground';

interface ISafeAreaBgImage {
  bgImg?: string;
  children: React.ReactNode;
  includeBottomInset?: boolean;
}
export const SafeAreaBgImage: React.FC<ISafeAreaBgImage> = ({
  bgImg,
  children,
  includeBottomInset = true,
}) => {
  const bgImgSrc = bgImg || BG_IMAGE;
  return (
    <SafeAreaBackground
      hasTopInsets
      includeBottomInset={includeBottomInset}
      bgImg={bgImgSrc}
    >
      {children}
    </SafeAreaBackground>
  );
};