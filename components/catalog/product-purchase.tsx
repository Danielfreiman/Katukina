"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Truck, PackageCheck } from "lucide-react";
import {
  Product,
  ProductVariation,
  canPurchase,
  productName,
  productPrice,
  quantityLimits,
} from "@/lib/commerce/product";
import { plainText } from "@/lib/wordpress/text";
import { ProductGallery } from "./product-gallery";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { SubscriptionForm } from "@/components/commerce/subscription";
import { describeOptions } from "@/lib/commerce/option-display";
import { TypeWeightOptions } from "./type-weight-options";

export function ProductPurchase({
  product,
  variations,
  initialVariation,
}: {
  product: Product;
  variations: ProductVariation[];
  initialVariation: number;
}) {
  const [selectedId, setSelectedId] = useState(initialVariation);
  const [selectedType, setSelectedType] = useState(
    variations.find((option) => option.id === initialVariation)?.optionType ??
      "",
  );
  const groupedOptions =
    variations.length > 0 &&
    variations.every((option) => option.optionType && option.optionWeight);
  const [quantity, setQuantity] = useState("");
  const [pending, setPending] = useState(false);
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  useEffect(() => {
    const restore = () => {
      const params = new URL(window.location.href).searchParams;
      const id = Number(params.get("variation")) || 0;
      const type =
        variations.find((option) => option.id === id)?.optionType ??
        params.get("option_type") ??
        "";
      setSelectedId(id);
      setSelectedType(
        variations.some((option) => option.optionType === type) ? type : "",
      );
      setQuantity("");
      setAttributes({});
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [variations]);
  const optionDescription = describeOptions(
    productName(product),
    variations.map((option) => option.optionLabel),
  );
  const optionLabels = optionDescription.labels;
  const orderedOptions = variations
    .map((option, index) => ({ option, index }))
    .sort((a, b) =>
      optionLabels[a.index].localeCompare(optionLabels[b.index], "en", {
        numeric: true,
      }),
    );
  const selected = variations.find((item) => item.id === selectedId);
  const selectedLabel =
    optionLabels[variations.findIndex((item) => item.id === selectedId)];
  const variable = product.type === "variable";
  const item = variable ? selected : product;
  const limits = quantityLimits(item ?? product);
  const qty = quantity === "" ? limits.min : Number(quantity);
  const validQuantity =
    Number.isSafeInteger(qty) &&
    qty >= limits.min &&
    qty <= limits.max &&
    qty % limits.step === 0;
  const available = !!item && canPurchase(item);
  const choicesReady = (selected?.choices ?? []).every((field) =>
    field.options.includes(attributes[field.attribute]),
  );
  const imageList = selected?.images[0]
    ? [selected.images[0], ...product.images]
    : product.images;
  const images = imageList.filter(
    (image, index) =>
      imageList.findIndex((other) => other.id === image.id) === index,
  );
  const choose = (id: number, type = "") => {
    setSelectedId(id);
    setSelectedType(
      variations.find((option) => option.id === id)?.optionType ?? type,
    );
    setQuantity("");
    setAttributes({});
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("variation", String(id));
    else url.searchParams.delete("variation");
    if (!id && type) url.searchParams.set("option_type", type);
    else url.searchParams.delete("option_type");
    window.history.pushState(null, "", url.pathname + url.search);
  };
  const supported = product.type === "simple" || variable;
  return (
    <div className="product-purchase-layout">
      <ProductGallery
        key={selected?.id ?? product.id}
        images={images}
        name={productName(product)}
      />
      <section className="product-overview" aria-label="Product options">
        <p className="eyebrow">
          {product.categories[0] && (
            <Link href={`/collections/${product.categories[0].slug}`}>
              {plainText(product.categories[0].name)}
            </Link>
          )}
        </p>
        <h1>{productName(product)}</h1>
        {!!product.review_count && Number(product.average_rating) > 0 && (
          <p className="pdp-rating">
            <Star size={16} aria-hidden />{" "}
            {Number(product.average_rating).toFixed(1)}{" "}
            <span>({product.review_count} reviews)</span>
          </p>
        )}
        {product.short_description && (
          <p className="product-summary">
            {plainText(product.short_description)}
          </p>
        )}
        <fieldset className="purchase-fields" disabled={pending}>
          <legend className="sr-only">Choose your product</legend>
          {variable && (
            <fieldset className="presentation-field">
              <legend>
                {groupedOptions
                  ? "Choose your option"
                  : optionDescription.heading !== "Option"
                    ? optionDescription.heading
                    : product.attributes?.filter((a) => a.has_variations)
                          .length === 1
                      ? plainText(
                          product.attributes.find((a) => a.has_variations)!
                            .name,
                        ).replace(/^presentations?$/i, "Option")
                      : "Option"}
              </legend>
              {groupedOptions ? (
                <TypeWeightOptions
                  options={variations}
                  type={selectedType}
                  selectedId={selectedId}
                  onType={(type) => choose(0, type)}
                  onWeight={(id) => choose(id)}
                />
              ) : (
                <>
                  {!!optionDescription.shared.length && (
                    <p className="option-shared-details">
                      {optionDescription.shared.join(" · ")}
                    </p>
                  )}
                  <p className="presentation-selection">
                    {selectedLabel ?? "Choose an option"}
                  </p>
                  <div className="presentation-swatches">
                    {orderedOptions.map(({ option, index }) => (
                      <label
                        key={option.id}
                        className={`presentation-swatch${!canPurchase(option) ? " swatch-unavailable" : ""}`}
                      >
                        <input
                          type="radio"
                          name="presentation"
                          value={option.id}
                          checked={selected?.id === option.id}
                          onChange={() => choose(option.id)}
                          aria-label={optionLabels[index]}
                          aria-describedby={`presentation-detail-${option.id}`}
                        />
                        <span className="swatch-content">
                          <strong>{optionLabels[index]}</strong>
                          <span id={`presentation-detail-${option.id}`}>
                            {productPrice(option) || "Price unavailable"}
                            {!canPurchase(option) && (
                              <small>
                                {option.is_in_stock
                                  ? "Unavailable"
                                  : "Out of stock"}
                              </small>
                            )}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              {(selected || (groupedOptions && selectedType)) && (
                <>
                  {selected?.choices?.map((field) => (
                    <label key={field.attribute}>
                      {field.label}
                      <select
                        value={attributes[field.attribute] || ""}
                        onChange={(event) =>
                          setAttributes((prior) => ({
                            ...prior,
                            [field.attribute]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select…</option>
                        {field.options.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <button
                    type="button"
                    className="swatch-clear"
                    onClick={() => choose(0)}
                  >
                    Clear selection
                  </button>
                </>
              )}
              {!variations.length && <p>No options are currently available.</p>}
            </fieldset>
          )}
        </fieldset>
        <a href="#product-description" className="pdp-details-link">
          Read product information
        </a>
        <div className="pdp-key-details">
          <h2>At a glance</h2>
          <dl>
            <div>
              <dt>Product reference</dt>
              <dd>{product.sku || product.id}</dd>
            </div>
            {product.categories[0] && (
              <div>
                <dt>Collection</dt>
                <dd>{plainText(product.categories[0].name)}</dd>
              </div>
            )}
            {(product.attributes ?? [])
              .filter((attribute) => !attribute.has_variations)
              .slice(0, 4)
              .map((attribute) => (
                <div key={attribute.name}>
                  <dt>{plainText(attribute.name)}</dt>
                  <dd>
                    {attribute.terms
                      .map((term) => plainText(term.name))
                      .join(", ")}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </section>
      <section className="product-purchase-panel" aria-label="Purchase summary">
        <p className="eyebrow">YOUR SELECTION</p>
        <p className="pdp-selection-name">
          {selectedLabel || productName(product)}
        </p>
        <div className="purchase-price" aria-live="polite">
          <p data-testid="product-price">
            {productPrice(item ?? product) || "Price unavailable"}
          </p>
          <span>
            {product.prices.currency_code}
            {variable && !selected
              ? " · Select an option to see its price"
              : ""}
          </span>
        </div>
        <fieldset className="purchase-fields" disabled={pending}>
          <legend className="sr-only">Quantity and availability</legend>
          <div className="purchase-availability" aria-live="polite">
            <p className={available ? "stock-available" : "stock-unavailable"}>
              {!item
                ? "Choose an option to check availability"
                : available
                  ? item.is_on_backorder
                    ? "Available on backorder"
                    : "In stock"
                  : "Currently unavailable"}
            </p>
            <p className="purchase-sku">
              {item?.sku
                ? `SKU: ${item.sku}`
                : `Product reference: ${product.sku || product.id}`}
            </p>
          </div>
          {supported && (
            <div className="product-quantity">
              <label htmlFor="product-quantity">Quantity</label>
              <input
                id="product-quantity"
                type="number"
                min={limits.min}
                max={limits.max}
                step={limits.step}
                value={quantity === "" ? limits.min : quantity}
                disabled={!available}
                onChange={(event) => setQuantity(event.target.value || "0")}
                aria-invalid={!validQuantity}
                aria-describedby={!validQuantity ? "quantity-error" : undefined}
              />
              {!validQuantity && (
                <p id="quantity-error" role="alert">
                  Choose a quantity from {limits.min} to {limits.max}, in steps
                  of {limits.step}.
                </p>
              )}
            </div>
          )}
        </fieldset>
        {supported ? (
          <AddToCart
            key={`${item?.id ?? 0}:${qty}`}
            id={item?.id ?? product.id}
            quantity={qty}
            available={available && validQuantity && choicesReady}
            simple={!!item && choicesReady}
            variation={Object.entries(attributes).map(([attribute, value]) => ({
              attribute,
              value,
            }))}
            onPendingChange={setPending}
          />
        ) : (
          <p>This product is not available to purchase online.</p>
        )}
        {item && !item.is_in_stock && <SubscriptionForm productId={item.id} />}
        <p className="purchase-delivery">
          <Truck size={20} aria-hidden />
          <span>
            Delivery options are calculated in your{" "}
            <Link href="/cart">bag</Link> for your destination.
          </span>
        </p>
        <Link className="pdp-shipping-link" href="/shipping">
          <PackageCheck size={20} aria-hidden />
          <span>Shipping &amp; destinations</span>
        </Link>
      </section>
    </div>
  );
}
