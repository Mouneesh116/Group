// Filter.jsx
import React, { useState, useEffect, useMemo } from "react";
import "./Filter.css";

const DEFAULT_RANGE = { label: "All", min: null, max: null };

// format rupee with Indian grouping
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

// build buckets with fixed step (1000 by default)
function buildBucketsFixedStep(min, max, stepSize = 1000, maxBuckets = 15) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    return [DEFAULT_RANGE];
  }

  const start = 0;
  const needed = Math.ceil((max - start + 1) / stepSize);
  const buckets = Math.min(needed, maxBuckets);

  const ranges = [DEFAULT_RANGE];

  for (let i = 0; i < buckets; i++) {
    const bmin = start + i * stepSize;
    const bmax = start + (i + 1) * stepSize - 1;

    if (i === 0) {
      ranges.push({ label: `Under ₹${fmt(stepSize)}`, min: bmin, max: bmax });
    } else if (i === buckets - 1 && needed > buckets) {
      ranges.push({ label: `₹${fmt(bmin)} - ₹${fmt(bmax)}`, min: bmin, max: bmax });
      ranges.push({ label: `Over ₹${fmt(bmax)}`, min: bmax + 1, max: null });
    } else if (i === buckets - 1) {
      ranges.push({ label: `₹${fmt(bmin)} - ₹${fmt(bmax)}`, min: bmin, max: bmax });
      if (bmax < max) ranges.push({ label: `Over ₹${fmt(bmax)}`, min: bmax + 1, max: null });
    } else {
      ranges.push({ label: `₹${fmt(bmin)} - ₹${fmt(bmax)}`, min: bmin, max: bmax });
    }
  }

  // dedupe safe-guard
  const dedup = [];
  for (const r of ranges) {
    if (!dedup.some((x) => String(x.min) === String(r.min) && String(x.max) === String(r.max))) {
      dedup.push(r);
    }
  }

  return dedup;
}

const Filter = ({
  category = null,
  subCategories = [],
  onFilter = () => {},
  onCloseFilter = () => {},
  data = [],
  stepSize = 1000,
  maxBuckets = 15,
}) => {
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [selectedPriceRangeLabel, setSelectedPriceRangeLabel] = useState(DEFAULT_RANGE.label);
  const [priceRanges, setPriceRanges] = useState([DEFAULT_RANGE]);
  const [pendingFilter, setPendingFilter] = useState({ subCategory: null, minPrice: null, maxPrice: null });

  // derive numeric prices for the scope (category or all)
  const pricesForScope = useMemo(() => {
    const items = Array.isArray(data) ? data : [];

    const normalizedCategory = (() => {
      if (!category && category !== 0) return null;
      if (typeof category === "string") return category.trim().toLowerCase();
      if (typeof category === "object") return (category.name || category.title || category._id || "").toString().trim().toLowerCase();
      return String(category).trim().toLowerCase();
    })();

    const filtered = normalizedCategory
      ? items.filter((it) => ((it?.category ?? it?.categoryName ?? "") + "").toString().toLowerCase().trim() === normalizedCategory)
      : items;

    const prices = filtered
      .map((it) => {
        const val = it?.newPrice ?? it?.price ?? it?.mrp ?? it?.amount ?? null;
        if (val === null || val === undefined) return null;
        const num = Number(String(val).replace(/[^\d.-]+/g, ""));
        return Number.isFinite(num) ? num : null;
      })
      .filter((p) => p !== null)
      .sort((a, b) => a - b);

    return prices;
  }, [data, category]);

  // compute price ranges whenever prices or config changes
  useEffect(() => {
    if (!pricesForScope || pricesForScope.length === 0) {
      setPriceRanges([DEFAULT_RANGE]);
      setSelectedPriceRangeLabel(DEFAULT_RANGE.label);
      setPendingFilter({ subCategory: null, minPrice: null, maxPrice: null });
      return;
    }

    const min = pricesForScope[0];
    const max = pricesForScope[pricesForScope.length - 1];

    const ranges = buildBucketsFixedStep(min, max, stepSize, maxBuckets);
    setPriceRanges(ranges);
    setSelectedPriceRangeLabel(ranges[0].label);
    setPendingFilter({ subCategory: null, minPrice: null, maxPrice: null });
  }, [pricesForScope, stepSize, maxBuckets]);

  // handlers
  const handleSubCategory = (sub) => {
    setActiveSubCategory(sub);
    setSelectedPriceRangeLabel(DEFAULT_RANGE.label);
    setPendingFilter({ subCategory: sub, minPrice: null, maxPrice: null });
  };

  const handlePriceChange = (e) => {
    const label = e.target.value;
    setSelectedPriceRangeLabel(label);
    setActiveSubCategory(null);
    const range = priceRanges.find((r) => r.label === label) || DEFAULT_RANGE;
    setPendingFilter({ subCategory: null, minPrice: range.min, maxPrice: range.max });
  };

  const handleApply = () => {
    if (typeof onFilter === "function") onFilter(pendingFilter);
  };

  const handleCancel = () => {
    // clear local state then notify parent to close
    setActiveSubCategory(null);
    setSelectedPriceRangeLabel(DEFAULT_RANGE.label);
    setPendingFilter({ subCategory: null, minPrice: null, maxPrice: null });
    if (typeof onCloseFilter === "function") onCloseFilter();
  };

  return (
    <div className="filter-vertical" role="region" aria-label="Product filters">
      {/* Header */}
      <div className="fv-header">
        <h3 className="fv-title">FILTER</h3>
      </div>

      {/* Subcategory */}
      <div className="fv-section" aria-label="Sub categories">
        <h4 className="fv-heading">SUB CATEGORY</h4>
        <div className="fv-sub-buttons" role="list">
          {Array.isArray(subCategories) && subCategories.length > 0 ? (
            subCategories.map((sc, idx) => {
              const label = String(sc);
              const isActive = activeSubCategory === sc;
              return (
                <button
                  key={`${label}-${idx}`}
                  type="button"
                  className={`fv-chip ${isActive ? "active" : ""}`}
                  onClick={() => handleSubCategory(sc)}
                  aria-pressed={isActive}
                >
                  {label}
                </button>
              );
            })
          ) : (
            <div className="fv-empty">No sub categories</div>
          )}
        </div>
      </div>

      {/* Price range */}
      <div className="fv-section" aria-label="Price range">
        <h4 className="fv-heading">PRICE RANGE</h4>
        <div className="fv-price">
          <select value={selectedPriceRangeLabel} onChange={handlePriceChange} aria-label="Price range">
            {priceRanges.map((r, i) => (
              <option key={`${r.label}-${i}`} value={r.label}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="fv-actions">
        <button type="button" className="fv-apply" onClick={handleApply} aria-label="Apply filters">
          Apply
        </button>
        <button type="button" className="fv-cancel" onClick={handleCancel} aria-label="Cancel filters">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Filter;
