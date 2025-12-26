'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  User,
  Bell,
  Shield,
  Moon,
  LogOut,
  Trash2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'notifications' | 'account';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'account' as const, label: 'Account', icon: Shield },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-foreground-secondary mt-1">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left',
                  'text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-900 dark:bg-primary-800/50 dark:text-primary-100'
                    : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-primary-300">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-xs text-foreground-muted mt-1">
                      JPG or PNG. Max 1MB.
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={session?.user?.name || ''}
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={session?.user?.email || ''}
                    disabled
                  />
                  <p className="text-xs text-foreground-muted">
                    Email cannot be changed.
                  </p>
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-foreground-secondary">
                      Receive analysis completion alerts via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Weekly Summary</p>
                    <p className="text-sm text-foreground-secondary">
                      Get a weekly digest of your progress
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">Theme</p>
                    <p className="text-sm text-foreground-secondary">
                      Toggle between light and dark mode
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>
                    Manage your account security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="secondary">
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                  <CardDescription>
                    Download a copy of your data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-danger-500/30">
                <CardHeader>
                  <CardTitle className="text-danger-600 dark:text-danger-500">
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that affect your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="secondary"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>

                  <Button variant="danger">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
