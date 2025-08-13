import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FileText, User } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Ticket = Tables<'tickets'>;
type InternalNote = Tables<'ticket_internal_notes'> & {
  created_by_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

interface InternalNoteModalProps {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteAdded: () => void;
}

export const InternalNoteModal: React.FC<InternalNoteModalProps> = ({
  ticket,
  open,
  onOpenChange,
  onNoteAdded
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState('');

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_internal_notes')
        .select(`
          *,
          created_by_profile:profiles!ticket_internal_notes_created_by_fkey(
            first_name,
            last_name,
            email
          )
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data as any) || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      fetchNotes();
    }
  }, [open, ticket.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newNote.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ticket_internal_notes')
        .insert({
          ticket_id: ticket.id,
          content: newNote.trim(),
          created_by: user.id
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Internal note added successfully' });
      setNewNote('');
      fetchNotes(); // Refresh notes
      onNoteAdded();
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add note',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Internal Notes - {ticket.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Notes */}
          <div className="space-y-4">
            <h3 className="font-medium">Previous Notes</h3>
            {notesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No internal notes yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-primary/20">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="font-medium text-sm">
                          {note.created_by_profile 
                            ? `${note.created_by_profile.first_name} ${note.created_by_profile.last_name}`.trim()
                            : 'Unknown User'
                          }
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Note */}
          <div className="border-t pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note">Add Internal Note</Label>
                <Textarea
                  id="note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a private note for internal team reference..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Internal notes are only visible to admin users and are not shared with customers.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button type="submit" disabled={loading || !newNote.trim()}>
                  {loading ? 'Adding...' : 'Add Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
