import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, Calendar, Search, Download, Trash2 } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  email: string;
  is_subscribed: boolean;
  subscribed_at: string;
}

const UserManager = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
    fetchSubscriptions();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive",
      });
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('member_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch newsletter subscriptions",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      try {
        const { error } = await supabase
          .from('member_subscriptions')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Subscription deleted successfully",
        });
        fetchSubscriptions();
      } catch (error) {
        console.error('Error deleting subscription:', error);
        toast({
          title: "Error",
          description: "Failed to delete subscription",
          variant: "destructive",
        });
      }
    }
  };

  const exportSubscriptions = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Subscribed,Date\n"
      + subscriptions.map(sub => 
          `${sub.email},${sub.is_subscribed ? 'Yes' : 'No'},${new Date(sub.subscribed_at).toLocaleDateString()}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "newsletter_subscriptions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-2xl font-bold text-foreground">User Management</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-elegant border-thai-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admin Users</p>
                <p className="text-3xl font-bold text-foreground">{profiles.length}</p>
              </div>
              <Users className="h-8 w-8 text-thai-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant border-thai-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Newsletter Subscribers</p>
                <p className="text-3xl font-bold text-foreground">{subscriptions.filter(s => s.is_subscribed).length}</p>
              </div>
              <Mail className="h-8 w-8 text-thai-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant border-thai-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Emails</p>
                <p className="text-3xl font-bold text-foreground">{subscriptions.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-thai-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users */}
      <Card className="card-elegant border-thai-gold/20">
        <CardHeader>
          <CardTitle>Admin Users ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    {profile.display_name || "No name set"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{profile.role}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(profile.created_at)}</TableCell>
                  <TableCell>{formatDate(profile.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {profiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No admin users found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Newsletter Subscriptions */}
      <Card className="card-elegant border-thai-gold/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Newsletter Subscriptions ({subscriptions.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" onClick={exportSubscriptions}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>{subscription.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={subscription.is_subscribed ? "default" : "secondary"}
                      className="flex items-center gap-1 w-fit"
                    >
                      <Mail className="h-3 w-3" />
                      {subscription.is_subscribed ? "Subscribed" : "Unsubscribed"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(subscription.subscribed_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubscription(subscription.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No matching subscriptions found." : "No newsletter subscriptions found."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManager;