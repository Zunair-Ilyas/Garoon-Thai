import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Mail, Trash2, Download, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSubscriber {
  email: string;
  is_subscribed: boolean;
  subscribed_at: string;
}

const NewsletterSubscriberManager = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      
      // Load from database
      const { data: dbSubscribers, error: dbError } = await supabase
        .from('member_subscriptions')
        .select('*')
        .eq('is_subscribed', true)
        .order('subscribed_at', { ascending: false });

      if (dbError) {
        console.error('Database fetch failed:', dbError);
        toast({
          title: "Error",
          description: "Failed to load newsletter subscribers",
          variant: "destructive",
        });
        setSubscribers([]);
      } else {
        console.log('Database subscribers:', dbSubscribers);
        setSubscribers(dbSubscribers || []);
      }
      
      console.log('Total subscribers loaded:', subscribers.length);
    } catch (error) {
      console.error('Error loading subscribers:', error);
      setSubscribers([]);
      toast({
        title: "Error",
        description: "Failed to load newsletter subscribers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (subscriber: NewsletterSubscriber) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('member_subscriptions')
        .delete()
        .eq('email', subscriber.email);

      if (dbError) {
        console.error('Database delete failed:', dbError);
        toast({
          title: "Error",
          description: "Failed to remove subscriber from database",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      const updatedSubscribers = subscribers.filter(sub => sub.email !== subscriber.email);
      setSubscribers(updatedSubscribers);
      
      toast({
        title: "Subscriber Removed",
        description: "Newsletter subscriber has been removed successfully",
      });
    } catch (error) {
      console.error('Error removing subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive",
      });
    }
  };

  const exportSubscribers = () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Email,Subscription Status,Subscribed Date\n" +
        subscribers.map(sub => 
          `"${sub.email}","${sub.is_subscribed ? 'Subscribed' : 'Unsubscribed'}","${sub.subscribed_at}"`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "newsletter_subscribers.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Newsletter subscribers have been exported to CSV",
      });
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export subscribers",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getSubscriberCount = () => {
    return subscribers.filter(sub => sub.is_subscribed).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-playfair text-2xl font-bold text-foreground">Newsletter Subscribers</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSubscribers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="hero" onClick={exportSubscribers}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-elegant border-thai-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-thai-gold" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{subscribers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant border-thai-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-bold">{getSubscriberCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant border-thai-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">{subscribers.length - getSubscriberCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elegant border-thai-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-thai-gold" />
            Subscriber List ({subscribers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-thai-gold" />
              <p className="mt-2 text-muted-foreground">Loading subscribers...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No newsletter subscribers found</p>
              <p className="text-sm">Subscribers will appear here when they sign up</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      <Badge variant={subscriber.is_subscribed ? "default" : "secondary"}>
                        {subscriber.is_subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(subscriber.subscribed_at)}</TableCell>
                    <TableCell>
                                              <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubscriber(subscriber)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="card-elegant border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Storage Location: Database</p>
            <p>Total Records: {subscribers.length}</p>
            <p>Last Updated: {new Date().toLocaleString()}</p>
            <p>Note: All data is stored in Supabase database</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterSubscriberManager;
