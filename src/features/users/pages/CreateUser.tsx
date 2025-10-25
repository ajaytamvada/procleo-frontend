import React from 'react';
import { toast } from 'react-hot-toast';
import CreateUserForm from '../components/CreateUserForm';
import type { CreateUserRequest } from '@/types/user';

const CreateUser: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCreateUser = async (userData: CreateUserRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      console.log('Creating user:', userData);
      
      // Simulate successful creation
      toast.success('User created successfully!');
      
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CreateUserForm 
      onSubmit={handleCreateUser}
      isLoading={isLoading}
    />
  );
};

export default CreateUser;