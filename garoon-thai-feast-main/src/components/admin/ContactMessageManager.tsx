import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Mail, Trash2, Eye, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: string;
}

const ContactMessageManager = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      // Load contact form submissions from database
      const { data: dbMessages, error: dbError } = await supabase
        .from('member_subscriptions')
        .select('*')
        .eq('is_subscribed', false)
        .not('metadata', 'is', null)
        .order('subscribed_at', { ascending: false });

      if (dbError) {
        console.error('Database fetch failed:', dbError);
        toast({
          title: "Error",
          description: "Failed to load contact messages",
          variant: "destructive",
        });
        setMessages([]);
      } else {
        console.log('Database contact messages:', dbMessages);
        
        // Convert database messages to contact message format
        const dbContactMessages = (dbMessages || []).map((dbMsg: any) => ({
          name: dbMsg.metadata?.name || 'Unknown',
          email: dbMsg.email,
          subject: dbMsg.metadata?.subject || 'Contact Form Submission',
          message: dbMsg.metadata?.message || '',
          timestamp: dbMsg.subscribed_at,
          status: 'pending'
        }));
        
        setMessages(dbContactMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const deleteMessage = async (message: ContactMessage) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('member_subscriptions')
        .delete()
        .eq('email', message.email)
        .eq('metadata->>type', 'contact_form');

      if (dbError) {
        console.error('Database delete failed:', dbError);
        toast({
          title: "Error",
          description: "Failed to delete message from database",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      const updatedMessages = messages.filter(msg => 
        msg.email !== message.email || msg.timestamp !== message.timestamp
      );
      setMessages(updatedMessages);
      
      toast({
        title: "Message Deleted",
        description: "Contact message has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (message: ContactMessage) => {
    try {
      // Update status in database (we'll add a status field to metadata)
      const { error: dbError } = await supabase
        .from('member_subscriptions')
        .update({
          metadata: {
            ...message,
            status: 'read'
          }
        })
        .eq('email', message.email)
        .eq('metadata->>type', 'contact_form');

      if (dbError) {
        console.error('Database update failed:', dbError);
        toast({
          title: "Error",
          description: "Failed to update message status",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      const updatedMessages = messages.map(msg => 
        msg.email === message.email && msg.timestamp === message.timestamp
          ? { ...msg, status: 'read' }
          : msg
      );
      setMessages(updatedMessages);
      
      toast({
        title: "Message Marked as Read",
        description: "Message status updated successfully",
      });
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportMessages = () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Name,Email,Subject,Message,Timestamp,Status\n"
        + messages.map(msg => 
            `"${msg.name}","${msg.email}","${msg.subject}","${msg.message}","${msg.timestamp}","${msg.status}"`
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
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contact messages found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>{formatDate(message.timestamp)}</TableCell>
                    <TableCell>
                      <Badge variant={message.status === 'read' ? "default" : "secondary"}>
                        {message.status === 'read' ? 'Read' : 'New'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {message.status !== 'read' && (
                                                  <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(message)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMessage(message)}
                        className="text-destructive hover:text-destructive"
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
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
                <label className="text-sm font-medium text-muted-foreground">Subject:</label>
                <p>{selectedMessage.subject}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date:</label>
                <p>{formatDate(selectedMessage.timestamp)}</p>
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
                onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
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
