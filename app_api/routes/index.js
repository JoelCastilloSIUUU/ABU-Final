const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ctrlCursos = require('../controllers/cursos');
const ctrlAuth = require('../controllers/auth');
const ctrlResenas = require('../controllers/resenas');

const carpetaPerfiles = path.join(__dirname, '../../public/uploads/perfiles');

if (!fs.existsSync(carpetaPerfiles)) {
  fs.mkdirSync(carpetaPerfiles, { recursive: true });
}

const storagePerfil = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaPerfiles);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nombreArchivo = `perfil-${req.params.userid}-${Date.now()}${extension}`;
    cb(null, nombreArchivo);
  }
});

const filtroImagen = (req, file, cb) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  }
};

const subirFotoPerfil = multer({
  storage: storagePerfil,
  fileFilter: filtroImagen,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

router.post('/register', ctrlAuth.registro);
router.post('/login', ctrlAuth.login);

router
  .route('/users/:userid')
  .get(ctrlAuth.usuarioLeerUno)
  .put(subirFotoPerfil.single('fotoPerfil'), ctrlAuth.usuarioActualizar)
  .delete(ctrlAuth.usuarioBorrar);

router.post('/users/:userid/cursos', ctrlAuth.usuarioInscribirCurso);
router.put('/users/:userid/cursos/:cursoid', ctrlAuth.usuarioActualizarProgreso);
router.delete('/users/:userid/cursos/:cursoid', ctrlAuth.usuarioEliminarCurso);
router.post('/users/:userid/cursos/:cursoid/delete', ctrlAuth.usuarioEliminarCurso);

router.get('/users/:userid/progreso/:modulo', ctrlAuth.usuarioLeerProgresoModulo);
router.post('/users/:userid/progreso/:modulo/:ejercicioid', ctrlAuth.usuarioCompletarEjercicioModulo);
router.get('/users/:userid/progreso/cursos/:cursoid', ctrlAuth.usuarioLeerProgresoCurso);
router.post('/users/:userid/progreso/cursos/:cursoid/:ejercicioid', ctrlAuth.usuarioCompletarEjercicioCurso);

router
  .route('/cursos')
  .get(ctrlCursos.cursosListar)
  .post(ctrlCursos.cursosCrear);

router
  .route('/cursos/:cursoid')
  .get(ctrlCursos.cursosLeerUno)
  .put(ctrlCursos.cursosActualizar)
  .delete(ctrlCursos.cursosBorrar);

router.post('/cursos/:cursoid/ejercicios/:ejercicioid/validar', ctrlCursos.validarRespuesta);

router
  .route('/cursos/:cursoid/resenas')
  .get(ctrlResenas.resenasListar)
  .post(ctrlResenas.resenasCrear);

router
  .route('/cursos/:cursoid/resenas/:resenaid')
  .put(ctrlResenas.resenasActualizar)
  .delete(ctrlResenas.resenasBorrar);

router.get('/cursos/:cursoid/calificacion', ctrlResenas.calificacionCurso);

module.exports = router;