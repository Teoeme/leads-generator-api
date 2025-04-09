import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './infrastructure/config';
import routes from './infrastructure/routes';
import './infrastructure/auth/passport-config';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: config.server.nodeEnv === 'development' ? '*' : config.server.frontendUrl,
  credentials: true,
}
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(passport.initialize());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Database connection
mongoose
  .connect(config.database.url)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    app.listen(config.server.port, () => {
      console.log(`Server running on port ${config.server.port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app;
