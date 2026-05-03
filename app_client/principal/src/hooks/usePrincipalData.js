import { useEffect, useState } from 'react';
import axios from 'axios';

export function usePrincipalData(userid, userNombre) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursosActivos, setCursosActivos] = useState([]);
  const [cursosCreados, setCursosCreados] = useState([]);
  const [reviewsByCourse, setReviewsByCourse] = useState({});
  const [progressText, setProgressText] = useState('0/6');

  async function loadData() {
    if (!userid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 👇 usuario
      const { data: usuario } = await axios.get(`/api/users/${userid}`);

      // 👇 cursos creados
      const { data: created } = await axios.get(`/api/cursos?creador=${userid}&origen=dynamic`);

      const activos = (usuario.cursosEnrolados || []).map((curso) => ({
        ...curso,
        progreso: curso.progreso || 0
      }));

      const creados = (Array.isArray(created) ? created : []).map((curso) => ({
        ...curso,
        nombre: curso.nombre || 'Curso personalizado'
      }));

      // 👇 reseñas
      const reviewEntries = await Promise.all(
        activos.map(async (curso) => {
          try {
            const { data } = await axios.get(`/api/cursos/${curso.cursoId}/resenas`);
            return [String(curso.cursoId), data.reviews || []];
          } catch {
            return [String(curso.cursoId), []];
          }
        })
      );

      setCursosActivos(activos);
      setCursosCreados(creados);
      setReviewsByCourse(Object.fromEntries(reviewEntries));
      setProgressText(`${activos.length}/6`);

    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [userid]);

  return {
    loading,
    error,
    cursosActivos,
    cursosCreados,
    reviewsByCourse,
    progressText,
    reload: loadData
  };
}