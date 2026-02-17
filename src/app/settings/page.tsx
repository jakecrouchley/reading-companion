'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, MessageSquare } from 'lucide-react';
import { useSavedBooksStore, useUserStore } from '@/stores';

export default function SettingsPage() {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const resetUserStore = useUserStore((s) => s.reset);
  const savedBooks = useSavedBooksStore((s) => s.savedBooks);

  const handleClearAllData = () => {
    // Clear saved books by removing each one
    useSavedBooksStore.setState({ savedBooks: [] });
    // Reset user preferences
    resetUserStore();
    // Close dialog and go back
    setShowConfirmDialog(false);
    router.push('/');
  };

  return (
    <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-4 pt-6 pb-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2.5 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </header>

      <div className="px-4 space-y-3">
        <a
          href="mailto:dowds.louise@gmail.com?subject=Reading Companion Feedback"
          className="block w-full p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare size={20} className="text-primary-500" />
            <span className="font-medium text-gray-900">Share feedback</span>
          </div>
          <p className="text-sm text-gray-500">
            I'd love to hear your feedback, frustrations and ideas for future development! Please share all feedback to dowds.louise@gmail.com
          </p>
        </a>

        <button
          onClick={() => setShowConfirmDialog(true)}
          className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Trash2 size={20} className="text-red-500" />
          <span className="text-red-500 font-medium">Clear all data</span>
        </button>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-gray-600 mb-6">
              This will clear all data on this device.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className="flex-1 px-4 py-2.5 bg-red-500 rounded-lg font-medium text-white hover:bg-red-600 active:bg-red-700 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
