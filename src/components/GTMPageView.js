import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GTMPageView = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'pageview',
        page: {
          path: location.pathname,
          title: document.title,
        },
      });
    }
  }, [location]);

  return null;
};

export default GTMPageView;