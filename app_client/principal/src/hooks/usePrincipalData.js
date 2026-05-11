import { useEffect, useState } from 'react';
import axios from 'axios';

const MODULOS_BASE = ['whatsapp', 'youtube', 'camara', 'navegador', 'ajustes', 'llamadas'];

function calcularProgresoGeneral(usuario) {
  const progresoModulos = usuario.progresoModulos || {};
  const progresoCursos = usuario.progresoCursos || [];

  const modulosCompletados = MODULOS_BASE.filter((modulo) => {
    return progresoModulos[modulo]?.completado === true;
  }).length;

  const cursosDinamicosCompletados = progresoCursos.filter((curso) => {
    return curso.completado === true || Number(curso.porcentaje || 0) >= 100;
  }).length;

  return {
    completados: modulosCompletados,
    total: MODULOS_BASE.length
  };
}

function obtenerProgresoCurso(usuario, cursoId, progresoFallback = 0) {
  const progresoCursos = usuario.progresoCursos || [];

  const progresoEncontrado = progresoCursos.find((item) => {
    return String(item.cursoId) === String(cursoId);
  });

  if (progresoEncontrado) {
    return Number(progresoEncontrado.porcentaje || 0);
  }

  return Number(progresoFallback || 0);
}

export function usePrincipalData(userid, userNombre) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursosActivos, setCursosActivos] = useState([]);
  const [cursosCreados, setCursosCreados] = useState([]);
  const [reviewsByCourse, setReviewsByCourse] = useState({});
  const [progressText, setProgressText] = useState('0/6');

  async function loadData(message = '') {
    if (!userid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data: usuario } = await axios.get(`/api/users/${userid}`);
      const { data: created } = await axios.get(`/api/cursos?creador=${userid}&origen=dynamic`);

      const activos = (usuario.cursosEnrolados || []).map((curso) => {
        const cursoId = curso.cursoId?._id || curso.cursoId || curso._id;

        return {
          ...curso,
          cursoId,
          progreso: obtenerProgresoCurso(usuario, cursoId, curso.progreso)
        };
      });

      const creados = (Array.isArray(created) ? created : []).map((curso) => {
        const cursoId = curso._id || curso.cursoId;

        return {
          ...curso,
          cursoId,
          nombre: curso.nombre || 'Curso personalizado',

          // FIX COLOR
          color: curso.color_hex || curso.color || '#FF8C00',
          color_hex: curso.color_hex || curso.color || '#FF8C00',

          // FIX LINK CURSO
          href: `/cursos/${cursoId}?nombre=${encodeURIComponent(
            userNombre || 'Usuario'
          )}&userid=${encodeURIComponent(userid || '')}`,

          progreso: obtenerProgresoCurso(usuario, cursoId, 0)
        };
      });

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

      const progresoGeneral = calcularProgresoGeneral(usuario);

      setCursosActivos(activos);
      setCursosCreados(creados);
      setReviewsByCourse(Object.fromEntries(reviewEntries));
      setProgressText(`${progresoGeneral.completados}/${progresoGeneral.total || 6}`);
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