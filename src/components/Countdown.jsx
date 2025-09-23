import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function Countdown({ target = "2025-09-26T00:00:00+03:00", onEnd }) {
  const [diff, setDiff] = useState(getDiff());

  function getDiff() {
    const now = dayjs();
    const end = dayjs(target);
    const ms = Math.max(0, end.diff(now));
    let rest = ms;
    const days = Math.floor(rest / (24*60*60*1000)); rest -= days*24*60*60*1000;
    const hours = Math.floor(rest / (60*60*1000)); rest -= hours*60*60*1000;
    const minutes = Math.floor(rest / (60*1000)); rest -= minutes*60*1000;
    const seconds = Math.floor(rest / 1000);
    return { ms, days, hours, minutes, seconds };
  }

  useEffect(() => {
    const t = setInterval(() => {
      const next = getDiff();
      setDiff(next);
      if (next.ms <= 0) {
        clearInterval(t);
        onEnd && onEnd();
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="countdown">
      {diff.days}g : {String(diff.hours).padStart(2, "0")}s : {String(diff.minutes).padStart(2, "0")}d : {String(diff.seconds).padStart(2, "0")}sn
      <small>“Seninle geçen tam bir yıla 🤍”</small>
    </div>
  );
}