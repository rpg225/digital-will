import UserWill from './UserWill'
import PingWill from './PingWill'
import CancelWill from './CancelWill'
import CreateWillForm from './WillForm'
import DashboardLayout from './DashboardLayout'
import useGetWills from '../hooks/useGetWills'
<<<<<<< HEAD


const MyWill = () => {
  const { wills, activeWill, loading, refresh } = useGetWills()

  const history = activeWill
    ? wills.filter(w => w.id !== activeWill.id)
    : wills

  return (
  <div className="min-w-3xl mx-auto">
    <DashboardLayout>
      {loading ? (
        <div className="text-center text-2xl text-white mt-20">
          Loading Will data...
        </div>
      ) : activeWill ? (
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
            <h2 className="text-xl text-white mb-4">Will History</h2>
            {history.length === 0 ? (
              <p className="text-gray-400">No previous wills found.</p>
            ) : (
              <div className="space-y-4">
                {history.map(will => (
                  <div key={will.id} className="border border-gray-700 rounded p-4 text-white">
                    <div>Balance: {will.balance} ETH</div>
                    <div>Beneficiaries: {will.beneficiaries.length}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-400 text-center mt-20">
          You don’t have an active will.  
          Use <strong>Create Will</strong> to get started.
        </p>
      )}
    </DashboardLayout>
  </div>
);

=======

const MyWill = () => {
    const [loading, setLoading] = useState(true)
    const [beneficiaries, setBeneficiaries] = useState(null)
    const [amounts, setAmounts] = useState(null)

    const { walletAddress, contract} = useContract()
    const {willInfo, hasWill, fetchAllWills} = useGetWills()

    const fetchWillInfo = async () => {
        if (!contract || !walletAddress) return

        try {
            const filter = await contract.filters.WillCreated(walletAddress)
            const logs = await contract.queryFilter(filter)

            if (logs?.length > 0) {
            const willEvent = logs[logs.length - 1]
            const { beneficiaries, amounts, } = willEvent.args
            
            setBeneficiaries(beneficiaries)
            setAmounts(amounts)

            if(fetchAllWills) fetchAllWills();

            }

        } catch (error) {
            const message = error?.error?.message || error?.message || error;
            console.error(message);
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWillInfo();
    }, [contract, walletAddress])

  return (
    <>
        <div className='min-w-3xl mx-auto'>
            {hasWill ? (
                <DashboardLayout>
                    {loading ? (
                        <div className='text-center text-2xl text-white mt-20'> Loading Will data...</div>
                    ):(
                        <div className=' max-w-3xl flex gap-4 items-center mx-auto'>
                            <UserWill willInfo={willInfo} beneficiaries={beneficiaries} amounts={amounts} />
                            <div className='flex flex-col justify-center items-center gap-4 w-80'>
                                <PingWill onPingComplete={fetchWillInfo} />
                                <CancelWill onCancelComplete={fetchWillInfo} />
                            </div>
                        </div>
                    )
                    }
                </DashboardLayout>
            ) : (
                <CreateWillForm onCreateWill={fetchWillInfo} />
            )}
        </div>
    </>
         
  )
>>>>>>> parent of 52c3490 (Fix: Display all wills including executed ones as transaction history)
}

export default MyWill