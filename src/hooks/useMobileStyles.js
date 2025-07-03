import useScreenSize from './useScreenSize';

// Hook personalizado para manejar estilos móviles
export const useMobileStyles = () => {
  const { isMobile, isSmallMobile, isTouchDevice, orientation } = useScreenSize();
  
  return {
    isMobile,
    isSmallMobile,
    isTouchDevice,
    orientation,
    
    // Clases CSS útiles
    containerClass: isMobile ? 'container-fluid mobile-container' : 'container',
    cardClass: isMobile ? 'card-mobile rounded-mobile shadow-mobile' : 'card',
    buttonClass: isMobile ? 'btn-touch mobile-btn' : '',
    inputClass: isMobile ? 'form-control-touch' : '',
    paddingClass: isMobile ? 'p-mobile' : '',
    marginClass: isMobile ? 'mb-mobile' : 'mb-3',
    
    // Estilos inline útiles
    buttonStyle: {
      minHeight: isTouchDevice ? '44px' : 'auto',
      minWidth: isTouchDevice ? '44px' : 'auto'
    },
    
    inputStyle: {
      fontSize: isMobile ? '16px' : '14px', // Evita zoom en iOS
      minHeight: isTouchDevice ? '44px' : 'auto'
    },
    
    modalStyle: {
      margin: isMobile ? '8px' : '1.75rem auto',
      maxWidth: isMobile ? 'calc(100% - 16px)' : '500px'
    }
  };
};

export default useMobileStyles;
