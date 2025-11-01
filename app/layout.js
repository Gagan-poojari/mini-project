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
  let user = null;
  try {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const userData = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          id: true,
          fname: true,
          lname: true,
          email: true,
          role: true,
        },
      });
      user = userData;
    }
  } catch (error) {
    console.error('Layout auth error:', error);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar user={user} />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}