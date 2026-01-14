import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { User } from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, mobileNumber } = req.body;
    const data = await AuthService.login(username, mobileNumber);
    res.json(data);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const bulkUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Upload an excel file' });
    const result = await AuthService.registerFromExcel(req.file.buffer);
    res.json({ message: 'Users imported', count: result.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await AuthService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update User
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedUser = await AuthService.updateUser(id, req.body);
    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AuthService.deleteUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};