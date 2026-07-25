'use server';

import { getDb } from '@/lib/db';
import { sendOTP } from '@/lib/smtp';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const db = await getDb();
    // Allow login by either email or phone
    const user = await db.get('SELECT * FROM users WHERE email = ? OR phone = ?', [email, email]);

    if (!user) {
      return { success: false, error: 'Invalid credentials.' };
    }

    if (user.is_verified === 0) {
      return { success: false, error: 'Please verify your account before logging in.', unverified: true, email: user.email };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Invalid credentials.' };
    }

    // Create session token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return { 
      success: true, 
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user'
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Something went wrong.' };
  }
}

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!name || !email || !phone || !password || !confirmPassword) {
    return { success: false, error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  try {
    const db = await getDb();
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      return { success: false, error: 'Email already registered. Please login.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert unverified user
    await db.run(`
      INSERT INTO users (name, email, phone, password, is_verified) 
      VALUES (?, ?, ?, ?, 0)
    `, [name, email, phone, hashedPassword]);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

    // Invalidate old OTPs for this email and purpose
    await db.run(`
      UPDATE otps SET is_used = 1 WHERE email = ? AND purpose = 'registration'
    `, [email]);

    // Insert new OTP
    await db.run(`
      INSERT INTO otps (email, otp, purpose, expires_at) 
      VALUES (?, ?, 'registration', ?)
    `, [email, otp, expiresAt]);

    // Send OTP email
    const emailSent = await sendOTP(email, otp, 'registration');

    if (!emailSent) {
      return { success: false, error: 'Failed to send OTP email. Please try again.' };
    }

    return { success: true, message: 'OTP sent successfully.' };

  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Something went wrong during registration.' };
  }
}

export async function verifyRegistrationOTP(formData: FormData) {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;

  if (!email || !otp) {
    return { success: false, error: 'Email and OTP are required.' };
  }

  try {
    const db = await getDb();
    
    // Get latest OTP
    const otpRecord = await db.get(`
      SELECT * FROM otps 
      WHERE email = ? AND purpose = 'registration' AND is_used = 0 
      ORDER BY created_at DESC LIMIT 1
    `, [email]);

    if (!otpRecord) {
      return { success: false, error: 'No valid OTP found.' };
    }

    if (otpRecord.otp !== otp) {
      return { success: false, error: 'Invalid OTP.' };
    }

    const now = new Date().toISOString();
    if (otpRecord.expires_at < now) {
      return { success: false, error: 'OTP has expired.' };
    }

    // Mark OTP as used
    await db.run('UPDATE otps SET is_used = 1 WHERE id = ?', [otpRecord.id]);

    // Mark user as verified
    await db.run('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);

    return { success: true, message: 'Registration verified successfully! You can now login.' };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, error: 'Something went wrong during verification.' };
  }
}

export async function resendOTP(formData: FormData) {
  const email = formData.get('email') as string;
  const purpose = formData.get('purpose') as string; // 'registration' or 'reset_password'

  if (!email || !purpose) {
    return { success: false, error: 'Email and purpose are required.' };
  }

  try {
    const db = await getDb();
    
    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Invalidate old OTPs
    await db.run(`
      UPDATE otps SET is_used = 1 WHERE email = ? AND purpose = ?
    `, [email, purpose]);

    // Insert new OTP
    await db.run(`
      INSERT INTO otps (email, otp, purpose, expires_at) 
      VALUES (?, ?, ?, ?)
    `, [email, otp, purpose, expiresAt]);

    // Send email
    const emailSent = await sendOTP(email, otp, purpose);

    if (!emailSent) {
      return { success: false, error: 'Failed to send OTP email.' };
    }

    return { success: true, message: 'OTP resent successfully.' };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { success: false, error: 'Something went wrong while resending OTP.' };
  }
}

export async function sendPasswordResetOTP(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, error: 'Email is required.' };
  }

  try {
    const db = await getDb();
    
    // Check if user exists and is verified
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }
    if (user.is_verified === 0) {
      return { success: false, error: 'Account is not verified. Please register/verify first.' };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await db.run(`
      UPDATE otps SET is_used = 1 WHERE email = ? AND purpose = 'reset_password'
    `, [email]);

    await db.run(`
      INSERT INTO otps (email, otp, purpose, expires_at) 
      VALUES (?, ?, 'reset_password', ?)
    `, [email, otp, expiresAt]);

    const emailSent = await sendOTP(email, otp, 'reset_password');

    if (!emailSent) {
      return { success: false, error: 'Failed to send password reset email.' };
    }

    return { success: true, message: 'Password reset OTP sent.' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Something went wrong.' };
  }
}

export async function verifyResetOTP(formData: FormData) {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;

  if (!email || !otp) {
    return { success: false, error: 'Email and OTP are required.' };
  }

  try {
    const db = await getDb();
    const otpRecord = await db.get(`
      SELECT * FROM otps 
      WHERE email = ? AND purpose = 'reset_password' AND is_used = 0 
      ORDER BY created_at DESC LIMIT 1
    `, [email]);

    if (!otpRecord) {
      return { success: false, error: 'No valid OTP found.' };
    }
    if (otpRecord.otp !== otp) {
      return { success: false, error: 'Invalid OTP.' };
    }
    if (otpRecord.expires_at < new Date().toISOString()) {
      return { success: false, error: 'OTP has expired.' };
    }

    return { success: true, message: 'OTP verified.' };
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return { success: false, error: 'Something went wrong.' };
  }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !otp || !password || !confirmPassword) {
    return { success: false, error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  try {
    const db = await getDb();
    
    // Verify OTP one last time
    const otpRecord = await db.get(`
      SELECT * FROM otps 
      WHERE email = ? AND purpose = 'reset_password' AND is_used = 0 
      ORDER BY created_at DESC LIMIT 1
    `, [email]);

    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expires_at < new Date().toISOString()) {
      return { success: false, error: 'Invalid or expired OTP.' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Mark OTP as used
    await db.run('UPDATE otps SET is_used = 1 WHERE id = ?', [otpRecord.id]);

    return { success: true, message: 'Password reset successfully. You can now login.' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Something went wrong.' };
  }
}
