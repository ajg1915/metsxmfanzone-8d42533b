import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Filter, RefreshCw, Search, Trash2, User, Shield, AlertTriangle, Server } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type LogType = 'all' | 'admin' | 'user' | 'system' | 'error';

const ActivityLogs = () => {
  const [logTypeFilter, setLogTypeFilter] = useState<LogType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(100);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['activity-logs', logTypeFilter, limit],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (logTypeFilter !== 'all') {
        query = query.eq('log_type', logTypeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleClearOldLogs = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) {
      toast.error('Failed to clear old logs');
    } else {
      toast.success('Cleared logs older than 30 days');
      refetch();
    }
  };

  const getLogTypeIcon = (logType: string) => {
    switch (logType) {
      case 'admin': return <Shield className="h-3.5 w-3.5" />;
      case 'user': return <User className="h-3.5 w-3.5" />;
      case 'system': return <Server className="h-3.5 w-3.5" />;
      case 'error': return <AlertTriangle className="h-3.5 w-3.5" />;
      default: return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const getLogTypeBadgeVariant = (logType: string) => {
    switch (logType) {
      case 'admin': return 'default';
      case 'user': return 'secondary';
      case 'system': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredLogs = logs?.filter(log => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(searchLower) ||
      log.resource_type?.toLowerCase().includes(searchLower) ||
      log.resource_id?.toLowerCase().includes(searchLower) ||
      (log.profiles as { email?: string; full_name?: string })?.email?.toLowerCase().includes(searchLower) ||
      (log.profiles as { email?: string; full_name?: string })?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const logStats = {
    total: logs?.length || 0,
    admin: logs?.filter(l => l.log_type === 'admin').length || 0,
    user: logs?.filter(l => l.log_type === 'user').length || 0,
    system: logs?.filter(l => l.log_type === 'system').length || 0,
    error: logs?.filter(l => l.log_type === 'error').length || 0,
  };

  return (
    <div className="space-y-4 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Logs
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearOldLogs}>
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clear 30+ Days
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-xl font-bold">{logStats.total}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" /> Admin
          </div>
          <div className="text-xl font-bold text-primary">{logStats.admin}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" /> User
          </div>
          <div className="text-xl font-bold text-blue-500">{logStats.user}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Server className="h-3 w-3" /> System
          </div>
          <div className="text-xl font-bold text-gray-500">{logStats.system}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Errors
          </div>
          <div className="text-xl font-bold text-destructive">{logStats.error}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <Select value={logTypeFilter} onValueChange={(v) => setLogTypeFilter(v as LogType)}>
              <SelectTrigger className="w-full sm:w-32 h-9 text-sm">
                <SelectValue placeholder="Log Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
              <SelectTrigger className="w-full sm:w-24 h-9 text-sm">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="250">250</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-28">Timestamp</TableHead>
                    <TableHead className="text-xs w-20">Type</TableHead>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Resource</TableHead>
                    <TableHead className="text-xs">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs?.map((log) => (
                      <TableRow key={log.id} className="text-xs">
                        <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getLogTypeBadgeVariant(log.log_type)} className="text-[10px] gap-0.5 px-1.5 py-0">
                            {getLogTypeIcon(log.log_type)}
                            {log.log_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-28 truncate">
                          {(log.profiles as { email?: string })?.email || 'System'}
                        </TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.resource_type && (
                            <span>
                              {log.resource_type}
                              {log.resource_id && (
                                <span className="text-[10px] ml-1">#{log.resource_id.slice(0, 8)}</span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-40 truncate text-muted-foreground">
                          {log.details && Object.keys(log.details as object).length > 0 
                            ? JSON.stringify(log.details).slice(0, 50) 
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;
