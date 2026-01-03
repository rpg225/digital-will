
const truncate = (addr) => {
    if (!addr) return ""
  return addr.slice(0, 6) + "..." + addr.slice(-4)
}

export default truncate