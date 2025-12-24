export interface DashboardStats {
  totalPurchaseOrders: number;
  totalVendors: number;
  totalPurchaseRequests: number;
  totalGRNs: number;
  totalSpend: number;
  currentMonthSpend: number;
  lastMonthSpend: number;
  totalSpendFormatted: string;
  spendChangePercentage: number;
  pendingApprovals: number;
  activeRFPs: number;
  totalRFPs: number;
  pendingPRs: number;
  approvedPRs: number;
  rejectedPRs: number;
  pendingPOs: number;
  overduePOs: number;
}

export interface RecentPurchaseOrder {
  id: number;
  poNumber: string;
  supplierName: string;
  totalAmount: number;
  status: string;
  poDate: string;
}

export interface MonthlySpend {
  month: string;
  spend: number;
  budget: number;
  orders: number;
}

export interface CategorySpend {
  name: string;
  value: number;
  color: string;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
  color: string;
}

export interface SourcingEvent {
  id: string;
  title: string;
  startPrice: number;
  currentLowest: number;
  savedPercentage: number;
  timeLeftSeconds: number;
  isLive: boolean;
  rfpNumber: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentPurchaseOrder[];
  monthlySpend: MonthlySpend[];
  categorySpend: CategorySpend[];
  orderStatusDistribution: OrderStatusDistribution[];
  sourcingEvents: SourcingEvent[];
}
