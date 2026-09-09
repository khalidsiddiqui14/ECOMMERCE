import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/userService";

const Input = ({ label, id, readOnly, small,...props }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-xs font-bold uppercase tracking-wide text-[#0F1111]">
      {label}
    </label>
    <input
      id={id}
      {...props}
      readOnly={readOnly}
      className={`h-8 px-2 border border-[#a6a6a6] rounded-sm text-sm outline-none transition ${readOnly? 'bg-[#f0f2f2] text-[#565959] cursor-not-allowed' : 'bg-white text-[#0F1111] focus:border-[#e77600]'}`}
    />
    {small && <small className="text- text-[#565959] mt-0.5">{small}</small>}
  </div>
);

function Profile() {
  const [profile, setProfile] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    city: "", state: "", country: "India", postal_code: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile({
          first_name: data.first_name || "", last_name: data.last_name || "",
          email: data.email || "", phone: data.phone || "",
          city: data.city || "", state: data.state || "",
          country: data.country || "India", postal_code: data.postal_code || "",
        });
      } catch {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateProfile(profile);
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4 grid place-items-center">
        <div className="bg-white border border-[#d5d9d9] rounded-lg p-8 text-sm animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDED] min-h-screen py-3">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded-lg shadow-sm">
          <div className="p-4 border-b border-[#e7e7e7]">
            <h1 className="text-lg font-bold text-[#0F1111]">Your Profile</h1>
            <p className="text-xs text-[#565959] mt-1">Manage your ShopZone account</p>
          </div>
          {message && <div className="m-3 p-2.5 bg-[#f0f8f0] border border-[#067D62] border-l-4 rounded text-sm text-[#067D62]">{message}</div>}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="First Name *" id="first_name" name="first_name" type="text" value={profile.first_name} onChange={handleChange} disabled={saving} required placeholder="Khalid" />
              <Input label="Last Name *" id="last_name" name="last_name" type="text" value={profile.last_name} onChange={handleChange} disabled={saving} required placeholder="Siddiqui" />
            </div>
            <Input label="Email (Read Only)" id="email" name="email" type="email" value={profile.email} readOnly small="Email cannot be changed" />
            <Input label="Phone *" id="phone" name="phone" type="tel" value={profile.phone} onChange={handleChange} disabled={saving} placeholder="+91 9876543210" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="City *" id="city" name="city" type="text" value={profile.city} onChange={handleChange} disabled={saving} required placeholder="New Delhi" />
              <Input label="State *" id="state" name="state" type="text" value={profile.state} onChange={handleChange} disabled={saving} required placeholder="Delhi" />
              <Input label="Country *" id="country" name="country" type="text" value={profile.country} onChange={handleChange} disabled={saving} required placeholder="India" />
              <Input label="Postal Code *" id="postal_code" name="postal_code" type="text" value={profile.postal_code} onChange={handleChange} disabled={saving} maxLength={12} required placeholder="110001" />
            </div>
            <button type="submit" disabled={saving} className="w-full h-9 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 transition">
              {saving? "Saving..." : "Save Profile • Prime"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Profile;