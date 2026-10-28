import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Save,
  LoaderCircle,
  Plus
} from "lucide-react";

import { createShippingAddress, getShippingAddressById, updateShippingAddress } from "../services/shippingAddressService";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

function Label({ children, hint }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <label className="text-[10.5px] tracking-[0.15em] uppercase text-[var(--text-muted)]">
        {children}
      </label>

      {hint && (
        <button
          type="button"
          className="text-[11px] text-[var(--accent-2)] hover:underline flex items-center gap-1"
        >
          <Info size={11} /> {hint}
        </button>
      )}
    </div>
  );
}

export default function ShippingAddressForm() {

  const { id } = useParams();

  const isEditing = Boolean(id);

  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || "/cart";

  const [submitting, setSubmitting] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullname, setFullname] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [fullnameError, setFullnameError] = useState("");
  const [addressLine1Error, setAddressLine1Error] = useState("");
  const [cityError, setCityError] = useState("");
  const [stateError, setStateError] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");
  const [countryError, setCountryError] = useState("");
  const [isDefault, setDefault] = useState(false);

  const handleSubmit = async () => {

    var isError = false;

    if (!fullname?.trim()) {
      setFullnameError("Please enter the recipient name");
      isError = true;
    }

    if (!addressLine1?.trim()) {
      setAddressLine1Error("Please enter an address");
      isError = true;
    }

    if (!city?.trim()) {
      setCityError("Please enter a city");
      isError = true;
    }

    if (!state?.trim()) {
      setStateError("Please enter a state");
      isError = true;
    }

    if (!postalCode?.trim()) {
      setPostalCodeError("Please enter a postal code");
      isError = true;
    }

    if (!country?.trim()) {
      setCountryError("Please enter a country");
      isError = true;
    }

    if (isError) {
      return;
    }

    const payload = {
      full_name: fullname.trim(),
      phone: phoneNumber.trim() || null,
      address_line1: addressLine1.trim(),
      address_line2: addressLine2.trim() || null,
      neighborhood: neighborhood.trim() || null,
      city: city.trim(),
      state: state.trim(),
      postal_code: postalCode.trim(),
      country: country.trim(),
      delivery_instructions:
        deliveryInstructions.trim() || null,
      is_default: isDefault
    };

    setSubmitting(true);

    try {
if (isEditing) {
        await updateShippingAddress(id, payload);
      } else {
        await createShippingAddress(payload);
      }

      navigate("/shoppingCart");
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
      const initializeForm = async () => {
        try {
  
          if (isEditing) {
            // EDIT MODE
            const shippingAddress = await getShippingAddressById(id);
            // const shippingAddress = data.address;

            setPhoneNumber(shippingAddress.phone||"");
            setFullname(shippingAddress.full_name);
            setAddressLine1(shippingAddress.address_line1);
            setAddressLine2(shippingAddress.address_line2||"");
            setNeighborhood(shippingAddress.neighborhood||"");
            setCity(shippingAddress.city);
            setState(shippingAddress.state);
            setPostalCode(shippingAddress.postal_code);
            setCountry(shippingAddress.country);
            setDeliveryInstructions(shippingAddress.delivery_instructions||"");
            setDefault(shippingAddress.is_default);
  
          } 
        } catch (err) {
          console.error(err);
        } finally {
  
        }
      };
  
      initializeForm();
    }, [id, isEditing]);

  return (
    <div className="flex gap-6 min-w-0 fade-in-up" data-testid="shipping-address-form-page">
      <div className="flex-1 min-w-0 space-y-6">
        <Link to={`/checkout`} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5" data-testid="back-link">
          <ArrowLeft size={13} /> Back to checkout
        </Link>

        <div className="card-panel p-5 sm:p-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--panel-2)]">
              <MapPin
                size={23}
                className="text-[var(--accent)]"
              />
            </div>

            <div>
              <h1 className="font-serif text-2xl sm:text-3xl">
                {isEditing?"Edit your shipping address":"New shipping addres"}
              </h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {isEditing?"Edit your delivery address for your vinyl records.":"Add a delivery address for your vinyl records."}
              </p>
            </div>
          </div>

          {/* Recipient information */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <User size={17} className="text-[var(--accent)]" />
              <h2 className="font-serif text-lg">
                Recipient information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Full name *</Label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={fullname}
                  onChange={(e) => {
                    setFullname(e.target.value);

                    if (fullnameError) {
                      setFullnameError("");
                    }
                  }}
                  placeholder="Name of the recipient"
                  maxLength={100}
                  autoComplete="name"
                  className={`w-full bg-[var(--panel-2)] border rounded-xl pl-4 pr-4 py-3.5 text-[13.5px] 
                    placeholder:text-[var(--text-dim)] 
                    focus:outline-none focus:ring-2 transition 
                    ${fullnameError
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-[var(--border)] focus:ring-[var(--accent)]"
                    }`}
                />

                {fullnameError && (
                  <p className="mt-1.5 text-[11px] text-red-400">
                    {fullnameError}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label>Phone number</Label>

                <div className="relative mt-2">
                  <Phone
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[var(--text-muted)] pointer-events-none"
                  />

                  <PhoneInput
                    international
                    defaultCountry="MX"
                    countryCallingCodeEditable={false}
                    value={phoneNumber || undefined}
                    onChange={setPhoneNumber}
                    placeholder="Enter phone number"
                    className="phone-input-custom"
                  />
                </div>

                {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
                  <p className="mt-2 text-xs text-red-500">
                    Enter a valid phone number.
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--border)]" />

          {/* Address information */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={17} className="text-[var(--accent)]" />
              <Label>
                Address details
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>
                  Street and number *
                </Label>
                <input
                  id="address_line1"
                  type="text"
                  name="address_line1"
                  value={addressLine1}
                  onChange={(e) => {
                    setAddressLine1(e.target.value);

                    if (addressLine1Error) {
                      setAddressLine1Error("");
                    }
                  }}
                  placeholder="e.g. Av. Insurgentes Sur 123"
                  autoComplete="address-line1"
                  maxLength={200}
                  className={`w-full bg-[var(--panel)] border rounded-xl pl-4 pr-4 py-3.5 text-[13.5px] 
                    text-[var(--text)] placeholder:text-[var(--text-dim)] 
                    focus:outline-none focus:ring-2 transition 
                    ${addressLine1Error
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-[var(--border)] focus:ring-[var(--accent)]"
                    }`}
                />
                {addressLine1Error && (
                  <p className="mt-1.5 text-[11px] text-red-400">
                    {addressLine1Error}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label>
                  Apartment, suite, or interior
                </Label>
                <input
                  id="address_line2"
                  name="address_line2"
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, building, floor (optional)"
                  autoComplete="address-line2"
                  className={`w-full bg-[var(--panel)] border rounded-xl pl-4 pr-4 py-3.5 text-[13.5px] 
                    text-[var(--text)] placeholder:text-[var(--text-dim)] 
                    focus:outline-none focus:ring-2 transition border-[var(--border)] focus:ring-[var(--accent)]`}
                />
              </div>

              <div className="sm:col-span-2">
                <Label>
                  Neighborhood / Colonia
                </Label>
                <input
                  id="neighborhood"
                  name="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className={`w-full bg-[var(--panel)] border rounded-xl pl-4 pr-4 py-3.5 text-[13.5px] 
                    text-[var(--text)] placeholder:text-[var(--text-dim)] 
                    focus:outline-none focus:ring-2 transition border-[var(--border)] focus:ring-[var(--accent)]`}
                  placeholder="e.g. Roma Norte"
                  autoComplete="address-level3"
                />
              </div>

              <div>
                <Label>
                  City / Municipality *
                </Label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);

                    if (cityError) {
                      setCityError("");
                    }
                  }}
                  placeholder="e.g. Ciudad de México"
                  autoComplete="address-level2"
                  className={`w-full bg-[var(--panel)] border rounded-xl pl-4 pr-4 py-3.5 text-[13.5px] 
                    text-[var(--text)] placeholder:text-[var(--text-dim)] 
                    focus:outline-none focus:ring-2 transition 
                    ${cityError
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-[var(--border)] focus:ring-[var(--accent)]"
                    }`}
                />
                {cityError && (
                  <p className="mt-1.5 text-[11px] text-red-400">
                    {cityError}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  State *
                </Label>
                <input
                  id="state"
                  name="state"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);

                    if (stateError) {
                      setStateError("");
                    }
                  }}
                  placeholder="e.g. Ciudad de México"
                  autoComplete="state"
                  maxLength={200}
                  className={`w-full bg-[var(--panel)] border rounded-xl pl-4 pr-4 py-3.5 text-[13.5px] 
                    text-[var(--text)] placeholder:text-[var(--text-dim)] 
                    focus:outline-none focus:ring-2 transition 
                    ${stateError
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-[var(--border)] focus:ring-[var(--accent)]"
                    }`}
                />
                {stateError && (
                  <p className="mt-1.5 text-[11px] text-red-400">
                    {stateError}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Postal code *
                </Label>
                <input
                  id="postal_code"
                  name="postal_code"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);

                    if (postalCodeError) {
                      setPostalCodeError("");
                    }
                  }}
                  placeholder="e.g. 06700"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={12}
                  className={`w-full bg-[var(--panel)] border rounded-xl pl-4 pr-4 py-3.5 text-[13.5px] 
                    text-[var(--text)] placeholder:text-[var(--text-dim)] 
                    focus:outline-none focus:ring-2 transition 
                    ${postalCodeError
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-[var(--border)] focus:ring-[var(--accent)]"
                    }`}
                />
                {postalCodeError && (
                  <p className="mt-1.5 text-[11px] text-red-400">
                    {postalCodeError}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Country *
                </Label>
                <input
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);

                    if (countryError) {
                      setCountryError("");
                    }
                  }}
                  autoComplete="country-name"
                  className={`w-full bg-[var(--panel)] border rounded-xl pl-4 pr-4 py-3.5 text-[13.5px] 
                    text-[var(--text)] placeholder:text-[var(--text-dim)] 
                    focus:outline-none focus:ring-2 transition 
                    ${countryError
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-[var(--border)] focus:ring-[var(--accent)]"
                    }`}
                />
                {countryError && (
                  <p className="mt-1.5 text-[11px] text-red-400">
                    {countryError}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label>
                  Delivery instructions
                </Label>
                <textarea
                  id="delivery_instructions"
                  name="delivery_instructions"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className={`w-full bg-[var(--panel)] border rounded-xl pl-4 pr-4 py-3.5 text-[13.5px] 
                    text-[var(--text)] placeholder:text-[var(--text-dim)] 
                    focus:outline-none focus:ring-2 transition border-[var(--border)] focus:ring-[var(--accent)]`}

                  placeholder="References, gate code, or instructions for the courier (optional)"
                  rows={3}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--border)]" />

          {/* Default address */}
          {/* Default address */}
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="is_default"
              checked={isDefault}
              onChange={(e) => setDefault(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--accent)]"
            />

            <span>
              <span className="block text-sm font-medium">
                Set as my default address
              </span>
              <span className="mt-1 block text-xs text-[var(--text-muted)]">
                Use this address as your preferred shipping
                address for future orders.
              </span>
            </span>
          </label>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(returnTo)}
              disabled={submitting}
              className="rounded-full border border-[var(--border)] px-6 py-3 text-sm transition hover:border-[var(--accent)] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="continue-btn"
              className="btn-accent inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                {isEditing ? "Saving..." : "Adding..."}
              </>
            ) : isEditing ? (
              <>
                <Save size={17} />
                Save Changes
              </>
            ) : (
              <>
                <Plus size={17} />
                Add New Address
              </>
            )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
