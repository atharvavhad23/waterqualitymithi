// client/pages/Dashboard.jsx
import DashboardLayout from "./DashboardLayout";
import RiverList from "./RiverList";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Rivers Overview</h1>
        <RiverList />
      </div>
    </DashboardLayout>
  );
}
