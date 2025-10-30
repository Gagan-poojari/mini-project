import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Voting System',
  description: 'School voting system project',
};

export default async function RootLayout({ children }) {
  // Get current user
  let user = null;
  try {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const voter = await prisma.voter.findUnique({
        where: { id: currentUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          hasVoted: true,
        },
      });
      user = voter;
    }
  } catch (error) {
    console.error('Layout auth error:', error);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar user={user} />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}