import { useCallback, useState } from 'react';
import api from '../api';

const defaultErrorHandler = (error) => {
  const detail = error?.response?.data?.detail || error?.message || 'No se pudo procesar la imagen';
  // eslint-disable-next-line no-alert
  alert(detail);
};

export function useIneOcr({ onError } = {}) {
  const [scanningIndex, setScanningIndex] = useState(null);

  const scanDocument = useCallback(
    async (index, file) => {
      if (!file) return null;
      try {
        setScanningIndex(index);
        const form = new FormData();
        form.append('file', file);
        const { data } = await api.post('/ocr/ine', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data || null;
      } catch (error) {
        console.error(error);
        (onError || defaultErrorHandler)(error);
        return null;
      } finally {
        setScanningIndex(null);
      }
    },
    [onError]
  );

  return {
    scanningIndex,
    scanDocument
  };
}

export default useIneOcr;
