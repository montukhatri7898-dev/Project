import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Copy, Check, Percent, ArrowRight, BadgePercent } from 'lucide-react';
import { Promotion } from '../types/index.js';
import { api } from '../api/client.js';
import { STATIC_PROMOTIONS } from '../data/imoviesStaticDb.js';

interface PromotionsProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const Promotions: React.FC<PromotionsProps> = ({ onNavigate }) => {
  const [promotions, setPromotions] = useState<Promotion[]>(STATIC_PROMOTIONS);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await api.getPromotions();
      if (res?.success && res.data?.length > 0) {
        setPromotions(res.data);
      }
    } catch (err) {
      console.warn('Using static promotions on published site:', err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-white/5 rounded-xl animate-pulse border border-white/5" />
          ))}
        </div>
      </section>
    );
  }

  if (promotions.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-red-500" />
            Special Offers & Cinema Discounts
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Use verified promotional codes at checkout for instant savings on Indian blockbusters and IMAX experiences
          </p>
        </div>
      </div>

      {/* Promotions Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {promotions.map((promo) => {
          const isCopied = copiedCode === promo.code;
          return (
            <div
              key={promo._id}
              className={`relative rounded-xl p-5 border border-white/10 bg-gradient-to-br ${
                promo.bannerGradient || 'from-white/5 to-white/0'
              } flex flex-col justify-between hover:border-white/20 transition-all shadow-lg hover:shadow-xl group`}
            >
              <div>
                {/* Top Badge & Discount */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">
                    {promo.badge}
                  </span>
                  <div className="text-sm font-extrabold text-white font-mono flex items-center gap-0.5">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `₹${promo.discountValue} OFF`}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-red-400 transition-colors line-clamp-1">
                  {promo.title}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 mb-3">
                  {promo.description}
                </p>

                {promo.featuredMovieTitle && (
                  <div className="text-[11px] text-amber-300/90 font-medium mb-3 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Valid on: {promo.featuredMovieTitle}</span>
                  </div>
                )}
              </div>

              {/* Promo Code Copy Box */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between gap-2 bg-[#0B0C10]/80 border border-white/10 rounded-lg p-1.5 pl-2.5">
                  <span className="text-xs font-mono font-bold text-white tracking-wider">
                    {promo.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(promo.code)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all flex items-center gap-1 cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 hover:bg-red-600 text-gray-200 hover:text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2">
                  <span>Valid till {new Date(promo.validUntil).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  {promo.minBookingAmount && <span>Min order ₹{promo.minBookingAmount}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
