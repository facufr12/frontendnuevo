import { useState, useEffect } from 'react';

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 992,
    isDesktop: window.innerWidth >= 992,
    isSmallMobile: window.innerWidth < 576,
    isLargeMobile: window.innerWidth >= 576 && window.innerWidth < 768,
    isSmallTablet: window.innerWidth >= 768 && window.innerWidth < 900,
    isLargeTablet: window.innerWidth >= 900 && window.innerWidth < 992,
    isSmallDesktop: window.innerWidth >= 992 && window.innerWidth < 1200,
    isLargeDesktop: window.innerWidth >= 1200,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 992,
        isDesktop: width >= 992,
        isSmallMobile: width < 576,
        isLargeMobile: width >= 576 && width < 768,
        isSmallTablet: width >= 768 && width < 900,
        isLargeTablet: width >= 900 && width < 992,
        isSmallDesktop: width >= 992 && width < 1200,
        isLargeDesktop: width >= 1200,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        orientation: height > width ? 'portrait' : 'landscape',
      });
    };

    // Agregar listener con debounce para mejor performance
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', () => {
      // Delay para asegurar que la orientación se complete
      setTimeout(handleResize, 200);
    });

    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
};

export default useScreenSize;
