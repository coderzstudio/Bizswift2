
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  Trash, 
  FileText, 
  Calendar,
  ArrowDown,
  ArrowUp,
  Receipt,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useApp } from '@/contexts/AppContext';

const PurchaseInvoicesPage: React.FC = () => {
  const { invoices, parties, removeInvoice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter purchase invoices (for suppliers)
  const purchaseInvoices = invoices.filter(invoice => {
    const party = parties.find(p => p.id === invoice.partyId);
    return party && party.type === 'supplier';
  });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const filteredInvoices = purchaseInvoices.filter((invoice) => {
    const party = parties.find(p => p.id === invoice.partyId);
    
    // Apply status filter if set
    if (filterStatus && invoice.status !== filterStatus) {
      return false;
    }
    
    // Apply search term filter
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (party && party.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      invoice.date.includes(searchTerm) ||
      invoice.status.includes(searchTerm.toLowerCase())
    );
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let compareA, compareB;
    
    if (sortField === 'date') {
      compareA = new Date(a.date).getTime();
      compareB = new Date(b.date).getTime();
    } else if (sortField === 'amount') {
      compareA = a.total;
      compareB = b.total;
    } else if (sortField === 'party') {
      const partyA = parties.find(p => p.id === a.partyId);
      const partyB = parties.find(p => p.id === b.partyId);
      compareA = partyA ? partyA.name.toLowerCase() : '';
      compareB = partyB ? partyB.name.toLowerCase() : '';
    } else {
      compareA = a[sortField as keyof typeof a];
      compareB = b[sortField as keyof typeof b];
    }
    
    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDeleteInvoice = (id: string) => {
    removeInvoice(id);
    setConfirmDelete(null);
    toast({
      title: 'Invoice Deleted',
      description: 'The purchase invoice has been deleted successfully.',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPartyName = (partyId: string) => {
    const party = parties.find(p => p.id === partyId);
    return party ? party.name : 'Unknown Supplier';
  };

  const handleNewPurchaseInvoice = () => {
    // Filter for suppliers only when creating purchase invoice
    const suppliers = parties.filter(p => p.type === 'supplier');
    
    if (suppliers.length === 0) {
      toast({
        title: 'No Suppliers Found',
        description: 'Please create a supplier before creating a purchase invoice.',
        variant: 'destructive',
      });
      return;
    }
    
    navigate('/invoices/new?type=purchase');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Invoices</h1>
          <p className="text-muted-foreground">Manage your purchase invoices from suppliers</p>
        </div>
        <Button onClick={handleNewPurchaseInvoice}>
          <Plus className="mr-2 h-4 w-4" /> Create Purchase Invoice
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search purchase invoices..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" />
              {filterStatus ? `Status: ${filterStatus}` : 'Filter'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterStatus(null)}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('paid')}>
              Paid
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('unpaid')}>
              Unpaid
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {sortedInvoices.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Receipt className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No purchase invoices found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm || filterStatus
              ? 'Try adjusting your search or filter terms'
              : 'Get started by creating your first purchase invoice'}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleNewPurchaseInvoice}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Purchase Invoice
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('invoiceNumber')}>
                  <div className="flex items-center">
                    Invoice Number
                    {getSortIcon('invoiceNumber')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('party')}>
                  <div className="flex items-center">
                    Supplier
                    {getSortIcon('party')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('date')}>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Date
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center justify-end">
                    Amount
                    {getSortIcon('amount')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{getPartyName(invoice.partyId)}</TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell className="text-right">₹{invoice.total.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className="capitalize">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Dialog open={confirmDelete === invoice.id} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setConfirmDelete(invoice.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Purchase Invoice</DialogTitle>
                          </DialogHeader>
                          <p>Are you sure you want to delete purchase invoice {invoice.invoiceNumber}? This action cannot be undone.</p>
                          <div className="flex justify-end space-x-2 pt-4">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button 
                              variant="destructive"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoicesPage;
