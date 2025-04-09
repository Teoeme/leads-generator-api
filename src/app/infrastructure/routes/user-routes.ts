import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Middleware para proteger rutas
const authenticate = passport.authenticate('jwt', { session: false });

// Ejemplo de ruta protegida
router.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router; 