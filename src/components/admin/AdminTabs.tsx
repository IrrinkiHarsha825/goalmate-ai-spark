
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminTabs = () => {
  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="verifications">Goal Verifications</TabsTrigger>
      <TabsTrigger value="payments">Legacy Payments</TabsTrigger>
      <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
      <TabsTrigger value="tasks">Task Completions</TabsTrigger>
    </TabsList>
  );
};
