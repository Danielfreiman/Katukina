import {
  ProductVariation,
  canPurchase,
  productPrice,
} from "@/lib/commerce/product";
import { directVolumeOptions } from "@/lib/commerce/volume-options";

export function TypeWeightOptions({
  options,
  type,
  selectedId,
  onType,
  onWeight,
}: {
  options: ProductVariation[];
  type: string;
  selectedId: number;
  onType: (type: string) => void;
  onWeight: (id: number) => void;
}) {
  const volumes = directVolumeOptions(options);
  if (volumes) {
    const selected = volumes.find((option) => option.id === selectedId);
    return (
      <fieldset className="presentation-field type-weight-options">
        <legend>Volume</legend>
        <div className="presentation-swatches option-volume-list">
          {volumes.map((volume) => {
            const option = options.find((option) => option.id === volume.id)!;
            return (
              <label
                key={option.id}
                className={`presentation-swatch${!canPurchase(option) ? " swatch-unavailable" : ""}`}
              >
                <input
                  type="radio"
                  name="option-volume"
                  value={option.id}
                  checked={selectedId === option.id}
                  onChange={() => onWeight(option.id)}
                  aria-label={volume.label}
                  aria-describedby={`volume-detail-${option.id}`}
                />
                <span className="swatch-content">
                  <strong>{volume.label}</strong>
                  <span id={`volume-detail-${option.id}`}>
                    {productPrice(option) || "Price unavailable"}
                    {!canPurchase(option) && (
                      <small>
                        {option.is_in_stock ? "Unavailable" : "Out of stock"}
                      </small>
                    )}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {selected && (
          <p className="option-shared-details" aria-live="polite">
            {selected.description} · {selected.weight}
          </p>
        )}
      </fieldset>
    );
  }
  const types = [...new Set(options.map((option) => option.optionType!))];
  const singleType = types.length === 1;
  const effectiveType = singleType ? types[0] : type;
  const grams = (weight: string) => {
    const [value, unit] = weight.split(" ");
    return Number(value) * ({ mg: 0.001, g: 1, kg: 1000 }[unit] ?? 1);
  };
  const weights = options
    .filter((option) => option.optionType === effectiveType)
    .sort((a, b) => grams(a.optionWeight!) - grams(b.optionWeight!));
  return (
    <div className="type-weight-options">
      {singleType ? (
        <p className="option-shared-details">{types[0]}</p>
      ) : (
        <fieldset className="presentation-field">
          <legend>Type</legend>
          <div className="option-type-list">
            {types.map((value) => (
              <label key={value} className="presentation-swatch">
                <input
                  type="radio"
                  name="option-type"
                  value={value}
                  checked={type === value}
                  onChange={() => onType(value)}
                />
                <span className="swatch-content">
                  <strong>{value}</strong>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset className="presentation-field">
        <legend>Weight</legend>
        {effectiveType ? (
          <div className="presentation-swatches option-weight-list">
            {weights.map((option) => (
              <label
                key={option.id}
                className={`presentation-swatch${!canPurchase(option) ? " swatch-unavailable" : ""}`}
              >
                <input
                  type="radio"
                  name="option-weight"
                  value={option.id}
                  checked={selectedId === option.id}
                  onChange={() => onWeight(option.id)}
                  aria-label={option.optionWeight}
                  aria-describedby={`weight-detail-${option.id}`}
                />
                <span className="swatch-content">
                  <strong>{option.optionWeight}</strong>
                  <span id={`weight-detail-${option.id}`}>
                    {productPrice(option) || "Price unavailable"}
                    {!canPurchase(option) && (
                      <small>
                        {option.is_in_stock ? "Unavailable" : "Out of stock"}
                      </small>
                    )}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="presentation-selection">
            Choose a type to see its weights.
          </p>
        )}
      </fieldset>
    </div>
  );
}
