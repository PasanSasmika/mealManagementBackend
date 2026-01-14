import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import * as XLSX from 'xlsx';

export class AuthService {
  // Generate JWT
  static generateToken(user: any) {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '90d' }
    );
  }

  static async login(username: string, mobileNumber: string) {
    const user = await User.findOne({ username, mobileNumber });
    if (!user) throw new Error('Invalid credentials');
    
    const token = this.generateToken(user);
    return { user, token };
  }

  // Excel Bulk Registration
 static async registerFromExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Define allowed roles based on your Model
  const allowedRoles = ['EMPLOYEE', 'CANTEEN', 'MANAGER', 'SADMIN'];

  const usersToCreate = data.map(row => {
    // Clean and Uppercase the role from Excel
    let excelRole = row.role ? String(row.role).trim().toUpperCase() : 'EMPLOYEE';

    // VALIDATION: If the role from Excel is not allowed (like "aaa"), force it to "EMPLOYEE"
    if (!allowedRoles.includes(excelRole)) {
      excelRole = 'EMPLOYEE';
    }

    return {
      firstName: row.firstName,
      lastName: row.lastName,
      mobileNumber: row.mobileNumber?.toString().trim(),
      username: row.username?.toString().trim(),
      role: excelRole 
    };
  });

  // Now, all roles are guaranteed to be valid strings like "EMPLOYEE"
  return await User.insertMany(usersToCreate, { ordered: false });
}

  static async getAllUsers() {
    return await User.find().sort({ createdAt: -1 });
  }

  // Update a user by ID
  static async updateUser(id: string, updateData: any) {
    // { new: true } returns the document after update
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  }

  // Delete a user by ID
  static async deleteUser(id: string) {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw new Error('User not found');
    return deletedUser;
  }
}