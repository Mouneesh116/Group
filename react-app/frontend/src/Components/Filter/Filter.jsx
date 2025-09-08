import React, { useState, useEffect, useMemo } from "react";
import "./Filter.css";

const DEFAULT_RANGE = { label: "All", min: null, max: null };
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

// fixed step buckets (₹1000 by default)
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

  // dedupe
  return ranges.filter(
    (r, i, arr) =>
      arr.findIndex((x) => x.min === r.min && x.max === r.max) === i
  );
}

const Filter = ({
  category = null,
  subCategories = [],
  data = [],
  onFilter = () => {},
  stepSize = 1000,
  maxBuckets = 15,
}) => {
  const [subCategory, setSubCategory] = useState("");
  const [priceLabel, setPriceLabel] = useState(DEFAULT_RANGE.label);
  const [priceRanges, setPriceRanges] = useState([DEFAULT_RANGE]);

  // derive prices for current category (or all if none)
  const pricesForScope = useMemo(() => {
    const items = Array.isArray(data) ? data : [];
    const normalizedCategory = (() => {
      if (!category && category !== 0) return null;
      if (typeof category === "string") return category.trim().toLowerCase();
      if (typeof category === "object")
        return (
          (category.name || category.title || category._id || "")
            .toString()
            .trim()
            .toLowerCase()
        );
      return String(category).trim().toLowerCase();
    })();

    const filtered = normalizedCategory
      ? items.filter(
          (it) =>
            ((it?.category ?? it?.categoryName ?? "") + "")
              .toString()
              .toLowerCase()
              .trim() === normalizedCategory
        )
      : items;

    return filtered
      .map((it) => {
        const val = it?.newPrice ?? it?.price ?? it?.mrp ?? it?.amount ?? null;
        if (val == null) return null;
        const num = Number(String(val).replace(/[^\d.-]+/g, ""));
        return Number.isFinite(num) ? num : null;
      })
      .filter((p) => p !== null)
      .sort((a, b) => a - b);
  }, [data, category]);

  // build price ranges
  useEffect(() => {
    if (!pricesForScope.length) {
      setPriceRanges([DEFAULT_RANGE]);
      setPriceLabel(DEFAULT_RANGE.label);
      return;
    }
    const min = pricesForScope[0];
    const max = pricesForScope[pricesForScope.length - 1];
    const ranges = buildBucketsFixedStep(min, max, stepSize, maxBuckets);
    setPriceRanges(ranges);
    setPriceLabel(ranges[0].label);
  }, [pricesForScope, stepSize, maxBuckets]);

  // fire filter immediately
  useEffect(() => {
    const range = priceRanges.find((r) => r.label === priceLabel) || DEFAULT_RANGE;
    onFilter({
      subCategory: subCategory || null,
      minPrice: range.min,
      maxPrice: range.max,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategory, priceLabel, priceRanges]);

  const handleClear = () => {
    setSubCategory("");
    setPriceLabel(DEFAULT_RANGE.label);
  };

  return (
    <nav className="navbar-filter">
      <span className="nf-label">Filter</span>

      <select
        value={subCategory}
        onChange={(e) => setSubCategory(e.target.value)}
        className="nf-select"
      >
        <option value="">All Subcategories</option>
        {subCategories.map((sc, idx) => (
          <option key={`${sc}-${idx}`} value={sc}>
            {sc}
          </option>
        ))}
      </select>

      <select
        value={priceLabel}
        onChange={(e) => setPriceLabel(e.target.value)}
        className="nf-select"
      >
        {priceRanges.map((r, i) => (
          <option key={`${r.label}-${i}`} value={r.label}>
            {r.label}
          </option>
        ))}
      </select>

      <button className="nf-clear-btn" onClick={handleClear}>
        Clear
      </button>
    </nav>
  );
};

export default Filter;
