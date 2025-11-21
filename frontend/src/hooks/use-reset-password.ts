import { useMutation } from '@apollo/client/react';
import { RESET_PASSWORD } from '@/graphql/mutations/employees';
import { toast } from 'sonner';

export function useResetPassword() {
  const [resetPasswordMutation, { loading, error }] = useMutation(RESET_PASSWORD, {
    onCompleted: () => {
      toast.success('Password has been reset successfully');
    },
    onError: (error) => {
      toast.error(`Failed to reset password: ${error.message}`);
    },
  });

  const resetPassword = async (employeeId: string, newPassword: string) => {
    try {
      await resetPasswordMutation({
        variables: {
          employeeId,
          newPassword,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    resetPassword,
    loading,
    error,
  };
}

