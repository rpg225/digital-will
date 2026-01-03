import truncate from '../utils/truncate'
import CountdownTimer from '../hooks/CountdownTimer'
import formatTime from '../utils/formatTime'


const UserWill = ({ will }) => {
  if (!will) return null;

  return (
    <div className='bg-[#151515] p-4 w-full flex-1 rounded-xl shadow text-[#666]'>
  <h2 className='text-lg font-bold mb-2 text-[#ccc] text-center'>
    Will Details
  </h2>

  <p className='text-[#bbb]'><strong>Beneficiaries:</strong></p>
  <ul className='list-disc list-inside text-[#666]'>
    {will.beneficiaries.map((addr, index) => (
      <li key={index} className='p-3 flex justify-between'>
        <span>{truncate(addr)}</span>
        <span>{will.amounts[index]} ETH</span>
      </li>
    ))}
  </ul>

  <p className='p-3 flex justify-between'>
    <strong className='text-[#bbb]'>Balance:</strong>
    <span>{will.balance} ETH</span>
  </p>

  <p className='p-3 flex justify-between'>
    <strong className='text-[#bbb]'>Unlock Time:</strong>
    <span>{formatTime(will.deathTimeout)}</span>
  </p>

  <p className='p-3 flex justify-between'>
    <strong className='text-[#bbb]'>Last Ping:</strong>
    <span>{new Date(will.lastPing * 1000).toLocaleString()}</span>
  </p>

  <p className='p-3 flex justify-between'>
    <strong className='text-[#bbb]'>Status:</strong>
    <span>{will.status === "ACTIVE" ? "Active" : will.status}</span>
  </p>

  <CountdownTimer
    lastPing={will.lastPing}
    deathTimeout={will.deathTimeout}
    className='text-white text-xl mt-2 text-center font-semibold'
  >
    Will executable in:
  </CountdownTimer>
</div>
  )
}

export default UserWill