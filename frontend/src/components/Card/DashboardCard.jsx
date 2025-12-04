import { motion } from "framer-motion";
import PropTypes from "prop-types";


const DashboardCard = ({ title, value }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        p-6 rounded-2xl
        bg-[#0B1B34]/60
        backdrop-blur-xl
        border border-gold/30
        shadow-lg
        hover:border-gold/60 hover:shadow-gold/20
        transition-all duration-300
      "
    >
      <h3 className="text-gold font-serif text-lg mb-2 tracking-wide">
        {title}
      </h3>

      <p className="text-white font-semibold text-3xl tracking-tight">
        {value}
      </p>
    </motion.div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};


export default DashboardCard;
