import DashboardLayout from "../components/DashboardLayout";
import DashboardCard from "../components/Card/DashboardCard";
import useGetWills from "../hooks/useGetWills";
import WillCardHeader from "../components/Card/WillCardHeader";
import WillsCard from "../components/Card/WillsCard";

const Dashboard = () => {
  const { wills, willsCreated, totalBalance, hasWill, willInfo } = useGetWills();

  // totalBalance is already formatted as a number from useGetWills
  const formattedBalance = totalBalance
    ? `${parseFloat(totalBalance).toFixed(4)} ETH`
    : "0 ETH";

  return (
    <DashboardLayout>
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-serif text-gold tracking-wide">
          Dashboard Overview
        </h1>
        <p className="text-slate/80 mt-2 text-lg">
          Summary of your will, assets, and estate activity.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        <DashboardCard title="Wills Created" value={willsCreated || 0} />

        <DashboardCard title="Total Value Locked" value={formattedBalance} />

        <DashboardCard
          title="My Will Status"
          value={
            hasWill
              ? willInfo?.executed
                ? "Executed"
                : "Active"
              : "No Will Created"
          }
        />
      </div>

      {/* Wills Section */}
      <WillCardHeader>
        {wills && wills.length > 0 ? (
          wills.map((will, idx) => (
            <WillsCard
              key={idx}
              address={will.address}
              timeLeft={Math.max(will.timeLeft, 0)}
              status={
                will.executed
                  ? "Executed"
                  : will.isDead
                  ? "Ready to Execute"
                  : "Active"
              }
              balance={will.balance}
              lastPing={will.lastPing}
              deathTimeout={will.deathTimeout}
              cancelled={will.cancelled}
            />
          ))
        ) : (
          <div className="text-center text-slate/60 py-12">
            <p className="text-xl">No wills found</p>
            <p className="mt-2">Create your first will to get started</p>
          </div>
        )}
      </WillCardHeader>

    </DashboardLayout>
  );
};

export default Dashboard;