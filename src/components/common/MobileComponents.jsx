import React from 'react';
import { Button, Form } from 'react-bootstrap';
import useScreenSize from '../../hooks/useScreenSize';

// Botón optimizado para móviles
export const MobileButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const { isMobile, isTouchDevice } = useScreenSize();
  
  const mobileClasses = isMobile || isTouchDevice 
    ? 'btn-touch mobile-btn shadow-mobile' 
    : '';
    
  const responsiveSize = isMobile ? 'sm' : size;
  
  return (
    <Button
      variant={variant}
      size={responsiveSize}
      className={`${mobileClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </Button>
  );
};

// Input optimizado para móviles
export const MobileInput = ({ 
  className = '', 
  placeholder = '',
  ...props 
}) => {
  const { isMobile, isTouchDevice } = useScreenSize();
  
  const mobileClasses = isMobile || isTouchDevice 
    ? 'form-control-touch' 
    : '';
    
  return (
    <Form.Control
      className={`${mobileClasses} ${className}`.trim()}
      placeholder={isMobile && placeholder.length > 20 
        ? placeholder.substring(0, 17) + '...' 
        : placeholder}
      {...props}
    />
  );
};

// Select optimizado para móviles
export const MobileSelect = ({ 
  children,
  className = '', 
  ...props 
}) => {
  const { isMobile, isTouchDevice } = useScreenSize();
  
  const mobileClasses = isMobile || isTouchDevice 
    ? 'form-control-touch' 
    : '';
    
  return (
    <Form.Select
      className={`${mobileClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </Form.Select>
  );
};

// Card optimizada para móviles
export const MobileCard = ({ 
  children, 
  className = '', 
  header,
  footer,
  ...props 
}) => {
  const { isMobile } = useScreenSize();
  
  const mobileClasses = isMobile 
    ? 'card-mobile rounded-mobile shadow-mobile fade-in-mobile' 
    : '';
    
  return (
    <div className={`card ${mobileClasses} ${className}`.trim()} {...props}>
      {header && (
        <div className={`card-header ${isMobile ? 'mobile-card-header' : ''}`}>
          {header}
        </div>
      )}
      <div className={`card-body ${isMobile ? 'p-mobile' : ''}`}>
        {children}
      </div>
      {footer && (
        <div className={`card-footer ${isMobile ? 'mobile-card-footer' : ''}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Container responsivo
export const ResponsiveContainer = ({ 
  children, 
  className = '',
  fluid = false,
  ...props 
}) => {
  const { isMobile } = useScreenSize();
  
  const containerClass = fluid || isMobile ? 'container-fluid' : 'container';
  const mobileClasses = isMobile ? 'mobile-container p-mobile' : '';
  
  return (
    <div 
      className={`${containerClass} ${mobileClasses} ${className}`.trim()} 
      {...props}
    >
      {children}
    </div>
  );
};
