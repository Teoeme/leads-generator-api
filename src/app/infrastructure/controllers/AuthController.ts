import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoUserRepository } from '../repositories/mongodb/MongoUserRepository';
import config from '../config';
import { StringValue } from 'ms';

export class AuthController {
  private userRepository = new MongoUserRepository();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await this.userRepository.create({
        username,
        email,
        password: hashedPassword
      });

      // Generate JWT
      const token = this.generateToken(user.id!);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT
      const token = this.generateToken(user.id!);

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ message: 'Token is required' });
        return;
      }

      try {
        const decoded = jwt.verify(token, config.jwt.secret as jwt.Secret) as { id: string };
        const user = await this.userRepository.findById(decoded.id);

        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        // Generate new token
        const newToken = this.generateToken(user.id!);

        res.status(200).json({
          message: 'Token refreshed successfully',
          token: newToken
        });
      } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  check = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    try{
      const decoded = jwt.verify(token, config.jwt.secret as jwt.Secret) as { id: string };
      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json({ user });
      
          }catch(error:any){
            res.status(403).json({ message: error?.message || 'Token is invalid' });
          }
  };

  private generateToken(userId: string): string {
    const options: jwt.SignOptions = {
      expiresIn: config.jwt.expiresIn as StringValue
    };
    
    return jwt.sign(
      { id: userId }, 
      config.jwt.secret as jwt.Secret, 
      options
    );
  }
} 