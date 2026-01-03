import UserWill from './UserWill'
import PingWill from './PingWill'
import CancelWill from './CancelWill'
import CreateWillForm from './WillForm'
import DashboardLayout from './DashboardLayout'
import useGetWills from '../hooks/useGetWills'


const MyWill = () => {
  const { wills, activeWill, loading, refresh } = useGetWills()

  const history = activeWill
    ? wills.filter(w => w.id !== activeWill.id)
    : wills

  return (
    <div className="min-w-3xl mx-auto">
      {activeWill ? (
        <DashboardLayout>
          {loading ? (
            <div className="text-center text-2xl text-white mt-20">
              Loading Will data...
            </div>
          ) : (
            <>
              {/* ACTIVE WILL */}
              <div className="max-w-3xl flex gap-4 items-center mx-auto">
                <UserWill will={activeWill} />
                <div className="flex flex-col gap-4 w-80">
                  <PingWill onPingComplete={refresh} />
                  <CancelWill onCancelComplete={refresh} />
                </div>
              </div>

              {/* HISTORY */}
              <div className="mt-10 max-w-3xl mx-auto">
                <h2 className="text-xl text-white mb-4">
                  Will History
                </h2>

                {history.length === 0 ? (
                  <p className="text-gray-400">
                    No previous wills found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map(will => (
                      <div
                        key={will.id}
                        className="border border-gray-700 rounded p-4 text-white"
                      >
                        <div>Balance: {will.balance} ETH</div>
                        <div>Beneficiaries: {will.beneficiaries.length}</div>
                        <div className="text-xs text-gray-500">
                          Created at: {new Date(will.createdAt * 1000).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DashboardLayout>
      ) : (
        <CreateWillForm onCreateWill={refresh} />
      )}
    </div>
  )
}

export default MyWill
