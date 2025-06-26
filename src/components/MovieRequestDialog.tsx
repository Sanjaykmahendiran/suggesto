import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogDescription } from '@radix-ui/react-dialog';

export default function MovieRequestDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [language, setLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    const userId = Cookies.get('userID');

    if (!userId) {
      alert('User ID not found in cookies.');
      return;
    }

    const payload = {
      gofor: 'movierequest',
      user_id: userId,
      name: title,
      year,
      language,
    };

    try {
      setIsSubmitting(true);

      const response = await fetch('https://suggesto.xyz/App/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit movie request');

      // Reset form and show success popup
      setTitle('');
      setYear('');
      setLanguage('');
      setShowSuccess(true);

      // Close the form dialog
      onClose();

      // Automatically hide success popup after 2.5 seconds
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Request Form Dialog */}
      <div className="fixed bottom-20 right-4 z-10">
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="bg-[#1f1f21] text-white border-[#3f3f5a] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Request Movie</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-4">
                Enter the movie details manually if you can't find it in the search results.
              </p>
              <div className="space-y-4">
                <Input
                  id="movie-title"
                  placeholder="Enter movie title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#2b2b2b]"
                />

                <div>
                  <label htmlFor="release-year" className="block text-sm font-medium mb-1">
                    Release Year
                  </label>
                  <Input
                    id="release-year"
                    placeholder="YYYY"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-[#2b2b2b]"
                  />
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium mb-1">
                    Language
                  </label>
                  <Input
                    id="language"
                    placeholder="Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#2b2b2b] "
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Popup */}
      <Dialog open={showSuccess} onOpenChange={() => setShowSuccess(false)}>
        <DialogContent className="bg-green-600 text-white border-none sm:max-w-[300px] text-center">
          <DialogHeader>
            <DialogTitle>✅ Request Sent!</DialogTitle>
            <DialogDescription className="text-white mt-2">
              Your movie request was successfully submitted.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
