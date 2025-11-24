'use client';

import dynamic from 'next/dynamic';

const ProfileScreen = dynamic(
  () => import('@/screens/auth/ProfileScreen'),
  { ssr: false }
);

export default function ProfilePage() {
  return <ProfileScreen />;
}
