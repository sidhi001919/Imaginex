import React, { useContext } from "react";
import { assets, plans } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";
import Logo from "../components/Logo";

const BuyCredit = () => {
  const { backendUrl, loadCreditsData, user, token, setShowLogin } =
    useContext(AppContext);

  const navigate = useNavigate();

  const initPay = async (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Credits Payment",
      description: "Credits Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verify-razor",
            response,
            { headers: { token } }
          );
          if (data.success) {
            loadCreditsData();
            navigate("/");
            toast.success("Credit Added");
          }
        } catch (error) {
          toast.error(error.message);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const paymentRazorpay = async (planId) => {
    try {
      if (!user) {
        setShowLogin(true);
      }

      const { data } = await axios.post(
        backendUrl + "/api/user/pay-razor",
        { planId },
        { headers: { token } }
      );
      if (data.success) {
        initPay(data.order);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div
      className="min-h-[80vh] text-center pt-14 mb-10"
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <button className="border border-blue-600 text-blue-600 px-10 py-2 rounded-full mb-6 hover:bg-blue-600 hover:text-white transition-all">
        Our Plans
      </button>
      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10 text-blue-600">
        Choose the plan
      </h1>
      <div className="flex flex-wrap justify-center gap-8 text-left max-w-7xl mx-auto">
        {plans.map((item, index) => (
          <div
            className="bg-white shadow-lg hover:shadow-xl border border-gray-200 rounded-2xl py-8 px-8 text-gray-700 hover:scale-102 transition-all duration-300 w-full sm:w-96"
            key={index}
          >
            <div className="flex items-center justify-between">
              <Logo className="w-24 h-24" />
              <span className="text-lg font-semibold text-orange-500 bg-orange-50 px-4 py-1 rounded-full">
                {item.id}
              </span>
            </div>
            <p className="mt-6 text-base text-gray-600">{item.desc}</p>
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-blue-600">
                  ₹{item.price}
                </span>
                <span className="text-gray-500 mb-1">
                  / {item.credits} credits
                </span>
              </div>
              <button
                onClick={() => paymentRazorpay(item.id)}
                className="w-full flex justify-center items-center gap-2 mt-6 text-base font-medium rounded-xl py-3 bg-orange-500 text-white hover:bg-orange-400 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredit;
