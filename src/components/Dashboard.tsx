
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  PieChart, 
  Settings, 
  Menu, 
  X,
  Package,
  Search,
  Home,
  UserPlus,
  ShoppingCart,
  Bell,
  Receipt,
  FileInput
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import SearchComponent from './SearchComponent';

const Dashboard: React.FC = () => {
  // Default to open sidebar on desktop
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Party Management', path: '/parties', icon: Users },
    { name: 'Invoice & Billing', path: '/invoices', icon: FileText },
    { name: 'Purchase Invoice', path: '/purchase-invoices', icon: Receipt },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle - moved to header for better spacing */}
      
      {/* Sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - narrow design similar to the image */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out border-r border-gray-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:inset-auto" // Always show on desktop
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header - with close button */}
          <div className="p-4 border-b flex items-center justify-between">
            <Link to="/" className="flex items-center" onClick={closeSidebar}>
              <span className="text-xl font-bold text-primary">BizSwift</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="lg:flex"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation items - simplified style to match design */}
          <nav className="mt-4 flex-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium",
                    isActive
                      ? "bg-gray-100 text-primary"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={closeSidebar}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header bar with menu toggle, search and user */}
        <header className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleSidebar}
              className="bg-white mr-4"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SearchComponent />
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              className="text-gray-500"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-medium">
              BS
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
