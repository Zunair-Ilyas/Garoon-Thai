import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Mail, Trash2, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

const ContactMessageManager = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : defaultMessage,
      variant: "destructive",
    });
  }, [toast]);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: dbMessages, error: dbError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        handleError(dbError, "Failed to load contact messages");
        setMessages([]);
        return;
      }

      if (!dbMessages) {
        setMessages([]);
        return;
      }

      setMessages(dbMessages as ContactMessage[]);
    } catch (error) {
      handleError(error, "Failed to load contact messages");
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const deleteMessage = async (message: ContactMessage) => {
    setIsLoading(true);
    try {
      if (!message.id) {
        handleError(new Error("Invalid message data"), "Failed to delete message");
        return;
      }
      const { error: dbError } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', message.id);
      if (dbError) {
        handleError(dbError, "Failed to delete message");
        return;
      }
      setMessages(messages.filter(msg => msg.id !== message.id));
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error) {
      handleError(error, "Failed to delete message");
    } finally {
      setIsLoading(false);
      setMessageToDelete(null);
    }
  };

  const sanitizeInput = (input: string | undefined): string => {
    if (!input) return '';
    return input.replace(/[<>]/g, '').trim();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportMessages = () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Name,Email,Message,Created At\n"
        + messages.map(msg =>
            `"${msg.name}","${msg.email}","${msg.message}","${msg.created_at}"`
          ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "contact_messages.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Contact messages have been exported to CSV",
      });
    } catch (error) {
      console.error('Error exporting messages:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export messages",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-playfair text-2xl font-bold text-foreground">Contact Messages</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadMessages}>
            Refresh
          </Button>
          <Button variant="hero" onClick={exportMessages}>
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="card-elegant border-thai-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-thai-gold" />
            Contact Form Messages ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contact messages found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{formatDate(message.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMessageToDelete(message)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => messageToDelete && deleteMessage(messageToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Message Detail Modal with improved accessibility */}
      {selectedMessage && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-detail-title"
        >
          <div 
            className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Message Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMessage(null)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">From:</label>
                <p className="font-medium">{selectedMessage.name} ({selectedMessage.email})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date:</label>
                <p>{formatDate(selectedMessage.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Message:</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => window.open(`mailto:${selectedMessage.email}`)}
              >
                Reply via Email
              </Button>
              <Button onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessageManager;
