import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/User';

// Extender la interfaz Request para añadir propiedad user
declare global {
  namespace Express {
    interface Request {
      user?: User; // Cambiado de any a User para ser más específico
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Obtener el token de autorización del encabezado
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    // El formato normalmente es "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
      }
      
      // Si el token es válido, almacenar el usuario en el objeto request
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Autenticación requerida' });
  }
}; 