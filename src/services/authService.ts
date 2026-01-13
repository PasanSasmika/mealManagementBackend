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

    const usersToCreate = data.map(row => ({
      firstName: row.firstName,
      lastName: row.lastName,
      mobileNumber: row.mobileNumber?.toString(),
      username: row.username,
      role: row.role || 'EMPLOYEE'
    }));

    // Use insertMany with ordered: false to skip duplicates without failing the whole batch
    return await User.insertMany(usersToCreate, { ordered: false });
  }
}