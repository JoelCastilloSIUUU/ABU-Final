import { useEffect, useState } from 'react';
import api from '../services/api';

export function useCursos(userId) {
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    async function cargar() {
      const { data } = await api.get(`/api/cursos?userid=${userId}`);
      setCursos(data.cursos || data);
    }

    if (userId) cargar();
  }, [userId]);

  return cursos;
}