import { useState } from 'react';
import { BookmarkPlus } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';

interface SaveSearchDialogProps {
  open: boolean;
  defaultName?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}

export function SaveSearchDialog({ open, defaultName = '', onOpenChange, onSave }: SaveSearchDialogProps) {
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setName('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (nextOpen) setName(defaultName);
      }}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5 text-[#E63462]" />
            Save Search
          </DialogTitle>
          <DialogDescription>Name this search so you can run it again from My Selection & Alerts.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="saved-search-name" className="text-sm font-medium text-[#4A5568]">Search name</label>
          <Input
            id="saved-search-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Kenya education opportunities"
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSave();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save Search</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
