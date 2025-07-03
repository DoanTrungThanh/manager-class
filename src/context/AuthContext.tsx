import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { usersService } from '../lib/supabaseService';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changePassword: (userId: string, newPassword: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default users for demo
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@school.com',
    role: 'admin',
    createdAt: '2024-01-01',
    password: 'password',
    isActive: true,
    lastLogin: new Date().toISOString(),
    gender: 'male',
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@school.com',
    role: 'manager',
    createdAt: '2024-01-01',
    password: 'password',
    isActive: true,
    lastLogin: '2024-01-15T10:30:00Z',
    gender: 'male',
  },
  {
    id: '3',
    name: 'Teacher User',
    email: 'teacher@school.com',
    role: 'teacher',
    createdAt: '2024-01-01',
    password: 'password',
    isActive: true,
    lastLogin: '2024-01-14T14:20:00Z',
    gender: 'female',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from Supabase
  const loadUsers = async () => {
    try {
      const usersData = await usersService.getAll();
      
      // If no users exist, create default users
      if (usersData.length === 0) {
        console.log('No users found, creating default users...');
        for (const defaultUser of defaultUsers) {
          try {
            await usersService.create(defaultUser);
          } catch (error) {
            console.error('Error creating default user:', error);
          }
        }
        // Reload users after creating defaults
        const newUsersData = await usersService.getAll();
        setUsers(newUsersData);
      } else {
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to default users if Supabase is not available
      setUsers(defaultUsers);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Check for saved user session
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('user');
        }
      }
      
      await loadUsers();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUsers = async () => {
    await loadUsers();
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Try to authenticate with Supabase first
      const foundUser = await usersService.authenticate(email, password);
      
      if (foundUser && foundUser.isActive) {
        // Update last login
        const updatedUser = { 
          ...foundUser, 
          lastLogin: new Date().toISOString() 
        };
        
        await usersService.update(foundUser.id, { lastLogin: updatedUser.lastLogin });
        
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === foundUser.id ? updatedUser : u));
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsLoading(false);
        return true;
      }
      
      // Fallback to local users if Supabase fails
      const localUser = users.find(u => u.email === email && u.isActive);
      if (localUser && localUser.password === password) {
        const updatedUser = { ...localUser, lastLogin: new Date().toISOString() };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to local authentication
      const localUser = users.find(u => u.email === email && u.isActive);
      if (localUser && localUser.password === password) {
        const updatedUser = { ...localUser, lastLogin: new Date().toISOString() };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const newUser = await usersService.create({
        ...userData,
        isActive: true,
      });
      setUsers(prev => [newUser, ...prev]);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const updatedUser = await usersService.update(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      
      // Update current user if it's the same user
      if (user && user.id === id) {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const changePassword = async (userId: string, newPassword: string) => {
    try {
      await usersService.update(userId, { password: newPassword });
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, password: newPassword } : u
      ));
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      login, 
      logout, 
      isLoading, 
      addUser, 
      updateUser, 
      deleteUser, 
      changePassword,
      refreshUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}