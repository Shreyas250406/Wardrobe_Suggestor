import { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Create Account | AI Wardrobe Suggestor',
  description: 'Join AI Wardrobe Suggestor to digitize your closet and get AI outfit recommendations.',
};

export default function SignUpPage() {
  return <AuthForm initialMode="signup" />;
}
