import { useEffect, useState } from "react";
import { ethers } from "ethers";

const CountdownTimer = ({ lastPing, deathTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!lastPing || !deathTimeout) return;

    // ✅ ENSURE BigNumber math, not JS math
    const lastPingBN = ethers.BigNumber.from(lastPing);
    const timeoutBN = ethers.BigNumber.from(deathTimeout);

    const endTime = lastPingBN.add(timeoutBN);

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const nowBN = ethers.BigNumber.from(now);

      if (nowBN.gte(endTime)) {
        setTimeLeft(0);
        return;
      }

      const diff = endTime.sub(nowBN).toNumber(); // SAFE: seconds, small number
      setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lastPing, deathTimeout]);

  if (timeLeft <= 0) return <span>Expired</span>;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <span>
      {hours}h {minutes}m {seconds}s
    </span>
  );
};

export default CountdownTimer;
