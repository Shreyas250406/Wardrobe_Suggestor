import { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Sign In | AI Wardrobe Suggestor',
  description: 'Sign in to access your digital wardrobe and AI styling studio.',
};

export default function LoginPage() {
  return <AuthForm initialMode="login" />;
}
