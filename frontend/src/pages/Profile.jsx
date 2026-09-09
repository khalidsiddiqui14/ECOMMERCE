import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/userService";

const Input = ({ label, id, readOnly, small,...props }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-xs font-bold uppercase text-[#0F1111]">{label}</label>
    <input id={id} {...props} readOnly={readOnly} className={`h-8 px-2 border border-[#a6a6a6] rounded-sm text-sm outline-none ${readOnly? "bg-[#f0f2f2]" : "bg-white"}`} />
    {small && <small className="text- text-[#565959]">{small}</small>}
  </div>
);

function Profile() {
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "", phone: "", city: "", state: "", country: "India", postal_code: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile({ first_name: data.first_name || "", last_name: data.last_name || "", email: data.email || "", phone: data.phone || "", city: data.city || "", state: data.state || "", country: data.country || "India", postal_code: data.postal_code || "" });
      } catch {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setProfile((prev) => ({...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateProfile(profile);
      setMessage("✅ Profile updated!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bg-[#EAEDED] min-h-screen grid place-items-center"><div className="bg-white p-8 rounded">Loading...</div></div>;

  return (
    <div className="bg-[#EAEDED] min-h-screen py-3">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b"><h1 className="font-bold">Your Profile</h1></div>
          {message && <div className="m-3 p-2 bg-[#f0f8f0] border border-[#067D62] rounded text-sm">{message}</div>}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name *" id="first_name" name="first_name" value={profile.first_name} onChange={handleChange} required />
              <Input label="Last Name *" id="last_name" name="last_name" value={profile.last_name} onChange={handleChange} required />
            </div>
            <Input label="Email" id="email" name="email" value={profile.email} readOnly small="Email cannot be changed" />
            <Input label="Phone" id="phone" name="phone" value={profile.phone} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" id="city" name="city" value={profile.city} onChange={handleChange} />
              <Input label="State" id="state" name="state" value={profile.state} onChange={handleChange} />
              <Input label="Country" id="country" name="country" value={profile.country} onChange={handleChange} />
              <Input label="Postal Code" id="postal_code" name="postal_code" value={profile.postal_code} onChange={handleChange} />
            </div>
            <button type="submit" disabled={saving} className="w-full h-9 bg-[#FFD814] border rounded-lg font-bold">{saving? "Saving..." : "Save Profile"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Profile;