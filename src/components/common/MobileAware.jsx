import React from 'react';
import useScreenSize from '../../hooks/useScreenSize';

const MobileAware = ({ 
  children, 
  mobileComponent, 
  tabletComponent, 
  desktopComponent,
  breakpoint = 'mobile',
  className = '',
  style = {},
  wrapperTag = 'div'
}) => {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isSmallMobile, 
    isLargeMobile, 
    isTouchDevice, 
    orientation 
  } = useScreenSize();

  // Agregar clases automáticas basadas en el dispositivo
  const getDeviceClasses = () => {
    const classes = [];
    if (isMobile) classes.push('mobile-device');
    if (isSmallMobile) classes.push('small-mobile');
    if (isLargeMobile) classes.push('large-mobile');
    if (isTablet) classes.push('tablet-device');
    if (isDesktop) classes.push('desktop-device');
    if (isTouchDevice) classes.push('touch-device');
    if (orientation === 'portrait') classes.push('portrait');
    if (orientation === 'landscape') classes.push('landscape');
    return classes.join(' ');
  };

  const deviceClasses = `${getDeviceClasses()} ${className}`.trim();

  // Si se especifican componentes específicos para cada breakpoint
  if (mobileComponent && isMobile) {
    return React.createElement(wrapperTag, {
      className: deviceClasses,
      style
    }, mobileComponent);
  }
  
  if (tabletComponent && isTablet) {
    return React.createElement(wrapperTag, {
      className: deviceClasses,
      style
    }, tabletComponent);
  }
  
  if (desktopComponent && isDesktop) {
    return React.createElement(wrapperTag, {
      className: deviceClasses,
      style
    }, desktopComponent);
  }

  // Renderizado condicional basado en breakpoint
  let shouldRender = false;
  
  switch (breakpoint) {
    case 'mobile':
      shouldRender = isMobile;
      break;
    case 'small-mobile':
      shouldRender = isSmallMobile;
      break;
    case 'large-mobile':
      shouldRender = isLargeMobile;
      break;
    case 'tablet':
      shouldRender = isTablet;
      break;
    case 'desktop':
      shouldRender = isDesktop;
      break;
    case 'not-mobile':
      shouldRender = !isMobile;
      break;
    case 'mobile-tablet':
      shouldRender = (isMobile || isTablet);
      break;
    case 'touch':
      shouldRender = isTouchDevice;
      break;
    case 'portrait':
      shouldRender = orientation === 'portrait';
      break;
    case 'landscape':
      shouldRender = orientation === 'landscape';
      break;
    default:
      shouldRender = true;
  }

  if (!shouldRender) {
    return null;
  }

  return React.createElement(wrapperTag, {
    className: deviceClasses,
    style
  }, children);
};

export default MobileAware;
